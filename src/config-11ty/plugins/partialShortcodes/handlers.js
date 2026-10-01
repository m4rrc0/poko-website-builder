// Shared between the build plugin (index.js) and the CMS preview nunjucks
// env (cms-config/preview/preview-njk.js): the paired-shortcode names and
// the handlers that dispatch them to `_*` partials. Both sides register the
// same tags — define them once here so the preview cannot drift from the
// real pipeline.
//
// `deps.renderPartial`/`deps.renderContent` are always invoked
// `.call(this, …)` so the shortcode context (`this.ctx`, `this._helpers`…)
// flows through — pass plain functions, never arrows bound to the wrong
// `this`. The build passes Eleventy's universal `partial` shortcode and
// `renderContent` filter; the preview passes its own equivalents.

export const sectionPartialNames = [
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

export const otherPartialNames = [
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

export const makePartialHandlers = ({ renderPartial, renderContent }) => {
  // Paired shortcode body → render inner content, then wrap it in the named
  // `_*` partial (`{% sectionGrid %}…{% endsectionGrid %}` → `_sectionGrid`).
  const renderNamedPartial = async function (
    partialName,
    content,
    dataManual,
    templateEngineOverride,
  ) {
    const contentTrimmed = typeof content === "string" ? content.trim() : "";
    const contentRendered = contentTrimmed
      ? await renderContent.call(this, contentTrimmed, "njk,md", {
          ...this.ctx,
          ...dataManual,
        })
      : "";
    return renderPartial.call(
      this,
      partialName,
      { content: contentRendered, ...dataManual },
      templateEngineOverride,
    );
  };

  return {
    renderNamedPartial,

    // {% wrapper %}…{% endwrapper %} → `_wrapper` partial, etc.
    named: (partialName) =>
      async function (content, dataManual, templateEngineOverride) {
        return renderNamedPartial.call(
          this,
          `_${partialName}`,
          content,
          dataManual,
          templateEngineOverride,
        );
      },

    // `collection` is registered separately so its inner content is passed
    // RAW (not pre-rendered in the parent context). The `_collection` partial
    // renders it once per item with `item` in scope, enabling per-item
    // templating like:
    //   {% collection collection="pages" %}<li>{{ item.title }}</li>{% endcollection %}
    collection: async function (content, dataManual, templateEngineOverride) {
      return renderPartial.call(
        this,
        "_collection",
        {
          content: typeof content === "string" ? content : "",
          ...dataManual,
        },
        templateEngineOverride,
      );
    },

    // Frontmatter-driven sections: dispatches each item in `ctx.sections` to
    // its matching `_${type}` partial, with the same content-rendering
    // semantics as the inline paired shortcodes above. Registered as a
    // *paired* shortcode (inner content is ignored) because Nunjucks fails to
    // parse zero-arg non-paired shortcode tags like `{% sections %}`
    // (`SyntaxError: Unexpected token ','` in generated code).
    sections: async function (_ignoredContent) {
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
  };
};
