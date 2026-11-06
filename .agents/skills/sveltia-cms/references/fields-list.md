# Field Types: List

The List field type for repeatable values and nested fields, including types, summaries and variable-type lists. For the Object and KeyValue field types, see `fields-structural.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## List Field

The List field type allows users to create and manage lists of items within the CMS entry form. It supports various configurations for defining the structure and type of items in the list, either as a simple array or as a list of complex objects.

### User Interface

#### Editor

The List field type has four different UI modes, depending on the configuration:

- Complex list field:
  - With the `field` option: A single subfield editor is shown for each item in the list.
  - With the `fields` option: A group of subfield editors is shown for each item in the list.
  - With the `types` option: A type selector is shown for each item, along with the corresponding subfield editors. This configuration is called a **variable type** list. It’s useful for creating flexible content structures like page builders.
- Simple list field:
  - Without the `field`, `fields` or `types` option: Each item is shown as a row with a single-line text input. Spaces and commas are treated as part of the item values instead of delimiters.

##### Complex list field

- Each item in the list can be expanded or collapsed to show or hide its subfields.
- Each item comes with a Remove button and a menu. The menu lets users copy the item, paste a copied item in place of it or above/below it, duplicate the item, or insert a new item above/below it. A duplicated or pasted item gets new UUIDs for its [UUID](https://sveltiacms.app/en/docs/fields/uuid) fields and its [Compute](https://sveltiacms.app/en/docs/fields/compute#generating-a-unique-identifier) fields that generate one. See [Copying and pasting items](#copying-and-pasting-items) below.
- A removed item is replaced with a notice and a Restore button. Restore brings the item back to the same position with all its values, in every locale it was removed from. The notice is shown until the entry editor is closed, or until the list is changed in a way that leaves it out of place, e.g. by reverting the field. Restore is disabled while the list has reached its [`max`](#max) number of items.
- Users can expand or collapse the entire list using the Expand All and Collapse All buttons.
- Each item can be reordered in its header:
  - The Move Up and Move Down buttons, next to the item menu, move the item one position. They are disabled on the first and last items respectively.
  - With a mouse, the drag handle in the middle of the header also moves the item when dragged. With the handle focused, the Up and Down arrow keys move the item one position, while Home and End send it to the top or bottom of the list. The handle is not shown on a touch screen, because drag and drop requires a mouse.
  - When the list has 3 or more items, the item menu also offers Move to Top, Move to Bottom and Move to…. The last one asks for the position to move the item to, from 1 to the number of items. Move to Top and Move to Bottom are disabled on the first and last items respectively.
- With a mouse, the Move Up, Move Down, menu and Remove buttons of an item are shown when the pointer is over the item or the item has focus, to reduce clutter.

###### Copying and pasting items

An item of a complex list field can be copied and pasted into the same list or any other list that takes it, in another entry or collection, or even on another site managed with Sveltia CMS.

- **Copy**: Select Copy in the item menu. The item is copied to the system clipboard, so it can be pasted in another browser tab as well. Copy is available even in a read-only list or a list that doesn’t allow adding items.
- **Paste**: Select Paste Item Above, Paste Item Below or Paste to Replace in the menu of another item. Paste to Replace replaces the item, so it’s available even when the list has reached its [`max`](#max) number of items.
  - You can also click the Paste Item button next to the Add button. It adds the item to the end of the list, or to the top with the [`add_to_top`](#add-to-top) option. This button is also how to paste an item into an empty list.
- The browser may ask for permission to read the clipboard. If the permission is denied, an item copied in the same tab can still be pasted.
- The copied item doesn’t have to come from a list with the same configuration. The values are matched to the subfields by name:
  - A value is left out if the list doesn’t have a subfield of the same name, or if the subfield doesn’t take that kind of value, e.g. text pasted into a Boolean field. A notification tells how many values were left out.
  - A subfield that the item doesn’t have gets its default value.
  - In a [variable type](#types) list, the list needs a type with the same name as the copied item’s type.
  - If none of the values fit, the item isn’t pasted, and a notification says so.
- File and image paths are updated to work in the entry the item is pasted into. A file stored next to the source entry, e.g. in a Hugo page bundle, may not be referenced from the target entry. If so, it’s copied to the target field’s media folder when the entry is saved, just like a file picked for the field. A notification tells if a file can’t be found, e.g. when the item comes from another site.
- In a list whose items are paired across locales, the item is copied and pasted in every locale. Otherwise, the item is copied in the locale it’s copied from, and its values are pasted in the locale being edited.

##### Simple list field

- Pressing Enter in an item’s input adds a new item below it. The Add button below the list appends one to the end.
- Each item comes with a Remove button.
- Each item can be reordered using the drag handle at the start of its row, either by dragging it or with the same keys as a complex list field. On a touch screen, Move Up and Move Down buttons are shown in place of the handle. When the list has 3 or more items, a menu next to the handle or buttons offers Move to Top, Move to Bottom and Move to…, as in a complex list field.
- The list always keeps one row, so that an empty list still offers somewhere to type. The Remove and reorder controls are disabled when a single item is left.
- Blank rows are ignored. The stored value is the list of the remaining items, each trimmed of surrounding spaces.

#### Preview

A list view displaying all items in the list. For complex list fields, grouped subfield values are shown for each item. For simple list fields, a bulleted list of string values is displayed.

### Data Type

An array. The elements can be strings or objects, depending on the configuration.

If the `required` option is set to `false` and the field is left empty, the value will be an empty array.

With the [`map_key_field`](#map-key-field) option, the list is stored as an object instead, mapping the key of each item to the item. An empty list is then an empty object.

### Data Validation

- If the `required` option is set to `true`, the list must contain at least one item.
- If the `min` and/or `max` options are specified, the number of items in the list must be within the defined limits.
- For a [simple list](#simple-list-field), if the [`pattern`](https://sveltiacms.app/en/docs/fields#pattern) option is provided, the list items joined with commas, e.g. `foo,bar,baz`, must match the regular expression. As with Decap CMS, the pattern is tested against the whole list, not against each item. A pattern that describes a single item therefore has to allow for the commas. To accept lowercase words only, use `^[a-z]+(,[a-z]+)*$` rather than `^[a-z]+$`.
- Each item in the list is validated according to the subfield definitions, if applicable.
- With the [`map_key_field`](#map-key-field) option, the key of each item is required, even in an [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) draft, must be unique within the list, and can’t be a whole number such as `1` or `2024`.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the List field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `list` to use the List field type.

#### General Options

##### `default`

- **Type**: `array`
- **Default**: `[]`

The default value for the field. It’s used when creating a new entry, and when opening an existing entry that doesn’t have the field, such as one written before the field was added to the configuration. The shape of the array depends on how the list is configured:

- For a simple list without `field`, `fields` or `types`, an array of strings.
- For a list with a single `field`, an array of values for that subfield: strings for a String subfield, objects for an [Object](https://sveltiacms.app/en/docs/fields/object) or [KeyValue](https://sveltiacms.app/en/docs/fields/keyvalue) subfield and so on.
- For a list with `fields`, an array of objects whose keys are the subfield names.
- For a list with `types`, an array of objects, each including the [`typeKey`](#typekey) property (`type` by default) to identify its variable type.

An item that doesn’t match the configuration is reported as a config validation error on the login screen, because it would otherwise be silently dropped or saved to the entry as-is. This includes:

- an object in a simple list
- a plain value in a list with `fields` or `types`
- a property that isn’t a subfield name
- a type name that isn’t one of the `types`

See the [Default Values](#default-values) example below for each shape.

Note that the field can also be pre-filled with comma-separated [dynamic default values](https://sveltiacms.app/en/docs/ui/content-editor#dynamic-default-values) passed via URL query parameters. Dynamic values take precedence over the `default` option.

##### `label_singular`

- **Type**: `string`
- **Default**: The value of the `label` option

A label used for singular items in the list, e.g. “Member” for a list labeled “Members”. It will be displayed on the Add button and in other relevant places in the UI.

##### `min`

- **Type**: `integer`
- **Default**: `0`

The minimum number of items required in the list. If the number of items is below this value, a validation error will be shown.

##### `max`

- **Type**: `integer`
- **Default**: `Infinity`

The maximum number of items allowed in the list. If the number of items exceeds this value, a validation error will be shown.

A list limited to one item with `max: 1`, which is how a single object is stored in an array, is shown like an [Object field](https://sveltiacms.app/en/docs/fields/object) rather than a list, so users don’t have to deal with the array:

- The item count, the list toggle and the reorder controls are hidden, and the item is kept expanded.
- If the field is required, the item is there from the start, filled with the default values of the subfields, and it can’t be removed. It’s added to a new entry, and to an existing entry that doesn’t have one yet. This doesn’t apply to a [variable type](#types) list, where the user chooses the type of the item, and can remove it to choose another.
- If the field is optional, the Add button is shown until the item is added, and the item can be removed again.
- A [simple list field](#simple-list-field) shows a single input, without the Remove and reorder controls.
- A list holding more items than that, e.g. because the file was edited outside the CMS, is shown as a regular list, so that the extra items can be removed.

##### `root`

- **Type**: `boolean`
- **Default**: `false`

Whether to store the list at the root level of the output file, without a parent key. This is useful for creating top-level lists in files. It works with both [simple](#simple-list-field) and [complex](#complex-list-field) lists.

The `root` option is ignored in the following cases:

- The collection or file contains other fields. You can still have subfields under the List field.
- The file format is TOML, because TOML doesn’t support top-level arrays. A list with the [`map_key_field`](#map-key-field) option is stored as an object, so it can be at the top level of a TOML file too.

See the [Top-Level List](#top-level-list) example below for details.

#### Subfield Definition

These options are mutually exclusive; you can only use one of them at a time:

##### `field`

- **Type**: A single [field definition](https://sveltiacms.app/en/docs/fields)

##### `fields`

- **Type**: `array` of [field definitions](https://sveltiacms.app/en/docs/fields)

##### `types`

- **Type**: `array` of variable type definitions

Each type definition is an object with the following properties:

- `name` (string, required): The unique identifier for the type.
- `label` (string, optional): The display label for the type. Defaults to `name`.
- `widget` (string, optional): The field type for this type. It must be `object` if not omitted. Another field type is reported as a config validation error on the login screen.
- `description` (string, optional): A short description of the type, displayed below its label in the Add button’s dropdown menu. Markdown is not supported.
- `hint` (string, optional): A help message displayed above the subfields of this type, like a field’s [`hint`](https://sveltiacms.app/en/docs/fields#hint). Limited Markdown formatting is supported: bold, italic, strikethrough, inline code and links. A line break can be given as `\n`. The hint is not displayed while the field is read-only.
- `summary` (string, optional): A template for the summary shown on a collapsed item of this type. Overrides the field-level [`summary`](#summary).
- `fields` (array of field definitions, optional): The subfields for this type.

#### Subfield Options

These options are effective only when the `field`, `fields` or `types` option is used:

##### `summary`

- **Type**: `string`
- **Default**: `""`

A template string used to generate a summary for each item in the collapsed view. It can include subfield values using the `{{subfield_name}}` syntax. [String transformations](https://sveltiacms.app/en/docs/string-transformations) can be applied in this option. If omitted, the summary will be automatically generated based on the first textual subfield found.

If the single subfield defined with the `field` option is of a [custom field type](https://sveltiacms.app/en/docs/api/field-types) that comes with a [summary component](https://sveltiacms.app/en/docs/api/field-types#summary-component), the component is drawn instead of the text.

See the [Using Summary and Thumbnail](#using-summary-and-thumbnail) example below for details.

##### `thumbnail`

- **Type**: `string`
- **Default**: `""`

The name of an [Image](https://sveltiacms.app/en/docs/fields/image) or [File](https://sveltiacms.app/en/docs/fields/file) subfield to be used as the thumbnail for each list item in the collapsed view. The thumbnail is displayed next to the summary. A File subfield holding an image, video or PDF gets a thumbnail; other kinds of files are not shown. If omitted, no thumbnail will be displayed.

A subfield of a nested object can be referenced with dot notation, e.g. `mobile.src`. Like the `summary` template tags, the name can be prefixed with `fields.`. A name that doesn’t point to an Image or File subfield is reported as a config validation error on the login screen. With `types`, a name shared by the subfields of several types is accepted as long as one of them is an Image or File field.

See the [Using Summary and Thumbnail](#using-summary-and-thumbnail) example below for details.

##### `collapsed`

- **Type**: `boolean` or `auto`
- **Default**: `false`

Whether each item is initially collapsed in the UI. If set to `auto`, the UI is collapsed if an item has any filled subfields and expanded if all the subfields are empty.

##### `minimize_collapsed`

- **Type**: `boolean` or `auto`
- **Default**: `false`

Whether the entire list is minimized when collapsed. If set to `auto`, the list is minimized if any item has any filled subfields and expanded if all items are empty.

##### `allow_add`

- **Type**: `boolean`
- **Default**: `true`

Whether to allow adding new items to the list. If set to `false`, the Add and Paste Item buttons will be hidden, and so will the options to paste, duplicate or add an item in the item menu. Only the Copy option is left. Restore Default is also disabled for the field, as it could add items.

##### `allow_remove`

- **Type**: `boolean`
- **Default**: `true`

Whether to allow removing items from the list. If set to `false`, the Remove button will be hidden, and so will the Paste to Replace option in the item menu. Clear and Restore Default are also disabled for the field, as they could remove items. The Clear All option in the pane and editor menus leaves the list as it is.

##### `allow_duplicate`

- **Type**: `boolean`
- **Default**: `true`

Whether to allow duplicating items in the list. If set to `false`, the Duplicate button will be hidden.

##### `allow_reorder`

- **Type**: `boolean`
- **Default**: `true`

Whether to allow reordering of items in the list. Items can be reordered in these ways:

- with the Move Up and Move Down buttons in each item’s header
- by dragging the handle
- with the keyboard while the handle is focused
- by selecting Move to Top, Move to Bottom or Move to… in the menu

In a simple list field, the Move Up and Move Down buttons are shown in place of the handle on a touch screen only. If set to `false`, the reorder controls will be hidden.

##### `add_to_top`

- **Type**: `boolean`
- **Default**: `false`

Whether to add new items to the top of the list instead of the bottom. If set to `true`, the Add and Paste Item buttons will appear at the top of the list.

##### `typeKey`

- **Type**: `string`
- **Default**: `type`

This option is effective only when the `types` option is used. It allows you to customize the name of the field that indicates the type of each item in the list. See the [Variable Type](#variable-type-with-custom-type-key) example below for details.

You cannot use a key that conflicts with any of the subfield names defined in the object.

**Tip**

Unlike most other config options, `typeKey` is camelCased.

##### `map_key_field`

- **Type**: `string`
- **Default**: `""`

The name of the subfield whose value becomes the key of each item. With this option, the list is stored as an object mapping the keys to the items, rather than as an array. The subfield itself is left out of each item.

This option requires the `fields` or `types` option. Using it without them, or naming a subfield that doesn’t exist, is reported as a config validation error on the login screen.

This is useful for editing a file format where each item has a unique key, like a [Hayagriva](https://github.com/typst/hayagriva/blob/main/docs/file-format.md) bibliography or a map of translations.

For example, with `map_key_field: key`, a list with the items `{ key: harry, title: Harry Potter }` and `{ key: darwin, title: On the Origin of Species }` is stored as:

```yaml
harry:
  title: Harry Potter
