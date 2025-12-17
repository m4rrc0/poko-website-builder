import path from "node:path";
import fglob from "fast-glob";
// import deepmerge from "deepmerge";
import { DEBUG } from "../../../../env.config.js";
// import { createKeyFromData } from "../../../utils/hash.js";
import hashSum from "hash-sum";
import { cleanupExpensiveData } from "../../../utils/eleventyData.js";

let cachedPartials = new Map();

function cleanOutput(str) {
  // Removes leading whitespace from each line and multiples line breaks become a single line break
  return str.replace(/^\s+/gm, "").replace(/\n+/g, "\n");
}

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  const { dir } = eleventyConfig;
  const { dirs = [path.join(dir.input, dir.includes)] } = pluginOptions;
  const shortcodeAliases = (Array.isArray(pluginOptions?.shortcodeAliases) &&
    pluginOptions?.shortcodeAliases.length > 0 &&
    pluginOptions.shortcodeAliases) || ["partial"];

  // We use the renderFile shortcodes to render partials
  const renderFileShortcodeFn =
    eleventyConfig.nunjucks.asyncShortcodes.renderFile;

  async function renderPartial(
    filenameRaw,
    dataManual,
    templateEngineOverride,
  ) {
    // const data = deepmerge(this.ctx, dataManual);
    const data = { ...this.ctx, ...dataManual };
    const filename = path.join(filenameRaw);
    const cacheKey = hashSum({
      filename,
      data: cleanupExpensiveData(data),
      // data: { page: data.page, data: data.data, ...dataManual },
      templateEngineOverride,
    });
    const shouldKeepMdFormating =
      /\.md$/.test(filename) || /md/.test(templateEngineOverride);

    // Skip processing and grab from the memoized cache
    // TODO: This does not really work... Probably because the mother function call is async so every file rendering is processed simultaneously?
    if (cachedPartials.has(cacheKey)) {
      // TODO: Put this console.info under debug flag when it is tested
      console.info(`Partial ${filename} found in cache`);
      return cachedPartials.get(cacheKey);
    }

    const isFullPath = dirs.some((dir) => filename.startsWith(dir));
    // If the path provided already specifies a directory, use it
    if (isFullPath) {
      return await renderFileShortcodeFn
        .call(this, filename, data, templateEngineOverride)
        .catch((e) => {
          console.error(e);
          return "";
        })
        .then((result) => {
          const cleanResult = shouldKeepMdFormating
            ? result
            : cleanOutput(result);
          cachedPartials.set(cacheKey, cleanResult);
          return cleanResult;
        });
    }

    // Otherwise, try to find the file in the includes directories and take the first match
    const files = dirs.map((dir) => path.join(dir, filename));
    const file = files.find((file) => (fglob.globSync(file) || []).length > 0);

    if (file) {
      return await renderFileShortcodeFn
        .call(this, file, data, templateEngineOverride)
        .catch((e) => {
          console.error(e);
          return "";
        })
        .then((result) => {
          const cleanResult = shouldKeepMdFormating
            ? result
            : cleanOutput(result);

          cachedPartials.set(cacheKey, cleanResult);
          return cleanResult;
        });
    }

    if (DEBUG) {
      console.warn(`Partial "${filename}" not found in "${dirs}"`);
    }

    return "";
  }

  for (const alias of shortcodeAliases) {
    if (typeof alias !== "string") {
      console.warn(`Invalid shortcode alias: ${alias}`);
      continue;
    }
    await eleventyConfig.addAsyncShortcode(alias, renderPartial);
  }
}
