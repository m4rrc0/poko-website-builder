import {
  createRenderer,
  setAssetResolver,
  setIconResolver,
  bundledIcons,
  iconUrlBases,
  setSrcsetProvider,
  setStatsProvider,
  registerPreviewFilterStubs,
  hydratePreviewEnv,
  generatePreviewCss,
  isMediaPath,
  resolveSrcset,
  cascadeMerge,
  toJs,
  stripEmpty,
  entryDataForLang,
} from "./preview-renderer.js";
// NOTE: this module is served RAW (passthrough copy) — sibling specifiers are
// resolved by the browser against /admin/, not against this source path.
// "./admin-url.js" → /admin/admin-url.js (passthrough-copied from utils/).
import { adminEntryUrl } from "./admin-url.js";
import {
  previewEnvConstants,
  metadata,
  iconLists,
  baseUrl,
  basePath,
  prodUrl,
  displayUrl,
  pathPrefix,
  statusesToUnrender,
  year,
  env,
  njkFilterNames,
  pagesCollection,
  activeCollections,
  globalSettings as staticGlobalSettings,
  brandConfig as staticBrandConfig,
} from "./env.js";

// Register passthrough stubs for every filter the real build's nunjucks env
// has but ours doesn't — templates degrade instead of "filter not found".
registerPreviewFilterStubs(njkFilterNames);

// ═══════════════════════════════════════════════════════════════════════════
// MEDIA PATHS STAY RAW — RESOLUTION IS A POST-INSERT PASS.
//
// `/_images/x.webp` and friends are CMS storage conventions — the built site
// resolves them at emit (eleventy-img shortcode) or post-render (the
// eleventy-img HTML transform). The preview mirrors that model: entry data
// and rendered markup keep media paths verbatim, and postprocessMedia()
// rewrites src/srcset/poster/href/content attrs on the live DOM AFTER
// sanitize — published manifest urls when known, else CMS blob: urls from
// `getAsset()`. Resolving against the attr value keeps the `/_images/…`
// manifest key available for `srcset` backfill.
//
// Field values can ALSO carry already-usable urls (a freshly dropped unsaved
// asset is stored as `blob:`) — DOMPurify strips those schemes, so
// sanitizeHtml parks them in `data-preview-*` and postprocessMedia restores.
// On miss we warn once and emit an empty src — loudly broken beats silently
// wrong.
// ═══════════════════════════════════════════════════════════════════════════

// Resolved blob urls are memoized for the session: Sveltia's asset store can
// transiently lose track of a dropped file while the user edits other fields,
// which would flip the src back to a broken state. Hard misses are tracked in
// `failedAssets` (reset per entry change in refresh()) so the settle-triggered
// re-render doesn't re-kick the same dead fetch forever.
const assetUrlCache = new Map();
const assetFetches = new Set(); // in-flight srcs — dedupe repeated references
const pendingAssets = new Set(); // srcs whose blob fetch hasn't settled
const failedAssets = new Set(); // attempted + no blob — stop re-kicking
const missedAssets = new Set(); // warn-once
let assetsDirty = false; // a fetch resolved → a re-render is owed
let rerenderTimer;

// PERF NOTE — worker promotion path if preview lag ever resurfaces:
// everything this module does is main-thread (it shares the CMS editor's
// event loop). The expensive stages — nunjucks/md rendering and UnoCSS
// generate() — are pure string→string work and could move to a Web Worker
// (own esbuild entry returning {html, css} for a {seq, cascade, assetMap}
// message; seq already exists for stale-drop). What CANNOT move: getAsset/
// getCollection (Sveltia functions), DOMPurify + innerHTML (need DOM), and
// `resolvePreviewAsset`/`resolveIcon` mid-render calls — a worker design
// must pre-scan body/data for media paths + icon ids and ship a resolved
// map with each dispatch. Cheap stages stay here either way (~30ms total).

export const resetAssetRetries = () => {
  failedAssets.clear();
  failedIcons.clear();
};

