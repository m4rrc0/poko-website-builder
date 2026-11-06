# Entry Collections: Operations

What editors can do with entries: disabling creation, deletion and duplication, limiting the entry count, read-only content, hiding the collection, reordering and bulk editing. For summaries, thumbnails, sorting, grouping and filtering, see `entries-listing.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Entry Operations

Sveltia CMS provides options to control entry creation, deletion and duplication, limit the number of entries, make content read-only, hide collections from the interface and let editors reorder entries manually.

### Disabling Creation and Deletion

You can disable entry creation and deletion by setting the `create` option to `false` and the `delete` option to `false` in the collection definition. This is useful for collections where entries are managed programmatically or through other means, and you don’t want editors to create or delete entries.

```yaml [YAML]{5-6}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    create: false
    delete: false
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5-6}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
create = false
delete = false

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7-8}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "create": false,
      "delete": false,
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
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
      create: false,
      delete: false,
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

**Breaking change from Netlify/Decap CMS**

In Sveltia CMS, the `create` option for entry collections defaults to `true` because, in 99.99% of cases, users want to create new entries and adding `create: true` to every collection is redundant. To disable entry creation, set `create: false` explicitly.

### Disabling Duplication

You can disable entry duplication by setting the `duplicate` option to `false` in the collection definition. This is useful for collections where entries should not be duplicated, such as unique content types.

When the `duplicate` option is set to `false`, the “Duplicate” button will be disabled in the Sveltia CMS interface, preventing users from creating duplicate entries.

```yaml [YAML]{5}
collections:
  - name: products
    label: Products
    folder: /content/products
    duplicate: false
```

```toml [TOML]{5}
[[collections]]
name = "products"
label = "Products"
folder = "/content/products"
duplicate = false
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "products",
      "label": "Products",
      "folder": "/content/products",
      "duplicate": false
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
      duplicate: false,
    },
  ],
}
```

### Limiting Entry Count

You can limit the number of entries in an entry collection using the `limit` option. This is useful for collections where you want to restrict the number of items, such as featured articles or top products.

