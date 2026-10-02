---
translationKey: media-files
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Media & files
docsNav:
  section: editors
  order: 7
metadata:
  description: Upload and manage images, files and icons in the CMS
---

# Media & files

## The media library

Open **Media** (asset collections) in the CMS sidebar to browse everything you've uploaded:

| Library | What goes there | Where it lives in the repo |
| --- | --- | --- |
| **Images** | Photos, illustrations, your logo | `_images/` — served at `/_images/…` |
| **Files** | Downloadable documents (PDFs…) | `_files/` — served at `/assets/files/…` |
| **Global Partials** | Editable snippets uploaded as files | `_partials/` |
| **Data Files** | YAML/JSON data | `_data/` |

Upload by drag & drop into the library, or directly from an image field while editing a page.

## Images

Every image field (page image, section image, card image…) opens the same form:

- **Image** — pick from the library or upload.
- **Alt Text** — description for accessibility and SEO (~125 chars, specific, no "image of…"). Always fill it unless the image is purely decorative.
- **Title** — optional tooltip/caption text.
- **Width** — px; leave empty for automatic. Useful for optimization when the image isn't full-width.
- **Aspect Ratio** — crop to a ratio: Square `1`, Landscape `4/3`, Portrait `3/4`, Widescreen `16/9`, Ultrawide `18/5`, Golden `1.618/1`, or a custom value like `21/9`.
- **Loading** — `Eager` for images visible on page load (hero, logo); `Lazy` (or default) for everything else — faster pages.
- **Other Image Attributes** — raw extra attributes, advanced.

### What happens to your images

- Raster images (JPG, PNG…) are **automatically converted to WebP** and resized — upload the best quality you have, the site optimizes the rest (max 5000px, quality 92).
- SVG files are **optimized** automatically too — SVG is the preferred format for logos, icons and illustrations (crisp at any size, tiny files).

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshot wanted — the media library view, and an image field's edit form.

:::

## Icons

The **Icon** component (insert menu in rich text) embeds an icon by name from two libraries — no image file needed:

- [Simple Icons](https://simpleicons.org/) — brand logos (GitHub, Twitter…).
- [Tabler Icons](https://tabler.io/icons) — a large set of clean UI icons.

Pick the library, search the icon name, set an optional **Size**, **Class** and other attributes. Icons inherit the palette's icon colors (configurable per-palette in [Brand](/en/docs/brand-design/)).

## Files for download

Upload a PDF (or any document) to the **Files** library, then link to it from your content with the **Link** component — choose the `file` link type and pick the file.
