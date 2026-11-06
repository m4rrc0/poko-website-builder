# Field Types: Object and KeyValue

The Object and KeyValue field types that group or map values. For the List field type, see `fields-list.md`. For rich text and code editing, see `fields-richtext.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Object Field

The Object field type allows users to create and manage nested objects within the CMS entry form. It provides a structured way to group related fields together.

### User Interface

#### Editor

The Object field type has two different UI modes, depending on the configuration. You can have conditional subfields using either the `fields` option or the `types` option.

- With the `fields` option: A group of subfield editors is shown within a collapsible section. If `required` is set to `false`, a checkbox to add or remove the object is displayed.
- With the `types` option: A type selector is shown, along with the corresponding subfield editors for the selected type. This configuration is called a **variable type** object. It’s useful for creating flexible content structures like page builders.

When an optional object is removed with its checkbox, or a variable type object with its Remove button, a notice with a Restore button is shown in its place. Restore brings back the subfield values as they were, in every locale they were removed from. Adding the object again discards the removed values.

#### Preview

A read-only view of the object’s content, displaying the values of its nested fields in a structured format.

### Data Type

An object containing nested fields as defined in the configuration.

If the `required` option is set to `false` and subfields are not added, the value will be `null`.

### Data Validation

- If the `required` option is set to `true`, the object must not be `null` (i.e. a type must be selected if using variable types).

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the Object field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `object` to use the Object field type.

##### `fields`

- **Type**: `array` of [field definitions](https://sveltiacms.app/en/docs/fields)

Either `fields` or `types` must be provided. You cannot use both options simultaneously.

##### `types`

- **Type**: `array` of variable type definitions

Either `fields` or `types` must be provided. You cannot use both options simultaneously.

Each type definition is an object with the following properties:

- `name` (string, required): The unique identifier for the type.
- `label` (string, optional): The display label for the type. Defaults to `name`.
- `widget` (string, optional): The field type for this type. It must be `object` if not omitted. Another field type is reported as a config validation error on the login screen.
- `description` (string, optional): A short description of the type, displayed below its label in the Add button’s dropdown menu. Markdown is not supported.
- `hint` (string, optional): A help message displayed above the subfields of this type, like a field’s [`hint`](https://sveltiacms.app/en/docs/fields#hint). Limited Markdown formatting is supported: bold, italic, strikethrough, inline code and links. A line break can be given as `\n`. The hint is not displayed while the field is read-only.
- `summary` (string, optional): A template for the summary shown when the object of this type is collapsed. Overrides the field-level [`summary`](#summary).
- `fields` (array of field definitions, optional): The subfields for this type.

#### Optional Options

##### `default`

- **Type**: `object`
- **Default**: `{}`

The default value for the object field: an object whose keys are the subfield names. For an object with `types`, it must also include the [`typeKey`](#typekey) property (`type` by default) to identify the variable type, and its other keys are the names of that type’s subfields.

The default doesn’t have to cover every subfield. A subfield it leaves out gets its own `default` value, if any, just like in a new List item.

A property that isn’t a subfield name, a missing type key or a type name that isn’t one of the `types` is reported as a config validation error on the login screen, because it would otherwise be saved to the entry as-is or leave the object empty.

##### `collapsed`

- **Type**: `boolean` or `auto`
- **Default**: `false`

Whether the object field is initially collapsed in the UI. If set to `auto`, the UI is collapsed if the object has any filled subfields and expanded if all the subfields are empty.

##### `summary`

- **Type**: `string`
- **Default**: `""`

A string template used to generate a summary of the object’s content when it is collapsed in the UI. The template can include placeholders for subfield values using the syntax `{{fieldName}}`. [String transformations](https://sveltiacms.app/en/docs/string-transformations) can be applied in this option.

See the [Using Summary and Thumbnail](#using-summary-and-thumbnail) example below for details.

##### `thumbnail`

- **Type**: `string`
- **Default**: `""`

The name of an [Image](https://sveltiacms.app/en/docs/fields/image) or [File](https://sveltiacms.app/en/docs/fields/file) subfield to be used as the thumbnail of the object when it is collapsed in the UI. The thumbnail is displayed next to the summary. A File subfield holding an image, video or PDF gets a thumbnail; other kinds of files are not shown. If omitted, no thumbnail will be displayed.

A subfield of a nested object can be referenced with dot notation, e.g. `mobile.src`. Like the `summary` template tags, the name can be prefixed with `fields.`. A name that doesn’t point to an Image or File subfield is reported as a config validation error on the login screen. With `types`, a name shared by the subfields of several types is accepted as long as one of them is an Image or File field.

See the [Using Summary and Thumbnail](#using-summary-and-thumbnail) example below for details.

##### `typeKey`

- **Type**: `string`
- **Default**: `"type"`

The key used to store the selected type name in a variable type object. The default key is `type`.

You cannot use a key that conflicts with any of the subfield names defined in the object.

**Tip**

Unlike most other config options, `typeKey` is camelCased.

### Examples

#### Standard Object

The following example defines an Object field named `author` with two subfields: `name` (a string) and `bio` (a text area).

```yaml [YAML]
- name: author
  label: Author
  widget: object
  fields:
    - name: name
      label: Name
      widget: string
    - name: bio
      label: Biography
      widget: text
