import { renderStructuredSection } from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

// Canonical structured shape (mirrors the inline editor component):
//   {
//     header?:                { content, class?, attributes? },
//     collection:             string,  // e.g. "all", "pages", "articles"
//     sortAndFilterOptions?:  { sortCriterias?, filters?, exclusions? },
//     layoutOptions?:         { type?, gap?, widthWrap?, columns?,
//                               itemWidth?, height?, noBar? },
//     class?:                 string,  // inner collection class
//     itemPartial?:           string,  // optional custom item partial slug
//     footer?:                { content, class?, attributes? },
//     sectionWrapper?:        { class?, attributes? },
//   }
// The inner layout body is rendered by the existing `_collection` partial,
// which handles sort/filter/exclusion application and per-item rendering.
//
// IMPORTANT: `collections` and `lang` must be forwarded explicitly from the
// `data` function argument (NOT from `this.ctx`). When this partial is
// rendered via the universal `partial` / `renderFile` shortcode, the page's
// global data cascade is exposed to us only through `data` — `this.ctx`
// inside the nested template does not inherit the caller's page-level ctx,
// so a downstream `this.partial(...)` call would lose `collections`.
export default async function (data) {
  return renderStructuredSection.call(this, data, {
    outerClass: "section-collection",
    renderInner(d) {
      return this.partial.call(this, "_collection", {
        collections: d?.collections,
        lang: d?.lang,
        collection: d?.collection,
        sortCriterias: d?.sortAndFilterOptions?.sortCriterias,
        filters: d?.sortAndFilterOptions?.filters,
        exclusions: d?.sortAndFilterOptions?.exclusions,
        type: d?.layoutOptions?.type,
        gap: d?.layoutOptions?.gap,
        widthWrap: d?.layoutOptions?.widthWrap,
        columns: d?.layoutOptions?.columns,
        widthColumnMin: d?.layoutOptions?.widthColumnMin,
        widthColumnMax: d?.layoutOptions?.widthColumnMax,
        itemWidth: d?.layoutOptions?.itemWidth,
        height: d?.layoutOptions?.height,
        noBar: d?.layoutOptions?.noBar,
        class: d?.class,
        itemPartial: d?.itemPartial,
      });
    },
  });
}
