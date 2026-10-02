---
translationKey: layout-primitives
order: 6
lang: en
createdAt: 2026-05-13T07:44:00.000Z
ldType: WebPage
name: Layout primitives
docsNav:
  section: building-pages
  order: 1
vars: {}
---
Poko uses a "Primitives" approach for layouts. These can be used as CSS classes or Markdown containers.

### `.box`

Adds standard internal padding and a border to encapsulate an element.

- **Variables**:
    - `--padding-box`: Controls the size of the internal padding inside the box.
- **Companion Classes**: Often combined with background or border utility classes, or `.invert` if your design system supports automatic theme inversion inside specific boxes.

### `.flow`

The "Stack" layout. Automatically adds vertical space (`margin-top`) between sibling elements, pushing them apart.

- **Variables**:
    - `-flow-space`: Determines the exact amount of vertical space applied between the children.
    *(Tip: You can easily override this spacing directly in your HTML using the `v--` utility class. For example, `class="flow v--flow-space:--step-4"`. See [Design System Utilities](../design-system-utilities/) for more details).*
- **Companion classes**: `.horizontal` (changes the spacing direction to apply horizontal margins instead of vertical).

### `.center`

Centers a block horizontally within its parent and restricts its maximum width.

- **Variables**:
    - `--max-width` (or `--measure`): Defines the maximum width the element can expand to before it stops growing and remains centered.
- **Companion classes**: `.intrinsic` (centers the element based on its content's natural width rather than taking up the maximum allowed width), `.text-center` (to also center the text inside the wrapper).

### `.cluster`

Aligns children side-by-side (like tags or badges) and automatically wraps them to the next line if there isn't enough horizontal space.

- **Variables**:
    - `--space` (or `--gap`): Controls the spacing (gap) between the clustered items both horizontally and vertically.
- **Companion classes**: Combines perfectly with flexbox utility classes like `.justify-center`, `.justify-between`, or `.align-center` to control the distribution of the wrapped elements.

### `.with-sidebar` (formerly `.fixed-fluid`)

Creates a sidebar layout featuring one fixed-width column and one fluid column that takes up the remaining space.

- **Variables**:
    - `--width-sidebar`: Specifies the exact or maximum width of the fixed sidebar element.
- **Companion classes**: `.sidebar-right` (reverses the layout so the fixed-width sidebar appears on the right side instead of the default left).

### `.switcher`

Displays child elements horizontally side-by-side, but switches the entire group to a vertical stack if the container becomes too narrow.

- **Variables**:
    - `--width-wrap`: The container width threshold. If the container gets smaller than this value, the layout forces a vertical switch.
- **Companion classes**: `.limit-2`, `.limit-3`, etc. (Limits the maximum number of items allowed per row before the layout is forced to switch to a vertical stack).

### `.cover`

Ensures a section takes up a minimum viewport height. It pushes headers to the top, footers to the bottom, and perfectly centers the main content.

- **Variables**:
    - `--min-height-cover`: Defines the minimum height of the container (usually defaults to `100vh`).
- **Companion classes**: `.centered` (This class **must** be applied to the specific child element inside the cover that you want to be perfectly centered vertically).

### `.grid-fluid`

Creates an automatic, responsive grid layout. The columns automatically adjust and wrap based on the available space without needing media queries.

- **Variables**:
    - `--width-column-min`: Dictates the minimum width a column is allowed to be. If columns shrink below this size, the grid drops a column and wraps it to the next row.

### `.frame`

Forces an element (such as an image or video) to strictly respect a specific aspect ratio, cropping the overflowing content to prevent distortion.

- **Variables**:
    - `--n`: The numerator of the aspect ratio (e.g., `16` for a 16:9 ratio).
    - `--d`: The denominator of the aspect ratio (e.g., `9` for a 16:9 ratio).
- **Companion classes**: `.frame-inner` (Applied to the direct child, like an `<img>`. It ensures the media perfectly fills the frame and applies `object-fit: cover` to crop correctly).

### `.reel`

Creates a horizontally scrollable container, ideal for building carousels or card sliders that overflow the screen.

- **Variables**:
    - `--item-width`: Defines the specific width of each individual item inside the scrolling reel.
- **Companion classes**: `.no-bar` (hides the default scrollbar for a cleaner, touch-friendly UI), `.snap` (enables CSS scroll snapping so items neatly snap into place as the user scrolls).

### `.imposter`

Positions an element perfectly in the dead center of its closest relative container, overlaying the content.

- **Companion classes**: `.contain` (By default, an imposter might use `position: fixed` to overlay the entire viewport. Adding `.contain` forces it to use `position: absolute`, keeping it trapped inside its nearest relatively-positioned parent).

### `.icon` & `.with-icon`

Allows you to perfectly align an inline SVG icon with the text baseline of its accompanying text.

- **Companion classes**: `.right` (Applied to the `.with-icon` container to align the icon to the right side of the text instead of the left).

### `.pile`

Overlays all of its direct children exactly on top of each other in the same CSS grid cell. It is an excellent alternative to `position: absolute` for overlaying text on images.

- **Companion classes**: While the parent gets `.pile`, the children often use inline styles or utility classes like `align-self: end`, `justify-self: end`, or `place-self: center` to position themselves in specific corners or the center of the pile.