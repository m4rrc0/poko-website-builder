---
translationKey: section-components
order: 7
lang: en
createdAt: 2026-05-13T07:45:00.000Z
ldType: WebPage
name: Section components
docsNav:
  section: building-pages
  order: 2
vars: {}
---
{% raw %}
Sections are high-level wrappers that combine layouts with headers and footers.

## Common attributes

All section wrappers (`sectionGrid`, `sectionTwoColumns`, `sectionCollection`) and their internal layout counterparts (`grid`, `twoColumns`, `collection`) share a set of fundamental attributes. You can pass these to any of the shortcodes to customize their HTML output.

- **`class`**: Allows you to inject custom CSS utility classes directly into the component's HTML wrapper (e.g., `class="my-custom-spacing background-dark"`).
- **`tag`**: Overrides the default HTML tag used to wrap the content.
    - For section wrappers (like `sectionGrid`), the default is `<section>`.
    - For inner layouts (like `grid` or `twoColumns`), the default is `<div>`.

## `{% sectionHeader %}` & `{% sectionFooter %}`

Used consistently across all section components to provide a standardized, semantic structure for your content. They help organize the layout by defining a clear introduction and conclusion for any section wrapper.

- **`{% sectionHeader %}`**: Defaults to a `<header>` tag. Commonly used for section titles (`<h2>`) and introductory text.
- **`{% sectionFooter %}`**: Defaults to a `<footer>` tag. Commonly used for call-to-action buttons or links.
They both accept the common `class` and `tag` attributes.
**Example usage**:

```markdown
{% sectionGrid %}
  {% sectionHeader class="text-center" %}
    <h2>My Section Title</h2>
    <p>Introductory text goes here.</p>
  {% endsectionHeader %}

  <!-- Layout content here -->

  {% sectionFooter %}
    <a href="/about" class="button">Learn more</a>
  {% endsectionFooter %}
{% endsectionGrid %}
```

## `{% wrapper %}`

A versatile, non-semantic container (defaults to a `<div>` tag). You can use this when you need a simple wrapper without the semantic meaning of a `<section>`.

**Example usage**:

```markdown
{% wrapper class="palette-vermillon" %}
  Content goes here
{% endwrapper %}

{% wrapper tag="section" class="padding-large" %}
  Content wrapped in a section tag
{% endwrapper %}
```

## `{% sectionGrid %}` & `{% grid %}`

Used to create a responsive grid of items. The `{% sectionGrid %}` acts as the semantic wrapper, while `{% grid %}` manages the column logic. By default, it automatically applies a `.switcher` layout if there are 3 or fewer items, or a `.grid-fluid` layout for 4 or more items.

**Example usage**:

```markdown
{% sectionGrid class="padding-large" %}
  {% sectionHeader %}
    <h2>My Grid Title</h2>
    <p>Some description</p>
  {% endsectionHeader %}
  
  {% grid type="grid-fluid" columns="3" gap="2rem" widthColumnMin="250px" %}
    {% gridItem %} First Item {% endgridItem %}
    {% gridItem %} Second Item {% endgridItem %}
    {% gridItem %} Third Item {% endgridItem %}
  {% endgrid %}
  
  {% sectionFooter %}
    <a href="#">See more</a>
  {% endsectionFooter %}
{% endsectionGrid %}
```

### **Shortcode attributes (for `{% grid %}`)**:

- `type`: Forces a specific layout type (e.g., `"grid-fluid"` , `"switcher"` , `“cluster”`).
- `columns`: Defines the exact number of columns.
- `gap`: Defines the spacing between grid items.
- `widthColumnMin`: The minimum width a column can shrink to before dropping a column and wrapping.
- `widthColumnMax`: The maximum width a column is allowed to expand to.
- `widthWrap`: The container threshold for the `switcher` layout.

**CSS variables generated**:

- `--columns`
- `--gap`
- `--width-column-min`
- `--width-column-max`
- `--width-wrap`

## `{% sectionTwoColumns %}` & `{% twoColumns %}`

Designed specifically for split layouts, such as text next to an image. By default, it uses a `.switcher` layout (symmetrical columns that stack vertically on mobile). It can also be configured to a `.fixed-fluid` layout, where one column is a fixed sidebar and the other fills the remaining space.

**Example usage**:

```markdown
{% sectionTwoColumns %}
  {% sectionHeader %}
    <h2>Two Columns</h2>
  {% endsectionHeader %}
  
  {% twoColumns type="fixedFluid" fixedSide="fixedRight" widthFixed="300px" gap="3rem" %}
    {% twoColumnsItem %} Fluid content taking up the main space. {% endtwoColumnsItem %}
    {% twoColumnsItem %} Fixed Sidebar (300px) {% endtwoColumnsItem %}
  {% endtwoColumns %}
{% endsectionTwoColumns %}
```

### **Shortcode attributes (for `{% twoColumns %}`)**:

- `type`: Set to `"fixedFluid"` for a sidebar layout. Otherwise, it defaults to a symmetrical `"switcher"`.
- `fixedSide`: Defines which side is fixed. Accepts `"fixedRight"` (adds the `.fixed-right` modifier class). The default is left.
- `widthFixed`: The specific width of the fixed sidebar.
- `widthFluidMin`: The minimum width of the fluid column before the layout is forced to stack.
- `gap`: The gap spacing between the two columns.
- `widthWrap`: The container threshold width for stacking the `.switcher` layout.

**CSS variables generated**:

- `--width-fixed`
- `--width-fluid-min`
- `--gap-fixed-fluid`
- `--width-wrap`
- `--gap-switcher`

## `{% sectionCollection %}` & `{% collection %}`

