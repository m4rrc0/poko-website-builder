import {
  renderStructuredSection,
  renderItemsListInner,
} from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

// Canonical structured shape (mirrors the inline editor component):
//   {
//     header?:        { content, class?, attributes? },
//     items:          [{ content, class?, attributes? }, …],
//     layoutOptions?: { type?: "reel", itemWidth?, height?, gap?, noBar? },
//     class?:         string,  // inner reel class
//     footer?:        { content, class?, attributes? },
//     sectionWrapper?:{ class?, attributes? },
//   }
// Legacy inline mode (`{% sectionReel %}…{% endsectionReel %}`) passes
// pre-rendered HTML as `content` and bypasses the structured branch.
export default async function (data) {
  return renderStructuredSection.call(this, data, {
    outerClass: "section-reel",
    renderInner(d) {
      return renderItemsListInner.call(this, {
        items: d?.items,
        itemPartial: "_reelItem",
        wrapperPartial: "_reel",
        wrapperProps: {
          type: d?.layoutOptions?.type,
          gap: d?.layoutOptions?.gap,
          itemWidth: d?.layoutOptions?.itemWidth,
          height: d?.layoutOptions?.height,
          noBar: d?.layoutOptions?.noBar,
          class: d?.class,
        },
      });
    },
  });
}