```

```toml [TOML]
[[fields]]
name = "author"
label = "Author"
widget = "object"

[[fields.fields]]
name = "name"
label = "Name"
widget = "string"

[[fields.fields]]
name = "bio"
label = "Biography"
widget = "text"
```

```json [JSON]
{
  "name": "author",
  "label": "Author",
  "widget": "object",
  "fields": [
    {
      "name": "name",
      "label": "Name",
      "widget": "string"
    },
    {
      "name": "bio",
      "label": "Biography",
      "widget": "text"
    }
  ]
}
```

```js [JavaScript]
{
  name: "author",
  label: "Author",
  widget: "object",
  fields: [
    {
      name: "name",
      label: "Name",
      widget: "string",
    },
    {
      name: "bio",
      label: "Biography",
      widget: "text",
    },
  ],
},
```

Output example:

```yaml [YAML]
author:
  name: Jane Doe
  bio: Jane Doe is a writer and editor with over 10 years of experience.
```

```toml [TOML]
[author]
name = "Jane Doe"
bio = "Jane Doe is a writer and editor with over 10 years of experience."
```

```json [JSON]
{
  "author": {
    "name": "Jane Doe",
    "bio": "Jane Doe is a writer and editor with over 10 years of experience."
  }
}
```

#### Nested Object

An object can contain another object as a subfield. The following example defines an Object field named `book` with a nested Object field named `publisher`.

```yaml [YAML]
- name: book
  label: Book
  widget: object
  fields:
    - name: title
      label: Title
      widget: string
    - name: publisher
      label: Publisher
      widget: object
      fields:
        - name: name
          label: Name
          widget: string
        - name: address
          label: Address
          widget: text
