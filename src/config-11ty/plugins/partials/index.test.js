import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import partialsPlugin from "./index.js";

test("partial lookup supports Windows paths and preserves directory wildcards", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "poko-partials-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const lang of ["en", "fr"]) {
    const dir = path.join(root, lang, "_partials", "nested");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, "card.njk"), lang);
  }

  for (const [name, options] of [
    ["default directories", undefined],
    ["Windows directory", { dirs: [path.win32.join(root, "fr", "_partials")] }],
    ["wildcard directory", {
      dirs: [{
        pattern: path.win32.join(root, "*", "_partials"),
        resolveDiscriminant: (data) => `/${data.lang}/`,
      }],
    }],
  ]) {
    await t.test(name, async () => {
      const shortcodes = {};
      const pairedShortcodes = {};
      const filters = {};
      await partialsPlugin({
        dir: { input: path.join(root, "fr"), includes: "_partials" },
        templateFormats: ["njk"],
        versionCheck() {},
        universal: {
          shortcodes: { renderFile: (file) => readFile(file, "utf8") },
        },
        addAsyncShortcode: (name, fn) => { shortcodes[name] = fn; },
        addPairedAsyncShortcode: (name, fn) => { pairedShortcodes[name] = fn; },
        addAsyncFilter: (name, fn) => { filters[name] = fn; },
      }, options);

      const context = { ctx: { lang: "fr" } };
      assert.equal(await shortcodes.partial.call(context, "nested/card.njk"), "fr");
      assert.equal(await shortcodes.partial.call(context, "nested/card"), "fr");
      assert.equal(
        await pairedShortcodes.partialWrapper.call(context, "body", "nested/card.njk"),
        "fr",
      );
      assert.equal(await filters.partialExists.call(context, "nested/card.njk"), true);
      const fallback = await filters.partialFallback.call(context, ["missing.njk", "nested/card.njk"]);
      assert.equal(await readFile(fallback, "utf8"), "fr");
      assert.equal(await shortcodes.partial.call(context, "missing.njk"), "");
    });
  }
});
