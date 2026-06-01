import {
  renderStructuredSection,
  renderAreasInner,
} from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

// Canonical structured shape (mirrors the inline editor component):
//   {
//     header?:        { content, class?, attributes? },
//     areas:          [ { type, ...areaSpecificFields }, … ],
//     footer?:        { content, class?, attributes? },
//     sectionWrapper?:{ class?, attributes? },
//   }
//
// Supported area `type`s: "areaRaw", "twoColumns", "grid", "flow", "reel",
// "collection" (and the parser-only "area" alias). See `renderAreasInner`
// in render-structured-section.js for the per-type mapping.
//
// Legacy inline mode (`{% sectionBuilder %}…{% endsectionBuilder %}`)
// passes pre-rendered HTML as `content` and bypasses the structured branch.
export default async function (data) {
  return renderStructuredSection.call(this, data, {
    outerClass: "section-builder",
    renderInner(d) {
      return renderAreasInner.call(this, {
        areas: d?.areas,
        // Forwarded from the page-level data cascade so the "collection"
        // area variant can call `_collection` without losing context.
        collections: d?.collections,
        lang: d?.lang,
      });
    },
  });
}
