// ctx-css — brand/style tokens -> generated CSS for the ctx.css pipeline.
// See ./README.md for the data model, file layout, emission modes and the
// progressive-takeover action plan.
//
//   load.js      reads `_data/brand/*.yaml` + legacy `_data/brand.yaml` (fs)
//   resolve.js   normalizes the merged data (pure — files -> legacy -> defaults)
//   transform.js compiles the resolved data into CSS text (pure)
//   emit.js      file/import output helpers (fs)
//   defaults.js  default values + element enums (shared with the CMS schema)
//
// The plugin registers:
//   global data   `ctxData` (resolved config), `ctxBrandCss` (css text),
//                 `ctxCssEmitMode`
//   `{% ctxCss %}` shortcode — emits the delivery tag for the configured mode
import fs from "node:fs";
import path from "node:path";
import { MINIFY, WORKING_DIR_ABSOLUTE } from "../../../../env.config.js";
import { loadBrandData } from "./load.js";
import { resolveBrand } from "./resolve.js";
import { compileCtxCss } from "./transform.js";
import { minifyCss } from "./emit.js";

export default function (eleventyConfig, options = {}) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  const {
    // Directory holding `_data/` — defaults to the project's working dir.
    dataDir = WORKING_DIR_ABSOLUTE,
    // "inline" | "file" | "import" — defaults follow `inlineAllStyles`, the
    // project's existing inline-vs-linked stylesheets toggle.
    emit,
    // File name for `emit: "file"` (written under `assets/styles/`).
    filename = "ctx-brand.css",
    // Project stylesheet to write for `emit: "import"` — the build skips
    // `_`-prefixed `_styles` entrypoints but lets other files `@import` it.
    importPath = "_styles/_ctx.css",
    minify = MINIFY,
  } = options;

  const raw = loadBrandData(dataDir);
  const ctxData = resolveBrand(raw);
  const compiled = compileCtxCss(ctxData);
  const emitMode = emit || (ctxData.settings.inlineAllStyles ? "inline" : "file");

  eleventyConfig.addGlobalData("ctxData", ctxData);
  eleventyConfig.addGlobalData("ctxBrandCss", compiled.cssText);
  eleventyConfig.addGlobalData("ctxCssEmitMode", emitMode);

  if (emitMode === "file") {
    // .css isn't a template format so addTemplate won't emit it — write the
    // file straight into the output dir at config time (Eleventy doesn't
    // clean the output dir by default).
    const dest = path.join(
      eleventyConfig.dir.output,
      "assets/styles",
      filename,
    );
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, minifyCss(compiled.cssText, minify));
  } else if (emitMode === "import") {
    const dest = path.join(dataDir, importPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, minifyCss(compiled.cssText, minify));
  }

  // {% ctxCss %} — the delivery tag for the configured mode.
  eleventyConfig.addShortcode("ctxCss", () =>
    emitMode === "inline"
      ? `<style eleventy:ignore>${compiled.cssText}</style>`
      : emitMode === "file"
        ? `<link rel="stylesheet" href="/assets/styles/${filename}">`
        : "",
  );
}
