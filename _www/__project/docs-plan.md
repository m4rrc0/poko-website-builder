# Docs plan — `_www/en/docs/`

Two audiences on one docs shelf, marked by nav section:

- **Start here** — shared: setup walkthrough + concepts.
- **For editors** — CMS users who never clone the repo. Guidance on the CMS UI + concepts (partials, palettes, layouts, sections, utility classes) + an advanced-editing page (`:::` blocks, curly attrs, shortcodes).
- **For developers** — classic dev docs (setup, architecture, reference).

Review notes for @m4rrc0 are inserted inline as `::: aside {.review-note}` blocks
containing the text `REVIEW — @m4rrc0`. Grep `REVIEW` in `_www/en/docs/` to find them all.
They mark: missing screenshots, workflows I could not verify in the CMS UI, and
guesses to confirm. `.review-note` styling lives in `_www/_styles/local.css`.

## File map

### Start here (`docsNav.section: start-here`)

| file | status | notes |
| --- | --- | --- |
| `get-started.md` | rewrite | Full editor-oriented setup: fork → token → hosting (Cloudflare Pages + GitHub Pages) → CMS login → first config. Reuses `_images/tutos/*.webp` where still accurate + REVIEW notes for refresh. |
| `introduction.md` | new | What poko is, the moving parts (repo / content / CMS / build / hosting), which docs track to follow. |

### For editors (`docsNav.section: editors`)

| file | status | notes |
| --- | --- | --- |
| `cms-tour.md` | new | Login (PAT), sidebar anatomy (collections/singletons/assets), editor screen, save vs save & publish, preview pane, language switching, media library. |
| `site-settings.md` | new | Global Settings singleton walkthrough: site name, production URL, logo, htmlHead/cssHead, languages, active collections, link behavior. |
| `brand-design.md` | rewrite of `brand-design-config.md` | Styles Config → Brand: colors, palettes (read/tone/pop/neutral + variants + advanced defaults), type scales, font stacks, widths, style contexts. |
| `pages.md` | new | The Pages collection: create/edit, name↔slug, nav fields, metadata/SEO, preview card, tags, status, generatePage, page layout, page styles, vars, dataList. |
| `sections.md` | new | Section builder: the 7 section types (Raw, Grid, Flow, Two Columns, Reel, Collection List, Builder), header/footer, layout options, wrapper, utilities picker. |
| `editing-content.md` | new | Richtext toolbar + editor components (link, image, icon, partial, wrapper, attributes/curly, code block, inline sections). |
| `media-files.md` | rewrite of `media-icons.md` | Media library, image fields (alt/width/aspectRatio/loading), asset collections (_files, _partials, _data), icons. |
| `navigation-menus.md` | new | How nav is built from page fields (eleventyNavigation: title/parent/order), language switcher, links in content. |
| `languages.md` | new | i18n: enable a language, translate pages, localized slugs, per-language status. |
| `collaborators.md` | new | GitHub collaborators + organizations & multi-site (from FR tutos). |
| `advanced-editing.md` | new | `::: ` containers, `{.class}` curly attrs & `.poko` marker, `==mark==`, `[spans]`, raw shortcodes, frontmatter anatomy. |
| `troubleshooting.md` | new | FAQ: publish flow, rebuild delay, token issues, images, nav missing, preview quirks. |

### For developers (`docsNav.section: developers`)

| file | status | notes |
| --- | --- | --- |
| `introduction-setup.md` | keep + refresh | Dev setup, .env, bun/node. |
| `architecture.md` | new | Repo layout, src vs content dir, WORKING_DIR/CONTENT_DIR, build pipeline, themes, build levels. |
| `content-model.md` | rewrite of `content-authoring.md` | Collections, frontmatter reference, data files, i18n model, markdown extensions. |
| `sections-reference.md` | rename of `section-components.md` | Shortcode reference for sections. |
| `layout-primitives.md` | keep + refresh | Layout primitives reference. |
| `design-system-utilities.md` | keep + refresh | CTX CSS, UnoCSS, palette model. |
| `partials.md` | keep + refresh | Partials resolution + shortcode aliases. |
| `assets-css-js.md` | keep | Asset bundles. |
| `htmlclasses-js.md` | keep | htmlClasses.js transform. |
| `extending-the-cms.md` | keep + refresh | Custom editor components, field types, collections via `_config/index.js`. |
| `navigation-links.md` | keep + refresh | `link` shortcode + legacy YAML nav (marked legacy). |
| `deployment.md` | new | Cloudflare Pages, GitHub Pages/Actions, Netlify/Vercel, wrangler.jsonc, BUILD_LEVEL. |

Also: `_www/en/pages/docs.md` → rewritten as the docs landing page (audience routing).
`_www/_partials/docs-nav.md` + `_www/_config/index.js` → nav sections updated to
`start-here` / `editors` / `developers`.

## Todos

- [x] Survey CMS config, editor components, partials, FR tutos
- [x] Restructure docs nav (docs-nav.md + _config options + file frontmatter)
- [x] Write Start here pages (get-started rewrite, introduction)
- [x] Write For-editors pages (12 pages)
- [x] Refresh For-developers pages (+ architecture, content-model, deployment)
- [x] Docs landing page
- [x] Build `_www` to verify rendering — 26 pages, nav renders, images/shortcodes OK (needed `_config/index.js` import fix: `index.js`→`config.js`; and ctx-utilities.js `cssKeywordNames` fix)
- [ ] Report + open questions to @m4rrc0

## Open questions for @m4rrc0 (tracked inline too)

- CMS screenshots needed (login, sidebar, editor, preview, save menu, media
  library, sections list, styles config) — placeholders marked REVIEW.
- Old FR tutos images reused where still accurate — confirm which to refresh.
- GitHub Pages path: docs describe Pages-via-Actions (`.github/workflows/`),
  plus Cloudflare Pages — confirm preferred order for editors.
