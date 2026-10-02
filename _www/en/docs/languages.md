---
translationKey: languages
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Languages
docsNav:
  section: editors
  order: 9
metadata:
  description: Run a multilingual site — add languages, translate pages, understand URLs and statuses
---

# Languages

poko sites can speak several languages. Everything starts in **Global Settings → Languages**.

## Adding a language

- In **Global Settings → Languages**, add an entry and pick the **Language Code** (`en`, `fr`, `de`…).
- Set its **Status**:
  - `published` — live and visible.
  - `draft` — editable in the CMS, not public yet.
  - `inactive` — fully disabled.
- **Always keep this language prefix in URL** — optional; see URL rules below.

Save and wait for the rebuild — the hint is literal: language changes only apply after a rebuild.

## How URLs work

- The **first** language in the list is the default: its pages have clean URLs (`/about/`).
- Other languages get a URL prefix: `/fr/about/`, `/de/about/`…
- Unless you enable *Always keep this language prefix* — then even the default language gets prefixed (`/en/about/`).

## Translating content

Content is translated **page by page, file by file**: a French page and its English twin are separate files linked by a shared translation key — the CMS links them automatically as long as you create translations through the locale switcher rather than copying files by hand.

- In an editor, use the **locale menu** to switch the editing language. Fields then show/write that language's content.
- Not every field is translatable: shared values (a palette choice, a collection pick) are duplicated across languages automatically; text fields are per-language.
- **Page names are translated** — so slugs are too (`/a-propos/` vs `/about/`). This is what makes localized URLs work.

## What visitors see

- Only `published` languages appear on the site (nav switcher, URLs, sitemap).
- The language switcher links between translations of the *same* page — if a page has no translation, behavior depends on your theme (typically it just isn't listed).

::: aside {.review-note}

**REVIEW — @m4rrc0:** what happens when a visitor hits a page that has no translation in the active language — 404, fallback to default language, or redirect? One line to confirm.

:::

## Practical workflow

1. Publish the default language first and complete the site.
2. Add the second language as `draft` — translate pages calmly without exposing anything.
3. When ready, switch it to `published` and save.
