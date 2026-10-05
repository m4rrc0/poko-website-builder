---
translationKey: advanced-editing
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Advanced editing
docsNav:
  section: editors
  order: 11
metadata:
  description: "Power-user syntax for editors — ::: containers, {.attributes}, ==highlight==, partials and frontmatter"
---

{% raw %}

# Advanced editing

Everything here is optional — the toolbar and insert menu cover most needs. But sometimes you want more control: a styled box, a class on a heading, a raw shortcode. This page collects the syntax the CMS accepts inside rich text areas.

> Writing this syntax by hand is fine — the editor round-trips it. Just don't break the markers (`:::`, `{. …}`, `{% … %}`) or the component stops parsing.

## Highlighted & styled text

- `==highlighted text==` → highlighted (`<mark>`) — colors configurable per palette in Brand.
- `[text]{.some-class}` → wraps *text* in a span with a class.
- `` `inline code` `` → code styling.

## Curly attributes `{.class}`

Append `{.class-name #id attr="value"}` right after almost any element to give it classes, an ID or attributes:

```markdown
## A heading {.palette--pop}
Some paragraph {.prose .width-featured}
```

The **Attributes** component (insert menu) edits this for you — it stores `{.poko .your-classes}` with `.poko` first as a marker so the editor recognizes it. When you use Attributes, keep the `.poko` class first in the list.

::: aside {.review-note}

**REVIEW — @m4rrc0:** confirm `.poko` is purely a round-trip marker (no CSS meaning) — I documented it that way.

:::

## `:::` container blocks

Wrap content in a styled container by opening `::: name` and closing `:::`:

```markdown
::: aside {.callout .box .palette--tone}
## A note
This whole block is an aside with three classes.
:::
```

Two flavors of names:

- **Semantic elements** — `section`, `aside`, `article`, `header`, `footer`, `nav`, `main`, `div`, `p`, `hgroup`, `h1`–`h6` → render as that HTML element.
- **Named layouts** — `box`, `flow`, `grid-fluid`, `cluster`, `switcher`, `cover`, `fixed-fluid`, `prose` → render as `<div class="name">` using the matching layout style.

The **Wrapper** component builds these for you: select content → insert Wrapper → pick the tag — the `:::` appears around it.

Nesting works:

```markdown
::: section {.palette--tone}
::: div {.box}
Inner content
:::
:::
```

## Partials

**Partials** are reusable snippets — edit them once in the **Partials** (or **HTML Partials**) collection, and every place that inserts one stays in sync. Insert via the **Partial** / **Partial (HTML)** components, or by hand:

```markdown
{% partial "my-snippet.md" %}
{% htmlPartial "my-widget.html" %}
```

Use partials for: a contact block reused on many pages, a banner that changes weekly, a signature — anything you don't want to maintain in ten places.

## Raw shortcodes

Every insert-menu component ultimately writes a `{% shortcode %}` — you can type them directly if you prefer, though the menu is safer. Common ones:

```markdown
{% image src="/_images/photo.webp", alt="…", width="600" %}
{% linkSimple url="/en/about/", text="About us" %}
{% button "Contact", url="/en/contact/" %}
{% embed "https://youtube.com/…" %}
{% icon "tabler:heart" %}
```

When in doubt, insert via the menu and look at the raw markdown afterward — that's the fastest way to learn the syntax.

## Frontmatter (the page settings block)

Each content file starts with a `---` delimited block of settings — everything the form above the body edits (name, status, metadata, navigation…). In the CMS you never touch it directly; in GitHub you can edit it as YAML. The essential fields:

```yaml
name: About us
status: published
eleventyNavigation:
  title: About
  order: 3
metadata:
  description: What we're about
```

> A syntax error in frontmatter breaks the page's build — prefer editing through the CMS, which validates it.

{% endraw %}
