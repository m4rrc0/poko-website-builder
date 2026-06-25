import Image from "@11ty/eleventy-img";
import deepmerge from "deepmerge";
import { removeUndefinedProps } from "../../../utils/objects.js";
import { imageTransformOptions } from "../../plugins/imageTransform.js";
import { WORKING_DIR } from "../../../../env.config.js";

export async function image(args) {
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

  let wrapperTag = wrapper ? wrapper.split(" ")[0] : "";
  // wrapperTag = wrapperTag || (width ? "p" : "");
  // TODO: compute sizes from widths
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

  const options = deepmerge.all(
    [
      imageTransformOptions,
      {
        returnType: "html",
        // ...(width && { width }),
        ...(width && { widths: [width, width * 2] }),
        htmlOptions: {
          imgAttributes: {
            ...(imgAttributes || {}),
            "eleventy:ignore": "",
            ...(alt && { alt }),
            ...(title && { title }),
            ...(loading && { loading }),
            ...(decoding && { decoding }),
            ...((fetchpriority || loading === "eager") && {
              fetchpriority: fetchpriority || "high",
            }),
            ...(width && { sizes: null }), // TODO: right?
            ...(sizes && { sizes }),
            ...(className && { class: className }),
            ...(id && { id }),
            ...((width && {
              style: `inline-size:${width}px;${style || ""}`,
            }) ||
              (style && { style })),
            // ...(style && { style }),
            ...otherArgs,
          },
        },
      },
      opts,
    ],
    { arrayMerge: (destinationArray, sourceArray, options) => sourceArray },
  );

  if (!srcRaw) {
    return "<div>Please provide an image source</div>";
  }
  const src = srcRaw.startsWith("/")
    ? `${WORKING_DIR}/${srcRaw}`.replace(/\/+/g, "/")
    : srcRaw;
  let html = await Image(src, options);
  html = width
    ? html.replace(`${width}w`, "1x").replace(`${width * 2}w`, "2x")
    : html;
  // console.log({ html });

  // return `<p>${html}</p>`;
  return wrapperTag ? `<${wrapperTag}>${html}</${wrapperTag}>` : html;
}
