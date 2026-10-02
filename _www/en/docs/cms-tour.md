---
translationKey: cms-tour
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: The CMS interface
docsNav:
  section: editors
  order: 1
metadata:
  description: Find your way around the poko admin — login, collections, editor, saving, preview
---

# The CMS interface

The CMS is where all your editing happens. You reach it at `your-site.com/admin`.

## Logging in

- Open `your-site.com/admin` and choose **Sign in with GitHub Using a PAT**.
- Paste the personal access token you created during setup ([Get Started, step 2](/en/docs/get-started/#step-2-create-a-personal-access-token)).

The token is stored in your browser — on a new device or a different browser you'll paste it again. Multiple editors each log in with *their own* GitHub account and token ([Collaborators](/en/docs/collaborators/)).

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshot wanted — CMS login screen (`_images/tutos/17-19-cms-connection*` exist but are dated).

:::

## The sidebar

The left sidebar lists everything you can edit:

| Sidebar item | What it is |
| --- | --- |
| **Pages** | Your website's pages — homepage, about, contact… |
| **Articles, People, …** | Optional content collections — they appear here once enabled in Global Settings ([Site settings](/en/docs/site-settings/)) |
| **Global Settings** | Site-wide configuration: name, URL, languages, active collections |
| **Brand** | Site-wide design: colors, palettes, fonts, type scale |
| **Page Layouts, Partials, HTML Partials** | Reusable page templates and content snippets ([Partials & layouts](/en/docs/advanced-editing/)) |
| **Data Files, Advanced Data** | Structured data (tags lists, settings) — advanced use |
| **Media / Files** | Image and file libraries ([Media & files](/en/docs/media-files/)) |

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshot wanted — the full sidebar on a configured site, annotated with the items above.

:::

## The editor screen

When you open an item you see a form built from **fields**:

- **Text fields** — titles, names, URLs.
- **Dropdowns and toggles** — pick from a list (status, layout, palette…) or switch options on/off.
- **Rich text areas** — the main content editor with a toolbar (bold, headings, links, images…).
- **Lists** — repeatable blocks: for example the *Sections* field on a page is a list where each item is a section you can add, reorder by dragging, expand/collapse, or delete.
- **Image fields** — pick an image from the media library or upload a new one.
- **Relation fields** — link to other content (e.g. choosing tags or a collection for a section).

Fields marked `*` are required — you can't save until they're filled.

## Saving your work

Changes exist only in the CMS until you save them. At the top-left of the editor:

- **Save** (arrow dropdown) → **Save and Publish** commits your changes to the repository. The host then rebuilds the site — your update is live after a minute or two (Cloudflare) or a few minutes (GitHub Pages).
- Editing creates *drafts*: if you close the browser without saving, the draft is kept locally and offered again next time — but nothing is published until you Save and Publish.

{% image src="/_images/tutos/24-cms-save-and-publish.webp", width="300" %}

> Save small and often. Each publish triggers a full rebuild, so avoid saving 20 times in a row while experimenting.

## The preview pane

Some editors show a live preview next to the fields. It is an approximation — the real styling lives in your site's CSS, so always check the real page after saving rather than trusting the preview pixel-perfect.

::: aside {.review-note}

**REVIEW — @m4rrc0:** is a preview pane enabled for the www site content types? If yes, a screenshot of a page being edited with preview open would anchor this section.

:::

## Working in several languages

If your site has more than one language ([Languages](/en/docs/languages/)):

- A language menu lets you switch the **editing locale** — the language of the fields you're typing in.
- Content collections are translated file-per-language: a French page and its English counterpart are linked automatically through their shared *translation key* — create the page in one language, then switch locale to write the other.
- Each language only publishes if its status is *published* in Global Settings.

## What happens when something breaks

If a save fails, the CMS shows an error — most often an expired or insufficient token. See [Troubleshooting](/en/docs/troubleshooting/) for the common fixes.
