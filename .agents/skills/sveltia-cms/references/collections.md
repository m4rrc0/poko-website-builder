# Collections

Collection types, file collections and singletons. For entry collection options and slugs, see `entries.md` and `entries-structure.md`. For planning collections and complete example configurations, see `content-modeling.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Collections

The `collections` option allows you to define groups of related content in your project. It’s an array of objects, each representing a collection with specific properties.

There are two types of collections, as well as dividers to visually separate sections in your navigation. These can be mixed as needed.

### Collection Types

There are two main types of collections in Sveltia CMS:

- [Entry Collections](https://sveltiacms.app/en/docs/collections/entries): Used for managing multiple entries of similar content, such as blog posts, tags, products and events. Each entry is stored as a separate file in a specified folder.
- [File Collections](https://sveltiacms.app/en/docs/collections/files): Used for managing individual files, such as static pages or configuration files. Each file is defined explicitly in the configuration.

Additionally, there is a special type of file collection:

- [Singleton Collection](https://sveltiacms.app/en/docs/collections/singletons): Defined at the top level of the config file, singletons are used for managing unique content items, such as site settings or homepage content.

### Designing Content Models with Collections

In Sveltia CMS, collections are fundamental building blocks for creating content models. They help organize and structure your content effectively. See the [Content Modeling Guide](https://sveltiacms.app/en/docs/content-modeling) for more information on designing effective content models using collections.

### Creating Collections

Collections are defined in your configuration file under the `collections` property. Here’s how to create both entry and file collections:

```yaml [YAML]{5,12}
collections:
  # Entry Collection for Blog Posts
  - name: posts
    label: Blog Posts
    folder: content/posts
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
  # File Collection for Static Pages
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{4,22}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "content/posts"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"

[[collections]]
name = "pages"
label = "Pages"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.md"

[[collections.files.fields]]
name = "title"
label = "Title"

[[collections.files.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{6,15}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    },
    {
      "name": "pages",
      "label": "Pages",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.md",
          "fields": [
            { "name": "title", "label": "Title" },
            { "name": "body", "label": "Body", "widget": "richtext" }
          ]
        }
      ]
    }
  ]
}
```

```js [JavaScript]{6,15}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "content/posts",
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
    {
      name: "pages",
      label: "Pages",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.md",
          fields: [
            { name: "title", label: "Title" },
            { name: "body", label: "Body", widget: "richtext" },
          ],
        },
      ],
    },
  ],
}
```

The two collections defined above will appear in the Sveltia CMS interface as separate sections for managing blog posts and static pages. These two collection types can be mixed and matched as needed to suit your content management requirements.

It’s easy to distinguish between entry and file collections in the configuration file. Entry collections use the `folder` property to specify the directory where entries are stored, while file collections use the `files` property to define individual files.

There is no hard limit to the number of collections you can define in your configuration file. You can create as many collections as needed to effectively organize and manage your content. However, for optimal user experience, it’s recommended to keep the number of collections manageable and logically grouped.

### Customizing Collection List Appearance

You can customize the appearance of your collection list in Sveltia CMS by adding icons and dividers. This helps improve navigation and organization, especially when you have multiple collections.

#### Icons

You can specify an icon for each collection for easy identification in the collection list. You don’t need to install a custom icon set because the Material Symbols font file is already loaded for the application UI. Just pick one of the 2,500+ icons:

1. Visit the [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols&icon.platform=web) page on Google Fonts.
1. Browse and select an icon, and copy the icon name that appears at the bottom of the right pane.
1. Add it to one of your collection definitions in `config.yml` as the new `icon` property, like the example below.
1. Repeat the same steps for all the collections if desired.
1. Commit and push the changes to your Git repository.
1. Reload Sveltia CMS once the updated config file is deployed.

Here’s an example of adding an icon to an entry collection that manages tags:

```yaml [YAML]{4}
collections:
  - name: tags
    label: Tags
    icon: sell
    folder: content/tags
