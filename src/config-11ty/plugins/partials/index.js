import path from "node:path";
import fglob from "fast-glob";
// import deepmerge from "deepmerge";
import { DEBUG } from "../../../../env.config.js";
// import { createKeyFromData } from "../../../utils/hash.js";
// import hashSum from "hash-sum";
// import { cleanupExpensiveData } from "../../../utils/eleventyData.js";

// let cachedPartials = new Map();

function cleanOutput(str) {
  // Removes leading whitespace from each line and multiples line breaks become a single line break
  return str.replace(/^\s+/gm, "").replace(/\n+/g, "\n");
}

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  const { dir, templateFormats, templateFormatsAdded } = eleventyConfig;
  const { dirs = [path.join(dir.input, dir.includes)] } = pluginOptions;
  const defaultExt = pluginOptions?.defaultExt ||
    templateFormats || ["11ty.js", "njk", "liquid", "md"];
  const shortcodeAliases = (Array.isArray(pluginOptions?.shortcodeAliases) &&
    pluginOptions?.shortcodeAliases.length > 0 &&
    pluginOptions.shortcodeAliases) || ["partial"];
  const pairedShortcodeAliases = (Array.isArray(
    pluginOptions?.pairedShortcodeAliases,
  ) &&
    pluginOptions?.pairedShortcodeAliases.length > 0 &&
    pluginOptions.pairedShortcodeAliases) || ["partialWrapper"];

  // We use the renderFile shortcodes to render partials
  const renderFileShortcodeFn =
    eleventyConfig.nunjucks.asyncShortcodes.renderFile;

  async function retrievePartial(filename) {
    if (!/\./.test(filename)) {
      for (const ext of defaultExt) {
        const file = await retrievePartial(`${filename}.${ext}`);
        if (file) {
          return file;
        }
      }
    }

    const isFullPath = dirs.some((dirPath) => filename.startsWith(dirPath));
    // If the path provided already specifies a directory listed in our sources, use it
    if (isFullPath) {
      return filename;
    }
    // Otherwise, try to find the file in the includes directories and take the first match
    const files = dirs.map((dirPath) => path.join(dirPath, filename));
    const file = files.find((file) => (fglob.globSync(file) || []).length > 0);
    if (file) {
      return file;
    }
    if (DEBUG) {
      console.warn(`Partial "${filename}" not found in "${dirs}"`);
    }
    return "";
  }

  async function renderPartial(
    filenameRaw,
    dataManual,
    templateEngineOverride,
  ) {
    // const data = deepmerge(this.ctx, dataManual);
    const data = { ...this.ctx, ...dataManual };
    const filename = path.join(filenameRaw);
    // const cacheKey = hashSum({
    //   filename,
    //   data: cleanupExpensiveData(data),
    //   // data: { page: data.page, data: data.data, ...dataManual },
    //   templateEngineOverride,
    // });
    const shouldKeepMdFormating =
      /\.md$/.test(filename) || /md/.test(templateEngineOverride);

    // Skip processing and grab from the memoized cache
    // TODO: Not very useful because depends on data as well so a partial on different pages will generate a different cache key.
    // This is intended so not sure we can optimize things that much here...
    // if (cachedPartials.has(cacheKey)) {
    //   // TODO: Put this console.info under debug flag when it is tested
    //   console.info(`Partial ${filename} found in cache`);
    //   return cachedPartials.get(cacheKey);
    // }

    const file = await retrievePartial(filename);

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

          // cachedPartials.set(cacheKey, cleanResult);
          return cleanResult;
        });
    }

    return "";
  }

  async function renderPairedPartial(
    content,
    filenameRaw,
    dataManual,
    templateEngineOverride,
  ) {
    return renderPartial.call(
      this,
      filenameRaw,
      { content, ...dataManual },
      templateEngineOverride,
    );
  }

  // TODO: Check if this works
  eleventyConfig.addAsyncFilter("partialExists", async function (rawFilename) {
    const filename = await retrievePartial(rawFilename);
    return filename !== "";
  });

  eleventyConfig.addAsyncFilter(
    "partialFallback",
    async function (rawFilenames) {
      let filenames;
      if (Array.isArray(rawFilenames) && rawFilenames?.length) {
        filenames = rawFilenames;
      }
      if (typeof rawFilenames === "string") {
        filenames = rawFilenames.split(",").map((f) => f.trim());
      }
      const partialRetrieved = await Promise.all(
        filenames.map(async (f) => {
          return await retrievePartial(f);
        }),
      );
      console.log({ rawFilenames, filenames, partialRetrieved });
      return partialRetrieved.find((f) => f !== "");
    },
  );

  for (const alias of shortcodeAliases) {
    if (typeof alias !== "string") {
      console.warn(`Invalid shortcode alias: ${alias}`);
      continue;
    }
    await eleventyConfig.addAsyncShortcode(alias, renderPartial);
  }
  for (const alias of pairedShortcodeAliases) {
    if (typeof alias !== "string") {
      console.warn(`Invalid shortcode alias: ${alias}`);
      continue;
    }
    await eleventyConfig.addPairedAsyncShortcode(alias, renderPairedPartial);
  }
}