// Unresolvable assets resolve to an empty src: the <img> shows its alt text.
// Never emit the CMS storage path — it 404s and pretends to work.

// Only these schemes are servable. Anything else (`/_images/…`, bare relative
// paths, `_content/…` internal paths) is a CMS storage path — never emitted.
const isUsableUrl = (v) => /^(blob:|data:|https?:|\/\/)/i.test(v ?? "");

const lookupAsset = (src) => {
  // Sveltia's getAsset maps the stored value (public path `/_images/x.webp`
  // or entry-relative forms) to the asset record itself — the stored value
  // first, one slash-stripped fallback for odd forms.
  for (const candidate of [src, src.replace(/^\//, "")]) {
    try {
      const asset = previewState.getAsset(candidate);
      if (asset) return asset;
    } catch {}
  }
  return null;
};

// Build-time image manifest: `/_images/…` → `/assets/images/…` urls actually
// emitted by the last build (recorded by the image shortcode/filters). Most
// images are published files — a manifest hit is synchronous, stable (no
// blob revocation), and needs no CMS fetch.
let imageManifest = null;
const loadImageManifest = async () => {
  if (imageManifest) return;
  for (const url of ["image-manifest.json", "/admin/image-manifest.json"]) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        imageManifest = await res.json();
        // Srcs resolved via CMS blobs/data while the manifest was absent must
        // re-resolve — a published url always beats a revocable blob.
        for (const [k, v] of [...assetUrlCache])
          if (/^(blob:|data:image\/)/i.test(v)) assetUrlCache.delete(k);
        return;
      }
    } catch {}
  }
  imageManifest = {};
  console.warn(
    "[cms preview] image-manifest.json missing — published images fall back to CMS blobs",
  );
};

// Prefer webp; pick the smallest variant that still covers ~2560px of preview
// width (crisp enough, never bigger), else the largest available.
const pickManifestUrl = (entry) => {
  const variants =
    (Array.isArray(entry?.webp) && entry.webp.length && entry.webp) ||
    Object.values(entry ?? {}).find((v) => Array.isArray(v) && v.length) ||
    [];
  const pick = variants.find((v) => v.width >= 2560) ?? variants.at(-1);
  return pick?.url ?? null;
};

const manifestEntry = (src) =>
  imageManifest?.[src] ??
  imageManifest?.[src.replace(/^\//, "")] ??
  imageManifest?.[`/${src.replace(/^\.?\.?\//, "")}`] ??
  null;

const manifestUrl = (src) => {
  const entry = manifestEntry(src);
  return entry ? pickManifestUrl(entry) : null;
};

// All published width variants → real `srcset` for the image stub.
const manifestSrcset = (src) => {
  const entry = manifestEntry(src);
  if (!entry) return "";
  const variants =
    (Array.isArray(entry.webp) && entry.webp.length && entry.webp) ||
    Object.values(entry).find((v) => Array.isArray(v) && v.length) ||
    [];
  return variants
    .filter((v) => v?.url && v.width)
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
};
setSrcsetProvider(manifestSrcset);
// `| image(src, opts)` filter stats: published sources get the manifest's
// real per-format variants; unpublished → null (filter synthesizes a shim).
setStatsProvider(manifestEntry);

// Icons: bundled map of svgs the real build rendered (`preview-icons`), plus
// a lazy unpkg fetch for icons chosen in the CMS that no page used at build
// time — same settle→re-render contract as assets. Miss = null → stub.
const iconCache = new Map();
const iconFetches = new Set();
const failedIcons = new Set();

const fetchIcon = (key, url) => {
  if (iconFetches.has(key) || failedIcons.has(key)) return;
  iconFetches.add(key);
  pendingAssets.add(key);
  (async () => {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const svg = await res.text();
        if (/^\s*<svg[\s>]/i.test(svg)) {
          iconCache.set(key, svg);
          assetsDirty = true;
          return;
        }
      }
      failedIcons.add(key);
    } catch {
      failedIcons.add(key);
    } finally {
      iconFetches.delete(key);
      pendingAssets.delete(key);
      scheduleAssetRerender();
    }
  })();
};

