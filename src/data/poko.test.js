import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { packagePath } from "../utils/paths.js";
import { POKO_VERSION, poko } from "./poko.js";

const pkg = JSON.parse(
  fs.readFileSync(packagePath("package.json"), "utf-8"),
);

test("POKO_VERSION matches package.json version", () => {
  assert.equal(POKO_VERSION, pkg.version);
});

test("poko global data mirrors eleventy.version / eleventy.generator", () => {
  assert.equal(poko.version, pkg.version);
  assert.equal(poko.generator, `poko v${pkg.version}`);
});