darwin:
  title: On the Origin of Species
```

In the editor, the key is a regular subfield. It can be placed anywhere among the subfields, used in the [`summary`](#summary) template and given a [`hint`](https://sveltiacms.app/en/docs/fields#hint), or a [`pattern`](https://sveltiacms.app/en/docs/fields#pattern) if it’s a String field. The items are kept in the order of the object, and reordering them changes the order of the keys.

The key can also be picked from a list instead of typed:

- Use a [Relation](https://sveltiacms.app/en/docs/fields/relation) field to key the items by entries in another collection, such as page slugs. An entry used as a key can’t be deleted until the item is removed or given another key, as the item can’t be saved without a key.
- Use a [Select](https://sveltiacms.app/en/docs/fields/select) field to key them by a fixed set of values, such as sizes or languages.

See the [Keyed List with Picked Keys](#keyed-list-with-picked-keys) example below.

The following rules apply. A configuration that breaks one of the first four is reported as a config validation error, and a key that breaks one of the last two is shown as a validation error in the editor:

- The subfield must be a [String](https://sveltiacms.app/en/docs/fields/string), [Relation](https://sveltiacms.app/en/docs/fields/relation) or [Select](https://sveltiacms.app/en/docs/fields/select) field. With `types`, every variable type must have it, but each type can use a different field type for it.
- A Relation or Select field can’t have the `multiple` option, as each item needs a single key. A Select field’s option values must be strings, as the keys are always stored as strings.
- The subfield must be required, so it can’t have the `required` option set to `false` or to a list of locales.
- The subfield can’t have `i18n: false`, as the items need a key in every locale. Use `i18n: duplicate` to share the keys across locales.
- Each key must be unique within the list.
- A key can’t be a whole number such as `1` or `2024`. JavaScript moves such keys in an object to the front in ascending order, so the items wouldn’t keep their order. A key like `01`, `-1` or `2024a` is fine. A file that already has such a key is loaded, but it has to be renamed before the entry can be saved.

A list still stored as an array, e.g. one saved before the option was added, is loaded as is, and saved as an object the next time the entry is saved.

The option works with [`root`](#root), which stores the object at the top level of the file. See the [Keyed List](#keyed-list) example below for details.

### Examples

#### Simple List

Configuration example:

```yaml [YAML]
- name: tags
  label: Tags
  widget: list