```

```toml [TOML]
[[fields]]
name = "book"
label = "Book"
widget = "object"
[[fields.fields]]
name = "title"
label = "Title"
widget = "string"
[[fields.fields]]
name = "publisher"
label = "Publisher"
widget = "object"
[[fields.fields.fields]]
name = "name"
label = "Name"
widget = "string"
[[fields.fields.fields]]
name = "address"
label = "Address"
widget = "text"
```

```json [JSON]
{
  "name": "book",
  "label": "Book",
  "widget": "object",
  "fields": [
    {
      "name": "title",
      "label": "Title",
      "widget": "string"
    },
    {
      "name": "publisher",
      "label": "Publisher",
      "widget": "object",
      "fields": [
        {
          "name": "name",
          "label": "Name",
          "widget": "string"
        },
        {
          "name": "address",
          "label": "Address",
          "widget": "text"
        }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  name: "book",
  label: "Book",
  widget: "object",
  fields: [
    {
      name: "title",
      label: "Title",
      widget: "string",
    },
    {
      name: "publisher",
      label: "Publisher",
      widget: "object",
      fields: [
        {
          name: "name",
          label: "Name",
          widget: "string",
        },
        {
          name: "address",
          label: "Address",
          widget: "text",
        },
      ],
    },
  ],
},
```

Output example:

```yaml [YAML]
book:
  title: The Great Gatsby
  publisher:
    name: Scribner
    address: '123 Publisher St, New York, NY'
```

```toml [TOML]
[book]
title = "The Great Gatsby"
[book.publisher]
name = "Scribner"
address = "123 Publisher St, New York, NY"
```

```json [JSON]
{
  "book": {
    "title": "The Great Gatsby",
    "publisher": {
      "name": "Scribner",
      "address": "123 Publisher St, New York, NY"
    }
  }
}
```

#### Using Summary and Thumbnail

The following example defines an Object field named `hero` that, when collapsed, shows the `heading` subfield value as the summary along with the image held by the `image` subfield.

```yaml [YAML]
- name: hero
  label: Hero
  widget: object
  summary: "{{heading}}"
  thumbnail: "image"
  fields:
    - name: heading
      label: Heading
      widget: string
    - name: image
      label: Image
      widget: image
```

```toml [TOML]
[[fields]]
name = "hero"
label = "Hero"
widget = "object"
summary = "{{heading}}"
thumbnail = "image"
[[fields.fields]]
name = "heading"
label = "Heading"
widget = "string"
[[fields.fields]]
name = "image"
label = "Image"
widget = "image"
```

```json [JSON]
{
  "name": "hero",
  "label": "Hero",
  "widget": "object",
  "summary": "{{heading}}",
  "thumbnail": "image",
  "fields": [
    {
      "name": "heading",
      "label": "Heading",
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
  name: "hero",
  label: "Hero",
  widget: "object",
  summary: "{{heading}}",
  thumbnail: "image",
  fields: [
    {
      name: "heading",
      label: "Heading",
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

The following example defines a variable type Object field named `contentBlock` with three types: `textBlock`, `imageBlock` and `placeholderBlock`. Note that the `placeholderBlock` type does not have any subfields but is still a valid type.

```yaml [YAML]
- name: contentBlock
  label: Content Block
  widget: object
  types:
    - name: textBlock
      label: Text Block
      fields:
        - name: text
          label: Text
          widget: text
    - name: imageBlock
      label: Image Block
      fields:
        - name: image
          label: Image
          widget: image
    - name: placeholderBlock
      label: Placeholder Block
```

```toml [TOML]
[[fields]]
name = "contentBlock"
label = "Content Block"
widget = "object"

[[fields.types]]
name = "textBlock"
label = "Text Block"

[[fields.types.fields]]
name = "text"
label = "Text"
widget = "text"

[[fields.types]]
name = "imageBlock"
label = "Image Block"

[[fields.types.fields]]
name = "image"
label = "Image"
widget = "image"

[[fields.types]]
name = "placeholderBlock"
label = "Placeholder Block"
```

```json [JSON]
{
  "name": "contentBlock",
  "label": "Content Block",
  "widget": "object",
  "types": [
    {
      "name": "textBlock",
      "label": "Text Block",
      "fields": [
        {
          "name": "text",
          "label": "Text",
          "widget": "text"
        }
      ]
    },
    {
      "name": "imageBlock",
      "label": "Image Block",
      "fields": [
        {
          "name": "image",
          "label": "Image",
          "widget": "image"
        }
      ]
    }
    {
      "name": "placeholderBlock",
      "label": "Placeholder Block"
    }
  ]
}
```

```js [JavaScript]
{
  name: "contentBlock",
  label: "Content Block",
  widget: "object",
  types: [
    {
      name: "textBlock",
      label: "Text Block",
      fields: [
        {
          name: "text",
          label: "Text",
          widget: "text",
        },
      ],
    },
    {
      name: "imageBlock",
      label: "Image Block",
      fields: [
        {
          name: "image",
          label: "Image",
          widget: "image",
        },
      ],
    },
    {
      name: "placeholderBlock",
      label: "Placeholder Block",
    },
  ],
},
```

The output will vary based on the selected type, which is indicated by the `type` key (customizable via the `typeKey` option). If no `fields` are defined for a type, the object will only contain the `type` key, as shown in the `placeholderBlock` example below.

Output example for a `textBlock` type:

```yaml [YAML]
contentBlock:
  type: textBlock
  text: 'This is a sample text block.'
```

```toml [TOML]
[contentBlock]
type = "textBlock"
text = "This is a sample text block."
```

```json [JSON]
{
  "contentBlock": {
    "type": "textBlock",
    "text": "This is a sample text block."
  }
}
```

Output example for an `imageBlock` type:

```yaml [YAML]
contentBlock:
  type: imageBlock
  image: /images/sample.jpg
```

```toml [TOML]
[contentBlock]
type = "imageBlock"
image = "/images/sample.jpg"
```

```json [JSON]
{
  "contentBlock": {
    "type": "imageBlock",
    "image": "/images/sample.jpg"
  }
}
```

Output example for a `placeholderBlock` type:

```yaml [YAML]
contentBlock:
  type: placeholderBlock
```

```toml [TOML]
[contentBlock]
type = "placeholderBlock"
```

```json [JSON]
{
  "contentBlock": {
    "type": "placeholderBlock"
  }
}
```

Source: https://sveltiacms.app/en/docs/fields/object

---

## KeyValue Field

The KeyValue field type allows users to create and manage a dynamic list of key-value pairs, or dictionary entries, within the CMS entry form.

### User Interface

#### Editor

A dynamic list of key-value pairs, where users can add, edit, reorder and remove entries. Each entry consists of a text input for the key and a text input for the value.

- Pressing Enter moves focus or adds a new row while editing.
- Each pair can be reordered using the drag handle at the start of its row, with the same pointer, keyboard and touch screen behavior as the [List field](https://sveltiacms.app/en/docs/fields/list#complex-list-field). When there are 3 or more pairs, a menu next to the handle offers Move to Top, Move to Bottom and Move to…. The last one asks for the position to move the pair to. The pairs are saved in the order they are shown.
- A field without pairs shows a blank row, like a [simple List field](https://sveltiacms.app/en/docs/fields/list#simple-list-field), so there’s always somewhere to type. The blank row isn’t saved until its key is filled in, and removing the last pair leaves one in its place.

#### Preview

A table displaying the current key-value pairs in a structured format for easy review.

### Data Type

An object where each key corresponds to a user-defined key and each value corresponds to the associated value.

If the `required` option is set to `false` and the field is left empty, the value will be an empty object.

### Data Validation

- If the `required` option is set to `true`, at least one key-value pair must be present. A blank pair, with neither a key nor a value, doesn’t count.
- Keys must be unique and non-empty strings. A key can contain dots (`.`), such as `example.com`; it’s saved as it is rather than being split into nested objects.
- If the `min` and/or `max` options are specified, the number of key-value pairs must be within the defined limits.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the KeyValue field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `keyvalue`.

#### Optional Options

##### `default`

- **Type**: `object`
- **Default**: `{}`

The default value for the field. It’s used when creating a new entry, and when opening an existing entry that doesn’t have the field, such as one written before the field was added to the configuration.

##### `key_label`

- **Type**: `string`
- **Default**: `"Key"` or its localized equivalent

The label for the key input field.

##### `value_label`

- **Type**: `string`
- **Default**: `"Value"` or its localized equivalent

The label for the value input field.

##### `label_singular`

- **Type**: `string`
- **Default**: The value of the `label` option

A label used for a single key-value pair, e.g. “Setting” for a field labeled “Settings”. It will be displayed on the Add button, just like the [`label_singular` option for the List field](https://sveltiacms.app/en/docs/fields/list#label-singular).

##### `min`

- **Type**: `integer`
- **Default**: `0`

The minimum number of key-value pairs required. This enables validation to ensure that users add at least this many entries.

##### `max`

- **Type**: `integer`
- **Default**: `Infinity`

The maximum number of key-value pairs allowed. This enables validation to prevent users from adding more than this many entries.

##### `root`

- **Type**: `boolean`
- **Default**: `false`

If set to `true`, the key-value pairs will be stored at the root level of the entry data instead of nested under the field name. This is similar to how the [`root` option for the List field](https://sveltiacms.app/en/docs/fields/list#root) works. The option is ignored unless the field is the only field in the collection or file.

See the [Top-Level key-value pairs](#top-level-key-value-pairs) example below for details.

##### `i18n`

- **Type**: `boolean`, `duplicate` or `duplicate_keys`
- **Default**: `false`

In addition to the [common `i18n` option values](https://sveltiacms.app/en/docs/i18n/options#field-level-configuration), the KeyValue field accepts the `duplicate_keys` value, which is useful for dictionaries whose keys are shared across locales while their values are translated:

- The keys are copied from the default locale to the other locales, where they are read-only. Keys can only be added, renamed or removed in the default locale, and any such change is immediately reflected in the other locales.
- The values can be edited separately for each locale. When a key is renamed in the default locale, the other locales keep the value they had under the old name; a newly added key starts with an empty value in the other locales.
- The order of the keys follows the default locale as well: reordering the pairs there reorders them in the other locales, which keep their own values.

See the [Translated Values with Shared Keys](#translated-values-with-shared-keys) example below for details.

### Examples

#### Basic Key-Value Field

This example demonstrates a simple KeyValue field configuration:

```yaml [YAML]
- name: settings
  label: Settings
  widget: keyvalue
```

```toml [TOML]
[[fields]]
name = "settings"
label = "Settings"
widget = "keyvalue"
```

```json [JSON]
{
  "name": "settings",
  "label": "Settings",
  "widget": "keyvalue"
}
```

```js [JavaScript]
{
  name: 'settings',
  label: 'Settings',
  widget: 'keyvalue',
}
```

Output example:

```yaml [YAML]
settings:
  theme: dark
  notifications: enabled
```

```toml [TOML]
[settings]
theme = "dark"
notifications = "enabled"
```

```json [JSON]
{
  "settings": {
    "theme": "dark",
    "notifications": "enabled"
  }
}
```

#### Translated Values with Shared Keys

This example demonstrates how to use the `duplicate_keys` i18n strategy so that the same keys are used in all locales while the values are translated. This requires i18n to be [enabled](https://sveltiacms.app/en/docs/i18n) for the collection:

```yaml [YAML]
- name: labels
  label: Labels
  widget: keyvalue
  i18n: duplicate_keys
```

```toml [TOML]
[[fields]]
name = "labels"
label = "Labels"
widget = "keyvalue"
i18n = "duplicate_keys"
```

```json [JSON]
{
  "name": "labels",
  "label": "Labels",
  "widget": "keyvalue",
  "i18n": "duplicate_keys"
}
```

```js [JavaScript]
{
  name: 'labels',
  label: 'Labels',
  widget: 'keyvalue',
  i18n: 'duplicate_keys',
}
```

Output example, with English as the default locale and the `single_file` i18n structure:

```yaml [YAML]
en:
  labels:
    submit: Submit
    cancel: Cancel
ja:
  labels:
    submit: 送信
    cancel: キャンセル
```

```toml [TOML]
[en.labels]
submit = "Submit"
cancel = "Cancel"

[ja.labels]
submit = "送信"
cancel = "キャンセル"
```

```json [JSON]
{
  "en": {
    "labels": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  },
  "ja": {
    "labels": {
      "submit": "送信",
      "cancel": "キャンセル"
    }
  }
}
```

#### Top-Level Key-Value Pairs

This example demonstrates how to use the `root` option to store key-value pairs at the root level of the entry data:

```yaml [YAML]
- name: settings
  label: Settings
  widget: keyvalue
  root: true
```

```toml [TOML]
[[fields]]
name = "settings"
label = "Settings"
widget = "keyvalue"
root = true
```

```json [JSON]
{
  "name": "settings",
  "label": "Settings",
  "widget": "keyvalue",
  "root": true
}
```

```js [JavaScript]
{
  name: 'settings',
  label: 'Settings',
  widget: 'keyvalue',
  root: true,
}
```

Output example:

```yaml [YAML]
theme: dark
notifications: enabled
```

```toml [TOML]
theme = "dark"
notifications = "enabled"
```

```json [JSON]
{
  "theme": "dark",
  "notifications": "enabled"
}
```

Source: https://sveltiacms.app/en/docs/fields/keyvalue