export const resolveIcon = (key) => {
  if (iconCache.has(key)) return iconCache.get(key);
  const bundled = bundledIcons[key];
  if (bundled) {
    iconCache.set(key, bundled);
    return bundled;
  }
  if (failedIcons.has(key)) return null;
  const [source, name] = key.split(":");
  const base = iconUrlBases[source];
  if (!name || !base) {
    failedIcons.add(key);
    return null;
  }
  fetchIcon(key, `${base}/${name}.svg`);
  return null;
};
setIconResolver(resolveIcon);

// The ApiAsset `.url` is `blobURL ?? path` — for stored assets the blob fetch
// hasn't run yet, so `.url` is the raw path. `toBase64()` awaits that fetch
// AND returns a `data:` URI — immortal (Sveltia revokes its own blob urls on
// store refresh; data uris can't be revoked) and DOMPurify-safe.
const fetchAssetUrl = (src) => {
  if (assetFetches.has(src) || failedAssets.has(src)) return;
  assetFetches.add(src);
  pendingAssets.add(src);
  (async () => {
    try {
      const asset = lookupAsset(src);
      if (asset) {
        const dataUri = await asset.toBase64?.().catch(() => null);
        const url = isUsableUrl(dataUri) ? dataUri : lookupAsset(src)?.url;
        if (isUsableUrl(url)) {
          assetUrlCache.set(src, url);
          assetsDirty = true;
          return;
        }
      }
      failedAssets.add(src);
      if (!missedAssets.has(src)) {
        missedAssets.add(src);
        console.warn(`[cms preview] no CMS blob url for "${src}"`);
      }
    } finally {
      assetFetches.delete(src);
      pendingAssets.delete(src);
      scheduleAssetRerender();
    }
  })();
};

// Re-render once per drain: rendering is sync innerHTML, so asset urls must
// be cached BEFORE the render that uses them. When all pending fetches settle
// and at least one resolved, the page refresh re-emits markup with real urls.
const scheduleAssetRerender = () => {
  if (pendingAssets.size || !assetsDirty) return;
  clearTimeout(rerenderTimer);
  rerenderTimer = setTimeout(() => {
    if (pendingAssets.size || !assetsDirty) return;
    assetsDirty = false;
    previewState.requestRerender?.();
  }, 0);
};

export const resolvePreviewAsset = (src) => {
  // Already-usable urls (cms blobs, data uris, remote, protocol-relative,
  // anchors, any scheme) pass through untouched. The `#[^\s'"<>]*` test
  // accepts real anchors only — a `# Heading\n…` body is content, not a src.
  if (
    !src ||
    isUsableUrl(src) ||
    /^#[^\s'"<>]*$/.test(src) ||
    /^[a-z][a-z0-9+.-]*:/i.test(src)
  ) {
    return src;
  }
  if (assetUrlCache.has(src)) return assetUrlCache.get(src);
  // Published images win: stable, sync, already served by the site.
  const published = manifestUrl(src);
  if (published) {
    assetUrlCache.set(src, published);
    return published;
  }
  if (!previewState.getAsset) return isMediaPath(src) ? "" : src;
  if (failedAssets.has(src)) return "";
  const asset = lookupAsset(src);
  const url = asset?.url;
  if (isUsableUrl(url)) {
    // Dropped/draft assets carry blobURL up front → usable synchronously.
    assetUrlCache.set(src, url);
    return url;
  }
  if (asset) {
    // Stored asset: blob fetch pending — empty src this pass, real url on
    // the settle-triggered re-render.
    fetchAssetUrl(src);
    return "";
  }
  // No asset record: media paths can never resolve to a real url — empty src
  // so the <img> shows alt text. Other site-relative paths may be served.
  if (isMediaPath(src)) {
    if (!missedAssets.has(src)) {
      missedAssets.add(src);
      console.warn(
        `[cms preview] no CMS asset for "${src}" — media paths never resolve to a real url`,
      );
    }
    return "";
  }
  return src;
};
setAssetResolver(resolvePreviewAsset);

