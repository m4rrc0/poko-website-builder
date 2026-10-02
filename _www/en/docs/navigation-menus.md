---
translationKey: navigation-menus
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Navigation & menus
docsNav:
  section: editors
  order: 8
metadata:
  description: Control which pages appear in the site menu, in what order, and under which parent
---

# Navigation & menus

Your main menu is **built automatically from your pages** — there is no separate "menu editor". Each page decides whether it appears, under which parent, and in what order.

## Putting a page in the menu

On the page's form, open **Navigation**:

- The object being filled is what puts the page in the menu — leave it empty to keep the page out.
- **Title** — the menu label (defaults to the page name if empty — useful for a shorter label like `About` on an `About us` page).
- **Parent Page** — pick another page to nest this one under it, creating a dropdown/submenu.
- **Order** (a separate page field) — a number; lower numbers come first among siblings.

So the menu is a tree: top-level pages in order, each with their children in order underneath.

::: aside {.review-note}

**REVIEW — @m4rrc0:** how do submenu/dropdowns actually render on the www site (hover dropdown? always-expanded list? burger)? One sentence + a screenshot and this section is complete. Also confirm: does an empty Navigation object still mean "not in nav", or is there a toggle?

:::

## Ordering pages

Two ways control order — use both consistently:

- The **Order** field on each page (a number; sorted ascending).
- Drag-and-drop in the Pages list — which just edits those numbers for you.

## The language switcher

On multilingual sites, the header also shows a language switcher — it appears automatically from the published languages in [Global Settings](/en/docs/site-settings/#languages). Translated pages are linked by an internal key, so switching language stays on the same page.

## Links inside content

Links in body text and sections use the **Link** component — see [Editing content](/en/docs/editing-content/#the-insert-menu). Link types:

- **internal** — pick one of your pages/collection entries; the URL follows the page's slug automatically (and the current language).
- **external** — a full URL.
- **email** — `mailto:` link.
- **file** — a document from the Files library.
- **phone** — `tel:` link.

Whether each type opens in a new tab is set site-wide in [Global Settings](/en/docs/site-settings/#link-behavior).
