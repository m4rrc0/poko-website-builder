import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import deepmerge from "deepmerge";
import { languages, defaultLangCode } from "../../../../env.config.js";
import { defaults, facadeCss } from "./defaults.js";
import { providers, renderEmbed, normalizeEmbedArgs } from "./emit.js";
import { makeUrlTransform } from "./transform.js";

/**
 * private-embed — GDPR-friendly third-party video embeds.
 *
 * `{% embed url="…" %}` shortcode dispatches on the URL's host to a provider
 * facade (lite-youtube, lite-vimeo, …): self-hosted build-time poster through
 * the eleventy-img pipeline, two-layer LQIP background, privacy disclaimer
 * overlay, vendored lite runtime swapped in only on click. Runtime css/js is
 * registered once per page through the css/js bundles (inline fallback when
 * bundle managers are absent). Bare-URL rewriting is an optional transform.
 *
 * See ./README.md for the full model and options.
 */
export default function (eleventyConfig, options = {}) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");
  const ctx = makeCtx(eleventyConfig, options);

  eleventyConfig.addShortcode("embed", async function (a, b) {
    const args = normalizeEmbedArgs(a, b);
    return embedUrl(args, ctxFor(this?.page, ctx));
  });

  if (ctx.config.transform) {
    eleventyConfig.addTransform("privateEmbedUrl", makeUrlTransform(ctx));
  }
}

/**
 * Manual wiring for the bare-URL transform — the alternative to the
 * `transform` option for callers that register transforms by hand:
 *   import privateEmbed, { attachUrlTransform } from "…/private-embed/index.js";
 *   eleventyConfig.addPlugin(privateEmbed, { transform: false });
 *   attachUrlTransform(eleventyConfig); // same options if needed
 */
export function attachUrlTransform(eleventyConfig, options = {}) {
  eleventyConfig.addTransform(
    "privateEmbedUrl",
    makeUrlTransform(makeCtx(eleventyConfig, options)),
  );
}

// ---------------------------------------------------------------------------

function makeCtx(eleventyConfig, options) {
  // arrayMerge: replace — `qualities`, widths, formats are ordered lists;
  // concatenating user values after the defaults would break them.
  const config = deepmerge(defaults, options, {
    arrayMerge: (_d, s) => s,
  });
  let bundlesResolved = false;
  let bundles = null;
  return {
    config,
    assets: buildAssets(config),
    // Bundle managers exist once addBundle() ran — resolved lazily so plugin
    // registration order doesn't matter.
    getBundles: () => {
      if (!bundlesResolved) {
        bundlesResolved = true;
        bundles = eleventyConfig.getBundleManagers?.() || null;
      }
      return bundles;
    },
    langForPage(page) {
      if (options.langForPage) return options.langForPage(page);
      const stem = page?.filePathStem || "";
      const found = languages?.find((l) => l?.defaultPrefixRegex?.test(stem));
      return found?.code || page?.lang || defaultLangCode || "en";
    },
  };
}

// ctx bound to the page a shortcode/transform is rendering
const ctxFor = (page, ctx) => ({
  ...ctx,
  page,
  lang: ctx.langForPage(page),
});

async function embedUrl(args, ctx) {
  const url = args.url;
  if (!url) {
    console.warn("[private-embed] {% embed %} called without url");
    return "";
  }
  const hit = providers
    .map((provider) => ({ provider, data: provider.parseUrl(url) }))
    .find((h) => h.data);
  if (!hit) {
    console.warn(`[private-embed] no provider for url, left as link: ${url}`);
    return `<p><a href="${url}">${url}</a></p>`;
  }
  if (hit.data.playlist) {
    console.error(`[private-embed] playlists unsupported, left as link: ${url}`);
    return `<p><a href="${url}">${url}</a></p>`;
  }
  return renderEmbed(hit, args, ctx);
}

// Vendored lite runtimes (self-hosted, never a CDN) + shared facade rules —
// registered into the css/js bundles once per page that uses them.
function buildAssets(config) {
  const require = createRequire(import.meta.url);
  const pluginDir = path.dirname(fileURLToPath(import.meta.url));
  const perProvider = {};

  const yt = providers.find((p) => p.name === "youtube");
  if (yt && config.providers.youtube.lite) {
    const pkgDir = path.dirname(
      require.resolve(`${yt.assets.packageName}/package.json`),
    );
    const read = (f) =>
      fs.readFileSync(path.join(pkgDir, yt.assets.packageDir, f), "utf-8");
    perProvider.youtube = {
      css: config.providers.youtube.lite.css.enabled
        ? read(yt.assets.cssFiles[0])
        : "",
      js: config.providers.youtube.lite.js.enabled
        ? read(yt.assets.jsFiles[0])
        : "",
    };
  }

  const vm = providers.find((p) => p.name === "vimeo");
  if (vm?.assets?.jsVendorFile) {
    perProvider.vimeo = {
      css: "", // lite-vimeo injects its own <style> at runtime
      js: fs.readFileSync(
        path.join(pluginDir, vm.assets.jsVendorFile),
        "utf-8",
      ),
    };
  }

  return { facadeCss, providers: perProvider };
}
