# CMS Preview — Working Doc

## Guidelines (from request — keep in mind all along)

- Goal: make the preview feature **leaner and maintainable**. Document the feature as it **SHOULD** be, not as it is.
- Proceed step by step: assess → big picture → specific paths → exceptions/fallbacks.
- Challenge inline comments written under false assumptions.
- Where current code diverges from the lean/sane approach: record in the Divergence todo list.
- Preview does **not** need full parity with the built site. It must _mostly look like_ the end result and update in (almost) real time while editing data.
- Pragmatism over completeness. YAGNI.
- Test content dir: `_content-copy`. Use `rtk` + short outputs to spare context.

## Status

- [x] Phase 1 — Big picture map (data flow, module responsibilities)
- [x] Phase 2 — Per-module assessment (should-be vs is)
- [x] Phase 3 — Exceptions & fallbacks audit
- [x] Phase 4 — Divergence list agreed with maintainer
- [x] Phase 5 — Refactor execution (A7 + B1–B5 done)
- [x] Phase 6 — Verification: dev build ✓, bundle exports ✓, headless render of real `test.md` body (sections + collection + layout) ✓. In-browser iframe pass pending maintainer check.

---

## 1. Big picture

### What the feature IS

A Sveltia CMS setup where entry previews render through the **real site pipeline** (Nunjucks + markdown-it + project partials + UnoCSS) inside the CMS's preview iframe, updating on each keystroke. Two preview surfaces:

1. **Entry preview** (per folder collection): whole page = layout + body/sections, rendered by the bundled renderer.
2. **Editor-component preview** (in the markdown field widget): a component's `toBlock` output rendered through the same pipeline.

### Asset pipeline (build time — `cms-config/index.js`)

Eleventy plugin `cms-config` emits everything under `dist/admin/`:

| Artifact                            | Producer                                      | Kind                                                                                                                                                  |
| ----------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/admin/index.html`                 | `page.js` template                            | Sveltia shell: registers preview styles + editor components + `registerPreviewTemplates`                                                              |
| `/admin/config.json`                | `config.js`                                   | Sveltia collection config                                                                                                                             |
| `/admin/env.js`                     | `index.js` inline template                    | Serialized build constants: collections, `previewEnvConstants`, static globalSettings/brandConfig, `njkFilterNames`, `previewOnlyCollections`         |
| `/admin/preview-renderer.js`        | esbuild bundle of `preview-renderer.entry.js` | Self-contained renderer: nunjucks, md, filters, partials, layouts, `_data`, UnoCSS generator. `env.config.js` imports are aliased to `browser-env.js` |
| `/admin/preview-runtime.js`         | passthrough copy (RAW source)                 | State, asset/icon brokering, CMS hydration, orchestration, sanitize, uno overlay                                                                      |
| `/admin/previewTemplates.js`        | passthrough copy (RAW source)                 | Thin Sveltia lifecycle adapter per folder collection                                                                                                  |
| `/admin/admin-url.js`               | passthrough copy                              | entry-url helper shared by raw modules                                                                                                                |
| `/admin/defaultEditorComponents.js` | passthrough copy                              | component defs; `toPreview` defaults to `defaultComponentPreview`                                                                                     |
| `/admin/preview.css`                | UnoCSS generate over a static corpus          | preflight + utility layer                                                                                                                             |
| `/admin/image-manifest.json`        | `eleventy.after`                              | `/_images/x` → published `/assets/images/…` variants                                                                                                  |

Generated JS modules under `preview/generated/` feed the **bundle only**:
`preview-njk-sources` (raw .njk/.md strings), `preview-partials` (`.11ty.js` import map), `preview-layouts` (sources + import map), `preview-data` (`_data` parsed to object), `preview-userconfig` (`htmlClasses` re-export), `preview-icons` (svg map + unpkg bases, written at `eleventy.after`).

### Runtime data flow (entry preview)

```
keystroke in Sveltia
  → component.refresh()                               [previewTemplates.js — thin adapter]
    → preparePreview(props, collectionName)           [preview-runtime.js]
        jobSeq++ (supersede guard)
        stash getAsset/getCollection → previewState
        resetAssetRetries()
        hydratePreviewFromCms()
          image-manifest.json (once)
          getCollection: globalSettings, brand, translatedData, <coll>Data
          → hydratePreviewEnv(constants + gs + brand)  [browser-env.js → deriveEnv]
        normalizeEntry() → previewState.rawEntry/entry/page/lang
    → debounce 200ms → runRender()
    → renderEntryPreview()                            [preview-runtime.js]
        fetchCollections() → toCollectionItem + upsert edited entry
          → per-item eleventyComputed pass (renderer.computeItem —
            nav titles/keys, pagePreview, templateTranslations… — the
            build computes every collection item; items must too)
        renderer.compute() → real eleventyComputed     [bundle]
        noPage? (permalink:false | previewOnly) → { html:"", noPage }
        renderRich(body) or renderSections(sections)   [bundle njk env + md]
        renderLayout(html)                             [bundle]
      → returns null if superseded (jobSeq moved on)
    → component: dangerouslySetInnerHTML: sanitizeHtml (DOMPurify — media attrs stay CMS paths)
    → updateUnoStyles (runtime UnoCSS generate over emitted html)
  → componentDidUpdate → applyHtmlClasses + postprocessMedia (media attrs → usable urls)
