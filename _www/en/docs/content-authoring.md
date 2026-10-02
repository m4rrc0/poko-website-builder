---
translationKey: content-authoring
order: 3
lang: en
createdAt: 2026-05-13T07:43:00.000Z
ldType: WebPage
name: Content authoring
docsNav:
  section: content
  order: 1
vars: {}
---
{% raw %}
## Frontmatter & page creation

To create a new page or article, add a `.md` file in the appropriate language and collection directory within `_content` (for example, `_content/en/articles/my-new-article.md`).

At the top of every Markdown file, you must include a YAML **Frontmatter** block enclosed by `---`. This block defines the page's metadata.

Here is a quick dictionary of common keys:

- **`title`**: The main title of your page.
- **`description`**: A short summary of the page (useful for SEO).
- **`draft`**: Set to `true` to hide this page in production builds.
- **`layout`**: Specifies which layout template to use (e.g., `base`).
- **`date`**: The publication date, which also affects sorting in collections.
- **`translationKey`**: A unique identifier to link translated versions of the same page across different languages.

## Internationalization (i18n)

Poko natively supports multi-language sites. Translations are handled by keeping the same folder structure under different language directories (e.g., `_content/fr/` and `_content/en/`).

To link the English and French versions of the same article together, use the exact same `translationKey` in both of their Frontmatters.

When you use the `{% link %}` shortcode (as explained in [Navigation Links](https://www.notion.so/05-navigation-links.md)), you can simply pass this `translationKey`. Poko will automatically figure out the correct URL for the current user's language.

## SEO and meta tags

Poko handles SEO basics out of the box, but you can customize them through your Frontmatter and global configuration:

- **`<title>` and meta description:** These are automatically populated using the `title` and `description` defined in your page's Frontmatter.
- **OpenGraph / sharing image:** You can customize the image that appears when your page is shared on social media by adding an `ogImage` key in your Frontmatter, pointing to an image path.
- **Sitemap and favicon:** The sitemap is automatically generated during the build based on your published pages. For the favicon and global HTML `<head>` tags, you can configure them via `globalSettings.yaml`.
- **JSON-LD (structured data):** The project automatically injects JSON-LD structured data (following [schema.org](http://schema.org/) standards) to optimize SEO when metadata fields are filled out in the CMS for specific collections like articles or events. These fields are defined in `_content/_config/index.js` (e.g., configuring `startDate` for events).

## Markdown annotations

Standard Markdown is extended with several plugins:

### HTML `<mark>` element

[https://github.com/markdown-it/markdown-it-mark](https://github.com/markdown-it/markdown-it-mark)

```markdown
Here is some ==highlighted text==.

Renders `<p>Here is some <mark>highlighted text</mark>.</p>`
```

### HTML `<span>` element

[https://github.com/mb21/markdown-it-bracketed-spans](https://github.com/mb21/markdown-it-bracketed-spans)

```markdown
Here is a paragraph with [a span].

Renders `<p>Here is a paragraph with <span>a span</span>.</p>`
```

### HTML Attributes

[https://github.com/arve0/markdown-it-attrs](https://github.com/arve0/markdown-it-attrs)

```markdown

# My title { #css-id .css-class .other-class data-toggle=modal style=color:red;text-align:center }

<!-- ⚠️ Watch out when adding id attribute. The white space character before `#` is very important! Because `{# This is a comment in Nunjucks #}`.. Note the `{#` withour space at the beginning... -->
## My title { #css-id }

Here is a paragraph with [a span with a css class]{ .span-class }. {.p-class}

Renders `<p class="p-class">Here is a paragraph with <span class="span-class">a span with a css class</span>.`
```

### Containers

[https://github.com/markdown-it/markdown-it-container](https://github.com/markdown-it/markdown-it-container)

```markdown
::: div
This content will be wrapped inside a `<div>` element which is the basic non-semantic html 'box'.
:::

::: section
This content will be wrapped inside a `<section>` element.
:::
```

The list of wrapper elements is the following:

| ::: `container-name` | html element it maps to |
| --- | --- |
| aside | `<aside>` |
| article | `<article>` |
| footer | `<footer>` |
| header | `<header>` |
| nav | `<nav>` |
| main | `<main>` |
| ul | `<ul>` |
| ol | `<ol>` |
| div | `<div>` |
| block | `<div class="block">` |
| flow | `<div class="flow">` |
| grid-fluid | `<div class="grid-fluid">` |
| cluster | `<div class="cluster">` |
| switcher | `<div class="switcher">` |
| cover | `<div class="cover">` |
{% endraw %}