import { filterCollection, sortCollection } from "../../../../utils/arrays.js";
import {
  createNjkEnv,
  renderRichContent,
  renderNjkPartial,
  renderNjkString,
} from "./preview-njk.js";
import { getPreviewMd } from "./preview-md.js";
export {
  setAssetResolver,
  setIconResolver,
  setSrcsetProvider,
  setStatsProvider,
  isMediaPath,
  resolveSrcset,
} from "./preview-md.js";
export { registerPreviewFilterStubs } from "./preview-njk.js";
export { hydratePreviewEnv } from "./browser-env.js";
// Generated modules (written by cms-config/index.js at build time):
// - jsPartials: every `.11ty.js` partial, bundled — never a manual list
// - previewData: `_data/**` yaml/json keyed like Eleventy's data cascade
// - userHtmlClasses: project `_config/htmlClasses.js` (optional)
import jsPartials from "./generated/preview-partials.generated.js";
import previewData from "./generated/preview-data.generated.js";
import { htmlClasses as userHtmlClasses } from "./generated/preview-userconfig.generated.js";
import {
  layoutSources,
  jsLayouts,
} from "./generated/preview-layouts.generated.js";
// Icons the real build inlined (recorded via plugin-icons `class` cb) + unpkg
// bases for CMS-chosen icons absent from the map — re-exported so the raw
// (unbundled) preview-runtime module can reach them through ./preview-renderer.
export {
  default as bundledIcons,
  iconUrlBases,
} from "./generated/preview-icons.generated.js";
// `env.config.js` resolves to browser-env.js via the bundler alias — these
// are live bindings hydrated from the CMS store (see preview-runtime).
import * as previewEnv from "./browser-env.js";
// Never destructure: `let` bindings hydrate AFTER module init — read through
// the namespace at call time.
import eleventyComputed from "../../../../data/eleventyComputed.js";
import { createGenerator } from "@unocss/core";
import deepmerge from "deepmerge";
import { buildUnoConfig } from "../../plugin-eleventy-unocss/uno.config.base.js";

// Runtime UnoCSS: same config factory as the build, but brand values come
// from the hydrated bindings — a stylesConfig edit regenerates the generator.
// Key on CONTENT, not identity: hydrated bindings surface fresh objects each
// read, so `!==` would rebuild the (~700ms) generator on every render.
let unoGenerator, unoKey;
const getUno = async () => {
  const key = JSON.stringify([previewEnv.brandConfig, previewEnv.brandStyles]);
  if (!unoGenerator || unoKey !== key) {
    unoKey = key;
    // `browser: true` — no presetWebFonts: never fetch fontsource at runtime;
    // the preview uses the font files the site build already published.
    unoGenerator = await createGenerator(
      buildUnoConfig({
        brandConfig: previewEnv.brandConfig,
        brandStyles: previewEnv.brandStyles,
        browser: true,
      }),
    );
  }
  return unoGenerator;
};
// Generate is O(html × rules) — ~1s on a sections-heavy page. Typing changes
// text, not utility tokens: cache on the set of attribute name="value" pairs
// (covers class + attributify-style attrs) and skip regeneration when only
// text changed. Attr values truncated — blob/data uris would bloat the key.
let cssTokenKey, cachedCss;
const attrTokenKey = (html) => {
  const set = new Set();
  for (const m of String(html ?? "").matchAll(/[\w:.-]+="[^"]{0,160}/g))
    set.add(m[0]);
  return [...set].sort().join("|");
};
export const generatePreviewCss = async (html) => {
  const key = attrTokenKey(html);
  if (key === cssTokenKey) return cachedCss;
  const { css } = await (await getUno()).generate(String(html ?? ""));
  cssTokenKey = key;
  cachedCss = css;
  return css;
};

// Eleventy's data cascade deep-merges (page `vars:{}` + directory `vars:{…}`
// compose); shallow spreads would let a page-level empty object nuke
// file-level keys — the `vars.newsletterSubEmail` fragility. Arrays replace:
// concatenating would double list values vs the build.
const arrayReplace = (_dest, src) => src;
export const cascadeMerge = (...objs) =>
  objs.reduce(
    (acc, o) =>
      acc ? deepmerge(acc, o ?? {}, { arrayMerge: arrayReplace }) : (o ?? {}),
    null,
  ) ?? {};

// `_area` is an alias for `_areaRaw` in the real partial set.
if (jsPartials._areaRaw && jsPartials._area == null)
  jsPartials._area = jsPartials._areaRaw;

// Real resolution (partials/index.js): `lang/name` (project lang dirs) beats
// shared `name`; theme/engine already collapsed into `name` at build time.
const partialKey = (name, lang) =>
  [`${lang}/${name}`, name].find((key) => jsPartials[key] != null) || null;

