// Emission helpers — Node-only.
import { transform as lightningTransform } from "lightningcss";
import { log } from "../../../utils/log/logger.js";

export const minifyCss = (cssText, minify = false) => {
  if (!minify) return cssText;
  try {
    return lightningTransform({ code: Buffer.from(cssText), minify: true })
      .code.toString();
  } catch (e) {
    log.warnOnce("css:minify", "css", "css.minify.error", "lightningcss minify failed, emitting unminified: " + (e?.message ?? e));
    return cssText;
  }
};
