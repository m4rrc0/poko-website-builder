---
translationKey: content-model
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Content model
docsNav:
  section: developers
  order: 3
metadata:
  description: How content is structured — collections, frontmatter, i18n, data files and markdown extensions
---

{% raw %}

# Content model

## Files are the database

Every content entry is a Markdown file under `<CONTENT_DIR>/<lang>/<collection>/<slug>.md`. The build:

- groups files into **collections** (`pages`, `docs`, `articles`…) — folder name = collection name (auto-collections plugin);
- maps each file to a URL from its **name/slug** and language;
- links translations via `translationKey`.

## Collections

| Collection | Source | Notes |
| --- | --- | --- |
| `pages` | `<lang>/pages/` | Always on. The site's pages. |
| `docs` | `<lang>/docs/` | This documentation — `docsNav.section`/`order` frontmatter drives the nav. |
| `articles`, `people`, `events`… | `<lang>/<name>/` | Optional built-ins, enabled in Global Settings → Active Collections. |
| `pageLayouts`, `partials`, `htmlPartials` | `_partials/` | Reusable layouts & snippets (defined in the CMS for editors). |
| `dataFiles` | `_data/` | YAML/JSON data files editable in the CMS. |

## The frontmatter contract

Common fields on pages and collections (what the CMS writes):

```yaml
translationKey: about        # links translations across languages
lang: en
createdAt: 2026-01-01T00:00:00.000Z
name: About us               # title + slug source (localized)
ldType: WebPage              # schema.org type
eleventyNavigation:
  title: About
  parent: <page-uid>
order: 3                     # menu order among siblings
metadata:
  title: About us — Acme
  description: …
  image: { src: /_images/og.webp, alt: … }
preview:                     # card data for listings
  title: …
  description: …
  image: { src: …, alt: … }
tags: [<tag-ids>]            # relation → dataFiles tagsList
status: published            # published | draft | noindex | inactive
pageLayout: <layout-entry>
generatePage: normal         # or previewOnly — listable without a public URL
vars: { key: value }         # free key/value for templates
dataList: []                 # structured content items for templates
pageStyles: "…css…"          # page-scoped CSS
sections: []                 # the page-builder list (see Sections)
```

`BUILD_LEVEL` filters on `status` at build time (see [Architecture](/en/docs/architecture/#the-build-pipeline)).

## Internationalization

- Locales come from **Global Settings → Languages** (code + status + optional `keepUrlPrefix`).
- First language = default, clean URLs; others prefixed (`/fr/…`).
- `translationKey` links siblings; `{% link %}` resolves the language-aware URL.
- CMS i18n: `multiple_folders` — per-language content fields vs `i18n: "duplicate"` shared fields.

## Markdown extensions

Beyond CommonMark (see `markdown-containers.js`, shared with the CMS preview):

- `::: <tag>` containers — semantic tags (`section`, `aside`, `div`, `h1`–`h6`, `main`, `nav`, `header`, `footer`, `article`, `ul`, `ol`, `p`, `hgroup`) render as elements; named layouts (`box`, `flow`, `grid-fluid`, `cluster`, `switcher`, `cover`, `fixed-fluid`, `prose`) render as `<div class="name">`.
- `{.class #id k=v}` attributes (markdown-it-attrs) — `.poko` is the round-trip marker the editor's *Attributes* component writes first.
- `==mark==` (markdown-it-mark), `[spans]` (bracketed-spans), `markdown-it-link-attributes`.
- `breaks: true` — single newlines = `<br>`.

## Data files

`_data/*.yaml|json` are global (`data.` cascade). Editable ones appear in the CMS under **Data Files** (tags lists) and **Advanced Data**. `globalSettings.yaml` and `brand.yaml` back the two singletons.

{% endraw %}
