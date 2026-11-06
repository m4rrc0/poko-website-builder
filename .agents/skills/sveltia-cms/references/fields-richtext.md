# Field Types: Rich Text and Code

The RichText/Markdown and Code field types. For custom editor components, see `api-editor-components.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## RichText Field

The RichText field type provides a rich text editor that supports both Markdown and HTML content. It allows content editors to format text, add links, images and other media, making it a versatile choice for creating rich content.

**Note for Netlify/Decap CMS users**

For backward compatibility with Netlify/Decap CMS, the [Markdown](https://sveltiacms.app/en/docs/fields/markdown) field type remains available as an alias of the RichText field type. You can use either `richtext` or `markdown` as the `widget` value in your field configuration.

### User Interface

#### Editor

A [Lexical](https://lexical.dev/)-based rich text editor, including headings, lists, links, images, code blocks and more. It provides a user-friendly interface for writing and formatting content.

The built-in toolbar includes buttons for common formatting options, which can be customized using the `buttons` option. The editor also supports different modes, including a raw Markdown or HTML editing mode, which can be configured using the `modes` option. Additional editor components can be added to enhance the editing experience using the `editor_components` option.

Links are edited in a floating link editor:

- Placing the cursor in a link shows its URL along with buttons to edit or remove the link.
- Selecting text and clicking the Link button or pressing `Ctrl+K`/`Command+K` opens the editor to enter a URL for the text.
- Without a selection, the Link button opens a dialog to insert a link along with its text.

With the `html` [format](#format), both the floating link editor and the dialog offer an “Open in New Tab” option, which adds `target="_blank"` to the link.

Tables can be inserted and edited with the [`table`](#editor-components) editor component, and text can be aligned with the [`align`](#buttons) button in HTML content. Both are disabled by default.

Local/remote images can be pasted or dropped into the editor to insert them. Note: pasting multiple images is [not supported in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=864052).

Pasted text keeps the formatting it was copied with. Text copied from a code editor or a terminal becomes a code block, and Markdown copied as plain text, like `- item`, is inserted as literal text.

To paste text as Markdown instead, converting it to formatted content such as a list, use the browser’s shortcut to paste plain text: `Ctrl+Shift+V` (Windows/Linux) or `Command+Shift+V` (macOS). In Safari, use `Command+Option+Shift+V`.

Emoji autocomplete is enabled by default. Typing a colon followed by one or more characters, such as `:smi`, brings up a list of matching emojis, the same way it works on GitHub, Slack and other apps. Use the arrow keys to move through the list, the Enter or Tab key to insert the selected emoji, and the Escape key to dismiss the list. This can be turned off with the `use_emoji_autocomplete` option.

**Paragraphs and Line Breaks**

In the editor, pressing Enter inserts a new paragraph, while pressing Shift+Enter inserts a line break within the current paragraph.

**Breaking change from Netlify/Decap CMS**

Remark plugins are not supported because Sveltia CMS uses the Lexical framework instead of Slate. The `CMS.registerRemarkPlugin` API method is a no-op in Sveltia CMS.

#### Preview

A read-only view of the rich text content, rendered as HTML.

### Data Type

If the [`format`](#format) option is set to `markdown` (default), the value will be a Markdown string. See the [Data Output](https://sveltiacms.app/en/docs/data-output#markdown-syntax) documentation for details on the Markdown syntax used by Lexical. If it is set to `html`, the value will be an HTML string.

If the `required` option is set to `false` and the field is left empty, the value will be an empty string.

When using the Markdown format, you need to parse the Markdown string using a Markdown parser in your framework to convert it to HTML for rendering on your website. Some frameworks have built-in support for Markdown, while others may require additional libraries. Please refer to your framework’s documentation on how to handle Markdown content. See also the [how-to](https://sveltiacms.app/en/docs/how-tos#rendering-soft-line-breaks-as-hard-line-breaks-in-markdown) for advice on handling line breaks in Markdown.

When using the HTML format, the value can be rendered on your website as is. Make sure to sanitize it first if untrusted users can edit the content.

The following features are only available with the HTML format, as Markdown has no syntax for them:

- **Text alignment**: Paragraphs, headings, block quotes and list items can be aligned to the left, center or right, or justified, with the [`align`](#buttons) button. The alignment is saved as a `style` attribute, like `<p style="text-align: center;">`, which is the only style kept in the HTML.
- **Link targets**: A link can be set to open in a new tab, which is saved as `target="_blank"`. A link with another target, like `_top`, keeps it unless the option is changed.

### Data Validation

- If the `required` option is set to `true`, the rich text content must not be an empty string.
- If the `pattern` option is provided, the rich text content must match the specified regular expression pattern.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the RichText field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `richtext`.

#### Optional Options

**Breaking changes from Netlify/Decap CMS**

Sveltia CMS has changed the default value of the `sanitize_preview` option to `true` for improved security. In Netlify CMS and Decap CMS prior to 3.13.0, the default is `false`, which may expose users to XSS vulnerabilities.

Also, Sveltia CMS does not support the deprecated camelCase `editorComponents` option. Use `editor_components` instead.

##### `format`

- **Type**: `string`
- **Default**: `markdown`

Specifies the data format of the content. Possible values are `markdown` and `html`. This option is not available for the [Markdown](https://sveltiacms.app/en/docs/fields/markdown) field type, which always saves Markdown.

With the `html` format, the editor works as follows:

- The `raw` mode shows the HTML source with syntax highlighting. The formatting buttons and editor components are hidden in this mode, as they insert Markdown.
- Only the [editor components](#editor-components) that support HTML are available. All the built-in components do, so images can be inserted, pasted and dropped as usual, while a [custom component](https://sveltiacms.app/en/docs/api/editor-components#supporting-html) needs the `htmlSelector`, `fromBlockHTML` and `toBlockHTML` properties.
- The [`align`](#buttons) button and the “Open in New Tab” option of the link editor are available. See [Data Type](#data-type) for details.
- HTML containing an element the rich text editor cannot handle, such as `<video>` without a component for it, can only be edited in the `raw` mode.
- An existing value is kept as is until the content is changed in the rich text mode. Then the editor writes HTML in its own style, such as `<strong>` for `<b>`, and attributes it doesn’t use, such as `class`, are dropped.

##### `default`

- **Type**: `string`
- **Default**: `""`

The default content for the field, written in Markdown or HTML depending on the [`format`](#format) option.

##### `minimal`

- **Type**: `boolean`
- **Default**: `false`

Whether to make the editor compact. When set to `true`, the editor starts at the height of a single line rather than several, grows with the content and stops at 240 pixels, where a scrollbar appears.

##### `multiline`

- **Type**: `boolean`
- **Default**: `true`

Whether the content can span multiple paragraphs and lines. Set it to `false` for short text with inline formatting that should stay on one line, such as a title or caption. The editor then works as follows:

- The Enter key doesn’t start a new paragraph or line, in both the rich text and `raw` modes.
- Pasted text is joined into a single line, with a space where each paragraph or line break was.
- Only the inline formatting [buttons](#buttons) (`bold`, `italic`, `strikethrough`, `code` and `link`) and inline [editor components](#editor-components), such as `image`, are available. Any other button or component listed in the `buttons` or `editor_components` option is ignored, with a warning in the browser console.
- Horizontal rules and tables in Markdown are kept as plain text.
- With the `html` [format](#format), the `raw` mode is not available, as the HTML source could hold several paragraphs on one line.
- An existing value with several paragraphs is kept as is until the content is changed. Then the paragraphs are joined into one.

The editor also starts at the height of a single line, as with the [`minimal`](#minimal) option.

##### `modes`

- **Type**: `array`
- **Default**: `[rich_text, raw]`

The modes available in the editor. Possible values are `rich_text` and `raw`. The `raw` mode allows users to edit the raw Markdown or HTML text.

The following configurations are possible:

- Default modes: `[rich_text, raw]`
- Turn on raw mode by default: `[raw, rich_text]`
- Rich text only: `[rich_text]`
- Raw mode only: `[raw]`

If multiple modes are enabled, the first one is selected initially, and users can switch between them using a mode selector in the editor toolbar.

The `raw` mode comes with syntax highlighting for Markdown, including the code in fenced code blocks, while keeping the Markdown syntax characters visible. The toolbar buttons and editor components also work in this mode, inserting Markdown into the text. See the [`buttons`](#buttons) and [`editor_components`](#editor-components) options below for details. With the `html` [format](#format), the `raw` mode shows the HTML source with syntax highlighting instead.

##### `buttons`

- **Type**: `array`
- **Default**: all available buttons except `align` (see below)

The button names to display in the editor toolbar.

The following `buttons` are available in the rich text editor toolbar:

- Inline formatting: `bold`, `italic`, `strikethrough`, `code`, `link`
- Block types: `heading-one`, `heading-two`, `heading-three`, `heading-four`, `heading-five`, `heading-six`, `bulleted-list`, `numbered-list`, `quote`
- Text alignment: `align`

By default, all buttons except `align` are enabled. You can customize the toolbar by specifying the desired buttons in the `buttons` option.

The `align` button shows a menu to align the selected paragraphs, headings, block quotes or list items to the left, center or right, or to justify them. The button shows the current alignment. It’s only available with the `html` [format](#format), because Markdown has no syntax for alignment. In a Markdown field, it’s not displayed even if it’s listed. See the [example](#text-alignment-in-html) below.

**Note for Netlify/Decap CMS users**

Unlike Netlify/Decap CMS, all the block type buttons are available under the block type selector in Sveltia CMS. Users can select the block type from a dropdown menu rather than having separate buttons for each block type.

In `raw` mode, the buttons insert Markdown instead:

- The inline formatting buttons wrap the selected text with the corresponding Markdown syntax, such as `**` for bold, or remove it if the text is already formatted. The `Ctrl+B`/`Command+B` and `Ctrl+I`/`Command+I` keyboard shortcuts are also available.
- The `link` button opens a dialog to insert a Markdown link, using the selected text as the link text. The `Ctrl+K`/`Command+K` keyboard shortcut is also available.
- The block type selector changes the selected lines to headings, lists, a quote or a code block, and shows the block type of the line where the cursor is.

These edits can be undone with the browser’s standard undo command, just like typing.

##### `editor_components`

- **Type**: `array`
- **Default**: `[code-block, image]` plus the names of all the registered [custom components](https://sveltiacms.app/en/docs/api/editor-components). The `table` and `hr` components are not included.

The editor component names to include in the rich text editor.

Editor components are custom blocks that can be inserted into the content. Sveltia CMS includes built-in components and also allows for custom components.

Sveltia CMS includes the following built-in editor components for the RichText field:

- `code-block`: Allows users to insert and format code blocks with syntax highlighting.
- `image`: Enables users to add images to their content, with support for uploading and selecting images from the media storage. The image can be linked or unlinked based on the `linked_images` option.
- `table`: Allows users to insert and edit tables. See [Tables](#tables) below for details.
- `hr`: Allows users to insert a horizontal rule (thematic break), saved as `***` in Markdown or `<hr>` in HTML. A horizontal rule can be selected with a click and removed with the Backspace or Delete key.

The `code-block` and `image` components are enabled by default. You can disable them by omitting them from the `editor_components` option. The `table` and `hr` components are disabled by default. To enable them, list them in the option along with the other components you want. See the [example](#enabling-tables-and-horizontal-rules) below.

Editor components, including custom ones, can also be inserted in `raw` mode. Clicking a component button or menu item inserts the component’s Markdown at the cursor, like `![]()` for an image, so users can fill in the values directly in the text. This is not available with the `html` [format](#format).

With the `html` format, the built-in `image` component is saved as an `<img>` element, wrapped with an `<a>` element if it’s linked, and custom components need to [support HTML](https://sveltiacms.app/en/docs/api/editor-components#supporting-html) to be available.

**Multiple Images**

The built-in `image` component is designed for single-file selection. There is no option for selecting multiple images because there is no standard Markdown syntax for it. To enable multiple images, use a custom component to achieve the desired output, as shown in [this example](https://sveltiacms.app/en/docs/api/editor-components#multiple-images-with-caption).

**Note for Netlify/Decap CMS users**

Unlike Netlify/Decap CMS, the `code-block` component in Sveltia CMS is implemented as a block type. Users can insert it using the block type selector rather than the insert button. Also, the `image` component is displayed as a separate button in the toolbar for easier access.

###### Tables

The `table` component adds an Insert Table button to the toolbar, which opens a dialog to choose the number of rows and columns. The new table has a header row, with the cursor in its first cell. The Tab and Shift+Tab keys move between the cells, several cells can be selected at once, and a wide table can be scrolled horizontally.

The rows and columns can be inserted and deleted with the table menu, which is opened with the button on the cell where the cursor is, or with the table button on the toolbar. The menu offers:

- Insert Row Above, Insert Row Below
- Insert Column Left, Insert Column Right
- Delete Row, Delete Column, Delete Table

Tables are saved in the [GitHub Flavored Markdown](https://github.github.com/gfm/#tables-extension-) syntax, or as `<table>` elements with the `html` format. In `raw` mode, the Insert Table button inserts an empty Markdown table.

A Markdown table has some limitations:

- It always has a single header row on top. When a row is inserted above the header row, or the header row is deleted, the first row becomes the header row.
- A cell can only have inline content, so the block type selector, horizontal rules and block-level editor components are not available in a cell.

Inline components can be inserted into a cell and are kept when the table is saved. These include the built-in `image` component and [custom components](https://sveltiacms.app/en/docs/api/editor-components) whose `pattern` matches a single line. A pipe (`|`) in their Markdown is escaped as `\|` so it doesn’t end the cell.

Merged cells and cell background colors are not supported. Tables can be read from Markdown and HTML even without the `table` component, but they can only be edited cell by cell then.

Developers can create [custom editor components](https://sveltiacms.app/en/docs/api/editor-components) to extend the functionality of the rich text editor. Custom components can be registered globally in Sveltia CMS.

##### `allow_nested_components`

- **Type**: `boolean | 'exclude_self'`
- **Default**: `true`

Whether to allow nested rich text editor components within editor components.

- `true` (default): Allows all nested components, including nesting a component inside itself.
- `false`: Disables all nested components.
- `'exclude_self'`: Allows nested components but excludes the parent component itself. For example, if you have a “Note” component with a rich text field, you can insert other components inside it, but not another “Note” component. This prevents potential issues with regex pattern matching when a component is nested inside itself.

**Regex Matching Considerations**

When nesting a component inside itself (enabled with `allow_nested_components: true`), ensure your component’s regex `pattern` can correctly handle nested instances. Simple patterns may incorrectly match the opening tag of the parent with the closing tag of the nested child.

##### `linked_images`

- **Type**: `boolean`
- **Default**: `true`

Whether to allow linking images in the editor. When set to `true`, users can add links to images. When set to `false`, images will be inserted without links.

##### `use_emoji_autocomplete`

- **Type**: `boolean`
- **Default**: `true`

Whether to enable emoji autocomplete in the editor. When set to `true`, typing a colon followed by one or more characters, such as `:smi`, brings up a list of matching emojis that can be inserted into the content.

The colon must be at the beginning of a line or preceded by a space or an opening bracket. A colon in the middle of a word, as in `12:34`, does not trigger the suggestions. This works in both the rich text and raw Markdown editing modes.

##### `use_markdown_shortcuts`

- **Type**: `boolean`
- **Default**: `true`

Whether to enable Markdown shortcuts while typing in the editor. When set to `true`, typing `-` or `*` at the start of a line creates a bulleted list, `1.` creates a numbered list, `>` creates a blockquote and `#`, `##` and `###` create headings. Standard keyboard shortcuts such as `Ctrl/Cmd+B` for bold and `Ctrl/Cmd+I` for italic are still enabled even when this option is `false`.

