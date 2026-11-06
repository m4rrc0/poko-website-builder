# Entry Collections: Formats and Slugs

Entry collections in depth: collection options, file formats and slugs. For nested entries, single-file collections and preview paths, see `entries-structure.md`. For listing and view options, see `entries-listing.md`. For operation options, see `entries-operations.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Entry Collections

An entry collection contains multiple entries of the same type. Editors can usually create, edit and delete entries within the collection. Typical use cases for entry collections include blog posts, tags, products or events. Each entry in the collection is represented by a separate file, or all the entries can be stored in a [single JSON file](https://sveltiacms.app/en/docs/collections/entries/single-file).

**Note for Netlify/Decap CMS users**

In Sveltia CMS, what was previously referred to as a **folder collection** in Netlify/Decap CMS is now called an **entry collection**. This change was made to better reflect the purpose and functionality of these collections within the CMS.

### Creating an Entry Collection

Here is an example configuration defining a simple blog posts collection:

```yaml [YAML]
collections:
  - name: blog
    label: Blog Posts
    label_singular: Blog Post
    folder: content/blog
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]
[[collections]]
name = "blog"
label = "Blog Posts"
label_singular = "Blog Post"
folder = "content/blog"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]
{
  "collections": [
    {
      "name": "blog",
      "label": "Blog Posts",
      "label_singular": "Blog Post",
      "folder": "content/blog",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "blog",
      label: "Blog Posts",
      label_singular: "Blog Post",
      folder: "content/blog",
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

#### Options

The following options are commonly used when defining an entry collection:

- `name`: (required) A unique identifier for the collection. Should not contain spaces or special characters.
- `label`: A human-readable name for the collection. If omitted, the `name` value is used.
- `label_singular`: A human-readable singular name for the collection. If omitted, the `label` value is used. Used in some parts of the UI like the “Create new” button.
- `description`: A brief description of the collection, displayed in the UI. Basic Markdown formatting is supported, including bold, italic, strikethrough, code and links.
- `folder`: (required unless `file` is used) The folder path where the entries are stored, relative to the repository’s root directory. It can be an empty string (or `.` or `/`) to store entries in the root folder. With i18n enabled, it can contain the `{{locale}}` placeholder as a folder name, e.g. `content/{{locale}}/posts`, to say where the locale folder goes. See [Custom Locale Folder Placement](https://sveltiacms.app/en/docs/i18n/structures#custom-locale-folder-placement).
- `file`: The path to a JSON file storing all the entries as an array of objects, used instead of `folder`. See [Single-File Collections](https://sveltiacms.app/en/docs/collections/entries/single-file).
- `fields`: (required) An array defining the [fields](https://sveltiacms.app/en/docs/fields) for each entry in the collection. Each field has a `name`, `label` and optional `widget` type.

### Configuration Guides

The remaining entry collection options are documented on the following pages:

- [File Formats](https://sveltiacms.app/en/docs/collections/entries/formats): Choose between Markdown with front matter, YAML, JSON and TOML, and customize the file extension, front matter delimiter and body field.
- [Slugs and File Paths](https://sveltiacms.app/en/docs/collections/entries/slugs): Generate entry slugs from fields and template tags, make slugs editable and organize entries into subfolders and page bundles.
- [Nested Entries](https://sveltiacms.app/en/docs/collections/entries/nested): Manage hierarchical content in a folder tree that editors can browse and organize.
- [Single-File Collections](https://sveltiacms.app/en/docs/collections/entries/single-file): Store all the entries in one JSON file, as an array of objects.
- [Preview Paths and Redirects](https://sveltiacms.app/en/docs/collections/entries/previews): Point the CMS at an entry’s URL on your site for previews, and record redirects when slugs change.
- [Entry Operations](https://sveltiacms.app/en/docs/collections/entries/operations): Disable creation, deletion or duplication, limit the entry count, hide the collection and enable manual reordering.
- [Entry Listings](https://sveltiacms.app/en/docs/collections/entries/listings): Customize entry summaries and thumbnails, manage Hugo’s index file, and include or exclude entries.
- [Entry Views](https://sveltiacms.app/en/docs/collections/entries/views): Define sorting, grouping and filtering options for the listing view.

Source: https://sveltiacms.app/en/docs/collections/entries

---

## File Formats

Sveltia CMS supports various file formats for entry collections, including Markdown, YAML, JSON and TOML. The default format is Markdown with YAML front matter.

The example below defines a simple blog posts collection:

```yaml [YAML]
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "date"
label = "Date"
widget = "datetime"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "date", "label": "Date", "widget": "datetime" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "date", label: "Date", widget: "datetime" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

By default, entry collections use the `title` field as the slug (filename). If neither the `format` nor the `extension` option is set, entries are Markdown files with the `md` extension, and new entries are saved with YAML front matter. See [Default Format and Extension](#default-format-and-extension) for details. A Markdown field named `body` is treated as the main content of the file, while other fields are stored in the front matter. This behavior can be configured using the [`body_field` option](#body-field-for-front-matter-formats) in the collection definition.

If you create a blog post with the title “My First Post”, the file will be saved at `content/posts/my-first-post.md`, with the following content:

```md [my-first-post.md]
---
title: My First Post
date: 2024-06-01T12:00:00Z
---

This is the body of my first post.
```

You can customize the file format using the `format` property of the collection. The example below shows how to use JSON for the file format:

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    format: json
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
format = "json"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "format": "json"
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
      format: "json",
    },
  ],
}
```

The output file for a post created with this configuration would look like this:

```json [my-first-post.json]
{
  "title": "My First Post",
  "date": "2024-06-01T12:00:00Z",
  "body": "This is the body of my first post."
}
```

### Format

The following file formats are supported for entry collections. You can specify the desired format using the `format` option to define how entries are parsed and saved. If omitted, the format is determined by the extension, as explained in [Default Format and Extension](#default-format-and-extension).

- `yml` or `yaml`: YAML files with the `yml` extension by default.
- `toml`: TOML files with the `toml` extension by default.
- `json`: JSON files with the `json` extension by default.
- `yaml-frontmatter`: Markdown files with YAML front matter, the `md` extension and the `---` delimiter by default.
- `toml-frontmatter`: Markdown files with TOML front matter, the `md` extension and the `+++` delimiter by default.
- `json-frontmatter`: Markdown files with JSON front matter, the `md` extension and the `{` / `}` delimiter by default.
- `frontmatter`: Markdown files with front matter in any of the supported formats. The format is automatically detected based on the front matter delimiters, and an existing entry is saved back in the format it was read in. However, when creating new entries, the format defaults to `yaml-frontmatter`. The `md` extension and `---` delimiter are used by default.
- `raw`: Raw text files with the `txt` extension by default. When using this format, make sure to have only one field named `body` with the `widget` type set to `code`, `markdown`, `richtext` or `text`. This is useful for a file collection that manages plain text files without any front matter, such as JSON, XML or CSV files.

The JSON and YAML formats can be customized via the [global `output` option](https://sveltiacms.app/en/docs/data-output#controlling-data-output).

**Deprecation Notice**

The collection-level `yaml_quote` option has been deprecated in favor of the `quote` option in the [global `output` option](https://sveltiacms.app/en/docs/data-output#controlling-data-output). The `yaml_quote` option will be removed in Sveltia CMS v1.0.0. If you are upgrading from an older version, update your configuration accordingly. `yaml_quote: true` is equivalent to `output.yaml.quote: double`.

If you want to use a different file format, register a custom format using the [Custom File Formats API](https://sveltiacms.app/en/docs/api/file-formats) and specify its name in the `format` option.

### Extension

You can customize the file extension using the `extension` property of the collection. The default extensions for each format are explained above, but you can change them as needed. For example, to use the `markdown` extension for Markdown files with YAML front matter:

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    extension: markdown
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
extension = "markdown"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "extension": "markdown"
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
      extension: "markdown",
    },
  ],
}
```

You can use any valid file extension, such as `html`, `txt` or `mdx`. Just make sure that the file format and extension are compatible. If there is an obvious mismatch, Sveltia CMS will raise a validation error. For example, if you use the `json` format with the `md` extension, it will result in an error because JSON files should have a `json` extension.

The front matter formats (`yaml-frontmatter`, `toml-frontmatter`, `json-frontmatter` and `frontmatter`) work with any extension that isn’t tied to another format, such as `html`, `liquid`, `njk` or `txt`, just like in Netlify/Decap CMS, where the `format` option takes precedence over the extension. The exceptions are the following:

- `yml`, `yaml`, `toml` and `json` only work with the front matter format of the same language, e.g. `toml-frontmatter` with `toml`.
- `astro` doesn’t work with any of them, because the front matter of an Astro component is JavaScript, not YAML. Use the `raw` format instead.
- The Markdown extensions, such as `md` and `markdown`, can’t be used with the `yaml`, `toml` and `json` formats.

### Default Format and Extension

The `format` and `extension` options are both optional. When one or both of them are omitted, Sveltia CMS determines the missing values as follows:

- **Neither option is set**: The extension is `md` and the format is `frontmatter`, meaning the front matter format of existing entries is detected automatically, and new entries are saved with YAML front matter.
- **Only `format` is set**: The extension is the default one for the format, as listed in the [Format](#format) section above.
- **Only `extension` is set**: The format is determined by the extension:
  - `yml` or `yaml`: `yaml`
  - `toml`: `toml`
  - `json`: `json`
  - `astro`: `raw`
  - `md`, `markdown`, `mdx`, `mdown`, `mdwn`, `mkd`, `mkdn` or `html.md`: `frontmatter`
  - Any other extension: `yaml-frontmatter`

**Warning**

The CMS does not look at the existing files in the collection folder to guess the extension. Only files with the configured extension are listed as entries, and the extension defaults to `md`. If your collection folder contains JSON, YAML or TOML files, you must set the `extension` or `format` option. Otherwise, no entries will appear. The same applies to Netlify/Decap CMS.

### Front Matter Delimiter

The front matter delimiter can be customized using the `frontmatter_delimiter` option. It accepts either a string or an array of two strings representing the opening and closing delimiters. For example, to use `~~~` as the delimiter for TOML front matter:

```yaml [YAML]{5-6}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    format: toml-frontmatter
    frontmatter_delimiter: ~~~ # or [~~~, ~~~]
```

```toml [TOML]{5-6}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
format = "toml-frontmatter"
frontmatter_delimiter = "~~~"
```

```json [JSON]{7-8}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "format": "toml-frontmatter",
      "frontmatter_delimiter": "~~~"
    }
  ]
}
```

```js [JavaScript]{7-8}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      format: "toml-frontmatter",
      frontmatter_delimiter: "~~~",
    },
  ],
}
```

### Body Field for Front Matter Formats

By default, a Markdown field named `body` is treated as the main content of the file, while other fields are stored in the front matter. This behavior can be configured using the `body_field` option in the collection definition. The `body_field` option allows you to specify a different field name for the main content or to store the body content directly in the front matter.

#### Body Field Name

If you want to use a different field name for the main content, you can specify it using the `key` property of the `body_field` option. For example, to use a field named `content` as the body field:

```yaml [YAML]{6-7}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    format: yaml-frontmatter
    body_field:
      key: content
    fields:
      - { name: title, label: Title }
      - { name: content, label: Content, widget: markdown }
```

```toml [TOML]{6}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
format = "yaml-frontmatter"
body_field.key = "content"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "content"
label = "Content"
widget = "markdown"
```

```json [JSON]{8-10}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "format": "yaml-frontmatter",
      "body_field": {
        "key": "content"
      },
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "content", "label": "Content", "widget": "markdown" }
      ]
    }
  ]
}
```

```js [JavaScript]{8-10}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      format: "yaml-frontmatter",
      body_field: {
        key: "content",
      },
      fields: [
        { name: "title", label: "Title" },
        { name: "content", label: "Content", widget: "markdown" },
      ],
    },
  ],
}
```

#### Inline Body Field

You can set `inline: true` in the `body_field` option to store the body content directly in the front matter instead of the file body, while using the `body` field name for the main content. This is useful when you want to keep all the entry data in the front matter without any content in the file body.

```yaml [YAML]{6-7}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    format: yaml-frontmatter
    body_field:
      inline: true
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: markdown }
```

```toml [TOML]{6}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
format = "yaml-frontmatter"
body_field.inline = true

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "markdown"
```

```json [JSON]{8-10}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "format": "yaml-frontmatter",
      "body_field": {
        "inline": true
      },
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "markdown" }
      ]
    }
  ]
}
```

```js [JavaScript]{8-10}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      format: "yaml-frontmatter",
      body_field: {
        inline: true,
      },
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "markdown" },
      ],
    },
  ],
}
```

With `inline: false` (the default), the output file would look like this:

```yaml
---
title: My Post
---
This is the body of my post.
```

With `inline: true`, the output file for a post created with the above configuration would look like this:

```yaml
---
title: My Post
body: This is the body of my post.
---
```

Source: https://sveltiacms.app/en/docs/collections/entries/formats

---

## Slugs and File Paths

An entry’s slug is its filename, and the file path is where that file is stored under the collection’s `folder`. Both can be customized with the options described on this page.

### Entry Slugs

Sveltia CMS provides several ways to customize the slug (filename) of an entry in a collection.

#### Global Slug Options

The `slug` option defined at the top level of the configuration file applies to all collections, including the names of entry folders created or renamed in a collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested). It also applies to the names of uploaded asset files and new asset folders when [filename slugification](https://sveltiacms.app/en/docs/media#slugification-of-filenames) is enabled. The default settings are as follows:

```yaml [YAML]
slug:
  encoding: unicode
  clean_accents: false
  sanitize_replacement: '-'
  trim: true
  lowercase: true
  timezone: utc