```

```toml [TOML]{4}
[[collections]]
name = "tags"
label = "Tags"
icon = "sell"
folder = "content/tags"
```

```json [JSON]{6}
{
  "collections": [
    {
      "name": "tags",
      "label": "Tags",
      "icon": "sell",
      "folder": "content/tags"
    }
  ]
}
```

```js [JavaScript]{6}
{
  collections: [
    {
      name: "tags",
      label: "Tags",
      icon: "sell",
      folder: "content/tags",
    },
  ],
}
```

#### Dividers

With Sveltia CMS, developers can add dividers to the collection list to distinguish between different types of collections. To do so, insert a new item with the `divider` option set to `true`. In VS Code, you may receive a validation error if `config.yml` is treated as a Netlify CMS configuration file. You can resolve this issue by [using our JSON schema](https://sveltiacms.app/en/docs/config-basics#json-schema).

```yaml [YAML]{4}
collections:
  - name: products
    ...
  - divider: true
  - name: pages
    ...
```

```toml [TOML]{5}
[[collections]]
name = "products"

[[collections]]
divider = true

[[collections]]
name = "pages"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "products"
    },
    {
      "divider": true
    },
    {
      "name": "pages"
    }
  ]
}
```

```js [JavaScript]{7}
{
  collections: [
    {
      name: "products",
    },
    {
      divider: true,
    },
    {
      name: "pages",
    },
  ],
}
```

The [singleton collection](https://sveltiacms.app/en/docs/collections/files#singletons) also supports dividers.

Source: https://sveltiacms.app/en/docs/collections

---

## File Collections

A file collection contains pre-defined files, each representing a single piece of content. Editors can edit the content of these files but cannot add new files or delete existing ones. A listed file that doesn’t exist yet is created when it’s first saved. Typical use cases for file collections include site settings, homepage content or about pages.

### Creating a File Collection

The example below defines a file collection for managing static pages:

```yaml [YAML]
collections:
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: content/pages/about.md
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

```toml [TOML]
[[collections]]
name = "pages"
label = "Pages"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.md"

[[collections.files.fields]]
name = "title"
label = "Title"

[[collections.files.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.md",
          "fields": [
            { "name": "title", "label": "Title" },
            { "name": "body", "label": "Body", "widget": "richtext" }
          ]
        }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.md",
          fields: [
            { name: "title", label: "Title" },
            { name: "body", label: "Body", widget: "richtext" },
          ],
        },
      ],
    },
  ],
}
```

Each file in the collection is defined with a `name`, `label`, `file` path and a set of `fields`. Editors can modify the content of these files through the Sveltia CMS interface.

#### Collection Options

A file collection supports the following options:

