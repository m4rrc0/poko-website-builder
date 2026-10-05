import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import deepmerge from "deepmerge";
import { languages, defaultLangCode } from "../../../../env.config.js";
import pattern from "./pattern.js";
import { defaults, facadeCss } from "./defaults.js";
import { liteEmbed } from "./embed.js";

/**
 * youtube-facade — GDPR-friendly YouTube embeds.
 *
 * Replaces bare YouTube URLs (markdown-rendered as `<p>youtube…</p>`) with a
 * <lite-youtube> facade: self-hosted poster (i.ytimg.com probed + optimized
 * through eleventy-img at build time), two-layer LQIP background, a privacy
 * disclaimer overlay, and the vendored lite-youtube-embed runtime inlined
 * once per page. Nothing reaches Google before the visitor clicks play.
 *
 * See ./README.md for the full model and options.
 */
export default function (eleventyConfig, options = {}) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  // arrayMerge: replace — `poster.qualities` etc. are ordered candidate
  // lists; concatenating user values after the defaults would break them.
  const config = deepmerge(defaults, options, {
    arrayMerge: (_d, s) => s,
  });
  const assets = buildAssets(config);

  eleventyConfig.addTransform("youtubeFacade", async function (content) {
    const outputPath = this?.page?.outputPath;
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    const matches = [...content.matchAll(pattern)];
    if (!matches.length) return content;

    const lang = options.langForPage
      ? options.langForPage(this?.page)
      : langForPage(this?.page);

    // One poster probe / image pipeline per embed — parallel, then splice
    // the rendered html back over each match (last-first keeps offsets).
    const rendered = await Promise.all(
      matches.map((m, i) => liteEmbed(m, config, i, lang, assets)),
    );
    let out = content;
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      out = out.slice(0, m.index) + rendered[i] + out.slice(m.index + m[0].length);
    }
    return out;
  });
}

// Vendored lite-youtube-embed runtime (self-hosted npm dep, never a CDN) +
// our facade rules — emitted inline before the first embed of the page,
// mirroring the upstream plugin's once-per-page behavior.
function buildAssets(config) {
  const require = createRequire(import.meta.url);
  const pkgDir = path.dirname(
    require.resolve("lite-youtube-embed/package.json"),
  );
  const read = (f) => fs.readFileSync(path.join(pkgDir, "src", f), "utf-8");

  let assets = "";
  if (config.lite.css.enabled && config.lite.css.inline) {
    assets += `<style>${read("lite-yt-embed.css")}\n${facadeCss}</style>\n`;
  } else {
    if (config.lite.css.enabled && config.lite.css.path) {
      assets += `<link rel="stylesheet" href="${config.lite.css.path}">\n`;
    }
    // Our own disclaimer/cursor rules ship regardless of the lite css mode.
    assets += `<style>${facadeCss}</style>\n`;
  }
  if (config.lite.responsive) {
    assets += `<style>.${config.embedClass} lite-youtube{max-width:100%}</style>\n`;
  }
  if (config.lite.js.enabled) {
    assets += config.lite.js.inline
      ? `<script>${read("lite-yt-embed.js")}</script>\n`
      : `<script defer src="${config.lite.js.path}"></script>\n`;
  }
  return assets;
}

// Page lang for localized strings: same defaultPrefixRegex test as
// eleventyComputed.lang, over the page's filePathStem.
function langForPage(page) {
  const stem = page?.filePathStem || "";
  const found = languages?.find((l) => l?.defaultPrefixRegex?.test(stem));
  return found?.code || page?.lang || defaultLangCode || "en";
}
