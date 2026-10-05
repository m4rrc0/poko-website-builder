---
translationKey: editing-content
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Editing content
docsNav:
  section: editors
  order: 6
metadata:
  description: Master the rich text editor — toolbar, links, images, and insertable components
---

{% raw %}

# Editing content

Every rich text area in the CMS (a page's Body, a section's content, a header/footer) works the same way: a toolbar on top, and an **insert menu** for special blocks.

::: aside {.review-note}

**REVIEW — @m4rrc0:** screenshot wanted — the rich text editor with the toolbar and the "insert component" menu open (component list visible).

:::

## The toolbar

Format text by selecting it and clicking a button:

- **Bold, Italic, Strikethrough** — inline emphasis.
- **Inline code** — `` `code` `` styling.
- **Heading 1–6** — section headings (use Heading 2 for main subsections, keep Heading 1 for the page title).
- **Bullet & numbered lists** — standard lists.
- **Quote** — blockquote styling.

## The insert menu

The more powerful part: the **+ (insert component)** menu embeds structured elements into your text, each with its own form so you never type code:

| Component | What it inserts |
| --- | --- |
| **Link** | A link dialog — pick the type (internal page, external URL, email, file, phone), the target, optional text and classes. |
| **Image** | An image with alt text, title, width, aspect ratio and loading options — the same options as image fields. |
| **Icon** | An inline icon. |
| **Partial / Partial (HTML)** | A reusable content snippet from the Partials / HTML Partials collections — insert once, update everywhere ([more on partials](/en/docs/advanced-editing/#partials)). |
| **Wrapper** | Wraps the selected content in a styled element (`div`, `aside`…) with classes — the building block of `:::` containers ([Advanced editing](/en/docs/advanced-editing/)). |
| **Attributes** | Adds `{.class #id attr=value}` attributes to the current element — colors, classes, IDs on paragraphs, headings, images… ([Advanced editing](/en/docs/advanced-editing/#curly-attributes)). |
| **Section > …** | Inline versions of every section type (Grid, Flow, Two Columns, Reel, Collection List, Builder) — a full section inserted inside body text. |
| **Sections** | A multi-section block. |
| **Code block** | A fenced code block with language. |

Insert a component → fill its form → it appears as a styled block in your text. Double-click it later to re-open the form.

::: aside {.review-note}

**REVIEW — @m4rrc0:** can you confirm the exact label of the insert menu button in Sveltia (the "+" / component icon) — I want editors to find it instantly.

:::

## Markdown underneath

Behind the scenes the editor writes **Markdown** — a plain-text format. You normally never see it, but it explains a few things:

- Formatting is stored as symbols (`**bold**`, `# heading`, `- list item`).
- Components are stored as shortcodes (`{% ... %}`) or `:::` blocks — if you ever peek at the raw file in GitHub, that's the syntax.
- The [Advanced editing](/en/docs/advanced-editing/) page teaches the raw syntax for when you want more control.

## Tips

- Paste from Word/Google Docs works, but formatting can carry over oddly — "paste as plain text" (`Ctrl+Shift+V`) is safer, then re-apply headings.
- An image inserted via the Image component has all the options of a normal image field (alt, ratio, lazy loading…).
- If a component looks broken, don't panic — the text around it is fine; you can always delete the block and re-insert it.

{% endraw %}
