---
translationKey: assets-css-js
order: 10
lang: en
createdAt: 2026-05-13T07:46:00.000Z
ldType: WebPage
name: Assets (CSS & JS)
docsNav:
  section: advanced
  order: 2
vars: {}
---
{% raw %}
## Global assets

To add a global CSS file (such as a stylesheet for an external plugin), place your `.css` file in your `_content` directory (e.g., `_content/styles.css`). Poko automatically copies all CSS files found here to the final build.

You can then inject this file globally across your entire site by adding a `<link>` tag to the `htmlHead` property in your `_content/_data/globalSettings.yaml`.

## Local assets

You can add different scoped assets like styles (css), head (html) and javascript (js) local to a page or partial.

### Local styles

You can add one-off styles local to a page of partial.

```
{% css %}
.section {
  margin-block: var(--step-6);
  /* Anything you can do in CSS */
}
{% endcss %}
```

If you want to define styles locally but want to defer loading them by importing from an external css file, you can do this.

```markdown
{% css "external" %}
/* External CSS goes here */
{% endcss %}
```

### Local `<head>` HTML

```markdown
{% html "head" %}
<!-- E.g. your analytics snippet -->
{% endhtml %}
```

### Local javascript

```markdown
{% js %}
console.log("Look, this gets logged in the console.")
{% endjs %}
```
{% endraw %}