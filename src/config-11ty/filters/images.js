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

  return { url, stats };
}

export async function image(input, localOptsRaw = {}) {
  const { width, ...localOpts } = localOptsRaw;
  const widths = width
    ? [width]
    : localOpts.widths || imageOptionsDefaults.widths;
  const sizes =
    widths.map((width) => `(max-width: ${width}px) ${width}px`).join(", ") +
    ", 100vw";
  const statsOptions = {
    ...imageOptionsDefaults,
    ...localOpts,
    widths,
    ...(width
      ? {
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

export async function imgStats(input, localOpts = {}) {
  const statsOptions = {
    formats: ["auto"],
    widths: ["auto"],
    ...localOpts,
  };

  const { html, ...rawStats } = await image(input, statsOptions);
  let stats = { ...rawStats };
  for (const ext of Object.keys(stats)) {
    if (stats[ext].length < 2) {
      stats[ext] = stats[ext][0];
    }
  }
  if (Object.keys(stats).length < 2) {
    stats = Object.values(stats)[0];
  }

  return { ...stats, html };
}
