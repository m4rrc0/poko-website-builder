---
translationKey: design-system-utilities
order: 8
lang: en
createdAt: 2026-05-13T07:45:00.000Z
ldType: WebPage
name: Design system & utilities
docsNav:
  section: building-pages
  order: 3
vars: {}
---
Poko uses a set of global CSS variables and utility classes to maintain a consistent design system. This approach ensures that spacing, typography, and colors remain harmonious and responsive across the entire site.

## Widths

To prevent layouts from stretching infinitely and to maintain readability, Poko defines logical constraints for content wrappers:

- `--width-max`: The maximum site width (e.g., `80rem`). This variable is typically used by layout containers (like `.center` or `.grid-fluid`) to bound the outer edges of the website content on large screens.
- `--width-prose`: The optimal reading width (e.g., `50rem`). This is used for text-heavy areas—such as article bodies—to keep line lengths comfortable for the human eye (ideally around 65-75 characters per line).

## Typography

Poko uses a **fluid type scale** built with CSS `clamp()` to ensure text scales smoothly and proportionally across all device sizes. This eliminates the need for complex, pixel-based media queries while maintaining a perfect visual hierarchy.

### The fluid scale

The scale ranges from **`--step--4`** (the absolute smallest text, often used for fine print or small tags) up to **`--step-9`** (gigantic text, used for massive hero headers). The base body copy size is anchored at **`--step-0`**.

### Font stacks

Typography fonts are managed via three global CSS variables, making it extremely easy to apply custom web fonts across the entire project:

- `-font-stack-body`: Used for standard text (defaults to `system-ui, sans-serif`).
- `-font-stack-heading`: Used for all headings (`h1` to `h6` and `.h-` classes).
- `-font-stack-code`: A monospace stack used for `<code>`, `<pre>`, `<kbd>`, etc.

### Semantic tags vs. visual classes

Poko automatically applies the fluid scale to standard HTML elements to keep your HTML semantic. However, if you need a heading to *look* like an `H1` but semantically remain an `H2` (for SEO and accessibility), you can use the heading utility classes.

Poko extends the standard 6 heading levels to provide much more granular control:

**Example mapping:**

- `.h8` : `var(--step--4)` *(Smallest)*
- `.h7` : `var(--step--3)`
- `h6` / `.h6` : `var(--step--2)`
- `h5` / `.h5` / `small` : `var(--step--1)`
- `p` / `.p` : `var(--step-0)` *(Base text)*
- `h4` / `.h4` : `var(--step-1)`
- `h3` / `.h3` : `var(--step-2)`
- `h2` / `.h2` : `var(--step-3)`
- `h1` / `.h1` : `var(--step-4)`
- `.h0` : `var(--step-5)`
- `.h-1` : `var(--step-6)`
- `.h-2` : `var(--step-7)`
- `.h-3` : `var(--step-8)`
- `.h-4` : `var(--step-9)` *(Largest)*

**Example usage in HTML:**

```html
html<!-- Semantically an H2, but visually as large as an H1 -->
<h2 class="h1">My Big Section Title</h2>

<!-- Semantically a paragraph, but visually smaller -->
<p class="small">Copyright 2026</p>
```

## Colors & palettes

Instead of hardcoding colors on individual elements, colors in poko are defined as variables and smartly grouped into **palettes**.

Applying a palette class to a wrapper or section automatically updates the background color, text color, and border color for all elements inside it. This makes it incredibly easy to create alternating section themes or dark mode components.

**Example palettes:**

- **`.palette-gray`**: The default, standard theme. Typically renders dark text on a light/white background.
- **`.palette-gray-contrast`**: An inverted theme. Renders light/white text on a dark gray background.
- **`.palette-vermillon`**: A custom accent theme. Useful for highlighting specific call-to-action sections, banners, or important featured blocks.

## Utilities