```

```toml [TOML]
[[fields]]
name = "tags"
label = "Tags"
widget = "list"
```

```json [JSON]
{
  "name": "tags",
  "label": "Tags",
  "widget": "list"
}
```

```js [JavaScript]
{
  name: "tags",
  label: "Tags",
  widget: "list",
}
```

Output example:

```yaml [YAML]
tags:
  - travel
  - photography
  - food
```

```toml [TOML]
tags = ["travel", "photography", "food"]
```

```json [JSON]
{
  "tags": ["travel", "photography", "food"]
}
```

#### Single Subfield

Configuration example:

```yaml [YAML]
- name: authors
  label: Authors
  widget: list
  field:
    name: author
    label: Author
    widget: string
```

```toml [TOML]
[[fields]]
name = "authors"
label = "Authors"
widget = "list"
[field]
name = "author"
label = "Author"
widget = "string"
```

```json [JSON]
{
  "name": "authors",
  "label": "Authors",
  "widget": "list",
  "field": {
    "name": "author",
    "label": "Author",
    "widget": "string"
  }
}
```

```js [JavaScript]
{
  name: "authors",
  label: "Authors",
  widget: "list",
  field: {
    name: "author",
    label: "Author",
    widget: "string",
  },
}
```

Output example:

```yaml [YAML]
authors:
  - Alice
  - Bob
  - Charlie
```

```toml [TOML]
authors = ["Alice", "Bob", "Charlie"]
```

```json [JSON]
{
  "authors": ["Alice", "Bob", "Charlie"]
}
```

Note that the `name` of the subfield will not appear in the output; only the values will be included in the list, just like a simple list.

#### Multiple Subfields

Configuration example:

```yaml [YAML]
- name: team_members
  label: Team Members
  widget: list
  fields:
    - name: name
      label: Name
      widget: string
    - name: role
      label: Role
      widget: string
