import path from "node:path";
import {
  defineConfig,
  // presetAttributify,
  // presetIcons,
  // presetTypography,
  // presetWebFonts,
  presetWind4,
  // transformerDirectives,
  // transformerVariantGroup
  // presetWebFonts
} from "unocss";
import presetWebFonts from "@unocss/preset-web-fonts";
import { createLocalFontProcessor } from "@unocss/preset-web-fonts/local";
// import presetWind4 from '@unocss/preset-wind4'
import layoutRules from "./rules/ctx-layouts.js";
import utilitiesRules from "./rules/ctx-utilities.js";
import atomsRules from "./rules/ctx-atoms.js";

import { CACHE_DIR, brandConfig, brandStyles } from "../../../../env.config.js";

// Some Wind4 rules are colliding with our own rules
const presetWind4mod = presetWind4({
  preflights: {
    reset: false,
    // theme: false,
  },
});
const hRegexCollides = /^(?:size-)?(min-|max-)?([wh])-?(.+)$/;
// Force '-' between w or h and the number or attribute. E.g. h-10 not h10
// To avoid collision with our own rules for heading styles .h1, .h6, .h000, .h8
const hRegexReplacement = /^(?:size-)?(min-|max-)?([wh])-(.+)$/;
const modRuleIndex = presetWind4mod.rules.findIndex(
  (ruleArr) => ruleArr[0].source === hRegexCollides.source,
);
presetWind4mod.rules[modRuleIndex][0] = hRegexReplacement;

const fontStacksContexts = brandConfig?.fontStacksContexts;
let customFontsInUse = [];
// List custom fonts that are used in a stack
for (const fontStackContext of fontStacksContexts) {
  const stacks = Object.values(fontStackContext || {});
  for (const stack of stacks) {
    if (stack?.custom) {
      customFontsInUse.push(stack?.custom);
    }
  }
}

const customFontsImportObj = Object.fromEntries(
  (brandConfig?.customFontsImport || [])
    ?.map((font) =>
      // Filter custom fonts to only include those that are actually used in a stack
      customFontsInUse.includes(font.name)
        ? [
            font.name,
            font.source.styles.map((style) => {
              return {
                provider: font.type,
                name: font.source.name,
                weights: font.source.weights,
                subsets: font.source.subsets,
                italic: style === "italic",
              };
            }),
          ]
        : [],
    )
    .filter((a) => a.length) || [],
);

// TODO: Setup context class names as rules instead of shipping them by default
// NOTE: Currently brandStyles contains the context class names defined
//       We could extract these as rules so they are only added when the style context is used on the page.

const computedConfig = defineConfig({
  preflights: [
    // { getCSS: ({ theme }) => `` },
    { getCSS: () => `a[href^="mailto:"] b {display: none;}` },
    { getCSS: () => brandStyles || "" },
  ],
  rules: [...layoutRules, ...utilitiesRules, ...atomsRules],
  // shortcuts: [
  //   // ...
  // ],
  // theme: {
  //   colors: {
  //     // ...
  //   }
  // },
  presets: [
    presetWebFonts({
      provider: "fontsource", // 'google' | 'bunny' | 'fontshare' | 'fontsource' | 'coollabs' | 'none'
      fonts: {
        ...customFontsImportObj,
        // roboto: [
        //   {
        //     provider: "fontsource",
        //     name: "roboto",
        //     weights: ["400", "700"],
        //     italic: true,
        //     widths: [62.5, 125],
        //     variable: {
        //       wght: { default: '400', min: '100', max: '900', step: '100' },
        //       wdth: { default: '100', min: '50', max: '200', step: '10' },
        //       slnt: { default: '0', min: '-20', max: '20', step: '1' },
        //     },
        //     subsets: ['latin', 'cyrillic'],
        //     preferStatic: true, // Prefer static font files over variable
        //   },
        // ],
      },
      extendTheme: false, // default: true
      // themeKey: "fontFamily", // default: 'fontFamily'
      inlineImports: true, // default: true
      // customFetch: undefined, // default: undefined
      // This will download the fonts and serve them locally
      processors: createLocalFontProcessor({
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
    presetWind4mod,
    //   presetAttributify(),
    //   presetIcons(),
    //   presetTypography(),
    // ],
    // transformers: [
    //   transformerDirectives(),
    //   transformerVariantGroup(),
  ],
});

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
