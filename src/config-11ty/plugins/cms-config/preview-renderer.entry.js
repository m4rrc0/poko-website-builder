import { filterCollection, sortCollection } from "../../../utils/arrays.js";
import {
  createNjkEnv,
  renderRichContent,
  renderNjkPartial,
} from "./preview-njk.js";
export {
  setAssetResolver,
  setIconResolver,
  setSrcsetProvider,
  isMediaPath,
  resolveSrcset,
} from "./preview-md.js";
export { registerPreviewFilterStubs } from "./preview-njk.js";
export { hydratePreviewEnv } from "./browser-env.js";
// Generated modules (written by cms-config/index.js at build time):
// - jsPartials: every `.11ty.js` partial, bundled — never a manual list
// - previewData: `_data/**` yaml/json keyed like Eleventy's data cascade
// - userHtmlClasses: project `_config/htmlClasses.js` (optional)
import jsPartials from "./preview-partials.generated.js";
import previewData from "./preview-data.generated.js";
import { htmlClasses as userHtmlClasses } from "./preview-userconfig.generated.js";
// Icons the real build inlined (recorded via plugin-icons `class` cb) + unpkg
// bases for CMS-chosen icons absent from the map — re-exported so the raw
// (unbundled) preview-runtime module can reach them through ./preview-renderer.
export {
  default as bundledIcons,
  iconUrlBases,
} from "./preview-icons.generated.js";
// `env.config.js` resolves to browser-env.js via the bundler alias — these
// are live bindings hydrated from the CMS store (see preview-runtime).
import * as previewEnv from "./browser-env.js";
// Never destructure: `let` bindings hydrate AFTER module init — read through
// the namespace at call time.
import eleventyComputed from "../../../data/eleventyComputed.js";
import { createGenerator } from "@unocss/core";
import deepmerge from "deepmerge";
import { buildUnoConfig } from "../plugin-eleventy-unocss/uno.config.base.js";

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
  const cascade = () => {
    const runtime = getCascade() ?? {};
    // Eleventy merge order: global `_data` first, everything else above it;
    // deep-merge so per-layer objects (vars, tags…) compose like the build.
    return cascadeMerge(previewData, runtime, {
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
    });
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
    // Run the real eleventyComputed over cascade+entry data (per refresh).
    compute: (data) => applyComputed({ ...cascade(), ...data }),
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

  return {
    renderSection,
    renderSections,
    renderRich,
    compute: ctx.compute,
    userHtmlClasses,
  };
}
