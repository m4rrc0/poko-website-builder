import {
  renderStructuredSection,
  renderColumnsPairInner,
} from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

// Canonical structured shape (mirrors the inline editor component):
//   {
//     header?:        { content, class?, attributes? },
//     itemLeft:       { content, class?, attributes? },
//     itemRight:      { content, class?, attributes? },
//     layoutOptions?: { type?: "switcher"|"fixedFluid",
//                       widthWrap?, gap?, fixedSide?,
//                       widthFixed?, widthFluidMin? },
//     class?:         string,  // inner two-columns class
//     footer?:        { content, class?, attributes? },
//     sectionWrapper?:{ class?, attributes? },
//   }
// Legacy inline mode (`{% sectionTwoColumns %}…{% endsectionTwoColumns %}`)
// passes pre-rendered HTML as `content` and bypasses the structured branch.
export default async function (data) {
  return renderStructuredSection.call(this, data, {
    outerClass: "section-two-columns",
    renderInner(d) {
      return renderColumnsPairInner.call(this, {
        itemLeft: d?.itemLeft,
        itemRight: d?.itemRight,
        itemPartial: "_twoColumnsItem",
        wrapperPartial: "_twoColumns",
        wrapperProps: {
          type: d?.layoutOptions?.type,
          gap: d?.layoutOptions?.gap,
          widthWrap: d?.layoutOptions?.widthWrap,
          fixedSide: d?.layoutOptions?.fixedSide,
          widthFixed: d?.layoutOptions?.widthFixed,
          widthFluidMin: d?.layoutOptions?.widthFluidMin,
          class: d?.class,
        },
      });
    },
  });
}
