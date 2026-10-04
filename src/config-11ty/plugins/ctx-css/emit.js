// Emission helpers — Node-only.
import { transform as lightningTransform } from "lightningcss";

export const minifyCss = (cssText, minify = false) => {
  if (!minify) return cssText;
  try {
    return lightningTransform({ code: Buffer.from(cssText), minify: true })
      .code.toString();
  } catch (e) {
    console.warn("[ctx-css] lightningcss minify failed, emitting unminified", e);
    return cssText;
  }
};