The Poko design system includes several specialized utility classes to handle common UI patterns such as text truncation, full-bleed sections, interactive cards, and scroll indicators.

### `.background-overlay`

Overlays a background color onto an element using an inset `box-shadow`. This is particularly useful for adding a semi-transparent tint over background images to improve text readability.

- **Variables**:
    - `--color-bg`: The color of the overlay tint.

### `.background-shadow`

Creates a relative, isolated container that casts a massive inset background shadow behind its content via a `::before` pseudo-element.

- **Variables**:
    - `--color-bg`: The shadow/background color (fallback to `Canvas`).
    - `--color-text`: Ensures text remains legible against the shadow.

### `.truncate`

Truncates a single line of text and appends an ellipsis (`...`) if the text exceeds the width of its container.

### `.truncate-lines`

Clamps text to a specific number of lines using the `-webkit-line-clamp` property. Any overflowing text is hidden and ends with an ellipsis.

- **Variables**:
    - `--lines`: The maximum number of lines to display (default is `3`).

### `.truncate-lines-overflow`

An alternative, cross-browser fallback method for line clamping. It uses `max-height` and absolutely positioned pseudo-elements to place an ellipsis at the end of the visible text block.

- **Variables**:
    - `--lines`: The number of lines to display (default: `3`).
    - `--lh`: The line-height used to calculate the container's maximum height (default: `1.2em`).

### `.breakout-clickable`

Expands the clickable area of a child link to cover the entire parent container. This is the standard pattern for making entire Cards or Blocks clickable without wrapping everything in an `<a>` tag (which is bad for accessibility).

- **Companion classes**:
    - **`.clickable`**: Apply this to the specific child `<a>` tag that should trigger the click. (If only one `<a>` exists in the container, it will work automatically without this class).
- **Variables**:
    - `--shadow-breakout-clickable`: The default box-shadow of the card.
    - `--shadow-breakout-clickable-hover`: The box-shadow when hovering the card.
    - `--transform-breakout-clickable-hover`: The CSS transform applied on hover (e.g., lifting the card).
    - `--color-outline--focus`: Color of the focus ring for accessibility.
    - `--focus-offset`: The offset of the focus ring.

### `.full-bleed`

Forces an element to break out of its restricted container and span the entire width of the viewport (`99.99vw`).

- **Companion classes**:
    - **`.full-bleed-before`** and **`.full-bleed-after`**: Applies the full-bleed width solely to the `::before` or `::after` pseudo-elements.
- **Variables**:
    - `--full-bleed-max-width`: The maximum expansion width (defaults to `99.99vw`).

### `.full-bleed-bg` & `.bleed-bg`

Extends the background color of a container to the edges of the viewport using a clever `border-image` trick. This allows the background to be full-width while keeping the actual text/content safely aligned within the constrained layout.

- **Companion classes**:
    - **`.bleed-bg`**: Offers more granular control to bleed only specific sides (top, right, bottom, left).
- **Variables**:
    - `--color-bg`: The color to extend.
    - `--full-bleed-expand`: How far to bleed the background (default: `100vw`).
    - `--bleed-top`, `--bleed-right`, `--bleed-bottom`, `--bleed-left`: Specific directions for `.bleed-bg`.
    - `--bleed-block`, `--bleed-inline`: Logical directions for `.bleed-bg`.

### `.full-bleed-clip`

An alternative full-bleed method using a huge `box-shadow` combined with `clip-path` to extend the background color visually.

- **Variables**:
    - `--color-bg`: The background color.

### `.skew-border-before` & `.skew-border-after`

Creates an angled (skewed) background edge at the top (`before`) or bottom (`after`) of an element. Excellent for creating dynamic, non-horizontal section dividers.

- **Variables**:
    - `--skew-before`: The angle of the top skew (default: `1deg`).
    - `--skew-before-origin`: The transform origin for the top skew (default: `top left`).
    - `--skew-after`: The angle of the bottom skew (default: `1deg`).
    - `--skew-after-origin`: The transform origin for the bottom skew (default: `bottom left`).