export const previewState = {
  collections: {},
  // item page.url → item.url (editor). postprocessMedia rewrites internal
  // page hrefs to editor urls — "rendered urls point at the CMS entry
  // editor" convention, applied at the DOM boundary.
  pageUrlMap: new Map(),
  lang: "",
  rawEntry: null, // Sveltia entry (toJS'd) of the page being edited
  entry: null, // normalized entry data (stripped + asset-resolved)
  computed: null, // entry data after eleventyComputed — what templates see
  page: {},
  // CMS dataFiles entries: translatedData (the <lang>.yaml dir file) plus one
  // `<coll>Data` entry per folder collection (its <coll>/<coll>.yaml dir file).
  siteData: { translated: null, collectionData: {} },
  getAsset: null,
  getCollection: null,
  collectionName: "",
  // Set by the mounted preview component — invoked when async asset fetches
  // drain with new blob urls so a fresh render emits them.
  requestRerender: null,
};

const getCmsEntry = async (collection, slug) => {
  try {
    return await previewState.getCollection?.(collection, slug);
  } catch {
    return null;
  }
};

// Per dataFiles-slug retry budget for cold stores (see hydratePreviewFromCms).
const hydrateAttempts = new Map();

// Pull CMS-managed `_data` sources (globalSettings singleton, brand file,
// per-locale dataFiles) out of the Sveltia store and recompute the derived
// env values — same `deriveEnv` as the build, live values while editing.
export const hydratePreviewFromCms = async () => {
  // Published-image manifest (built by image-manifest.js) — loaded once,
  // before any render resolves assets.
  await loadImageManifest();
  // Every folder collection's dir file is a `dataFiles` file entry named
  // `<coll>Data` ("pagesData" for pages — same convention). Fetch them all:
  // the edited entry's tier and every collection item's merge need them.
  const dataFileNames = [pagesCollection, ...activeCollections]
    .filter((c) => c.folder)
    .map((c) => `${c.name}Data`);
  const [gs, brand, translated, ...collEntries] = previewState.getCollection
    ? await Promise.all([
        getCmsEntry("_singletons", "globalSettings"),
        getCmsEntry("stylesConfig", "brand"),
        getCmsEntry("dataFiles", "translatedData"),
        ...dataFileNames.map((slug) => getCmsEntry("dataFiles", slug)),
      ])
    : [null, null, null, null];
  const collectionData = {};
  dataFileNames.forEach(
    (slug, i) =>
      (collectionData[slug.slice(0, -"Data".length)] = collEntries[i]),
  );
  previewState.siteData = { translated, collectionData };
  // Cold Sveltia store: a dataFiles entry can come back null until its
  // collection warms — re-hydrate + re-render a few times, then give up (the
  // file may legitimately not exist).
  const missing = [
    ["translatedData", translated],
    ...dataFileNames.map((slug, i) => [slug, collEntries[i]]),
  ].filter(([slug, e]) => !e && (hydrateAttempts.get(slug) ?? 0) < 4);
  for (const [slug] of missing)
    hydrateAttempts.set(slug, (hydrateAttempts.get(slug) ?? 0) + 1);
  if (missing.length)
    setTimeout(() => {
      hydratePreviewFromCms().then(() => previewState.requestRerender?.());
    }, 800);
  hydratePreviewEnv({
    constants: previewEnvConstants,
    globalSettings: toJs(gs)?.data ?? staticGlobalSettings,
    brandConfig: toJs(brand)?.data ?? staticBrandConfig,
  });
};

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
// Sveltia exposes its DOMPurify instance on `window`; never insert unsanitized
// HTML without it. Media attrs stay CMS-path-flavored through sanitize (plain
// relative paths — nothing for the URI policy to strip). Attrs that already
// carry usable urls (blob:/data:image/ — e.g. a freshly dropped asset whose
// field value IS the blob) would be stripped wholesale, so they're parked in
// `data-preview-*` and restored by postprocessMedia on the live DOM.
const PARK_RE =
  /\b(src|srcset|poster|href|content)=(["'])([^"']*?(?:blob:|data:image\/)[^"']*?)\2/gi;