```

Async settles (asset `toBase64`, icon fetch, cold-store dir-data retry) set `assetsDirty`/`pendingAssets` → `scheduleAssetRerender` → `previewState.requestRerender()` → another `refresh()`.

### Boundaries — read before editing

- **Raw-served modules** (`preview-runtime.js`, `previewTemplates.js`, `admin-url.js`) are loaded by the browser from `/admin/`. Their bare relative imports (`./env.js`, `./preview-renderer.js`, `./admin-url.js`) resolve **at serve time**, not source time — `./env.js` is the generated `env.11ty.js` output, `./preview-renderer.js` is the esbuild bundle. Never "fix" these to source-relative paths.
- Dependency direction is one-way: raw modules → bundle → shared site modules. The bundle must never import a raw-served file.
- Pure helpers used by both sides (`cascadeMerge`, `toJs`, `stripEmpty`, `entryDataForLang`) live in the bundle and are imported back by the runtime.
- Shared shortcode semantics live in `plugins/partialShortcodes/handlers.js` — imported by the build plugin AND bundled into the preview. Edit once, both sides follow.
- **Media paths stay raw end-to-end.** `/_images/…` etc. are CMS storage paths — like the real build (eleventy-img shortcode + post-render transform), nothing resolves them early: entry data, `{{ x.src }}` interpolations and literal markup all emit them verbatim. `postprocessMedia` (runtime) is the ONE resolution pass, applied to the live DOM after sanitize: `src`/`srcset`/`poster`/`href`/`content` attrs get usable urls (published manifest url, else CMS blob) and `<img>`s get `srcset` backfilled while the manifest key is still the attr value. Attrs ALREADY carrying usable urls (`blob:`/`data:image/` — e.g. a freshly dropped unsaved asset, whose field value is the blob itself) are parked in `data-preview-*` by `sanitizeHtml` since DOMPurify strips those schemes, and restored by the same post-insert pass. Never reintroduce data-side resolution (`resolveAssetsDeep` was removed for exactly this: it broke the manifest key → lost srcset).

## 2. Modules

### 2.1 `preview-renderer.entry.js` — bundle entry / renderer factory

Stateless `createRenderer({ getState, constants })` → `renderRich`, `renderSections`, `renderLayout`, `compute`, `computeItem` (per-collection-item eleventyComputed with ambient `collections`/env context — call after `previewState.collections` is populated), `userHtmlClasses`. Owns **the single cascade** (`cascade()`, memoized on reference identity of every input) plus pure data helpers (`cascadeMerge`, `toJs`, `stripEmpty`, `entryDataForLang`) exported for the raw runtime. Also: runtime UnoCSS generator (content-keyed memo), `applyComputed` (real `eleventyComputed`), `previewFilterCollection`, layout chain renderer.

### 2.2 `preview-runtime.js` — orchestration, assets, state (raw-served)

Owns `previewState`, the monotonic `jobSeq` supersede guard, and the two-phase pipeline: `preparePreview` (stash accessors → hydrate → normalize entry) and `renderEntryPreview` (collections → computed → render → layout → `{html, noPage}`). Plus: media brokering (`resolvePreviewAsset` chain, manifest, blob/data-uri fetches, settle→rerender), `postprocessMedia` post-insert pass, icon brokering, `collectionItemData`/`toCollectionItem`/`fetchCollections` item shaping, `sanitizeHtml`, `applyHtmlClasses`, `updateUnoStyles`, `asyncPreview`, `defaultComponentPreview`.

### 2.3 `previewTemplates.js` — Sveltia adapter (raw-served)

~90 lines. `makePagePreview(collectionName)` = `window.createClass` component: lifecycle → `preparePreview`/`renderEntryPreview`; 200ms debounce; `render()` emits `sanitizeHtml(this.html)` into `.cms-page-preview`; `componentDidUpdate` re-applies `applyHtmlClasses` + `postprocessMedia`. Registration: every folder collection except `previewOnlyCollections`.

### 2.4 `preview-njk.js` — nunjucks env (bundled)

MapLoader over generated sources; `singleTag`/`pairedTag` extension builders; partial dispatch (`partial`/`component`/`htmlPartial` + wrappers); `{% section %}`, `renderFile`, `renderTemplate`/`renderContent`; **shared handlers** for section/collection/sections partial tags (`partialShortcodes/handlers.js`); real component shortcodes (link/button/embed/gallery/n/br); stubs (image via real arg-prep, icon via bundled map→unpkg, fetchFile/getBundle/css/js); real filters + `njkFilterNames` passthrough stubs.

### 2.5 `preview-md.js` — markdown-it (bundled)

markdown-it configured like the site's (containers, attrs, spans) + injected providers (`setAssetResolver`/`setSrcsetProvider`/`setStatsProvider`/`setIconResolver` — identity defaults). No render-time attr rewriting: `![img]` and literal-html media attrs emit CMS paths verbatim for the post-insert pass.

### 2.6 `browser-env.js` — env shim (bundled)

`env.config.js` stand-in via `let` bindings + `hydratePreviewEnv` (constants from `/admin/env.js` + globalSettings/brand from the CMS store → `deriveEnv`). Named `let` exports are required — shared modules do named imports and bundlers fail loud on missing names. Never read bindings at module top level.

### 2.7 `index.js` — generator (build time)

Writes the 6 generated modules via shared helpers: `writeIfChanged` (avoids watch loops), `jsSafeJson` (escapes U+2028/9 — **bug fixed**: `preview-data` previously double-escaped the literal text instead of the char), `collectFirstWins` + `partialKeyOf`/`partialSpecs` (priority-order dir specs), `importMapCode`. Also emits `/admin/env.js`, `/admin/preview.css`, the esbuild bundle (`env.config.js`→`browser-env.js` alias), `/admin/image-manifest.json` + icons module at `eleventy.after`, and the `resetConfig` watch targets.

### 2.8 `page.js` — admin shell

Injects preview styles + registers editor components + `registerPreviewTemplates(CMS)` via inline module scripts.

## 3. Exceptions & fallbacks

| Situation                            | Handling                                                                                                         | Verdict                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| njk parse error mid-typing           | `renderRichContent` falls back to raw-md render                                                                  | ✓ correct degrade                     |
| Unknown filter                       | passthrough stub `(v) => v ?? ""` via `njkFilterNames`                                                           | ✓ self-healing                        |
| Shortcode throws                     | `promisify`/paired wrapper → warn + `""`                                                                         | ✓                                     |
| Partial missing                      | `""` + warn; `_collectionItem` fallback when `data.pagePreview`; `_sections/catch-error.njk` for `{% section %}` | ✓ mirrors build                       |
| Section render throws                | `<p class="cms-preview-error">`                                                                                  | ✓                                     |
| Layout name missing                  | warn, unwrap; chain depth-capped at 4                                                                            | ✓                                     |
| Asset unresolvable                   | `""` (alt shown) + warn-once; published manifest url preferred; CMS blob→data-uri async then re-render           | ✓                                     |
| Icon absent from bundle map          | lazy unpkg fetch → re-render; else placeholder svg                                                               | ✓ pragmatic                           |
| `getCollection` fails per collection | warn + `[]`                                                                                                      | ✓                                     |
| Cold-store dir data missing          | retry ≤4 @800ms → rehydrate+rerender, then give up                                                               | ⚠ magic-number workaround, deliberate |
| Entry locale missing (`i18n[lang]`)  | falls back to default-locale data                                                                                | ⚠ silent wrong-locale, documented     |
| `permalink:false`/`previewOnly`      | blank preview + build-time `previewOnlyCollections` gate                                                         | ✓                                     |
| `DOMPurify` absent                   | escaped `<pre>` dump                                                                                             | ✓ loud                                |
| Superseded refresh/render            | `jobSeq` check → drop silently                                                                                   | ✓                                     |
| Empty-string fields                  | `stripEmpty` removes them so lower tiers show through                                                            | ✓ frontmatter semantics               |

## 4. Divergence list — status after refactor

### A. Dead code

- [x] A1 `refactor-styles.js` deleted (maintainer)
- [x] A2 `TEMP-PREVIEW-OUTPUT-SVELTIA.html` deleted (maintainer)
- [~] A3 `defaultEditorComponents.js` commented preview code — **kept intentionally** by maintainer
- [x] A4 `preview-njk.js` dead comments removed (`withAdminBadge`, icon alternates)
- [~] A5 `renderMarkdown` — **kept commented** by maintainer in runtime
- [x] A6 `page.js` dead `currentCollections` + console.logs removed (maintainer)
- [x] A7 telemetry `console.log`s dropped; unexpected-but-handled paths warn (`getCollection` failure, missing manifest, missed assets); existing `console.warn`s kept

### B. Structural

- [x] B1 **One cascade.** `createRenderer({ getState, constants })` — single merge (previewData < constants < dir files < entry/computed < plumbing/hydrated env), single memo. `buildCascade`/second memo deleted from runtime.
- [x] B2 **Generator helpers.** `collectFirstWins`/`partialSpecs`/`writeIfChanged`/`jsSafeJson`/`importMapCode` in `index.js`; fixed `preview-data` U+2028 escaping bug.
- [x] B3 **Shared handlers.** New `partialShortcodes/handlers.js` (name lists + `named`/`collection`/`sections` handlers via injected `renderPartial`/`renderContent`); plugin 134→28 lines; preview registers the same handlers.
- [x] B4 **Item shaping co-located** in runtime (`collectionItemData`, `toCollectionItem`, `fetchCollections`); dropped unused `getAsset` param.
- [x] B5 **Thin adapter.** `previewTemplates.js` 274→88 lines — lifecycle + debounce only; orchestration (`preparePreview`, `normalizeEntry`, `renderEntryPreview`, `applyHtmlClasses`) lives in runtime behind a `jobSeq` supersede guard.
- [x] B6 **One media pipeline.** `resolveAssetsDeep` + early resolution deleted — media paths flow raw through data/markup like the real build; `postprocessMedia` resolves all media attrs post-insert + backfills `srcset` from the manifest. Fixed: srcset missing on data-field images (early-published urls lost the manifest key), `| image` stats shim, `toBlock` baking blob urls into source, `globalSettings` images leaking `/_images/` outright. Parking shrank to one regex + a restore step inside `postprocessMedia` — still required for field _values_ that are already `blob:`/`data:` (fresh drops), which DOMPurify strips before insertion.
- [x] B7 **Computed data on items.** `fetchCollections` runs `computeItem` (real `eleventyComputed`) per item — previously ONLY the edited entry was computed, so nav titles/keys, `pagePreview`, `templateTranslations`, `metadata`, `ldType`… were all absent on items (empty main-nav `<a>` text — everything without an explicit frontmatter title). Item `data.page` stub (incl. `rawInput` for `h1Content`) is built before compute; `data.url` stays the admin editor url (deliberate). Hand-rolled `pagePreview`/`templateTranslations` stubs in `toCollectionItem` deleted — real computed supersedes them. After the main pass, `templateTranslations` re-runs selectively for every item — it embeds sibling items' data (title/pagePreview), so it needs all siblings computed (a FULL second pass would break non-idempotent fns like `metadata`; the selective re-run is a pure rebuild). Item shape matches Eleventy's collection items: top-level `fileSlug`/`filePathStem`/`inputPath`/`outputPath`/`date` + `page.date` (from `date`/`createdAt`) — `inputPath`/`outputPath` are synthetic (`<lang>/<coll>/<slug>.md`). Remaining residual: collection-level `*.11tydata.js` computed fns never run (e.g. plays' `playProjects`) — the CMS store can't serialize fns; would need build-time bundling.
- [x] B8 **Internal links → editor urls at the boundary.** `fetchCollections` builds `previewState.pageUrlMap` (`item.page.url` site url → `item.url` admin editor url); `postprocessMedia` rewrites matching `[href]` values (query/hash preserved). `{% link %}`/`{% button %}`, nav partials and `{{ item.url }}` anchors land on the CMS editor while keeping real shortcode markup parity (label via `locale_url`→`name`, attrs). The `previewLink` fallback stays for unresolvable refs. `item.page` stubs carry `filePathStem` (translation entries read `collectionItem.page.filePathStem`).

### C. Comments / docs

- [x] C1 `preview-md.js` stale comment fixed
- [x] C2 `pickManifestUrl` comment restated
- [x] C3 boundaries documented in §1

### D. Deliberate deviations — kept

- Async asset pipeline sets (pending/failed/missed + settle→rerender) — inherent to CMS blob lifecycle.
- `browser-env.js` `let`-bindings + registry — required for hydrated named exports.
- Cold-store dir-data retry (≤4 @800ms) — Sveltia store warms lazily.
- `entryDataForLang` default-locale fallback — wrong-locale beats empty.
