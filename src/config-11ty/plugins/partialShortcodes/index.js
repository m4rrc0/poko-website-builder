// import { DEBUG } from "../../../../env.config.js";

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  const partialShortcodeFn = eleventyConfig.nunjucks.asyncShortcodes.partial;
  const renderContentFilterFn = eleventyConfig.universal.filters.renderContent;
<<<<<<< HEAD
  // const renderTemplateShortcodeFn = eleventyConfig.nunjucks.tags.renderTemplate;
  // const renderMd = eleventyConfig.universal.filters.md;
  // const safeFilterFn = eleventyConfig.universal;

  async function renderNamedPartial(
    partialName,
    content,
    dataManual,
    templateEngineOverride,
  ) {
    const contentTrimmed = content.trim();
    const contentRendered = contentTrimmed
      ? await renderContentFilterFn.call(this, contentTrimmed, "njk,md", dataManual)
=======
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
>>>>>>> origin/features-nav-menu
      : "";

    return partialShortcodeFn.call(
      this,
<<<<<<< HEAD
      partialName,
      {
        content: contentRendered,
        // content,
=======
      "grid",
      {
        content: contentRendered,
>>>>>>> origin/features-nav-menu
        ...dataManual,
      },
      templateEngineOverride,
    );
  }

<<<<<<< HEAD
  // prettier-ignore
  for (const partialName of ["sectionGrid", "grid", "sectionHeader", "gridItem", "sectionFooter"]) {
    await eleventyConfig.addPairedAsyncShortcode(partialName, async function(content, dataManual, templateEngineOverride) {
      return renderNamedPartial.call(this, `_${partialName}`, content, dataManual, templateEngineOverride);
    });
  }
=======
  async function renderComp(content) {
    return `
<div class="comp">
${content}
</div>
`;
  }

  await eleventyConfig.addPairedAsyncShortcode("comp", renderComp);
  await eleventyConfig.addPairedAsyncShortcode("grid", renderGrid);
>>>>>>> origin/features-nav-menu
}
