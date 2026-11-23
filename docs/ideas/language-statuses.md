# Spec: Language status model (published / draft / inactive / archived)

Status: **draft — awaiting approval**

## Objective

Redefine language `status` semantics into a 4-tier matrix and fix the fresh-deploy
CMS lockout (`config.json` emitting site-level `i18n` with zero localized
collections — Sveltia blocks sign-in).

| status | in CMS locales | rendered on prod | rendered on non-prod (draft/`dev`) |
|---|---|---|---|
| `published` | yes | yes | yes |
| `draft` | yes | no | yes |
| `inactive` | yes | no | no |
| `archived` (new) | no | no | no |

Two changes vs today: `inactive` becomes CMS-editable (it currently is not), and
`archived` becomes the "defined but fully off" tier — entries can't be edited for
it, but the language row still shows in Global Settings (that singleton is not
localized, so this falls out naturally).

## Decisions (from review)

1. **`isCmsDefault` inferred on the CMS-visible set** (`published|draft|inactive`),
   not the renderable set — CMS default = first editable language.
   `isWebsiteDefault` and `noPrefixLang`/`prefix` inference stay on the renderable
   set (`published|draft`): never-rendered languages must not claim the unprefixed
   URL slot or the site default.
2. **`initialCmsSetup` keeps its meaning** ("no languages defined"). The CMS-config
   gate becomes `hasCmsLocales = locales.length > 0`, which subsumes it and also
   covers all-inactive (now editable → emits normally) and all-archived (suppresses
   everything but Global Settings — the recovery path).
3. **`archived` is language-level only** — not added to entry `statusField`.
   Entries are files; Sveltia can't hide them by field value, so "not in CMS" is
   meaningless there.
4. **Drop the silent `["en"]` `locales` fallback** — unreachable once `i18n` is
   gated on `hasCmsLocales`; it was masking real states with a ghost locale.
5. **Preprocessor-killed pages are fully absent** from `collections.all` (verified
   in Eleventy 3.1.2 `Template.js:getTemplates` → `[]`) — `locale_links` can't emit
   dead translation links. No fix needed.

## Tech Stack

- Eleventy 3.1.2 preprocessors → `shouldNotRender` render gate
- Sveltia CMS — runtime config validation blocks sign-in on errors
- `node --test`, `*.test.js` colocated

## Commands

```sh
npm test                                  # node --test, colocated *.test.js
npm run build:content                     # engine content build (emits /admin/config.json)
npm run dev:content                       # dev server variant
```

## Change map

| File | Change |
|---|---|
| `src/utils/languages.js` | Add `CMS_VISIBLE_STATUS = /^(published\|draft\|inactive)$/` (exported). `isCmsDefault` inferred on CMS-visible set; `isWebsiteDefault`/`noPrefixLang` stay on `RENDERABLE_STATUS` (unchanged value `published\|draft`). |
| `env.config.js` | `statusesToUnrender`: prod → `["draft","inactive","archived"]`, else → `["inactive","archived"]`. Update status vocabulary comment (:231). |
| `src/env/derive.js` | `statusesToUnrender` param default → `["draft","inactive","archived"]` (prod semantics). |
| `src/config-11ty/plugins/cms-config/preview/browser-env.js` | `statusesToUnrender` fallback default → same prod list. |
| `src/config-11ty/plugins/cms-config/config.js` | `locales` filter → `CMS_VISIBLE_STATUS`; `hasCmsLocales` gates top-level `i18n` + `collections` + user `singletons` + divider; remove `["en"]` fallback and `Array.isArray` guard; add `archived` to language `status` select; drop now-unused `initialCmsSetup` import. |
| `eleventy.config.js` | None — `shouldNotRender` reads `statusesToUnrender`/`unrenderedLanguages`, both flow from env.config. |

`page.js:152` preview-script gate stays on `initialCmsSetup` — under all-archived
it registers preview components against zero collections; harmless.

## Testing Strategy

`node --test`, colocated `*.test.js`:

- `deriveEnv`: language partition for each status across prod/non-prod
  `statusesToUnrender` lists (`languages`, `unrenderedLanguages`,
  `defaultLangCode` fallback, `initialCmsSetup`).
- `transformLanguage`: `isCmsDefault` on first CMS-visible lang (incl. when the
  first lang is `inactive`); `isWebsiteDefault`/`prefix` ignore `inactive` and
  `archived`.
- Manual/integration: `npm run build:content` with fixture globalSettings states —
  inspect emitted `_site/admin/config.json`:
  - no languages → no `i18n` key, `collections: []`, globalSettings only
  - all archived → same suppressed shape
  - `[en published, fr inactive]` → `i18n.locales: ["en","fr"]`, `default_locale` per CMS-visible order

`npm test` must stay green; test count must not fall (CONSTRAINTS.md).

## Boundaries

- **Always:** Sveltia config must pass runtime validation in every language-state
  combination (no languages / all-archived / all-inactive / mixed); `npm test`
  before done; keep `page.url === false` semantics distinct from preprocessor
  exclusion.
- **Ask first:** changes to `template/**` (it ships to consumers); adding runtime
  deps; touching `eleventy.config.js` preprocessor behavior beyond the list
  contents.
- **Never:** emit `i18n` without at least one localized collection/singleton
  (blocks CMS sign-in); emit `archived` codes into `i18n.locales`; weaken
  CONSTRAINTS.md.

## Assumptions (correct if wrong)

1. `BUILD_LEVEL === "draft"` counts as "non-prod" — draft languages render there
   (true today; unchanged).
2. CMS `default_locale` = explicit `isCmsDefault` in data if present, else first
   CMS-visible language.
3. Mixed list ordering: `locales` preserves globalSettings order, not
   status-grouped order.
4. Entry `statusField` is unchanged (no `archived`); `noindex` semantics
   unaffected.
5. Preview `statusesToUnrender` mirrors the build's deploy level — a prod build's
   CMS preview won't render drafts; existing behavior, unchanged.
6. No data migration — existing `published`/`draft`/`inactive` values keep
   meaning; `inactive` gains CMS visibility (intended).

## Success Criteria

- Fresh deploy (`languages: []`): `/admin/config.json` has no `i18n` key;
  collections empty; CMS sign-in reachable, zero validation errors.
- All-archived: same suppressed shape; the archived rows remain visible/editable
  in the Global Settings `languages` list.
- All-inactive: `i18n.locales` = the inactive codes; collections emitted; CMS
  fully editable; site renders no pages.
- `[en published, fr draft]`: prod build → only `/en`; non-prod/`draft` build →
  `/en` + `/fr`.
- `[en published, fr archived]`: `i18n.locales: ["en"]`; no `/fr` output ever;
  `fr` row still editable in Global Settings.
- `default_locale` never references a non-CMS-visible code; no `["en"]` ghost
  locale anywhere.
- `npm test` green with the new status-partition tests.

## Open Questions

None currently — flag during implementation if a hidden consumer of
`initialCmsSetup`/entry `status` appears.
