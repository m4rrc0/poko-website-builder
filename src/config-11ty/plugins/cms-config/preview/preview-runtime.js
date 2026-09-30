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
} from "./preview-renderer.js";
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

export const toJs = (v) => (v && typeof v.toJS === "function" ? v.toJS() : v);

// ═══════════════════════════════════════════════════════════════════════════
// ASSET URLS: THE SITE NEVER SERVES THEM.
//
// Media paths like `/_images/x.webp` are CMS storage conventions — the
// published site does NOT host them (sharp/eleventy-img emits processed files
// under different urls at build time). In the preview there is no image
// pipeline either, so THE ONLY VALID asset URL IS THE CMS blob: URL obtained
// from `getAsset()`. Every code path that emits an asset reference — markdown
// images, the `{% image %}` shortcode, and any `src`-bearing data field — MUST
// resolve through `resolvePreviewAsset` below. Never emit a raw `/_images/`
// (or content-relative) path: it will 404. On miss we return a placeholder
// and warn — loudly broken beats silently wrong.
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
        console.log("[cms preview] image-manifest loaded", {
          url,
          entries: Object.keys(imageManifest).length,
        });
        return;
      }
    } catch {}
  }
  imageManifest = {};
  console.log("[cms preview] image-manifest MISSING (all fetches failed)");
};

// Prefer webp, smallest variant ≥ 2560px (preview doesn't need 2560px),
// else largest available, else any format.
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

// Debug: which resolution branch each src takes (once per src+branch —
// reveals order bugs like manifest-still-null on first pass, or a blob url
// getting sticky-cached before the manifest ever loads).
const resolveDbg = new Set();
const dbgResolve = (branch, src) => {
  const k = `${branch}|${src}`;
  if (resolveDbg.has(k)) return;
  resolveDbg.add(k);
  console.log("[cms preview] asset", branch, src, {
    manifestLoaded: imageManifest !== null,
    manifestSize: imageManifest ? Object.keys(imageManifest).length : 0,
  });
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
    dbgResolve("passthrough", src);
    return src;
  }
  if (assetUrlCache.has(src)) {
    dbgResolve("cache", src);
    return assetUrlCache.get(src);
  }
  // Published images win: stable, sync, already served by the site.
  const published = manifestUrl(src);
  if (published) {
    assetUrlCache.set(src, published);
    dbgResolve("manifest", src);
    return published;
  }
  if (!previewState.getAsset) return isMediaPath(src) ? "" : src;
  if (failedAssets.has(src)) {
    dbgResolve("failed", src);
    return "";
  }
  const asset = lookupAsset(src);
  const url = asset?.url;
  if (isUsableUrl(url)) {
    // Dropped/draft assets carry blobURL up front → usable synchronously.
    assetUrlCache.set(src, url);
    dbgResolve("cms-blob", src);
    return url;
  }
  if (asset) {
    // Stored asset: blob fetch pending — empty src this pass, real url on
    // the settle-triggered re-render.
    dbgResolve("cms-pending", src);
    fetchAssetUrl(src);
    return "";
  }
  // No asset record: media paths can never resolve to a real url — empty src
  // so the <img> shows alt text. Other site-relative paths may be served.
  if (isMediaPath(src)) {
    dbgResolve("miss", src);
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

// Asset paths also reach the render as plain data (`{{ cover.src }}`,
// `preview.image.src`, `<img src="{{ x }}">` in partials…) — never through
// the image shortcode or the md image rule. Resolve every `src`-bearing field
// — and any string pointing into a media folder — up front so rendered markup
// only ever carries blob:/usable urls (or the loud placeholder on miss).
export const resolveAssetsDeep = (value, depth = 0) => {
  if (depth > 8 || value == null) return value;
  if (Array.isArray(value))
    return value.map((item) => resolveAssetsDeep(item, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] =
        typeof v !== "string"
          ? resolveAssetsDeep(v, depth + 1)
          : key === "srcset"
            ? resolveSrcset(v)
            : key === "src" || key === "poster" || isMediaPath(v)
              ? resolvePreviewAsset(v)
              : v;
    }
    return out;
  }
  return value;
};

