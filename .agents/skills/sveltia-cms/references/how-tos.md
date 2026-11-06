# How-Tos

Step-by-step recipes for common use cases: entry tags for categorization, editing raw text files, editing site deployment configuration files, conditional fields, and rendering soft line breaks as hard line breaks in Markdown.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## How-Tos

This section provides practical guides on how to implement common features and use cases with Sveltia CMS.

### Using Entry Tags for Categorization

If you write blog posts, for example, you may want to categorize them with taxonomies, often called tags, categories, labels or keywords. With Sveltia CMS, there are several ways to implement this feature, depending on your needs.

If you don’t have a predefined list of tags, you can use a simple [List](https://sveltiacms.app/en/docs/fields/list) field. This configuration will produce a newline-separated text field where users can enter tags freely:

```yaml [YAML]
collections:
  - name: posts
    label: Blog Posts
    label_singular: Blog Post
    folder: /content/posts
    fields:
      - name: title
        label: Title
      - name: tags
        label: Tags
        widget: list
      - name: body
        label: Body
        widget: richtext
```

```toml [TOML]
[[collections]]
name = "posts"
label = "Blog Posts"
label_singular = "Blog Post"
folder = "/content/posts"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "tags"
label = "Tags"
widget = "list"

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
      "label_singular": "Blog Post",
      "folder": "/content/posts",
      "fields": [
        {
          "name": "title",
          "label": "Title"
        },
        {
          "name": "tags",
          "label": "Tags",
          "widget": "list"
        },
        {
          "name": "body",
          "label": "Body",
          "widget": "richtext"
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
      name: "posts",
      label: "Blog Posts",
      label_singular: "Blog Post",
      folder: "/content/posts",
      fields: [
        {
          name: "title",
          label: "Title",
        },
        {
          name: "tags",
          label: "Tags",
          widget: "list",
        },
        {
          name: "body",
          label: "Body",
          widget: "richtext",
        },
      ],
    },
  ],
}
```

If you have a small number of predefined tags, you can use a [Select](https://sveltiacms.app/en/docs/fields/select) field. This configuration will produce a dropdown list where users can select one or more tags:

```yaml [YAML]
fields:
  - name: tags
    label: Tags
    widget: select
    multiple: true
    options:
      - { label: Travel, value: travel }
      - { label: Food, value: food }
      - { label: Technology, value: technology }
      - { label: Lifestyle, value: lifestyle }
```

```toml [TOML]
[[fields]]
name = "tags"
label = "Tags"
widget = "select"
multiple = true

[[fields.options]]
label = "Travel"
value = "travel"

[[fields.options]]
label = "Food"
value = "food"

[[fields.options]]
label = "Technology"
value = "technology"

[[fields.options]]
label = "Lifestyle"
value = "lifestyle"
```

```json [JSON]
{
  "fields": [
    {
      "name": "tags",
      "label": "Tags",
      "widget": "select",
      "multiple": true,
      "options": [
        { "label": "Travel", "value": "travel" },
        { "label": "Food", "value": "food" },
        { "label": "Technology", "value": "technology" },
        { "label": "Lifestyle", "value": "lifestyle" }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: "tags",
      label: "Tags",
      widget: "select",
      multiple: true,
      options: [
        { label: "Travel", value: "travel" },
        { label: "Food", value: "food" },
        { label: "Technology", value: "technology" },
        { label: "Lifestyle", value: "lifestyle" },
      ],
    },
  ],
}
```

If you want more flexibility, you can create a separate collection for tags and reference it using a [Relation](https://sveltiacms.app/en/docs/fields/relation) field from your blog post collection. This approach allows you to:

- Add many tags without bloating the configuration file
- Manage tags in one place within the CMS
- Reuse tags across multiple collections
- Add a description, image and other details to each tag (if you have tag index pages)
- Localize tags with [i18n support](https://sveltiacms.app/en/docs/i18n) enabled

This configuration will also produce a dropdown list where users can select one or more tags:

```yaml [YAML]
fields:
  - name: tags
    label: Tags
    widget: relation
    multiple: true
    collection: tags
    search_fields: [title]
    display_fields: [title]
    value_field: '{{slug}}'
```

```toml [TOML]
[[fields]]
name = "tags"
label = "Tags"
widget = "relation"
multiple = true
collection = "tags"
search_fields = ["title"]
display_fields = ["title"]
value_field = "{{slug}}"
```

```json [JSON]
{
  "fields": [
    {
      "name": "tags",
      "label": "Tags",
      "widget": "relation",
      "multiple": true,
      "collection": "tags",
      "search_fields": ["title"],
      "display_fields": ["title"],
      "value_field": "{{slug}}"
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: "tags",
      label: "Tags",
      widget: "relation",
      multiple: true,
      collection: "tags",
      search_fields: ["title"],
      display_fields: ["title"],
      value_field: "{{slug}}",
    },
  ],
}
```

And here is an example of the corresponding tag collection:

```yaml [YAML]
collections:
  - name: tags
    label: Tags
    label_singular: Tag
    folder: /content/tags
    fields:
      - name: title
        label: Title
      - name: description
        label: Description
        widget: text
        required: false
      - name: image
        label: Image
        widget: image
        required: false
```

```toml [TOML]
[[collections]]
name = "tags"
label = "Tags"
label_singular = "Tag"
folder = "/content/tags"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "description"
label = "Description"
widget = "text"
required = false

[[collections.fields]]
name = "image"
label = "Image"
widget = "image"
required = false
```

```json [JSON]
{
  "collections": [
    {
      "name": "tags",
      "label": "Tags",
      "label_singular": "Tag",
      "folder": "/content/tags",
      "fields": [
        {
          "name": "title",
          "label": "Title"
        },
        {
          "name": "description",
          "label": "Description",
          "widget": "text",
          "required": false
        },
        {
          "name": "image",
          "label": "Image",
          "widget": "image",
          "required": false
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
      name: "tags",
      label: "Tags",
      label_singular: "Tag",
      folder: "/content/tags",
      fields: [
        {
          name: "title",
          label: "Title",
        },
        {
          name: "description",
          label: "Description",
          widget: "text",
          required: false,
        },
        {
          name: "image",
          label: "Image",
          widget: "image",
          required: false,
        },
      ],
    },
  ],
}
```

You don’t have to create the tags in the tag collection first: the Relation field offers an **Add Tag** button that opens a dialog to [create a tag on the fly](https://sveltiacms.app/en/docs/fields/relation#creating-related-entries) while editing a blog post. The new tag is selected in the field right away and saved along with the post, in the same commit.

### Editing Raw Text Files

Sveltia CMS allows users to edit raw text files without any front matter, such as JSON, XML or CSV files. To achieve this, you can use the `raw` format in a file collection with a single `body` field configured with the appropriate `widget` type: `code`, `markdown`, `richtext` or `text`.

Here is an example configuration for editing the `README.md` and `package.json` files:

```yaml [YAML]
collections:
  - name: root_files
    label: Root Files
    editor:
      preview: false
    files:
      - name: readme
        label: README
        file: README.md
        format: raw
        fields:
          - name: body
            label: README.md
            widget: richtext
      - name: package_json
        label: package.json
        file: package.json
        format: raw
        fields:
          - name: body
            label: package.json
            widget: code
            output_code_only: true
            allow_language_selection: false
            default_language: json
```

```toml [TOML]
[[collections]]
name = "root_files"
label = "Root Files"
[collections.editor]
preview = false
[[collections.files]]
name = "readme"
label = "README"
file = "README.md"
format = "raw"
[[collections.files.fields]]
name = "body"
label = "README.md"
widget = "richtext"
[[collections.files]]
name = "package_json"
label = "package.json"
file = "package.json"
format = "raw"
[[collections.files.fields]]
name = "body"
label = "package.json"
widget = "code"
output_code_only = true
allow_language_selection = false
default_language = "json"
```

```json [JSON]
{
  "collections": [
    {
      "name": "root_files",
      "label": "Root Files",
      "editor": {
        "preview": false
      },
      "files": [
        {
          "name": "readme",
          "label": "README",
          "file": "README.md",
          "format": "raw",
          "fields": [
            {
              "name": "body",
              "label": "README.md",
              "widget": "richtext"
            }
          ]
        },
        {
          "name": "package_json",
          "label": "package.json",
          "file": "package.json",
          "format": "raw",
          "fields": [
            {
              "name": "body",
              "label": "package.json",
              "widget": "code",
              "output_code_only": true,
              "allow_language_selection": false,
              "default_language": "json"
            }
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
      name: "root_files",
      label: "Root Files",
      editor: {
        preview: false,
      },
      files: [
        {
          name: "readme",
          label: "README",
          file: "README.md",
          format: "raw",
          fields: [
            {
              name: "body",
              label: "README.md",
              widget: "richtext",
            },
          ],
        },
        {
          name: "package_json",
          label: "package.json",
          file: "package.json",
          format: "raw",
          fields: [
            {
              name: "body",
              label: "package.json",
              widget: "code",
              output_code_only: true,
              allow_language_selection: false,
              default_language: "json",
            },
          ],
        },
      ],
    },
  ],
}
```

### Editing Site Deployment Configuration Files

Sveltia CMS allows users to edit files without extensions. Examples include `_headers` and `_redirects`, which are used by some static site hosting providers, such as [Netlify](https://docs.netlify.com/routing/redirects/), [GitLab Pages](https://docs.gitlab.com/user/project/pages/redirects/) and [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/redirects/).

Since the `body` field is [saved without the field name](https://sveltiacms.app/en/docs/collections/entries/formats#body-field-for-front-matter-formats) when using the default `yaml-frontmatter` format, you can use the following configuration to edit these files in the Content Editor. Or you can explicitly set the `format` option to `raw`, just like in the previous section.

```yaml [YAML]
collections:
  - name: config
    label: Site Configuration
    editor:
      preview: false
    files:
      - name: headers
        label: Headers
        file: public/_headers # The path varies by framework
        fields:
          - name: body
            label: Headers
            widget: code # Can also be `text`
            output_code_only: true
            allow_language_selection: false
      - name: redirects
        label: Redirects
        file: public/_redirects # The path varies by framework
        fields:
          - name: body
            label: Redirects
            widget: code # Can also be `text`
            output_code_only: true
            allow_language_selection: false
```

```toml [TOML]
[[collections]]
name = "config"
label = "Site Configuration"

[collections.editor]
preview = false

[[collections.files]]
name = "headers"
label = "Headers"
file = "public/_headers"

[[collections.files.fields]]
name = "body"
label = "Headers"
widget = "code"
output_code_only = true
allow_language_selection = false

[[collections.files]]
name = "redirects"
label = "Redirects"
file = "public/_redirects"

[[collections.files.fields]]
name = "body"
label = "Redirects"
widget = "code"
output_code_only = true
allow_language_selection = false
```

```json [JSON]
{
  "collections": [
    {
      "name": "config",
      "label": "Site Configuration",
      "editor": {
        "preview": false
      },
      "files": [
        {
          "name": "headers",
          "label": "Headers",
          "file": "public/_headers",
          "fields": [
            {
              "name": "body",
              "label": "Headers",
              "widget": "code",
              "output_code_only": true,
              "allow_language_selection": false
            }
          ]
        },
        {
          "name": "redirects",
          "label": "Redirects",
          "file": "public/_redirects",
          "fields": [
            {
              "name": "body",
              "label": "Redirects",
              "widget": "code",
              "output_code_only": true,
              "allow_language_selection": false
            }
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
      name: "config",
      label: "Site Configuration",
      editor: {
        preview: false,
      },
      files: [
        {
          name: "headers",
          label: "Headers",
          file: "public/_headers",
          fields: [
            {
              name: "body",
              label: "Headers",
              widget: "code",
              output_code_only: true,
              allow_language_selection: false,
            },
          ],
        },
        {
          name: "redirects",
          label: "Redirects",
          file: "public/_redirects",
          fields: [
            {
              name: "body",
              label: "Redirects",
              widget: "code",
              output_code_only: true,
              allow_language_selection: false,
            },
          ],
        },
      ],
    },
  ],
}
```

### Creating Conditional Fields

Sometimes, you may want to create your content model in a flexible way. Sveltia CMS does not support dependent fields yet, but you can achieve similar functionality using variable types in [List](https://sveltiacms.app/en/docs/fields/list) and [Object](https://sveltiacms.app/en/docs/fields/object) fields. This approach lets you make fields that can hold different types of data based on what the user chooses. Look at the documentation for each field to see examples.

### Rendering Soft Line Breaks as Hard Line Breaks in Markdown

In the [rich text](https://sveltiacms.app/en/docs/fields/richtext) editor, pressing `Shift+Enter` inserts a [soft line break](https://spec.commonmark.org/current/#soft-line-breaks) (`\n`). We can’t change the behavior to add a [hard line break](https://spec.commonmark.org/current/#hard-line-breaks) (`<br>`) — it’s a limitation of the underlying [Lexical framework](https://lexical.dev/). However, if you look at the preview, you may notice that soft line breaks are rendered as hard line breaks. That’s because the preview uses the [Marked](https://github.com/markedjs/marked) library with the [`breaks` option](https://marked.js.org/using_advanced#options) enabled. This mimics how comments are rendered on GitHub.

Chances are the Markdown parser you use for your frontend can do the same:

- [markdown-it](https://github.com/markdown-it/markdown-it) (used in Eleventy and VitePress) also has the `breaks` option
- [remarkable](https://github.com/jonschlinkert/remarkable) also has the `breaks` option
- [Showdown](https://github.com/showdownjs/showdown) has the `simpleLineBreaks` option
- [goldmark](https://github.com/yuin/goldmark/) (used in Hugo) has the `html.WithHardWraps` option
- [kramdown](https://github.com/gettalong/kramdown) (used in Jekyll) has the `hard_wrap` option with the GFM parser
- [remark](https://github.com/remarkjs/remark) (used in Astro) offers a [plugin](https://github.com/remarkjs/remark-breaks)
- [micromark](https://github.com/micromark/micromark) clarifies it doesn’t have such an option and recommends alternatives
- [Tera](https://keats.github.io/tera/) (used in Zola) has the `newlines_to_br` filter

Source: https://sveltiacms.app/en/docs/how-tos
