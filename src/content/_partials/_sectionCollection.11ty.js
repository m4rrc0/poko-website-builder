import {
  COLLECTION_EMPTY_MARKER,
  renderStructuredSection,
} from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

// Canonical structured shape (mirrors the inline editor component):
//   {
//     header?:                { content, class?, attributes? },
//     collection:             string,  // e.g. "all", "pages", "articles"
//     sortAndFilterOptions?:  { sortCriterias?, filters?, exclusions?,
//                               keepVisible? },
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
//
// When the filtered collection ends up empty, `_collection` emits
// `COLLECTION_EMPTY_MARKER` unless `sortAndFilterOptions.keepVisible` is set.
// Seeing that marker we drop the whole section — header and footer included.
export default async function (data) {
  // Inline mode: the body is already rendered upstream, so the marker (if any)
  // is somewhere inside `content`.
  if (data?.content) {
    return data.content.includes(COLLECTION_EMPTY_MARKER)
      ? ""
      : renderStructuredSection.call(this, data, {
          outerClass: "section-collection",
          renderInner: () => "",
        });
  }

  const inner = await this.partial.call(this, "_collection", {
    collections: data?.collections,
    lang: data?.lang,
    collection: data?.collection,
    sortCriterias: data?.sortAndFilterOptions?.sortCriterias,
    filters: data?.sortAndFilterOptions?.filters,
    exclusions: data?.sortAndFilterOptions?.exclusions,
    keepVisible: data?.sortAndFilterOptions?.keepVisible,
    type: data?.layoutOptions?.type,
    gap: data?.layoutOptions?.gap,
    widthWrap: data?.layoutOptions?.widthWrap,
    columns: data?.layoutOptions?.columns,
    widthColumnMin: data?.layoutOptions?.widthColumnMin,
    widthColumnMax: data?.layoutOptions?.widthColumnMax,
    itemWidth: data?.layoutOptions?.itemWidth,
    height: data?.layoutOptions?.height,
    noBar: data?.layoutOptions?.noBar,
    class: data?.class,
    itemPartial: data?.itemPartial,
  });

  if (inner.includes(COLLECTION_EMPTY_MARKER)) return "";

  return renderStructuredSection.call(this, data, {
    outerClass: "section-collection",
    renderInner: () => inner,
  });
}
