// LQIP (Low-Quality Image Placeholder) transform.
// Technique: https://csswizardry.com/2023/09/the-ultimate-lqip-lcp-technique/
//
// Runs after the eleventy-img HTML transform, so every `<img>` already points
// at a generated /assets/images/ file. For each image WITHOUT an alpha
// channel we paint a placeholder through `background-image` on the <img> —
// it shows while the real source loads, then gets covered by it:
//
//   every opaque image:  background: <tiny inline base64 webp>
//   loading="eager":     background: <LCP-grade lqip>, <tiny base64>
//                        + <link rel="preload" as="image" fetchpriority="high">
//                        appended to <head>, and fetchpriority="high" removed
//                        from the <img> (the hi-res must not race the LQIP).
//
// The eager layer is sized to the display box (never upscaled, >= 0.055 bits
// per displayed pixel — the LCP spec floor is 0.05) so Chrome keeps it as the
// LCP candidate and ignores the same-size hi-res arriving later.
//
// Sharp does the derivative work; alpha comes from the emitted file's own
// metadata (eleventy-img keeps hasAlpha internal — it only feeds its
// `formatFiltering` option — so we re-check on the produced file).
import path from "node:path";
import fs from "node:fs";
import sharp from "sharp";
import { isBun } from "../../../utils/runtime.js";
import { IMAGE_CACHE_DIR, IMAGES_OUTPUT_DIR } from "../../../../env.config.js";
import { maxWidthInPx } from "../imageTransform.js";

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

