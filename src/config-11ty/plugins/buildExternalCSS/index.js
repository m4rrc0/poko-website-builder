import { build as bunBuild, plugin as bunPlugin } from "bun";
import fglob from "fast-glob";
import { MINIFY, brandConfig, POKO_THEME } from "../../../../env.config.js";

const mustImportCtxCss = !!brandConfig?.ctxCssImport;
const ctxCssEntrypoint = `./src/styles/ctx/ctx.css`;

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  const { dir } = eleventyConfig;
  const { inputGlob = "_styles/*.css", outputDir = "assets/styles" } =
    pluginOptions || {};
  const outdir = `./${dir.output}/${outputDir}`;

  console.log(dir.input);
  let externalStylesInline = null;
  let entrypoints = await fglob([
    `${dir.input}/${inputGlob}`,
    `src/themes/${POKO_THEME}/_styles/*.css`,
  ]);
  // Remove entrypoint files that start with an underscore
  entrypoints = entrypoints.filter(
    (entrypoint) => !entrypoint.split("/").pop().startsWith("_"),
  );
  if (mustImportCtxCss) {
    entrypoints.unshift(ctxCssEntrypoint);
  }

  const externalCssFiles = entrypoints.map((entrypoint) => {
    const filename = entrypoint.split("/").pop();
    const localUrl = `${outputDir}/${filename}`;

    return {
      in: entrypoint,
      out: localUrl,
    };
  });
  const htmlExternalCssFiles = externalCssFiles
    .map((file) => `<link rel="stylesheet" href="/${file.out}">`)
    .join("\n");

  if (Array.isArray(entrypoints) && typeof entrypoints[0] === "string") {
    await bunBuild({
      entrypoints,
      outdir,
      naming: "[name].css",
      // naming: "index.css",
      // plugins: [cssTransformPlugin],
      minify: MINIFY,
      cssChunking: true,
    })
      .catch((e) => {
        console.error(e);
        throw e;
      })
      .then(async ({ outputs, success, logs }) => {
        // Read content of each output file
        const fileContents = await Promise.all(
          outputs.map(async (output) => {
            const content = await Bun.file(output.path).text();
            return {
              path: output.path,
              content,
            };
          }),
        );

        externalStylesInline = fileContents
          .map((file) => file.content)
          .join("");
      });
  }

  eleventyConfig.addGlobalData("htmlExternalCssFiles", htmlExternalCssFiles);
  eleventyConfig.addGlobalData("externalStylesInline", externalStylesInline);

  // TODO: add global data for generated stylesheets urls ? (Should we account for drafts? Probably not as we can use underscores in file names?)
  // TODO: integrate global variables in the first stylesheet generated
  // TODO: if no stylesheet is generated, add a global data variable to be added to the main layout for global css variables
}
