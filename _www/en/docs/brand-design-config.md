---
translationKey: brand-design-config
order: 2
lang: en
createdAt: 2026-05-13T07:42:00.000Z
ldType: WebPage
name: Brand & design config
docsNav:
  section: getting-started
  order: 4
vars: {}
---
{% raw %}
## Brand configuration

```yaml
ctxCssImport:
  filename: _ctx.css
inlineAllStyles: true
widthsContexts:
  - name: main
    max: 80rem
    prose: 50rem
fontStacksContexts:
  - name: main
    body:
      native: rounded-sans
      custom: Quicksand
    heading:
      native: rounded-sans
      custom: Quicksand
    code:
      native: monospace-code
customFontsImport:
  - name: Quicksand
    source:
      type: fontsource
      name: Quicksand
      weights:
        - '400'
        - '500'
        - '600'
        - '700'
        - '100'
        - '200'
        - '300'
        - '800'
        - '900'
      styles:
        - normal
      subsets:
        - latin
typeScales:
  - name: main
    minFontSize: 18
    maxFontSize: 20
    minTypeScale: 1.2
    maxTypeScale: 1.25
colors:
  - name: Vermillon
    value: '#de3831'
  - name: Delft-Blue
    value: '#343d63'
  - name: Gray
    value: '#807973'
  - name: White
    value: '#ffffff'
palettes:
  - name: gray-contrast
    text: White
    bg: Gray
    outline: ''
    text-emphasis: ''
    text--selection: ''
    bg--selection: ''
    shadow: ''
    caret: ''
    column-rule: ''
    fill: ''
    stroke: ''
    outline--focus: ''
styleContexts:
  - name: main
    value: ctx
```

The `brand.yaml` file is the central nervous system of your website's design. Instead of manually writing global CSS variables across multiple stylesheets, Poko uses this configuration file to automatically generate the design tokens (CSS variables) for widths, typography, fluid scaling, colors, and semantic themes.

Updating this single file will propagate design changes across the entire website.

### Global settings

- **`ctxCssImport`**: A boolean (true/false) that determines whether to import context-specific CSS.
- **`inlineAllStyles`**: A boolean that, when set to `true`, inlines all generated CSS directly into the HTML `<head>` for performance optimization.

### Widths (`widthsContexts`)

Defines the maximum constraints for your layouts to ensure content doesn't stretch too far on large screens.

- **`max`**: The absolute maximum width of the main website container (e.g., `80rem`).
- **`prose`**: The optimal reading width for text-heavy blocks, like articles (e.g., `50rem`).

### Typography & font stacks (`fontStacksContexts` & `customFontsImport`)

Defines the font families used across different HTML elements.

- **`fontStacksContexts`**: Assigns specific font stacks to semantic roles:
    - `body`: The default font for standard text.
    - `heading`: The font used for titles (`h1h6`).
    - `code`: The monospace font used for code blocks.
- **`customFontsImport`**: An array allowing you to define external font imports (like Google Fonts) to be injected into the CSS.

### Fluid typography scale (`typeScales`)

Controls how your typography scales responsively between mobile and desktop devices without using media queries.

- **`minFontSize` / `maxFontSize`**: The base font size (in pixels) for mobile and desktop screens, respectively.
- **`minTypeScale` / `maxTypeScale`**: The mathematical ratio used to generate the typography hierarchy (from `--step--2` up to `--step-6`). For example, a scale of `1.25` means `h2` is 1.25x larger than `h3`.

### Raw colors (`colors`)

The master list of all raw color values available in your design system. You define a custom `name` (e.g., `Gray`) and map it to a HEX or RGB `value` (e.g., `#807973`). These are the foundational building blocks for your palettes.

### Semantic themes (`palettes`)

This is where the magic happens. Instead of applying raw colors directly to HTML elements, poko groups colors into semantic **palettes**. This makes it incredibly easy to switch a section from "light mode" to "dark mode" just by changing the palette class.

- **`name`**: The class name of the palette (e.g., `main`, `contrast`). This generates a CSS class like `.palette-main`.
- **Semantic assignments**: Inside each palette, you map the raw color names (defined in the `colors` list) to specific semantic roles:
    - `text`: The main text color.
    - `bg`: The section's background color.

By applying a class like `.palette-gray-contrast` to a `{% section %}`, all text, backgrounds, and links inside that section will automatically use the mapped colors.
{% endraw %}