```yaml [YAML]{5}
collections:
  - name: featured_articles
    label: Featured Articles
    folder: /content/featured_articles
    limit: 5
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "featured_articles"
label = "Featured Articles"
folder = "/content/featured_articles"
limit = 5

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "featured_articles",
      "label": "Featured Articles",
      "folder": "/content/featured_articles",
      "limit": 5,
      "fields": [
        { "name": "title", "label": "Title" },
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
      name: "featured_articles",
      label: "Featured Articles",
      folder: "/content/featured_articles",
      limit: 5,
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

With the above configuration, editors can only create up to 5 entries in the `featured_articles` collection. Once the limit is reached, the “Create new” button will be disabled in the Sveltia CMS interface.

The collection’s [index file](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file) doesn’t take up a slot. It stands for the collection’s own page rather than for one of the entries in it, so a collection with `limit: 5` and an `index_file` holds its index file plus 5 entries.

### Making Content Read-Only

You can make content read-only with the `readonly` option. Editors can still browse, search and view read-only content, including its preview, but they can’t change it. The option can be set at three levels:

- **Globally**: At the top level of the configuration, `readonly: true` puts the whole CMS in read-only mode. This is handy while your site is under maintenance or being migrated, when editors shouldn’t write to the repository.
- **Collection**: On an entry collection, a file collection or an [asset collection](https://sveltiacms.app/en/docs/media/internal#asset-collections), `readonly: true` locks that collection only.
- **File**: On a file in a file collection, or on a [singleton](https://sveltiacms.app/en/docs/collections/singletons), `readonly: true` locks that file only, while the other files stay editable.

```yaml [YAML]{5}
collections:
  - name: archive
    label: Archive
    folder: /content/archive
    readonly: true
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "archive"
label = "Archive"
folder = "/content/archive"
readonly = true

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "archive",
      "label": "Archive",
      "folder": "/content/archive",
      "readonly": true,
      "fields": [
        { "name": "title", "label": "Title" },
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
      name: "archive",
      label: "Archive",
      folder: "/content/archive",
      readonly: true,
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

To put the whole CMS in read-only mode, add the option to the top level instead:

```yaml [YAML]
readonly: true
```

```toml [TOML]
readonly = true
```

```json [JSON]
{
  "readonly": true
}
```

```js [JavaScript]
{
  readonly: true,
}
```

A read-only level locks everything below it, and a lower level can’t opt out with `readonly: false`. For example, while the whole CMS is read-only, every collection and file is read-only as well.

For read-only content, Sveltia CMS:

- Shows a message at the top of the entry list, the Content Editor and the Asset Library, saying that the content can be viewed but not changed. When the whole CMS is read-only, the message says so instead.
- Disables creating, duplicating, deleting and reordering entries, including from the global Create menu and the **Add** button of a Relation field that [creates related entries](https://sveltiacms.app/en/docs/fields/relation#creating-related-entries). The Create menu button itself is disabled when nothing can be created, as in read-only mode.
- Opens entries and files with every field locked. The Save button, the slug and parent folder editors, the translation and copy options, and the reset options are not available.
- Hides the Editorial Workflow controls for the entry, so it can’t be moved through the review stages, published or discarded.
- Disables uploading, replacing, editing, renaming and deleting assets in the media folders of the read-only collection or file, as well as creating, renaming and deleting subfolders there. The global media folder is only read-only along with the whole CMS.

Read-only entries also stay intact when other content changes. Sveltia CMS normally updates the entries that refer to an entry or asset when it’s renamed or deleted, but it can’t update a read-only entry. Instead, it refuses to delete or rename an entry or asset that a read-only entry refers to, and tells the editor which read-only entries are in the way.

**Not a security measure**

The `readonly` option only affects the Sveltia CMS interface. It doesn’t stop anyone with write access to the repository from changing the content through Git or the Git hosting service. Use your Git host’s permissions, such as branch protection rules, to restrict write access.

### Hiding the Collection

You can hide an entry collection from the Sveltia CMS interface using the `hide` option. This is useful for collections that are managed programmatically or through other means, and you don’t want editors to see or modify them.

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    hide: true
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
hide = true

[[collections.fields]]
name = "title"
label = "Title"

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
      "hide": true,
      "fields": [
        { "name": "title", "label": "Title" },
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
      hide: true,
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

When the `hide` option is set to `true`, the collection will not appear in the Sveltia CMS interface, and editors will not be able to access or modify its entries. Its entries are also left out of the global search results and of the list of entries using an asset in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library).

### Reordering Entries

When the `reorder` option is set to `true`, Sveltia CMS enables manual reordering of entries in the listing view. This is useful for collections where the order of the entries matters, such as a list of featured products or a custom navigation menu.

With this option enabled, users can reorder entries by dragging and dropping them or using the arrow buttons.

In a [single-file collection](https://sveltiacms.app/en/docs/collections/entries/single-file), the entries can always be reordered without this option, which can’t be used there. The order of the objects in the array is the order of the entries, so no `order` field is written.

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    reorder: true
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
reorder = true

[[collections.fields]]
name = "title"
label = "Title"

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
      "reorder": true,
      "fields": [
        { "name": "title", "label": "Title" },
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
      reorder: true,
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

By default, orders are saved in an additional property named `order` in each entry’s data, starting from `1`. However, you can customize this setting by providing an object with a `key` property that specifies a different field name for storing the order value. For example, to use the `weight` field for [Hugo](https://gohugo.io/methods/page/weight/) or [Zola](https://www.getzola.org/documentation/content/section/#weight), configure it like this:

```yaml [YAML]{5-6}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    reorder:
      key: weight
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
reorder = { key = "weight" }

[[collections.fields]]
name = "title"
label = "Title"

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
      "reorder": { "key": "weight" },
      "fields": [
        { "name": "title", "label": "Title" },
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
      reorder: { key: "weight" },
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

#### Reordering Within Groups

Entering reorder mode normally clears any active grouping, so the entry list becomes a single flat sequence. If the order value is only meaningful within a group — for example, articles ordered per category — you can keep the list grouped while reordering instead. To do so, add a `group` property to the `reorder` option. Its value is the `name` of one of the collection’s [view groups](https://sveltiacms.app/en/docs/collections/entries/views#grouping):

```yaml [YAML]{5-11}
collections:
  - name: articles
    label: Articles
    folder: /content/articles
    reorder:
      group: categories
    view_groups:
      groups:
        - name: categories
          label: Categories
          field: category
    fields:
      - { name: title, label: Title }
      - { name: category, label: Category }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5,7-10}
[[collections]]
name = "articles"
label = "Articles"
folder = "/content/articles"
reorder = { group = "categories" }

[[collections.view_groups.groups]]
name = "categories"
label = "Categories"
field = "category"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "category"
label = "Category"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7-10}
{
  "collections": [
    {
      "name": "articles",
      "label": "Articles",
      "folder": "/content/articles",
      "reorder": { "group": "categories" },
      "view_groups": {
        "groups": [{ "name": "categories", "label": "Categories", "field": "category" }]
      },
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "category", "label": "Category" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]{7-10}
{
  collections: [
    {
      name: "articles",
      label: "Articles",
      folder: "/content/articles",
      reorder: { group: "categories" },
      view_groups: {
        groups: [{ name: "categories", label: "Categories", field: "category" }],
      },
      fields: [
        { name: "title", label: "Title" },
        { name: "category", label: "Category" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

With the above configuration, the entry list is grouped by `category` whenever a user enters reorder mode, and entries can only be dragged within their own group. Dropping an entry into a different group is rejected, because that would not change the `category` field that determines which group it belongs to.

A few things to keep in mind:

- The group is referenced by `name`, so the view group must have one. The `name` property is required in the extended syntax shown above, and can also be added to individual entries in the plain array syntax.
- The configured group replaces whatever grouping the user has selected in the Group menu. Their own selection is restored once they leave reorder mode.
- Order values are still assigned as a single sequence starting from `1`, numbered group by group. They do not restart at `1` in each group, so the first entry of the second group continues from where the first group ended.
- If the named group is not defined in `view_groups`, Sveltia CMS raises a configuration error on startup.

### Bulk Editing Entries

When the `bulk_edit` option is set to `true`, users can change the simple fields of many entries at once in a spreadsheet-like table, instead of opening and saving each entry one by one. This is useful for chores like turning a `draft` flag on or off, moving posts to another category or fixing titles across a collection.

```yaml [YAML]{5}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    bulk_edit: true
    fields:
      - { name: title, label: Title }
      - { name: draft, label: Draft, widget: boolean }
      - { name: category, label: Category, widget: select, options: [news, blog] }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
bulk_edit = true

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "draft"
label = "Draft"
widget = "boolean"

[[collections.fields]]
name = "category"
label = "Category"
widget = "select"
options = ["news", "blog"]

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
      "bulk_edit": true,
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "draft", "label": "Draft", "widget": "boolean" },
        { "name": "category", "label": "Category", "widget": "select", "options": ["news", "blog"] },
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
      bulk_edit: true,
      fields: [
        { name: "title", label: "Title" },
        { name: "draft", label: "Draft", widget: "boolean" },
        { name: "category", label: "Category", widget: "select", options: ["news", "blog"] },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

With this option enabled, an **Edit** button appears in the collection toolbar. Clicking it turns the entry list into a table, with a row for each entry and a column for each field that can be edited in bulk. Each cell holds the same control as the content editor: a text box, a switch, a dropdown list, a date picker and so on. The entry titles stay in view as the table is scrolled sideways.

In the example above, the table has Title, Draft and Category columns. The Body field is left out, because a rich text editor doesn’t fit in a table cell.

The toolbar shows how many values have been changed, and the changed cells are highlighted. Click **Save** to write all the changes in a single commit, or **Cancel** to discard them. You’re asked to confirm if there are unsaved changes.

The table lists the entries shown before clicking **Edit**, in the same order and groups. To edit only some of the entries, such as the posts in one category, [filter](https://sveltiacms.app/en/docs/collections/entries/views#filtering) the list first. The sorting, filtering and grouping menus are hidden while editing, so the rows stay where they are.

#### Choosing the Fields

By default, every field that can be edited in bulk becomes a column, in the configured order. To show only some of them, or in a different order, provide an object with a `fields` property listing the field names instead:

```yaml [YAML]{5-6}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    bulk_edit:
      fields: [draft, title]
    fields:
      - { name: title, label: Title }
      - { name: draft, label: Draft, widget: boolean }
      - { name: category, label: Category, widget: select, options: [news, blog] }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
bulk_edit = { fields = ["draft", "title"] }

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "draft"
label = "Draft"
widget = "boolean"

[[collections.fields]]
name = "category"
label = "Category"
widget = "select"
options = ["news", "blog"]

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
      "bulk_edit": { "fields": ["draft", "title"] },
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "draft", "label": "Draft", "widget": "boolean" },
        { "name": "category", "label": "Category", "widget": "select", "options": ["news", "blog"] },
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
      bulk_edit: { fields: ["draft", "title"] },
      fields: [
        { name: "title", label: "Title" },
        { name: "draft", label: "Draft", widget: "boolean" },
        { name: "category", label: "Category", widget: "select", options: ["news", "blog"] },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

If a listed field doesn’t exist at the top level of the collection, or can’t be edited in bulk, Sveltia CMS raises a configuration error on startup.

#### Supported Fields

Only a top-level field holding a single simple value can be edited in bulk — the same field types as an [editor component in the inline mode](https://sveltiacms.app/en/docs/api/editor-components#status-select-inline-mode):

- [Boolean](https://sveltiacms.app/en/docs/fields/boolean)
- [Color](https://sveltiacms.app/en/docs/fields/color)
- [DateTime](https://sveltiacms.app/en/docs/fields/datetime)
- [Number](https://sveltiacms.app/en/docs/fields/number)
- [Relation](https://sveltiacms.app/en/docs/fields/relation)
- [Select](https://sveltiacms.app/en/docs/fields/select)
- [String](https://sveltiacms.app/en/docs/fields/string)

A field of these types is still left out if:

- it has the `multiple` or `readonly` option enabled
- its value is set automatically on save: a Number field with the `auto_increment` option or a DateTime field with the `auto_now` option

Other fields, such as Text, Rich Text, List and Object fields, can only be edited in the content editor.

#### How Changes Are Saved

- The values are checked against the field options, such as `required`, `pattern`, `min` and `max`, before anything is saved, as they are in the content editor. An invalid value is highlighted with an error message, and nothing is saved until it’s fixed. A `unique` field is checked against all the pending changes together, so two entries can swap their values.
- Only the entries with changed values are saved. A DateTime field with the `auto_now` option is updated in each of them, as it would be in the content editor.
- With [i18n](https://sveltiacms.app/en/docs/i18n) enabled, the table shows the values in the default locale. A field with `i18n: duplicate` gets the new value in every locale. A translatable field only changes in the default locale; the other locales can be updated in the content editor.
- The changes are applied to the entries as they are in the repository when you click **Save**, so a change someone else has made to another field of the same entry in the meantime is kept.
- The collection’s [index file](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file) and [read-only](#making-content-read-only) entries are not listed.

Like [reordering](#reordering-entries), bulk editing writes the changes to the configured branch directly, even if [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) is enabled. This is because it doesn’t go through the review of each entry. An entry with unpublished changes is edited in its published version, so publishing those changes later may revert the bulk edit.

The **Edit** button is not available:

- to [Open Authoring](https://sveltiacms.app/en/docs/workflows/open) contributors, or to users who can’t push to the branch, for the same reason
- on small screens, where a table doesn’t fit

Source: https://sveltiacms.app/en/docs/collections/entries/operations