export const previewState = {
  collections: {},
  lang: "",
  entry: null, // raw entry data (asset-resolved)
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

// Sveltia materializes every schema field in `entry.data` — unfilled ones as
// `""` — while omitting them from the saved file entirely. "" therefore means
// "not written": strip it (plus null/undefined) so materialized defaults
// can't mask lower cascade tiers — the key simply isn't in the frontmatter
// Eleventy would read. Booleans/numbers/array elements stay: an unfilled
// toggle is indistinguishable from an intentional `false`.
export const stripEmpty = (v) => {
  if (Array.isArray(v)) return v.map(stripEmpty);
  if (!v || typeof v !== "object") return v;
  const out = {};
  for (const [k, val] of Object.entries(v)) {
    if (val === "" || val == null) continue;
    out[k] = stripEmpty(val);
  }
  return out;
};

// File/i18n entries hold default-locale fields on `data`, other locales under
// `i18n[locale].data`. Missing locale → default data (Eleventy would 404 the
// file, but a wrong-locale preview beats an empty one). Data-file entries get
// the same empty-field strip — Sveltia materializes their schema too.
const entryDataForLang = (entry, lang) => {
  const js = toJs(entry);
  return stripEmpty(js?.i18n?.[lang]?.data ?? js?.data ?? {});
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
  console.log(
    "[cms preview] dirData",
    Object.fromEntries(
      Object.entries(collectionData).map(([name, e]) => {
        const d = e && entryDataForLang(e, previewState.lang || "fr");
        return [
          name,
          d && {
            pageLayout: d.pageLayout,
            layout: d.layout,
            generatePage: d.generatePage,
            keys: Object.keys(d).length,
          },
        ];
      }),
    ),
  );
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
// HTML without it. A custom ALLOWED_URI_REGEXP changes processing of *all*
// uri-checked attrs (it stripped `d` off <path>), so instead a hook
// force-keeps exactly the attrs we need: `src`/`srcset` carrying `blob:` or
// `data:image/` urls — safe by construction (blob is opaque, img-loaded
// data: svgs can't script) and scoped to media attrs only.
// DOMPurify's URI policy strips `src="blob:…"`/`src="data:image/…"` wholesale
// and the forceAttribute hook does not reliably save them — park the values
// in `data-preview-*` (plain data-* attrs pass sanitize untouched) and swap
// them back after innerHTML insertion via restoreParkedSrcs.
export const sanitizeHtml = (html) => {
  if (!window.DOMPurify?.sanitize) return `<pre>${escapeHtml(html)}</pre>`;
  const parked = String(html ?? "").replace(
    /\b(src|srcset)="(blob:|data:image\/)([^"]*)"/gi,
    (_, attr, scheme, rest) => `data-preview-${attr}="${scheme}${rest}"`,
  );
  const out = window.DOMPurify.sanitize(parked);
  const count = (s, re) => (String(s).match(re) || []).length;
  console.log("[cms preview] sanitize", {
    blobSrcIn: count(html, /src="blob:/g),
    parkedSrcOut: count(out, /data-preview-src="blob:/g),
  });
  return out;
};

// Post-innerHTML: restore parked media attrs. Call on the inserted subtree.
export const restoreParkedSrcs = (root) => {
  for (const el of root.querySelectorAll(
    "[data-preview-src],[data-preview-srcset]",
  )) {
    const src = el.getAttribute("data-preview-src");
    const srcset = el.getAttribute("data-preview-srcset");
    if (src) {
      el.setAttribute("src", src);
      el.removeAttribute("data-preview-src");
    }
    if (srcset) {
      el.setAttribute("srcset", srcset);
      el.removeAttribute("data-preview-srcset");
    }
  }
};
// "Eleventy lite": Nunjucks + markdown-it in the bundled renderer. Falls back
// to Sveltia's marked if the rich pipeline throws.
export const renderMarkdown = async (src, data) => {
  try {
    return await getRenderer().renderRich(String(src ?? ""), data);
  } catch (e) {
    console.error("[cms preview] render error", e);
    return window.marked?.parse
      ? window.marked.parse(String(src ?? ""))
      : `<p>${escapeHtml(src)}</p>`;
  }
};
export const setHtml = (el, html) => {
  el.innerHTML = sanitizeHtml(html);
  restoreParkedSrcs(el);
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
// Singleton: one renderer/env for the session. The render cascade is read
// live from previewState so entry switches/keystrokes don't rebuild it.
// The full data cascade is rebuilt only when one of its inputs changed —
// reference compare on previewState pieces (each refresh swaps entry/page/
// computed/collections; hydrate swaps siteData). Within a refresh the many
// cascade() calls hit this memo instead of re-deep-merging.
let cascadeCache = null;
let cascadeKey = null;

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

const buildCascade = () =>
  // Deep-merge in Eleventy precedence: global/constants < directory data
  // files (shallow dir → deeper dir) < page entry/computed < plumbing —
  // objects compose, scalars and arrays of the later source win.
  cascadeMerge(
    {
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
    // `<lang>/<lang>.yaml` (dataFiles.translatedData) applies everywhere
    // under <lang>/; `<coll>/<coll>.yaml` is that collection's deeper dir file.
    entryDataForLang(previewState.siteData.translated, previewState.lang),
    entryDataForLang(
      previewState.siteData.collectionData?.[previewState.collectionName],
      previewState.lang,
    ),
    previewState.computed ?? previewState.entry ?? {},
    {
      collections: previewState.collections,
      lang: previewState.lang,
      page: previewState.page,
      // Preview-only marker so templates can gate node-only blocks
      // (`{% if not cmsPreview %}`) — e.g. fs `glob`/image filters.
      cmsPreview: true,
    },
  );

let renderer;
export const getRenderer = () =>
  (renderer ??= createRenderer({
    getCascade: () => {
      const s = previewState;
      const key = [
        s.siteData,
        s.collections,
        s.computed,
        s.entry,
        s.page,
        s.lang,
        s.collectionName,
      ];
      if (cascadeKey?.every((v, i) => v === key[i])) return cascadeCache;
      cascadeKey = key;
      const out = buildCascade();
      console.log("[cms preview] cascade", {
        collectionName: s.collectionName,
        collDataKeys: Object.keys(s.siteData.collectionData ?? {}).filter(
          (k) => s.siteData.collectionData[k],
        ),
        pageLayout: out.pageLayout,
        layout: out.layout,
        generatePage: out.generatePage,
      });
      return (cascadeCache = out);
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
    // Field values carry media paths (`src`, image objects…) — resolve to CMS
    // blob urls before they reach toBlock output (see resolvePreviewAsset).
    src = component.toBlock?.(resolveAssetsDeep(data)) ?? "";
  } catch {}
  return asyncPreview(getRenderer().renderRich(src));
};
