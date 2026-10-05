---
translationKey: architecture
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Architecture
docsNav:
  section: developers
  order: 2
metadata:
  description: How poko is organized — source vs content, the build pipeline, themes and plugins
---

{% raw %}

# Architecture

poko separates **engine** (the Eleventy site builder you rarely touch) from **content** (the site you own and edit). A poko repository contains both.

## Repository layout

```
/
├── eleventy.config.js     # Eleventy config — the entry point
├── env.config.js          # Environment resolution (CONTENT_DIR, BUILD_LEVEL, i18n…)
├── package.json           # Scripts & deps (Bun or npm)
├── wrangler.jsonc         # Cloudflare Pages/Workers deploy config
├── .github/workflows/     # deploy.yml — unified Pages/Cloudflare deploy
├── src/                   # The engine
│   ├── config-11ty/       #   Eleventy plugins
│   │   ├── plugins/       #     cms-config, partialShortcodes, ctxCss, unocss,
│   │   │                  #     auto-collections, imageTransform, partials…
│   │   ├── shortcodes/    #     link, image, gallery, embed, button…
│   │   ├── filters/       #     filterCollection, sortCollection, htmlAttrs…
│   │   └── markdown-containers.js  # shared `:::` container config
│   ├── content/           #   Built-in content scaffolding (_partials, headless…)
│   ├── styles/ctx.css     #   The CTX design-system stylesheet
│   ├── themes/            #   Theme overrides (POKO_THEME)
│   └── data/              #   Global data pipeline (eleventyComputed…)
├── _content/              # Default content dir (CONTENT_DIR)
├── _demo/                 # Demo site content
├── _www/                  # This site's content
└── dist/                  # Build output (never edit)
```

## Source vs content

`CONTENT_DIR` (env) selects which top-level folder holds the site being built — `_content` by default, `_demo`, `_www`… `WORKING_DIR`/`CONTENT_PATH_PREFIX` can point at a content folder outside the repo entirely (content repo separate from engine repo).

A content directory has a predictable structure:

| Folder | Purpose |
| --- | --- |
| `_data/` | Global data files — `globalSettings.yaml`, `brand.yaml`, tags, nav… |
| `_partials/` | Reusable snippets (the source of truth for markup). |
| `_layouts/` | Page layouts (`.njk`). |
| `_styles/` | Local CSS (e.g. `local.css`). |
| `_images/`, `_files/` | Media — served at `/_images/`, `/assets/files/`. |
| `_config/index.js` | CMS config overrides — extra editor components, docsNav options, custom collections. |
| `<lang>/` | Content per language: `pages/`, `docs/`, collections… |

## The build pipeline

`node scripts/run.js build` (aliased as `bun run build` / `cf-build` / `build:gh-pages` / `build:demo`…):

1. **Env resolution** (`env.config.js`) — CONTENT_DIR, BUILD_LEVEL, REPO, languages from `globalSettings.yaml`.
2. **Eleventy build** — markdown → HTML through the plugin chain: auto-collections (folders → collections), computed data, i18n URL mapping, markdown-it (`:::` containers, `{.attrs}`, `==mark==`, `[spans]`).
3. **Partials & shortcodes** — `{% partial %}`, `{% section %}`, `{% grid %}`… resolve to `_partials/` markup.
4. **Assets** — images transformed (raster → WebP ≤5000px q92, SVG optimized); CSS bundles (ctx.css + local styles + UnoCSS utilities).
5. **`dist/`** — the static site, ready for any static host.

`BUILD_LEVEL` controls which content statuses build: `production` excludes drafts & inactive, `draft` includes drafts (all content), `active` excludes drafts.

## Themes

`POKO_THEME` selects a theme under `src/themes/` — a theme overrides partials/styles without touching content or engine. `default` is the base; themes layer custom look & feel over the same content.

## The CMS config pipeline

`/admin` is Sveltia CMS; its `config.yml` is **generated at build time** by `src/config-11ty/plugins/cms-config/config.js` from:

- the collections enabled in `globalSettings.yaml` (plus `pages` always),
- the singletons (Global Settings, Styles Config → Brand),
- the site's `_config/index.js` (your additions: collections, editor components, nav options).

So editing `_config/index.js` + rebuilding changes what `/admin` offers — see [Extending the CMS](/en/docs/extending-the-cms/).

{% endraw %}