```

```toml [TOML]
[slug]
encoding = "unicode"
clean_accents = false
sanitize_replacement = "-"
trim = true
lowercase = true
timezone = "utc"
```

```json [JSON]
{
  "slug": {
    "encoding": "unicode",
    "clean_accents": false,
    "sanitize_replacement": "-",
    "trim": true,
    "lowercase": true,
    "timezone": "utc"
  }
}
```

```js [JavaScript]
{
  slug: {
    encoding: "unicode",
    clean_accents: false,
    sanitize_replacement: "-",
    trim: true,
    lowercase: true,
    timezone: "utc",
  },
}
```

The available options are:

- `encoding`: Specifies the encoding method for slugs. Supported values are `unicode` (default) and `ascii`.
  - `unicode`: Allows Unicode characters in slugs, preserving non-Latin scripts.
  - `ascii`: Sanitizes slugs to ASCII characters only. The allowed characters are 0-9, a-z, A-Z, hyphen (`-`), underscore (`_`) and tilde (`~`). Other characters are replaced with the value specified in the `sanitize_replacement` option.
- `clean_accents`: A boolean value indicating whether to remove accents from characters in slugs. If enabled, accented characters are converted to their unaccented equivalents (e.g. `é` becomes `e`). Also, certain characters like German umlauts are [transliterated](https://en.wikipedia.org/wiki/Transliteration) to their ASCII equivalents (e.g. `ß` becomes `ss`). The default value is `false`.
  - See the `transliterate` library’s [replacements list](https://github.com/sindresorhus/transliterate/blob/main/replacements.js) for details on how specific characters are transliterated. [Additional rules](https://github.com/sindresorhus/transliterate/blob/main/locale-replacements.js) are applied when [i18n support](https://sveltiacms.app/en/docs/i18n) is enabled for [specific locales](https://github.com/sindresorhus/transliterate#supported-locales).
- `sanitize_replacement`: A string used to substitute invalid characters. The default value is a hyphen (`-`).
  - The replacement can’t contain a character that slugs can’t have, such as a slash (`/`) or a question mark (`?`), because it would end up in every slug.
  - The only exception is a plain space. It keeps the words of a filename apart for people and tools that read filenames rather than URLs, e.g. `Sourdough focaccia.md` for an [Obsidian](https://obsidian.md/) vault that links to entries by filename. Combine it with `lowercase: false` to keep the original casing. When the replacement contains a space, users can also type spaces when [editing a slug](#making-slugs-editable).
  - Filenames with spaces aren’t URL-friendly. If you use the `{{slug}}` template tag in the [`preview_path`](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) option, make sure your site builds the same URL.
- `maxlength`: An integer specifying the maximum number of characters in a generated slug. If the generated slug exceeds this length, it will be truncated. Any dots and `sanitize_replacement` characters left at the end are then removed, though the replacement characters are kept if `trim` is `false`. This is useful for CI/CD services or filesystems that impose filename length restrictions. The default value is `undefined`. Without it, a generated slug is limited to 200 bytes in UTF-8 instead, like Decap CMS, so the filename stays within the 255-byte limit of most filesystems and the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) branch name stays valid. The limit is lower if the collection name is very long. A Chinese, Japanese or Korean character takes 3 bytes, so a slug written in one of these languages can have about 66 characters. Existing entries are never renamed.
- `trim`: A boolean value indicating whether to trim leading and trailing `sanitize_replacement` characters from the slug. The default value is `true`. Leading and trailing dots are always removed, whatever this option is set to: a leading dot would make a hidden file, and a Git branch name can’t end with a dot.
- `lowercase`: A boolean value indicating whether to convert the slug to lowercase. The default value is `true`. Changing this to `false` will preserve the original casing of the title or identifier field.
- `timezone`: A string specifying the timezone to use when generating date-based slugs with [template tags](#slug-template-tags) like `{{day}}` and `{{hour}}`. The default value is `utc`. You can set this to `local` to use the local timezone of the user. It applies to the [entry date](#slug-template-tags) taken from a DateTime field as well, unless the field stores a date only.

**Deprecation Notice**

The collection-level `slug_length` option has been deprecated in favor of the `maxlength` global slug option described above. The `slug_length` option will be removed in Sveltia CMS v1.0.0. If you are upgrading from an older version, update your configuration accordingly.

#### How Slugs Are Generated

By default, Sveltia CMS uses the `title` field as the slug (filename) for entries in a collection.

If a collection only has the Markdown `body` field, an entry slug will be generated from a header in the `body`, if one exists. This aims to support a typical [VitePress](https://sveltiacms.app/en/docs/frameworks/vitepress) or [Docusaurus](https://sveltiacms.app/en/docs/frameworks/docusaurus) setup. If no title or header is found, a part of a random UUID will be used to ensure uniqueness.

#### Specifying an Identifier Field

If you want to use a different field as the entry identifier for generating slugs and filenames, you can specify it using the `identifier_field` option in the collection definition. This is useful when your entries have a unique identifier field other than `title`, such as `name` or `id`. For example, to use a `product_name` field as the identifier:

```yaml [YAML]{5}
collections:
  - name: products
    label: Products
    folder: /content/products
    identifier_field: product_name
    fields:
      - { name: product_name, label: Product Name }
      - { name: description, label: Description, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "products"
label = "Products"
folder = "/content/products"
identifier_field = "product_name"

[[collections.fields]]
name = "product_name"
label = "Product Name"

[[collections.fields]]
name = "description"
label = "Description"
widget = "richtext"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "products",
      "label": "Products",
      "folder": "/content/products",
      "identifier_field": "product_name",
      "fields": [
        { "name": "product_name", "label": "Product Name" },
        { "name": "description", "label": "Description", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]{7}
{
  collections: [
    {
      name: "products",
      label: "Products",
      folder: "/content/products",
      identifier_field: "product_name",
      fields: [
        { name: "product_name", label: "Product Name" },
        { name: "description", label: "Description", widget: "richtext" },
      ],
    },
  ],
}
```

#### Defining Entry Slugs

The `slug` option allows you to define a custom template for generating entry slugs using various [template tags](#slug-template-tags) and field names.

For example, to create slugs that include the year and month of the entry date along with the entry slug, you can use the following configuration:

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    slug: '{{year}}-{{month}}-{{slug}}'
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
slug = "{{year}}-{{month}}-{{slug}}"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "slug": "{{year}}-{{month}}-{{slug}}"
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
      slug: "{{year}}-{{month}}-{{slug}}",
    },
  ],
}
```

Any field name defined in the collection’s `fields` option can be used as a template tag in the `slug` option. For example, if you have a `date` field in the collection, you can use `{{date}}` in the `slug` option to include the date in the slug. For nested fields, use dot notation, e.g. `{{author.name}}`.

If a field’s name matches one of the [predefined template tags](#slug-template-tags), such as `slug`, `year` or `uuid`, you need to prefix it with `fields.`, like `{{fields.slug}}`, to avoid confusion with the tag itself.

You can use [string transformations](https://sveltiacms.app/en/docs/string-transformations) with these template tags as well. For example, to create slugs that include the full date in `YYYY-MM-DD` format along with a custom `slug` field, you can use the following configuration:

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    slug: "{{date | date('YYYY-MM-DD')}}-{{fields.slug}}"
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
slug = "{{date | date('YYYY-MM-DD')}}-{{fields.slug}}"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "slug": "{{date | date('YYYY-MM-DD')}}-{{fields.slug}}"
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
      slug: "{{date | date('YYYY-MM-DD')}}-{{fields.slug}}",
    },
  ],
}
```

**Tip**

The `slug` option value should not contain slashes (`/`). If you need to create a nested folder structure for entries, use the [`path` option](#using-subfolders) instead.

The `slug` option can also be an object, whose `template` option specifies the template, along with the options to [make slugs editable](#making-slugs-editable).

#### Slug Template Tags

The following template tags are supported in the `slug` option:

- `{{slug}}`: The slugified version of the entry’s `title` field (or the field defined with the [`identifier_field` option](#specifying-an-identifier-field)).
- `{{year}}`: 4-digit year of the entry date.
- `{{month}}`: 2-digit month of the entry date.
- `{{day}}`: 2-digit day of the entry date.
- `{{hour}}`: 2-digit hour of the entry date.
- `{{minute}}`: 2-digit minute of the entry date.
- `{{second}}`: 2-digit second of the entry date.

The entry date is the value of the first DateTime field named `date`, `publishDate` or `publish_date`, so a backdated post is named after its own date. In a multilingual collection, the value in the default locale is used. If the collection has no such field, or it’s left empty, the date and time the entry is first saved are used instead. The slug is only generated when the entry is first saved, so changing the date later doesn’t rename the file.

By default, the entry date is based on the UTC timezone for compatibility with Netlify/Decap CMS. To use the local timezone of the user instead, set the `timezone` option to `local` in the [global slug options](#global-slug-options). A DateTime field that stores a date only, without a time, gives that date as is in either case.

Additionally, the following unique identifier tags are available. These tags generate random values for each entry, ensuring uniqueness. This is particularly useful when the entry title may change later or when the title contains characters that are not suitable for filenames, such as non-Latin scripts.

- `{{uuid}}`: A random UUID v4, e.g. `4fc0917c-8aea-4ad5-a476-392bdcf3b642`.
- `{{uuid_short}}`: The last 12 characters of a random UUID v4, e.g. `392bdcf3b642`.
- `{{uuid_shorter}}`: The first 8 characters of a random UUID v4, e.g. `4fc0917c`.

#### Making Slugs Editable

Entry slugs are shown and edited in the Slug panel of the Content Editor’s [sidebar](https://sveltiacms.app/en/docs/ui/content-editor#slug-panel). By default, users can edit the slug both while creating an entry and once it has been saved:

- In a new entry, the panel shows the slug the entry will be saved with, which follows the `slug` template as the entry is edited. The pencil button lets users change it, and emptying it goes back to the template.
- In a saved entry, the pencil button renames the entry. Renaming moves the entry’s file and rewrites every reference to it when the entry is saved. See [Slug Panel](https://sveltiacms.app/en/docs/ui/content-editor#slug-panel) for details.

To control this, set the `slug` option to an object instead of a template string. The object accepts the following options:

- `template`: The [slug template](#defining-entry-slugs), which is what a string `slug` option specifies. The default is the [identifier field](#specifying-an-identifier-field), like `{{title}}`.
- `editable`: Whether users can edit the slug. `true` (default) allows it both when an entry is created and once it has been saved, and `false` allows neither. An array picks the stages: `[create]` for new entries only, or `[update]` for saved entries only.
- `hint`: A short description shown in the Slug panel, e.g. to explain what the slug is used for.
- `pattern`: A regular expression the slug has to match, along with an error message, e.g. `['^[a-z-]+$', 'Use lowercase letters and hyphens only']`. It works like the [`pattern` field option](https://sveltiacms.app/en/docs/fields#pattern) and applies to a slug typed in by the user.
- `i18n`: Whether each locale has a slug of its own. See [Localizing Entry Slugs](https://sveltiacms.app/en/docs/i18n/slugs#making-slugs-editable).
- `auto_increment`: Whether to number new entries automatically instead of filling the template. See [Numbering Slugs Automatically](#numbering-slugs-automatically).

For example, to let users give a new blog post a slug of its own while keeping saved posts at their original URLs:

```yaml [YAML]{5-7}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    slug:
      template: '{{year}}-{{month}}-{{day}}-{{slug}}'
      editable: [create]
```

```toml [TOML]{6-8}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"

[collections.slug]
template = "{{year}}-{{month}}-{{day}}-{{slug}}"
editable = ["create"]
```

```json [JSON]{7-10}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "slug": {
        "template": "{{year}}-{{month}}-{{day}}-{{slug}}",
        "editable": ["create"]
      }
    }
  ]
}
```

```js [JavaScript]{7-10}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      slug: {
        template: "{{year}}-{{month}}-{{day}}-{{slug}}",
        editable: ["create"],
      },
    },
  ],
}
```

**Locking entry URLs**

Renaming an entry changes its URL on your live site, unless your framework [redirects the old URL](https://sveltiacms.app/en/docs/collections/entries/previews#redirects). If your editors shouldn’t change the slug once an entry has been published, set `editable` to `[create]`, or to `false` to have the slug always generated from the template.

##### Having Users Type the Slug

When the slug can’t be derived from the entry’s content, e.g. when the filename is the only place a value is stored, you can have users type the slug themselves. Set the `editable` option to allow editing on creation, without a `template`. The slug is then required. The Slug panel opens by itself when a new entry is created, and the entry can’t be saved until a slug has been entered.

For example, a collection of languages whose filenames are [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag) language codes, such as `en.json` or `pt-br.json`, can guide users with the `hint` and `pattern` options:

```yaml [YAML]{6-9}
collections:
  - name: languages
    label: Languages
    folder: /content/languages
    format: json
    slug:
      editable: true
      hint: A BCP 47 language code, like en or pt-br
      pattern: ['^[a-z]{2,3}(-[a-z0-9]+)*$', 'Must be a BCP 47 language code']
    fields:
      - { name: native_name, label: Native Name }