- `name`: A unique identifier for the collection. Required.
- `label`: A human-readable name for the collection. Optional.
- `label_singular`: A human-readable singular name for the collection. Optional. Used in the editor title when a file that doesn’t exist yet is being created.
- `description`: A brief description of the collection, displayed in the UI. Optional. Basic Markdown formatting is supported.
- `icon`: A Material Symbols icon name to represent the collection in the CMS UI. Optional.
- `files`: An array of file definitions within the collection. Required.
- `hide`: Whether to hide the collection from the UI. Optional. See [Hiding the Collection](https://sveltiacms.app/en/docs/collections/entries/operations#hiding-the-collection).
- `format`, `frontmatter_delimiter`, `body_field`: The default file format options for the files in the collection. Optional. Each file can override them. [See below](#file-format-and-extension) for details.
- `media_folder`, `public_folder`: Media folder options for the collection. Optional. See [Collection-Level Configuration](https://sveltiacms.app/en/docs/media/internal#collection-level-configuration).
- `i18n`: I18n options for the collection. Optional. Each file also needs its own `i18n` option to be localized. See [Collection-Level Configuration](https://sveltiacms.app/en/docs/i18n/options#collection-level-configuration).
- `editor`: Content Editor options, such as `preview: false` to disable the preview pane and `second_pane: false` to keep the editor to a single pane. Optional. See [Disabling Previews](https://sveltiacms.app/en/docs/ui/content-editor#collection-level) and [Disabling the Second Pane](https://sveltiacms.app/en/docs/ui/content-editor#disabling-the-second-pane).
- `publish_mode`: The publish mode for the collection, overriding the top-level option. Optional. See [Enabling the Workflow per Collection](https://sveltiacms.app/en/docs/workflows/editorial#enabling-the-workflow-per-collection).
- `publish`: Set to `false` to hide the publishing controls in Editorial Workflow. Optional. See [Restricting Publishing and Deletion](https://sveltiacms.app/en/docs/workflows/editorial#restricting-publishing-and-deletion).
- `readonly`: Set to `true` to make every file in the collection read-only. Optional. See [Making Content Read-Only](https://sveltiacms.app/en/docs/collections/entries/operations#making-content-read-only).

Unlike entry collections, the collection-level `preview_path` and `preview_path_date_field` options don’t apply to file collections. Set them on each file instead.

#### File Options

A file definition within a file collection supports the following options:

- `name`: A unique identifier for the file within the collection. Required.
- `label`: A human-readable name for the file. Optional.
- `icon`: A Material Symbols icon name to represent the file in the CMS UI. Optional.
- `summary`: A template for the text shown in place of the label in the file list. Optional. [See below](#summaries) for details.
- `file`: The path to the file in the content repository. Required.
- `format`: The file format (e.g. `yaml`, `json`, `toml`, `yaml-frontmatter`, etc.). Optional. [See below](#file-format-and-extension) for details.
- `frontmatter_delimiter`: The front matter delimiter. Optional. [See below](#front-matter-delimiter) for details.
- `body_field`: The body field options for front matter formats. Optional. [See below](#body-field-for-front-matter-formats) for details.
- `fields`: An array of field definitions for the file content. Required.
- `media_folder`, `public_folder`: Media folder options for the file, overriding the top-level and collection-level options. Optional. See [File-Level Configuration](https://sveltiacms.app/en/docs/media/internal#file-level-configuration).
- `i18n`: I18n options for the file. Optional. See [File-Level Configuration](https://sveltiacms.app/en/docs/i18n/options#file-level-configuration).
- `editor`: Content Editor options for the file, overriding the collection-level options. Optional. See [Disabling Previews](https://sveltiacms.app/en/docs/ui/content-editor#file-level) and [Disabling the Second Pane](https://sveltiacms.app/en/docs/ui/content-editor#disabling-the-second-pane).
- `readonly`: Set to `true` to make the file read-only, while the other files in the collection stay editable. Optional. See [Making Content Read-Only](https://sveltiacms.app/en/docs/collections/entries/operations#making-content-read-only).
- `preview_path`, `preview_path_date_field`: The file’s URL path on the live site. Optional. [See below](#preview-path) for details.

A listed file doesn’t have to exist in the repository. If it’s missing, the Content Editor opens with empty fields (or their default values), and the file is created when the editor saves it.

### File Format and Extension

The file format and extension for each file in a file collection can be customized using the `format` property within each file definition. Sveltia CMS supports various file formats, including Markdown, YAML, JSON and TOML.

By default, the file format is determined based on the file extension. If it is a Markdown file (e.g. `.md`), it uses the `frontmatter` format, which detects YAML, TOML or JSON front matter automatically. A new file is saved with YAML front matter. For other extensions, it uses the corresponding format (e.g. `.yaml` uses `yaml` format). See [Default Format and Extension](https://sveltiacms.app/en/docs/collections/entries/formats#default-format-and-extension) for the full list.

To illustrate, here is a file collection with two files using different formats:

```yaml [YAML]{7,13}
collections:
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: content/pages/about.json
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
      - name: contact
        label: Contact Page
        file: content/pages/contact.yaml
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{8,22}
[[collections]]
name = "pages"
label = "Pages"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.json"

[[collections.files.fields]]
name = "title"
label = "Title"

[[collections.files.fields]]
name = "body"
label = "Body"
widget = "richtext"

[[collections.files]]
name = "contact"
label = "Contact Page"
file = "content/pages/contact.yaml"

[[collections.files.fields]]
name = "title"
label = "Title"

[[collections.files.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{10,19}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.json",
          "fields": [
            { "name": "title", "label": "Title" },
            { "name": "body", "label": "Body", "widget": "richtext" }
          ]
        },
        {
          "name": "contact",
          "label": "Contact Page",
          "file": "content/pages/contact.yaml",
          "fields": [
            { "name": "title", "label": "Title" },
            { "name": "body", "label": "Body", "widget": "richtext" }
          ]
        }
      ]
    }
  ]
}
```

```js [JavaScript]{10,19}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.json",
          fields: [
            { name: "title", label: "Title" },
            { name: "body", label: "Body", widget: "richtext" },
          ],
        },
        {
          name: "contact",
          label: "Contact Page",
          file: "content/pages/contact.yaml",
          fields: [
            { name: "title", label: "Title" },
            { name: "body", label: "Body", widget: "richtext" },
          ],
        },
      ],
    },
  ],
}
```

#### Format

To explicitly set the file format, you can add the `format` property to each file definition. This is useful if you want to use TOML or JSON formats for Markdown files. Here is an example:

```yaml [YAML]{4}
collections:
  - name: pages
    label: Pages
    format: json-frontmatter
    files:
      - name: about
        label: About Page
        file: content/pages/about.md
```

```toml [TOML]{4}
[[collections]]
name = "pages"
label = "Pages"
format = "json-frontmatter"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.md"
```

```json [JSON]{6}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "format": "json-frontmatter",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.md"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{6}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      format: "json-frontmatter",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.md",
        },
      ],
    },
  ],
}
```

The `format` can be set at the collection level to apply to all files within that collection, or at the individual file level to override the collection setting for specific files.

Note that when specifying a format, ensure that the file extension matches the chosen format to avoid confusion. If there is an obvious mismatch between the file extension and the specified format, Sveltia CMS will raise a validation error.

#### Extension

Unlike entry collections, file collections do not support the `extension` option to define allowed file extensions, since each file is pre-defined with a specific path containing its extension.

Extension-less files are supported in file collections. When using extension-less files, it is recommended to explicitly set the `format` property to ensure the correct parsing of the file content. If `format` is not set, it defaults to `yaml-frontmatter`.

See [Editing site deployment configuration files](https://sveltiacms.app/en/docs/how-tos#editing-site-deployment-configuration-files) in our how-tos for an example of using extension-less files in a file collection.

#### Front Matter Delimiter

As with entry collections, the [`frontmatter_delimiter` option](https://sveltiacms.app/en/docs/collections/entries/formats#front-matter-delimiter) can also be used to customize the front matter delimiter for Markdown files, either at the collection or file level. Here is an example of setting both `format` and `frontmatter_delimiter` at the file level:

```yaml [YAML]{8-9}
collections:
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: content/pages/about.md
        format: toml-frontmatter
        frontmatter_delimiter: ~~~
```

```toml [TOML]{9-10}
[[collections]]
name = "pages"
label = "Pages"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.md"
format = "toml-frontmatter"
frontmatter_delimiter = "~~~"
```

```json [JSON]{11-12}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.md",
          "format": "toml-frontmatter",
          "frontmatter_delimiter": "~~~"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{11-12}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.md",
          format: "toml-frontmatter",
          frontmatter_delimiter: "~~~",
        },
      ],
    },
  ],
}
```

#### Body Field for Front Matter Formats

When using front matter formats (e.g. `yaml-frontmatter`, `toml-frontmatter`, `json-frontmatter`), you can configure the body field to specify where the main content of the file should be stored. By default, the body field is named `body`, but you can customize this by setting the `body_field` option at either the collection or file level.

See [Body Field for Front Matter Formats](https://sveltiacms.app/en/docs/collections/entries/formats#body-field-for-front-matter-formats) in the entry collections documentation for more details.

### Preview Path

A file has no preview link by default. To link it to its page on the live site, or on a [deploy preview](https://sveltiacms.app/en/docs/deployments/previews), set the `preview_path` option on the file. It works like the collection-level [`preview_path` option](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) of an entry collection, with the following differences:

- `{{slug}}` is the file’s `name` option value.
- `{{dirname}}` is the directory of the `file` path, relative to the repository’s root directory, since a file collection has no `folder`.
- Field values, date/time tags, `{{filename}}`, `{{extension}}` and `{{locale}}` are filled in the same way, using the file’s own `fields`. The date/time tags use the file’s first DateTime field unless `preview_path_date_field` is set.

```yaml [YAML]{8}
collections:
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: content/pages/about.md
        preview_path: /about/
        fields:
          - { name: title, label: Title }
          - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{9}
[[collections]]
name = "pages"
label = "Pages"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.md"
preview_path = "/about/"

[[collections.files.fields]]
name = "title"
label = "Title"

[[collections.files.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{11}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.md",
          "preview_path": "/about/",
          "fields": [
            { "name": "title", "label": "Title" },
            { "name": "body", "label": "Body", "widget": "richtext" }
          ]
        }
      ]
    }
  ]
}
```

```js [JavaScript]{11}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.md",
          preview_path: "/about/",
          fields: [
            { name: "title", label: "Title" },
            { name: "body", label: "Body", widget: "richtext" },
          ],
        },
      ],
    },
  ],
}
```

### Summaries

The file list shows each file’s `label`, or its `name` if the label is missing. To show something about the file’s content instead, such as the locales it’s available in, set the `summary` option on the file. It works like the [`summary` option](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) of an entry collection. It can contain basic Markdown formatting, the values of the file’s own `fields`, transformations and the same special template tags, with the following differences:

- `{{slug}}` is the file’s `name` option value.
- `{{dirname}}` is the directory of the `file` path, relative to the repository’s root directory, since a file collection has no `folder`.
- If the `title` field is missing or empty, `{{title}}` falls back to the `name` or `label` field, then to a header in the Markdown body, and finally to the file’s label instead of the slug.

For example, with [i18n support](https://sveltiacms.app/en/docs/i18n) set up at the top level, the following configuration shows the page title along with the locales the file is available in:

```yaml [YAML]{9}
collections:
  - name: pages
    label: Pages
    i18n: true
    files:
      - name: about
        label: About Page
        file: content/pages/about.{{locale}}.md
        summary: '{{title}} ({{locales}})'
        i18n: true
        fields:
          - { name: title, label: Title, i18n: true }
          - { name: body, label: Body, widget: richtext, i18n: true }
```

```toml [TOML]{10}
[[collections]]
name = "pages"
label = "Pages"
i18n = true

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.{{locale}}.md"
summary = "{{title}} ({{locales}})"
i18n = true

[[collections.files.fields]]
name = "title"
label = "Title"
i18n = true

[[collections.files.fields]]
name = "body"
label = "Body"
widget = "richtext"
i18n = true
```

```json [JSON]{12}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "i18n": true,
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.{{locale}}.md",
          "summary": "{{title}} ({{locales}})",
          "i18n": true,
          "fields": [
            { "name": "title", "label": "Title", "i18n": true },
            { "name": "body", "label": "Body", "widget": "richtext", "i18n": true }
          ]
        }
      ]
    }
  ]
}
```

```js [JavaScript]{12}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      i18n: true,
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.{{locale}}.md",
          summary: "{{title}} ({{locales}})",
          i18n: true,
          fields: [
            { name: "title", label: "Title", i18n: true },
            { name: "body", label: "Body", widget: "richtext", i18n: true },
          ],
        },
      ],
    },
  ],
}
```

With English and French enabled and an English title of “About Us”, the file is listed as “About Us (en, fr)”. The field values are taken from the default locale. A file that doesn’t exist in the repository yet has no content to fill in the template, so it’s listed with its label until it’s first saved.

The `summary` option is only used in the file list. A [singleton](https://sveltiacms.app/en/docs/collections/singletons) has no file list, so the option has no effect there.

### Singletons

The singleton collection is a special type of file collection that allows you to manage a set of pre-defined files without the ability to create or delete them. Singletons are useful for managing site-wide settings or content that should only exist as a single instance. See [Singletons](https://sveltiacms.app/en/docs/collections/singletons) for more details.

Source: https://sveltiacms.app/en/docs/collections/files

---

## Singletons

The Singleton collection is a special type of file collection that allows you to manage a set of pre-defined data files, each representing a unique resource in your project. Unlike regular file collections, the Singleton collection does not have a collection name or label, and each file is defined directly at the root level of the configuration.

**Tip**

Singletons may be referred to as “singles” or “singular resources” in other CMSs.

### Differences from File Collections

The differences between the Singleton collection and a regular [file collection](https://sveltiacms.app/en/docs/collections/files) are as follows:

#### Configuration

- The Singleton collection does not have the `name` or `label` property at the root level of the configuration.
- Each file in the Singleton collection is defined directly under the `singletons` array at the root level of the configuration, rather than being nested under a `files` property within a named collection.
- Singleton files cannot be nested within folders; each file must be defined at the top level of the `singletons` array.

#### User Interface

- On desktop, singleton files appear directly in the sidebar under the “Singletons” group, rather than within a collection that shows a list of files.
  - When clicking on a singleton file in the sidebar, the editor opens directly for that file.
  - However, if there are no other collections, the Singleton collection appears as a regular file collection.
- On mobile, singleton files are accessible via a dedicated “Singletons” section in the content library.

### When to Use Singletons

If your project has multiple similar files, you might consider creating a regular [file collection](https://sveltiacms.app/en/docs/collections/files) and including all your relevant files there. A typical example is a `pages` collection that contains multiple page files like `home`, `about` and `contact`.

However, if your project has only a few pages or configuration files that are not part of a larger collection, using singletons can be more straightforward.

For example, you might have a `home` page and a `settings` file that you want to manage. Instead of creating a `pages` collection with just one file, you can define these files directly in the Singleton collection.

### Creating the Singleton Collection

To create this special file collection, add the new `singletons` option, along with an array of file definitions, to the root level of your CMS configuration.

Here’s an example configuration with two singleton files:

```yaml [YAML]
singletons:
  - name: home
    label: Home Page
    file: content/home.yaml
    fields:
      - { label: Title, name: title }
      - { label: Body, name: body, widget: richtext }
  - name: settings
    label: Site Settings
    file: content/settings.yaml
    fields:
      - { label: Site Title, name: site_title }
      - { label: Description, name: description, widget: text }
```

```toml [TOML]
[[singletons]]
name = "home"
label = "Home Page"
file = "content/home.yaml"

[[singletons.fields]]
label = "Title"
name = "title"

[[singletons.fields]]
label = "Body"
name = "body"
widget = "richtext"

[[singletons]]
name = "settings"
label = "Site Settings"
file = "content/settings.yaml"

[[singletons.fields]]
label = "Site Title"
name = "site_title"

[[singletons.fields]]
label = "Description"
name = "description"
widget = "text"
```

```json [JSON]
{
  "singletons": [
    {
      "name": "home",
      "label": "Home Page",
      "file": "content/home.yaml",
      "fields": [
        { "label": "Title", "name": "title" },
        { "label": "Body", "name": "body", "widget": "richtext" }
      ]
    },
    {
      "name": "settings",
      "label": "Site Settings",
      "file": "content/settings.yaml",
      "fields": [
        { "label": "Site Title", "name": "site_title" },
        { "label": "Description", "name": "description", "widget": "text" }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  singletons: [
    {
      name: "home",
      label: "Home Page",
      file: "content/home.yaml",
      fields: [
        { label: "Title", name: "title" },
        { label: "Body", name: "body", widget: "richtext" },
      ],
    },
    {
      name: "settings",
      label: "Site Settings",
      file: "content/settings.yaml",
      fields: [
        { label: "Site Title", name: "site_title" },
        { label: "Description", name: "description", widget: "text" },
      ],
    },
  ],
}
```

File options are the same as those for [file collections](https://sveltiacms.app/en/docs/collections/files).

### Converting from File Collections

It’s easy to convert an existing file collection into the Singleton collection. This is a conventional file collection:

```yaml [YAML]{1-4}
collections:
  - name: data
    label: Data
    files:
      - name: home
        label: Home Page
        file: content/home.yaml
        fields: ...
      - name: settings
        label: Site Settings
        file: content/settings.yaml
        fields: ...
```

```toml [TOML]{1-3}
[[collections]]
name = "data"
label = "Data"

[[collections.files]]
name = "home"
label = "Home Page"
file = "content/home.yaml"

[[collections.files]]
name = "settings"
label = "Site Settings"
file = "content/settings.yaml"
```

```json [JSON]{2-6}
{
  "collections": [
    {
      "name": "data",
      "label": "Data",
      "files": [
        {
          "name": "home",
          "label": "Home Page",
          "file": "content/home.yaml"
        },
        {
          "name": "settings",
          "label": "Site Settings",
          "file": "content/settings.yaml"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{2-6}
{
  collections: [
    {
      name: "data",
      label: "Data",
      files: [
        {
          name: "home",
          label: "Home Page",
          file: "content/home.yaml",
        },
        {
          name: "settings",
          label: "Site Settings",
          file: "content/settings.yaml",
        },
      ],
    },
  ],
}
```

It can be converted to the Singleton collection like this:

```yaml [YAML]{1}
singletons:
  - name: home
    label: Home Page
    file: content/home.yaml
    fields: ...
  - name: settings
    label: Site Settings
    file: content/settings.yaml
    fields: ...
```

```toml [TOML]
[[singletons]]
name = "home"
label = "Home Page"
file = "content/home.yaml"

[[singletons]]
name = "settings"
label = "Site Settings"
file = "content/settings.yaml"
```

```json [JSON]{2}
{
  "singletons": [
    {
      "name": "home",
      "label": "Home Page",
      "file": "content/home.yaml"
    },
    {
      "name": "settings",
      "label": "Site Settings",
      "file": "content/settings.yaml"
    }
  ]
}
```

```js [JavaScript]{2}
{
  singletons: [
    {
      name: "home",
      label: "Home Page",
      file: "content/home.yaml",
    },
    {
      name: "settings",
      label: "Site Settings",
      file: "content/settings.yaml",
    },
  ],
}
```

### Adding Icons and Dividers

You can add icons to singleton items using the `icon` option, and you can add dividers between items using the `divider` option. Here’s an example:

```yaml [YAML]{5,7,11}
singletons:
  - name: home
    label: Home Page
    file: content/home.yaml
    icon: home
    fields: ...
  - divider: true
  - name: settings
    label: Site Settings
    file: content/settings.yaml
    icon: settings
    fields: ...
```

```toml [TOML]{5,8,14}
[[singletons]]
name = "home"
label = "Home Page"
file = "content/home.yaml"
icon = "home"

[[singletons]]
divider = true

[[singletons]]
name = "settings"
label = "Site Settings"
file = "content/settings.yaml"
icon = "settings"
```

```json [JSON]{7,10,16}
{
  "singletons": [
    {
      "name": "home",
      "label": "Home Page",
      "file": "content/home.yaml",
      "icon": "home"
    },
    {
      "divider": true
    },
    {
      "name": "settings",
      "label": "Site Settings",
      "file": "content/settings.yaml",
      "icon": "settings"
    }
  ]
}
```

```js [JavaScript]{7,10,16}
{
  singletons: [
    {
      name: "home",
      label: "Home Page",
      file: "content/home.yaml",
      icon: "home",
    },
    {
      divider: true,
    },
    {
      name: "settings",
      label: "Site Settings",
      file: "content/settings.yaml",
      icon: "settings",
    },
  ],
}
```

### Referencing Singleton Files

Singletons belong to a collection named `_singletons` (note the underscore prefix). Use this name wherever a collection name is expected, along with the singleton’s `name` as the filename:

- In a [Relation](https://sveltiacms.app/en/docs/fields/relation) field, set `collection` to `_singletons` and `file` to the singleton’s name.
- In a [custom preview style](https://sveltiacms.app/en/docs/api/preview-styles#applying-preview-styles-to-specific-collections-or-files), set the `collection` option to `_singletons` and the `file` option to the singleton’s name, e.g. `registerPreviewStyle('/settings.css', { collection: '_singletons', file: 'settings' })`.
- In a [custom preview template](https://sveltiacms.app/en/docs/api/preview-templates), call `getCollection('_singletons', 'settings')` to get the `settings` singleton, or `getCollection('_singletons')` to get all the singletons. `getCollection('settings')` doesn’t work, because `settings` is a filename, not a collection name.
- In a custom preview template or an [event hook](https://sveltiacms.app/en/docs/api/events), the `collection` property of a singleton’s entry is `_singletons`.

`registerPreviewTemplate()` is different: like with a file collection, it takes the filename, which is the singleton’s own name, e.g. `registerPreviewTemplate('settings', SettingsPreview)`.

Source: https://sveltiacms.app/en/docs/collections/singletons