Used to query, filter, sort, and automatically display a list of items from your Eleventy collections (like articles, events, or organizations). It automatically renders the fetched items using `{% _collectionItem %}` inside a grid or switcher layout.

**Example usage**:

```markdown
{% sectionCollection class="latest-news" %}
  {% collection collection="articles" columns="4" gap="1.5rem" widthWrap="60rem" %}
{% endsectionCollection %}
```

### **How to add items to a collection**:

To make sure a Markdown file is picked up by a specific collection (for example, the `"articles"` collection), you must include that exact name inside the `tags` array in the file's YAML front matter.

```yaml
---
title: "My New Article"
description: "A short summary of the article."
lang: en
tags: ["articles"]
---
```

*(Note: Because poko is fully localized, ensure your markdown file also has the correct `lang` attribute—or is placed in the correct language folder—so the `{% collection %}` component can automatically filter and display only the items matching the current page's language).*

### **Shortcode attributes (for `{% collection %}`)**:

- **Data querying**:
    - `collection`: The name of the Eleventy collection to fetch (e.g., `"articles"`, `"organizations"`). Defaults to `"all"`.
    - `filters`: An array of custom filter criteria. *(Note: The component automatically applies a filter to only show items matching the current page's language).*
    - `sortCriterias`: Criteria to sort the collection items before displaying them.

### How filters work

You can add multiple filters to a `{% collection %}` to precisely control which items are displayed.

**Within a single filter — OR logic**

When you check multiple tags inside the same filter, the component returns items that match *at least one* of those tags. For example, selecting `tag1` and `tag2` in the same filter will return all articles that have `tag1` **or** `tag2` (or both).

**Across multiple filters — AND logic**

Each additional filter you add acts as a further restriction on the results. An item must satisfy *all* filters to be included. For example, if your first filter selects `tag1 OR tag2`, and your second filter selects `tag3`, only articles that have (`tag1` or `tag2`) **and** also `tag3` will be returned.

**Exclusion**

Enabling the exclusion toggle on a filter inverts its effect — instead of keeping items that match, it *removes* them from the results. For example, adding an exclusion filter for `tag3` means that any article tagged with `tag3` will be excluded, regardless of whether it matched the other filters.

- **Layout configuration** (Inherits `grid` properties):
    - `type`: Forces the layout type (`"grid-fluid"` or `"switcher"`).
    - `columns`: Number of columns for the collection items.
    - `gap`: Spacing between items.
    - `widthWrap`: Breakpoint width for the switcher layout.
    - `widthColumnMin`: Minimum width per column.
    - `widthColumnMax`: Maximum width per column.

**CSS variables generated**:

- `--columns`
- `--gap`
- `--width-column-min`
- `--width-column-max`
- `--width-wrap`

## **`{% sectionBuilder %}`**

A structural wrapper designed for custom or complex layouts that don't neatly fit into standard grids or flows. It acts as a semantic blank canvas (applying a `.section-builder` class), allowing you to freely compose custom areas within it.

**Example usage**:

```markdown
{% sectionBuilder class="padding-large" %}
  {% sectionHeader %}
    <h2>Custom Builder Layout</h2>
  {% endsectionHeader %}

<!-- Add your custom content, custom shortcodes, or raw HTML here -->

{% endsectionBuilder %}
```

## **`{% sectionFlow %}` & `{% flow %}`**

Used to create a robust vertical flow of items, automatically applying consistent spacing between them. The `{% sectionFlow %}` provides the semantic wrapper, while `{% flow %}` manages the vertical rhythm. It's particularly useful for stacking text, images, or disparate components where consistent vertical margins are required.

**Example usage**:

```markdown
{% sectionFlow %}
  {% sectionHeader %}
    <h2>My Flow Layout</h2>
  {% endsectionHeader %}

  {% flow gap="2rem" recursive="true" %}
    {% flowItem %} First stacked item {% endflowItem %}
    {% flowItem %} Second stacked item {% endflowItem %}
    {% flowItem %} Third stacked item {% endflowItem %}
  {% endflow %}
{% endsectionFlow %}
```

### **Shortcode attributes (for `{% flow %}`):**

- `gap`: Defines the vertical spacing between each flow item.
- `recursive`: When set to `"true"`, it applies the flow spacing recursively to all nested elements.
- `type`: Forces a specific flow layout type.

**CSS variables generated**:

- `-flow-space`

## **`{% sectionReel %}` & `{% reel %}`**

Designed to create a horizontal scrolling container, often used for carousels, image galleries, or a row of cards that overflows the screen width. The `{% sectionReel %}` acts as the semantic wrapper, while `{% reel %}` handles the horizontal overflow, spacing, and scrolling behavior.

**Example usage**:

```markdown
{% sectionReel %}
  {% sectionHeader %}
    <h2>Horizontal Reel</h2>
  {% endsectionHeader %}

  {% reel gap="1.5rem" itemWidth="300px" noBar="true" %}
    {% reelItem %} <imgsrc="img1.jpg"alt="First slide" /> {% endreelItem %}
    {% reelItem %} <imgsrc="img2.jpg"alt="Second slide" /> {% endreelItem %}
    {% reelItem %} <imgsrc="img3.jpg"alt="Third slide" /> {% endreelItem %}
  {% endreel %}
{% endsectionReel %}
```

### **Shortcode attributes (for `{% reel %}`):**

- `gap`: Defines the horizontal spacing between items in the reel.
- `itemWidth`: The base width for each item inside the reel container.
- `height`: The total height of the reel container.
- `noBar`: When set to `"true"`, it hides the default horizontal scrollbar (applies the `.no-bar` class).
- `type`: Forces a specific reel layout type.

**CSS variables generated**:

- `-gap`
- `-item-width`
- `-height`
{% endraw %}