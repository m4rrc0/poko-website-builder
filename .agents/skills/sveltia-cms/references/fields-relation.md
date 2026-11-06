# Field Types: Relation, Compute and UUID

The Relation field type that references other entries, plus the Compute and UUID field types that derive or generate values.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Relation Field

The Relation field type enables users to create relationships between entries in different collections within the CMS. There are two types of relations supported, depending on the target collection type:

- Entries in an [entry collection](https://sveltiacms.app/en/docs/collections/entries)
- List items in a specific file in a [file collection](https://sveltiacms.app/en/docs/collections/files)

The Content Editor comes with the [Backlinks sidebar panel](https://sveltiacms.app/en/docs/ui/content-editor#sidebar) that shows all entries that reference the current entry via Relation fields. This makes it easy to see how entries are connected and navigate between them, for example, to see all blog posts that are tagged with a specific tag.

### User Interface

#### Editor

Radio buttons (single select) or checkboxes (multi select) for choosing related entries from another collection. If there are many entries, a dropdown with search functionality will be used instead. Use the `dropdown_threshold` option to customize when to switch to the dropdown UI.

For multi-select options with many entries, a tag input UI will be used instead of checkboxes to save space. Items can be reordered by dragging and dropping or using the right/left arrow keys. Items can also be removed by clicking the ✕ icon on each item.

The options are listed in the order defined by the [`sort_by`](#sort-by) option, if any. Otherwise, they are listed in the following order:

- List items in a file, with the [`file`](#file) option: the order of the items in the list.
- Entries in an entry collection with the [`reorder`](https://sveltiacms.app/en/docs/collections/entries/operations#reordering-entries) option: the manual order of the entries. Entries without an order value, such as the ones just created with the [**Add**](#creating-related-entries) button, come last.
- Entries in a [single-file collection](https://sveltiacms.app/en/docs/collections/entries/single-file): the order of the entries in the array.
- Entries in any other entry collection: alphabetical order of the labels.

#### Creating Related Entries

When the related collection is an entry collection, the field also offers an **Add** button labeled with the collection’s singular label, e.g. “Add Tag” or “Add Author”. It opens a dialog to create a related entry without leaving the entry being edited. Users don’t have to save their work, go to the other collection, create the entry there and come back — or pick a wrong entry just to be able to save.

The dialog is a single-pane editor with all the fields of the related collection. If the collection has [multiple locales](https://sveltiacms.app/en/docs/i18n), a locale switcher in the dialog header lets users fill in each of them. Clicking **Add** validates the new entry the same way a save does. If a required field is empty, the dialog stays open and the error is shown on the field.

Once added, the new entry is selected in the Relation field right away. It’s listed among the options like any other entry, and shown by its label in the Preview Pane.

The new entry is not saved on its own. It’s kept with the draft and committed **together with the entry being edited** when the user saves, in a single commit. This way, the two never go out of sync: a blog post and the tags created for it land in the repository at the same time.

Until then, the entry only exists in the draft:

- If the user deselects the new entry before saving, it’s dropped rather than created for nothing.
- If the user adds two entries with the same title, the second one gets a distinct slug, e.g. `svelte-1`, the same way it would if they were created one after another.
- The dialog can be nested: a Relation field in the new entry has its own **Add** button, and the entries created there are saved along with everything else, as long as they are still referenced.
- Files attached to the new entry, such as an author’s avatar, are uploaded in the same commit.
- The pending entries are part of the [auto-saved draft](https://sveltiacms.app/en/docs/ui/content-editor#auto-saving-drafts), so they survive a page reload along with the rest of the changes.

With the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the new entry goes into the **pull request** of the entry being edited. It’s reviewed and published along with that entry, in the same merge, so an article and the section created for it can’t go live one without the other.

The new entry doesn’t get a card of its own on the Editorial Workflow page. Instead, the card of the entry it was created from lists it, e.g. “Also adds Section: Guides”. See [Entries Added or Edited from a Relation Field](https://sveltiacms.app/en/docs/workflows/editorial#entries-added-or-edited-from-a-relation-field) for details.

The button is not offered in the following cases:

- The related collection is a [file collection](https://sveltiacms.app/en/docs/collections/files), with the [`file`](#file) option. The button creates a new entry, but such a field selects an item from a list within an existing file. Adding an item would mean editing that file from another entry, which could conflict with changes made to the file elsewhere. Add the item by editing the file itself instead.
- The related collection has the [`create: false`](https://sveltiacms.app/en/docs/collections/entries/operations#disabling-creation-and-deletion) option.
- The related collection has reached its [`limit`](https://sveltiacms.app/en/docs/collections/entries/operations#limiting-entry-count), counting the entries pending in the draft and, with the Editorial Workflow, the new entries waiting in pull requests. The button is then shown disabled.
- The Relation field is read-only.
- The entry being edited is saved through the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), and the related collection is the entry’s own collection, e.g. a post referring to other posts. A pull request stands for a single entry, and a second entry of the same collection in it couldn’t be told apart from the first. Create the related entry on its own instead.
- The entry being edited is saved directly, but the related collection is under the Editorial Workflow on its own, with the collection-level [`publish_mode`](https://sveltiacms.app/en/docs/workflows/editorial#enabling-the-workflow-per-collection) option. The new entry would be committed along with the entry being edited, skipping the review the related collection asks for. Create the related entry in its own collection instead.

#### Editing Related Entries

When a related entry is selected, the field also offers an **Edit** button, e.g. “Edit Ada Lovelace”, to make changes to that entry without leaving the entry being edited: fix a typo in an author’s bio while writing a post, for example. If the field allows [multiple values](#multiple), the button is labeled with the collection’s singular label, e.g. “Edit Author”, and opens a menu listing the selected entries.

The button opens the same dialog as the [**Add**](#creating-related-entries) button, with the entry’s current values filled in. Clicking **Update** validates the changes. Like a new entry, the edited entry is not saved on its own: the changes are committed **together with the entry being edited** when the user saves, in a single commit. The entry being edited can be saved even if nothing else in it has changed.

An entry created with the **Add** button can be edited the same way until it’s saved, e.g. to fix a typo in the name of a new tag. If its slug comes from a field that has changed, such as the title, the slug is updated too, along with the value selected in the field.

A few things to note:

- If the changes alter the value the field stores, e.g. the name of an author referenced by name, the field is updated to the new value. So is every other Relation field of the entry being edited that refers to the related entry, e.g. a `reviewers` field selecting the same author. Other entries referring to the old value are not updated, the same as when the related entry is edited on its own.
- If someone else changes the related entry before the user saves, the save fails with an error instead of overwriting their changes. Open the entry again from the field: the dialog warns about the change and shows the user’s changes on top of the latest version of the entry, so they can be reviewed before saving again. If the related entry has been deleted instead, remove it from the field to save the entry.
- Clicking **Update** without changing anything just closes the dialog, so the related entry isn’t rewritten for nothing.
- DateTime fields with the [`auto_now`](https://sveltiacms.app/en/docs/fields/datetime) option are set to the time the user clicks **Update**, rather than the time the entry is saved.
- If the user deselects the edited entry before saving, the changes are dropped.
- Changes that would move the entry to another file path, e.g. through a [`path`](https://sveltiacms.app/en/docs/collections/entries/slugs#file-paths) template using one of its fields, can’t be made in the dialog, because moving an entry may also move its assets and nested entries. Edit the entry on its own instead.

With the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the changes go into the **pull request** of the entry being edited. They’re reviewed and published along with that entry, in the same merge. The card of that entry on the Editorial Workflow page lists the edited entry, e.g. “Also changes Author: Ada Lovelace”. See [Entries Added or Edited from a Relation Field](https://sveltiacms.app/en/docs/workflows/editorial#entries-added-or-edited-from-a-relation-field) for details.

Besides the cases where the **Add** button is not offered because of the field, such as a [file collection](https://sveltiacms.app/en/docs/collections/files) or a read-only field, the **Edit** button is not offered for an existing entry in the following cases:

- The entry being edited is saved through the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), and the related entry belongs to the entry’s own collection, for the same reason as the **Add** button.
- The entry being edited is saved directly, but the related collection is under the Editorial Workflow on its own. The changes would skip the review the related collection asks for. Edit the related entry on its own instead.
- The related entry has a pull request of its own, or its changes are already waiting in the pull request of another entry.
- With the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the related entry has been changed on the configured branch since the pull request of the entry being edited was opened. The pull request’s branch still has the entry as it was then, or doesn’t have it at all if it was created since, so the changes couldn’t be published. Edit the related entry on its own instead, or publish the pull request first.
- The related entry is the collection’s [index file](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file), which has fields of its own.
- The related collection is a [single-file collection](https://sveltiacms.app/en/docs/collections/entries/single-file), where all the entries are stored in one file.
- The related collection or entry is read-only.
- The related entry is the entry being edited itself.
- The selected value matches more than one entry, e.g. a title two entries share, so there’s no telling which entry to edit.

#### Preview

A string or a list of strings representing the selected related entries, formatted according to the `display_fields` option.

### Data Type

A string or an array of strings, depending on whether the `multiple` option is set to `true` or `false`. Each string represents the value of the related entry as defined by the `value_field` option.

In some cases, it can also be a number or an array of numbers if the `value_field` of the related collection is of a numeric type, like an ID.

If the `required` option is set to `false` and no related entries are selected, the value will be `null` for single select or an empty array for multi select.

#### Cascading Updates

Like a relational database that cascades an update of a referenced key, Sveltia CMS keeps Relation field values pointing at the right entry when the entry they reference is renamed. Renaming a related entry in the [Slug panel](https://sveltiacms.app/en/docs/ui/content-editor#slug-panel) rewrites every entry referencing it, in the same commit as the rename, so no references are left dangling.

This applies whenever the stored value is derived from the related entry’s identity:

- the default `{{slug}}`
- any template containing `{{slug}}`, such as `{{locale}}/{{slug}}`
- the canonical slug key

It does not apply to a `value_field` pointing at an ordinary content field, such as `{{title}}`, because such a value doesn’t change when the entry is renamed. It does break, however, if somebody edits that field. It’s one more reason to prefer the default `{{slug}}`, as noted under [`value_field`](#value-field).

#### Cascading Deletions

Deletions are cascaded in the same way. An entry can be deleted from the Content Editor or by [selecting one or more entries](https://sveltiacms.app/en/docs/ui/content-library#bulk-actions) in the entry list. Either way, every entry referencing it through a Relation field is rewritten in the same commit as the deletion:

- A single-select field is cleared.
- The deleted entry is dropped from a multi-select field’s list.

The confirmation dialog tells the user how many entries will be updated.

Unlike a rename, this applies whatever the `value_field` is, because references are matched on the stored value rather than derived from the slug. With the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the updates go into the same pull request as the deletion.

A reference is never removed at the cost of the referencing entry’s validity, though. The deletion is refused if clearing the reference would break the field’s own [validation rules](#data-validation) by leaving:

- a `required` field with nothing selected
- a multi-select field with fewer than `min` items

The dialog then lists the entries and fields standing in the way, so that the user can update them first. The check covers the whole selection: deleting two entries at once may be refused where deleting either on its own would go through.

The [Backlinks sidebar panel](https://sveltiacms.app/en/docs/ui/content-editor#sidebar) shows what references an entry, so users can see what a deletion would touch before they start.

### Data Validation

- If the `required` option is set to `true`, at least one related entry must be selected.
- If the `multiple` option is enabled, the number of selected entries must be between the `min` and `max` limits, if specified.
- If the [`pattern`](https://sveltiacms.app/en/docs/fields#pattern) option is provided, the stored value of the selected entry, as defined by the `value_field` option, must match the regular expression. Numbers are tested as strings, and the pattern is not tested while nothing is selected.
  - For multi select, the stored values joined with commas, e.g. `foo,bar,baz`, must match instead. As with Decap CMS, the pattern is tested against the whole selection, not against each value. To accept lowercase slugs only, use `^[a-z-]+(,[a-z-]+)*$` rather than `^[a-z-]+$`.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the Relation field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `relation`.

##### `collection`

- **Type**: `string`
- **Default**: `undefined`

The name of the collection to relate to. This collection must exist in the CMS configuration, and can be either an entry collection or a file collection. Use `_singletons` to relate to a [singleton](https://sveltiacms.app/en/docs/collections/singletons). If the target collection is a file collection or the singleton collection, the `file` option must also be specified.

#### Optional Options

**Breaking changes from Netlify/Decap CMS**

Sveltia CMS does not support the deprecated camelCase `valueField`, `displayFields` and `searchFields` options. Use `value_field`, `display_fields` and `search_fields` instead.

The `options_length` option is also not supported in Sveltia CMS because the performance has been improved significantly.

##### `file`

- **Type**: `string`
- **Default**: `undefined`

The name of a file within the target [file collection](https://sveltiacms.app/en/docs/collections/files), or of a singleton, to relate to. Required if the target collection is a file collection or the singleton collection.

##### `value_field`

- **Type**: `string`
- **Default**: `{{slug}}`

The field from the related collection to use as the value for the relation. This field’s value will be stored in the entry using the Relation field. It can be one of the following:

- `{{slug}}`: Use the slug of the related entry.
- A field name from the related collection, e.g. `id` or `title`.
- A template string that references fields in the related collection using the syntax `{{field_name}}`. For example, `{{fields.id}}` or `{{fields.title}}`.
- `translationKey`, or any other key configured with the `i18n.canonical_slug.key` option: Use the canonical slug of the related entry, which is shared across locales. See [below](#referencing-entries-across-locales).

The `{{locale}}` template tag can be used to include the current locale in the value field, e.g. `{{locale}}/{{slug}}`, which is useful for [i18n support](https://sveltiacms.app/en/docs/i18n).

In a collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested), an entry’s slug is its path below the collection folder, so `{{slug}}` resolves to something like `company/about`. Where every entry is stored as an index file, the shared filename is left out of that path, exactly as it is in a [preview path](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths). For example, an entry stored at `content/pages/company/about/_index.md` is referenced as `company/about`, not `company/about/_index`. The collection’s own index file is the exception, keeping its name so that a reference to it isn’t empty.

In a [single-file collection](https://sveltiacms.app/en/docs/collections/entries/single-file), an entry’s slug is its position in the array, which changes when the entries are reordered or one is deleted. The value field must therefore refer to a field, preferably one with a unique value like an ID; `{{slug}}`, including the default, is reported as invalid.

When using template strings, keep the following in mind:

- A field named `slug` must be prefixed with `fields.` like `{{fields.slug}}` to avoid ambiguity with the special `{{slug}}` variable.
- Nested fields can also be referenced using dot notation, e.g. `{{author.name}}`.
- To reference list items, use a wildcard `*` for the index, e.g. `{{tags.*}}` or `{{gallery.*.image}}`. This works for a list field with the `field` or `fields` option.

A plain field name or dot-notation path without the curly brackets, such as `title`, `name.first` or `cities.*.id`, is treated as if it were enclosed in `{{…}}`. The same applies to `display_fields` and `search_fields`. The exception is a bare `slug`, which refers to the field named `slug` (`{{fields.slug}}`), not the entry slug; use `{{slug}}` for the latter.

The stored value comes from the referenced field’s value as saved in the related entry, not as it’s displayed: a number without thousands separators, the value of a Select field option rather than its label, a date in its stored format and so on.

An entry where any field in the value field template is empty is not offered as an option, because the stored value couldn’t identify it.

The value field must be unique across all entries in the related collection to avoid conflicts. For example, using `{{title}}` as the value field is not recommended unless you can guarantee that all titles are unique. That’s why the default is `{{slug}}`, which is unique by design.

##### `display_fields`

- **Type**: `array` of `strings`
- **Default**: `["title"]` if `value_field` is `{{slug}}`, otherwise the value of the `value_field` option

The fields from the related collection to display in the Relation field UI when selecting related entries. This should be an array of field names. The values of these fields will be concatenated and shown as the label for each related entry.

An empty field is shown as empty in the label. Only when the whole label comes out empty is the entry’s summary, or its slug, shown instead.

String templates can be used to customize the display format. For example, to show both first and last names from separate fields, you can use either of the following:

```yaml [YAML]
display_fields: ['{{first_name}} {{last_name}}']
```

```toml [TOML]
display_fields = ["{{first_name}} {{last_name}}"]
```

```json [JSON]
{
  "display_fields": ["{{first_name}} {{last_name}}"]
}
```

```js [JavaScript]
{
  display_fields: ["{{first_name}} {{last_name}}"],
}
```

```yaml [YAML]
display_fields: ['first_name', 'last_name']
```

```toml [TOML]
display_fields = ["first_name", "last_name"]
```

```json [JSON]
{
  "display_fields": ["first_name", "last_name"]
}
```

```js [JavaScript]
{
  display_fields: ["first_name", "last_name"],
}
```

##### `search_fields`

- **Type**: `array` of `strings`
- **Default**: value of the `display_fields` option

The fields from the related collection to search against when filtering related entries in the Relation field UI. This should be an array of field names, which can also be string templates, just like `display_fields`. By default, it uses the same fields as specified in the `display_fields` option.

##### `default`

- **Type**: `string`, `number`, `array of strings` or `array of numbers`
- **Default**: `null` or `[]`

The default value for the field. Should be a string or number for single select, or an array of strings or numbers for multi select, depending on the `multiple` option. An array with `multiple` off, or a single value with `multiple` on, is reported as a config validation error on the login screen.

##### `dropdown_threshold`

- **Type**: `integer`
- **Default**: `5`

The number of related entries at which to switch from radio buttons/checkboxes to a dropdown with search functionality. If the number of entries in the target collection is greater than this threshold, a dropdown will be used.

##### `multiple`

- **Type**: `boolean`
- **Default**: `false`

Whether to allow selecting multiple related entries.

##### `min`

- **Type**: `integer`
- **Default**: `0`

The minimum number of related entries required. This enables validation to ensure that users select at least this many entries. Ignored if `multiple` is set to `false`.

##### `max`

- **Type**: `integer`
- **Default**: `Infinity`

The maximum number of related entries allowed. This enables validation to prevent users from selecting more than this many entries. Ignored if `multiple` is set to `false`.

##### `filters`

- **Type**: `array` of filter objects
- **Default**: `[]`

An array of filter objects to limit the related entries shown in the Relation field UI. Each filter object has the following properties:

- `field`: The field name in the **related** collection to filter on. Use `slug` to filter by entry slug, or `fields.fieldName` to filter by a content field named `fieldName`. The `fields.` prefix is required when the field is literally named `slug`, to tell it apart from the entry slug.
  - A `slug` filter matches the same form the value takes. In a collection with nested entries, it’s the entry’s path without the shared index filename.
  - If the field holds multiple values, such as a [Select](https://sveltiacms.app/en/docs/fields/select) field with `multiple: true` or a [List](https://sveltiacms.app/en/docs/fields/list) field without subfields, an entry matches when any of its values is included in `values`.
- `values`: An array of strings or numbers representing the values to match. A value may be one of the following template tags, which are resolved from the **current** entry being edited. The tag has to be the whole value, not part of a longer string like `tag-{{slug}}`:
  - `{{slug}}`: Resolved to the current entry’s slug.
  - `{{fields.fieldName}}`: Resolved to the value of a field named `fieldName` in the current entry. If the field holds multiple values, the template is expanded to all of them, so an entry matches when it shares any of them with the current entry.

  Unresolvable templates (e.g. `{{slug}}` for a new, unsaved entry, or `{{fields.fieldName}}` for a field with no values) are ignored, causing the filter to be skipped.

- `exclude` _(optional)_: If `true`, entries **matching** the filter are excluded instead of included. An entry whose field holds multiple values is excluded when any of them matches. Default: `false`.

Example — show only published entries in a specific category:

```yaml [YAML]
filters:
  - field: draft
    values: [false]
  - field: category
    values: ['news', 'updates']
```

```toml [TOML]
[[filters]]
field = "draft"
values = [false]

[[filters]]
field = "category"
values = ["news", "updates"]
```

```json [JSON]
{
  "filters": [
    {
      "field": "draft",
      "values": [false]
    },
    {
      "field": "category",
      "values": ["news", "updates"]
    }
  ]
}
```

```js [JavaScript]
{
  filters: [
    {
      field: 'draft',
      values: [false],
    },
    {
      field: 'category',
      values: ['news', 'updates'],
    },
  ],
}
```

Example — exclude the current entry from a “Related Articles” Relation field (self-exclusion):

```yaml [YAML]
filters:
  - field: slug
    values: ['{{slug}}']
    exclude: true
```

```toml [TOML]
[[filters]]
field = "slug"
values = ["{{slug}}"]
exclude = true
```

```json [JSON]
{
  "filters": [
    {
      "field": "slug",
      "values": ["{{slug}}"],
      "exclude": true
    }
  ]
}
```

```js [JavaScript]
{
  filters: [
    {
      field: 'slug',
      values: ['{{slug}}'],
      exclude: true,
    },
  ],
}
```

##### `sort_by`

- **Type**: `object`
- **Default**: `undefined`

Defines the order of the related entries in the Relation field UI. The object has the following properties:

- `field`: The field name in the **related** collection to sort by. Nested fields can be specified with dot notation, like `meta.date`. The field type is respected: [DateTime](https://sveltiacms.app/en/docs/fields/datetime) fields are sorted by date, [Number](https://sveltiacms.app/en/docs/fields/number) fields numerically and others alphabetically. You can also use `slug` (entry slug), `commit_author`, `commit_date` or `_manual` (the manual order of a collection with the [`reorder`](https://sveltiacms.app/en/docs/collections/entries/operations#reordering-entries) option).
- `direction` _(optional)_: `ascending` or `descending`. Default: `ascending`.

Entries without a value come last in either direction. Entries with the same value are sorted by their labels. With [i18n](https://sveltiacms.app/en/docs/i18n) enabled, the values are read from the current locale, falling back to the default locale.

The `sort_by` option takes precedence over the manual order of a collection with the `reorder` option. It doesn’t apply to the list items in a file referenced with the [`file`](#file) option, which always follow the order of the list.

Example — list the newest posts first:

```yaml [YAML]
sort_by:
  field: date
  direction: descending
```

```toml [TOML]
[sort_by]
field = "date"
direction = "descending"
```

```json [JSON]
{
  "sort_by": {
    "field": "date",
    "direction": "descending"
  }
}
```

```js [JavaScript]
{
  sort_by: {
    field: 'date',
    direction: 'descending',
  },
}
```

### Examples

#### Selecting Entries from an Entry Collection

Assuming you have the following entry collection named `categories`:

```yaml [YAML]
collections:
  - name: categories
    label: Categories
    folder: content/categories
    fields:
      - name: title
        label: Title
        widget: string
      - name: slug
        label: Slug
        widget: string
      - name: description
        label: Description
        widget: text
```

```toml [TOML]
[[collections]]
name = "categories"
label = "Categories"
folder = "content/categories"
[[collections.fields]]
name = "title"
label = "Title"
widget = "string"
[[collections.fields]]
name = "slug"
label = "Slug"
widget = "string"
[[collections.fields]]
name = "description"
label = "Description"
widget = "text"
```

```json [JSON]
{
  "collections": [
    {
      "name": "categories",
      "label": "Categories",
      "folder": "content/categories",
      "fields": [
        {
          "name": "title",
          "label": "Title",
          "widget": "string"
        },
        {
          "name": "slug",
          "label": "Slug",
          "widget": "string"
        },
        {
          "name": "description",
          "label": "Description",
          "widget": "text"
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
      name: 'categories',
      label: 'Categories',
      folder: 'content/categories',
      fields: [
        {
          name: 'title',
          label: 'Title',
          widget: 'string',
        },
        {
          name: 'slug',
          label: 'Slug',
          widget: 'string',
        },
        {
          name: 'description',
          label: 'Description',
          widget: 'text',
        },
      ],
    },
  ],
}
```

You can create a Relation field in another collection to select a single category:

```yaml [YAML]
fields:
  - name: category
    label: Category
    widget: relation
    collection: categories
    value_field: slug
    display_fields: [title]
    search_fields: [title, description]
```

```toml [TOML]
[[fields]]
name = "category"
label = "Category"
widget = "relation"
collection = "categories"
value_field = "slug"
display_fields = ["title"]
search_fields = ["title", "description"]
```

```json [JSON]
{
  "fields": [
    {
      "name": "category",
      "label": "Category",
      "widget": "relation",
      "collection": "categories",
      "value_field": "slug",
      "display_fields": ["title"],
      "search_fields": ["title", "description"]
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'category',
      label: 'Category',
      widget: 'relation',
      collection: 'categories',
      value_field: 'slug',
      display_fields: ['title'],
      search_fields: ['title', 'description'],
    },
  ],
}
```

Output example when the selected category has a slug of `news`:

```yaml [YAML]
category: news
```

```toml [TOML]
category = "news"
```

```json [JSON]
{
  "category": "news"
}
```

#### Referencing a File in a File Collection, Multiple Select

Assuming you have the following `cities` file in a `data` file collection:

```yaml [YAML]
collections:
  - name: data
    label: Data
    files:
      - name: locations
        label: Locations
        file: data/locations.yaml
        fields:
          - name: cities
            label: Cities
            widget: list
            fields:
              - name: name
                label: Name
                widget: string
              - name: country
                label: Country
                widget: string
```

```toml [TOML]
[[collections]]
name = "data"
label = "Data"
[[collections.files]]
name = "locations"
label = "Locations"
file = "data/locations.yaml"
[[collections.files.fields]]
name = "cities"
label = "Cities"
widget = "list"
[[collections.files.fields.fields]]
name = "name"
label = "Name"
widget = "string"
[[collections.files.fields.fields]]
name = "country"
label = "Country"
widget = "string"
```

```json [JSON]
{
  "collections": [
    {
      "name": "data",
      "label": "Data",
      "files": [
        {
          "name": "locations",
          "label": "Locations",
          "file": "data/locations.yaml",
          "fields": [
            {
              "name": "cities",
              "label": "Cities",
              "widget": "list",
              "fields": [
                {
                  "name": "name",
                  "label": "Name",
                  "widget": "string"
                },
                {
                  "name": "country",
                  "label": "Country",
                  "widget": "string"
                }
              ]
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
      name: 'data',
      label: 'Data',
      files: [
        {
          name: 'locations',
          label: 'Locations',
          file: 'data/locations.yaml',
          fields: [
            {
              name: 'cities',
              label: 'Cities',
              widget: 'list',
              fields: [
                {
                  name: 'name',
                  label: 'Name',
                  widget: 'string',
                },
                {
                  name: 'country',
                  label: 'Country',
                  widget: 'string',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

You can create a Relation field in another collection to select multiple cities from the `locations` file:

```yaml [YAML]
fields:
  - name: favorite_cities
    label: Favorite Cities
    widget: relation
    collection: data
    file: locations
    multiple: true
    min: 1
    max: 3
    value_field: '{{cities.*.name}}'
    display_fields: ['{{cities.*.name}}, {{cities.*.country}}']
    search_fields: ['{{cities.*.name}}']
```

```toml [TOML]
[[fields]]
name = "favorite_cities"
label = "Favorite Cities"
widget = "relation"
collection = "data"
file = "locations"
multiple = true
min = 1
max = 3
value_field = "{{cities.*.name}}"
display_fields = ["{{cities.*.name}}, {{cities.*.country}}"]
search_fields = ["{{cities.*.name}}"]
```

```json [JSON]
{
  "fields": [
    {
      "name": "favorite_cities",
      "label": "Favorite Cities",
      "widget": "relation",
      "collection": "data",
      "file": "locations",
      "multiple": true,
      "min": 1,
      "max": 3,
      "value_field": "{{cities.*.name}}",
      "display_fields": ["{{cities.*.name}}, {{cities.*.country}}"],
      "search_fields": ["{{cities.*.name}}"]
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'favorite_cities',
      label: 'Favorite Cities',
      widget: 'relation',
      collection: 'data',
      file: 'locations',
      multiple: true,
      min: 1,
      max: 3,
      value_field: '{{cities.*.name}}',
      display_fields: ['{{cities.*.name}}, {{cities.*.country}}'],
      search_fields: ['{{cities.*.name}}'],
    },
  ],
}
```

Note that a wildcard (`*`) is used in the `value_field`, `display_fields` and `search_fields` options to reference list items within the `cities` field.

Output example when the selected favorite cities are “San Francisco”, “Tokyo” and “Paris”:

```yaml [YAML]
favorite_cities:
  - San Francisco
  - Tokyo
  - Paris
```

```toml [TOML]
favorite_cities = ["San Francisco", "Tokyo", "Paris"]
```

```json [JSON]
{
  "favorite_cities": ["San Francisco", "Tokyo", "Paris"]
}
```

#### Referencing Entries Across Locales

When [entry slugs are localized](https://sveltiacms.app/en/docs/i18n/slugs#localizing-entry-slugs), each localized entry stores the default locale’s slug in an extra `translationKey` property. Unlike `{{slug}}`, that property holds the same value in every locale, so it can be used as the value field to reference an entry regardless of the locale being edited:

```yaml [YAML]
fields:
  - name: parent
    label: Parent Page
    widget: relation
    i18n: true
    collection: pages
    value_field: translationKey
    display_fields: [title]
    search_fields: [title]
```

```toml [TOML]
[[fields]]
name = "parent"
label = "Parent Page"
widget = "relation"
i18n = true
collection = "pages"
value_field = "translationKey"
display_fields = ["title"]
search_fields = ["title"]
```

```json [JSON]
{
  "fields": [
    {
      "name": "parent",
      "label": "Parent Page",
      "widget": "relation",
      "i18n": true,
      "collection": "pages",
      "value_field": "translationKey",
      "display_fields": ["title"],
      "search_fields": ["title"]
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'parent',
      label: 'Parent Page',
      widget: 'relation',
      i18n: true,
      collection: 'pages',
      value_field: 'translationKey',
      display_fields: ['title'],
      search_fields: ['title'],
    },
  ],
}
```

The `translationKey` property is not defined as a field, but it’s still a valid value field. If you have renamed the property with the [`i18n.canonical_slug.key`](https://sveltiacms.app/en/docs/i18n/slugs#localizing-entry-slugs) option, such as `ref` for Jekyll, use that key instead.

Source: https://sveltiacms.app/en/docs/fields/relation

---

## Compute Field

The Compute field type stores read-only values computed from other fields in the entry. It automatically updates the value when the dependent fields change.

### User Interface

#### Editor

The field isn’t shown in the editor; its value is computed from other fields and updated automatically when they change. It can’t be edited, regardless of the [`readonly`](https://sveltiacms.app/en/docs/fields#readonly) option.

#### Preview

A read-only display of the computed value.

### Data Type

A string representing the computed value.

If the [`value_type`](#value-type) option is set to `int` or `float`, the value is a number. If it’s set to `int/string` or `float/string`, the value is the number stored as a string. If the value can’t be computed, for example because a referenced field is empty, the value is `null`, or an empty string for the string types, just like an empty [Number field](https://sveltiacms.app/en/docs/fields/number).

If the template consists of the `{{index}}` variable alone, the value will be a number representing the current index of the item in the list. Combined with other text or variables, it’s part of a string.

If the template contains a UUID variable, the generated UUID is preserved in the saved value across edits.

### Data Validation

No specific data validation is applied to the Compute field, as its value is derived from other fields.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the Compute field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `compute`.

##### `value`

- **Type**: `string`

The value can be computed using a template string that references other fields. If the [`value_type`](#value-type) option is set to a number type, it’s an [arithmetic expression](#arithmetic-expressions) instead. A template supports:

- A value template that defines how to compute the field’s value. It can include references to other fields using the syntax `{{fields.name}}`, where `name` is the name of the field to reference. [String transformations](https://sveltiacms.app/en/docs/string-transformations) can be applied.
  - A Number field is referenced by its stored value, e.g. `1234.5`, rather than its localized display value, e.g. `1,234.5`. String transformations are also applied to the stored value of the referenced field, so a `ternary` transformation, for example, works on a Boolean field’s `true` or `false`.
  - In a Compute field defined in a [rich text editor component](https://sveltiacms.app/en/docs/api/editor-components), a reference like `{{fields.title}}` refers to the component’s own field of that name. If the component has no such field, it refers to the entry’s field instead.
  - In a Compute field within a [List field](https://sveltiacms.app/en/docs/fields/list), a `*` in a reference stands for the current item. For example, `{{fields.lines.*.name}}` in a field of the `lines` list refers to the `name` field of the same item. This also works for nested lists, like `{{fields.orders.*.lines.*.name}}`. A `*` for a list the Compute field isn’t in resolves to nothing, and is reported as a configuration warning.
- The special variable `{{index}}` to reference the current index when used within a list. It only works inside a [List field](https://sveltiacms.app/en/docs/fields/list), including in an [Object field](https://sveltiacms.app/en/docs/fields/object) of a list item. In a nested list, it’s the index of the innermost item.
- The special variables `{{uuid}}`, `{{uuid_short}}` and `{{uuid_shorter}}` to generate a random UUID or its shorter version, just like the [slug template tags](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags). The UUID is generated once when the entry is created and kept afterwards, even as the other parts of the value change, so it can serve as a stable identifier. A duplicated entry gets a new UUID. See the [example below](#generating-a-unique-identifier).
- A template tag escaped with a backslash, e.g. `\{{ page.url }}`, which is output as is without the backslash. See [Escaping Template Tags](https://sveltiacms.app/en/docs/string-transformations#escaping-template-tags) for details.

**Warning**

To be kept, a UUID variable has to be at either end of the template, or only be separated from the ends by literal text and other UUID variables, like `{{fields.slug}}-{{uuid_short}}`.

A UUID variable sitting between two field references, such as `{{fields.a}}{{uuid}}{{fields.b}}`, can’t be told apart from the values around it once saved. A new UUID is therefore generated whenever the entry is opened. The same applies when a string transformation changes the shape of the UUID, e.g. `truncate`; `upper` and `lower` are fine.

#### Optional Options

##### `value_type`

- **Type**: `string`
- **Default**: `string`

The type of value to store. Can be one of the following:

- `string`: The [`value`](#value) option is a template, and the result is stored as a string.
- `int`: The `value` option is an [arithmetic expression](#arithmetic-expressions), and the result is rounded to the nearest integer and stored as a number.
- `float`: The `value` option is an arithmetic expression, and the result is stored as a floating-point number.
- `int/string`: Same as `int`, but the result is stored as a string.
- `float/string`: Same as `float`, but the result is stored as a string.

### Arithmetic Expressions

If the [`value_type`](#value-type) option is set to anything other than `string`, the `value` option is an arithmetic expression that computes a number from other fields, like `{{fields.price}} * {{fields.quantity}}`. An expression can contain:

- Numbers, like `100` or `0.5`.
- References to other fields using the syntax `{{fields.name}}`, as well as the `{{index}}` variable in a [List field](https://sveltiacms.app/en/docs/fields/list). [String transformations](https://sveltiacms.app/en/docs/string-transformations) can be applied, so `{{fields.discount | default('0')}}` treats an empty field as zero. The UUID variables can’t be used.
  - A [Select](https://sveltiacms.app/en/docs/fields/select) or [Relation](https://sveltiacms.app/en/docs/fields/relation) field is referenced by its stored value, e.g. `15`, rather than the label of its option, so an option value can be used in a calculation. With the `multiple` option, `{{fields.extras.*}}` covers each selected value, e.g. `sum({{fields.extras.*}})`.
- The `+` (addition), `-` (subtraction or negation), `*` (multiplication), `/` (division) and `%` (remainder) operators. Multiplication, division and remainder are evaluated before addition and subtraction.
- Parentheses to group operations, like `({{fields.a}} + {{fields.b}}) / 2`.
- The following functions:
  - `round(x)` rounds `x` to the nearest integer, and `round(x, digits)` to the given number of decimal places, e.g. `round({{fields.price}} * 1.13, 2)`. Halves are rounded away from zero, so `round(2.5)` is `3` and `round(-2.5)` is `-3`. The result has no floating-point error: `round(1.005, 2)` is `1.01`.
  - `floor(x)` and `ceil(x)` round `x` down or up to an integer.
  - `abs(x)` returns the absolute value of `x`.
- The following aggregate functions, which take any number of values, including every item of a list:
  - `sum(x, y, …)` returns the sum of the values, or `0` if there are none.
  - `avg(x, y, …)` returns the average of the values.
  - `min(x, y, …)` and `max(x, y, …)` return the smallest or largest of the values.
  - `count(x, y, …)` returns the number of values, which don’t have to be numbers, e.g. `count({{fields.lines.*.name}})`.

#### Aggregating List Items

A field reference passed directly to an aggregate function can cover every item of a list. The last `*` in it stands for every item rather than the current one. So `sum({{fields.lines.*.amount}})` adds up the `amount` of every item in the `lines` list, even in a field of a `lines` item.

Any other `*` still stands for the current item if the Compute field is in that list. So `sum({{fields.orders.*.lines.*.amount}})` in a field of an `orders` item adds up the lines of that order only.

Empty values are left out, so an item that has yet to be filled in doesn’t empty the result. However, `avg`, `min` and `max` leave the result empty if there is no value at all.

#### Number Conversion

Each field reference is used as a number:

- the stored value of a Number field, or of another Compute field that yields a number
- the text of any other field, which must be a number like `12.5`

The value is left empty if a referenced field is empty or doesn’t hold a number, or if the result isn’t a finite number, as with a division by zero.

Small floating-point errors are removed from the result, so `0.1 * 3` is stored as `0.3` rather than `0.30000000000000004`.

#### Errors and Circular References

An invalid expression or a UUID variable in it is reported as a configuration error.

A Compute field can’t refer to itself, as in `sum({{fields.lines.*.amount}})` for the `amount` field of the `lines` list, because its value would change every time it’s computed. For the same reason, Compute fields can’t refer to each other in a cycle, like `a` referring to `b` and `b` referring back to `a`, directly or through other Compute fields. Such references are reported as configuration warnings.

### Examples

#### Basic Example

This example demonstrates a Compute field that concatenates the values of two string fields, `first_name` and `last_name`, to create a `full_name` field.

```yaml [YAML]
fields:
  - name: first_name
    label: First Name
    widget: string
  - name: last_name
    label: Last Name
    widget: string
  - name: full_name
    label: Full Name
    widget: compute
    value: '{{fields.first_name}} {{fields.last_name}}'
```

```toml [TOML]
[[fields]]
name = "first_name"
label = "First Name"
widget = "string"
[[fields]]
name = "last_name"
label = "Last Name"
widget = "string"
[[fields]]
name = "full_name"
label = "Full Name"
widget = "compute"
value = "{{fields.first_name}} {{fields.last_name}}"
```

```json [JSON]
{
  "fields": [
    {
      "name": "first_name",
      "label": "First Name",
      "widget": "string"
    },
    {
      "name": "last_name",
      "label": "Last Name",
      "widget": "string"
    },
    {
      "name": "full_name",
      "label": "Full Name",
      "widget": "compute",
      "value": "{{fields.first_name}} {{fields.last_name}}"
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'first_name',
      label: 'First Name',
      widget: 'string',
    },
    {
      name: 'last_name',
      label: 'Last Name',
      widget: 'string',
    },
    {
      name: 'full_name',
      label: 'Full Name',
      widget: 'compute',
      value: '{{fields.first_name}} {{fields.last_name}}',
    },
  ],
}
```

Output example when `first_name` is “John” and `last_name` is “Doe”:

```yaml [YAML]
first_name: John
last_name: Doe
full_name: John Doe
```

```toml [TOML]
first_name = "John"
last_name = "Doe"
full_name = "John Doe"
```

```json [JSON]
{
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe"
}
```

```js [JavaScript]
{
  first_name: 'John',
  last_name: 'Doe',
  full_name: 'John Doe',
}
```

#### Email Link

This example demonstrates a Compute field that generates a mailto link using an email address from another String field.

```yaml [YAML]
fields:
  - name: contact_email
    label: Contact Email
    widget: string
    type: email
  - name: contact_email_link
    label: Contact Email Link
    widget: compute
    value: 'mailto:{{fields.contact_email}}?subject=Inquiry'
```

```toml [TOML]
[[fields]]
name = "contact_email"
label = "Contact Email"
widget = "string"
type = "email"
[[fields]]
name = "contact_email_link"
label = "Contact Email Link"
widget = "compute"
value = "mailto:{{fields.contact_email}}?subject=Inquiry"
```

```json [JSON]
{
  "fields": [
    {
      "name": "contact_email",
      "label": "Contact Email",
      "widget": "string",
      "type": "email"
    },
    {
      "name": "contact_email_link",
      "label": "Contact Email Link",
      "widget": "compute",
      "value": "mailto:{{fields.contact_email}}?subject=Inquiry"
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'contact_email',
      label: 'Contact Email',
      widget: 'string',
      type: 'email',
    },
    {
      name: 'contact_email_link',
      label: 'Contact Email Link',
      widget: 'compute',
      value: 'mailto:{{fields.contact_email}}?subject=Inquiry',
    },
  ],
}
```

Output example when `contact_email` is “contact@example.com”:

```yaml [YAML]
contact_email: contact@example.com
contact_email_link: mailto:contact@example.com?subject=Inquiry
```

```toml [TOML]
contact_email = "contact@example.com"
contact_email_link = "mailto:contact@example.com?subject=Inquiry"
```

```json [JSON]
{
  "contact_email": "contact@example.com",
  "contact_email_link": "mailto:contact@example.com?subject=Inquiry"
}
```

```js [JavaScript]
{
  contact_email: 'contact@example.com',
  contact_email_link: 'mailto:contact@example.com?subject=Inquiry';
}
```

#### Using `index` in a List

The `{{index}}` variable can be used within a list to reference the current item’s index. In this example, we create a list of items where each item has a computed `index` based on its index in the list.

```yaml [YAML]
fields:
  - name: items
    label: Items
    widget: list
    fields:
      - name: name
        label: Name
        widget: string
      - name: index
        label: Item Index
        widget: compute
        value: '{{index}}'
```

```toml [TOML]
[[fields]]
name = "items"
label = "Items"
widget = "list"

[[fields.fields]]
name = "name"
label = "Name"
widget = "string"

[[fields.fields]]
name = "index"
label = "Item Index"
widget = "compute"
value = "{{index}}"
```

```json [JSON]
{
  "fields": [
    {
      "name": "items",
      "label": "Items",
      "widget": "list",
      "fields": [
        {
          "name": "name",
          "label": "Name",
          "widget": "string"
        },
        {
          "name": "index",
          "label": "Item Index",
          "widget": "compute",
          "value": "{{index}}"
        }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'items',
      label: 'Items',
      widget: 'list',
      fields: [
        {
          name: 'name',
          label: 'Name',
          widget: 'string',
        },
        {
          name: 'index',
          label: 'Item Index',
          widget: 'compute',
          value: '{{index}}',
        },
      ],
    },
  ],
}
```

Output example when three items are added with names “Apple”, “Banana” and “Cherry”:

```yaml [YAML]
items:
  - name: Apple
    index: 0
  - name: Banana
    index: 1
  - name: Cherry
    index: 2
```

```toml [TOML]
[[items]]
name = "Apple"
index = 0
[[items]]
name = "Banana"
index = 1
[[items]]
name = "Cherry"
index = 2
```

```json [JSON]
{
  "items": [
    {
      "name": "Apple",
      "index": 0
    },
    {
      "name": "Banana",
      "index": 1
    },
    {
      "name": "Cherry",
      "index": 2
    }
  ]
}
```

#### Generating a Unique Identifier

The `{{uuid}}`, `{{uuid_short}}` and `{{uuid_shorter}}` variables can be combined with other fields to build a readable identifier that stays unique. In this example, the `id` field combines the slugified title with a short random string. Once the entry has been saved, the random part is kept even if the title is edited later.

```yaml [YAML]
fields:
  - name: title
    label: Title
    widget: string
  - name: id
    label: ID
    widget: compute
    value: '{{fields.title | slugify}}-{{uuid_shorter}}'
```

```toml [TOML]
[[fields]]
name = "title"
label = "Title"
widget = "string"
[[fields]]
name = "id"
label = "ID"
widget = "compute"
value = "{{fields.title | slugify}}-{{uuid_shorter}}"
```

```json [JSON]
{
  "fields": [
    {
      "name": "title",
      "label": "Title",
      "widget": "string"
    },
    {
      "name": "id",
      "label": "ID",
      "widget": "compute",
      "value": "{{fields.title | slugify}}-{{uuid_shorter}}"
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'title',
      label: 'Title',
      widget: 'string',
    },
    {
      name: 'id',
      label: 'ID',
      widget: 'compute',
      value: '{{fields.title | slugify}}-{{uuid_shorter}}',
    },
  ],
}
```

Output example when `title` is “Hello World”:

```yaml [YAML]
title: Hello World
id: hello-world-e7bc7d91
```

```toml [TOML]
title = "Hello World"
id = "hello-world-e7bc7d91"
```

```json [JSON]
{
  "title": "Hello World",
  "id": "hello-world-e7bc7d91"
}
```

```js [JavaScript]
{
  title: 'Hello World',
  id: 'hello-world-e7bc7d91',
}
```

#### Calculating a Total

The `value_type` option turns the `value` option into an arithmetic expression. In this example, each item of the `lines` list has an `amount` field that multiplies the item’s price by its quantity, and a `line` field that numbers the items from 1 rather than 0. The `total` field adds up the amounts and applies the discount, which is treated as zero when the field is left empty.

```yaml [YAML]
fields:
  - name: lines
    label: Lines
    widget: list
    fields:
      - name: line
        label: Line
        widget: compute
        value_type: int
        value: '{{index}} + 1'
      - name: name
        label: Name
        widget: string
      - name: price
        label: Price
        widget: number
        value_type: float
      - name: quantity
        label: Quantity
        widget: number
      - name: amount
        label: Amount
        widget: compute
        value_type: float
        value: '{{fields.lines.*.price}} * {{fields.lines.*.quantity}}'
  - name: discount
    label: Discount (%)
    widget: number
    required: false
  - name: total
    label: Total
    widget: compute
    value_type: float
    value: "round(sum({{fields.lines.*.amount}}) * (1 - {{fields.discount | default('0')}} / 100), 2)"
```

```toml [TOML]
[[fields]]
name = "lines"
label = "Lines"
widget = "list"

[[fields.fields]]
name = "line"
label = "Line"
widget = "compute"
value_type = "int"
value = "{{index}} + 1"

[[fields.fields]]
name = "name"
label = "Name"
widget = "string"

[[fields.fields]]
name = "price"
label = "Price"
widget = "number"
value_type = "float"

[[fields.fields]]
name = "quantity"
label = "Quantity"
widget = "number"

[[fields.fields]]
name = "amount"
label = "Amount"
widget = "compute"
value_type = "float"
value = "{{fields.lines.*.price}} * {{fields.lines.*.quantity}}"

[[fields]]
name = "discount"
label = "Discount (%)"
widget = "number"
required = false

[[fields]]
name = "total"
label = "Total"
widget = "compute"
value_type = "float"
value = "round(sum({{fields.lines.*.amount}}) * (1 - {{fields.discount | default('0')}} / 100), 2)"
```

```json [JSON]
{
  "fields": [
    {
      "name": "lines",
      "label": "Lines",
      "widget": "list",
      "fields": [
        {
          "name": "line",
          "label": "Line",
          "widget": "compute",
          "value_type": "int",
          "value": "{{index}} + 1"
        },
        {
          "name": "name",
          "label": "Name",
          "widget": "string"
        },
        {
          "name": "price",
          "label": "Price",
          "widget": "number",
          "value_type": "float"
        },
        {
          "name": "quantity",
          "label": "Quantity",
          "widget": "number"
        },
        {
          "name": "amount",
          "label": "Amount",
          "widget": "compute",
          "value_type": "float",
          "value": "{{fields.lines.*.price}} * {{fields.lines.*.quantity}}"
        }
      ]
    },
    {
      "name": "discount",
      "label": "Discount (%)",
      "widget": "number",
      "required": false
    },
    {
      "name": "total",
      "label": "Total",
      "widget": "compute",
      "value_type": "float",
      "value": "round(sum({{fields.lines.*.amount}}) * (1 - {{fields.discount | default('0')}} / 100), 2)"
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'lines',
      label: 'Lines',
      widget: 'list',
      fields: [
        {
          name: 'line',
          label: 'Line',
          widget: 'compute',
          value_type: 'int',
          value: '{{index}} + 1',
        },
        {
          name: 'name',
          label: 'Name',
          widget: 'string',
        },
        {
          name: 'price',
          label: 'Price',
          widget: 'number',
          value_type: 'float',
        },
        {
          name: 'quantity',
          label: 'Quantity',
          widget: 'number',
        },
        {
          name: 'amount',
          label: 'Amount',
          widget: 'compute',
          value_type: 'float',
          value: '{{fields.lines.*.price}} * {{fields.lines.*.quantity}}',
        },
      ],
    },
    {
      name: 'discount',
      label: 'Discount (%)',
      widget: 'number',
      required: false,
    },
    {
      name: 'total',
      label: 'Total',
      widget: 'compute',
      value_type: 'float',
      value:
        "round(sum({{fields.lines.*.amount}}) * (1 - {{fields.discount | default('0')}} / 100), 2)",
    },
  ],
}
```

Output example when two lines are added and `discount` is 20:

```yaml [YAML]
lines:
  - line: 1
    name: Beans
    price: 12.5
    quantity: 2
    amount: 25
  - line: 2
    name: Filters
    price: 4.25
    quantity: 3
    amount: 12.75
discount: 20
total: 30.2
```

```toml [TOML]
discount = 20
total = 30.2

[[lines]]
line = 1
name = "Beans"
price = 12.5
quantity = 2
amount = 25

[[lines]]
line = 2
name = "Filters"
price = 4.25
quantity = 3
amount = 12.75
```

```json [JSON]
{
  "lines": [
    {
      "line": 1,
      "name": "Beans",
      "price": 12.5,
      "quantity": 2,
      "amount": 25
    },
    {
      "line": 2,
      "name": "Filters",
      "price": 4.25,
      "quantity": 3,
      "amount": 12.75
    }
  ],
  "discount": 20,
  "total": 30.2
}
```

```js [JavaScript]
{
  lines: [
    {
      line: 1,
      name: 'Beans',
      price: 12.5,
      quantity: 2,
      amount: 25,
    },
    {
      line: 2,
      name: 'Filters',
      price: 4.25,
      quantity: 3,
      amount: 12.75,
    },
  ],
  discount: 20,
  total: 30.2,
}
```

Source: https://sveltiacms.app/en/docs/fields/compute

---

## UUID Field

The UUID field type provides a read-only field that automatically generates and displays a Universally Unique Identifier (UUID). It’s useful for uniquely identifying entries within the CMS.

### User Interface

#### Editor

Read-only display of a [UUID](https://developer.mozilla.org/en-US/docs/Glossary/UUID) (Universally Unique Identifier) value. The UUID is automatically generated when a new entry is created and can’t be modified by default, because the [`readonly`](https://sveltiacms.app/en/docs/fields#readonly) option defaults to `true` for this field type. Set it to `false` to make the value editable.

A duplicated entry gets a new UUID, and so does a duplicated List item. With [i18n](https://sveltiacms.app/en/docs/i18n):

- A field with the `i18n: duplicate` option, or one inside a List or Object field with that option, has the same UUID in every locale.
- A field with `i18n: true` gets a different UUID for each locale, including a locale enabled later for an existing entry.

#### Preview

A read-only view of the UUID value.

### Data Type

A string representing a UUID in the standard 36-character format (e.g. `df733d7e-d2f7-4e4f-8f27-803046b64040`). Alphabetic characters are in lowercase.

If `use_b32_encoding` is set to true, the UUID will be represented in a 26-character lowercase [Base32](https://en.wikipedia.org/wiki/Base32) format (e.g. `c5t6kx3m6n7g4y2z2a5b7c3d4e`).

### Data Validation

No specific data validation is applied to the UUID field, as its value is automatically generated.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the UUID field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `uuid`.

#### Optional Options

##### `default`

- **Type**: `string`
- **Default**: A newly generated UUID

The default value for the field. If not provided, a new UUID will be generated when the entry is created.

##### `prefix`

- **Type**: `string`
- **Default**: `""`

A string prefix to prepend to the generated UUID. Useful for adding context or categorization to the UUID.

##### `read_only`

- **Type**: `boolean`
- **Default**: `true`

Whether to make the field read-only. Set it to `false` to let users change the generated value. This option is compatible with Decap CMS. The [`readonly`](https://sveltiacms.app/en/docs/fields#readonly) common field option, which also defaults to `true` for the UUID field type, works the same way and takes precedence if both are set.

##### `use_b32_encoding`

- **Type**: `boolean`
- **Default**: `false`

Whether to use Base32 encoding for the UUID. If set to `true`, the UUID will be represented in a 26-character lowercase Base32 format instead of the standard 36-character format.

### Examples

#### Basic UUID Field

This example demonstrates a basic UUID field that generates a standard UUID.

```yaml [YAML]
- name: product_id
  label: Product ID
  widget: uuid
```

```toml [TOML]
[[fields]]
name = "product_id"
label = "Product ID"
widget = "uuid"
```

```json [JSON]
{
  "name": "product_id",
  "label": "Product ID",
  "widget": "uuid"
}
```

```js [JavaScript]
{
  name: 'product_id',
  label: 'Product ID',
  widget: 'uuid',
}
```

Output example:

```yaml [YAML]
product_id: df733d7e-d2f7-4e4f-8f27-803046b64040
```

```toml [TOML]
product_id = "df733d7e-d2f7-4e4f-8f27-803046b64040"
```

```json [JSON]
{
  "product_id": "df733d7e-d2f7-4e4f-8f27-803046b64040"
}
```

#### UUID Field with Prefix and Base32 Encoding

This example demonstrates a UUID field that includes a prefix and uses Base32 encoding.

```yaml [YAML]
- name: order_id
  label: Order ID
  widget: uuid
  prefix: ORD-
  use_b32_encoding: true
```

```toml [TOML]
[[fields]]
name = "order_id"
label = "Order ID"
widget = "uuid"
prefix = "ORD-"
use_b32_encoding = true
```

```json [JSON]
{
  "name": "order_id",
  "label": "Order ID",
  "widget": "uuid",
  "prefix": "ORD-",
  "use_b32_encoding": true
}
```

```js [JavaScript]
{
  name: 'order_id',
  label: 'Order ID',
  widget: 'uuid',
  prefix: 'ORD-',
  use_b32_encoding: true,
}
```

Output example:

```yaml [YAML]
order_id: ORD-c5t6kx3m6n7g4y2z2a5b7c3d4e
```

```toml [TOML]
order_id = "ORD-c5t6kx3m6n7g4y2z2a5b7c3d4e"
```

```json [JSON]
{
  "order_id": "ORD-c5t6kx3m6n7g4y2z2a5b7c3d4e"
}
```

Source: https://sveltiacms.app/en/docs/fields/uuid