```

```toml [TOML]{7-10}
[[collections]]
name = "languages"
label = "Languages"
folder = "/content/languages"
format = "json"

[collections.slug]
editable = true
hint = "A BCP 47 language code, like en or pt-br"
pattern = ["^[a-z]{2,3}(-[a-z0-9]+)*$", "Must be a BCP 47 language code"]

[[collections.fields]]
name = "native_name"
label = "Native Name"
```

```json [JSON]{8-12}
{
  "collections": [
    {
      "name": "languages",
      "label": "Languages",
      "folder": "/content/languages",
      "format": "json",
      "slug": {
        "editable": true,
        "hint": "A BCP 47 language code, like en or pt-br",
        "pattern": ["^[a-z]{2,3}(-[a-z0-9]+)*$", "Must be a BCP 47 language code"]
      },
      "fields": [{ "name": "native_name", "label": "Native Name" }]
    }
  ]
}
```

```js [JavaScript]{8-12}
{
  collections: [
    {
      name: "languages",
      label: "Languages",
      folder: "/content/languages",
      format: "json",
      slug: {
        editable: true,
        hint: "A BCP 47 language code, like en or pt-br",
        pattern: ["^[a-z]{2,3}(-[a-z0-9]+)*$", "Must be a BCP 47 language code"],
      },
      fields: [{ name: "native_name", label: "Native Name" }],
    },
  ],
}
```

Without the `editable` option, a collection without a `template` generates the slug from the identifier field as usual, and users can still change it in the Slug panel if they like.

A slug can also be given to a new entry with the `_slug` query parameter when [linking to the Content Editor](https://sveltiacms.app/en/docs/ui/content-editor#entry-slug).

##### Numbering Slugs Automatically

For entries named after a sequential number, such as `1.md`, `2.md` and `3.md`, set the `auto_increment` option to `true`. A new entry’s slug is then the integer after the highest one among the slugs of the collection’s entries, like an `AUTO_INCREMENT` column in a relational database. Unlike the Number field’s [`auto_increment`](https://sveltiacms.app/en/docs/fields/number#auto-increment) option, it doesn’t need a field to hold the number.

- The first entry is numbered `1`. Only slugs made of digits count, so an entry named `about` doesn’t affect the numbering.
- The unpublished entries with [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) count too, as do the slugs of every locale.
- The number is assigned when the entry is saved, so the Slug panel shows the next number while a new entry is being edited.
- When the slug is editable on creation, users can type a slug of their own in the Slug panel, which takes over from the number. The `pattern` option applies to it.
- With [localized slugs](https://sveltiacms.app/en/docs/i18n/slugs), every locale shares the number unless a slug is typed in for it.
- The `template` option is ignored, and a warning is shown if it’s set.

For example, a collection of articles numbered automatically, whose slugs can only be changed to another number:

```yaml [YAML]{5-8}
collections:
  - name: articles
    label: Articles
    folder: /content/articles
    slug:
      auto_increment: true
      hint: A sequential number used as the article slug, e.g. 1
      pattern: ['^[0-9]+$', 'Must contain only numbers']
    fields:
      - { name: title, label: Title }