export const sanitizeHtml = (html) => {
  if (!window.DOMPurify?.sanitize) return `<pre>${escapeHtml(html)}</pre>`;
  const parked = String(html ?? "").replace(
    PARK_RE,
    (_, attr, _q, v) => `data-preview-${attr.toLowerCase()}="${v}"`,
  );
  return window.DOMPurify.sanitize(parked);
};

// Post-insert media pass — the preview's counterpart of the build's
// eleventy-img HTML transform. Media attrs keep CMS storage paths through
// data + markup; this pass rewrites them to usable urls (published manifest
// url, else CMS blob/data — set post-sanitize, so DOMPurify's URI policy
// never sees them) and backfills `srcset` while the `/_images/…` manifest key
// is still the attr value. Call on the inserted subtree.
const MEDIA_ATTRS = ["src", "srcset", "poster", "href", "content"];
export const postprocessMedia = (root) => {
  // Step 1: restore media attrs parked for sanitize — values that were
  // already usable urls (blob:/data:image/, e.g. freshly dropped assets).
  for (const el of root.querySelectorAll(
    MEDIA_ATTRS.map((a) => `[data-preview-${a}]`).join(","),
  )) {
    for (const attr of MEDIA_ATTRS) {
      const v = el.getAttribute(`data-preview-${attr}`);
      if (!v) continue;
      el.setAttribute(attr, v);
      el.removeAttribute(`data-preview-${attr}`);
    }
  }
  // Step 2: resolve CMS media paths → usable urls + manifest srcset backfill.
  for (const el of root.querySelectorAll(
    "[src],[srcset],[poster],[href],[content]",
  )) {
    for (const attr of MEDIA_ATTRS) {
      const v = el.getAttribute(attr);
      if (!v) continue;
      if (attr === "srcset") {
        // srcset holds a `url descriptor, url descriptor` list — rewrite when
        // any url is a media path (already-published lists pass untouched).
        if (/_(?:images|files|assets|media)\//.test(v))
          el.setAttribute("srcset", resolveSrcset(v));
        continue;
      }
      if (attr === "href") {
        // Internal page links render site urls for markup parity; the
        // preview convention points them at the entry editor instead.
        const base = v.split(/[?#]/)[0];
        const admin = previewState.pageUrlMap.get(base);
        if (admin) {
          el.setAttribute("href", admin + v.slice(base.length));
          continue;
        }
      }
      if (!isMediaPath(v)) continue;
      // Backfill `srcset` BEFORE resolving src — the published url loses the
      // manifest key, so the media path must still be the attr value here.
      if (
        attr === "src" &&
        el.tagName === "IMG" &&
        !el.hasAttribute("srcset")
      ) {
        const srcset = manifestSrcset(v);
        if (srcset) el.setAttribute("srcset", srcset);
      }
      el.setAttribute(attr, resolvePreviewAsset(v));
    }
  }
};

// html-classes-transform parity: the project's `_config/htmlClasses.js` maps
// selectors → classes injected on matching nodes. The preview DOM is already
// parsed in the iframe, so this is querySelectorAll + classList.add — no
// second HTML pass. `html`/`body` selectors target the iframe's own
// <html>/<body> (what the transform hits in real pages); other selectors are
// scoped to the preview root so editor-component previews are unaffected.
export const applyHtmlClasses = (doc) => {
  const d = doc ?? document;
  const map = getRenderer().userHtmlClasses ?? {};
  const scope = d.querySelector(".cms-page-preview") ?? d;
  for (const [selector, className] of Object.entries(map)) {
    const names = String(className).split(/\s+/).filter(Boolean);
    if (!names.length) continue;
    const targets =
      selector === "html"
        ? [d.documentElement]
        : selector === "body"
          ? [d.body]
          : [...scope.querySelectorAll(selector)];
    for (const el of targets) el?.classList?.add(...names);
  }
};
// "Eleventy lite": Nunjucks + markdown-it in the bundled renderer. Falls back
// to Sveltia's marked if the rich pipeline throws.
// export const renderMarkdown = async (src, data) => {
//   try {
//     return await getRenderer().renderRich(String(src ?? ""), data);
//   } catch (e) {
//     console.error("[cms preview] render error", e);
//     return window.marked?.parse
//       ? window.marked.parse(String(src ?? ""))
//       : `<p>${escapeHtml(src)}</p>`;
//   }
// };
export const setHtml = (el, html) => {
  el.innerHTML = sanitizeHtml(html);
  postprocessMedia(el);
};

// Runtime UnoCSS overlay: regenerate page-specific utilities from the rendered
// markup into a dedicated style tag in the preview iframe (catches data-driven
// classes the static preview.css corpus can't see). The static stylesheet
// stays — this is additive.
export const updateUnoStyles = async (doc, html) => {
  const d = doc ?? document;
  try {
    const css = await generatePreviewCss(html);
    let style = d.getElementById("cms-preview-uno");
    if (!style) {
      style = d.createElement("style");
      style.id = "cms-preview-uno";
      (d.head || d.documentElement).appendChild(style);
    }
    style.textContent = css;
  } catch (e) {
    console.warn("[cms preview] uno generation failed", e);
  }
};
// Data tiers for a non-entry context (collection items): directory files
// merged under the item's own frontmatter, matching Eleventy's dir cascade.
export const collectionItemData = (collectionName, data) =>
  cascadeMerge(
    entryDataForLang(previewState.siteData.translated, previewState.lang),
    entryDataForLang(
      previewState.siteData.collectionData?.[collectionName],
      previewState.lang,
    ),
    stripEmpty(data ?? {}),
  );

const toCollectionItem = (entry, collectionName) => {
  const d = collectionItemData(collectionName, entry?.data ?? {});
  const lang = d.lang ?? d.page?.lang ?? previewState.lang;
  const slug = entry?.slug ?? "";
  // Rendered urls point at the CMS entry editor (same convention as the link
  // editor component's toPreview); page.url keeps a pseudo site url so
  // translationKey/url matching still resolves.
  const siteUrl = `/${[lang, slug === "index" ? "" : slug].filter(Boolean).join("/")}/`;
  const adminUrl = adminEntryUrl(collectionName, slug);
  const rawInput = d.body ?? "";
  const filePathStem = `/${[lang, collectionName, slug]
    .filter(Boolean)
    .join("/")}`;
  const dateRaw = d.date ?? d.createdAt;
  const date =
    dateRaw && !isNaN(new Date(dateRaw)) ? new Date(dateRaw) : undefined;
  return {
    data: {
      ...d,
      lang,
      url: adminUrl,
      // `body` (the markdown body field), not `entry.raw` — Sveltia's raw
      // includes frontmatter; `{% if rawInput %}{{ rawInput|md }}` must match
      // Eleventy's post-frontmatter inputContent.
      rawInput,
      // The page stub must exist BEFORE the eleventyComputed pass —
      // nav key (fileSlug), h1Content (page.rawInput), lang, date, ldType…
      // all read it. filePathStem mirrors /<lang>/<coll>/<slug>.
      page: {
        fileSlug: slug,
        url: siteUrl,
        lang,
        filePathStem,
        outputFileExtension: "html",
        rawInput,
        date,
      },
    },
    url: adminUrl,
    // Eleventy collection-item shape: partials read item.fileSlug /
    // filePathStem / inputPath / date / rawInput / template.inputContent at
    // TOP level (see _collection.11ty.js). inputPath/outputPath are synthetic
    // — the CMS store doesn't track real file paths.
    fileSlug: slug,
    filePathStem,
    inputPath: `./${[lang, collectionName, slug].join("/")}.md`,
    outputPath: `${previewEnvConstants.OUTPUT_DIR ?? "dist"}${filePathStem}/index.html`,
    date,
    page: { fileSlug: slug, url: siteUrl, lang, filePathStem, date },
    rawInput,
    template: { inputContent: rawInput },
  };
};

// Fetch every folder collection from the CMS store as Eleventy-shaped items.
// The entry being edited isn't in saved collections yet — upsert it so
// self-references (locale_url, collection filters incl. itself) resolve.
const fetchCollections = async () => {
  const names = [pagesCollection, ...activeCollections]
    .filter((c) => c.folder)
    .map((c) => c.name);
  const collections = {};
  await Promise.all(
    names.map(async (name) => {
      try {
        const entries = await previewState.getCollection(name);
        collections[name] = (entries ?? []).map((e) =>
          toCollectionItem(toJs(e), name),
        );
      } catch (e) {
        console.warn(`[cms preview] getCollection("${name}") failed`, e);
        collections[name] = [];
      }
    }),
  );
  if (previewState.collectionName && collections[previewState.collectionName]) {
    const item = toCollectionItem(
      previewState.rawEntry,
      previewState.collectionName,
    );
    const i = collections[previewState.collectionName].findIndex(
      (it) => it.page?.fileSlug === item.page?.fileSlug,
    );
    if (i >= 0) collections[previewState.collectionName][i] = item;
    else collections[previewState.collectionName].push(item);
  }
  collections.all = Object.values(collections).flat();
  previewState.collections = collections;
  previewState.pageUrlMap = new Map(
    collections.all
      .map((item) => [item.page?.url, item.url])
      .filter(([from, to]) => from && to),
  );
  // Second pass — the build runs eleventyComputed on EVERY collection item
  // (nav keys/titles, pagePreview, templateTranslations, metadata, ldType…).
  // Sequential and in place: later items see earlier computed siblings, so
  // translation lists embed computed data where available.
  const renderer = getRenderer();
  for (const item of collections.all) {
    item.data = await renderer.computeItem(item.data);
  }
  // `templateTranslations` embeds sibling items' data (title, pagePreview…):
  // items computed before their siblings embed raw values. Re-run just that
  // key once every item is computed — pure rebuild, so a selective second
  // pass is safe (a full re-run is NOT: `metadata` composes over its own
  // previous result).
  for (const item of collections.all) {
    item.data = await renderer.computeItem(item.data, ["templateTranslations"]);
  }
};

// Normalize the Sveltia entry into previewState: strip materialized ""s and
// rebuild the `page` stub that computed data and templates read (filePathStem
// mirrors the collection's folder layout: /<lang>/<coll>/<slug> —
// lang/permalink/ldType derive from it). Media fields keep their CMS paths —
// postprocessMedia resolves them post-insert.
const normalizeEntry = (entry, collectionName) => {
  const js = toJs(entry);
  const data = stripEmpty(js?.data ?? {});
  previewState.rawEntry = js;
  previewState.entry = data;
  previewState.computed = null;
  const slug = js?.slug ?? data.slug ?? data.page?.fileSlug ?? "";
  previewState.lang = data.lang ?? data.page?.lang ?? "";
  previewState.page = {
    ...(data.page ?? {}),
    fileSlug: slug,
    url: data.page?.url ?? `/${slug}/`,
    lang: previewState.lang,
    filePathStem: `/${[previewState.lang, collectionName, slug]
      .filter(Boolean)
      .join("/")}`,
    outputFileExtension: "html",
    rawInput: js?.raw ?? data.body ?? "",
  };
};

// Monotonic job id — state commits past an `await` check it so a superseded
// refresh can't overwrite newer entry data mid-pipeline.
let jobSeq = 0;

// Refresh phase 1: stash CMS accessors, hydrate `_data` + env bindings, then
// normalize the entry. Returns false when superseded by a newer refresh.
// Hydrate runs FIRST: resolving entry assets before the image manifest loads
// would cache blob urls that shadow the (better) published urls forever.
export const preparePreview = async (
  { entry, getAsset, getCollection },
  collectionName,
) => {
  const seq = ++jobSeq;
  if (typeof getAsset === "function") previewState.getAsset = getAsset;
  if (typeof getCollection === "function")
    previewState.getCollection = getCollection;
  previewState.collectionName = collectionName;
  // Entry refresh = retry failed asset fetches (a dropped file may have
  // landed in the store since the last render).
  resetAssetRetries();
  await hydratePreviewFromCms();
  if (seq !== jobSeq) return false;
  normalizeEntry(entry, collectionName);
  return true;
};

// Refresh phase 2 (debounced by the caller): collections → eleventyComputed
// → body/sections → layout wrap. Returns { html, noPage } or null when
// superseded — the caller applies nothing in that case.
export const renderEntryPreview = async () => {
  const seq = jobSeq;
  const stale = () => seq !== jobSeq;
  const renderer = getRenderer();
  await fetchCollections();
  if (stale()) return null;
  // Real eleventyComputed: lang/title/permalink/metadata/templateTranslations…
  const computed = await renderer.compute(previewState.entry);
  if (stale()) return null;
  previewState.computed = computed;
  previewState.lang = computed.lang ?? previewState.lang;
  // Entry-level `generatePage: previewOnly` (or permalink:false) means
  // Eleventy writes no page for this entry — the custom preview shows
  // nothing. (Directory-level previewOnly collections are never registered.)
  const noPage =
    computed?.permalink === false ||
    (computed ?? previewState.entry).generatePage === "previewOnly";
  if (noPage) return { html: "", noPage: true };
  // Whole body through the app pipeline: `{% sections %}` inside it resolves
  // against entry.sections, shortcodes render like the site. Collections
  // with a `sections` field but no `body` still get their sections rendered.
  const body = String(previewState.entry.body ?? "");
  let html;
  try {
    html = body
      ? await renderer.renderRich(body)
      : await renderer.renderSections(previewState.entry.sections);
  } catch (e) {
    console.warn("[cms preview] content render failed", e);
    html = "";
  }
  if (stale()) return null;
  // Page layout (cascade `layout`, default "base") wraps the rendered body —
  // nav/footer and layout-level fields render like the real page.
  html = await renderer.renderLayout(html);
  if (stale()) return null;
  return { html };
};

// Singleton: one renderer/env for the session. Its cascade reads previewState
// live through getState; env.js constants are fixed at build time.
let renderer;
export const getRenderer = () =>
  (renderer ??= createRenderer({
    getState: () => previewState,
    constants: {
      env,
      baseUrl,
      basePath,
      prodUrl,
      displayUrl,
      pathPrefix,
      statusesToUnrender,
      metadata,
      iconLists,
      year,
    },
  }));
export const asyncPreview = (promise) => {
  const el = document.createElement("div");
  el.className = "cms-preview";
  Promise.resolve(promise)
    .then((html) => {
      setHtml(el, html || "");
      updateUnoStyles(el.ownerDocument, html);
    })
    .catch((e) => {
      console.error(e);
      setHtml(el, "<p><em>Preview error</em></p>");
    });
  return el;
};

// Sveltia requires every registered editor component to define a `toPreview`
// function. This default renders the component's own `toBlock` output through
// the app pipeline — real site markup instead of placeholder strings, for
// default and user components alike.
export const defaultComponentPreview = (component) => (data) => {
  let src = "";
  try {
    // Field values keep CMS media paths — toBlock output renders through the
    // pipeline and postprocessMedia resolves them post-insert.
    src = component.toBlock?.(data) ?? "";
  } catch {}
  return asyncPreview(getRenderer().renderRich(src));
};