```

```toml [TOML]
[[fields]]
name = "team_members"
label = "Team Members"
widget = "list"
[[fields.fields]]
name = "name"
label = "Name"
widget = "string"
[[fields.fields]]
name = "role"
label = "Role"
widget = "string"
```

```json [JSON]
{
  "name": "team_members",
  "label": "Team Members",
  "widget": "list",
  "fields": [
    {
      "name": "name",
      "label": "Name",
      "widget": "string"
    },
    {
      "name": "role",
      "label": "Role",
      "widget": "string"
    }
  ]
}
```

```js [JavaScript]
{
  name: "team_members",
  label: "Team Members",
  widget: "list",
  fields: [
    {
      name: "name",
      label: "Name",
      widget: "string",
    },
    {
      name: "role",
      label: "Role",
      widget: "string",
    },
  ],
}
```

Output example:

```yaml [YAML]
team_members:
  - name: Alice
    role: Developer
  - name: Bob
    role: Designer
  - name: Charlie
    role: Product Manager
```

```toml [TOML]
[[team_members]]
name = "Alice"
role = "Developer"

[[team_members]]
name = "Bob"
role = "Designer"

[[team_members]]
name = "Charlie"
role = "Product Manager"
```

```json [JSON]
{
  "team_members": [
    {
      "name": "Alice",
      "role": "Developer"
    },
    {
      "name": "Bob",
      "role": "Designer"
    },
    {
      "name": "Charlie",
      "role": "Product Manager"
    }
  ]
}
```

#### Using Summary and Thumbnail

Configuration example:

```yaml [YAML]
- name: projects
  label: Projects
  widget: list
  summary: "{{name}} - {{status}}"
  thumbnail: "image"
  fields:
    - name: name
      label: Name
      widget: string
    - name: status
      label: Status
      widget: string
    - name: image
      label: Image
      widget: image
```

```toml [TOML]
[[fields]]
name = "projects"
label = "Projects"
widget = "list"
summary = "{{name}} - {{status}}"
thumbnail = "image"
[[fields.fields]]
name = "name"
label = "Name"
widget = "string"
[[fields.fields]]
name = "status"
label = "Status"
widget = "string"
[[fields.fields]]
name = "image"
label = "Image"
widget = "image"
```

```json [JSON]
{
  "name": "projects",
  "label": "Projects",
  "widget": "list",
  "summary": "{{name}} - {{status}}",
  "thumbnail": "image",
  "fields": [
    {
      "name": "name",
      "label": "Name",
      "widget": "string"
    },
    {
      "name": "status",
      "label": "Status",
      "widget": "string"
    },
    {
      "name": "image",
      "label": "Image",
      "widget": "image"
    }
  ]
}
```

```js [JavaScript]
{
  name: "projects",
  label: "Projects",
  widget: "list",
  summary: "{{name}} - {{status}}",
  thumbnail: "image",
  fields: [
    {
      name: "name",
      label: "Name",
      widget: "string",
    },
    {
      name: "status",
      label: "Status",
      widget: "string",
    },
    {
      name: "image",
      label: "Image",
      widget: "image",
    },
  ],
}
```

#### Variable Type

The following example defines a variable type List field named `items` with two types: `text_item` and `image_item`. Users can add either type of item to the list. These types can be mixed in any order. Each type’s `description` is shown in the Add button’s dropdown menu, and the `hint` of the `image_item` type is shown above its subfields.

```yaml [YAML]
- name: items
  label: Items
  widget: list
  types:
    - name: text_item
      label: Text Item
      description: A paragraph of text
      fields:
        - name: text
          label: Text
          widget: string
    - name: image_item
      label: Image Item
      description: An image with a caption
      hint: Use a **landscape** image.
      fields:
        - name: url
          label: Image URL
          widget: image
        - name: caption
          label: Caption
          widget: string