### `.external-link-icons`

Automatically appends a small external link SVG icon after the text of outgoing links.

- **Companion classes**:
    - **`a.external`**: Apply this directly to a specific link element. Alternatively, applying `.external-link-icons` to a parent wrapper will automatically target all `a[target='_blank']` inside it.
- **Variables**:
    - `-icon-primary`: Sets the color of the SVG mask icon.

### `.scroll-shadows-horizontal`

Adds dynamic shadow gradients to the left and right edges of a horizontally scrollable container. The shadows act as visual affordances, indicating to the user that more content can be scrolled into view.

### `.scroll-shadows-radial-v` & `.scroll-shadows-radial-h`

Advanced dynamic scroll shadows utilizing radial gradients.

- **Companion classes**:
    - **`.scroll-shadows-radial-v`**: Applies top and bottom shadows for vertical scrolling.
    - **`.scroll-shadows-radial-h`**: Applies left and right shadows for horizontal scrolling.
- **Variables**:
    - `--_opacity-clr`: Internal private variable to dictate the shadow color and opacity (`rgba(0,0,0,0.2)`).

### `.v--[variable]:[value]` (Inline CSS Variables)

This extremely powerful utility class allows you to define or override CSS variables (Custom Properties) directly from your HTML classes, on the fly, without having to write any custom CSS code.

It is particularly useful for locally tweaking the behavior of [Layout primitives](https://www.notion.so/06-layouts-34f53578792080109b4fe0c11b9d3366?pvs=21) (like `.box`, `.flow`, or `.grid-fluid`).

- **Syntax**: `v--[variable-name]:[value]`
- **Key Feature**: If the value you assign starts with `--`, Poko understands that it is a reference to another CSS variable and automatically wraps it in a `var(...)` function.

**Usage Examples:**

**1. Assigning a static value:** If you want to force the `--padding-box` variable to `2rem` on one specific element.

```html
<!-- HTML -->
<div class="box v--padding-box:2rem">...</div>

<!-- Generated CSS result -->
.v--padding-box\:2rem {
  --padding-box: 2rem;
}
```

**2. Assigning a reference to another variable:** If you want a variable to inherit the value of another variable from your [Design System](https://www.notion.so/08-design-system-34f53578792080dd8453ee262ee1fcf5?pvs=21) (e.g., using the spacing defined by `--step-4`). The utility automatically adds the `var()` wrapper.

```html
<!-- HTML -->
<div class="flow v--flow-space:--step-4">...</div>

<!-- Generated CSS result -->
.v--flow-space\:--space-l {
  --flow-space: var(--space-l);
}
```

**3. Quickly customizing a layout:** Very useful for changing a grid's breakpoint or a gap without touching the global CSS files.

```html
<div class="grid-fluid v--width-column-min:300px v--gap:2.5rem">
  <!-- Grid items go here -->
</div>
```

### Tailwind 4

Tailwind 4 classes are supported in the project, but we strongly advise against relying on them excessively. Here is why:

- **Fluid design conflicts:** Poko relies on a dedicated fluid design system (managed via `brand.yaml`) for typography, spacing, and sizing. Mixing this with Tailwind's static or arbitrary utilities can break your layout's responsiveness and consistency.
- **CSS bloat & maintenance:** Hardcoding too many Tailwind utility classes clutters the HTML and bypasses the project's semantic CSS variables. This makes global theme adjustments (like changing a palette or a spacing scale) much harder to maintain.
- **Performance:** While Tailwind is optimized, overusing it alongside Poko's existing CSS architecture can unnecessarily increase the final bundle size.

*Best practice: Use Tailwind only for quick, one-off tweaks where creating a custom class or using the `v--` utility would be overkill.*

### Useful CSS snippets

[https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@view-transition)

```css
@view-transition {
    navigation: auto;
}
```