import { createGenerator } from "@unocss/core";
import unoConfig from "./uno.config.js";

// Lazy singleton so consumers registered before the Eleventy plugin
// (e.g. cms-config emitting /admin/preview.css) share one generator.
let generatorPromise;

export function getUnoGenerator() {
  return (generatorPromise ??= createGenerator(unoConfig));
}
