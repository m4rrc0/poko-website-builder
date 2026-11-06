# Entry Collections: Listings and Views

How entries appear in the content library: summaries, thumbnails, index files, the table view, sorting, grouping and filtering. For creation, deletion, reordering and bulk editing controls, see `entries-operations.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Entry Listings

After creating an entry collection, you might want to customize how entries are displayed in the Sveltia CMS interface. The following options allow you to control various aspects of entry listings.

### Summaries

By default, Sveltia CMS uses the `title` field (or a field defined with the [`identifier_field` option](https://sveltiacms.app/en/docs/collections/entries/slugs#specifying-an-identifier-field)) as the summary for each entry in the listing view. If the field is empty or missing, the `title`, `name` or `label` field is used instead, whichever has a value first.

Sometimes entries might only have a `body` field without a `title` field. In such cases, Sveltia CMS will look for a header in the Markdown body field, if it exists, or use the entry slug as a fallback to ensure that the summary is never empty. This behavior supports typical Markdown-based setups like [VitePress](https://sveltiacms.app/en/docs/frameworks/vitepress) and [Docusaurus](https://sveltiacms.app/en/docs/frameworks/docusaurus).

You can customize the summary displayed for each entry using the `summary` option. This option accepts a string with template tags that will be replaced with entry-specific values when generating the summary. For example, to display both the title and date of each entry in the summary, you can use the following configuration:

```yaml [YAML]
summary: '{{title}} ({{date}})'
```

```toml [TOML]
summary = "{{title}} ({{date}})"
```

```json [JSON]
{
  "summary": "{{title}} ({{date}})"
}
```

```js [JavaScript]
{
  summary: "{{title}} ({{date}})",
}
```

Basic Markdown syntax is supported in the `summary` option, including bold, italics and inline code. The `<strong>`, `<em>` and `<code>` HTML tags work as well. Any other tag is shown as text, so a title like `Vec<T> in Rust` shows in full. For example:

```yaml [YAML]
summary: '**{{title}}** - _{{date}}_ `{{status}}`'
```

```toml [TOML]
summary = "**{{title}}** - _{{date}}_ `{{status}}`"
```

```json [JSON]
{
  "summary": "**{{title}}** - _{{date}}_ `{{status}}`"
}
```

```js [JavaScript]
{
  summary: "**{{title}}** - _{{date}}_ `{{status}}`",
}
```

You can use [string transformations](https://sveltiacms.app/en/docs/string-transformations) with these template tags as well. For example:

```yaml [YAML]
summary: "{{title}} - {{date | date('DD MMM YYYY')}} {{published | ternary('', '(draft)')}}"
```

```toml [TOML]
summary = "{{title}} - {{date | date('DD MMM YYYY')}} {{published | ternary('', '(draft)')}}"
```

```json [JSON]
{
  "summary": "{{title}} - {{date | date('DD MMM YYYY')}} {{published | ternary('', '(draft)')}}"
}
```

```js [JavaScript]
{
  summary: "{{title}} - {{date | date('DD MMM YYYY')}} {{published | ternary('', '(draft)')}}",
}
```

The following template tags are supported in the `summary` option, in addition to [slug template tags](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags) except date-related ones:

- `{{dirname}}`: The name of the directory containing the entry file, relative to the collection `folder`. It never includes the locale folder of an [i18n structure](https://sveltiacms.app/en/docs/i18n/structures) with a folder per locale, so it’s the same in every locale.
- `{{filename}}`: The entry filename without the extension.
- `{{extension}}`: The entry file extension.
- `{{commit_author}}`: The last commit author of the entry file from Git history (if available).
- `{{commit_date}}`: The last commit date of the entry file from Git history (if available).
- `{{locales}}`: The enabled locales for the entry when using [i18n support](https://sveltiacms.app/en/docs/i18n).

Each file in a [file collection](https://sveltiacms.app/en/docs/collections/files#summaries) can have a `summary` option of its own, and so can an entry collection’s [special index file](#managing-hugo-s-special-index-file).

**Known issue**

Git commit information is not available with the GitLab backend due to API limitations.

### Thumbnails

By default, Sveltia CMS automatically looks for any non-nested, non-empty Image or File field in the entry to use as a thumbnail in the entry listing view. However, you can customize this behavior using the `thumbnail` option.

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    thumbnail: featuredImage
    fields:
      - { name: title, label: Title }
      - { name: featuredImage, label: Featured Image, widget: image }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
thumbnail = "featuredImage"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "featuredImage"
label = "Featured Image"
widget = "image"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "thumbnail": "featuredImage",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "featuredImage", "label": "Featured Image", "widget": "image" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]{7}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      thumbnail: "featuredImage",
      fields: [
        { name: "title", label: "Title" },
        { name: "featuredImage", label: "Featured Image", widget: "image" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

The `thumbnail` option can take a string or an array of strings representing the field names to be used as thumbnails. The first field that contains a valid image will be used as the thumbnail. For example:

```yaml [YAML]
thumbnail: [thumbnailImage, coverImage]
```

```toml [TOML]
thumbnail = ["thumbnailImage", "coverImage"]
```

```json [JSON]
{
  "thumbnail": ["thumbnailImage", "coverImage"]
}
```

```js [JavaScript]
{
  thumbnail: ["thumbnailImage", "coverImage"],
}
```

A nested field can be specified using dot notation, e.g. `heroImage.src`. A wildcard in the field name is also supported, e.g. `images.*.src`, to target images in a list field.

#### Thumbnail Paths

If your thumbnails are stored at predictable locations rather than referenced by a field, you can specify a file path instead of a field name. A value starting with a slash is treated as a path. It’s resolved in the same way as an Image field value, so it’s typically a path under your [`public_folder`](https://sveltiacms.app/en/docs/media/internal).

This avoids adding an extra field to every entry just to hold a thumbnail path that can be derived from the entry itself.

The path can contain the same template tags as the [`preview_path` option](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths), including `{{slug}}`, `{{dirname}}`, `{{filename}}`, date and time tags, and field values. The date and time tags are based on the field specified with the `preview_path_date_field` option, or the first DateTime field in the collection. [String transformations](https://sveltiacms.app/en/docs/string-transformations) can be used as well. For example:

```yaml [YAML]
thumbnail: '/images/thumbnails/{{slug}}.webp'
```

```toml [TOML]
thumbnail = "/images/thumbnails/{{slug}}.webp"
```

```json [JSON]
{
  "thumbnail": "/images/thumbnails/{{slug}}.webp"
}
```

```js [JavaScript]
{
  thumbnail: "/images/thumbnails/{{slug}}.webp",
}
```

Paths and field names can be combined in an array. They are tried in order, so the example below uses the `coverImage` field when no file exists at the given path:

```yaml [YAML]
thumbnail: ['/images/thumbnails/{{slug}}.webp', coverImage]
```

```toml [TOML]
thumbnail = ["/images/thumbnails/{{slug}}.webp", "coverImage"]
```

```json [JSON]
{
  "thumbnail": ["/images/thumbnails/{{slug}}.webp", "coverImage"]
}
```

```js [JavaScript]
{
  thumbnail: ["/images/thumbnails/{{slug}}.webp", "coverImage"],
}
```

The template tags are filled with the values of the default locale. If a tag cannot be resolved, for example because the field it refers to is empty, the path is skipped and the next candidate is tried. A relative path is not supported, because a value without a leading slash is treated as a field name.

#### Disabling Thumbnails

Occasionally, you may not have suitable images for thumbnails. For example, your images may have subtle differences or varied aspect ratios. In that case, you can disable the thumbnail feature by setting the `thumbnail` option to `false` or an empty array:

```yaml [YAML]
thumbnail: false
```

```toml [TOML]
thumbnail = false
```

```json [JSON]
{
  "thumbnail": false
}
```

```js [JavaScript]
{
  thumbnail: false,
}
```

### Including and Excluding Entries

Sometimes, you may want to include or exclude specific entries from being displayed in the Sveltia CMS interface. Sveltia CMS provides options to manage this.

#### Managing Hugo’s Special Index File

By default, Hugo’s [special `_index.md` files](https://gohugo.io/content-management/organization/#index-pages-_indexmd) are hidden in a folder collection unless the `path` option is configured to end with `_index` and the `extension` is set to `md`. You have to create a [file collection](https://sveltiacms.app/en/docs/collections/files) to manage the file, since it usually comes with a different set of fields than regular entry fields.

The `index_file` option allows you to include and manage the special index file within the same folder collection. This way, editors can easily access and edit the index file alongside regular entries.

```yaml [YAML]{10-13}
collections:
  - name: posts
    label: Blog posts
    folder: /content/posts
    fields: # Fields for regular entries
      - { name: title, label: Title }
      - { name: date, label: Published Date, widget: datetime }
      - { name: description, label: Description }
      - { name: body, label: Body, widget: richtext }
    index_file:
      fields: # Fields for the index file
        - { name: title, label: Title }
        - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{24-33}
