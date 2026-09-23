import fglob from "fast-glob";
import { MINIFY, brandConfig, POKO_THEME } from "../../../../env.config.js";
import { enginePath } from "../../../utils/paths.js";
import { buildCss } from "../../../utils/runtime.js";

const mustImportCtxCss = !!brandConfig?.ctxCssImport;
const ctxCssEntrypoint = enginePath("src/styles/ctx/ctx.css");

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  const { dir } = eleventyConfig;
  const { inputGlob = "_styles/*.css", outputDir = "assets/styles" } =
    pluginOptions || {};
  const outdir = `./${dir.output}/${outputDir}`;

  const htmlExternalCtxCssTag = `<link rel="stylesheet" href="/${outputDir}/ctx.css">`;
  let externalStylesInline = null;
  let CtxCssInline = null;

  let entrypoints = await fglob([
    enginePath(`src/themes/${POKO_THEME}/_styles/*.css`),
    `${dir.input}/${inputGlob}`,
  ]);
  // Remove entrypoint files that start with an underscore
  entrypoints = entrypoints.filter(
    (entrypoint) => !entrypoint.split("/").pop().startsWith("_"),
  );
  if (mustImportCtxCss) {
    // NOTE: Not a good idea to merge CTX CSS with other stylesheets
    // because CTX.css are the most global styles and the rest is project specific.
    // We need to load UnoCSS styles in between
    // entrypoints.unshift(ctxCssEntrypoint);
    const outputs = await buildCss({
      entrypoints: [ctxCssEntrypoint],
      outdir,
      naming: "ctx.css",
      minify: MINIFY,
      cssChunking: true,
    }).catch((e) => {
      console.error(e);
      throw e;
    });

    CtxCssInline = outputs.map((file) => file.content).join("");
  }

  const externalCssFiles = entrypoints.map((entrypoint) => {
    const filename = entrypoint.split("/").pop();
    const localUrl = `${outputDir}/${filename}`;

    return {
      in: entrypoint,
      out: localUrl,
    };
  });
  const htmlExternalCssTags = externalCssFiles
    .map((file) => `<link rel="stylesheet" href="/${file.out}">`)
    .join("\n");

  if (Array.isArray(entrypoints) && typeof entrypoints[0] === "string") {
    const outputs = await buildCss({
      entrypoints,
      outdir,
      naming: "[name].css",
      minify: MINIFY,
      cssChunking: true,
    }).catch((e) => {
      console.error(e);
      throw e;
    });

    externalStylesInline = outputs.map((file) => file.content).join("");
  }

  eleventyConfig.addGlobalData("htmlExternalCtxCssTag", htmlExternalCtxCssTag);
  eleventyConfig.addGlobalData("htmlExternalCssTags", htmlExternalCssTags);
  eleventyConfig.addGlobalData("CtxCssInline", CtxCssInline);
  eleventyConfig.addGlobalData("externalStylesInline", externalStylesInline);

  // TODO: add global data for generated stylesheets urls ? (Should we account for drafts? Probably not as we can use underscores in file names?)
  // TODO: integrate global variables in the first stylesheet generated
  // TODO: if no stylesheet is generated, add a global data variable to be added to the main layout for global css variables
}
