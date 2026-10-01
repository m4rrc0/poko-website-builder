// Browser-safe UnoCSS config factory: everything except the Node-only bits
// (local font processor, font preload extraction) lives here so the CMS
// preview bundle can rebuild the same generator — same rules, same presets —
// with brand values hydrated live from the CMS store.
//
// `fontsProcessors` is optional: the Node build passes
// `createLocalFontProcessor(...)`; the browser preview skips it (fonts ship
// with the built assets already — the emitted @font-face urls are identical).
import presetWind4 from "@unocss/preset-wind4";
import presetWebFonts from "@unocss/preset-web-fonts";
import layoutRules from "./rules/ctx-layouts.js";
import utilitiesRules from "./rules/ctx-utilities.js";
import atomsRules from "./rules/ctx-atoms.js";
import { colorsRules, colorsShortcuts } from "./rules/ctx-colors.js";

// Some Wind4 rules are colliding with our own rules
const presetWind4mod = presetWind4({
  preflights: {
    reset: false,
    // theme: false,
  },
});
//
// TODO: look if I can simply load my rules before Wind4 rules so they override?
//
// wind4 rule are here: https://github.com/unocss/unocss/tree/main/packages-presets/preset-wind4/src/rules
// Pervent ..., h-1, h0, h1, h2, ... collision
const hRegexCollides = /^(?:size-)?(min-|max-)?([wh])-?(.+)$/;
// Force '-' between w or h and the number or attribute. E.g. h-10 not h10
// To avoid collision with our own rules for heading styles .h1, .h6, .h000, .h8
const hRegexReplacement = /^(?:size-)(min-|max-)?([wh])-?(.+)$/;
const modRuleIndex = presetWind4mod.rules.findIndex(
  (ruleArr) => ruleArr[0].source === hRegexCollides.source,
);
presetWind4mod.rules[modRuleIndex][0] = hRegexReplacement;
// Prevent container collision
const containerShortcutsIndex = presetWind4mod.shortcuts.findIndex(
  (ruleArr) => ruleArr[0].source === /^(?:(\w+)[:-])?container$/.source,
);
presetWind4mod.shortcuts[containerShortcutsIndex][0] =
  /^(?:(\w+)[:-])?container-w$/;

const usedCustomFonts = (brandConfig = {}) => {
  const customFontsInUse = [];
  for (const fontStackContext of brandConfig?.fontStacksContexts || []) {
    for (const stack of Object.values(fontStackContext || {})) {
      if (stack?.custom) customFontsInUse.push(stack.custom);
    }
  }
  return Object.fromEntries(
    (brandConfig?.customFontsImport || [])
      .map((font) =>
        // Filter custom fonts to only include those that are actually used in a stack
        customFontsInUse.includes(font.name)
          ? [
              font.name,
              font.source.styles.map((style) => ({
                provider: font.type,
                name: font.source.name,
                weights: font.source.weights,
                subsets: font.source.subsets,
                italic: style === "italic",
              })),
            ]
          : [],
      )
      .filter((a) => a.length) || [],
  );
};

// TODO: Setup context class names as rules instead of shipping them by default
// NOTE: Currently brandStyles contains the context class names defined
//       We could extract these as rules so they are only added when the style context is used on the page.
export function buildUnoConfig({
  brandConfig = {},
  brandStyles = "",
  fontsProcessors,
  // Browser (CMS preview): never fetch webfonts at runtime — the preview
  // reuses the font files the site build already published.
  browser = false,
} = {}) {
  return {
    preflights: [
      // { getCSS: ({ theme }) => `` },
      { getCSS: () => `a[href^="mailto:"] b {display: none;}` },
      { getCSS: () => brandStyles || "" },
    ],
    rules: [...layoutRules, ...colorsRules, ...utilitiesRules, ...atomsRules],
    // shortcuts: [...colorsShortcuts], // TODO: could reinstate when system tested BUT delete the css rules doing the same then!
    // theme: {
    //   colors: {
    //     // ...
    //   }
    // },
    presets: [
      // TODO: discovered the package has an auto import locally: https://github.com/unocss/unocss/blob/main/docs/presets/web-fonts.md#serve-fonts-locally
      ...(browser
        ? []
        : [
            presetWebFonts({
              provider: "fontsource", // 'google' | 'bunny' | 'fontshare' | 'fontsource' | 'coollabs' | 'none'
              fonts: {
                ...usedCustomFonts(brandConfig),
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
                //       slnt: { default: '0', min: '0', max: '100', step: '1' },
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
              // Node build only: downloads fonts and serves them locally. The
              // browser preview reuses the already-built /assets/fonts files.
              ...(fontsProcessors ? { processors: fontsProcessors } : {}),
            }),
          ]),
      presetWind4mod,
      //   presetAttributify(),
      //   presetIcons(),
      //   presetTypography(),
      // ],
      // transformers: [
      //   transformerDirectives(),
      //   transformerVariantGroup(),
    ],
  };
}
