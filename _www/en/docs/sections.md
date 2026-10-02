---
translationKey: sections
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Sections
docsNav:
  section: editors
  order: 5
metadata:
  description: Build your pages visually by stacking sections — grids, columns, reels, collection lists
---

# Sections

A page's **Sections** field is the page builder: each item in the list is a horizontal block of the page, stacked top to bottom. Add, reorder (drag), expand, duplicate and delete sections at will — the page is exactly the list, in order.

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshots wanted — (a) the "add section" type picker showing the 7 types, (b) one open section showing Header / items / Layout Options / Wrapper.

:::

## Anatomy of a section

Most section types share the same structure:

- **Section Header** — content shown above the section (usually a title, intro text or button), with its own classes/attributes.
- **Items / content** — the section's body (a list of items, two columns, a collection…).
- **Section Footer** — content shown below (a "see all" link, a note…).
- **Layout Options** — how items are arranged (see *Layout options* below).
- **Layout Class Names** — extra classes on the inner layout element.
- **Section Wrapper Options** — classes and attributes on the whole section: this is where the **Utility Classes picker** lives (palette, spacing, width…).

## The section types

| Type | What it is | Use it for |
| --- | --- | --- |
| **Section Raw** | A free rich-text area. | Plain content zones that don't need items. |
| **Section > Grid** | A list of items laid out on a grid. | Cards, galleries, feature lists, team members… |
| **Section > Flow** | A list of items stacked vertically with rhythm. | Long-form content, alternating text blocks. |
| **Section > Two Columns** | Two content columns (left/right objects). | Image + text side by side, intro + form… |
| **Section > Reel** | A horizontally scrolling strip of items. | Logos, testimonials, image carousels. |
| **Section > Collection List** | Auto-displays entries from a collection (articles, people…) filtered/sorted. | Latest articles, team listing, upcoming events. |
| **Section > Builder** | A structured zone with *build areas* — the most powerful type. | Complex layouts your developer configured. |

### Collection List details

The Collection List section auto-fills itself from your content:

- **Select a collection** — `All Collections`, `Pages`, or any active collection (Articles, People…).
- **Sort & Filter Options** — combine freely:
  - *Sort:* by date, by title, or random — with direction.
  - *Filters:* by tag, by name, first N, last N. Multiple criteria combine.
  - *Exclusions:* invert a filter (everything *except*…).
  - *Keep section visible when empty:* show a fallback message instead of hiding the whole section.
- **Item Partial** — how each entry looks: pick an HTML partial (e.g. a card) to render each item.

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshot wanted — a Collection List section's Sort & Filter Options open in the CMS.

:::

## Layout options

Each item-based section offers layout choices in **Layout Options** (leave it empty and the section type's default applies):

| Layout | Behavior |
| --- | --- |
| **No Layout** | Items render as-is. |
| **Switcher (Symmetrical Columns)** | Columns side by side on wide screens, stacked on small ones. |
| **Fluid Grid** | Auto-flowing grid (set column count and gap). |
| **Cluster** | Items grouped inline, wrapping naturally (tags, buttons, logos). |
| **Faux Masonry (CSS columns)** | Pinterest-style columns (min column width / count / gap). |
| **Fixed-Fluid (Asymmetrical Columns)** | One fixed-width column + one fluid (choose side and widths). |
| **Flow** | Vertical stack with consistent spacing (gap). |
| **Reel** | Horizontal scroll strip (item width, height, hide scrollbar). |
| **Gap** | Simple gap between items. |

## Utility Classes

The **Section Wrapper Options** expose a picker of pre-defined classes — the designer-approved toolbox that keeps pages consistent:

- **Palette** — `palette-name` applies one of your palettes; `palette--*` variants restyle it (contrast, pop background, tone background…).
- **Spacing** — `breathe` (padding), `no-padding`, `px-restore`, `squash`, `p-card`, `mx-auto`…
- **Width** — `width-prose`, `width-featured`, `width-body`, `width-outset`, `width-section`…
- **Typography**, **Borders** (`border`, `radius-*`), **Misc** (`bleed-bg`, `breakout-clickable`, `clickable`), **General** (`flex`, `grid`, `hidden`…).

Pick from the list rather than typing class names — it prevents typos and keeps naming consistent. See the full catalog in [Design system & utilities](/en/docs/design-system-utilities/) (developer page, but the class list applies to everyone).

## Tips

- Build pages top-down: hero → content → CTA. Drag sections to experiment — nothing breaks.
- One section, one idea. Many small sections compose better than one bloated section.
- A wrong palette is the most common "why does this look off" — check Section Wrapper Options first.