const partials = {
  get: (name, lang) => {
    const key = partialKey(name, lang);
    return key ? { key, fn: jsPartials[key] } : null;
  },
};

// Eleventy computed data (`eleventyComputed` global data): an ordered object
// of `(data) => value` fns, each writing back into `data`. Same here — run
// over the merged cascade once per refresh so templates see `title`,
// `permalink`, `templateTranslations`, `metadata`, `ld*`… exactly like a page.
export const applyComputed = async (data) => {
  const target = { ...data };
  // `this` carries what ldWebPage & co. reach for (`this.imgStats`); the
  // preview stub feeds the asset's own url back instead of running sharp.
  const thisArg = {
    ...target,
    imgStats: async (src) => ({ url: `/${String(src).replace(/^\/+/, "")}` }),
  };
  for (const [key, fn] of Object.entries(eleventyComputed)) {
    if (typeof fn !== "function") continue;
    try {
      const value = await fn.call(thisArg, target);
      if (value !== undefined) target[key] = value;
    } catch (e) {
      console.warn(`[cms preview] computed "${key}" failed`, e);
    }
  }
  return target;
};

const previewFilterCollection = (
  collection,
  filtersRaw,
  exclusions = false,
) => {
  const filters = Array.isArray(filtersRaw) ? filtersRaw : [filtersRaw];
  // No known lang in the preview: skip the lang filter instead of matching nothing
  const normalizedFilters = filters.filter(
    (filter) => !(filter?.by === "lang" && !filter.value),
  );
  return filterCollection(collection, normalizedFilters, exclusions);
};