```

```toml [TOML]{6-9}
[[collections]]
name = "articles"
label = "Articles"
folder = "/content/articles"

[collections.slug]
auto_increment = true
hint = "A sequential number used as the article slug, e.g. 1"
pattern = ["^[0-9]+$", "Must contain only numbers"]

[[collections.fields]]
name = "title"
label = "Title"
```

```json [JSON]{7-11}
{
  "collections": [
    {
      "name": "articles",
      "label": "Articles",
      "folder": "/content/articles",
      "slug": {
        "auto_increment": true,
        "hint": "A sequential number used as the article slug, e.g. 1",
        "pattern": ["^[0-9]+$", "Must contain only numbers"]
      },
      "fields": [{ "name": "title", "label": "Title" }]
    }
  ]
}
```

```js [JavaScript]{7-11}
{
  collections: [
    {
      name: "articles",
      label: "Articles",
      folder: "/content/articles",
      slug: {
        auto_increment: true,
        hint: "A sequential number used as the article slug, e.g. 1",
        pattern: ["^[0-9]+$", "Must contain only numbers"],
      },
      fields: [{ name: "title", label: "Title" }],
    },
  ],
}
```

**Warning**

As with the Number field option, Sveltia CMS doesn’t keep a counter. The next number is worked out in the browser from the entries that exist when an entry is saved. This means:

- If the entry with the highest number is deleted, the next new entry is given the same number.
- Two users saving new entries at the same moment may get the same number.
- Any slug made of digits also counts, so a date-like slug such as `20260114` makes the numbering continue from there.

The option is ignored in a collection that stores all its entries in a [single file](https://sveltiacms.app/en/docs/collections/entries/single-file), whose entries have no slugs.

**Deprecation Notice**

The special `{{fields._slug}}` and `{{fields._slug | localize}}` slug template tags have been deprecated in favor of the `editable` and `i18n` options described above, and will be removed in Sveltia CMS v1.0.0. `slug: '{{fields._slug}}'` is equivalent to `slug: { editable: true }`, and `slug: '{{fields._slug | localize}}'` is equivalent to `slug: { editable: true, i18n: true }`.

Also, in earlier versions, setting the collection’s `delete` option to `false` prevented a saved entry’s slug from being edited. This is no longer the case; use `editable: [create]` or `editable: false` instead.

### File Paths

Sveltia CMS provides a couple of options to customize the file paths of entries in a collection.

#### Using Subfolders

By default, Sveltia CMS saves entries directly under the specified `folder` using the slug as the filename. However, you can organize entries into subfolders using the `path` option.

Just like the [`slug` option](#defining-entry-slugs) described above, the `path` option can use template tags to create dynamic folder structures. The [slug template tags](#slug-template-tags) and [string transformations](https://sveltiacms.app/en/docs/string-transformations) can be used in the `path` option, along with any field names defined in the collection’s `fields` option. For nested fields, use dot notation, e.g. `{{author.name}}`.

For example, to save blog posts in subfolders based on the year and month of the [entry date](#slug-template-tags), you can use the following configuration:

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    path: '{{year}}/{{month}}/{{slug}}'
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
path = "{{year}}/{{month}}/{{slug}}"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "path": "{{year}}/{{month}}/{{slug}}"
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
      path: "{{year}}/{{month}}/{{slug}}",
    },
  ],
}
```

