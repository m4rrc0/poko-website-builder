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
      ? await renderContentFilterFn.call(this, contentTrimmed, "njk,md", {
          ...this.ctx,
          ...dataManual,
        })
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
  const sectionPartialNames = [
    "sectionRaw",
    "sectionHeader",
    "sectionFooter",
    "sectionFlow",
    "sectionGrid",
    "sectionTwoColumns",
    "sectionCollection",
    "sectionReel",
    "sectionBuilder",
  ];

  // prettier-ignore
  const otherPartialNames = [
    "wrapper",
    "flow",
    "flowItem",
    "grid",
    "gridItem",
    "twoColumns",
    "twoColumnsItem",
    "collectionWrapper",
    "collectionItem",
    "reel",
    "reelItem",
    "area",
    "areaRaw",
  ];

  for (const partialName of [...sectionPartialNames, ...otherPartialNames]) {
    await eleventyConfig.addPairedAsyncShortcode(
      partialName,
      async function (content, dataManual, templateEngineOverride) {
        return renderNamedPartial.call(
          this,
          `_${partialName}`,
          content,
          dataManual,
          templateEngineOverride,
        );
      },
    );
  }

  // `collection` is registered separately so its inner content is passed RAW
  // (not pre-rendered in the parent context). The `_collection` partial renders
  // it once per item with `item` in scope, enabling per-item templating like:
  //   {% collection collection="pages" %}<li>{{ item.title }}</li>{% endcollection %}
  await eleventyConfig.addPairedAsyncShortcode(
    "collection",
    async function (content, dataManual, templateEngineOverride) {
      return partialShortcodeFn.call(
        this,
        "_collection",
        {
          content: typeof content === "string" ? content : "",
          ...dataManual,
        },
        templateEngineOverride,
      );
    },
  );

  // Frontmatter-driven sections: `{% sections %}…{% endsections %}` dispatches
  // each item in `ctx.sections` to its matching `_${type}` partial, with the
  // same content-rendering semantics as the inline paired shortcodes above.
  // Registered as a *paired* shortcode (inner content is ignored) because
  // Nunjucks fails to parse zero-arg non-paired shortcode tags like
  // `{% sections %}` (`SyntaxError: Unexpected token ','` in generated code).
  await eleventyConfig.addPairedAsyncShortcode(
    "sections",
    async function (_ignoredContent) {
      const items = this.ctx?.sections;
      if (!Array.isArray(items) || items.length === 0) return "";

      const rendered = await Promise.all(
        items.map(async (section, index) => {
          if (!section || typeof section !== "object") return "";
          const { type, content, ...dataManual } = section;
          if (!type) {
            console.warn(`sections[${index}] is missing a "type"; skipping.`);
            return "";
          }
          return renderNamedPartial.call(
            this,
            `_${type}`,
            content ?? "",
            dataManual,
          );
        }),
      );

      return rendered.join("\n");
    },
  );
}