[[collections]]
name = "posts"
label = "Blog posts"
folder = "/content/posts"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "date"
label = "Published Date"
widget = "datetime"

[[collections.fields]]
name = "description"
label = "Description"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"

[collections.index_file]

[[collections.index_file.fields]]
name = "title"
label = "Title"

[[collections.index_file.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{13-18}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog posts",
      "folder": "/content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "date", "label": "Published Date", "widget": "datetime" },
        { "name": "description", "label": "Description" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ],
      "index_file": {
        "fields": [
          { "name": "title", "label": "Title" },
          { "name": "body", "label": "Body", "widget": "richtext" }
        ]
      }
    }
  ]
}
```

```js [JavaScript]{13-18}
{
  collections: [
    {
      name: "posts",
      label: "Blog posts",
      folder: "/content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "date", label: "Published Date", widget: "datetime" },
        { name: "description", label: "Description" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
      index_file: {
        fields: [
          { name: "title", label: "Title" },
          { name: "body", label: "Body", widget: "richtext" },
        ],
      },
    },
  ],
}
```

Here is an example of full customization. All options are optional.

```yaml [YAML]
index_file:
  name: _index # Filename without a locale or extension. Default: _index
  extension: md # File extension. Default: the collection’s extension
  format: frontmatter # File format. Default: detected from the extension, or the collection’s format
  label: Index File # Human-readable file label. Default: Index File
  icon: home # Material Symbols icon name. Default: home
  summary: '{{title}} ({{locales}})' # Summary template. Default: the label
  fields: # Fields for the index file. If omitted, regular entry fields are used
    ...
  editor:
    preview: false # Hide the preview pane if needed. Default: true
```

```toml [TOML]
[index_file]
name = "_index"
extension = "md"
format = "frontmatter"
label = "Index File"
icon = "home"
summary = "{{title}} ({{locales}})"
# fields would be defined as [[index_file.fields]] elements
# editor configuration
[index_file.editor]
preview = false
```

```json [JSON]
{
  "index_file": {
    "name": "_index",
    "extension": "md",
    "format": "frontmatter",
    "label": "Index File",
    "icon": "home",
    "summary": "{{title}} ({{locales}})",
    "fields": [],
    "editor": {
      "preview": false
    }
  }
}
```

```js [JavaScript]
{
  index_file: {
    name: "_index",
    extension: "md",
    format: "frontmatter",
    label: "Index File",
    icon: "home",
    summary: "{{title}} ({{locales}})",
    fields: [],
    editor: {
      preview: false,
    },
  },
}
```

The index file is listed with its `label` by default. To show something about its content instead, set the `summary` option. It works like the collection’s [`summary` option](#summaries), with two differences: it uses the index file’s own `fields`, and if no `title`, `name` or `label` field or header in the Markdown body has a value, `{{title}}` falls back to the label instead of the slug. The index file’s template replaces the collection’s wherever the collection’s would be used, such as in the entry list and search results.

If your regular entry fields and index file fields are identical and you don’t need any options, simply write:

```yaml [YAML]
index_file: true
```

```toml [TOML]
index_file = true
```

```json [JSON]
{
  "index_file": true
}
```

```js [JavaScript]
{
  index_file: true,
}
```

Note that the special index file is placed right under the `folder`, regardless of the collection’s [`path` option](https://sveltiacms.app/en/docs/collections/entries/slugs#using-subfolders). For example, if the `path` is `{{year}}/{{slug}}`, a regular entry would be saved as `content/posts/2025/title.md`, but the index file remains at `content/posts/_index.md`.

For a multilingual Hugo site using [translation by content directory](https://gohugo.io/content-management/multilingual/#translation-by-content-directory), where the section folders sit below the locale folders, put the [`{{locale}}` placeholder](https://sveltiacms.app/en/docs/i18n/structures#custom-locale-folder-placement) in the `folder` option, e.g. `content/{{locale}}/posts`. The index file then lands in each locale’s section folder, e.g. `content/en/posts/_index.md`, rather than under the `content` folder.

The index file is listed beside the regular entries, but it isn’t counted as one of them, because it stands for the collection’s own page rather than for something in it. It’s left out of the entry count shown next to the collection in the [collection list](https://sveltiacms.app/en/docs/ui/content-library#collection-list). It also doesn’t take up a slot in the collection’s [`limit`](https://sveltiacms.app/en/docs/collections/entries/operations#limiting-entry-count). A collection holding nothing but its index file therefore shows a count of `0`.

Only the collection’s own index file is treated this way. One collection’s `folder` may contain another’s, such as a `pages` collection on `content` with a `posts` collection on `content/posts`. In that case, the inner collection’s `content/posts/_index.md` is an ordinary entry as far as the outer collection is concerned. The outer collection’s [`filter`](#filtering-entries) applies to it, and it’s counted like any other entry the filter lets through.

##### Managing Eleventy’s Directory Data File

The index file doesn’t have to be a Hugo `_index.md`. Any file with a fixed name right under the collection folder can be one, in a format of its own.

For example, Eleventy’s [directory data file](https://www.11ty.dev/docs/data-template-dir/) is a JSON (or YAML, if configured) file named after the folder, like `posts/posts.json`. It holds the data every Markdown entry in the folder inherits. Set the `name` and `extension` (or `format`) options to manage it beside the entries:

```yaml [YAML]{9-10}
collections:
  - name: posts
    label: Blog posts
    folder: content/posts
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
    index_file:
      name: posts
      extension: json
      label: Posts Data
      icon: description
      fields:
        - { name: layout, label: Layout }
        - { name: tags, label: Tags, widget: list }
```

```toml [TOML]{16-17}
[[collections]]
name = "posts"
label = "Blog posts"
folder = "content/posts"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"

[collections.index_file]
name = "posts"
extension = "json"
label = "Posts Data"
icon = "description"

[[collections.index_file.fields]]
name = "layout"
label = "Layout"

[[collections.index_file.fields]]
name = "tags"
label = "Tags"
widget = "list"
```

```json [JSON]{12-13}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog posts",
      "folder": "content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ],
      "index_file": {
        "name": "posts",
        "extension": "json",
        "label": "Posts Data",
        "icon": "description",
        "fields": [
          { "name": "layout", "label": "Layout" },
          { "name": "tags", "label": "Tags", "widget": "list" }
        ]
      }
    }
  ]
}
```

```js [JavaScript]{12-13}
{
  collections: [
    {
      name: "posts",
      label: "Blog posts",
      folder: "content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
      index_file: {
        name: "posts",
        extension: "json",
        label: "Posts Data",
        icon: "description",
        fields: [
          { name: "layout", label: "Layout" },
          { name: "tags", label: "Tags", widget: "list" },
        ],
      },
    },
  ],
}
```

With this configuration, `content/posts/posts.json` is listed and edited as the collection’s index file, read and written as JSON, while `content/posts/*.md` are the regular entries. Other `.json` files in the folder are left alone.

The `format` option works as it does for [the collection](https://sveltiacms.app/en/docs/collections/entries/formats). Give it alone to have the extension follow, or give both when they don’t go together, e.g. `extension: md` with `format: toml-frontmatter`. The [front matter delimiters](https://sveltiacms.app/en/docs/collections/entries/formats#front-matter-delimiter), body field and other file options are shared with the entries.

**Reserved Name**

An index file with an extension of its own could sit beside an entry of the same name, like `posts/posts.md` next to `posts/posts.json`, but the two would be addressed the same way in the CMS. The index file’s name is therefore reserved. Such an entry is left out of the collection, and a new entry whose slug would clash with it is renamed like any duplicate.

#### Filtering Entries

With the `filter` option, you can limit the entries displayed in the Sveltia CMS interface based on specific criteria. This is useful for collections where you want to show only a subset of entries, such as a specific language or category.

This option takes an object with two properties:

- `field`: The name of the field to filter by.
- `value` or `pattern`: The value that the field must match for an entry to be included.
  - The `value` property checks for exact matches, while the `pattern` property allows for regular expression matching.
  - The `value` can be a single value or an array of values. If an array is provided, entries matching any of the values will be included. If `null` is provided as a value, entries where the field is not set will be included.
  - The `pattern` property should be a string representing a valid regular expression. An entry where the field is not set never matches a pattern.

The example below shows how to create two separate collections for English and French blog posts, filtering entries based on the `lang` field:

```yaml [YAML]{5,13}
collections:
  - name: english-posts
    label: English Posts
    folder: /content/posts
    filter: { field: lang, value: en }
    fields:
      - { name: lang, label: Language, widget: select, options: [en, fr] }
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
  - name: french-posts
    label: French Posts
    folder: /content/posts
    filter: { field: lang, value: fr }
    fields:
      - { name: lang, label: Language, widget: select, options: [en, fr] }
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5,26}
[[collections]]
name = "english-posts"
label = "English Posts"
folder = "/content/posts"
filter = { field = "lang", value = "en" }

[[collections.fields]]
name = "lang"
label = "Language"
widget = "select"
options = ["en", "fr"]

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"

[[collections]]
name = "french-posts"
label = "French Posts"
folder = "/content/posts"
filter = { field = "lang", value = "fr" }

[[collections.fields]]
name = "lang"
label = "Language"
widget = "select"
options = ["en", "fr"]

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7,18}
{
  "collections": [
    {
      "name": "english-posts",
      "label": "English Posts",
      "folder": "/content/posts",
      "filter": { "field": "lang", "value": "en" },
      "fields": [
        { "name": "lang", "label": "Language", "widget": "select", "options": ["en", "fr"] },
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    },
    {
      "name": "french-posts",
      "label": "French Posts",
      "folder": "/content/posts",
      "filter": { "field": "lang", "value": "fr" },
      "fields": [
        { "name": "lang", "label": "Language", "widget": "select", "options": ["en", "fr"] },
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]{7,18}
{
  collections: [
    {
      name: "english-posts",
      label: "English Posts",
      folder: "/content/posts",
      filter: { field: "lang", value: "en" },
      fields: [
        { name: "lang", label: "Language", widget: "select", options: ["en", "fr"] },
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
    {
      name: "french-posts",
      label: "French Posts",
      folder: "/content/posts",
      filter: { field: "lang", value: "fr" },
      fields: [
        { name: "lang", label: "Language", widget: "select", options: ["en", "fr"] },
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

Source: https://sveltiacms.app/en/docs/collections/entries/listings

---

## Entry Views

Sveltia CMS provides several options to customize how entries are displayed in the listing view. Users can sort, group and filter entries based on specific fields to improve navigation and organization.

### Table View

The entry list can be shown in three views: a table, a list and a grid of thumbnails.

- The table view shows a column for each piece of information that tells the entries apart, such as the date, the author and the category.
- The list view only shows the [entry summary](https://sveltiacms.app/en/docs/collections/entries/listings#summaries).
- The grid view is only available when the entries have [thumbnails](https://sveltiacms.app/en/docs/collections/entries/listings#thumbnails).

The table view is the default, until a user picks another view with the buttons in the toolbar. A collection opened before the table view was introduced keeps the view it was shown in then, usually the list view, until the user picks the table.

The table view is shown on a large screen, where the columns fit. On a smaller screen, the list view is shown instead. In [reorder mode](https://sveltiacms.app/en/docs/collections/entries/operations#reordering-entries), the entries are always shown in a list.

The table is read-only: click a row to open the entry, as in the list view. To change the values of many entries at once, use [bulk editing](https://sveltiacms.app/en/docs/collections/entries/operations#bulk-editing-entries).

#### Choosing Columns

By default, the table shows the entry summary, followed by a column for each field the entries can be [sorted](#sorting) by, as they are the fields that tell the entries apart. The identifier field, usually `title`, is left out, as the summary already shows it.

You can choose the columns with the `table_columns` option instead. It accepts a list of field names, which can include:

- nested fields in dot notation like `author.name`
- the special key `_summary` for the entry summary
- the special keys `slug`, `commit_date` and `commit_author`

To give a column a header other than the field’s label, use an object with the `field` and `label` properties:

```yaml [YAML]{11-15}
collections:
  - name: posts
    label: Blog posts
    folder: /content/posts
    fields:
      - { name: title, label: Title }
      - { name: date, label: Published Date, widget: datetime }
      - { name: author, label: Author, widget: object, fields: [{ name: name, label: Name }] }
      - { name: draft, label: Draft, widget: boolean }
      - { name: body, label: Body, widget: richtext }
    table_columns:
      - title
      - date
      - { field: author.name, label: Author }
      - draft
```

```toml [TOML]{5-10}
[[collections]]
name = "posts"
label = "Blog posts"
folder = "/content/posts"
table_columns = [
  "title",
  "date",
  { field = "author.name", label = "Author" },
  "draft",
]

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "date"
label = "Published Date"
widget = "datetime"

[[collections.fields]]
name = "author"
label = "Author"
widget = "object"
fields = [{ name = "name", label = "Name" }]

[[collections.fields]]
name = "draft"
label = "Draft"
widget = "boolean"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{14-19}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog posts",
      "folder": "/content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "date", "label": "Published Date", "widget": "datetime" },
        { "name": "author", "label": "Author", "widget": "object", "fields": [{ "name": "name", "label": "Name" }] },
        { "name": "draft", "label": "Draft", "widget": "boolean" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ],
      "table_columns": [
        "title",
        "date",
        { "field": "author.name", "label": "Author" },
        "draft"
      ]
    }
  ]
}
```

```js [JavaScript]{14-19}
{
  collections: [
    {
      name: "posts",
      label: "Blog posts",
      folder: "/content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "date", label: "Published Date", widget: "datetime" },
        { name: "author", label: "Author", widget: "object", fields: [{ name: "name", label: "Name" }] },
        { name: "draft", label: "Draft", widget: "boolean" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
      table_columns: [
        "title",
        "date",
        { field: "author.name", label: "Author" },
        "draft",
      ],
    },
  ],
}
```

A column can also show a template, written the same way as the [`summary` option](https://sveltiacms.app/en/docs/collections/entries/listings#summaries), with the same tags and [transformations](https://sveltiacms.app/en/docs/string-transformations). This lets the table show entry metadata such as `{{locales}}` for the enabled locales, `{{dirname}}`, `{{filename}}` and `{{extension}}`, or combine several values in one column:

```yaml
table_columns:
  - title
  - '{{locales}}'
  - { field: '{{filename}}.{{extension}}', label: File }
  - { field: "{{date | date('YYYY-MM-DD')}}", label: Published }
```

A template made of a single tag, such as `{{locales}}` or `{{commit_date}}`, gets a header named after it, and its column can be sorted if the tag is one of the [sortable fields](#sorting). Give a longer template a `label`, or its header shows the template itself.

Each cell shows the field’s value the way a [summary template](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) would:

- a date in the user’s format
- a Select field’s option by its label
- a Relation field’s referenced entry by its display value
- a list as comma-separated values
- a rich text field without its formatting

A Boolean field is shown as a check mark when it’s on. With [i18n](https://sveltiacms.app/en/docs/i18n) enabled, the values are taken from the default locale. If a listed field isn’t defined in the collection, Sveltia CMS raises a configuration error on startup.

A column whose field is also one of the [sortable fields](#sorting) has a clickable header that sorts the entries by it, the same way the **Sort** menu does; click it again to reverse the order.

**Static CMS compatibility**

The `summary_fields` option of Static CMS, a list of field names where `summary` stands for the entry summary, is supported as an alias of `table_columns`. It’s ignored if `table_columns` is also defined.

### Sorting

By default, Sveltia CMS supports sorting by `title`, `name`, `date`, `author` and `description` fields if they exist in the collection, as well as by the [identifier field](https://sveltiacms.app/en/docs/collections/entries/slugs#specifying-an-identifier-field) if it’s set with the `identifier_field` option. If the `date` and `author` fields are not present, Sveltia CMS will look for commit date and author information from Git history (if available) to enable sorting by those fields.

When the [`summary` option](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) is defined for a collection, Sveltia CMS also enables sorting by entry summaries. This allows you to sort entries based on the customized summary content, which can include multiple fields and string transformations.

When the [`reorder` option](https://sveltiacms.app/en/docs/collections/entries/operations#reordering-entries) is enabled for a collection, Sveltia CMS enables manual sorting of entries in the listing view. This allows users to drag and drop entries to reorder them as needed.

You can customize the sortable fields using the `sortable_fields` option. It accepts an array of field names that you want to enable for sorting in the entry listing view. It also accepts the following special keys, which read entry metadata instead of a field:

- `slug`: Sort entries by their slugs.
- `commit_date`: Sort entries by the date of the last commit that modified the entry file.
- `commit_author`: Sort entries by the author of the last commit that modified the entry file.

The `commit_date` and `commit_author` keys are only shown when Git commit information is available for the collection’s entries; otherwise, they are ignored. Even with `sortable_fields` defined, Sveltia CMS adds them automatically when the information is available and the list doesn’t include `date` or `author`, respectively.

Entries without a value for the sort field, such as an empty date, are always listed last, whether the order is ascending or descending and whatever the field type.

The example below shows how to enable sorting by custom fields such as `category` and nested fields like `author.name`:

```yaml [YAML]{16}
collections:
  - name: posts
    label: Blog posts
    folder: /content/posts
    fields:
      - { name: title, label: Title }
      - { name: published_date, label: Published Date, widget: datetime }
      - {
          name: author,
          label: Author,
          widget: object,
          fields: [{ name: name, label: Name }, { name: email, label: Email }],
        }
      - { name: category, label: Category }
      - { name: body, label: Body, widget: richtext }
    sortable_fields: [title, published_date, author.name, category]
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog posts"
folder = "/content/posts"
sortable_fields = ["title", "published_date", "author.name", "category"]

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "published_date"
label = "Published Date"
widget = "datetime"

[[collections.fields]]
name = "author"
label = "Author"
widget = "object"

[[collections.fields.fields]]
name = "name"
label = "Name"

[[collections.fields.fields]]
name = "email"
label = "Email"

[[collections.fields]]
name = "category"
label = "Category"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{22}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog posts",
      "folder": "/content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "published_date", "label": "Published Date", "widget": "datetime" },
        {
          "name": "author",
          "label": "Author",
          "widget": "object",
          "fields": [
            { "name": "name", "label": "Name" },
            { "name": "email", "label": "Email" }
          ]
        },
        { "name": "category", "label": "Category" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ],
      "sortable_fields": ["title", "published_date", "author.name", "category"]
    }
  ]
}
```

```js [JavaScript]{17}
{
  collections: [
    {
      name: "posts",
      label: "Blog posts",
      folder: "/content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "published_date", label: "Published Date", widget: "datetime" },
        { name: "author", label: "Author", widget: "object", fields: [
          { name: "name", label: "Name" },
          { name: "email", label: "Email" },
        ] },
        { name: "category", label: "Category" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
      sortable_fields: ["title", "published_date", "author.name", "category"],
    },
  ],
}
```

Each item in the `sortable_fields` list can also be an object with the following options, as in [Decap CMS](https://decapcms.org/docs/configuration-options/#sortable_fields). Objects and field names can be mixed in the same list.

- `field`: The field name or special key to sort by. Required.
- `label`: The text shown in the Sort menu. Defaults to the field’s label.
- `default_sort`: Makes the field the default sort key. Use `asc` or `true` for ascending order, or `desc` for descending order.

The example below sorts the entries by `published_date` in descending order by default, and shows the field as “Publish date” in the Sort menu:

```yaml
sortable_fields:
  - title
  - { field: published_date, label: Publish date, default_sort: desc }
  - author.name
  - category
```

Only one item can have the `default_sort` option. Giving it to more than one item is reported as a config validation error on the login screen. The default sort applies until the user picks another sort key or order in the Sort menu, which Sveltia CMS remembers for the collection.

**Extended syntax**

Sveltia CMS supports an extended syntax used in [Static CMS](https://staticjscms.netlify.app/docs/collection-overview#sortable-fields) to define a default sort field and direction. This is useful if you want entries to be sorted by a date field in descending order by default. Here is the same default sort using the extended syntax:

```yaml
sortable_fields:
  fields: [title, published_date, author.name, category]
  default:
    field: published_date
    direction: descending
```

The default direction is `ascending` if not specified.

For backward compatibility with Static CMS, the `direction` option accepts title case values: `Ascending` and `Descending`. However, `None` is not supported and has the same effect as `ascending`.

**Known issue**

Git commit information is currently loaded only with the GitHub backend. With the GitLab and Gitea/Forgejo backends, it’s only available for entries saved during the current session, due to API limitations. It’s not available in the local workflow or with the Test backend.

### Grouping

The `view_groups` option allows you to group entries in the listing view based on specific field values. This is useful for organizing entries into categories or sections for easier navigation.

The example below demonstrates how to group blog posts by their `draft` status and by the year extracted from the `date` field:

```yaml [YAML]{10-15}
collections:
  - name: posts
    label: Blog posts
    folder: /content/posts
    fields:
      - { name: title, label: Title }
      - { name: date, label: Published Date, widget: datetime }
      - { name: draft, label: Draft, widget: boolean }
      - { name: body, label: Body, widget: richtext }
    view_groups:
      - label: Drafts
        field: draft
      - label: Year
        field: date
        pattern: '\d{4}'
```

```toml [TOML]{25-32}
[[collections]]
name = "posts"
label = "Blog posts"
folder = "/content/posts"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "date"
label = "Published Date"
widget = "datetime"

[[collections.fields]]
name = "draft"
label = "Draft"
widget = "boolean"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"

[[collections.view_groups]]
label = "Drafts"
field = "draft"

[[collections.view_groups]]
label = "Year"
field = "date"
pattern = "\\d{4}"
```

```json [JSON]{13-23}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog posts",
      "folder": "/content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "date", "label": "Published Date", "widget": "datetime" },
        { "name": "draft", "label": "Draft", "widget": "boolean" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ],
      "view_groups": [
        {
          "label": "Drafts",
          "field": "draft"
        },
        {
          "label": "Year",
          "field": "date",
          "pattern": "\\d{4}"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{13-23}
{
  collections: [
    {
      name: "posts",
      label: "Blog posts",
      folder: "/content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "date", label: "Published Date", widget: "datetime" },
        { name: "draft", label: "Draft", widget: "boolean" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
      view_groups: [
        {
          label: "Drafts",
          field: "draft",
        },
        {
          label: "Year",
          field: "date",
          pattern: "\\d{4}",
        },
      ],
    },
  ],
}
```

Without a `pattern` or a [comparison option](#grouping-by-a-comparison), entries are grouped by the field value itself, as with the `draft` group above. With a `pattern`, they are grouped by the part of the field value that matches it, such as the four-digit year of the `date` field.

**Extended syntax**

Sveltia CMS supports an extended syntax used in [Static CMS](https://staticjscms.netlify.app/docs/collection-overview#view-groups) to define a default group. Here is the same configuration using the extended syntax:

```yaml
view_groups:
  groups:
    - name: drafts
      label: Drafts
      field: draft
    - name: year
      label: Year
      field: date
      pattern: '\d{4}'
  default: year
```

In this syntax, each group needs a `name`, so that the `default` option can refer to it. The `default` option has to be the `name` of one of the `groups`. Any other name is reported as a config validation error on the login screen, because the collection would otherwise open ungrouped.

To sort the Year group in descending order by date, you can add the `sortable_fields` property as described in the [Sorting](#sorting) section above:

```yaml
sortable_fields:
  fields: [date, title]
  default:
    field: date
    direction: descending
```

A named view group can also be used with the [`reorder` option](https://sveltiacms.app/en/docs/collections/entries/operations#reordering-within-groups) to let editors reorder entries within their own group.

#### Grouping by a Comparison

A view group can also split the entries by a comparison, using the same options as a [view filter](#comparing-values). The entries satisfying the condition are grouped under the group’s `label`, and the other entries under “Other”. For example, the following group lists the upcoming events first, followed by the past and undated ones:

```yaml
view_groups:
  - label: Upcoming
    field: date
    gte: '{{today}}'
```

### Filtering

The `view_filters` option allows you to define preset filters that editors can quickly apply to the entry listing view. This is useful for quickly accessing specific subsets of entries based on common criteria.

```yaml [YAML]{11-20}
collections:
  - name: posts
    label: Blog posts
    folder: /content/posts
    fields:
      - { name: title, label: Title }
      - { name: date, label: Published Date, widget: datetime }
      - { name: draft, label: Draft, widget: boolean }
      - { name: category, label: Category }
      - { name: body, label: Body, widget: richtext }
    view_filters:
      - label: Drafts
        field: draft
        pattern: true
      - label: Posts from 2024
        field: date
        pattern: '^2024'
      - label: Travel or Food
        field: category
        pattern: travel|food
```

```toml [TOML]{29-42}
[[collections]]
name = "posts"
label = "Blog posts"
folder = "/content/posts"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "date"
label = "Published Date"
widget = "datetime"

[[collections.fields]]
name = "draft"
label = "Draft"
widget = "boolean"

[[collections.fields]]
name = "category"
label = "Category"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"

[[collections.view_filters]]
label = "Drafts"
field = "draft"
pattern = "true"

[[collections.view_filters]]
label = "Posts from 2024"
field = "date"
pattern = "^2024"

[[collections.view_filters]]
label = "Travel or Food"
field = "category"
pattern = "travel|food"
```

```json [JSON]{14-30}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog posts",
      "folder": "/content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "date", "label": "Published Date", "widget": "datetime" },
        { "name": "draft", "label": "Draft", "widget": "boolean" },
        { "name": "category", "label": "Category" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ],
      "view_filters": [
        {
          "label": "Drafts",
          "field": "draft",
          "pattern": "true"
        },
        {
          "label": "Posts from 2024",
          "field": "date",
          "pattern": "^2024"
        },
        {
          "label": "Travel or Food",
          "field": "category",
          "pattern": "travel|food"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{14-30}
{
  collections: [
    {
      name: "posts",
      label: "Blog posts",
      folder: "/content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "date", label: "Published Date", widget: "datetime" },
        { name: "draft", label: "Draft", widget: "boolean" },
        { name: "category", label: "Category" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
      view_filters: [
        {
          label: "Drafts",
          field: "draft",
          pattern: "true",
        },
        {
          label: "Posts from 2024",
          field: "date",
          pattern: "^2024",
        },
        {
          label: "Travel or Food",
          field: "category",
          pattern: "travel|food",
        },
      ],
    },
  ],
}
```

**Extended syntax**

Sveltia CMS supports an extended syntax used in [Static CMS](https://staticjscms.netlify.app/docs/collection-overview#view-filters) to define a default filter. Here is the same configuration using the extended syntax:

```yaml
view_filters:
  filters:
    - name: drafts
      label: Drafts
      field: draft
      pattern: true
    - name: posts_2024
      label: Posts from 2024
      field: date
      pattern: '^2024'
    - name: travel_or_food
      label: Travel or Food
      field: category
      pattern: travel|food
  default: drafts
```

In this syntax, each filter needs a `name`, so that the `default` option can refer to it. The `default` option has to be the `name` of one of the `filters`. Any other name is reported as a config validation error on the login screen, because the collection would otherwise open unfiltered.

#### Comparing Values

A view filter can compare the field value with a given value instead of, or in addition to, matching a `pattern`. This makes it possible to filter entries by a date, such as upcoming and past events, or by a number, such as products above a certain price. The following options are available:

| Option   | Description                                                                         |
| -------- | ----------------------------------------------------------------------------------- |
| `eq`     | The field value has to be equal to the given value.                                 |
| `ne`     | The field value has to be different from the given value.                           |
| `lt`     | The field value has to be less than the given value.                                |
| `lte`    | The field value has to be less than or equal to the given value.                    |
| `gt`     | The field value has to be greater than the given value.                             |
| `gte`    | The field value has to be greater than or equal to the given value.                 |
| `in`     | The field value has to be equal to one of the given values, defined as an array.    |
| `not_in` | The field value has to be different from all the given values, defined as an array. |
| `empty`  | The field value has to be empty (`true`) or not (`false`).                          |

The value of a DateTime field is compared as a date, so the given value has to be in the same format as the field value, or one of the following template tags:

| Tag                                                                        | Description                                                                                                                                                         |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{now}}`                                                                  | The current date and time.                                                                                                                                          |
| `{{today}}`                                                                | The current date in the `YYYY-MM-DD` format. Use this rather than `{{now}}` with a date-only field, so that an entry dated today is included in a `gte` comparison. |
| `{{year}}`, `{{month}}`, `{{day}}`, `{{hour}}`, `{{minute}}`, `{{second}}` | The parts of the current date and time, which can also be used in a `pattern`, e.g. `^{{year}}` for the entries of this year.                                       |

The tags are resolved in the user’s local timezone whenever the entry list is updated, and every minute while such a filter or group is applied, so a filter like “Upcoming events” keeps working without any change to the configuration.

A number field value and a numeric given value are compared as numbers. Any other value is compared as a string. An entry without a value for the field only matches `ne`, `not_in` and `empty: true`. When several options are defined for one filter, all of them have to be satisfied.

The `empty` option tells the entries that have a value for the field from those that don’t. A value is empty if:

- it’s `null`, an empty string or an empty list
- it’s an Object field whose subfields are all empty
- the field is missing from the entry altogether, for example because the field was added to the configuration after the entry was created

Use this rather than `eq` or `ne`, which can’t express a missing value in TOML, where there is no `null`:

```yaml [YAML]
view_filters:
  - label: With author
    field: author
    empty: false
  - label: Without author
    field: author
    empty: true
```

```toml [TOML]
[[collections.view_filters]]
label = "With author"
field = "author"
empty = false

[[collections.view_filters]]
label = "Without author"
field = "author"
empty = true
```

```json [JSON]
{
  "view_filters": [
    { "label": "With author", "field": "author", "empty": false },
    { "label": "Without author", "field": "author", "empty": true }
  ]
}
```

```js [JavaScript]
{
  view_filters: [
    { label: "With author", field: "author", empty: false },
    { label: "Without author", field: "author", empty: true },
  ],
}
```

The comparison options can also be used with the [extended syntax](#filtering) described above, for example to apply the “Upcoming” filter by default:

```yaml
view_filters:
  filters:
    - name: upcoming
      label: Upcoming
      field: date
      gte: '{{today}}'
    - name: past
      label: Past
      field: date
      lt: '{{today}}'
  default: upcoming
```

The example below defines the filters for a list of events:

```yaml [YAML]{10-24}
collections:
  - name: events
    label: Events
    folder: /content/events
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime, time_format: false }
      - { name: capacity, label: Capacity, widget: number }
      - { name: status, label: Status, widget: select, options: [scheduled, canceled] }
    view_filters:
      - label: Upcoming
        field: date
        gte: '{{today}}'
      - label: Past
        field: date
        lt: '{{today}}'
      - label: This year
        field: date
        pattern: '^{{year}}'
      - label: Large venues
        field: capacity
        gte: 100
      - label: Not canceled
        field: status
        ne: canceled
```

```toml [TOML]{28-51}
[[collections]]
name = "events"
label = "Events"
folder = "/content/events"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "date"
label = "Date"
widget = "datetime"
time_format = false

[[collections.fields]]
name = "capacity"
label = "Capacity"
widget = "number"

[[collections.fields]]
name = "status"
label = "Status"
widget = "select"
options = ["scheduled", "canceled"]

[[collections.view_filters]]
label = "Upcoming"
field = "date"
gte = "{{today}}"

[[collections.view_filters]]
label = "Past"
field = "date"
lt = "{{today}}"

[[collections.view_filters]]
label = "This year"
field = "date"
pattern = "^{{year}}"

[[collections.view_filters]]
label = "Large venues"
field = "capacity"
gte = 100

[[collections.view_filters]]
label = "Not canceled"
field = "status"
ne = "canceled"
```

```json [JSON]{13-39}
{
  "collections": [
    {
      "name": "events",
      "label": "Events",
      "folder": "/content/events",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "date", "label": "Date", "widget": "datetime", "time_format": false },
        { "name": "capacity", "label": "Capacity", "widget": "number" },
        { "name": "status", "label": "Status", "widget": "select", "options": ["scheduled", "canceled"] }
      ],
      "view_filters": [
        {
          "label": "Upcoming",
          "field": "date",
          "gte": "{{today}}"
        },
        {
          "label": "Past",
          "field": "date",
          "lt": "{{today}}"
        },
        {
          "label": "This year",
          "field": "date",
          "pattern": "^{{year}}"
        },
        {
          "label": "Large venues",
          "field": "capacity",
          "gte": 100
        },
        {
          "label": "Not canceled",
          "field": "status",
          "ne": "canceled"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{13-39}
{
  collections: [
    {
      name: "events",
      label: "Events",
      folder: "/content/events",
      fields: [
        { name: "title", label: "Title" },
        { name: "date", label: "Date", widget: "datetime", time_format: false },
        { name: "capacity", label: "Capacity", widget: "number" },
        { name: "status", label: "Status", widget: "select", options: ["scheduled", "canceled"] },
      ],
      view_filters: [
        {
          label: "Upcoming",
          field: "date",
          gte: "{{today}}",
        },
        {
          label: "Past",
          field: "date",
          lt: "{{today}}",
        },
        {
          label: "This year",
          field: "date",
          pattern: "^{{year}}",
        },
        {
          label: "Large venues",
          field: "capacity",
          gte: 100,
        },
        {
          label: "Not canceled",
          field: "status",
          ne: "canceled",
        },
      ],
    },
  ],
}
```

Source: https://sveltiacms.app/en/docs/collections/entries/views