With the above configuration, a blog post created on June 15, 2025, with the title “My First Post” will be saved at `content/posts/2025/06/my-first-post.md`.

##### Creating Page Bundles

You can create nested structures like Hugo’s [page bundles](https://gohugo.io/content-management/page-bundles/), or Zola’s [asset colocation](https://www.getzola.org/documentation/content/overview/#asset-colocation), which uses the same `index.md` convention, using the `path`, [`media_folder` and `public_folder` options](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders) together. For example, to create a leaf bundle for each blog post, you can use the following configuration:

```yaml [YAML]{5-7}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    path: '{{slug}}/index'
    media_folder: ''
    public_folder: ''
```

```toml [TOML]{5-7}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
path = "{{slug}}/index"
media_folder = ""
public_folder = ""
```

```json [JSON]{7-9}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "path": "{{slug}}/index",
      "media_folder": "",
      "public_folder": ""
    }
  ]
}
```

```js [JavaScript]{7-9}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      path: "{{slug}}/index",
      media_folder: "",
      public_folder: "",
    },
  ],
}
```

With the above configuration, a blog post with the title “My First Post” will be saved at `content/posts/my-first-post/index.md`, and its media files will be stored in the same folder.

Since the collection has the `path` option, the `media_folder: ''` and `public_folder: ''` lines can be omitted when the global `media_folder` option is defined: in that case, the collection-level `media_folder` [defaults to an empty string](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders).

The same options can be combined with the `nested` option to build a tree of page bundles, where each entry has both its own media folder and its own child entries. See [Nesting Page Bundles](https://sveltiacms.app/en/docs/collections/entries/nested#nesting-page-bundles).

#### Constructing File Paths

A folder collection’s file path is determined by multiple factors: the `i18n`, `folder`, `path`, `slug` and `extension` options. The configuration can be complex, especially with i18n support, so let’s break it down.

- The [`i18n`](https://sveltiacms.app/en/docs/i18n) global or collection option (optional)
  - It can be configured to add internationalization (i18n) support to your site.
  - The `structure` and `omit_default_locale_from_file_path` options affect the entry file path.
- The `folder` collection option (required)
  - It specifies the folder where the collection entries are stored, relative to the repository’s root directory.
  - It can contain slashes to create a nested folder structure.
  - With i18n enabled, it can contain the `{{locale}}` placeholder as a folder name to say where the locale folder goes, which takes precedence over the `structure` i18n option. See [Custom Locale Folder Placement](https://sveltiacms.app/en/docs/i18n/structures#custom-locale-folder-placement).
- The [`path`](#using-subfolders) collection option (optional)
  - It defaults to `{{slug}}`, which is the `slug` collection option value.
  - It can contain template tags.
  - It can also contain slashes to create a nested folder structure.
- The [`slug`](#entry-slugs) collection option (optional)
  - It defaults to `{{title}}`, which is the entry’s `title` field value’s slugified version.
  - It can contain template tags but _cannot_ contain slashes.
- The [`extension`](https://sveltiacms.app/en/docs/collections/entries/formats#extension) collection option (optional)
  - It defaults to `md`.

Looking at the above options, the entry file path can be constructed as follows:

- With i18n disabled:
  ```yaml
  /<folder>/<path>.<extension>
  ```
- With the `single_file` i18n structure:
  ```yaml
  /<folder>/<path>.<extension>
  ```
- With the `multiple_files` i18n structure:
  ```yaml
  /<folder>/<path>.<locale>.<extension>
  ```
  When the `omit_default_locale_from_file_path` i18n option is set to `true`, the path depends on the locale:
  ```yaml
  /<folder>/<path>.<extension> # default locale
  /<folder>/<path>.<locale>.<extension> # other locales
  ```
- With the `multiple_folders` i18n structure:
  ```yaml
  /<folder>/<locale>/<path>.<extension>
  ```
  When the `omit_default_locale_from_file_path` i18n option is set to `true`, the path depends on the locale:
  ```yaml
  /<folder>/<path>.<extension> # default locale
  /<folder>/<locale>/<path>.<extension> # other locales
  ```
- With the `multiple_root_folders` i18n structure:
  ```yaml
  /<locale>/<folder>/<path>.<extension>
  ```
  When the `omit_default_locale_from_file_path` i18n option is set to `true`, the path depends on the locale:
  ```yaml
  /<folder>/<path>.<extension> # default locale
  /<locale>/<folder>/<path>.<extension> # other locales
  ```
- With the `{{locale}}` placeholder in the `folder` option, e.g. `content/{{locale}}/posts`, whatever the i18n structure:
  ```yaml
  /<folder with the locale filled in>/<path>.<extension>
  ```
  When the `omit_default_locale_from_file_path` i18n option is set to `true`, the path depends on the locale:
  ```yaml
  /<folder without the locale>/<path>.<extension> # default locale
  /<folder with the locale filled in>/<path>.<extension> # other locales
  ```

Source: https://sveltiacms.app/en/docs/collections/entries/slugs
