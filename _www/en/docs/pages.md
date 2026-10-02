---
translationKey: pages
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Pages
docsNav:
  section: editors
  order: 4
metadata:
  description: Create, organize and configure your site's pages from the CMS
---

# Pages

**Pages** is the first collection in the CMS sidebar — every entry is a page of your site. Create, reorder, and edit them all here.

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshot wanted — the Pages collection list + one open page form.

:::

## Creating a page

- In **Pages**, click **＋ (new)**. Give it a **Name** — this becomes the page title *and* its URL (`About us` → `/about-us/`). The homepage must be named `index`.
- Fill the fields you need (below), then **Save and Publish**.

## The page fields

| Field | What it does |
| --- | --- |
| **Name** | Page title and URL. Required. Translatable — each language can have its own name/slug. |
| **Body** | The main content — a rich text area for everything between header and footer that isn't structured in [sections](/en/docs/sections/). |
| **Sections** | The list of visual blocks that make up the page's layout — the heart of the page builder ([Sections](/en/docs/sections/)). |
| **Navigation** | Whether/how this page appears in the site menu ([Navigation & menus](/en/docs/navigation-menus/)). |
| **Order** | Its position among sibling pages in the menu. |
| **Metadata** | SEO fields: **Title**, **Description**, **Image** — used by search engines and when the link is shared. |
| **Page Preview** | The card shown when this page appears in a list elsewhere on the site: **Title**, **Description**, **Image** for listings. |
| **Tags** | Labels to group pages and filter them in collection sections. Tags come from the Tags List data file. |
| **Status** | `Published` (default) · `Draft` (hidden from visitors) · `Noindex` (visible but ask search engines not to list it) · `Inactive` (fully disabled). |
| **Page Layout** | Optional: pick a page template from the **Page Layouts** collection (leave empty for the default). |
| **Generate Page** | `Generate Page` (default) makes a real page · `Preview Only` keeps the entry for use in lists/previews without a public URL — useful for teasers that should never open. |
| **Variables** | Free-form key/value pairs available to the page's templates — advanced use. |
| **Data List** | Free-form content items (text, markdown, images) attached to this page for use by its templates — advanced use. |
| **Page Styles** | Custom CSS applied to this page only. |

You only need **Name** + content in **Body**/**Sections** to publish a page; everything else is optional.

## Organizing pages

- **Reordering:** the Pages list supports drag-and-drop (or edit the **Order** field) — this controls the menu order.
- **Parenting / submenus:** set in the Navigation field ([Navigation & menus](/en/docs/navigation-menus/)).
- **Translating:** on multilingual sites, create the page in each language — entries are linked by an internal key so visitors can switch languages ([Languages](/en/docs/languages/)).

## Homepage specifics

- The homepage must be named `index`.
- It's usually the busiest page: header/hero sections, content sections, footer — all managed through **Sections**.
