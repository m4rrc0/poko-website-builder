// import { DEBUG } from "../../../../env.config.js";

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  const partialShortcodeFn = eleventyConfig.nunjucks.asyncShortcodes.partial;
  const renderContentFilterFn = eleventyConfig.universal.filters.renderContent;
  const renderTemplateShortcodeFn = eleventyConfig.nunjucks.tags.renderTemplate;
  // const safeFilterFn = eleventyConfig.universal;

  console.log({
    // safeFilterFn,
    renderContentFilterFn,
    renderTemplateShortcodeFn,
  });

  async function renderGrid(content, dataManual, templateEngineOverride) {
    let contentRendered = content
      ? await renderContentFilterFn.call(this, content, "njk,md", {})
      : "";

    return partialShortcodeFn.call(
      this,
      "grid",
      {
        content: contentRendered,
        ...dataManual,
      },
      templateEngineOverride,
    );
  }

  async function renderComp(content) {
    return `
<div class="comp">
${content}
</div>
`;
  }

  await eleventyConfig.addPairedAsyncShortcode("comp", renderComp);
  await eleventyConfig.addPairedAsyncShortcode("grid", renderGrid);
}
