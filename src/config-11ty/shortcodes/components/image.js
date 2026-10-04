import Image from "@11ty/eleventy-img";
import deepmerge from "deepmerge";
import sharp from "sharp";
import {
  imageTransformOptions,
  maxWidthInPx,
} from "../../plugins/imageTransform.js";
import { isManifestSource, recordImageStats } from "../../image-manifest.js";
import { prepareImageArgs } from "./image.args.js";
import { WORKING_DIR } from "../../../../env.config.js";

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
// The eager layer is sized to the display box width (never upscaled, >= 0.055
// bits per displayed pixel — the LCP spec floor is 0.05) so Chrome keeps it as
// the LCP candidate and ignores the same-size hi-res arriving later. The LQIP
// keeps the source aspect ratio — `background-size` + `background-position`
// crop/position it inside the box exactly like `object-fit`/`object-position`
// do on the <img>.
//
// Derivatives ride the eleventy-img pipeline (dryRun buffers + real writes);
// the only raw sharp call left is the `metadata()` read for `hasAlpha` —
// eleventy-img keeps it internal (it only feeds its `formatFiltering`
// option). Opt out per image with `noLqip` / `data-no-lqip`.
// ---------------------------------------------------------------------------
const TINY_WIDTH = 16;
const TINY_QUALITY = 40;
const LQIP_QUALITY = 15;
const BPP_TARGET = 0.055; // bits per displayed pixel (0.05 spec floor + buffer)
const FIT_TO_BG_SIZE = {
  cover: "cover",
  contain: "contain",
  fill: "100% 100%",
  none: "auto",
  "scale-down": "auto",
};

const lastEmittedFile = (stats) => {
  const lastFormat = Object.keys(stats).pop();
  return stats[lastFormat]?.[stats[lastFormat].length - 1];
};

// src -> tiny inline webp data URI via the pipeline (dryRun: buffer, no write)
const tinyCache = new Map();
const tinyDataUri = (src) => {
  if (!tinyCache.has(src)) {
    tinyCache.set(
      src,
      Image(src, {
        ...imageTransformOptions,
        dryRun: true,
        widths: [TINY_WIDTH],
        formats: ["webp"],
        sharpWebpOptions: { quality: TINY_QUALITY },
      }).then(
        (stats) =>
          stats?.webp?.[0]?.buffer &&
          `data:image/webp;base64,${stats.webp[0].buffer.toString("base64")}`,
      ),
    );
  }
  return tinyCache.get(src);
};

// (src, displayW, displayH) -> emitted lqip url, generated and cached by the
// same pipeline as the responsive variants (filenameFormat keeps it out of
// real variant filenames). If the q15 output sits under the bpp floor it is
// regenerated at q40 before anything is written to disk.
const lqipCache = new Map();
const ensureLqip = (src, displayW, displayH) => {
  const key = `${src}|${displayW}|${displayH}`;
  if (!lqipCache.has(key)) {
    lqipCache.set(
      key,
      (async () => {
        const base = {
          ...imageTransformOptions,
          widths: [displayW],
          formats: ["webp"],
          filenameFormat: (id, s, w, fmt) =>
            `${id}-lqip-${w}w-${displayH}h.${fmt}`,
        };
        const draft = await Image(src, {
          ...base,
          dryRun: true,
          sharpWebpOptions: { quality: LQIP_QUALITY },
        });
        const draftSize = draft?.webp?.[0]?.size;
        const floor = (displayW * displayH * BPP_TARGET) / 8; // bytes
        const quality =
          draftSize != null && draftSize < floor ? 40 : LQIP_QUALITY;
        const stats = await Image(src, {
          ...base,
          sharpWebpOptions: { quality },
        });
        return stats?.webp?.[0]?.url || null;
      })(),
    );
  }
  return lqipCache.get(key);
};

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

// "4/3" | "1.6180/1" | "2.39" -> 1.333… | 1.618 | 2.39
const parseAspectRatio = (ar) => {
  if (ar == null) return null;
  const [n, d = "1"] = String(ar).split("/");
  const ratio = parseFloat(n) / parseFloat(d);
  return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
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
  const {
    srcRaw,
    width,
    widths,
    fallback,
    wrapperTag,
    aspectRatio,
    objectPosition,
    objectFit,
    noLqip,
    imgAttributes,
    opts,
  } = prepareImageArgs(args);

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
  const skipLqip =
    Boolean(noLqip) ||
    Boolean(args?.["data-no-lqip"]) ||
    /\bbackground(?:-[a-z]+)?\s*:/i.test(imgAttributes?.style || "");
  if (html && !skipLqip) {
    try {
      const emitted = lastEmittedFile(Image.statsSync(src, options));
      // Alpha comes from the emitted file's own metadata (the file the
      // browser actually loads): sharp metadata is the one raw call we need.
      const meta = emitted?.outputPath
        ? await sharp(emitted.outputPath).metadata()
        : null;
      if (meta && meta.format !== "svg" && !meta.hasAlpha) {
        const tiny = await tinyDataUri(src);
        if (!tiny) throw new Error("no tiny placeholder buffer");
        const position = (objectPosition || "center").trim();
        const size = FIT_TO_BG_SIZE[objectFit] || "cover";
        const layers = [tiny];
        let preloadUrl = null;

        if ((imgAttributes?.loading || "").toLowerCase() === "eager") {
          // The LQIP must never be upscaled: aim at the display box. `sizes`
          // encodes the width for fluid images, width/height args are
          // proportional fallbacks, natural dims the last resort.
          const w = parseInt(width) || 0;
          const h = parseInt(args?.height) || 0;
          const displayW = Math.round(
            sizesUpperBound(imgAttributes?.sizes) ||
              w ||
              Math.min(meta.width, maxWidthInPx),
          );
          // Box height is only needed for the bpp floor — the LQIP keeps the
          // source ratio and CSS (`background-size`) does the cropping.
          const ar =
            parseAspectRatio(aspectRatio) ||
            (h && w ? w / h : meta.width / meta.height);
          const displayH = Math.max(1, Math.round(displayW / ar));
          preloadUrl = await ensureLqip(src, displayW, displayH);
          if (preloadUrl) layers.unshift(preloadUrl);
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
