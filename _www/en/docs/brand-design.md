---
translationKey: brand-design
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Brand & design
docsNav:
  section: editors
  order: 3
metadata:
  description: Configure your site's colors, palettes, fonts and type scale from the CMS
---

# Brand & design

Your whole site's look is controlled from **Styles Config → Brand** in the CMS sidebar. Change a color or font here and it applies everywhere at once — pages, sections and components all read from the same settings.

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshots wanted — the Brand form showing (a) the Colors list and (b) a palette's four role colors.

:::

## How the color system works

poko colors are organized in a simple, powerful way:

1. **Colors** — your raw brand colors, each with a name and a color picker. This is your crayon box.
2. **Palettes** — each palette assigns four of your colors to four **roles**:
   - `read` — the most readable color (main text, and what text sits on)
   - `neutral` — neutral surfaces
   - `tone` — an alternative tone that sets the mood
   - `pop` — the accent that grabs attention (buttons, highlights)
3. **Where palettes are used** — your site defaults to the first palette, and any page, section or element can switch palette through the [Utility Classes picker](/en/docs/sections/#utility-classes) (`palette-myname`, plus `palette--*` variants like `palette--contrast`, `palette--pop`…).

Because palettes assign colors to *roles* rather than to elements, switching palette instantly recolors every element inside — text, backgrounds, buttons, links — in a coherent way.

::: aside {.review-note}

**REVIEW — @m4rrc0:** a side-by-side visual of the same section in 2–3 different palettes would make this concept click instantly. Even rough screenshots of the demo site would do.

:::

## The Brand fields

| Field | What it does |
| --- | --- |
| **Apply default styles** | Loads poko's base styles. Keep it on unless your developer built a custom stylesheet. |
| **Inline All Styles** | Inlines CSS into the HTML (faster first paint on small sites). |
| **Widths Contexts** | The max widths your content can use (e.g. `80rem` site width, `50rem` prose width). The first is the default. |
| **Font Stacks Contexts** | Font for body, headings and code — native font stacks are recommended for performance. |
| **Custom Fonts Import** | Load a real font from [Fontsource](https://fontsource.org/) (pick the font, weights, styles, subsets) instead of a native stack. |
| **Fluid Type Scales** | Your text sizing. Set min/max font size and type scale — text grows smoothly with the screen ([preview at utopia.fyi](https://utopia.fyi/type/calculator/)). First scale is the default. |
| **Colors** | Your crayon box: name + color picker for each brand color. *Save the file for new colors to appear in palette pickers.* |
| **Color Palettes** | Your palettes: each assigns colors to the `read`, `tone`, `pop`, `neutral` roles (all required). First palette is the site default. |
| **Style Contexts** | Named style groupings usable as `ctx-[name]` classes — advanced; your developer can use these for themed zones. |

## The palette's advanced options

Each palette has collapsible groups to fine-tune every element. You only need these when a default doesn't suit your design:

- **Advanced Defaults** — text, background, border, outline, shadow, caret colors…
- **Selected Text** — colors when a visitor selects text.
- **Strong / Emphasis / Highlighted / Visually important** — colors for bold, italic, highlighted (`==mark==`) and `<b>` text.
- **Heading** — heading text/background colors.
- **Link** — link text, background, and hover colors.
- **Button** — button colors for normal, hover and disabled states.
- **Code** — code text, background, border.
- **Default SVG & icon** — fill/stroke for SVGs and icons.
- **Scroll Bar** — track and thumb colors.

> Leave these collapsed groups empty and every element inherits sensible values derived from your four role colors.

## Safe experiments

Design changes rebuild the whole site, so experiment freely — worst case, you revert in GitHub (every save is a commit, so nothing is ever lost) or change the setting back and republish.
