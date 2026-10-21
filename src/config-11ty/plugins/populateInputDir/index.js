import fglob from "fast-glob";
import { printDiffTree, loadFiles } from "./utils.js";
import { log } from "../../../utils/log/logger.js";

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  // prettier-ignore
  const default11tyTemplateFormats = ["html", "md", "webc", "11ty.js", "liquid", "njk", "hbs", "mustache", "ejs", "haml", "pug", "ts", "jsx", "mdx", "scss"];
  // const default11tyDataFormats = ["11tydata.js", "11tydata.json", "json"];
  const { templateFormatsAdded, dataExtensions } = eleventyConfig;
  const templateFormats = [
    ...default11tyTemplateFormats,
    ...templateFormatsAdded,
  ];
  // const fileFormats = [
  //   ...default11tyTemplateFormats,
  //   ...default11tyDataFormats,
  //   ...templateFormatsAdded,
  //   ...dataExtensions.keys(),
  // ];

  // Legacy plugin option: "silent" still suppresses this plugin's output;
  // all real level control now lives in POKO_LOG_LEVEL.
  const quiet = pluginOptions?.logLevel === "silent";

  const phase = quiet ? null : log.phase("populate", "populating input dir…");
  const inputDir = eleventyConfig.dir.input;
  const sources = Array.isArray(pluginOptions?.sources)
    ? pluginOptions.sources
    : [pluginOptions?.sources];

  // Add watch targets for sources
  sources.forEach((source) => {
    if (typeof source === "string") {
      eleventyConfig.addWatchTarget(`./${source}/**/*`, { resetConfig: true });
    } else if (typeof source === "object" && source.in) {
      eleventyConfig.addWatchTarget(`./${source.in}/**/*`, {
        resetConfig: true,
      });
    }
  });

  let occupiedPaths = [];
  const pathSourceMap = {}; // Track sources for each path
  const skippedPathsMap = {}; // Track paths that were skipped (already existed)
  // TODO: check this is working as expected with fast-glob
  const actualContentFilePaths = await fglob(`${inputDir}/**/*`, {
    // nodir: true
  });
  occupiedPaths.push(
    ...actualContentFilePaths.map((p) => p.replace(`${inputDir}/`, "")),
  );

  log.debug(
    "populate",
    "populate.scan",
    `Number of paths in input dir: ${actualContentFilePaths.length}`,
  );
  await Promise.all(
    sources.map(async (source) => {
      let srcDir = "";
      let outSubDir = "";
      if (typeof source === "string") {
        srcDir = source;
      }
      if (typeof source === "object" && source.in) {
        srcDir = source.in;
        outSubDir = source.out || "";
      }

      if (!srcDir) {
        log.error(
          "populate",
          "populate.config",
          `Invalid source configuration: ${JSON.stringify(source)}`,
        );
        return; // Skip this iteration
      }

      const sourceFiles = await loadFiles(`${srcDir}/**/*`);

      for (const file of sourceFiles) {
        const transposedFilePath =
          (outSubDir ? `${outSubDir}/` : "") +
          file.path.replace(`${srcDir}/`, "");

        const match11tyFile = transposedFilePath.match(
          /\.(11tydata|11ty)\.[^.]+$/,
        );
        const templateFormat = match11tyFile
          ? match11tyFile[0].slice(1) // e.g., "11tydata.js"
          : transposedFilePath.split(".").pop(); // e.g., "js"

        // Check that:
        // - The file path has not yet been added
        // - The file format is supported
        if (
          !occupiedPaths.includes(transposedFilePath) &&
          templateFormats.includes(templateFormat)
        ) {
          // Actually add the template
          eleventyConfig.addTemplate(transposedFilePath, file.content);

          log.debug(
            "populate",
            "populate.template",
            `Virtual Template added: '${transposedFilePath}' (from '${file.path}')`,
          );
          occupiedPaths.push(transposedFilePath);
          // Track the source of this path for the diff view
          pathSourceMap[transposedFilePath] = file.path;
        } else {
          // Track paths that were skipped because they already existed
          skippedPathsMap[transposedFilePath] = file.path;
          log.debug(
            "populate",
            "populate.skipped",
            `Skipped existing path: '${transposedFilePath}' (would be from '${file.path}')`,
          );
          // Important: If a path is both added and skipped (from different sources),
          // make sure we still have it in the skippedPathsMap
        }
      }
    }),
  );

  const added = occupiedPaths.length - actualContentFilePaths.length;

  if (sources.some((s) => !s || (typeof s === "object" && !s.in))) {
    log.warn(
      "populate",
      "populate.config",
      `Completed with some configuration issues. Check error logs for details.`,
    );
  }

  // Tree visualization of original/added/skipped paths — debug detail
  if (log.isEnabled("debug")) {
    const allPathsForVisualization = [...occupiedPaths];
    Object.keys(skippedPathsMap).forEach((skippedPath) => {
      if (!allPathsForVisualization.includes(skippedPath)) {
        allPathsForVisualization.push(skippedPath);
      }
    });
    log.debug(
      "populate",
      "populate.tree",
      `Path structure:
- Gray: existing files
- Yellow with red source: original files that would also be added from other sources
- Blue with blue source: added files
- Yellow with red source: skipped files (already existed)
- Blue with blue source and red source: files added from one source and skipped from another
${printDiffTree(allPathsForVisualization, actualContentFilePaths, pathSourceMap, skippedPathsMap, inputDir)}`,
    );
  }

  phase?.done(`${added} templates from ${sources.length} sources`, {
    added,
    sources: sources.length,
  });
}