```

```toml [TOML]
[[fields]]
name = "items"
label = "Items"
widget = "list"
[[fields.types]]
label = "Text Item"
name = "text_item"
description = "A paragraph of text"
[[fields.types.fields]]
name = "text"
label = "Text"
widget = "string"
[[fields.types]]
label = "Image Item"
name = "image_item"
description = "An image with a caption"
hint = "Use a **landscape** image."
[[fields.types.fields]]
name = "url"
label = "Image URL"
widget = "image"
[[fields.types.fields]]
name = "caption"
label = "Caption"
widget = "string"
```

```json [JSON]
{
  "name": "items",
  "label": "Items",
  "widget": "list",
  "types": [
    {
      "label": "Text Item",
      "name": "text_item",
      "description": "A paragraph of text",
      "fields": [
        {
          "name": "text",
          "label": "Text",
          "widget": "string"
        }
      ]
    },
    {
      "label": "Image Item",
      "name": "image_item",
      "description": "An image with a caption",
      "hint": "Use a **landscape** image.",
      "fields": [
        {
          "name": "url",
          "label": "Image URL",
          "widget": "image"
        },
        {
          "name": "caption",
          "label": "Caption",
          "widget": "string"
        }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  name: "items",
  label: "Items",
  widget: "list",
  types: [
    {
      label: "Text Item",
      name: "text_item",
      description: "A paragraph of text",
      fields: [
        {
          name: "text",
          label: "Text",
          widget: "string",
        },
      ],
    },
    {
      label: "Image Item",
      name: "image_item",
      description: "An image with a caption",
      hint: "Use a **landscape** image.",
      fields: [
        {
          name: "url",
          label: "Image URL",
          widget: "image",
        },
        {
          name: "caption",
          label: "Caption",
          widget: "string",
        },
      ],
    },
  ],
}
```

Output example:

```yaml [YAML]
items:
  - type: text_item
    text: This is a text item.
  - type: image_item
    url: https://example.com/image.jpg
    caption: An example image.
  - type: text_item
    text: Another text item.
```

```toml [TOML]
[[items]]
type = "text_item"
text = "This is a text item."

[[items]]
type = "image_item"
url = "https://example.com/image.jpg"
caption = "An example image."

[[items]]
type = "text_item"
text = "Another text item."
```

```json [JSON]
{
  "items": [
    {
      "type": "text_item",
      "text": "This is a text item."
    },
    {
      "type": "image_item",
      "url": "https://example.com/image.jpg",
      "caption": "An example image."
    },
    {
      "type": "text_item",
      "text": "Another text item."
    }
  ]
}
```

#### Variable Type with Nested List

The following example defines a variable type List field named `sections` with two types: `text_section` and `image_gallery`. The `image_gallery` type contains a nested List field for multiple images.

**Tip**

You cannot have a List field directly under the `types` option; it must be nested within a type Object field, as shown in this example.

```yaml [YAML]
- name: sections
  label: Sections
  widget: list
  types:
    - name: text_section
      label: Text Section
      fields:
        - name: heading
          label: Heading
          widget: string
        - name: body
          label: Body
          widget: text
    - name: image_gallery
      label: Image Gallery
      fields:
        - name: title
          label: Title
          widget: string
        - name: images
          label: Images
          widget: list
          fields:
            - name: src
              label: Image URL
              widget: image
            - name: alt
              label: Alt Text
              widget: string
```

```toml [TOML]
[[fields]]
name = "sections"
label = "Sections"
widget = "list"
[[fields.types]]
name = "text_section"
label = "Text Section"
[[fields.types.fields]]
name = "heading"
label = "Heading"
widget = "string"
[[fields.types.fields]]
name = "body"
label = "Body"
widget = "text"
[[fields.types]]
name = "image_gallery"
label = "Image Gallery"
[[fields.types.fields]]
name = "title"
label = "Title"
widget = "string"
[[fields.types.fields]]
name = "images"
label = "Images"
widget = "list"
[[fields.types.fields.fields]]
name = "src"
label = "Image URL"
widget = "image"
[[fields.types.fields.fields]]
name = "alt"
label = "Alt Text"
widget = "string"
```

```json [JSON]
{
  "name": "sections",
  "label": "Sections",
  "widget": "list",
  "types": [
    {
      "name": "text_section",
      "label": "Text Section",
      "fields": [
        {
          "name": "heading",
          "label": "Heading",
          "widget": "string"
        },
        {
          "name": "body",
          "label": "Body",
          "widget": "text"
        }
      ]
    },
    {
      "name": "image_gallery",
      "label": "Image Gallery",
      "fields": [
        {
          "name": "title",
          "label": "Title",
          "widget": "string"
        },
        {
          "name": "images",
          "label": "Images",
          "widget": "list",
          "fields": [
            {
              "name": "src",
              "label": "Image URL",
              "widget": "image"
            },
            {
              "name": "alt",
              "label": "Alt Text",
              "widget": "string"
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
  name: "sections",
  label: "Sections",
  widget: "list",
  types: [
    {
      name: "text_section",
      label: "Text Section",
      fields: [
        {
          name: "heading",
          label: "Heading",
          widget: "string",
        },
        {
          name: "body",
          label: "Body",
          widget: "text",
        },
      ],
    },
    {
      name: "image_gallery",
      label: "Image Gallery",
      fields: [
        {
          name: "title",
          label: "Title",
          widget: "string",
        },
        {
          name: "images",
          label: "Images",
          widget: "list",
          fields: [
            {
              name: "src",
              label: "Image URL",
              widget: "image",
            },
            {
              name: "alt",
              label: "Alt Text",
              widget: "string",
            },
          ],
        },
      ],
    },
  ],
}
```

Output example:

```yaml [YAML]
sections:
  - type: text_section
    heading: Welcome to Our Site
    body: This is the first section of our site.
  - type: image_gallery
    title: Our Gallery
    images:
      - src: https://example.com/image1.jpg
        alt: Image 1
      - src: https://example.com/image2.jpg
        alt: Image 2
```

```toml [TOML]
[[sections]]
type = "text_section"
heading = "Welcome to Our Site"
body = "This is the first section of our site."
[[sections]]
type = "image_gallery"
title = "Our Gallery"
[[sections.images]]
src = "https://example.com/image1.jpg"
alt = "Image 1"
[[sections.images]]
src = "https://example.com/image2.jpg"
alt = "Image 2"
```

```json [JSON]
{
  "sections": [
    {
      "type": "text_section",
      "heading": "Welcome to Our Site",
      "body": "This is the first section of our site."
    },
    {
      "type": "image_gallery",
      "title": "Our Gallery",
      "images": [
        {
          "src": "https://example.com/image1.jpg",
          "alt": "Image 1"
        },
        {
          "src": "https://example.com/image2.jpg",
          "alt": "Image 2"
        }
      ]
    }
  ]
}
```

#### Variable Type with Custom Type Key

By default, the type field is named `type`, but you can customize it using the `typeKey` option. Also, the `fields` option can be omitted if a type has no subfields.

The following example shows a simple page builder configuration with three block types: Heading, Paragraph and Horizontal Rule.

```yaml [YAML]
- name: blocks
  label: Blocks
  widget: list
  typeKey: tag
  types:
    - name: h2
      label: Heading
      fields:
        - name: text
          label: Text
          widget: string
    - name: p
      label: Paragraph
      fields:
        - name: text
          label: Text
          widget: string
    - name: hr
      label: Horizontal Rule
```

```toml [TOML]
[[fields]]
name = "blocks"
label = "Blocks"
widget = "list"
typeKey = "tag"
[[fields.types]]
name = "h2"
label = "Heading"
[[fields.types.fields]]
name = "text"
label = "Text"
widget = "string"
[[fields.types]]
name = "p"
label = "Paragraph"
[[fields.types.fields]]
name = "text"
label = "Text"
widget = "string"
[[fields.types]]
name = "hr"
label = "Horizontal Rule"
```

```json [JSON]
{
  "name": "blocks",
  "label": "Blocks",
  "widget": "list",
  "typeKey": "tag",
  "types": [
    {
      "name": "h2",
      "label": "Heading",
      "fields": [
        {
          "name": "text",
          "label": "Text",
          "widget": "string"
        }
      ]
    },
    {
      "name": "p",
      "label": "Paragraph",
      "fields": [
        {
          "name": "text",
          "label": "Text",
          "widget": "string"
        }
      ]
    },
    {
      "name": "hr",
      "label": "Horizontal Rule"
    }
  ]
}
```

```js [JavaScript]
{
  name: "blocks",
  label: "Blocks",
  widget: "list",
  typeKey: "tag",
  types: [
    {
      name: "h2",
      label: "Heading",
      fields: [
        {
          name: "text",
          label: "Text",
          widget: "string",
        },
      ],
    },
    {
      name: "p",
      label: "Paragraph",
      fields: [
        {
          name: "text",
          label: "Text",
          widget: "string",
        },
      ],
    },
    {
      name: "hr",
      label: "Horizontal Rule",
    },
  ],
}
```

Output example:

```yaml [YAML]
blocks:
  - tag: h2
    text: Welcome to Our Site
  - tag: p
    text: This is the first paragraph of the site.
  - tag: hr
  - tag: p
    text: This is another paragraph after the horizontal rule.
```

```toml [TOML]
[[blocks]]
tag = "h2"
text = "Welcome to Our Site"
[[blocks]]
tag = "p"
text = "This is the first paragraph of the site."
[[blocks]]
tag = "hr"
[[blocks]]
tag = "p"
text = "This is another paragraph after the horizontal rule."
```

```json [JSON]
{
  "blocks": [
    {
      "tag": "h2",
      "text": "Welcome to Our Site"
    },
    {
      "tag": "p",
      "text": "This is the first paragraph of the site."
    },
    {
      "tag": "hr"
    },
    {
      "tag": "p",
      "text": "This is another paragraph after the horizontal rule."
    }
  ]
}
```

#### Top-Level List

It’s possible to define a List field at the top level of an output file, using the `root` option. The configuration below reproduces [this Jekyll data file example](https://jekyllrb.com/docs/datafiles/#example-list-of-members):

```yaml [YAML]
collections:
  - name: data
    label: Data Files
    files:
      - name: members
        label: Member List
        file: _data/members.yml # or members.json
        icon: group
        fields:
          - name: members
            label: Members
            label_singular: Member
            widget: list
            root: true
            fields:
              - name: name
                label: Name
              - name: github
                label: GitHub account
```

```toml [TOML]
[[collections]]
name = "data"
label = "Data Files"
[[collections.files]]
name = "members"
label = "Member List"
file = "_data/members.yml"
icon = "group"
[[collections.files.fields]]
name = "members"
label = "Members"
label_singular = "Member"
widget = "list"
root = true
[[collections.files.fields.fields]]
name = "name"
label = "Name"
[[collections.files.fields.fields]]
name = "github"
label = "GitHub account"
```

```json [JSON]
{
  "collections": [
    {
      "name": "data",
      "label": "Data Files",
      "files": [
        {
          "name": "members",
          "label": "Member List",
          "file": "_data/members.yml",
          "icon": "group",
          "fields": [
            {
              "name": "members",
              "label": "Members",
              "label_singular": "Member",
              "widget": "list",
              "root": true,
              "fields": [
                {
                  "name": "name",
                  "label": "Name"
                },
                {
                  "name": "github",
                  "label": "GitHub account"
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
      name: "data",
      label: "Data Files",
      files: [
        {
          name: "members",
          label: "Member List",
          file: "_data/members.yml",
          icon: "group",
          fields: [
            {
              name: "members",
              label: "Members",
              label_singular: "Member",
              widget: "list",
              root: true,
              fields: [
                {
                  name: "name",
                  label: "Name",
                },
                {
                  name: "github",
                  label: "GitHub account",
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

It also works with a [singleton](https://sveltiacms.app/en/docs/collections/singletons). The configuration below reproduces the same data file example using a singleton:

```yaml [YAML]
singletons:
  - name: members
    label: Member List
    file: _data/members.yml # or members.json
    icon: group
    fields:
      - name: members
        label: Members
        label_singular: Member
        widget: list
        root: true
        fields:
          - name: name
            label: Name
          - name: github
            label: GitHub account
```

```toml [TOML]
[[singletons]]
name = "members"
label = "Member List"
file = "_data/members.yml"
icon = "group"
[[singletons.fields]]
name = "members"
label = "Members"
label_singular = "Member"
widget = "list"
root = true
[[singletons.fields.fields]]
name = "name"
label = "Name"
[[singletons.fields.fields]]
name = "github"
label = "GitHub account"
```

```json [JSON]
{
  "singletons": [
    {
      "name": "members",
      "label": "Member List",
      "file": "_data/members.yml",
      "icon": "group",
      "fields": [
        {
          "name": "members",
          "label": "Members",
          "label_singular": "Member",
          "widget": "list",
          "root": true,
          "fields": [
            {
              "name": "name",
              "label": "Name"
            },
            {
              "name": "github",
              "label": "GitHub account"
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
  singletons: [
    {
      name: "members",
      label: "Member List",
      file: "_data/members.yml",
      icon: "group",
      fields: [
        {
          name: "members",
          label: "Members",
          label_singular: "Member",
          widget: "list",
          root: true,
          fields: [
            {
              name: "name",
              label: "Name",
            },
            {
              name: "github",
              label: "GitHub account",
            },
          ],
        },
      ],
    },
  ],
}
```

Output example:

```yaml [YAML]
- name: Alice
  github: alicehub123
- name: Bob
  github: bobgit456
- name: Charlie
  github: charliecode789
```

```json [JSON]
[
  {
    "name": "Alice",
    "github": "alicehub123"
  },
  {
    "name": "Bob",
    "github": "bobgit456"
  },
  {
    "name": "Charlie",
    "github": "charliecode789"
  }
]
```

As you can see, the list is stored directly at the root level of the output file, without a parent key (`members`). We don’t have a TOML example here because TOML format cannot represent top-level arrays; thus, the `root` option is ignored for TOML files, unless the list is stored as an object with the [`map_key_field`](#map-key-field) option, as in the [Keyed List](#keyed-list) example below.

#### Keyed List

A list can be stored as an object mapping the key of each item to the item, using the [`map_key_field`](#map-key-field) option. The configuration below edits a [Hayagriva](https://github.com/typst/hayagriva/blob/main/docs/file-format.md) bibliography file, which maps a citation key to each reference, with the `root` option to store the object at the top level of the file:

```yaml [YAML]
collections:
  - name: data
    label: Data Files
    files:
      - name: bibliography
        label: Bibliography
        file: refs.yml
        icon: menu_book
        fields:
          - name: references
            label: References
            label_singular: Reference
            widget: list
            root: true
            map_key_field: key
            summary: '{{key}}: {{title}}'
            fields:
              - name: key
                label: Citation Key
                pattern: ['^[\w-]+$', 'Use letters, digits, hyphens and underscores only']
              - name: type
                label: Type
                widget: select
                options: [Article, Book, Web]
              - name: title
                label: Title
              - name: author
                label: Author
                required: false
```

```toml [TOML]
[[collections]]
name = "data"
label = "Data Files"
[[collections.files]]
name = "bibliography"
label = "Bibliography"
file = "refs.yml"
icon = "menu_book"
[[collections.files.fields]]
name = "references"
label = "References"
label_singular = "Reference"
widget = "list"
root = true
map_key_field = "key"
summary = "{{key}}: {{title}}"
[[collections.files.fields.fields]]
name = "key"
label = "Citation Key"
pattern = ['^[\w-]+$', "Use letters, digits, hyphens and underscores only"]
[[collections.files.fields.fields]]
name = "type"
label = "Type"
widget = "select"
options = ["Article", "Book", "Web"]
[[collections.files.fields.fields]]
name = "title"
label = "Title"
[[collections.files.fields.fields]]
name = "author"
label = "Author"
required = false
```

```json [JSON]
{
  "collections": [
    {
      "name": "data",
      "label": "Data Files",
      "files": [
        {
          "name": "bibliography",
          "label": "Bibliography",
          "file": "refs.yml",
          "icon": "menu_book",
          "fields": [
            {
              "name": "references",
              "label": "References",
              "label_singular": "Reference",
              "widget": "list",
              "root": true,
              "map_key_field": "key",
              "summary": "{{key}}: {{title}}",
              "fields": [
                {
                  "name": "key",
                  "label": "Citation Key",
                  "pattern": ["^[\\w-]+$", "Use letters, digits, hyphens and underscores only"]
                },
                {
                  "name": "type",
                  "label": "Type",
                  "widget": "select",
                  "options": ["Article", "Book", "Web"]
                },
                {
                  "name": "title",
                  "label": "Title"
                },
                {
                  "name": "author",
                  "label": "Author",
                  "required": false
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
      name: "data",
      label: "Data Files",
      files: [
        {
          name: "bibliography",
          label: "Bibliography",
          file: "refs.yml",
          icon: "menu_book",
          fields: [
            {
              name: "references",
              label: "References",
              label_singular: "Reference",
              widget: "list",
              root: true,
              map_key_field: "key",
              summary: "{{key}}: {{title}}",
              fields: [
                {
                  name: "key",
                  label: "Citation Key",
                  pattern: ["^[\\w-]+$", "Use letters, digits, hyphens and underscores only"],
                },
                {
                  name: "type",
                  label: "Type",
                  widget: "select",
                  options: ["Article", "Book", "Web"],
                },
                {
                  name: "title",
                  label: "Title",
                },
                {
                  name: "author",
                  label: "Author",
                  required: false,
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

Output example:

```yaml [YAML]
harry:
  type: Book
  title: Harry Potter and the Order of the Phoenix
  author: Rowling, J. K.
darwin:
  type: Book
  title: On the Origin of Species
  author: Darwin, Charles
```

```toml [TOML]
[harry]
type = "Book"
title = "Harry Potter and the Order of the Phoenix"
author = "Rowling, J. K."

[darwin]
type = "Book"
title = "On the Origin of Species"
author = "Darwin, Charles"
```

```json [JSON]
{
  "harry": {
    "type": "Book",
    "title": "Harry Potter and the Order of the Phoenix",
    "author": "Rowling, J. K."
  },
  "darwin": {
    "type": "Book",
    "title": "On the Origin of Species",
    "author": "Darwin, Charles"
  }
}
```

The citation keys are the keys of the object, not properties of the references. In the editor, each reference has a Citation Key field like any other subfield. Without the `root` option, the object is stored under the `references` key instead, which also works in the front matter of an entry, or in a List field nested in another field.

#### Keyed List with Picked Keys

The key of a [keyed list](#keyed-list) can be picked with a [Relation](https://sveltiacms.app/en/docs/fields/relation) or [Select](https://sveltiacms.app/en/docs/fields/select) field instead of typed. The configuration below stores settings for each page of the `pages` collection, keyed by the page slug, and a price for each size:

```yaml [YAML]
collections:
  - name: data
    label: Data Files
    files:
      - name: settings
        label: Site Settings
        file: data/settings.yml
        fields:
          - name: pages
            label: Page Settings
            widget: list
            map_key_field: page
            fields:
              - name: page
                label: Page
                widget: relation
                collection: pages
                value_field: '{{slug}}'
                search_fields: [title]
                display_fields: [title]
              - name: hero
                label: Hero Text
          - name: prices
            label: Prices
            widget: list
            map_key_field: size
            fields:
              - name: size
                label: Size
                widget: select
                options:
                  - { label: Small, value: small }
                  - { label: Large, value: large }
              - name: price
                label: Price
                widget: number
```

```toml [TOML]
[[collections]]
name = "data"
label = "Data Files"

[[collections.files]]
name = "settings"
label = "Site Settings"
file = "data/settings.yml"

[[collections.files.fields]]
name = "pages"
label = "Page Settings"
widget = "list"
map_key_field = "page"

[[collections.files.fields.fields]]
name = "page"
label = "Page"
widget = "relation"
collection = "pages"
value_field = "{{slug}}"
search_fields = ["title"]
display_fields = ["title"]

[[collections.files.fields.fields]]
name = "hero"
label = "Hero Text"

[[collections.files.fields]]
name = "prices"
label = "Prices"
widget = "list"
map_key_field = "size"

[[collections.files.fields.fields]]
name = "size"
label = "Size"
widget = "select"
options = [
  { label = "Small", value = "small" },
  { label = "Large", value = "large" },
]

[[collections.files.fields.fields]]
name = "price"
label = "Price"
widget = "number"
```

```json [JSON]
{
  "collections": [
    {
      "name": "data",
      "label": "Data Files",
      "files": [
        {
          "name": "settings",
          "label": "Site Settings",
          "file": "data/settings.yml",
          "fields": [
            {
              "name": "pages",
              "label": "Page Settings",
              "widget": "list",
              "map_key_field": "page",
              "fields": [
                {
                  "name": "page",
                  "label": "Page",
                  "widget": "relation",
                  "collection": "pages",
                  "value_field": "{{slug}}",
                  "search_fields": ["title"],
                  "display_fields": ["title"]
                },
                { "name": "hero", "label": "Hero Text" }
              ]
            },
            {
              "name": "prices",
              "label": "Prices",
              "widget": "list",
              "map_key_field": "size",
              "fields": [
                {
                  "name": "size",
                  "label": "Size",
                  "widget": "select",
                  "options": [
                    { "label": "Small", "value": "small" },
                    { "label": "Large", "value": "large" }
                  ]
                },
                { "name": "price", "label": "Price", "widget": "number" }
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
      name: "data",
      label: "Data Files",
      files: [
        {
          name: "settings",
          label: "Site Settings",
          file: "data/settings.yml",
          fields: [
            {
              name: "pages",
              label: "Page Settings",
              widget: "list",
              map_key_field: "page",
              fields: [
                {
                  name: "page",
                  label: "Page",
                  widget: "relation",
                  collection: "pages",
                  value_field: "{{slug}}",
                  search_fields: ["title"],
                  display_fields: ["title"],
                },
                { name: "hero", label: "Hero Text" },
              ],
            },
            {
              name: "prices",
              label: "Prices",
              widget: "list",
              map_key_field: "size",
              fields: [
                {
                  name: "size",
                  label: "Size",
                  widget: "select",
                  options: [
                    { label: "Small", value: "small" },
                    { label: "Large", value: "large" },
                  ],
                },
                { name: "price", label: "Price", widget: "number" },
              ],
            },
          ],
        },
      ],
    },
  ],
}
```

Output example:

```yaml
pages:
  home:
    hero: Welcome!
  about:
    hero: Who we are
prices:
  small:
    price: 10
  large:
    price: 15
```

Each item shows a dropdown to pick the page or size. Picking the same page or size for two items is shown as a validation error.

#### Default Values

The shape of the [`default`](#default) option follows the shape of the list. A simple list takes an array of strings:

```yaml [YAML]
- name: tags
  label: Tags
  widget: list
  default: [travel, photography]
```

```toml [TOML]
[[fields]]
name = "tags"
label = "Tags"
widget = "list"
default = ["travel", "photography"]
```

```json [JSON]
{
  "name": "tags",
  "label": "Tags",
  "widget": "list",
  "default": ["travel", "photography"]
}
```

```js [JavaScript]
{
  name: "tags",
  label: "Tags",
  widget: "list",
  default: ["travel", "photography"],
}
```

A list with a single `field` takes an array of values for that subfield — here, objects for a [KeyValue](https://sveltiacms.app/en/docs/fields/keyvalue) subfield:

```yaml [YAML]
- name: attributes
  label: Attributes
  widget: list
  field:
    name: attribute
    label: Attribute
    widget: keyvalue
  default:
    - { color: red, size: large }
    - { color: blue, size: small }
```

```toml [TOML]
[[fields]]
name = "attributes"
label = "Attributes"
widget = "list"
default = [{ color = "red", size = "large" }, { color = "blue", size = "small" }]

[fields.field]
name = "attribute"
label = "Attribute"
widget = "keyvalue"
```

```json [JSON]
{
  "name": "attributes",
  "label": "Attributes",
  "widget": "list",
  "field": {
    "name": "attribute",
    "label": "Attribute",
    "widget": "keyvalue"
  },
  "default": [
    { "color": "red", "size": "large" },
    { "color": "blue", "size": "small" }
  ]
}
```

```js [JavaScript]
{
  name: "attributes",
  label: "Attributes",
  widget: "list",
  field: {
    name: "attribute",
    label: "Attribute",
    widget: "keyvalue",
  },
  default: [
    { color: "red", size: "large" },
    { color: "blue", size: "small" },
  ],
}
```

A list with `fields` takes an array of objects whose keys are the subfield names. A subfield left out of an item gets its own `default`, if any, or is left empty, just like an item added in the editor — so `external` is `false` for the first link below:

```yaml [YAML]
- name: links
  label: Links
  widget: list
  fields:
    - name: label
      label: Label
      widget: string
    - name: url
      label: URL
      widget: string
    - name: external
      label: External
      widget: boolean
      default: false
  default:
    - label: Home
      url: /
    - label: GitHub
      url: https://github.com/
      external: true
```

```toml [TOML]
[[fields]]
name = "links"
label = "Links"
widget = "list"
default = [
  { label = "Home", url = "/" },
  { label = "GitHub", url = "https://github.com/", external = true },
]

[[fields.fields]]
name = "label"
label = "Label"
widget = "string"

[[fields.fields]]
name = "url"
label = "URL"
widget = "string"

[[fields.fields]]
name = "external"
label = "External"
widget = "boolean"
default = false
```

```json [JSON]
{
  "name": "links",
  "label": "Links",
  "widget": "list",
  "fields": [
    { "name": "label", "label": "Label", "widget": "string" },
    { "name": "url", "label": "URL", "widget": "string" },
    { "name": "external", "label": "External", "widget": "boolean", "default": false }
  ],
  "default": [
    { "label": "Home", "url": "/" },
    { "label": "GitHub", "url": "https://github.com/", "external": true }
  ]
}
```

```js [JavaScript]
{
  name: "links",
  label: "Links",
  widget: "list",
  fields: [
    { name: "label", label: "Label", widget: "string" },
    { name: "url", label: "URL", widget: "string" },
    { name: "external", label: "External", widget: "boolean", default: false },
  ],
  default: [
    { label: "Home", url: "/" },
    { label: "GitHub", url: "https://github.com/", external: true },
  ],
}
```

A list with `types` takes an array of objects, each naming its variable type with the [`typeKey`](#typekey) property — `type` unless configured otherwise — alongside the subfields of that type. The subfields of that type left out of an item are filled in the same way:

```yaml [YAML]
- name: sections
  label: Sections
  widget: list
  types:
    - name: heading
      label: Heading
      fields:
        - name: text
          label: Text
          widget: string
    - name: paragraph
      label: Paragraph
      fields:
        - name: body
          label: Body
          widget: markdown
  default:
    - type: heading
      text: Introduction
    - type: paragraph
```

```toml [TOML]
[[fields]]
name = "sections"
label = "Sections"
widget = "list"
default = [{ type = "heading", text = "Introduction" }, { type = "paragraph" }]

[[fields.types]]
name = "heading"
label = "Heading"

[[fields.types.fields]]
name = "text"
label = "Text"
widget = "string"

[[fields.types]]
name = "paragraph"
label = "Paragraph"

[[fields.types.fields]]
name = "body"
label = "Body"
widget = "markdown"
```

```json [JSON]
{
  "name": "sections",
  "label": "Sections",
  "widget": "list",
  "types": [
    {
      "name": "heading",
      "label": "Heading",
      "fields": [{ "name": "text", "label": "Text", "widget": "string" }]
    },
    {
      "name": "paragraph",
      "label": "Paragraph",
      "fields": [{ "name": "body", "label": "Body", "widget": "markdown" }]
    }
  ],
  "default": [{ "type": "heading", "text": "Introduction" }, { "type": "paragraph" }]
}
```

```js [JavaScript]
{
  name: "sections",
  label: "Sections",
  widget: "list",
  types: [
    {
      name: "heading",
      label: "Heading",
      fields: [{ name: "text", label: "Text", widget: "string" }],
    },
    {
      name: "paragraph",
      label: "Paragraph",
      fields: [{ name: "body", label: "Body", widget: "markdown" }],
    },
  ],
  default: [{ type: "heading", text: "Introduction" }, { type: "paragraph" }],
}
```

Each of the following would be reported as a config validation error on the login screen, because the item would otherwise be silently dropped or saved to the entry as-is:

```yaml
# An object in a simple list
- name: tags
  widget: list
  default: [{ name: travel }]

# A plain value in a list with `fields`
- name: links
  widget: list
  fields: [{ name: label }, { name: url }]
  default: [Home]

# A property that isn’t a subfield name
- name: links
  widget: list
  fields: [{ name: label }, { name: url }]
  default: [{ label: Home, href: / }]

# A type name that isn’t one of the `types`
- name: sections
  widget: list
  types: [{ name: heading }, { name: paragraph }]
  default: [{ type: title }]
```

Source: https://sveltiacms.app/en/docs/fields/list