// url of a generated image -> file on disk (cache dir first, then dist)
const resolveSrcFile = (src) => {
  const clean = String(src || "").split(/[?#]/)[0];
  if (!clean.startsWith(URL_PATH)) return null;
  const name = path.basename(clean);
  for (const dir of [IMAGE_CACHE_DIR, IMAGES_OUTPUT_DIR]) {
    const file = path.join(dir, name);
    if (fs.existsSync(file)) return file;
  }
  return null;
};

// file -> { hasAlpha, width, height, dataUri } | null
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

// (file, w, h, sharpPosition) -> emitted lqip url, written next to the
// other generated images so the post-build cache copy ships it too.
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

const boxHints = (classAttr) => {
  const hints = { aspectRatio: null, position: null, fit: null };
  const aspect = classAttr.match(ASPECT_RE);
  if (aspect) {
    const [n, d = "1"] = aspect[1].split("/");
    hints.aspectRatio = parseFloat(n) / parseFloat(d);
  }
  const arbitrary = classAttr.match(OBJ_POS_RE);
  const named = classAttr.match(OBJ_POS_NAMED_RE);
  if (arbitrary) hints.position = arbitrary[1].replaceAll("_", " ");
  else if (named) hints.position = named[1].replace("-", " ");
  const fit = classAttr.match(OBJ_FIT_RE);
  if (fit) hints.fit = fit[1];
  return hints;
};

const sharpPosition = (cssPosition) =>
  SHARP_POSITIONS[cssPosition.toLowerCase()] ?? "centre";

const bgCssFor = (layers, position, size) =>
  `background-image:${layers.map((u) => `url('${u}')`).join(",")};` +
  `background-position:${layers.map(() => position).join(",")};` +
  `background-size:${layers.map(() => size).join(",")};` +
  `background-repeat:${layers.map(() => "no-repeat").join(",")}`;

const readImg = (el) => ({
  src: el.getAttribute("src") || "",
  loading: (el.getAttribute("loading") || "").toLowerCase(),
  style: el.getAttribute("style") || "",
  classAttr: el.getAttribute("class") || "",
  width: el.getAttribute("width"),
  height: el.getAttribute("height"),
  sizes: el.getAttribute("sizes") || "",
  optOut: el.getAttribute("data-no-lqip") !== null,
});

// Largest pixel width the `sizes` attr allows — the pipeline's own estimate
// of the display box (`(max-width: Npx) 100vw, Npx`, `Npx`, ...).
const sizesUpperBound = (sizes) => {
  const px = [...sizes.matchAll(/(\d+)\s*px/g)].map((m) => parseInt(m[1]));
  return px.length ? Math.min(Math.max(...px), maxWidthInPx) : 0;
};

const planFor = async (spec) => {
  if (!spec.src || spec.optOut) return { skip: true };
  if (/\bbackground(?:-[a-z]+)?\s*:/i.test(spec.style)) return { skip: true };
  const file = resolveSrcFile(spec.src);
  if (!file) return { skip: true };
  const info = await analyzeFile(file);
  if (!info || info.hasAlpha) return { skip: true };

  const hints = boxHints(spec.classAttr);
  const position = hints.position || "center";
  const size = FIT_TO_BG_SIZE[hints.fit] || "cover";
  const layers = [info.dataUri];
  let preloadUrl = null;

  if (spec.loading === "eager") {
    const w = parseInt(spec.width) || 0;
    const h = parseInt(spec.height) || 0;
    // The LQIP must never be upscaled: aim at the display box. `sizes`
    // encodes it for fluid images, width/height attrs are proportional
    // fallbacks, natural dims the last resort.
    const displayW = Math.round(
      sizesUpperBound(spec.sizes) || w || Math.min(info.width, maxWidthInPx),
    );
    // An aspect-ratio class defines the box (it wins over the attrs' ratio);
    // otherwise attrs are proportional fallbacks, then natural dims.
    const displayH = hints.aspectRatio
      ? Math.max(1, Math.round(displayW / hints.aspectRatio))
      : h && w
        ? Math.max(1, Math.round((displayW * h) / w))
        : Math.max(1, Math.round((displayW * info.height) / info.width));
    preloadUrl = await ensureLqip(
      file,
      displayW,
      displayH,
      sharpPosition(position),
    );
    layers.unshift(preloadUrl);
  }

  const bg = bgCssFor(layers, position, size);
  return {
    style: spec.style
      ? `${spec.style.replace(/\s*;?\s*$/, "")};${bg}`
      : bg,
    dropFetchpriority: preloadUrl !== null,
    preloadUrl,
  };
};

async function loadNodeHTMLRewriter() {
  try {
    const { HTMLRewriter } = await import("html-rewriter-wasm");
    return HTMLRewriter;
  } catch (error) {
    console.error("HTMLRewriter not available without Bun.");
    console.error(
      "Install `html-rewriter-wasm` to enable it under Node.",
      error,
    );
    throw error;
  }
}

export default async function (eleventyConfig) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  let rewrite;
  if (isBun) {
    rewrite = (html, register) => {
      const rewriter = new HTMLRewriter();
      register(rewriter);
      return rewriter.transform(html);
    };
  } else {
    const NodeHTMLRewriter = await loadNodeHTMLRewriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    rewrite = async (html, register) => {
      let out = "";
      const rewriter = new NodeHTMLRewriter((chunk) => {
        out += decoder.decode(chunk, { stream: true });
      });
      try {
        register(rewriter);
        await rewriter.write(encoder.encode(html));
        await rewriter.end();
      } finally {
        rewriter.free();
      }
      out += decoder.decode();
      return out;
    };
  }

  eleventyConfig.addTransform("lqipTransform", async function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;

    // Pass 1 — collect <img> specs in document order.
    const specs = [];
    await rewrite(content, (rewriter) => {
      rewriter.on("img", {
        element(el) {
          specs.push(readImg(el));
        },
      });
    });

    // Async image work is impossible inside element handlers: compute every
    // derivative up front, then apply the markup changes in a second pass.
    const plans = await Promise.all(specs.map(planFor));
    const preloadUrls = [
      ...new Set(plans.map((p) => p.preloadUrl).filter(Boolean)),
    ];
    const preloadHtml = preloadUrls
      .map(
        (u) =>
          `<link rel="preload" as="image" href="${u}" fetchpriority="high">`,
      )
      .join("");

    // Pass 2 — apply.
    let i = 0;
    let headDone = false;
    return rewrite(content, (rewriter) => {
      rewriter.on("img", {
        element(el) {
          const plan = plans[i++];
          if (!plan || plan.skip) return;
          el.setAttribute("style", plan.style);
          if (
            plan.dropFetchpriority &&
            el.getAttribute("fetchpriority") === "high"
          ) {
            el.removeAttribute("fetchpriority");
          }
        },
      });
      if (preloadHtml) {
        rewriter.on("head", {
          element(el) {
            if (headDone) return;
            headDone = true;
            el.append(preloadHtml, { html: true });
          },
        });
      }
    });
  });
}
