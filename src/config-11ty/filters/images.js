import Image from "@11ty/eleventy-img";
import { imageOptionsDefaults } from "../plugins/imageTransform.js";
import { WORKING_DIR, OUTPUT_DIR, BASE_URL } from "../../../env.config.js";

const ogOptions = {
  // ...imageOptionsDefaults,
  returnType: "object",
  ...(WORKING_DIR.startsWith("../") ? { transformOnRequest: false } : {}),
  outputDir: `./${OUTPUT_DIR}/assets/images/`,
  urlPath: "/assets/images/",
  formats: ["jpeg", "auto"],
  widths: [1200],
  transform: (sharp) => {
    sharp.resize(1200, 630);
  },
};

export async function ogImageSrc(input, eleventyConfig) {
  const src = `${WORKING_DIR}/${input}`;
  const stats = await Image(src, ogOptions);
  const imgMatch = stats.png?.[0] || stats.jpeg?.[0];
  const url = imgMatch?.url ? `${BASE_URL}${imgMatch.url}` : null;

  return url;
}

export async function image(input, localOpts = {}) {
  const widths = localOpts.width
    ? [localOpts.width]
    : imageOptionsDefaults.widths;
  const sizes =
    widths.map((width) => `(max-width: ${width}px) ${width}px`).join(", ") +
    ", 100vw";
  const statsOptions = {
    ...imageOptionsDefaults,
    ...localOpts,
    ...(localOpts.width
      ? {
          widths: [localOpts.width],
          htmlOptions: {
            ...imageOptionsDefaults.htmlOptions,
            ...localOpts?.htmlOptions,
            imgAttributes: {
              ...imageOptionsDefaults.htmlOptions.imgAttributes,
              ...localOpts?.htmlOptions?.imgAttributes,
              sizes,
            },
          },
        }
      : {}),
    // returnType: "object",
    // ...(WORKING_DIR.startsWith("../") ? { transformOnRequest: false } : {}),
    // outputDir: `./${OUTPUT_DIR}/assets/images/`,
    // urlPath: "/assets/images/",
    // formats: ["jpeg", "auto"],
  };

  const src = `${WORKING_DIR}/${input}`;
  const stats = await Image(src, statsOptions);
  const html = await Image(src, { ...statsOptions, returnType: "html" });

  // console.log({
  //   input,
  //   localOpts,
  //   src,
  //   stats,
  //   webp: stats.webp?.[0],
  //   eleventyImg: stats.eleventyImage,
  //   eleventyImgAttributes: stats.eleventyImage.htmlOptions.imgAttributes,
  //   html,
  // });

  return { ...stats, html };
}
