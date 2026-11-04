/**
 * Run: node --test src/config-11ty/plugins/cms-config/utils/import-spec.test.js
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { importSpec } from "./import-spec.js";

test("posix: relative path gets ./ prefix", () => {
  assert.equal(
    importSpec("/p/gen", "/p/_partials/a.11ty.js", path.posix),
    "./../_partials/a.11ty.js",
  );
  assert.equal(importSpec("/p/gen", "/p/gen/b.js", path.posix), "./b.js");
});

test("win32: same drive uses forward slashes", () => {
  assert.equal(
    importSpec("C:\\p\\gen", "C:\\p\\_partials\\a.11ty.js", path.win32),
    "./../_partials/a.11ty.js",
  );
});

test("win32: mixed separators in input are normalized", () => {
  assert.equal(
    importSpec("C:\\p/gen", "C:/p/_config/htmlClasses.js", path.win32),
    "./../_config/htmlClasses.js",
  );
});

test("win32: different drive stays absolute, unprefixed", () => {
  assert.equal(
    importSpec("C:\\p\\gen", "D:\\eng\\a.11ty.js", path.win32),
    "D:\\eng\\a.11ty.js",
  );
});