##### `sanitize_preview`

- **Type**: `boolean`
- **Default**: `true`

Whether to sanitize the preview content to prevent [cross-site scripting](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) (XSS) attacks. The sanitization process uses [DOMPurify](https://github.com/cure53/DOMPurify) to remove potentially harmful HTML tags and attributes from the content before rendering the preview.

**Security Risk**

Setting the `sanitize_preview` option to `false` can expose your CMS to XSS vulnerabilities if untrusted users have access to the CMS, especially when using [Open Authoring](https://sveltiacms.app/en/docs/workflows/open). Malicious users could inject harmful scripts into the content, which would then be executed in the browsers of anyone viewing the preview.

We recommend keeping this option enabled unless disabling it fixes a broken preview and you fully trust all users of your CMS or you’re the sole user.

### Global Field Defaults

You can define default options for all RichText and [Markdown](https://sveltiacms.app/en/docs/fields/markdown) fields globally using the `field_defaults.richtext` option at the root of your CMS configuration. This allows you to set common configurations for all RichText and Markdown fields in your CMS without having to specify them in each field definition.

The following options can be defined globally:

- `format` (RichText field type only)
- `default`
- `minimal`
- `multiline`
- `modes`
- `buttons`
- `editor_components`
- `allow_nested_components`
- `linked_images`
- `use_emoji_autocomplete`
- `use_markdown_shortcuts`
- `sanitize_preview`

The following example configures all RichText and Markdown fields to use `minimal: true`, disables Markdown shortcuts and enables only the `bold`, `italic` and `link` buttons by default.

```yaml [YAML]
field_defaults:
  richtext:
    minimal: true
    use_markdown_shortcuts: false
    buttons: [bold, italic, link]
```

```toml [TOML]
[field_defaults.richtext]
minimal = true
use_markdown_shortcuts = false
buttons = ["bold", "italic", "link"]
```

```json [JSON]
{
  "field_defaults": {
    "richtext": {
      "minimal": true,
      "use_markdown_shortcuts": false,
      "buttons": ["bold", "italic", "link"]
    }
  }
}
```

```js [JavaScript]
{
  field_defaults: {
    richtext: {
      minimal: true,
      use_markdown_shortcuts: false,
      buttons: ["bold", "italic", "link"],
    },
  },
}
```

### Examples

#### Standard Markdown Field

This example shows a basic Markdown editor with default settings.

```yaml [YAML]
- name: body
  label: Body
  widget: richtext
```

```toml [TOML]
[[fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]
{
  "name": "body",
  "label": "Body",
  "widget": "richtext"
}
```

```js [JavaScript]
{
  name: "body",
  label: "Body",
  widget: "richtext",
}
```

#### Standard HTML Field

This example shows a rich text editor that saves content in HTML format.

```yaml [YAML]
- name: body
  label: Body
  widget: richtext
  format: html
```

```toml [TOML]
[[fields]]
name = "body"
label = "Body"
widget = "richtext"
format = "html"
```

```json [JSON]
{
  "name": "body",
  "label": "Body",
  "widget": "richtext",
  "format": "html"
}
```

```js [JavaScript]
{
  name: "body",
  label: "Body",
  widget: "richtext",
  format: "html",
}
```

#### Basic Markdown Field with Limited Buttons

This example shows a minimal Markdown editor with only bold, italic and link buttons.

```yaml [YAML]
- name: content
  label: Content
  widget: richtext
  default: To get started, write your **Markdown** content here.
  minimal: true
  buttons: [bold, italic, link]
```

```toml [TOML]
[[fields]]
name = "content"
label = "Content"
widget = "richtext"
default = "To get started, write your **Markdown** content here."
minimal = true
buttons = ["bold", "italic", "link"]
```

```json [JSON]
{
  "name": "content",
  "label": "Content",
  "widget": "richtext",
  "default": "To get started, write your **Markdown** content here.",
  "minimal": true,
  "buttons": ["bold", "italic", "link"]
}
```

```js [JavaScript]
{
  name: "content",
  label: "Content",
  widget: "richtext",
  default: "To get started, write your **Markdown** content here.",
  minimal: true,
  buttons: ["bold", "italic", "link"],
}
```

#### Single-Line Field with Inline Formatting

This example shows a title field that allows bold and italic text and links, but no paragraph or line breaks. The empty `editor_components` list turns off the editor components, including `image`.

```yaml [YAML]
- name: title
  label: Title
  widget: richtext
  multiline: false
  buttons: [bold, italic, link]
  editor_components: []
```

```toml [TOML]
[[fields]]
name = "title"
label = "Title"
widget = "richtext"
multiline = false
buttons = ["bold", "italic", "link"]
editor_components = []
```

```json [JSON]
{
  "name": "title",
  "label": "Title",
  "widget": "richtext",
  "multiline": false,
  "buttons": ["bold", "italic", "link"],
  "editor_components": []
}
```

```js [JavaScript]
{
  name: "title",
  label: "Title",
  widget: "richtext",
  multiline: false,
  buttons: ["bold", "italic", "link"],
  editor_components: [],
}
```

#### Disabling Code Block Component

This example shows how to disable the `code-block` editor component.

```yaml [YAML]
- name: content
  label: Content
  widget: richtext
  editor_components: [image]
```

```toml [TOML]
[[fields]]
name = "content"
label = "Content"
widget = "richtext"
editor_components = ["image"]
```

```json [JSON]
{
  "name": "content",
  "label": "Content",
  "widget": "richtext",
  "editor_components": ["image"]
}
```

```js [JavaScript]
{
  name: "content",
  label: "Content",
  widget: "richtext",
  editor_components: ["image"],
}
```

#### Enabling Tables and Horizontal Rules

This example enables the `table` and `hr` editor components along with the default ones.

```yaml [YAML]
- name: content
  label: Content
  widget: richtext
  editor_components: [code-block, image, table, hr]
```

```toml [TOML]
[[fields]]
name = "content"
label = "Content"
widget = "richtext"
editor_components = ["code-block", "image", "table", "hr"]
```

```json [JSON]
{
  "name": "content",
  "label": "Content",
  "widget": "richtext",
  "editor_components": ["code-block", "image", "table", "hr"]
}
```

```js [JavaScript]
{
  name: "content",
  label: "Content",
  widget: "richtext",
  editor_components: ["code-block", "image", "table", "hr"],
}
```

#### Text Alignment in HTML

This example enables the `align` button in an HTML field, along with a few other buttons.

```yaml [YAML]
- name: content
  label: Content
  widget: richtext
  format: html
  buttons: [bold, italic, link, heading-two, bulleted-list, align]
```

```toml [TOML]
[[fields]]
name = "content"
label = "Content"
widget = "richtext"
format = "html"
buttons = ["bold", "italic", "link", "heading-two", "bulleted-list", "align"]
```

```json [JSON]
{
  "name": "content",
  "label": "Content",
  "widget": "richtext",
  "format": "html",
  "buttons": ["bold", "italic", "link", "heading-two", "bulleted-list", "align"]
}
```

```js [JavaScript]
{
  name: "content",
  label: "Content",
  widget: "richtext",
  format: "html",
  buttons: ["bold", "italic", "link", "heading-two", "bulleted-list", "align"],
}
```

Source: https://sveltiacms.app/en/docs/fields/richtext

---

## Markdown Field

The Markdown field type is an alias of the RichText field type, available for backward compatibility with Netlify/Decap CMS. It provides a rich text editor that allows content editors to create and format content using Markdown syntax.

<!-- The Markdown field type is a variant of the RichText field type that is specifically designed to handle content formatted in Markdown syntax. It provides a rich text editor that allows content editors to create and format content using Markdown syntax. -->

The `widget` property for this field type is `markdown`.

See the [RichText field documentation](https://sveltiacms.app/en/docs/fields/richtext) for details on the UI, data type and available options.

Note that the [`format`](https://sveltiacms.app/en/docs/fields/richtext#format) option is not available for the Markdown field type since it is fixed to `markdown`. Use the RichText field type to save HTML.

### Examples

#### Standard Markdown Field

This example shows a basic Markdown editor with default settings.

```yaml [YAML]
- name: body
  label: Body
  widget: markdown
```

```toml [TOML]
[[fields]]
name = "body"
label = "Body"
widget = "markdown"
```

```json [JSON]
{
  "name": "body",
  "label": "Body",
  "widget": "markdown"
}
```

```js [JavaScript]
{
  name: 'body',
  label: 'Body',
  widget: 'markdown',
}
```

Output example:

```markdown [Markdown]
# Welcome to the Markdown Field

This is a sample paragraph in **Markdown** format.

- Item 1
- Item 2
```

```yaml [YAML]
body: |
  # Welcome to the Markdown Field

  This is a sample paragraph in **Markdown** format.

  - Item 1
  - Item 2
```

```toml [TOML]
body = """
# Welcome to the Markdown Field

This is a sample paragraph in **Markdown** format.

- Item 1
- Item 2
"""
```

```json [JSON]
{
  "body": "# Welcome to the Markdown Field\n\nThis is a sample paragraph in **Markdown** format.\n\n- Item 1\n- Item 2\n"
}
```

We have included a Markdown example output along with YAML, TOML and JSON representations because a field named `body` with the Markdown field type would be stored outside of the front matter in a Markdown file. If the name of the field were different, the content would be stored in the front matter instead. This behavior can be configured using the [`body_field` option](https://sveltiacms.app/en/docs/collections/entries/formats#body-field-for-front-matter-formats) for collections and collection files.

Source: https://sveltiacms.app/en/docs/fields/markdown

---

## Code Field

The Code field type provides a code editor with syntax highlighting for various programming languages. It allows users to write and edit code snippets easily within the CMS.

### User Interface

#### Editor

A [Lexical](https://lexical.dev/)-based code editor with syntax highlighting and line numbers.

**Breaking change from Netlify/Decap CMS**

Sveltia CMS does not support the theme and keymap inline settings, along with support for some languages, as we have moved away from CodeMirror to Lexical. We may add user settings for themes in the future.

#### Preview

A read-only view of the code snippet with syntax highlighting.

### Data Type

An object with the following structure:

```json
{ "code": "string", "lang": "string" }
```

The object keys can be customized using the `keys` option.

If the `output_code_only` option is set to `true`, the data type will be a string containing only the code.

### Data Validation

- If the `required` option is set to `true`, the code must not be an empty string.
- If the `pattern` option is provided, the code must match the specified regular expression pattern.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the Code field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `code`.

#### Optional Options

**Breaking change from Netlify/Decap CMS**

Sveltia CMS uses [Shiki](https://shiki.style/) for syntax highlighting. Therefore, the list of supported languages differs from that of Netlify/Decap CMS, which uses [CodeMirror](https://codemirror.net/).

This affects the `default_language` option and the language used in the `default` option, along with the language selection dropdown in the UI.

##### `default`

- **Type**: `object` or `string`
- **Default**: `{ code: "", lang: "" }`

The default value for the field, where `code` is a code snippet and `lang` is any valid programming language supported by [Shiki](https://shiki.style/languages). If the [`keys`](#keys) option is set, use its property names instead.

If `output_code_only` is `true`, this should be a string containing the default code. A string is also accepted otherwise, in which case it’s taken as the code with no language.

An object default with a property that isn’t one of the [`keys`](#keys), or an object default with `output_code_only` set to `true`, is reported as a config validation error on the login screen, because the value would otherwise be dropped.

##### `keys`

- **Type**: `object`
- **Default**: `{ code: "code", lang: "lang" }`

An object that defines the keys used in the data object. The default keys are `code` for the code snippet and `lang` for the programming language.

If `output_code_only` is `true`, this option is ignored.

##### `output_code_only`

- **Type**: `boolean`
- **Default**: `false`

If set to `true`, the field will store and return only the code as a string, instead of an object containing both code and language.

##### `allow_language_selection`

- **Type**: `boolean`
- **Default**: `true`

If set to `false`, the language selection dropdown will be hidden, and the language will default to an empty string or the value specified in the `default` option.

**Note for Netlify/Decap CMS users**

The [Netlify/Decap CMS document](https://decapcms.org/docs/widgets/#Code) says the default value for the `allow_language_selection` option is `false`, but it’s actually `true`. The default value in Sveltia CMS is also `true`.

##### `default_language`

- **Type**: `string`
- **Default**: `""`

The default programming language for the code editor. See the [list of supported languages](https://shiki.style/languages) on the Shiki website for valid values.

### Examples

#### Basic Example

The simplest configuration of a Code field:

```yaml [YAML]
- widget: code
  label: Code Snippet
  name: code_snippet
```

```toml [TOML]
[[fields]]
name = "code_snippet"
label = "Code Snippet"
widget = "code"
```

```json [JSON]
{
  "name": "code_snippet",
  "label": "Code Snippet",
  "widget": "code"
}
```

```js [JavaScript]
{
  name: "code_snippet",
  label: "Code Snippet",
  widget: "code",
}
```

Output example:

```yaml [YAML]
code_snippet:
  code: |
    function greet() {
      console.log("Hello, World!");
    }
  lang: js
```

```toml [TOML]
[code_snippet]
code = """function greet() {
  console.log("Hello, World!");
}"""
lang = "js"
```

```json [JSON]
{
  "code_snippet": {
    "code": "function greet() {\n  console.log(\"Hello, World!\");\n}",
    "lang": "js"
  }
}
```

#### Code Only Output

This example configures the field to output only the code as a string:

```yaml [YAML]
- widget: code
  label: Code Only
  name: code_only
  output_code_only: true
```

```toml [TOML]
[[fields]]
name = "code_only"
label = "Code Only"
widget = "code"
output_code_only = true
```

```json [JSON]
{
  "name": "code_only",
  "label": "Code Only",
  "widget": "code",
  "output_code_only": true
}
```

```js [JavaScript]
{
  name: "code_only",
  label: "Code Only",
  widget: "code",
  output_code_only: true,
}
```

Output example:

```yaml [YAML]
code_only: |
  function greet() {
    console.log("Hello, World!");
  }
```

```toml [TOML]
code_only = """function greet() {
  console.log("Hello, World!");
}"""
```

```json [JSON]
{
  "code_only": "function greet() {\n  console.log(\"Hello, World!\");\n}"
}
```

#### Custom Keys and Default Value

This example customizes the keys used in the data object and sets a default value, with language selection disabled:

```yaml [YAML]
- widget: code
  label: Custom Code
  name: custom_code
  allow_language_selection: false
  keys:
    code: source_code
    lang: language
  default:
    source_code: "console.log('Hello, World!');"
    language: js
```

```toml [TOML]
[[fields]]
name = "custom_code"
label = "Custom Code"
widget = "code"
allow_language_selection = false
[keys]
code = "source_code"
lang = "language"
[default]
source_code = "console.log('Hello, World!');"
language = "js"
```

```json [JSON]
{
  "name": "custom_code",
  "label": "Custom Code",
  "widget": "code",
  "allow_language_selection": false,
  "keys": {
    "code": "source_code",
    "lang": "language"
  },
  "default": {
    "source_code": "console.log('Hello, World!');",
    "language": "js"
  }
}
```

```js [JavaScript]
{
  name: "custom_code",
  label: "Custom Code",
  widget: "code",
  allow_language_selection: false,
  keys: {
    code: "source_code",
    lang: "language",
  },
  default: {
    source_code: "console.log('Hello, World!');",
    language: "js",
  },
}
```

Output example:

```yaml [YAML]
custom_code:
  source_code: "console.log('Hello, World!');"
  language: js
```

```toml [TOML]
[custom_code]
source_code = "console.log('Hello, World!');"
language = "js"
```

```json [JSON]
{
  "custom_code": {
    "source_code": "console.log('Hello, World!');",
    "language": "js"
  }
}
```

Source: https://sveltiacms.app/en/docs/fields/code
