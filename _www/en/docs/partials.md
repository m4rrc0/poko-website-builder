---
translationKey: partials
order: 9
lang: en
createdAt: 2026-05-13T07:45:00.000Z
ldType: WebPage
name: Partials
docsNav:
  section: advanced
  order: 1
vars: {}
---
{% raw %}
## Partials

Partials are pieces of pages.
They can hold static content or use variables and functions to be dynamic and adapt to the context they are used in (E.g. changing the text in the partial based on the page's language we use it on).

### Inline partials

Create a partial through the CMS (either a 'normal' partial in Markdown or an 'HTML Partial') or by creating a new file in the `_partial` directory (`.md` or `.njk`).
You can do pretty much anything you would in a page (including using all the power of Markdown and/or Nunjucks). The only difference is that you can not define data as frontmatter directly in the partial.

Then use your partials in your pages like so.

```
{% partial "snippet.md" %}
<!-- Will try and find "snippet.njk" in all 3 levels then "snippet.md" -->
{% partial "snippet" %}
{% partial "snippet.md", { ...anyData }, "njk" %}
{% partial 'snippet.njk, other-snippet.md' | partialFallback %}
{% partial ['snippet.njk', 'other-snippet.md'] | partialFallback %}
```

### Wrapper partials

```markdown
{% partialWrapper "wrapper.njk", { ...anyData }, "njk" %}

Any content can be added here and it will be passed to the partial as the `content` variable

{% endpartialWrapper %}
```

We look for partials in 4 levels:

- the project's `_partials/[lang]` directory
- the project's `_partials` directory
- the theme's `_partials` directory
- poko's `_partials` directory for default partials available

You can access to your partials files directly from the CMS in `/admin/#/assets/_content/_partials`

The `partial` shortcode has aliases. You can use any of those to accomplish exactly the same thing. This is useful for integrating with the CMS.
Inline partial:

- "partial"
- "htmlPartial"
- "component"
Wrapper partial:
- "partialWrapper"
- "htmlPartialWrapper"
- "componentWrapper"
{% endraw %}