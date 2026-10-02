---
translationKey: site-settings
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Site settings
docsNav:
  section: editors
  order: 2
metadata:
  description: Configure your whole site — name, URL, logo, languages, collections, link behavior
---

# Site settings

**Global Settings** (in the CMS sidebar) controls your entire site. It's the first thing you configure on a new site — the CMS won't let you edit anything else until it's saved once.

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshot wanted — the Global Settings form, top half.

:::

## The fields

| Field | What it does | Notes |
| --- | --- | --- |
| **Site Name** | The name of your site — used in the browser tab, the header and metadata. | Required. |
| **Production URL** | Your site's public address, e.g. `https://your-project.pages.dev`. | Required — used for SEO tags, sitemap, RSS and social-sharing links. Include `https://`, no trailing slash. |
| **Logo** | Your site logo, shown in the header. | SVG is ideal (see [Media & files](/en/docs/media-files/)). |
| **HTML Head** | Extra code injected in every page's `<head>` — analytics snippets, verification tags… | Leave empty unless you have a snippet to paste. |
| **Head Styles (CSS)** | Extra CSS applied site-wide. | For small overrides; the main design is configured in [Brand](/en/docs/brand-design/). |

## Languages

The **Languages** list defines which languages your site exists in. Each entry has:

- **Language Code** — pick the language from the list (it maps to a code like `en`, `fr`…).
- **Status** — `published` (visible), `draft` (editable but not live), `inactive` (disabled).
- **Always keep this language prefix in URL** — by default the *first* language gets clean URLs (`/about`) and the others get prefixed ones (`/fr/about`). Enable this to force a prefix on that language too.

> ⚠️ Changing languages requires a rebuild to take effect — save, then wait for your host to finish before judging the result.

Full guide: [Languages](/en/docs/languages/).

## Active Collections

**Active Collections** turns optional content types on or off. Tick the ones you need — each enabled collection appears in the CMS sidebar:

Articles · Services · Events · Products · Projects · People · Organizations · Courses · Places · Reviews · FAQs · How-tos · Creative Works.

Enable only what you'll actually use — each collection adds sidebar entries and fields for your editors.

## Link behavior

Two small settings fine-tune how links behave:

- **Open links in a new tab** — choose which link types (external, internal, file, email) open in a new tab by default.
- **External links rel** — the default `rel` attribute applied to external links (`noopener`, `noreferrer`, `nofollow`).

## After you save

Every change here goes live the same way as any other edit: **Save and Publish**, wait for the rebuild, refresh your site.
