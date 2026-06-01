import {
  renderStructuredSection,
  renderItemsListInner,
} from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

// Canonical structured shape (mirrors the inline editor component):
//   {
//     header?:        { content, class?, attributes? },
//     items:          [{ content, class?, attributes? }, …],
//     layoutOptions?: { type?: "gap", gap? },
//     class?:         string,  // inner flow class
//     footer?:        { content, class?, attributes? },
//     sectionWrapper?:{ class?, attributes? },
//   }
// Legacy inline mode (`{% sectionFlow %}…{% endsectionFlow %}`) passes
// pre-rendered HTML as `content` and bypasses the structured branch.
export default async function (data) {
  return renderStructuredSection.call(this, data, {
    outerClass: "section-flow",
    renderInner(d) {
      return renderItemsListInner.call(this, {
        items: d?.items,
        itemPartial: "_flowItem",
        wrapperPartial: "_flow",
        wrapperProps: {
          gap: d?.layoutOptions?.gap,
          class: d?.class,
        },
      });
    },
  });
}
