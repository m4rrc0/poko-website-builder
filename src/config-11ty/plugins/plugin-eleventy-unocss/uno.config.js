import {
  defineConfig,
  // presetAttributify,
  // presetIcons,
  // presetTypography,
  // presetWebFonts,
  // presetWind3,
  // transformerDirectives,
  // transformerVariantGroup
} from "unocss";
// import presetWind4 from '@unocss/preset-wind4'
import layoutRules from "./rules/ctx-layouts.js";
import utilitiesRules from "./rules/ctx-utilities.js";

export default defineConfig({
  rules: [...layoutRules, ...utilitiesRules],
  // shortcuts: [
  //   // ...
  // ],
  // theme: {
  //   colors: {
  //     // ...
  //   }
  // },
  presets: [
    //   presetWind3(),
    //   presetAttributify(),
    //   presetIcons(),
    //   presetTypography(),
    //   presetWebFonts({
    //     fonts: {
    //       // ...
    //     },
    //   }),
    // ],
    // transformers: [
    //   transformerDirectives(),
    //   transformerVariantGroup(),
  ],
});
