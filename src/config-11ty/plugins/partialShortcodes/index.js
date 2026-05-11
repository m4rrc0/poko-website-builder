// import { DEBUG } from "../../../../env.config.js";

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  const partialShortcodeFn = eleventyConfig.universal.shortcodes.partial;
  const renderContentFilterFn = eleventyConfig.universal.filters.renderContent;
  // const renderTemplateShortcodeFn = eleventyConfig.nunjucks.tags.renderTemplate;
  // const renderMd = eleventyConfig.universal.filters.md;
  // const safeFilterFn = eleventyConfig.universal;

  async function renderNamedPartial(
    partialName,
    content,
    dataManual,
    templateEngineOverride,
  ) {
    const contentTrimmed = typeof content === "string" ? content.trim() : "";
    const contentRendered = contentTrimmed
      ? await renderContentFilterFn.call(
          this,
          contentTrimmed,
          "njk,md",
          dataManual,
        )
      : "";

    return partialShortcodeFn.call(
      this,
      partialName,
      {
        content: contentRendered,
        // content,
        ...dataManual,
      },
      templateEngineOverride,
    );
  }

  // prettier-ignore
  for (const partialName of [
    "wrapper",
    "sectionHeader",
    "sectionFooter",
    "sectionFlow",
    "flow",
    "flowItem",
    "sectionGrid",
    "grid",
    "gridItem",
    "sectionTwoColumns",
    "twoColumns",
    "twoColumnsItem",
    "sectionCollection",
    "collection",
    "collectionWrapper",
    "collectionItem",
    "sectionReel",
    "reel",
    "reelItem",
    "sectionBuilder",
    "area",
    "areaRaw",
  ]) {
    await eleventyConfig.addPairedAsyncShortcode(partialName, async function(content, dataManual, templateEngineOverride) {
      return renderNamedPartial.call(this, `_${partialName}`, content, dataManual, templateEngineOverride);
    });
  }
}
