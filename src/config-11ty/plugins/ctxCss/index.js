import { build as bunBuild, plugin as bunPlugin } from "bun";
// import fglob from "fast-glob";
import { MINIFY } from "../../../../env.config.js";

// TODO: plugin not working. May be because
// const cssTransformPlugin = {
//   name: "css-transform",
//   setup(build) {
//     // const { compile } = await import("svelte/compiler");

//     build.onLoad({ filter: /\.css$/ }, async (args) => {
//       console.log({ args })
//       const path = args.path
//       const file = await Bun.file(path).text();
//       console.log({ file })
//       const contents = `p { color: red; }\n${file}`
//       return {
//         contents,
//         loader: "css",
//       }
//     })
//   }
// }

// bunPlugin(cssTransformPlugin);

// const cssBuildPlugin = async function () {
//   await bunBuild({
//     entrypoints: ["./src/styles/ctx/ctx.css"],
//     outdir: "./dist",
//     naming: "[name].css",
//     // plugins: [cssTransformPlugin],
//     minify: MINIFY,
//   });
// };

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  const { dir } = eleventyConfig;
  // const { inputGlob = "_styles/*.css", outputDir = "assets/styles" } =
  //   pluginOptions || {};
  // const outdir = `${dir.output}/${outputDir}`;
  const outdir = `src/styles/`;
  const entrypoints = [`src/styles/ctx/ctx.css`];

  await bunBuild({
    entrypoints,
    outdir,
    // naming: '[name].css',
    naming: "ctx.css",
    // plugins: [cssTransformPlugin],
    minify: MINIFY,
    // cssChunking: true,
  }).catch((e) => {
    console.error(e);
    throw e;
  });

  eleventyConfig.addWatchTarget("src/**/*.css", { resetConfig: true });
}
