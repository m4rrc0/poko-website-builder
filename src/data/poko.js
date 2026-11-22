import fs from "node:fs";
import { packagePath } from "../utils/paths.js";

// Version of the installed engine package — `package.json` always ships with
// the npm package, so this resolves identically from `node_modules`.
export const POKO_VERSION = JSON.parse(
  fs.readFileSync(packagePath("package.json"), "utf-8"),
).version;

// Mirrors Eleventy's `eleventy.version` / `eleventy.generator` global data.
export const poko = {
  version: POKO_VERSION,
  generator: `poko v${POKO_VERSION}`,
};
