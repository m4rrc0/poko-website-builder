import {
  renderStructuredSection,
  renderItemsListInner,
} from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

// Helpers below are invoked with `.call(this, …)` to flow the 11ty render
// context through unchanged — same pattern 11ty uses for shortcodes.

// Canonical structured shape (mirrors the inline editor component):
//   {
//     header?:        { content, class?, attributes? },
//     items:          [{ content, class?, attributes? }, …],
//     layoutOptions?: { type?: "switcher"|"grid-fluid"|"cluster",
//                       widthWrap?, gap?, columns? },
//     class?:         string,  // inner grid class
//     footer?:        { content, class?, attributes? },
//     sectionWrapper?:{ class?, attributes? },
//   }
// Legacy inline mode (`{% sectionGrid %}…{% endsectionGrid %}`) passes
// pre-rendered HTML as `content` and bypasses the structured branch.
export default async function (data) {
  return renderStructuredSection.call(this, data, {
    outerClass: "section-grid",
    renderInner(d) {
      return renderItemsListInner.call(this, {
        items: d?.items,
        itemPartial: "_gridItem",
        wrapperPartial: "_grid",
        wrapperProps: {
          type: d?.layoutOptions?.type,
          gap: d?.layoutOptions?.gap,
          widthWrap: d?.layoutOptions?.widthWrap,
          columns: d?.layoutOptions?.columns,
          class: d?.class,
        },
      });
    },
  });
}
