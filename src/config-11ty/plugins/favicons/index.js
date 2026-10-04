// Favicons plugin — one (or a few) source images → the current minimal
// favicon set: favicon.ico, favicon.svg (verbatim copy), apple-touch-icon,
// icon-192/512 (+ maskable) PNGs, manifest.webmanifest, and the <head>
// markup via the `favicons` shortcode.
//
// Sources come from a yaml data file (default `_data/webmanifest.yaml`)
// resolved against `inputDir` — CMS-style paths (`/_data/icons/x.svg`,
// `/_images/x.png`) and plain relative/absolute fs paths all work, with a
// basename fallback under `inputIconsSubdir`.
// Never upscales: a slot is emitted only when a source reaches its size
// (SVG always qualifies — it is rasterized via sharp density scaling).
// Raster outputs go through eleventy-img (content-hash caching) and
// everything is written straight into `outputDir` — no passthrough
// involvement, so no copy race.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import Image from "@11ty/eleventy-img";
import sharp from "sharp";
import yaml from "js-yaml";
import toIco from "png-to-ico";

const DARK_MEDIA = "(prefers-color-scheme: dark)";

// Auto-fetch files (favicon.ico/svg, apple-touch-icon.png, manifest) always
// land at the output root; `icon-*.png` slots follow `outputIconsSubdir`.
const SLOTS = {
  faviconSvg: { file: "favicon.svg", svgOnly: true },
  faviconIco: { file: "favicon.ico" },
  appleTouch: { file: "apple-touch-icon.png", size: 180, apple: true },
  icon192: { file: "icon-192.png", size: 192, manifest: true },
  icon512: { file: "icon-512.png", size: 512, manifest: true },
  maskable512: {
    file: "icon-mask-512.png",
    size: 512,
    manifest: "maskable",
    maskable: true,
  },
};
// Dark variants are only emitted from dark sources — never from light ones.
const DARK_SLOTS = {
  faviconSvgDark: { file: "favicon-dark.svg", svgOnly: true },
  faviconIcoDark: { file: "favicon-dark.ico" },
  icon192Dark: { file: "icon-dark-192.png", size: 192 },
  icon512Dark: { file: "icon-dark-512.png", size: 512 },
};

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const parseColor = (c, fallback) => {
  if (typeof c !== "string" || !c.trim()) return fallback;
  const hex = c.trim().replace(/^#/, "");
  if (!/^[0-9a-f]{3,8}$/i.test(hex)) return fallback;
  const full =
    hex.length <= 4
      ? hex
          .split("")
          .map((x) => x + x)
          .join("")
      : hex;
  const n = parseInt(full, 16);
  const hasAlpha = full.length === 8;
  return {
    r: (n >> (hasAlpha ? 24 : 16)) & 255,
    g: (n >> (hasAlpha ? 16 : 8)) & 255,
    b: (n >> (hasAlpha ? 8 : 0)) & 255,
    alpha: hasAlpha ? (n & 255) / 255 : 1,
  };
};

const joinUrl = (prefix, p) =>
  `${(prefix || "").replace(/\/+$/, "")}${p.startsWith("/") ? p : `/${p}`}`;

export default function faviconsPlugin(eleventyConfig, pluginOptions = {}) {
  eleventyConfig.versionCheck(">=3.0.0");

  const {
    // yaml data file holding `favicon`, `touchIcon`, `manifest`, `sources`
    // and `dark` fields. Resolved against `inputDir`.
    dataFile = "_data/webmanifest.yaml",
    // Content root that CMS-style public paths resolve against.
    inputDir = eleventyConfig.dir.input,
    // Subdirectory (under inputDir) to find icon files under; "" = root.
    inputIconsSubdir = "_icons",
    // Site output root; generated icons are written here (or under
    // `outputIconsSubdir` for the manifest-only PNG slots).
    outputDir = eleventyConfig.dir.output,
    // URL path prefix baked into emitted links + manifest srcs. Defaults to
    // Eleventy's own `pathPrefix` (unset -> root-relative URLs).
    urlPrefix = eleventyConfig.pathPrefix ?? "",
    // Subdirectory (under outputDir) for icon-*.png files; "" = root.
    outputIconsSubdir = "",
    // Manifest emission.
    manifestUrl = "/manifest.webmanifest",
    manifestData = {},
    emitMaskable = true,
    // Rendering knobs.
    icoSizes = [16, 32, 48],
    appleIconPadding = 20, // px of background padding inside the 180px tile
    appleIconBg, // falls back to manifest.background_color, then white
    maskablePadding = 51, // ~409px safe-zone circle inside 512
    maskableBg, // falls back to manifest.background_color, then transparent
    shortcodeName = "favicons",
  } = pluginOptions;

  const metaCache = new Map();
  const metaOf = (p) => {
    if (!metaCache.has(p)) {
      metaCache.set(
        p,
        sharp(p, { failOn: "none" })
          .metadata()
          .catch(() => null),
      );
    }
    return metaCache.get(p);
  };

  // CMS public paths (`/<inputIconsSubdir>/x.png`), `./x.png` and absolute fs
  // paths all resolve here; when the stored path misses, the basename is
  // retried under `inputIconsSubdir` so moved icon dirs keep resolving.
  // Missing files resolve to null.
  const resolveSource = (raw) => {
    if (typeof raw !== "string" || !raw.trim()) return null;
    const p = raw.trim();
    if (fs.existsSync(p)) return path.resolve(p);
    const underInput = path.join(inputDir, p.replace(/^\/+/, ""));
    if (fs.existsSync(underInput)) return underInput;
    if (inputIconsSubdir) {
      const underIcons = path.join(
        inputDir,
        inputIconsSubdir,
        path.basename(p),
      );
      if (fs.existsSync(underIcons)) return underIcons;
    }
    return null;
  };

  const isSvg = (meta) => meta?.format === "svg";
  const canReach = (meta, size) =>
    isSvg(meta) || Math.max(meta?.width || 0, meta?.height || 0) >= size;

  // Preference order: the slot's own override → other overrides, nearest
  // above the target first → `touchIcon` → `favicon`. "Nearest above"
  // because a closer source downscales with fewer artifacts.
  const pickSource = async (scope, slotKey, size, { svgOnly = false } = {}) => {
    scope = scope || {};
    const sources = scope.sources || {};
    const slotOverride = resolveSource(sources[slotKey]);
    const otherOverrides = Object.entries(sources)
      .filter(([k, v]) => k !== slotKey && v)
      .map(([, v]) => resolveSource(v))
      .filter(Boolean);
    const fallbacks = [scope.touchIcon, scope.favicon]
      .map(resolveSource)
      .filter(Boolean);

    const usable = async (list) => {
      const out = [];
      for (const src of list) {
        const meta = await metaOf(src);
        if (!meta) continue;
        if (svgOnly ? isSvg(meta) : canReach(meta, size))
          out.push({ src, meta });
      }
      return out;
    };

    const direct = await usable([slotOverride].filter(Boolean));
    if (direct[0]) return direct[0];
    const others = (await usable(otherOverrides)).sort(
      (a, b) =>
        Math.max(a.meta.width || 0, a.meta.height || 0) -
        Math.max(b.meta.width || 0, b.meta.height || 0),
    );
    if (others[0]) return others[0];
    const fall = await usable(fallbacks);
    return fall[0] || null;
  };

  // svg → raster needs density scaling so a 24px viewBox renders crisply
  // at e.g. 512px instead of being upscaled.
  const svgSharpOptions = (meta, size) =>
    isSvg(meta) && meta?.width
      ? { density: (size / meta.width) * (meta.density || 72) || 72 }
      : {};

  const contain = (size, background) => (instance) =>
    instance.resize(size, size, { fit: "contain", background });

  // One PNG per call — a resizing `transform` replaces eleventy-img's own
  // resize (isTransformResize), so multi-width calls would collapse to one
  // size.
  const emitPng = async ({ file, size, source, padding = 0, background }) => {
    const inner = size - padding * 2;
    // Named functions: eleventy-img's in-memory cache key serializes
    // functions as "<fn>" + name — a distinct name per output file keeps
    // same-source/same-size slots (icon-512 vs icon-mask-512) from
    // deduping into a single render.
    const transformName = `contain_${file.replace(/\W/g, "_")}`;
    const transform = {
      [transformName](instance) {
        const resized = instance.resize(inner, inner, {
          fit: "contain",
          background: TRANSPARENT,
        });
        return padding
          ? resized.extend({
              top: padding,
              bottom: padding,
              left: padding,
              right: padding,
              background,
            })
          : resized;
      },
    }[transformName];
    const nameFormat = `filename_${file.replace(/\W/g, "_")}`;
    const filenameFormat = { [nameFormat]: () => file }[nameFormat];
    const stats = await Image(source.src, {
      formats: ["png"],
      widths: [size],
      outputDir: path.join(outputDir, outputIconsSubdir),
      urlPath: outputIconsSubdir ? joinUrl("/", outputIconsSubdir) : "/",
      transformOnRequest: false,
      sharpOptions: svgSharpOptions(source.meta, size),
      filenameFormat,
      transform,
    });
    return stats.png?.[0] || null;
  };

  // favicon.ico via per-size dry-run buffers (no stray PNG files emitted).
  const emitIco = async ({ file, source }) => {
    const achievable = icoSizes.filter((s) => canReach(source.meta, s));
    if (!achievable.length) return null;
    const buffers = [];
    for (const size of achievable) {
      const stats = await Image(source.src, {
        dryRun: true,
        formats: ["png"],
        widths: [size],
        sharpOptions: svgSharpOptions(source.meta, size),
        transform: contain(size, TRANSPARENT),
      });
      const buf = stats.png?.[0]?.buffer;
      if (buf) buffers.push(buf);
    }
    if (!buffers.length) return null;
    await fsp.writeFile(path.join(outputDir, file), await toIco(buffers));
    return { file, sizes: achievable };
  };

  const generate = async () => {
    const dataPath = path.join(inputDir, dataFile);
    let cfg;
    try {
      cfg = yaml.load(await fsp.readFile(dataPath, "utf-8")) || {};
    } catch {
      return { manifest: null, headHtml: "" }; // no data file: feature off
    }
    if (!cfg.favicon && !cfg.touchIcon && !cfg.sources) {
      return { manifest: null, headHtml: "" };
    }

    await fsp.mkdir(outputDir, { recursive: true });
    const appleBg = parseColor(
      appleIconBg,
      parseColor(cfg.manifest?.background_color, WHITE),
    );
    const maskBg = parseColor(
      maskableBg,
      parseColor(cfg.manifest?.background_color, TRANSPARENT),
    );

    const emitted = {}; // slotKey -> { file, url?, sizes? }
    const runs = [];
    const runSlot = (slots, variant) => {
      for (const [key, spec] of Object.entries(slots)) {
        if (key === "maskable512" && !emitMaskable) continue;
        runs.push(
          (async () => {
            const scope = variant === "dark" ? cfg.dark || {} : cfg;
            try {
              if (spec.svgOnly) {
                const src = await pickSource(scope, "iconSvg", 0, {
                  svgOnly: true,
                });
                if (src) {
                  await fsp.copyFile(src.src, path.join(outputDir, spec.file));
                  emitted[key] = { file: spec.file };
                }
                return;
              }
              // Dark slot keys ("icon192Dark") map to `sources.icon192`
              // inside the `dark:` block; light keys are used as-is.
              const sourceKey = key.endsWith("Dark") ? key.slice(0, -4) : key;
              if (spec.file.endsWith(".ico")) {
                const src = await pickSource(
                  scope,
                  sourceKey,
                  Math.min(...icoSizes),
                );
                const result =
                  src && (await emitIco({ file: spec.file, source: src }));
                if (result) emitted[key] = result;
                return;
              }
              const src = await pickSource(scope, sourceKey, spec.size);
              if (!src) {
                console.warn(
                  `[favicons] skipped ${spec.file}: no ${variant} source reaches ${spec.size}px without upscaling`,
                );
                return;
              }
              const stat = await emitPng({
                file: spec.file,
                size: spec.size,
                source: src,
                padding: spec.apple
                  ? appleIconPadding
                  : spec.maskable
                    ? maskablePadding
                    : 0,
                background: spec.apple
                  ? appleBg
                  : spec.maskable
                    ? maskBg
                    : TRANSPARENT,
              });
              if (stat?.url) {
                emitted[key] = {
                  file: spec.file,
                  url: stat.url,
                  size: spec.size,
                };
              }
            } catch (error) {
              console.warn(
                `[favicons] ${spec.file} failed:`,
                error?.message || error,
              );
            }
          })(),
        );
      }
    };
    runSlot(SLOTS, "light");
    runSlot(DARK_SLOTS, "dark");
    await Promise.all(runs);

    // ---------- manifest.webmanifest (rendered by the virtual template)
    const m = { ...(manifestData || {}), ...(cfg.manifest || {}) };
    const manifestIcons = [];
    if (emitted.faviconSvg) {
      manifestIcons.push({
        src: joinUrl(urlPrefix, "/favicon.svg"),
        sizes: "any",
        type: "image/svg+xml",
      });
    }
    for (const [key, spec] of Object.entries(SLOTS)) {
      if (!spec.manifest || !emitted[key]?.url) continue;
      manifestIcons.push({
        src: joinUrl(urlPrefix, emitted[key].url),
        sizes: `${spec.size}x${spec.size}`,
        type: "image/png",
        ...(spec.manifest === "maskable" ? { purpose: "maskable" } : {}),
      });
    }
    const manifest =
      (m.name || m.short_name) && manifestIcons.length
        ? Object.fromEntries(
            Object.entries({
              name: m.name,
              short_name: m.short_name,
              description: m.description,
              lang: m.lang,
              dir: m.dir,
              id: joinUrl(urlPrefix, "/"),
              start_url: m.start_url || joinUrl(urlPrefix, "/"),
              scope: joinUrl(urlPrefix, "/"),
              display: m.display,
              theme_color: m.theme_color,
              background_color: m.background_color,
              icons: manifestIcons,
            }).filter(([, v]) => v !== undefined && v !== null && v !== ""),
          )
        : null;

    // ---------- <head> markup
    const linkTag = (attrs) =>
      `<link ${Object.entries(attrs)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ")}>`;
    const tags = [];
    if (emitted.faviconIco) {
      tags.push(
        linkTag({
          rel: "icon",
          href: joinUrl(urlPrefix, "/favicon.ico"),
          // Explicit sizes (not "any") so Chrome prefers the SVG when present.
          sizes: emitted.faviconIco.sizes.map((s) => `${s}x${s}`).join(" "),
        }),
      );
    }
    if (emitted.faviconSvg) {
      tags.push(
        linkTag({
          rel: "icon",
          href: joinUrl(urlPrefix, "/favicon.svg"),
          type: "image/svg+xml",
        }),
      );
    }
    if (emitted.faviconIcoDark) {
      tags.push(
        linkTag({
          rel: "icon",
          href: joinUrl(urlPrefix, "/favicon-dark.ico"),
          sizes: emitted.faviconIcoDark.sizes.map((s) => `${s}x${s}`).join(" "),
          media: DARK_MEDIA,
        }),
      );
    }
    if (emitted.faviconSvgDark) {
      tags.push(
        linkTag({
          rel: "icon",
          href: joinUrl(urlPrefix, "/favicon-dark.svg"),
          type: "image/svg+xml",
          media: DARK_MEDIA,
        }),
      );
    }
    for (const key of ["icon192Dark", "icon512Dark"]) {
      if (emitted[key]) {
        tags.push(
          linkTag({
            rel: "icon",
            href: joinUrl(urlPrefix, emitted[key].url),
            sizes: `${emitted[key].size}x${emitted[key].size}`,
            media: DARK_MEDIA,
          }),
        );
      }
    }
    if (emitted.icon192) {
      tags.push(
        linkTag({
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: joinUrl(urlPrefix, emitted.icon192.url),
        }),
      );
    }
    if (emitted.appleTouch) {
      tags.push(
        linkTag({
          rel: "apple-touch-icon",
          href: joinUrl(urlPrefix, "/apple-touch-icon.png"),
        }),
      );
    }
    if (manifest) {
      tags.push(
        linkTag({ rel: "manifest", href: joinUrl(urlPrefix, manifestUrl) }),
      );
    }
    if (m.theme_color) {
      tags.push(`<meta name="theme-color" content="${m.theme_color}">`);
    }
    if (cfg.dark?.theme_color) {
      tags.push(
        `<meta name="theme-color" media="${DARK_MEDIA}" content="${cfg.dark.theme_color}">`,
      );
    }
    return { manifest, headHtml: tags.join("\n") };
  };

  let state = { manifest: null, headHtml: "" };

  eleventyConfig.on("eleventy.before", async () => {
    try {
      state = await generate();
    } catch (error) {
      console.warn("[favicons] generation failed:", error?.message || error);
      state = { manifest: null, headHtml: "" };
    }
  });

  // Global-data bridge so the virtual manifest template can read what
  // `eleventy.before` produced (global data functions are evaluated lazily,
  // after the before hook).
  eleventyConfig.addGlobalData("favicons", () => ({
    manifest: state.manifest,
  }));

  // Virtual template for the manifest. The stem must not contain dots
  // (Eleventy would misdetect the template engine); `permalink` front
  // matter controls the output path — literal file, or `false` to skip
  // when the minimal manifest fields are missing.
  eleventyConfig.addTemplate(
    "favicons-manifest.njk",
    `{{ favicons.manifest | dump(2) | safe }}`,
    {
      layout: false,
      eleventyExcludeFromCollections: true,
      eleventyComputed: {
        permalink: (data) =>
          data.favicons && data.favicons.manifest ? manifestUrl : false,
      },
    },
  );

  eleventyConfig.addAsyncShortcode(shortcodeName, async () => state.headHtml);
}
