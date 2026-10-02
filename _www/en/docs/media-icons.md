---
translationKey: media-icons
order: 4
lang: en
createdAt: 2026-05-13T07:43:00.000Z
ldType: WebPage
name: Media & icons
docsNav:
  section: content
  order: 2
vars: {}
---
{% raw %}
## Images

The `{% image %}` shortcode is a powerful tool for injecting optimized, responsive images into your pages. Under the hood, it automatically processes, resizes, and caches your images using the Eleventy Image plugin.

It takes a set of named arguments to configure the image output:

1. **`src`** *(required)*: The local path or external URL to the image file.
2. **`alt`** *(optional)*: Alternative text for accessibility. *(Highly recommended!)*
3. **`width`** *(optional)*: The base width of the image in pixels. If provided, the shortcode will automatically generate `1x` (standard) and `2x` (retina) resolutions for the `srcset` attribute, and inject a `max-width` inline style to prevent layout shifts.
4. **`aspectRatio`** *(optional)*: Appends an `aspect-ratio-{value}` utility class to easily force a specific proportion (e.g., `aspectRatio="16/9"`).
5. **`class`** *(optional)*: Custom CSS classes applied directly to the `<img>` tag.
6. **`wrapper`** *(optional)*: Wraps the generated `<img>` tag inside a specified HTML element (e.g., `wrapper="figure"` or `wrapper="div"`).
7. **Standard HTML attributes** *(optional)*: You can natively pass standard image attributes like `title`, `loading`, `decoding`, `fetchpriority`, `sizes`, `id`, `style`, `height`, etc.

**Example usage:**

```markdown
{% image src="/assets/photos/landscape.jpg", alt="A beautiful mountain view" %}

{% image src="/assets/photos/landscape.jpg", alt="A beautiful mountain view", width="800", class="shadow-large", aspectRatio="16/9", wrapper="figure", loading="lazy" %}
```

### Image galleries

Iterate through a directory to create a gallery:

```markdown
{% for imagePath in "_images/gallery/**" | glob %}
  <div class="gallery-item">
    {% image src="/" + imagePath %}
  </div>
{% endfor %}
```

## Icons

[https://github.com/uncenter/eleventy-plugin-icons](https://github.com/uncenter/eleventy-plugin-icons)

The `{% icon %}` shortcode allows you to easily inject inline SVG icons from predefined libraries directly into your templates.

It takes a single mandatory string combining the library and icon name, followed by optional attributes:

1. **Library prefix**: The name of the icon library you want to pull from (e.g., `simple`, `tablerOutline`, `tablerFilled`).
2. **Icon name**: The specific name of the icon within that library. *(Note: The library prefix and icon name are separated by a colon `:`).*
3. **`width` & `height`** *(optional)*: Sets the dimensions of the SVG.
4. **`class`** *(optional)*: Injects custom CSS classes. *(Tip: Combine this with the `.icon` utility class from the layout primitives to automatically size and align the SVG with your text!)*
5. **Other raw attributes** *(optional)*: Any additional valid HTML attributes you want to add directly to the `<svg>` tag (like `aria-hidden="true"`, `stroke-width="2"`, etc.).

**Example usage:**

```markdown
<!-- Basic usage -->
{% icon "tablerOutline:bell" %}

<!-- Advanced usage with size, class, and accessibility attributes -->
{% icon "simple:github", width="32", height="32", class="icon text-primary", aria-hidden="true" %}
```

You can change the stroke’s color by:

1. changing the value with the attribute “stroke

```markdown
{% icon "tabler:download" %}
{% icon "star", stroke="#ed8a19", width="50" %}
```

1. changing the value with css

```css
.icon-tabler {
    stroke: var(--color-icon-stroke);
}
```

### Icon sets

Multiple [icon sets](https://github.com/uncenter/eleventy-plugin-icons?tab=readme-ov-file#popular-icon-sets) available. Currently, we pre-installed those 2:

- [Simple icons](https://simpleicons.org/) is the default (Does not need "simple:icon-name" in shortcode but you can set it anyway to avoid potential breaking changes in the future)
- [Tabler icons](https://tabler.io/icons) in two shapes:
    - Outline as "tabler:icon-name" or "tablerOutline:icon-name"
    - Filled as "tablerFilled:icon-name"
{% endraw %}