import Image from "@11ty/eleventy-img";
import deepmerge from "deepmerge";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  imageTransformOptions,
  maxWidthInPx,
} from "../../plugins/imageTransform.js";
import { isManifestSource, recordImageStats } from "../../image-manifest.js";
import { prepareImageArgs } from "./image.args.js";
import { WORKING_DIR, IMAGE_CACHE_DIR } from "../../../../env.config.js";

// ---------------------------------------------------------------------------
// LQIP (Low-Quality Image Placeholder) — implements the technique from
// https://csswizardry.com/2023/09/the-ultimate-lqip-lcp-technique/
//
// For every generated image WITHOUT an alpha channel we paint a placeholder
// through `background-image` on the <img> — it shows while the real source
// loads, then gets covered by it:
//
//   every opaque image:  background: <tiny inline base64 webp>
//   loading="eager":     background: <LCP-grade lqip>, <tiny base64>
//                        + <link rel="preload" as="image" fetchpriority="high">
//                        pushed into the page's `html`/`head` bundle, and
//                        fetchpriority="high" removed from the <img> (the
//                        hi-res must not race the LQIP).
//
// The eager layer is sized to the display box (never upscaled, >= 0.055 bits
// per displayed pixel — the LCP spec floor is 0.05) so Chrome keeps it as the
// LCP candidate and ignores the same-size hi-res arriving later.
//
// Alpha comes from the emitted file's own metadata: eleventy-img keeps
// hasAlpha internal (it only feeds its `formatFiltering` option), so we
// re-check on the produced file. Opt out per image with `noLqip` /
// `data-no-lqip`.
// ---------------------------------------------------------------------------
const URL_PATH = "/assets/images/";
const TINY_WIDTH = 16;
const TINY_QUALITY = 40;
const LQIP_QUALITY = 15;
const BPP_TARGET = 0.055; // bits per displayed pixel (0.05 spec floor + buffer)
const SHARP_POSITIONS = {
  center: "centre",
  centre: "centre",
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  "left top": "left top",
  "top left": "left top",
  "right top": "right top",
  "top right": "right top",
  "left bottom": "left bottom",
  "bottom left": "left bottom",
  "right bottom": "right bottom",
  "bottom right": "right bottom",
};
const FIT_TO_BG_SIZE = {
  cover: "cover",
  contain: "contain",
  fill: "100% 100%",
  none: "auto",
  "scale-down": "auto",
};

// emitted file -> { hasAlpha, width, height, dataUri } | null
const fileCache = new Map();
const analyzeFile = (file) => {
  if (!fileCache.has(file)) {
    fileCache.set(
      file,
      (async () => {
        try {
          const meta = await sharp(file).metadata();
          if (meta.format === "svg") return null; // vector: no placeholder
          if (meta.hasAlpha) return { hasAlpha: true };
          const tiny = await sharp(file)
            .resize({ width: TINY_WIDTH, withoutEnlargement: true })
            .webp({ quality: TINY_QUALITY })
            .toBuffer();
          return {
            hasAlpha: false,
            width: meta.width,
            height: meta.height,
            dataUri: `data:image/webp;base64,${tiny.toString("base64")}`,
          };
        } catch {
          return null;
        }
      })(),
    );
  }
  return fileCache.get(file);
};

// (file, w, h, sharpPosition) -> emitted lqip url; the file is written next
// to the other generated images so the post-build cache copy ships it too.
const lqipCache = new Map();
const ensureLqip = (file, w, h, position) => {
  const key = `${file}|${w}x${h}|${position}`;
  if (!lqipCache.has(key)) {
    lqipCache.set(
      key,
      (async () => {
        const outName = `${path.parse(file).name}-lqip-${w}x${h}.webp`;
        const outPath = path.join(IMAGE_CACHE_DIR, outName);
        if (!fs.existsSync(outPath)) {
          const floor = (w * h * BPP_TARGET) / 8; // bytes
          const make = (quality) =>
            sharp(file)
              .resize(w, h, { fit: "cover", position })
              .webp({ quality })
              .toBuffer();
          let buf = await make(LQIP_QUALITY);
          if (buf.length < floor) buf = await make(40);
          fs.mkdirSync(IMAGE_CACHE_DIR, { recursive: true });
          fs.writeFileSync(outPath, buf);
        }
        return `${URL_PATH}${outName}`;
      })(),
    );
  }
  return lqipCache.get(key);
};

