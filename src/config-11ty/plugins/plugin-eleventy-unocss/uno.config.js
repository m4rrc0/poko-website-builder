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
import rules from "./unocss-rules.js";

export default defineConfig({
  rules,
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
