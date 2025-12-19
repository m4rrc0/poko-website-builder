import Image from "@11ty/eleventy-img";
import deepmerge from "deepmerge";
import { imageTransformOptions } from "../../plugins/imageTransform.js";
import { WORKING_DIR } from "../../../../env.config.js";

export async function image(args) {
  const {
    src: srcRaw,
    alt,
    aspectRatio,
    width,
    title,
    loading,
    decoding,
    sizes,
    wrapper,
    class: className,
    style,
    imgAttributes,
    ...opts
  } = args;
  let wrapperTag = wrapper ? wrapper.split(" ")[0] : "";
  // wrapperTag = wrapperTag || (width ? "p" : "");
  // TODO: compute sizes from widths
  // TODO: Allow defining a wrapping tag??
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
            ...(sizes && { sizes }),
            ...((aspectRatio && {
              class: `${className || imgAttributes?.class || ""} aspect-ratio-${aspectRatio}`,
            }) ||
              className ||
              (imgAttributes?.class && {
                class: className || imgAttributes?.class || "",
              })),
            // ...((width && { style: `max-width:${width}px;${style || ""}` }) ||
            //   (style && { style })),
            ...(style && { style }),
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