const ASPECT_RE = /aspect-ratio-(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)/;
const OBJ_POS_RE = /object-\[([^\]]+)\]/;
const OBJ_POS_NAMED_RE =
  /object-(top-left|top-right|bottom-left|bottom-right|left-top|right-top|left-bottom|right-bottom|top|bottom|left|right|center|centre)\b/;
const OBJ_FIT_RE = /object-(cover|contain|fill|scale-down|none)\b/;

// Class-based hints from `class`/`imgAttributes.class` (aspect-ratio-*,
// object-[…], object-contain…). Explicit args win over these.
const boxHints = (classAttr) => {
  const hints = { aspectRatio: null, position: null, fit: null };
  const aspect = (classAttr || "").match(ASPECT_RE);
  if (aspect) {
    const [n, d = "1"] = aspect[1].split("/");
    hints.aspectRatio = parseFloat(n) / parseFloat(d);
  }
  const arbitrary = (classAttr || "").match(OBJ_POS_RE);
  const named = (classAttr || "").match(OBJ_POS_NAMED_RE);
  if (arbitrary) hints.position = arbitrary[1].replaceAll("_", " ");
  else if (named) hints.position = named[1].replace("-", " ");
  const fit = (classAttr || "").match(OBJ_FIT_RE);
  if (fit) hints.fit = fit[1];
  return hints;
};

const sharpPosition = (cssPosition) =>
  SHARP_POSITIONS[(cssPosition || "").toLowerCase().trim()] ?? "centre";

const bgCssFor = (layers, position, size) =>
  `background-image:${layers.map((u) => `url('${u}')`).join(",")};` +
  `background-position:${layers.map(() => position).join(",")};` +
  `background-size:${layers.map(() => size).join(",")};` +
  `background-repeat:${layers.map(() => "no-repeat").join(",")}`;

// Largest pixel width the `sizes` attr allows — the pipeline's own estimate
// of the display box (`(max-width: Npx) 100vw, Npx`, `Npx`, ...).
const sizesUpperBound = (sizes) => {
  const px = [...(sizes || "").matchAll(/(\d+)\s*px/g)].map((m) =>
    parseInt(m[1]),
  );
  return px.length ? Math.min(Math.max(...px), maxWidthInPx) : 0;
};

// The `html` bundle manager, wired once from eleventy.config.js so eager-image
// preload links can be pushed into the page's `head` bucket.
let bundleManagers = null;
export function wireLqipBundleManager(eleventyConfig) {
  bundleManagers = eleventyConfig.getBundleManagers?.() || null;
}

// Merge `bg` css into the generated <img> tag's style attr and optionally
// strip fetchpriority="high". The html returned by eleventy-img contains a
// single <img> (optionally wrapped in <picture>).
const rewriteImgTag = (html, { bg, dropFetchpriority }) =>
  html.replace(/<img\b[^>]*>/, (tag) => {
    let t = tag;
    if (dropFetchpriority) {
      t = t.replace(/\s*fetchpriority=["']high["']/i, "");
    }
    if (/style\s*=\s*"/i.test(t)) {
      t = t.replace(
        /style\s*=\s*"([^"]*)"/i,
        (m, s) => `style="${s.replace(/\s*;?\s*$/, "")};${bg}"`,
      );
    } else if (/style\s*=\s*'/i.test(t)) {
      t = t.replace(
        /style\s*=\s*'([^']*)'/i,
        (m, s) => `style='${s.replace(/\s*;?\s*$/, "")};${bg}'`,
      );
    } else {
      t = t.replace(/\s*\/?>$/, (tail) => ` style="${bg}"${tail}`);
    }
    return t;
  });