// `getCascade` is a live getter over the runtime's previewState so a single
// renderer (and a single Nunjucks env) tracks the entry being edited instead
// of being rebuilt per keystroke.
export function createRenderer({ getCascade }) {
  // cascade() runs dozens of times per render (every renderRich/partial
  // call). Rebuild only when the runtime cascade or a hydrated env value
  // changed — hydratePreviewEnv swaps these binding values on each hydrate.
  let cascadeMemo = null;
  let cascadeMemoKey = null;
  const cascade = () => {
    const runtime = getCascade() ?? {};
    const key = [
      runtime,
      previewEnv.globalSettings,
      previewEnv.brandConfig,
      previewEnv.brandStyles,
    ];
    if (cascadeMemoKey?.every((v, i) => v === key[i])) return cascadeMemo;
    cascadeMemoKey = key;
    // Eleventy merge order: global `_data` first, everything else above it;
    // deep-merge so per-layer objects (vars, tags…) compose like the build.
    return (cascadeMemo = cascadeMerge(previewData, runtime, {
      // CMS-hydrated values always win over anything stale in runtime data.
      globalSettings: previewEnv.globalSettings,
      brandConfig: previewEnv.brandConfig,
      allLanguages: previewEnv.allLanguages,
      languages: previewEnv.languages,
      defaultLanguage: previewEnv.defaultLanguage,
      defaultLangCode: previewEnv.defaultLangCode,
      unrenderedLanguages: previewEnv.unrenderedLanguages,
      brandStyles: previewEnv.brandStyles,
      inlineAllStyles: previewEnv.inlineAllStyles,
      // `data.env` in the build is the whole env module — same here, hydrated.
      env: { ...previewEnv, ...(runtime.env ?? {}) },
    }));
  };
  const renderRich = (src, data) =>
    renderRichContent(env, src, { ...cascade(), ...data });
  const env = createNjkEnv({
    lang: () => cascade().lang,
    helpers: {
      partial: (name, data) => ctx.partial(name, data),
      renderTemplate: (src, _formats, data) => renderRich(src, data),
      renderContent: (src, _formats, data) => renderRich(src, data),
      filterCollection: previewFilterCollection,
      sortCollection,
      cascade,
      hasJsPartial: (name) => Boolean(partialKey(name, cascade().lang ?? "")),
    },
  });
  const ctx = {
    get page() {
      return cascade().page || {};
    },
    get env() {
      return env;
    },
    filterCollection: previewFilterCollection,
    sortCollection,
    renderTemplate: (src, _formats, data) => renderRich(src ?? "", data),
    renderContent: (src, _formats, data) => renderRich(src ?? "", data),
    async partial(name, data) {
      if (typeof name !== "string" || !name || /^undefined\b/.test(name))
        return "";
      const c = cascade();
      // JS partials get the cascade on `this` too (`this.collections`, …)
      const thisArg = { ...c, ...ctx };
      const partialData = { ...c, ...data, __cascade: c };
      const found = partials.get(name, c.lang ?? "");
      if (found) return found.fn.call(thisArg, partialData);
      const html = await renderNjkPartial(env, name, partialData, c.lang ?? "");
      if (html != null) return html;
      const fallback = data?.pagePreview
        ? partials.get("_collectionItem", c.lang ?? "")
        : null;
      if (fallback) return fallback.fn.call(thisArg, partialData);
      console.warn(`[cms preview] unknown partial "${name}"`);
      return "";
    },
    // Run the real eleventyComputed over the deep-merged cascade + entry —
    // frontmatter is a data-cascade tier (deep-merge, not shallow shadow), so
    // e.g. `vars: {}` in frontmatter must not empty the dir-file `vars` that
    // computed fns read.
    compute: (data) => applyComputed(cascadeMerge(cascade(), data)),
    userHtmlClasses,
  };

  async function renderSection(section) {
    // ctx.partial resolves JS partials first, then .njk/.md sources — don't
    // gate on `partials[]` here or theme/project .njk sections would be dropped
    if (!section?.type) return "";
    const { type, content, ...rest } = section;
    try {
      const html = content ? await renderRich(content, rest) : "";
      return await ctx.partial(`_${type}`, { content: html, ...rest });
    } catch (e) {
      console.warn(`[cms preview] section "${type}" failed to render`, e);
      return `<p class="cms-preview-error"><em>Section preview failed: ${e?.message || e}</em></p>`;
    }
  }

  async function renderSections(sections) {
    const list = Array.isArray(sections) ? sections : [];
    return (await Promise.all(list.map(renderSection)))
      .filter(Boolean)
      .join("\n");
  }

  // Layout wrap: cascade `layout` (globalData default "base"; dir files and
  // page frontmatter override) resolves like partials — project > theme >
  // engine — with `.11ty.js` winning over source templates. Layouts receive
  // the cascade + `content` = rendered body (`{{ content | safe }}` inside
  // `_main-content.md`). A layout file's own frontmatter `layout:` chains
  // (depth-capped). The outer document tags are stripped; html/body classes
  // move to a wrapper div so palette/layout utilities still apply.
  const layoutFile = (name) => {
    const base = String(name).replace(/\.(11ty\.js|njk|html|md)$/, "");
    const jsKey = `${base}.11ty.js`;
    if (jsLayouts[jsKey]) return { jsKey };
    const srcKey = [
      String(name),
      `${base}.html`,
      `${base}.njk`,
      `${base}.md`,
    ].find((k) => layoutSources[k]);
    return srcKey ? { srcKey } : null;
  };

  const renderLayout = async (content) => {
    const c = cascade();
    // "base" mirrors eleventy.config.js `addGlobalData("layout","base")` —
    // config-level global data isn't a `_data` file so it never reaches
    // previewData. Page/dir values still win; false/"" disables.
    let name = c.layout ?? "base";
    console.log("[cms preview] renderLayout", {
      layout: c.layout,
      pageLayout: c.pageLayout,
      resolved: name,
    });
    if (!name) return content;
    for (let depth = 0; name && depth < 4; depth++) {
      const found = layoutFile(name);
      if (!found) {
        console.warn(`[cms preview] layout "${name}" not found`);
        break;
      }
      const data = { ...c, content };
      let out;
      if (found.jsKey) {
        out = await jsLayouts[found.jsKey].call({ ...c, ...ctx }, data);
      } else {
        const src = layoutSources[found.srcKey];
        // Layout frontmatter may chain another layout (`layout:`) — strip
        // the block, continue the loop with its value.
        const fm = src.match(/^---\s*\n([\s\S]*?)\n---\s*/);
        name = fm?.[1]?.match(/^\s*layout:\s*(\S+)/m)?.[1] ?? null;
        const body = fm ? src.slice(fm[0].length) : src;
        try {
          out = await renderNjkString(env, body, data);
        } catch (e) {
          console.warn(
            `[cms preview] layout "${found.srcKey}" render failed`,
            e,
          );
          break;
        }
        if (found.srcKey.endsWith(".md")) out = getPreviewMd().render(out);
        content = out;
        continue;
      }
      content = out;
      name = null;
    }
    // Promote html/body classes to a wrapper div; drop document tags so the
    // layout's nav/footer/etc. render inside the preview root. Head children
    // (meta/link/style) stay — inert or still functional.
    const classes = [
      ...content.matchAll(/<(?:html|body)\b[^>]*?\bclass="([^"]*)"/g),
    ]
      .flatMap((m) => m[1].split(/\s+/))
      .filter(Boolean)
      .join(" ");
    const inner = content
      .replace(/<!doctype[^>]*>/gi, "")
      .replace(/<\/?(?:html|head|body)\b[^>]*>/gi, "");
    return `<div class="cms-layout ${classes}">${inner}</div>`;
  };

  return {
    renderSection,
    renderSections,
    renderRich,
    renderLayout,
    compute: ctx.compute,
    userHtmlClasses,
  };
}
