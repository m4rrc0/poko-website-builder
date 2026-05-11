import path from "node:path";
import fs from "node:fs";
import {
  OUTPUT_DIR,
  WORKING_DIR,
  brandWidthsContexts,
  brandTypeScales,
  IMAGES_OUTPUT_DIR,
  IMAGE_CACHE_DIR,
} from "../../../env.config.js";

const outputDir = `${IMAGES_OUTPUT_DIR}`;

// Utility to parse a CSS dimension string into value and unit
function parseCssDimension(cssValue) {
  const match = String(cssValue).match(/^([\d.]+)\s*([a-z%]+)?$/i);
  if (!match) return { value: parseFloat(cssValue) || 0, unit: "" };
  return {
    value: parseFloat(match[1]),
    unit: match[2] || "",
  };
}
// Convert a CSS dimension to pixels
function toPx(cssValue, pxPerRem = 16) {
  const { value, unit } = parseCssDimension(cssValue);

  switch (unit.toLowerCase()) {
    case "px":
      return value;
    case "rem":
    case "em":
      return value * pxPerRem;
    // Add more units as needed (e.g., 'vw', 'vh', 'pt', etc.)
    default:
      return value; // Assume px if no unit
  }
}

const defaultMaxWidthInRem = "80.9rem";
const defaultMaxPxPerRem = 16;

const maxPxPerRem = Math.max(
  ...(brandTypeScales.length ? brandTypeScales : [defaultMaxPxPerRem]).map(
    (scale) => scale?.vars?.maxFontSize || defaultMaxPxPerRem,
  ),
);

const maxWidthInPx = (
  brandWidthsContexts.length ? brandWidthsContexts : [{}]
).map((context) => {
  return context?.vars?.max
    ? toPx(context?.vars?.max, maxPxPerRem)
    : toPx(defaultMaxWidthInRem, maxPxPerRem);
})[0];

export const imageOptionsDefaults = {
  // Only optimize images when they are requested in the browser.
  // transformOnRequest: false, // General default
  // transformOnRequest: process.env.ELEVENTY_RUN_MODE === "serve" // (default for HTML Transform and WebC component)
  // TODO: Need to deactivate this when InputDir is outside of the project root. Should investigate if this is recognized as a bug
  ...(WORKING_DIR.startsWith("../") ? { transformOnRequest: false } : {}),

  // Project-relative path to the output image directory
  // outputDir: "./img/", // (default)
  // outputDir: IMAGES_OUTPUT_DIR, // This is where we would actually want to output images
  outputDir: IMAGE_CACHE_DIR,
  // A path-prefix-esque directory for the <img src> attribute.
  // Not recommended with Image HTML Transform
  urlPath: "/assets/images/",

  // optional, output image formats
  // formats: ["webp", "jpeg"], // Default
  // Our guess is that we gat either a jpg or png and keep the format with auto but use webp first (as webp supports alpha.)
  // Note: Avif = +1 Build cost
  // formats: ["avif", "webp", "auto"],
  formats: ["webp", "auto"],

  // Skip raster formats if SVG
  svgShortCircuit: true,

  // optional, output image widths
  // widths: ["auto"],
  widths: [480, 768, 1280, 2560, "auto"],

  // optional, attributes assigned on <img> override these values.
  // defaultAttributes: {
  // 	loading: "lazy",
  // 	decoding: "async",
  // 	sizes: "100vw",
  // },

  failOnError: false,

  // optional, attributes assigned on <img> nodes override these values
  htmlOptions: {
    imgAttributes: {
      alt: "", // required
      loading: "lazy",
      decoding: "async",
      // NOTE: Not really what I want. srcset is already taking care of choosing the right image based on screen size.
      // sizes:
      //   "(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1280px) 1280px, (max-width: 2560px) 2560px, 100vw",
      // NOTE: instead, retrieve the current site's full width and set it up like this: `(max-width: ${maxWidthInPx}px) 100vw, ${maxWidthInPx}px`
      sizes: `(max-width: ${maxWidthInPx}px) 100vw, ${maxWidthInPx}px`,
    },

    // HTML attributes added to `<picture>` (omitted when <img> used)
    pictureAttributes: {},

    // Which source to use for `<img width height src>` attributes (when multiple img definitions)
    // Should keep "largest" I think, or we'll take the smallest when creating responsive images
    fallback: "largest", // or "smallest"
  },
};

export const imageTransformOptions = {
  ...imageOptionsDefaults,
  // which file extensions to process
  extensions: "html", // Default
};