export async function image(args) {
  // Shared with the CMS preview stub (preview-njk.js) — the pure arg→attrs
  // computation lives in ./image.args.js so they can't diverge.
  const { srcRaw, width, widths, fallback, wrapperTag, imgAttributes, opts } =
    prepareImageArgs(args);

  const options = deepmerge.all(
    [
      imageTransformOptions,
      {
        returnType: "html",
        ...(widths && { widths }),
        htmlOptions: {
          imgAttributes,
          ...(fallback && { fallback }),
        },
      },
      opts,
    ],
    { arrayMerge: (destinationArray, sourceArray, options) => sourceArray },
  );

  if (!srcRaw) {
    return "<div>Please provide an image source</div>";
  }
  const src = srcRaw.startsWith("/")
    ? `${WORKING_DIR}/${srcRaw}`.replace(/\/+/g, "/")
    : srcRaw;
  let html = await Image(src, options);
  // CMS preview manifest — key by the CMS-facing path (`/_images/…`).
  if (isManifestSource(srcRaw)) {
    try {
      recordImageStats(srcRaw, Image.statsSync(src, options));
    } catch (e) {
      console.warn(`[image-manifest] stats failed for ${srcRaw}:`, e?.message);
    }
  }
  // if (!html) {
  //   console.error({ error, src, options, page: this.page.fileSlug });
  // }
  html = width
    ? html.replace(`${width}w`, "1x").replace(`${width * 2}w`, "2x")
    : html;

  // ---------------- LQIP decoration (opaque images only) ----------------
  const noLqip = Boolean(args?.noLqip || args?.["data-no-lqip"]);
  if (html && !noLqip && !/\bbackground(?:-[a-z]+)?\s*:/i.test(imgAttributes?.style || "")) {
    try {
      const stats = Image.statsSync(src, options);
      const lastFormat = Object.keys(stats).pop();
      const emitted = stats[lastFormat]?.[stats[lastFormat].length - 1];
      const info = emitted?.outputPath
        ? await analyzeFile(emitted.outputPath)
        : null;
      if (info && !info.hasAlpha) {
        const hints = boxHints(imgAttributes?.class);
        const position = (
          args?.objectPosition ||
          hints.position ||
          "center"
        ).replace("-", " ");
        const size = FIT_TO_BG_SIZE[hints.fit] || "cover";
        const layers = [info.dataUri];
        let preloadUrl = null;

        if ((imgAttributes?.loading || "").toLowerCase() === "eager") {
          // The LQIP must never be upscaled: aim at the display box. `sizes`
          // encodes it for fluid images, width/height args are proportional
          // fallbacks, natural dims the last resort.
          const w = parseInt(args?.width) || 0;
          const h = parseInt(args?.height) || 0;
          const displayW = Math.round(
            sizesUpperBound(imgAttributes?.sizes) ||
              w ||
              Math.min(info.width, maxWidthInPx),
          );
          // An aspect-ratio class/arg defines the box (it wins over the
          // attrs' ratio); otherwise attrs, then natural dims.
          const ar = args?.aspectRatio || hints.aspectRatio;
          const displayH = ar
            ? Math.max(1, Math.round(displayW / ar))
            : h && w
              ? Math.max(1, Math.round((displayW * h) / w))
              : Math.max(1, Math.round((displayW * info.height) / info.width));
          preloadUrl = await ensureLqip(
            emitted.outputPath,
            displayW,
            displayH,
            sharpPosition(position),
          );
          layers.unshift(preloadUrl);
        }

        html = rewriteImgTag(html, {
          bg: bgCssFor(layers, position, size),
          dropFetchpriority: preloadUrl !== null,
        });
        if (preloadUrl && bundleManagers?.html && this?.page?.url) {
          bundleManagers.html.addToPage(
            this.page.url,
            `<link rel="preload" as="image" href="${preloadUrl}" fetchpriority="high">`,
            "head",
          );
        }
      }
    } catch (e) {
      console.warn(`[lqip] skipped ${srcRaw}:`, e?.message);
    }
  }

  // return `<p>${html}</p>`;
  return wrapperTag && html ? `<${wrapperTag}>${html}</${wrapperTag}>` : html;
}
