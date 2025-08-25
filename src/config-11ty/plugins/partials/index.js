import path from "node:path";
import fglob from "fast-glob";
// import deepmerge from "deepmerge";

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
    templateEngineOverride
  ) {
    // const data = deepmerge(this.ctx, dataManual);
    const data = { ...this.ctx, ...dataManual };

    const filename = path.join(filenameRaw);

    const isFullPath = dirs.some((dir) => filename.startsWith(dir));
    // If the path provided already specifies a directory, use it
    if (isFullPath) {
      return await renderFileShortcodeFn
        .call(this, filename, data, templateEngineOverride)
        .catch((e) => {
          console.error(e);
          return "";
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
        });
    }

    console.warn(`Partial "${filename}" not found in "${dirs}"`);

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
