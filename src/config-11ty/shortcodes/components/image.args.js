// Pure arg→attributes computation shared by the build-time `{% image %}`
// shortcode (image.js → eleventy-img html) and the CMS preview stub
// (preview-njk.js imageStub → <img> against manifest/CMS urls). Extracted so
// the class/attr logic (aspect-ratio-*, object-[…], sizes, loading…) can't
// diverge between the site and the preview.
import { removeUndefinedProps } from "../../../utils/objects.js";

export function prepareImageArgs(args = {}) {
  const {
    src: srcRaw,
    alt,
    aspectRatio,
    objectPosition,
    width,
    title,
    loading,
    decoding,
    fetchpriority,
    sizes,
    wrapper,
    class: classNameExplicit,
    id,
    style,
    imgAttributes,
    // Other possible image arguments that could be passed through the `imgAttrs` field in the CMS or manually
    name,
    height,
    srcset,
    crossorigin,
    usemap,
    ismap,
    referrerpolicy,
    draggable,
    hidden,
    tabindex,
    contenteditable,
    dir,
    lang,
    spellcheck,
    // The rest are possibly options to pass as shortcode options
    ...opts
  } = args;

  const otherArgs = removeUndefinedProps({
    name,
    height,
    srcset,
    crossorigin,
    usemap,
    ismap,
    referrerpolicy,
    draggable,
    hidden,
    tabindex,
    contenteditable,
    dir,
    lang,
    spellcheck,
  });

  const wrapperTag = wrapper ? wrapper.split(" ")[0] : "";
  // TODO: Allow defining a wrapping tag??
  //
  // TODO: If we have some 'full-bleed' class on the image, we need sizes to be "100vw"?? We might want to account for a max bleed nonetheless

  const className = [
    classNameExplicit,
    imgAttributes?.class,
    aspectRatio && `aspect-ratio-${aspectRatio}`,
    objectPosition && `object-[${objectPosition.trim().replace(" ", "_")}]`,
  ]
    .filter(Boolean)
    .join(" ");

  // Attributes destined for the <img> element — merged into
  // htmlOptions.imgAttributes by the build, emitted verbatim by the preview.
  const computedImgAttributes = removeUndefinedProps({
    ...(imgAttributes || {}),
    "eleventy:ignore": "",
    alt,
    title,
    loading,
    decoding,
    fetchpriority: fetchpriority || (loading === "eager" ? "high" : undefined),
    sizes: sizes || (width ? `${width}px` : undefined),
    class: className || undefined,
    id,
    style,
    ...otherArgs,
  });

  return {
    srcRaw,
    width,
    widths: width ? [width, width * 2] : undefined,
    fallback: width ? "smallest" : undefined,
    wrapperTag,
    imgAttributes: computedImgAttributes,
    opts,
  };
}
