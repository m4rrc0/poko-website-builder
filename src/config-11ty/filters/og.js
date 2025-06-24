import Image from "@11ty/eleventy-img";
import { imageTransformOptions } from "../plugins/imageTransform.js";
import { WORKING_DIR, OUTPUT_DIR } from "../../../env.config.js";

const options = {
  // ...imageTransformOptions,
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
  let src = `${WORKING_DIR}/${input}`;
  let stats = await Image(src, options);
  const imgMatch = stats.png?.[0] || stats.jpeg?.[0];
  const url = imgMatch?.url;

  return url;
}
