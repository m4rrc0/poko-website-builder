import { test } from "node:test";
import assert from "node:assert/strict";
import { shortList } from "./langCodesList.js";

const byCode = Object.fromEntries(shortList.map((l) => [l.code, l.name]));

test("shortList labels and codes are unique", () => {
  const names = shortList.map((l) => l.name);
  const dupNames = names.filter((n, i) => names.indexOf(n) !== i);
  assert.deepEqual(dupNames, [], `duplicate labels: ${dupNames.join(", ")}`);
  const codes = shortList.map((l) => l.code);
  assert.equal(new Set(codes).size, codes.length, "duplicate codes");
});

test("shortList maps codes to their ISO names", () => {
  assert.equal(byCode.om, "Oromo");
  assert.equal(byCode.or, "Oriya");
  assert.equal(byCode.gl, "Galician");
  assert.equal(byCode.gu, "Gujarati");
  assert.equal(byCode.so, "Somali");
});

test("shortList keeps the variant suffix when stripping would collide", () => {
  assert.equal(byCode.nb, "Norwegian (Bokmal)");
  assert.equal(byCode.nn, "Norwegian (Nynorsk)");
  assert.equal(byCode.no, "Norwegian (Standard)");
  // and still strips it everywhere else
  assert.equal(byCode.de, "German");
  assert.equal(byCode.ar, "Arabic");
  assert.equal(byCode.gd, "Gaelic");
});
