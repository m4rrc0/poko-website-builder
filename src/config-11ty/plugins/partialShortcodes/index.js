import {
  sectionPartialNames,
  otherPartialNames,
  makePartialHandlers,
} from "./handlers.js";

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  const partialShortcodeFn = eleventyConfig.universal.shortcodes.partial;
  const renderContentFilterFn = eleventyConfig.universal.filters.renderContent;

  // Handler bodies are shared with the CMS preview (handlers.js) — the build
  // just injects Eleventy's real partial/renderContent implementations.
  const { named, collection, sections } = makePartialHandlers({
    renderPartial: partialShortcodeFn,
    renderContent: renderContentFilterFn,
  });

  for (const partialName of [...sectionPartialNames, ...otherPartialNames]) {
    await eleventyConfig.addPairedAsyncShortcode(
      partialName,
      named(partialName),
    );
  }
  await eleventyConfig.addPairedAsyncShortcode("collection", collection);
  await eleventyConfig.addPairedAsyncShortcode("sections", sections);
}
