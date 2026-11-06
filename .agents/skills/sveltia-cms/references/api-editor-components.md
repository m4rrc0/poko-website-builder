# JavaScript API: Editor Components and Markdown Rendering

Custom editor components for the RichText field and how Markdown is rendered in previews. For the RichText field options themselves, see `fields-richtext.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Custom Editor Components

A custom editor component allows you to create reusable, complex block-level or inline components available in the [rich text editor](https://sveltiacms.app/en/docs/fields/richtext).

By default, registered components appear under the Insert button on the editor toolbar. You can also place them directly on the toolbar with the `trigger` option. When clicked, they insert a predefined template into the editor at the current cursor position.

### Overview

To register a custom editor component, use the `registerEditorComponent` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerEditorComponent(definition);
```

Registering a component with the same `id` again replaces the previous one. The component `definition` object includes the following properties.

These properties describe a field-based component, which is edited with its fields. A component with the `type` option set to `inline` is a [pattern-based inline component](#pattern-based-inline-components) instead, which works like the one in Decap CMS and takes different properties.

#### Required Properties

- `id` (string): A unique identifier for the component. This is the name you will use to reference this component in the `editor_components` option for a [RichText](https://sveltiacms.app/en/docs/fields/richtext) or [Markdown](https://sveltiacms.app/en/docs/fields/markdown) field. It should be unique and not conflict with built-in component IDs (`code-block`, `image`).
- `fields` (array of field definitions): An array defining the [fields](https://sveltiacms.app/en/docs/fields) to be displayed in the component.
- `pattern` (RegExp): A regular expression used to identify existing instances of the component in the Markdown content.
  - It’s recommended to use [named capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group) corresponding to the field names so that `fromBlock` can be omitted if no additional processing is needed.
  - Matching could be either block (multiline) or inline, depending on the component. To match block content, use the `s` (dotAll) or `m` (multiline) flag, or include `[\s\S]` in the pattern. Otherwise, the component is treated as an inline component that matches text within a paragraph. Only an inline component can be inserted into a Markdown [table](https://sveltiacms.app/en/docs/fields/richtext#tables) cell.
  - The `g` (global) flag is ignored.
- `fromBlock` (function): A function that takes a regex match array and returns an object mapping field names to their values.
  - This property can be omitted if the `pattern` regular expression contains named capture groups corresponding to the field names, and no additional processing like type conversion is needed.
  - Otherwise, this property is required. You must provide a function to extract field values from the regex match.
- `toBlock` (function): A function that takes an object mapping field names to their values and returns a string representing the Markdown content to be inserted. It’s also called once with an empty object while the editor is being initialized, so it must handle missing values.

#### Optional Properties

- `label` (string): The text label displayed on the toolbar button. Defaults to the `id` value.
- `icon` (string): A [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols) icon name to display on the toolbar button.
- `trigger` (string): The trigger UI of the component, either `menuitem` (default) or `button`. A menu item is placed under the Insert menu, while a button is placed directly on the toolbar.
- `toPreview` (function): A function that takes an object mapping field names to their values and returns the preview of the component to be displayed in the editor. It can return a string, a DOM element or a React element. See [Preview Output](#preview-output) below. If omitted, or if it returns another type of value, no preview is shown. As in Netlify/Decap CMS, the function also receives a `getAsset` function and the component’s `fields` as the second and third arguments. See [Displaying Assets](#displaying-assets).
- `mode` (string): Editing mode for the component:
  - `block` (default): Renders the component within the rich text editor as an expandable field list.
  - `dialog`: Renders a compact placeholder that opens a dialog when clicked.
  - `inline`: Renders the field’s own control, such as a select box or a date picker, right within the text, without a label or dialog. See [Status Select](#status-select-inline-mode) below.
- `summary` (string): Template for the placeholder text when `mode` is `dialog`, e.g. `{{title}} - {{videoId}}`. Like the Object field’s `summary` option, it supports nested field names and transformations. Text without placeholders is shown as is. If the summary is empty, the placeholder falls back to the first String or Text field value, then to the component label.
- `thumbnail` (string): The name of an [Image](https://sveltiacms.app/en/docs/fields/image) or [File](https://sveltiacms.app/en/docs/fields/file) field whose image is displayed as a small thumbnail next to the summary in the placeholder when `mode` is `dialog`, e.g. `icon`. A nested field can be named with a key path like `media.src`. If there is no text to show, only the thumbnail is displayed, without the component label. The label is shown instead if the field is empty, the file is not an image or the image fails to load. See [Icon with Thumbnail](#icon-with-thumbnail-dialog-mode) below.
- `collapsed` (boolean): If true, the component’s fields panel is collapsed by default when inserted (`block` mode only).
- `htmlSelector` (string), `fromBlockHTML` (function) and `toBlockHTML` (function): The HTML counterparts of `pattern`, `fromBlock` and `toBlock`, which make the component available in a RichText field with the [`html` format](https://sveltiacms.app/en/docs/fields/richtext#format). All three are required to support HTML. See [Supporting HTML](#supporting-html) below.

#### Preview Output

The optional `toPreview` function can return any of the following:

- **A string**: Parsed as Markdown and HTML, then sanitized with [DOMPurify](https://github.com/cure53/DOMPurify) unless the field’s [`sanitize_preview`](https://sveltiacms.app/en/docs/fields/richtext#sanitize-preview) option is disabled. Most of the [examples](#examples) below use this.
- **A DOM element**: Inserted as is, which allows you to mount a component built with Svelte, Vue or any other framework. See [Using a Framework Component for Preview](#using-a-framework-component-for-preview).
- **A React element**: Rendered with React as is. See [Using React for Preview](#using-react-for-preview).

“As is” means that neither Markdown parsing nor sanitization is applied. The value of a nested RichText or Markdown field is therefore displayed verbatim, such as `**bold**`, unless you render it yourself.

The CMS provides the `renderRichText` method for exactly that purpose. It renders the value into an element of your choice just like the preview pane, nested components included — see [Rendering Markdown](https://sveltiacms.app/en/docs/api/rendering-markdown).

Like `toBlock`, the function is also called once with an empty object while the editor is being initialized. Make sure it works without any field values, as the examples below do by using default values. A preview is reused as long as the component’s Markdown is unchanged.

**Security Risk**

The `sanitize_preview` option applies to string previews only. Any HTML you write into a DOM element or React element, for example with `innerHTML` or `dangerouslySetInnerHTML`, is rendered as is.

This can expose your CMS to [cross-site scripting](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) (XSS) attacks if untrusted users have access to the CMS. The risk is especially high with [Open Authoring](https://sveltiacms.app/en/docs/workflows/open), because entries can be written by anybody. Unless you’re the sole user of your CMS, insert field values as text or sanitize them yourself.

#### Displaying Assets

A file path stored in a field value, such as `/images/photo.jpg`, may not point to the file in the preview. The file may not have been published yet, or not even saved: a file the user has just picked is only uploaded when the entry is saved.

The CMS takes care of images, videos and audio. In the preview, including a DOM element or React element preview, it replaces the following attributes with URLs that work:

- the `src` and `srcset` of any `<img>` and `<source>` element
- the `src` of any `<video>` and `<audio>` element
- the `poster` of a `<video>` element

The [Image with Caption](#image-with-caption) example relies on this.

For anything else, such as a path your component transforms or a CSS background image in a DOM element or React element preview, use the `getAsset` function. `toPreview` receives it as the second argument.

`getAsset` takes a file path and returns an asset object, or `undefined` if the file is not found. Its `url` property is the URL to display, and the object also turns into the URL when used as a string. See the [`getAsset` prop](https://sveltiacms.app/en/docs/api/preview-templates#component-props) of a custom preview template for the other properties of the asset object.

The path is resolved just like an image in the preview. A file in the entry folder, a [field-level media folder](https://sveltiacms.app/en/docs/media/internal#field-level-configuration) of the component, or one the user has just picked is found as well. A complete URL, such as `https://example.com/photo.jpg`, is returned as is.

```js
CMS.registerEditorComponent({
  id: 'cover',
  label: 'Cover',
  icon: 'wallpaper',
  fields: [{ name: 'src', label: 'Image', widget: 'image' }],
  pattern: /{{< cover src="(?<src>.*?)" >}}/,
  toBlock: ({ src = '' }) => `{{< cover src="${src}" >}}`,
  toPreview: ({ src = '' }, getAsset) => {
    const element = document.createElement('div');

    element.className = 'cover';
    element.style.backgroundImage = `url("${getAsset(src)?.url ?? src}")`;

    return element;
  },
});
```

The third argument is the component’s `fields` as an [Immutable.js](https://immutable-js.com/) List. Netlify/Decap CMS passes it along with `getAsset` so that a component can find the field a path comes from, and pass that field’s configuration as the second argument of `getAsset`. Sveltia CMS accepts that argument for compatibility but doesn’t need it, as it searches the media folders of all fields.

Immutable.js is loaded on demand when a component whose `toPreview` function takes three parameters is registered. Until it’s ready, `fields` is `undefined`. Code ported from Netlify/Decap CMS should therefore read it with optional chaining (`fields?.find(…)`), as the [built-in image component of Decap CMS](https://github.com/decaporg/decap-cms/blob/6effc912e13fe7d7f4c590b69ca8784a4fd5490f/packages/decap-cms-editor-component-image/src/index.js#L15-L19) does.

`getAsset` returns the asset object right away. While the file is being retrieved from the repository, the `url` property is the file’s public path. Once the file has been retrieved, `toPreview` is called again and the new preview replaces the previous one. If the previous preview is a DOM element, it receives the [`Unmount` event](#using-a-framework-component-for-preview).

#### Supporting HTML

A RichText field with the [`format`](https://sveltiacms.app/en/docs/fields/richtext#format) option set to `html` saves its content as HTML, so the Markdown syntax defined with `pattern`, `fromBlock` and `toBlock` doesn’t apply there. A component is only available in such a field if it also defines its HTML syntax with the following properties:

- `htmlSelector` (string): A [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_selectors) to identify existing instances of the component in the HTML content, such as `aside.note`. The outermost matching element is the component, including its content.
  - Each selector in a selector list has to name the element type it matches, such as `figure` or `a:has(> img), img`, because the editor finds the component by those types. A selector like `.note` is invalid.
  - An element of those types that isn’t an instance of the component, such as an `<aside>` without the class for `aside.note`, is handled as if there were no component. The editor imports it if it can, such as a link for `a`. Otherwise, the field can only be edited in `raw` mode.
- `fromBlockHTML` (function): A function that takes a matching element and returns an object mapping field names to their values. For example, read attributes with `getAttribute()`, which returns decoded values, or text with `textContent`. It can return `undefined` if the element turns out not to be an instance of the component. A selector cannot always tell, as with a link that has text besides an image.
- `toBlockHTML` (function): A function that takes an object mapping field names to their values and returns a single element matching `htmlSelector`. It can return either an HTML string or an [`HTMLElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) created with `document.createElement()`. We recommend the latter: values set with `setAttribute()` or `textContent` don’t have to be escaped, while in a string you must escape them yourself. The output is also used when the component is copied to the clipboard in the editor, in a Markdown field as well.

The `toPreview` function works the same way in an HTML field. If it’s omitted, the component’s HTML itself is shown in the preview.

**Security Risk**

The element passed to `fromBlockHTML` comes from content edited by users, so treat it as data. Read values from it, but don’t insert the element itself or its HTML into the page, for example in a DOM element preview. Doing so would bypass the preview sanitization and could expose your CMS to [cross-site scripting](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) (XSS) attacks.

Whether a component is a block or inline one is still determined by `pattern`, so make sure it matches the element. A block element like `<figure>` needs a block component, or the editor puts it in a paragraph.

Here is the [Image with Caption](#image-with-caption) example below with the HTML syntax added. It also adds the `m` flag and anchors to `pattern` to make it a block component:

```js
/**
 * Create a figure element. The values are set as text and attributes, so they don’t have to be
 * escaped.
 */
const createFigure = ({ src = '', caption = '' }) => {
  const figure = document.createElement('figure');
  const img = document.createElement('img');
  const figcaption = document.createElement('figcaption');

  img.setAttribute('src', src);
  img.setAttribute('alt', '');
  figcaption.textContent = caption;
  figure.append(img, figcaption);

  return figure;
};

CMS.registerEditorComponent({
  id: 'figure',
  label: 'Image with Caption',
  icon: 'photo',
  fields: [
    { name: 'src', label: 'Image', widget: 'image' },
    { name: 'caption', label: 'Caption' },
  ],
  // Markdown syntax
  pattern: /^{{< image src="(?<src>.*?)" caption="(?<caption>.*?)" >}}$/m,
  toBlock: ({ src = '', caption = '' }) => `{{< image src="${src}" caption="${caption}" >}}`,
  // HTML syntax
  htmlSelector: 'figure',
  fromBlockHTML: (element) => ({
    src: element.querySelector('img')?.getAttribute('src') ?? '',
    caption: element.querySelector('figcaption')?.textContent ?? '',
  }),
  toBlockHTML: createFigure,
  // The same element works as the preview, which is displayed as is
  toPreview: createFigure,
});
```

In an HTML field, the component is saved as `<figure><img src="/images/photo.jpg" alt=""><figcaption>A photo</figcaption></figure>`. The browser escapes any special characters in the caption.

Since the element is built with text and attributes only, it’s also safe to display as the preview, which isn’t sanitized because it’s a DOM element. The image source is replaced with a URL that works, as described in [Displaying Assets](#displaying-assets).

The `<img>` element within the `<figure>` is part of the component, so the built-in `image` component doesn’t take it.

### Pattern-Based Inline Components

A pattern-based inline component has no fields. Its data comes from the Markdown it matches within a paragraph, and the editor shows its preview right in the text. This kind of component is compatible with [Decap CMS](https://decapcms.org/docs/custom-widgets/#inline-components), so a wikilink, mention or Hugo `ref` shortcode component written for Decap CMS works as is.

To edit the data, the component provides its own UI, such as a dialog for picking a page, through the `onInsert` and `onEdit` functions.

#### Properties

The following properties are required:

- `id` (string): A unique identifier for the component, like that of a field-based component.
- `type` (string): Must be `inline`.
- `pattern` (RegExp): A regular expression that matches an instance within a paragraph.
  - A leading `^` is ignored, and so are the `g` and `y` flags.
  - Use a non-greedy quantifier like `.+?`, or a specific character class like `[^\]]+`, so a match doesn’t run on to the next instance on the same line.
  - A pattern with the `m` or `s` flag, or one that contains `[\s\S]`, causes a configuration warning, as an inline component can’t span lines.
- `toInline` (function): A function that takes the component data and returns its Markdown. It’s called with an empty object for a component inserted without `onInsert`, so it must handle missing values.

The following properties are optional:

- `label` (string): The label of the item in the Insert menu. Defaults to the `id` value.
- `icon` (string): A [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols) icon name for the menu item.
- `fromInline` (function): A function that takes a regex match array and returns the component data. It can be omitted if the `pattern` has [named capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group), which are then used as the data.
- `toPreview` (function): A function that takes the component data and returns its preview, which is shown both in the editor and in the Preview Pane. It can return a string, a DOM element or a React element, like the [preview output](#preview-output) of a field-based component. Without it, the editor shows the Markdown returned by `toInline` as plain text.
- `trigger` (string): Literal text every instance starts with, e.g. `[[` or `@`. If given, the editor only matches the `pattern` where this text is found, instead of running the pattern across the paragraph. Unlike the `trigger` option of a field-based component, it doesn’t choose the toolbar UI. A pattern-based inline component always appears under the Insert menu.
- `onInsert` (function): An async function called when the component is inserted from the toolbar. It receives an object with `selectedText`, the text selected in the editor, and returns the data of the new component, which replaces the selected text. Return `null` or `undefined` to cancel the insertion and leave the text as is. Without this function, the component is inserted with empty data.
- `onEdit` (function): An async function called when the component is clicked, or activated with the Enter or Space key. It receives an object with `data`, the current data, and returns the new data. Return `null` or `undefined` to leave the component unchanged. Without this function, the component can only be removed.

As in Decap CMS, `fromBlock` and `toBlock` are accepted in place of `fromInline` and `toInline`.

#### Wikilink Example

This example creates a wikilink component that asks for the page name when it’s inserted or clicked:

```js
CMS.registerEditorComponent({
  id: 'wikilink',
  label: 'Wikilink',
  icon: 'link',
  type: 'inline',
  pattern: /\[\[(?<page>[^\]]+)\]\]/,
  trigger: '[[',
  toInline: ({ page = '' }) => `[[${page}]]`,
  toPreview: ({ page = '' }) => {
    const link = document.createElement('a');

    link.href = `/${encodeURIComponent(page)}`;
    link.textContent = page;

    return link;
  },
  onInsert: async ({ selectedText }) => {
    const page = window.prompt('Page name', selectedText);

    return page ? { page } : null;
  },
  onEdit: async ({ data }) => {
    const page = window.prompt('Page name', data.page);

    return page ? { page } : null;
  },
});
```

In this example, selecting “Home” in a paragraph and choosing Wikilink from the Insert menu turns the text into `[[Home]]`. The editor shows the link within the text, and clicking it lets you change the page name. A link in the preview doesn’t navigate away from the editor when it’s clicked.

#### Behavior and Limitations

- A string preview is parsed as inline Markdown and always sanitized in the editor. A DOM element or React element is inserted as is, so escape any user-provided content in it, as the example does by setting `textContent`.
- The component can be removed with the Backspace or Delete key when it’s focused, or with the Backspace key when the cursor is right after it, like a character.
- An insertion or edit made through `onInsert` or `onEdit` can be undone and redone like any other change.
- An error thrown by `onInsert` or `onEdit` is logged to the browser console, and the insertion or edit is canceled.
- In the plain text mode, `onInsert` is not called. Choosing the component from the Insert menu there inserts the Markdown that `toInline` returns for empty data, if any.
- The component is available in RichText and Markdown fields with the default `markdown` format, but not with the `html` format.

### Using Components

Once registered, custom editor components can be used in any [RichText](https://sveltiacms.app/en/docs/fields/richtext) or [Markdown](https://sveltiacms.app/en/docs/fields/markdown) field. A RichText field with the `html` format, however, only offers the components that [support HTML](#supporting-html). By default, all built-in and custom components are included. You can restrict which components are available by adding their `id` to the field’s `editor_components` array in the collection configuration.

For example, to allow only the built-in `image` component and custom `callout` and `youtube` components:

```yaml [YAML]
fields:
  - name: content
    label: Content
    widget: richtext
    editor_components: [image, callout, youtube]
```

```toml [TOML]
[[fields]]
name = "content"
label = "Content"
widget = "richtext"
editor_components = ["image", "callout", "youtube"]
```

```json [JSON]
{
  "fields": [
    {
      "name": "content",
      "label": "Content",
      "widget": "richtext",
      "editor_components": ["image", "callout", "youtube"]
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: "content",
      label: "Content",
      widget: "richtext",
      editor_components: ["image", "callout", "youtube"],
    },
  ],
}
```

### Examples

#### Callout

The following example demonstrates how to register a custom editor component for a “Callout” block:

```js
CMS.registerEditorComponent({
  id: 'callout',
  label: 'Callout',
  icon: 'campaign',
  fields: [
    { name: 'type', label: 'Type', widget: 'select', options: ['info', 'warning', 'error'] },
    { name: 'message', label: 'Message' },
  ],
  pattern: /^:::callout (\w+)\n([\s\S]+?)\n:::/m,
  fromBlock: (match) => ({
    type: match[1],
    message: match[2].trim(),
  }),
  toBlock: (data) => `:::callout ${data.type}\n${data.message}\n:::`,
  toPreview: (data) => `:::callout ${data.type}\n${data.message}\n:::`,
});
```

In this example, the “Callout” component allows users to insert a callout block with a specified type (info, warning or error) and a message. The `pattern` regular expression is used to identify existing callout blocks in the Markdown content, while the `fromBlock` and `toBlock` functions handle the conversion between the component’s data and its Markdown representation.

#### File Link

This example demonstrates how to create a custom editor component for inserting a file link using the built-in [`file` field type](https://sveltiacms.app/en/docs/fields/file):

```js
CMS.registerEditorComponent({
  id: 'file-link',
  label: 'File Link',
  icon: 'attach_file',
  fields: [
    { name: 'file', label: 'File', widget: 'file' },
    { name: 'text', label: 'Text to Display', default: '{{file}}' },
  ],
  pattern: /<a href="([^"]+?)" data-file-link>([^\n]+?)<\/a>/,
  fromBlock: (match) => ({
    file: decodeURI(match[1]),
    text: match[2],
  }),
  toBlock: (data) => `<a href="${data.file}" data-file-link>${data.text}</a>`,
  toPreview: (data) => `<a href="${data.file}" data-file-link>${data.text}</a>`,
});
```

#### Collapsible Note

Here’s an example of a collapsible “Note” component:

```js
CMS.registerEditorComponent({
  id: 'note',
  label: 'Note',
  icon: 'note_alt',
  fields: [
    { name: 'summary', label: 'Summary' },
    { name: 'content', label: 'Content', widget: 'richtext' },
  ],
  pattern: /^<details>\s*<summary>(?<summary>.+?)<\/summary>\s*(?<content>[\s\S]+?)\s*<\/details>/m,
  toBlock: ({ summary, content }) =>
    `<details>\n<summary>${summary}</summary>\n${content}\n</details>`,
  toPreview: ({ summary, content }) =>
    `<details>\n<summary>${summary}</summary>\n<p>${content}</p>\n</details>`,
});
```

In this example, the “Note” component creates a collapsible section using HTML `<details>` and `<summary>` tags. The `fromBlock` function is omitted because the `pattern` regular expression uses named capture groups that correspond to the field names. The `toBlock` function generates the appropriate HTML structure for the note component based on the provided summary and content.

#### Image with Caption

Here’s an example of a custom editor component for inserting an image with a caption using a Hugo shortcode:

```js
CMS.registerEditorComponent({
  id: 'figure',
  label: 'Image with Caption',
  icon: 'photo',
  fields: [
    { name: 'src', label: 'Image', widget: 'image' },
    { name: 'caption', label: 'Caption' },
  ],
  pattern: /{{< image src="(?<src>.*?)" caption="(?<caption>.*?)" >}}/,
  toBlock: ({ src, caption }) => `{{< image src="${src}" caption="${caption}" >}}`,
  toPreview: ({ src, caption }) =>
    `<figure><img src="${src}" alt=""><figcaption>${caption}</figcaption></figure>`,
});
```

The `fromBlock` function is omitted again because the `pattern` regular expression uses named capture groups that correspond to the field names. The `toBlock` function generates a Hugo shortcode for the image with caption, while the `toPreview` function creates an HTML figure element to display the image and its caption in the editor preview.

Note that the `src` attribute will be automatically replaced with a blob URL in the editor preview when an image is selected, while the actual file path will be stored in the Markdown content.

#### Multiple Images with Caption

This example, a variation of the previous one, demonstrates how to create a custom editor component for inserting multiple images with a single caption:

```js
CMS.registerEditorComponent({
  id: 'gallery',
  label: 'Image Gallery',
  icon: 'photo_library',
  fields: [
    { name: 'images', label: 'Images', widget: 'image', multiple: true },
    { name: 'caption', label: 'Caption' },
  ],
  pattern:
    /<figure>(?<images>(?:<img src=".+?" alt="">)*)<figcaption>(?<caption>.*?)<\/figcaption><\/figure>/,
  fromBlock: ({ groups: { images, caption } }) => ({
    images:
      images?.match(/<img src="(.+?)" alt="">/g)?.map((img) => img.match(/src="(.+?)"/)[1]) ?? [],
    caption,
  }),
  toBlock: ({ images, caption }) =>
    `<figure>${
      images?.map((src) => `<img src="${src}" alt="">`).join('') ?? ''
    }<figcaption>${caption}</figcaption></figure>`,
  toPreview: ({ images, caption }) =>
    `<figure>${
      images?.map((src) => `<img src="${src}" alt="">`).join('') ?? ''
    }<figcaption>${caption}</figcaption></figure>`,
});
```

The `fromBlock` function extracts the image sources from the matched HTML and returns them as an array, along with the caption. The `toBlock` and `toPreview` functions, which are identical for demo purposes, generate the appropriate HTML structure for the gallery component based on the provided images and caption.

#### Code Sample (Object Value)

Most field types hold a primitive value, but some hold an object. The [Code](https://sveltiacms.app/en/docs/fields/code) field is one of them: unless the [`output_code_only`](https://sveltiacms.app/en/docs/fields/code#output-code-only) option is enabled, its value is an object with `code` and `lang` keys. The [KeyValue](https://sveltiacms.app/en/docs/fields/keyvalue) and [Object](https://sveltiacms.app/en/docs/fields/object) fields behave the same way, as does any field with `multiple: true` — like the [gallery](#multiple-images-with-caption) above, which holds an array.

The rule is the same for all of them: `fromBlock` must return the value nested under the field name, and `toBlock` and `toPreview` receive it nested.

```js
CMS.registerEditorComponent({
  id: 'code-sample',
  label: 'Code Sample',
  icon: 'code_blocks',
  fields: [
    { name: 'title', label: 'Title' },
    { name: 'snippet', label: 'Snippet', widget: 'code' },
  ],
  pattern:
    /{{< code-sample title="(?<title>.*?)" lang="(?<lang>.*?)" >}}\n(?<code>[\s\S]*?)\n{{< \/code-sample >}}/,
  fromBlock: ({ groups: { title, lang, code } = {} }) => ({
    title,
    snippet: { code, lang },
  }),
  toBlock: ({ title = '', snippet: { code = '', lang = 'plain' } = {} }) =>
    `{{< code-sample title="${title}" lang="${lang}" >}}\n${code}\n{{< /code-sample >}}`,
  toPreview: ({ title = '', snippet: { code = '', lang = 'plain' } = {} }) =>
    `**${title}**\n\n\`\`\`${lang}\n${code}\n\`\`\``,
});
```

The shortcode is flat — `lang` and `code` are separate attributes — so `fromBlock` reassembles them into the `snippet` object the Code field expects, and `toBlock` takes them apart again.

Destructuring with a `= {}` default matters here. As noted in [Preview Output](#preview-output) above, these functions are called with an empty object while the editor is being initialized, and destructuring `snippet` from it would otherwise throw.

The `toPreview` function returns a fenced code block rather than `<pre><code>` markup. A string preview is parsed as Markdown, so the fence gives you syntax highlighting for free. The code is also escaped for you, so a snippet containing `<` or `&` is displayed rather than interpreted.

If you customize the Code field’s [`keys`](https://sveltiacms.app/en/docs/fields/code#keys) option, use those key names in place of `code` and `lang`.

#### Styled Separator

This is an [Eleventy shortcode](https://www.11ty.dev/docs/shortcodes/) example for a styled separator component:

```js
CMS.registerEditorComponent({
  id: 'separator',
  label: 'Styled Separator',
  icon: 'horizontal_rule',
  fields: [
    {
      name: 'variant',
      label: 'Variant',
      widget: 'select',
      options: [
        { value: 1, label: 'Standard' },
        { value: 2, label: 'Alternate' },
      ],
      default: 1,
    },
  ],
  pattern: /\{\% separator (?<variant>\d+)?\s?\%\}/,
  fromBlock: ({ groups: { variant } }) => ({
    variant: Number(variant),
  }),
  toBlock: ({ variant }) => `\{\% separator ${variant || 1} \%\}`,
  toPreview: ({ variant }) => renderSeparatorSvg(variant),
});
```

We need `fromBlock` here because the `variant` field is a number, and we need to convert the string captured by the regex into a number. The `toPreview` function uses a helper function to render an SVG representation of the separator based on the selected variant.

#### YouTube Embed

```js
CMS.registerEditorComponent({
  id: 'youtube',
  label: 'YouTube',
  icon: 'youtube_activity',
  fields: [
    { name: 'id', label: 'ID' },
    { name: 'width', label: 'Width', widget: 'number', valueType: 'int', default: 560 },
    { name: 'height', label: 'Height', widget: 'number', valueType: 'int', default: 315 },
  ],
  pattern: /{{< youtube id="(?<id>.*?)"(?: width="(?<width>.*?)" height="(?<height>.*?)")? >}}/m,
  fromBlock: ({ groups: { id, width, height } = {} }) => ({
    id,
    width: width ? Number(width) : 560,
    height: height ? Number(height) : 315,
  }),
  toBlock: ({ id, width = 560, height = 315 }) =>
    `{{< youtube id="${id}" width="${width}" height="${height}" >}}`,
  toPreview: ({ id, width = 560, height = 315 }) =>
    id
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${id}"
          width="${width}" height="${height}" allowfullscreen
          allow="autoplay; encrypted-media; picture-in-picture"></iframe>`
      : '',
});
```

In this example, the “YouTube” component allows users to embed YouTube videos using a Hugo shortcode. The `pattern` regular expression captures the video ID, width and height from the shortcode. The `fromBlock` function processes the captured values, casting width and height to numbers. The `toBlock` function generates the shortcode string, while the `toPreview` function creates an iframe preview of the embedded video.

The `pattern` uses the `m` (multiline) flag to make the component block-level, though it’s not multiline in this case.

#### Inline Link (Dialog Mode)

The `dialog` mode is ideal for inline elements that would be too disruptive to display as a block within the editor. This example creates a custom link shortcode that appears as a compact inline placeholder and opens a dialog when clicked:

```js
CMS.registerEditorComponent({
  id: 'custom-link',
  label: 'Custom Link',
  icon: 'link',
  mode: 'dialog',
  summary: '{{text}} — {{url}}',
  fields: [
    { name: 'text', label: 'Link Text' },
    { name: 'url', label: 'URL' },
  ],
  pattern: /\[link text="(?<text>.*?)" url="(?<url>.*?)"\]/,
  toBlock: ({ text, url }) => `[link text="${text}" url="${url}"]`,
  toPreview: ({ text, url }) => `<a href="${url}">${text}</a>`,
});
```

In this example, the “Custom Link” component renders as a small inline chip in the editor showing the link text and URL. Clicking it opens a dialog where the user can fill in or update the fields.

The `summary` template controls what text is shown in the placeholder. Here it shows the link text and URL separated by an em dash. When neither the summary nor any string field value is available (e.g. for a freshly inserted component), the component `label` is shown as a fallback.

#### Icon with Thumbnail (Dialog Mode)

The `thumbnail` option displays an image in the placeholder of a `dialog` mode component, which helps identify an inline element like an icon at a glance. This example creates a Hugo shortcode for an SVG icon:

```js
CMS.registerEditorComponent({
  id: 'icon',
  label: 'Icon',
  icon: 'star',
  mode: 'dialog',
  thumbnail: 'icon',
  fields: [{ name: 'icon', label: 'Icon', widget: 'image', accept: 'image/svg+xml' }],
  pattern: /{{< symbol icon="(?<icon>.*?)" >}}/,
  toBlock: ({ icon = '' }) => `{{< symbol icon="${icon}" >}}`,
  toPreview: ({ icon = '' }) => `<img class="icon" width="24" height="24" src="${icon}" alt="">`,
});
```

In this example, the “Icon” component renders as a small inline chip in the editor showing the selected icon. As the component has no `summary` and no String or Text field, the chip shows only the image rather than the component label. Add a `summary`, such as `summary: 'Icon'` or `summary: '{{icon}}'`, to display text next to the image.

#### Status Select (Inline Mode)

The `inline` mode is ideal for a value that’s edited right where it appears in the text. The component renders the control of its field within the line, like the date chip in the [Lexical Playground](https://playground.lexical.dev/), with no label and no dialog. This example creates a status shortcode that appears as a select box:

```js
CMS.registerEditorComponent({
  id: 'status',
  label: 'Status',
  icon: 'flag',
  mode: 'inline',
  fields: [
    { name: 'value', label: 'Status', widget: 'select', options: ['draft', 'review', 'done'] },
  ],
  pattern: /\[status:(?<value>\w+)\]/,
  toBlock: ({ value = 'draft' }) => `[status:${value}]`,
  toPreview: ({ value = 'draft' }) => `<span class="status">${value}</span>`,
});
```

The `inline` mode has the following requirements:

- The `fields` option must have a single field of one of the following types: [Boolean](https://sveltiacms.app/en/docs/fields/boolean), [Color](https://sveltiacms.app/en/docs/fields/color), [DateTime](https://sveltiacms.app/en/docs/fields/datetime), [Number](https://sveltiacms.app/en/docs/fields/number), [Relation](https://sveltiacms.app/en/docs/fields/relation), [Select](https://sveltiacms.app/en/docs/fields/select) or [String](https://sveltiacms.app/en/docs/fields/string). A Relation or Select field can’t have the `multiple` option enabled. If the field doesn’t meet these conditions, a configuration error is displayed when the CMS starts. A component registered after the configuration is loaded falls back to the `block` mode instead.
- The `pattern` should match a single line, so the component is inline in Markdown as well, rather than a block of its own.

A Select or Relation field always shows a dropdown list in the `inline` mode, as radio buttons wouldn’t fit in a line. The field’s label, hint and validation message are not displayed, while an invalid value is still highlighted.

The component can be removed with the Backspace key when the cursor is right after it, like a character, or when the component itself is focused.

#### Using React for Preview

You can use React components to create rich, interactive previews for your custom editor components. The `toPreview` function can return a React element instead of a string, allowing you to leverage React’s capabilities for rendering complex previews.

You can write the markup with [HTM](https://sveltiacms.app/en/docs/api#using-htm), JSX or `h()` calls — see the [Writing React Components](https://sveltiacms.app/en/docs/api#writing-react-components) section for more details.

```js [HTM]
CMS.registerEditorComponent({
  id: 'callout',
  label: 'Callout',
  fields: [
    {
      name: 'type',
      label: 'Type',
      widget: 'select',
      options: ['info', 'warning', 'tip'],
      default: 'info',
    },
    { name: 'content', label: 'Content', widget: 'text' },
  ],
  pattern: /\[(?<type>info|warning|tip)\]\s*(?<content>.*)/gs,
  fromBlock: (match) => ({ type: match.groups?.type, content: match.groups?.content }),
  toBlock: ({ type = 'info', content = '' }) => `[${type}] ${content}`,
  toPreview: ({ type = 'info', content = '' }) => {
    const colors = { info: '#0ea5e9', warning: '#f59e0b', tip: '#22c55e' };
    const borderColor = colors[type] ?? colors.info;

    return html`
      <div
        style=${{
          padding: '0.75em 1em',
          borderLeft: `4px solid ${borderColor}`,
          background: '#f8fafc',
          borderRadius: '0 4px 4px 0',
        }}
      >
        <strong style="text-transform: capitalize">${type}</strong>
        <p style="margin: 0.25em 0 0">${content}</p>
      </div>
    `;
  },
});
```

```jsx [JSX]
CMS.registerEditorComponent({
  id: 'callout',
  label: 'Callout',
  fields: [
    {
      name: 'type',
      label: 'Type',
      widget: 'select',
      options: ['info', 'warning', 'tip'],
      default: 'info',
    },
    { name: 'content', label: 'Content', widget: 'text' },
  ],
  pattern: /\[(?<type>info|warning|tip)\]\s*(?<content>.*)/gs,
  fromBlock: (match) => ({ type: match.groups?.type, content: match.groups?.content }),
  toBlock: ({ type = 'info', content = '' }) => `[${type}] ${content}`,
  toPreview: ({ type = 'info', content = '' }) => {
    const colors = { info: '#0ea5e9', warning: '#f59e0b', tip: '#22c55e' };
    const borderColor = colors[type] ?? colors.info;

    return (
      <div
        style={{
          padding: '0.75em 1em',
          borderLeft: `4px solid ${borderColor}`,
          background: '#f8fafc',
          borderRadius: '0 4px 4px 0',
        }}
      >
        <strong style={{ textTransform: 'capitalize' }}>{type}</strong>
        <p style={{ margin: '0.25em 0 0' }}>{content}</p>
      </div>
    );
  },
});
```

```js [h()]
CMS.registerEditorComponent({
  id: 'callout',
  label: 'Callout',
  fields: [
    {
      name: 'type',
      label: 'Type',
      widget: 'select',
      options: ['info', 'warning', 'tip'],
      default: 'info',
    },
    { name: 'content', label: 'Content', widget: 'text' },
  ],
  pattern: /\[(?<type>info|warning|tip)\]\s*(?<content>.*)/gs,
  fromBlock: (match) => ({ type: match.groups?.type, content: match.groups?.content }),
  toBlock: ({ type = 'info', content = '' }) => `[${type}] ${content}`,
  toPreview: ({ type = 'info', content = '' }) => {
    const colors = { info: '#0ea5e9', warning: '#f59e0b', tip: '#22c55e' };
    const borderColor = colors[type] ?? colors.info;

    return h(
      'div',
      {
        style: {
          padding: '0.75em 1em',
          borderLeft: `4px solid ${borderColor}`,
          background: '#f8fafc',
          borderRadius: '0 4px 4px 0',
        },
      },
      h('strong', { style: { textTransform: 'capitalize' } }, type),
      h('p', { style: { margin: '0.25em 0 0' } }, content),
    );
  },
});
```

#### Using a Framework Component for Preview

The `toPreview` function can also return a DOM element, which is inserted into the preview as is. This allows you to reuse a component written with Svelte, Vue or any other framework that can be mounted on an element, so the preview matches what your site actually renders.

The CMS cannot destroy a component that it didn’t create. Instead, it dispatches a custom `Unmount` event on the returned element when:

- the preview is replaced or removed
- the preview pane is closed
- the entry is closed

Listen for that event to tear down your component and avoid memory leaks.

The following example renders a “Warning” component that wraps some body text. The body is a nested [RichText](https://sveltiacms.app/en/docs/fields/richtext) field, so its value arrives as a Markdown string. The element you return is inserted as is, so `**bold**` would show up with the asterisks intact unless you render it.

The example passes the value to the component. Once its element is available, the component renders the value with the [`renderRichText`](https://sveltiacms.app/en/docs/api/rendering-markdown) method — with an attachment in Svelte, or in the `onMounted` hook in Vue:

```js [Svelte]
import { registerEditorComponent } from '@sveltia/cms';
import { mount, unmount } from 'svelte';
import Warning from '$lib/components/Warning.svelte';

registerEditorComponent({
  id: 'warning',
  label: 'Warning',
  icon: 'warning',
  fields: [{ name: 'body', label: 'Body', widget: 'richtext' }],
  pattern: /<Warning>\s*(?<body>[\s\S]*?)\s*<\/Warning>/,
  toBlock: ({ body = '' }) => `<Warning>\n\n${body}\n\n</Warning>`,
  toPreview: ({ body = '' }) => {
    const element = document.createElement('div');
    const component = mount(Warning, { target: element, props: { body } });

    element.addEventListener('Unmount', () => unmount(component), { once: true });

    return element;
  },
});
```

```js [Vue]
import { registerEditorComponent } from '@sveltia/cms';
import { createApp } from 'vue';
import Warning from './components/Warning.vue';

registerEditorComponent({
  id: 'warning',
  label: 'Warning',
  icon: 'warning',
  fields: [{ name: 'body', label: 'Body', widget: 'richtext' }],
  pattern: /<Warning>\s*(?<body>[\s\S]*?)\s*<\/Warning>/,
  toBlock: ({ body = '' }) => `<Warning>\n\n${body}\n\n</Warning>`,
  toPreview: ({ body = '' }) => {
    const element = document.createElement('div');
    const app = createApp(Warning, { body });

    app.mount(element);
    element.addEventListener('Unmount', () => app.unmount(), { once: true });

    return element;
  },
});
```

```svelte [Svelte]
<script>
  import { renderRichText } from '@sveltia/cms';

  let { body } = $props();
</script>

<div class="bg-red-100" {@attach (element) => renderRichText(element, body)}></div>
```

```vue [Vue]
<script setup>
import { renderRichText } from '@sveltia/cms';
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps(['body']);
const element = ref(null);
let destroy;

onMounted(() => {
  destroy = renderRichText(element.value, props.body);
});

onUnmounted(() => {
  destroy?.();
});
</script>

<template>
  <div class="bg-red-100" ref="element"></div>
</template>
```

Note that this approach requires a build step, so the CMS has to be [installed as an npm package](https://sveltiacms.app/en/docs/api#using-the-npm-package) and imported into your admin page, rather than loaded from a CDN.

`renderRichText` returns a function that destroys the rendered content. The examples call it when the component is unmounted: automatically in Svelte, as an attachment’s return value is its cleanup function, and in the `onUnmounted` hook in Vue.

This matters because the nested value may contain other editor components. They are rendered with their own previews and need to be destroyed along with yours.

The output is sanitized regardless of the field’s `sanitize_preview` option, so the nested value is safe to render even when the CMS has untrusted users. Any image in the nested value keeps working, too, as the method replaces internal image paths with blob URLs just like the preview pane does.

If you need an HTML string instead, for example to insert with Svelte’s `{@html}` tag or Vue’s `v-html` directive, see [Rendering Markdown](https://sveltiacms.app/en/docs/api/rendering-markdown#using-marked-and-dompurify). It covers the lower-level `marked` and `DOMPurify` libraries and the sanitization caveats that apply.

#### Rendering Comark Components

[Comark](https://comark.dev/) and [MDC](https://content.nuxt.com/docs/files/markdown), used by Nuxt Content, extend Markdown with a component syntax:

- `::name{props}` opens a block component that ends with `::`.
- `:name[text]{props}` is an inline component.

Sveltia CMS doesn’t parse this syntax itself. However, you can register a custom editor component for each component your site provides. Editors can then fill in a form instead of writing the syntax by hand, and Comark renders the preview with the same components as your site.

This example registers an `alert` block component, whose body can contain other components, and an inline `badge` component. Their `toPreview` functions pass the component’s own Markdown to a `renderComark` function, defined in the next code block. Put both in the same file, with `renderComark` first:

```js
// Comark lets a parent component use more colons than its children, so the closing `::` of a
// nested component doesn’t close the parent
const getFence = (body) =>
  ':'.repeat(Math.max(1, ...(body.match(/^:{2,}(?=\w)/gm) ?? []).map((c) => c.length)) + 1);

const toAlertBlock = ({ type = 'info', body = '' }) => {
  const fence = getFence(body);

  return `${fence}alert{type="${type}"}\n${body}\n${fence}`;
};

const toBadgeBlock = ({ text = '', color = 'blue' }) => `:badge[${text}]{color="${color}"}`;

registerEditorComponent({
  id: 'alert',
  label: 'Alert',
  icon: 'info',
  fields: [
    {
      name: 'type',
      label: 'Type',
      widget: 'select',
      options: ['info', 'warning', 'danger'],
      default: 'info',
    },
    { name: 'body', label: 'Body', widget: 'richtext' },
  ],
  pattern: /^(?<fence>:{2,})alert(?:\{type="(?<type>\w+)"\})?\n(?<body>[\s\S]*?)\n\k<fence>$/m,
  fromBlock: ({ groups: { type = 'info', body = '' } = {} }) => ({ type, body }),
  toBlock: toAlertBlock,
  toPreview: (data) => renderComark(toAlertBlock(data)),
});

registerEditorComponent({
  id: 'badge',
  label: 'Badge',
  icon: 'label',
  fields: [
    { name: 'text', label: 'Text' },
    {
      name: 'color',
      label: 'Color',
      widget: 'select',
      options: ['blue', 'green', 'red'],
      default: 'blue',
    },
  ],
  pattern: /:badge\[(?<text>[^\]]*)\](?:\{color="(?<color>\w+)"\})?/,
  fromBlock: ({ groups: { text = '', color = 'blue' } = {} }) => ({ text, color }),
  toBlock: toBadgeBlock,
  toPreview: (data) => renderComark(toBadgeBlock(data), { inline: true }),
});
```

The `renderComark` function returns a DOM element, into which Comark renders the Markdown asynchronously.

With Svelte or Vue, it uses Comark’s [`<Markdown>`](https://comark.dev/rendering/svelte) component with your site’s own components. This requires a build step, as described in [Using a Framework Component for Preview](#using-a-framework-component-for-preview) above.

Without a build step, it can load [`@comark/html`](https://comark.dev/rendering/html) and render HTML strings, with the components written as functions. Comark doesn’t provide a browser build, so the example uses the ES module that jsDelivr’s [`+esm` endpoint](https://www.jsdelivr.com/esm) bundles from the npm package on demand. That module isn’t maintained by Comark, so pin the exact version you’ve tested:

```js [Svelte]
import { registerEditorComponent } from '@sveltia/cms';
import { Markdown } from '@comark/svelte';
import { mount, unmount } from 'svelte';
import Alert from '$lib/components/comark/Alert.svelte';
import Badge from '$lib/components/comark/Badge.svelte';

const components = { alert: Alert, badge: Badge };

const renderComark = (value, { inline = false } = {}) => {
  const element = document.createElement(inline ? 'span' : 'div');
  const component = mount(Markdown, { target: element, props: { value, components } });

  // Comark wraps the output in a `<div>`, which would break the line around an inline component
  if (inline) {
    element.style.display = 'inline-block';
  }

  element.addEventListener('Unmount', () => unmount(component), { once: true });

  return element;
};
```

```js [Vue]
import { registerEditorComponent } from '@sveltia/cms';
import { Markdown } from '@comark/vue';
import { createApp, h, Suspense } from 'vue';
import Alert from './components/comark/Alert.vue';
import Badge from './components/comark/Badge.vue';

const components = { alert: Alert, badge: Badge };

const renderComark = (value, { inline = false } = {}) => {
  const element = document.createElement(inline ? 'span' : 'div');
  // Comark’s `<Markdown>` is an async component, which has to be wrapped in `<Suspense>`
  const app = createApp(() => h(Suspense, null, () => h(Markdown, { value, components })));

  // Comark wraps the output in a `<div>`, which would break the line around an inline component
  if (inline) {
    element.style.display = 'inline-block';
  }

  app.mount(element);
  element.addEventListener('Unmount', () => app.unmount(), { once: true });

  return element;
};
```

```js [Vanilla JS]
const { registerEditorComponent } = CMS;

// Render each child on its own, as `render()` mistakes a list of children that starts with text for
// a single element
const renderChildren = async (children, render) =>
  (await Promise.all(children.map((child) => render([child])))).join('');

const comark = import('https://cdn.jsdelivr.net/npm/@comark/html@0.7.0/+esm').then(
  ({ createHtmlRenderer }) =>
    createHtmlRenderer({
      components: {
        alert: async ([, { type = 'info' }, ...children], { render }) =>
          `<div class="alert alert-${type}" role="alert">${await renderChildren(children, render)}</div>`,
        badge: async ([, { color = 'blue' }, ...children], { render }) =>
          `<span class="badge badge-${color}">${await renderChildren(children, render)}</span>`,
      },
    }),
);

const renderComark = (value, { inline = false } = {}) => {
  const element = document.createElement(inline ? 'span' : 'div');

  comark.then(async (renderHtml) => {
    element.innerHTML = DOMPurify.sanitize(await renderHtml(value));
  });

  return element;
};
```

With these components, the following Markdown is edited as a form, saved back as is and rendered in the preview pane by Comark, nested components included:

```mdc
Intro with a :badge[New]{color="green"} badge.

:::alert{type="warning"}
Outer **bold** text.

::alert{type="info"}
Inner :badge[Hot]{color="red"} text.
::
:::
```

A few things to note:

- The `alert` pattern captures the opening colons as `fence` and matches the closing line with the `\k<fence>` backreference. A block therefore only ends at a line with the same number of colons. `toBlock` then picks a fence with one more colon than any component in the body, which keeps the output valid however deeply components are nested. `fromBlock` is specified to leave the `fence` group out of the field values.
- The `m` flag makes `alert` a block component, while `badge`, which has no flag, is matched within a paragraph as an inline component.
- Comark renders the whole Markdown of `alert`, its body included, so it renders the nested `alert` and `badge` as well, without [`renderRichText`](https://sveltiacms.app/en/docs/api/rendering-markdown).
- Comark doesn’t know about the CMS, but an image, video or audio it renders is still displayed, even if it hasn’t been published yet. This is because the CMS [replaces the URLs](#displaying-assets) of these elements in the preview. If one of your components displays a file in another way, such as a CSS background image, pass the [`getAsset`](#displaying-assets) function from `toPreview` to `renderComark`, and on to the component, e.g. with Svelte’s [`setContext`](https://svelte.dev/docs/svelte/context) or Vue’s [`provide`](https://vuejs.org/guide/components/provide-inject).
- Each pattern matches the props in a fixed order, as `toBlock` writes them. If your content has props in a different order, or uses other prop syntax such as `{.class}`, [slots](https://comark.dev/syntax/components) or a YAML props block, capture the whole props string or block with the pattern and parse it in `fromBlock` instead.
- The Svelte and Vue examples don’t sanitize the output, and Comark keeps any raw HTML in the Markdown. See the [security risk](#preview-output) of DOM element previews if untrusted users have access to your CMS. The vanilla JS example sanitizes the HTML with [DOMPurify](https://sveltiacms.app/en/docs/api/rendering-markdown#using-marked-and-dompurify), which the CMS provides.

### Showcase

Real-world examples of editor components can be found in our [showcase](https://sveltiacms.app/en/showcase?feature=editor-components).

Source: https://sveltiacms.app/en/docs/api/editor-components

---

## Rendering Markdown

The value of a [RichText](https://sveltiacms.app/en/docs/fields/richtext) or [Markdown](https://sveltiacms.app/en/docs/fields/markdown) field is a Markdown string. You may render such a value yourself, for example in:

- a [Custom Preview Template](https://sveltiacms.app/en/docs/api/preview-templates)
- the [preview output](https://sveltiacms.app/en/docs/api/editor-components#preview-output) of a [Custom Editor Component](https://sveltiacms.app/en/docs/api/editor-components)
- a [Custom Field Type](https://sveltiacms.app/en/docs/api/field-types)

In that case, the string is used as is, so text like `**bold**` appears verbatim unless you convert it to HTML.

### Overview

Sveltia CMS offers two ways to do that. Both are available as soon as the CMS is loaded, whether you use the CDN build or the npm package. No additional dependency is necessary:

- `CMS.renderRichText()` renders the value into a DOM element you provide, exactly like the built-in Preview Pane — custom editor components, images and sanitization included. Use it whenever you have an element to render into.
- `marked` and `DOMPurify` are the parser and sanitizer the CMS uses internally, exposed on the `window` object. Use them when you need an HTML string, such as for a React component.

### Using `renderRichText`

The `CMS.renderRichText()` method renders a Markdown string into a DOM element you provide, using the same pipeline as the Preview Pane of a RichText field:

- Custom editor components are rendered with their own `toPreview` output, including components nested in the value, recursively
- Markdown is parsed into HTML, with a single line break becoming a `<br>`
- Code blocks are syntax-highlighted
- Internal image paths are replaced with blob URLs, so uploaded images appear in the preview
- The resulting HTML is sanitized

It takes the target element, the Markdown string and an optional options object. It returns a function that removes the rendered content and destroys any component previews within it:

```js
const destroy = CMS.renderRichText(element, markdown, options);
```

The content is rendered asynchronously. The target element doesn’t have to be attached to the document yet when you call the method. For example, it can be an element created in `toPreview` that the CMS inserts into the Preview Pane afterwards.

The `options` object accepts the following property:

- `fieldConfig` — [RichText field](https://sveltiacms.app/en/docs/fields/richtext) options to be applied, such as [`editor_components`](https://sveltiacms.app/en/docs/fields/richtext#editor-components) to restrict the available components and [`sanitize_preview`](https://sveltiacms.app/en/docs/fields/richtext#sanitize-preview) to disable sanitization. Options not given here fall back to the [`field_defaults`](https://sveltiacms.app/en/docs/fields/richtext#global-field-defaults) configuration. The exception is `sanitize_preview`: the output is sanitized unless it’s explicitly set to `false` here.

The method is designed for an editor component whose `toPreview` returns a DOM element. There, the value of a nested RichText field would otherwise be displayed verbatim.

Call the returned `destroy` function once the CMS dispatches the `Unmount` event on the element, so that the nested previews are destroyed along with your component:

```js [Svelte]
import { registerEditorComponent } from '@sveltia/cms';
import { mount, unmount } from 'svelte';
import Warning from '$lib/components/Warning.svelte';

registerEditorComponent({
  id: 'warning',
  label: 'Warning',
  icon: 'warning',
  fields: [{ name: 'body', label: 'Body', widget: 'richtext' }],
  pattern: /<Warning>\s*(?<body>[\s\S]*?)\s*<\/Warning>/,
  toBlock: ({ body = '' }) => `<Warning>\n\n${body}\n\n</Warning>`,
  toPreview: ({ body = '' }) => {
    const element = document.createElement('div');
    const component = mount(Warning, { target: element, props: { body } });

    element.addEventListener('Unmount', () => unmount(component), { once: true });

    return element;
  },
});
```

```js [Vanilla JS]
CMS.registerEditorComponent({
  id: 'warning',
  label: 'Warning',
  icon: 'warning',
  fields: [{ name: 'body', label: 'Body', widget: 'richtext' }],
  pattern: /<Warning>\s*(?<body>[\s\S]*?)\s*<\/Warning>/,
  toBlock: ({ body = '' }) => `<Warning>\n\n${body}\n\n</Warning>`,
  toPreview: ({ body = '' }) => {
    const element = document.createElement('div');
    const destroy = CMS.renderRichText(element, body);

    element.className = 'bg-red-100';
    element.addEventListener('Unmount', destroy, { once: true });

    return element;
  },
});
```

In the Svelte example, the component itself calls the method with an [attachment](https://svelte.dev/docs/svelte/@attach), which runs the returned `destroy` function automatically when the component is unmounted:

```svelte
<script>
  import { renderRichText } from '@sveltia/cms';

  let { body } = $props();
</script>

<div class="bg-red-100" {@attach (element) => renderRichText(element, body)}></div>
```

The nested value goes through the same component matching as the field itself. A component can therefore contain other components, or even another instance of itself. This works as long as the [`pattern`](https://sveltiacms.app/en/docs/api/editor-components#required-properties) of each component can match its own block within the parent’s. Any nested component preview is rendered in place, whether it returns a string, a DOM element or a React element.

**Raw values for nested fields**

The value of a nested RichText field is passed to `toPreview` as is, including the syntax of any component within it. It’s never partially rendered, regardless of the order in which components are registered, so you can always pass it to `renderRichText` or process it yourself.

### Using `marked` and `DOMPurify`

You may need an HTML string rather than a rendered element, for example to pass it to a React component’s `dangerouslySetInnerHTML` prop. For that, Sveltia CMS exposes the two libraries it uses internally, so you don’t need to add a dependency of your own:

- `marked` — The [Marked](https://marked.js.org/) parser, which converts a Markdown string to an HTML string
- `DOMPurify` — The [DOMPurify](https://github.com/cure53/DOMPurify) sanitizer, which strips scripts and other dangerous markup from an HTML string

These are available on the `window` object when Sveltia CMS is loaded, whether you use the CDN build or the npm package. No additional imports are necessary to use them.

```js
const html = DOMPurify.sanitize(marked.parse(markdown));
```

The CMS renders the Preview Pane with the `breaks` option enabled, meaning a single line break becomes a `<br>`. Pass the same option if you want your output to match:

```js
const html = DOMPurify.sanitize(marked.parse(markdown, { breaks: true }));
```

Note that, unlike `renderRichText`, this approach doesn’t render custom editor components or resolve internal image paths. The value is converted as plain Markdown.

**Security Risk**

Always sanitize the HTML before inserting it into the DOM, as the examples above do. Markdown allows raw HTML, so skipping the sanitizer can expose your CMS to [cross-site scripting](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) (XSS) attacks if untrusted users have access to the CMS. The risk is especially high with [Open Authoring](https://sveltiacms.app/en/docs/workflows/open), because entries can be written by anybody.

**Shared parser instance**

`marked` is the very parser the CMS uses to render the Preview Pane, so any extension you add with [`marked.use()`](https://marked.js.org/using_pro) also changes how the CMS itself renders Markdown. Prefer passing [options](https://marked.js.org/using_advanced) to `marked.parse()` for one-off customization.

Source: https://sveltiacms.app/en/docs/api/rendering-markdown
