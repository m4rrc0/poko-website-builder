import path from "node:path";
import {
  defineConfig,
  // presetAttributify,
  // presetIcons,
  // presetTypography,
  // presetWebFonts,
  // transformerDirectives,
  // transformerVariantGroup
  // presetWebFonts
} from "unocss";
import { createLocalFontProcessor } from "@unocss/preset-web-fonts/local";
import { CACHE_DIR, brandConfig, brandStyles } from "../../../../env.config.js";
import { buildUnoConfig } from "./uno.config.base.js";

const computedConfig = defineConfig(
  buildUnoConfig({
    brandConfig,
    brandStyles,
    fontsProcessors: createLocalFontProcessor({
      // cacheDir: ".cache/unocss/fonts", // Directory to cache the fonts
      cacheDir: path.join(CACHE_DIR, "/unocss/fonts"), // Directory to cache the fonts
      fontAssetsDir: "dist/assets/fonts", // Directory to save the fonts assets
      fontServeBaseUrl: "/assets/fonts", // Base URL to serve the fonts from the client
      // fetch: async (url) => {
      //   console.log({ url });
      //   return fetch(url);
      // }, // Custom fetch function to download the fonts
    }),
  }),
);

const webFontsPreset = computedConfig.presets.find(
  (preset) => preset.name === "@unocss/preset-web-fonts",
);
const fontsPreflights = webFontsPreset
  ? (await Promise.all(webFontsPreset.preflights.map((p) => p.getCSS()))).join(
      "\n",
    )
  : "";
const fontUrls = [
  ...new Map(
    [
      ...fontsPreflights.matchAll(
        /url\(([^)]+)\)\s+format\(['"]?([^'")\s]+)['"]?\)/g,
      ),
    ].map((match) => [match[1], { url: match[1], format: match[2] }]),
  ).values(),
];
export const fontPreloadTags = fontUrls
  .map(
    ({ url, format }) =>
      `<link rel="preload" href="${url}" as="font" type="font/${format}" crossorigin>`,
  )
  .join("\n");

// <link rel="preload" href="/assets/Pacifico-Bold.woff2" as="font" type="font/woff2" crossorigin>

export default computedConfig;
