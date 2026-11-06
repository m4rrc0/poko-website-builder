# Field Types: Media, Date and Map

The Image, File, DateTime and Map field types. Media field storage itself is covered in `media.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Image Field

The Image field type allows users to upload and manage images within the CMS. It’s basically an alias of the [File](https://sveltiacms.app/en/docs/fields/file) field type but limited to image files.

The `widget` property for this field type is `image`.

See the [File field documentation](https://sveltiacms.app/en/docs/fields/file) for details on the UI, data type and available options. Note that the `select_folder` option is not available for the Image field type.

### Examples

#### Standard Image Field

This example shows a basic Image field.

```yaml [YAML]
- name: image
  label: Image
  widget: image
```

```toml [TOML]
[[fields]]
name = "image"
label = "Image"
widget = "image"
```

```json [JSON]
{
  "name": "image",
  "label": "Image",
  "widget": "image"
}
```

```js [JavaScript]
{
  name: 'image',
  label: 'Image',
  widget: 'image',
}
```

Output example:

```yaml [YAML]
image: /uploads/photo.jpg
```

```toml [TOML]
image = "/uploads/photo.jpg"
```

```json [JSON]
{
  "image": "/uploads/photo.jpg"
}
```

#### Image Field with Alt Text

To include additional metadata such as alt text for accessibility, you can use an [object field](https://sveltiacms.app/en/docs/fields/object) to group the image source and alt text together.

```yaml [YAML]
- name: image
  widget: object
  fields:
    - { name: src, widget: image }
    - { name: alt, widget: string }
```

```toml [TOML]
[[fields]]
name = "image"
widget = "object"
[[fields.fields]]
name = "src"
widget = "image"
[[fields.fields]]
name = "alt"
widget = "string"
```

```json [JSON]
{
  "name": "image",
  "widget": "object",
  "fields": [
    { "name": "src", "widget": "image" },
    { "name": "alt", "widget": "string" }
  ]
}
```

```js [JavaScript]
{
  name: 'image',
  widget: 'object',
  fields: [
    { name: 'src', widget: 'image' },
    { name: 'alt', widget: 'string' },
  ],
}
```

Output example:

```yaml [YAML]
image:
  src: /uploads/photo.jpg
  alt: A beautiful sunset
```

```toml [TOML]
[image]
src = "/uploads/photo.jpg"
alt = "A beautiful sunset"
```

```json [JSON]
{
  "image": {
    "src": "/uploads/photo.jpg",
    "alt": "A beautiful sunset"
  }
}
```

In the future, we may add built-in support for alt text and other metadata directly within the Image field type.

#### Multiple Image Uploads with Restrictions

This example shows how to allow multiple image uploads using the `multiple` option, along with minimum and maximum limits and file type restrictions.

```yaml [YAML]
- name: gallery
  label: Gallery
  widget: image
  multiple: true
  min: 2
  max: 5
  accept: image/webp
```

```toml [TOML]
[[fields]]
name = "gallery"
label = "Gallery"
widget = "image"
multiple = true
min = 2
max = 5
accept = "image/webp"
```

```json [JSON]
{
  "name": "gallery",
  "label": "Gallery",
  "widget": "image",
  "multiple": true,
  "min": 2,
  "max": 5,
  "accept": "image/webp"
}
```

```js [JavaScript]
{
  name: 'gallery',
  label: 'Gallery',
  widget: 'image',
  multiple: true,
  min: 2,
  max: 5,
  accept: 'image/webp',
}
```

Output example:

```yaml [YAML]
gallery:
  - /uploads/photo1.webp
  - /uploads/photo2.webp
  - /uploads/photo3.webp
```

```toml [TOML]
gallery = ["/uploads/photo1.webp", "/uploads/photo2.webp", "/uploads/photo3.webp"]
```

```json [JSON]
{
  "gallery": ["/uploads/photo1.webp", "/uploads/photo2.webp", "/uploads/photo3.webp"]
}
```

Source: https://sveltiacms.app/en/docs/fields/image

---

## File Field

The File field type allows users to upload and manage files within the CMS.

**Alternative for images**

If you need to limit uploads to images only, consider using the [Image](https://sveltiacms.app/en/docs/fields/image) field type instead.

### User Interface

#### Editor

A large upload button is displayed for the File field. When it’s clicked, a file selection dialog with the following features appears:

- Tabs to select files from different sources: field assets, entry assets, file assets, collection assets and global assets (if the [internal media storage](https://sveltiacms.app/en/docs/media/internal) is enabled).
- [Subfolders](https://sveltiacms.app/en/docs/ui/asset-library#subfolders) of a repository folder are listed ahead of its files, and can be opened with a click or the Enter key to browse them, with a breadcrumb leading back. The arrow keys move between the subfolders, like between the files. A file uploaded while browsing a subfolder is saved there. A new folder can be created from the dialog, too.
- An option to upload new files by dragging and dropping them into the dialog or by selecting them from the file system.
- An option to enter a URL to select a file from an external source (if the `choose_url` option is enabled).
- Integration with [external media storage providers](https://sveltiacms.app/en/docs/media#external-storage) if configured.
- Integration with [stock photo providers](https://sveltiacms.app/en/docs/integrations/stock-photos) for easy selection of free images (for Image fields only).
- File type filtering based on the `accept` option.
- A search bar to quickly find existing assets.

If the `multiple` option is enabled, users can select multiple files at once. Uploaded files are displayed as a list with options to remove or replace each file.

Files in a multiple File or Image field can be reordered using the drag handle to the left of each one. With the handle focused, the Up and Down arrow keys move a file one position, while Home and End send it to the start or end of the list.

On a touch screen, Move Up and Move Down buttons are shown in place of the handle, because drag and drop requires a mouse.

When there are 3 or more files, a menu next to the handle or buttons offers Move to Top, Move to Bottom and Move to…. The last one asks for the position to move the file to.

Users can paste an image from the clipboard directly into a File or Image field by clicking the Paste button or using the keyboard shortcut (Ctrl+V or Cmd+V). This works on both desktop and mobile devices.

On desktop, users can drag and drop file(s) directly onto the field to attach them without opening the file selection dialog.

Unsaved files can be renamed.

The CMS prevents the same file from being uploaded twice. It compares the hashes and selects an existing asset instead.

#### Selecting a Folder

With the [`select_folder`](#select-folder) option, the field takes a folder instead of a file. The dialog then becomes a Select Folder dialog that lists the subfolders alone, and works like a file manager:

- A click or the Space key selects a subfolder, and a double click or the Enter key opens it. The arrow keys move between the subfolders.
- The folder being browsed is selected when no subfolder is. The path to be saved is shown at the bottom of the dialog.
- If the `multiple` option is also enabled, several folders can be selected at once, including from different parent folders: the selection is kept while the user browses.
- A new folder can be created from the dialog, as usual.

Only repository folders with a fixed path can be browsed. The following aren’t available:

- [entry-relative folders](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders)
- folders whose path contains a template tag such as `{{slug}}`
- [external media storage providers](https://sveltiacms.app/en/docs/media#external-storage)
- the URL input

Files can’t be uploaded, dropped or pasted in this dialog.

#### Preview

A list of uploaded filenames with links to access each file. For images, a thumbnail preview is shown.

**CSP**

If your site uses a Content Security Policy (CSP), you may need to update it to display external images properly. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Data Type

A string representing the URL or path to a file, or the public path to a folder if the `select_folder` option is enabled. If the `multiple` option is enabled, it will be an array of strings.

If the `required` option is set to `false` and the field is left empty, the value will be an empty string or an empty array, depending on whether `multiple` is enabled.

By default, Sveltia CMS does not slugify uploaded filenames. If your site generator expects hyphenated filenames, you can enable the [`slugify_filename`](https://sveltiacms.app/en/docs/media#slugification-of-filenames) media storage option. To rename uploaded files automatically, for example after the entry slug, use the [`filename_template`](https://sveltiacms.app/en/docs/media#renaming-uploaded-files) option.

### Data Validation

- If the `required` option is set to `true`, at least one file must be selected.
- If the `multiple` option is enabled, the number of selected files must be between the `min` and `max` limits, if specified.
- The selected file(s) must match the allowed file types specified in the `accept` option, if provided.
- If the [`pattern`](https://sveltiacms.app/en/docs/fields#pattern) option is provided, the file path or URL must match the regular expression. A file just uploaded is tested by its name until the entry is saved. The pattern is not tested while no file is selected.
  - If the `multiple` option is enabled, the paths or URLs joined with commas, e.g. `/uploads/a.jpg,/uploads/b.jpg`, must match instead. As with Decap CMS, the pattern is tested against all the files together, not against each one. A pattern like `\.pdf$` would therefore only check the last file. To accept PDF files only, use `^[^,]+\.pdf(,[^,]+\.pdf)*$`.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the File field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `file`.

#### Optional Options

**Breaking change from Netlify/Decap CMS**

Sveltia CMS does not support the `allow_multiple` option. It’s a confusing option that defaults to `true`, and there is a separate option called `media_library.config.multiple`. We have added the new `multiple` option instead, which is more intuitive and works with all media storage providers.

##### `default`

- **Type**: `string` or `array of strings`
- **Default**: `''` or `[]`

The default value for the field. Should be a string for single file upload or an array of strings for multiple file uploads. If the `multiple` option is set on the field, a value of the other shape is reported as a config validation error on the login screen.

##### `multiple`

- **Type**: `boolean`
- **Default**: `false`

Whether to allow uploading or selecting multiple files.

For backward compatibility with Netlify/Decap CMS, if this option is not set, the `multiple` option in the media storage `config` is used as a fallback: first `media_libraries.*.config.multiple` or `media_library.config.multiple` on the field, then the same options at the top level. Using the `multiple` option on the field is recommended.

##### `min`

- **Type**: `integer`
- **Default**: `0`

The minimum number of files required. This enables validation to ensure that users upload or select at least this many files. Ignored if `multiple` is set to `false`.

##### `max`

- **Type**: `integer`
- **Default**: `Infinity`

The maximum number of files allowed. This enables validation to prevent users from uploading or selecting more than this many files. Ignored if `multiple` is set to `false`.

##### `choose_url`

- **Type**: `boolean`
- **Default**: `true`

Whether to show the option to choose a file by URL instead of uploading/selecting from the media storage.

##### `select_folder`

- **Type**: `boolean`
- **Default**: `false`

Whether to select a folder instead of a file. The public path of the selected folder, such as `/uploads/gallery`, is saved as the field value. This is useful for a [Hugo shortcode](https://gohugo.io/content-management/shortcodes/) or a component that renders all the images in a folder as a gallery, for example. See [Selecting a Folder](#selecting-a-folder) for how it works. This option is compatible with [Static CMS](https://staticjscms.netlify.app/docs/widget-file).

##### `accept`

- **Type**: `string`
- **Default**: `undefined`

A comma-separated list of allowed file types ([MIME types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types) or file extensions) for upload. For example, to allow only PDF files, set this option to `application/pdf` or `.pdf`. To allow only image files, set it to `image/*`. If not specified, all file types are allowed. See the [`accept` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/accept) documentation on MDN for more details.

The Image field only accepts AVIF, GIF, JPEG, PNG, WebP or SVG images by default. Other image formats like BMP, HEIC, JPEG XL, PSD and TIFF are excluded, with one exception: HEIC photos are accepted when [HEIC conversion](https://sveltiacms.app/en/docs/media#heic-photos) is enabled as part of image optimization. The File field has no default restriction.

##### `media_library`

- **Type**: `object`
- **Default**: `undefined`

Legacy option from Netlify/Decap CMS to configure a single [media storage provider](https://sveltiacms.app/en/docs/media#configuration) for this field. Its options are merged over those of the top-level `media_library` option.

It applies to the provider set with its own `name`. Without a `name`, it applies to the provider named in the top-level `media_library` option, or to the [internal media storage](https://sveltiacms.app/en/docs/media/internal) if there is none. In the latter case, `media_library.config.max_file_size` limits the upload size for the field.

This option is supported for backward compatibility only; use `media_libraries` for new configurations. See the [media storage configuration](https://sveltiacms.app/en/docs/media#configuration) for details.

##### `media_libraries`

- **Type**: `object`
- **Default**: `undefined`

Field-level [media storage provider](https://sveltiacms.app/en/docs/media#configuration) settings, such as the provider-specific `config` or the `max_file_size` limit, that override the top-level `media_libraries` option for this field.

Each provider’s settings, including those of the internal media storage (`default`), are merged over the same provider’s top-level settings. A nested object such as `config` is merged too, key by key, so you only need to set the options that differ. However, the merge is only one level deep, and the shared `all` options are merged shallowly. A `transformations` map set here therefore replaces the top-level one as a whole. Providers not defined here fall back to the top-level configuration.

This option can also be used to [disable the internal media storage for the field](https://sveltiacms.app/en/docs/media/internal#disabling-internal-media-storage-for-a-field) by setting the `default` library to `false`. See the field-level configuration sections of each provider, such as [Cloudinary](https://sveltiacms.app/en/docs/media/cloudinary#field-level-configuration) and [Uploadcare](https://sveltiacms.app/en/docs/media/uploadcare#field-level-configuration), for examples.

##### `media_folder`

- **Type**: `string`
- **Default**: `undefined`

The folder in the repository where files uploaded to this field will be stored, overriding the top-level and collection-level `media_folder` options. Must start with a slash (`/`) to indicate an absolute path from the root of the repository, or be an empty string or subfolder name to use entry-relative paths. See the [field-level configuration](https://sveltiacms.app/en/docs/media/internal#field-level-configuration) of the internal media storage for details and examples.

##### `public_folder`

- **Type**: `string`
- **Default**: `undefined`

The public URL path that corresponds to the field-level `media_folder` option, overriding the top-level and collection-level `public_folder` options. If not specified, it defaults to the value of the field-level `media_folder`. See the [field-level configuration](https://sveltiacms.app/en/docs/media/internal#field-level-configuration) of the internal media storage for details and examples.

### Examples

#### Basic File Field

This example demonstrates a basic File field that allows users to upload or select a single file.

```yaml [YAML]
- name: document
  label: Document
  widget: file
```

```toml [TOML]
[[fields]]
name = "document"
label = "Document"
widget = "file"
```

```json [JSON]
{
  "fields": [
    {
      "name": "document",
      "label": "Document",
      "widget": "file"
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'document',
      label: 'Document',
      widget: 'file',
    },
  ],
}
```

Output example:

```yaml [YAML]
document: /uploads/sample.pdf
```

```toml [TOML]
document = "/uploads/sample.pdf"
```

```json [JSON]
{
  "document": "/uploads/sample.pdf"
}
```

#### Multiple File Uploads with Restrictions

This example shows a File field configured to allow multiple file uploads with minimum and maximum limits.

```yaml [YAML]
- name: flyers
  label: Flyers
  widget: file
  multiple: true
  min: 1
  max: 5
  accept: application/pdf,.pdf
```

```toml [TOML]
[[fields]]
name = "flyers"
label = "Flyers"
widget = "file"
multiple = true
min = 1
max = 5
accept = "application/pdf,.pdf"
```

```json [JSON]
{
  "fields": [
    {
      "name": "flyers",
      "label": "Flyers",
      "widget": "file",
      "multiple": true,
      "min": 1,
      "max": 5,
      "accept": "application/pdf,.pdf"
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'flyers',
      label: 'Flyers',
      widget: 'file',
      multiple: true,
      min: 1,
      max: 5,
      accept: 'application/pdf,.pdf',
    },
  ],
}
```

Output example:

```yaml [YAML]
flyers:
  - /uploads/flyer1.pdf
  - /uploads/flyer2.pdf
```

```toml [TOML]
flyers = ["/uploads/flyer1.pdf", "/uploads/flyer2.pdf"]
```

```json [JSON]
{
  "flyers": ["/uploads/flyer1.pdf", "/uploads/flyer2.pdf"]
}
```

#### Folder Selection

This example shows a File field that takes a folder instead of a file, such as a folder of images to be displayed as a gallery.

```yaml [YAML]
- name: gallery
  label: Gallery
  widget: file
  select_folder: true
```

```toml [TOML]
[[fields]]
name = "gallery"
label = "Gallery"
widget = "file"
select_folder = true
```

```json [JSON]
{
  "fields": [
    {
      "name": "gallery",
      "label": "Gallery",
      "widget": "file",
      "select_folder": true
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: 'gallery',
      label: 'Gallery',
      widget: 'file',
      select_folder: true,
    },
  ],
}
```

Output example:

```yaml [YAML]
gallery: /uploads/gallery/2024
```

```toml [TOML]
gallery = "/uploads/gallery/2024"
```

```json [JSON]
{
  "gallery": "/uploads/gallery/2024"
}
```

Source: https://sveltiacms.app/en/docs/fields/file

---

## DateTime Field

The DateTime field type allows users to select and input dates and times using a date/time picker interface.

### User Interface

#### Editor

The browser’s native date/time picker. Depending on the configuration, it can handle date-only, time-only or both date and time inputs.

**Future Plans**

We plan to enhance the UI with a custom date/time picker in the future.

A field with the [`auto_now`](#auto-now) option shows its value as text instead, as it can’t be edited. The field is hidden while a new entry is being created.

#### Preview

A string representation of the date and/or time, formatted according to the specified `format`, `date_format` or `time_format` options, or in ISO 8601 format by default.

### Data Type

A string representing the date and/or time in ISO 8601 format by default, or in a custom format if specified. The possible formats are:

- Date-only: `YYYY-MM-DD` (e.g. `2025-08-15`)
- Time-only:
  - With `picker_utc`: `HH:mm:ssZ` (e.g. `14:30:00Z`).
  - Without `picker_utc`: `HH:mm:ss` (e.g. `14:30:00`).
- Date and time:
  - With `picker_utc`: `YYYY-MM-DDTHH:mm:ssZ` (e.g. `2025-08-15T14:30:00Z`).
  - Without `picker_utc`: `YYYY-MM-DDTHH:mm:ss` (e.g. `2025-08-15T14:30:00`).

If the `format`, `date_format` or `time_format` option is specified, the string will follow the custom Day.js format defined.

If the `required` option is set to `false` and the field is left empty, the value will be an empty string.

#### TOML Output

If the output format is TOML, the date-time string will be represented as a native, unquoted TOML date value, time value or date-time value, depending on the configuration, unless a custom `format` is specified. This also applies to TOML front matter.

- A value set or changed in the editor carries millisecond precision, so the examples above are written as `2025-08-15T14:30:00.000` and `14:30:00.000`.
- A value read from an existing file that isn’t edited is written back as it appears there, e.g. `2025-08-15T14:30:00Z`, with any finer precision kept.
- TOML has no offset-time type, so a UTC time-only value loses its `Z` suffix and is written as a local time (e.g. `14:30:00.000`).
- A value that isn’t a valid date or time, such as `TBD` in an existing file, is kept as a quoted string.

### Data Validation

- If the `required` option is set to `true`, the date/time value must not be an empty string.
- The date/time value must be a valid date/time string according to the specified format or ISO 8601.
- If the `pattern` option is provided, the date/time value must match the specified regular expression pattern.

A field with the [`auto_now`](#auto-now) option is not validated, as its value is set automatically.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the DateTime field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `datetime`.

#### Optional Options

**Breaking changes from Netlify/Decap CMS**

Sveltia CMS does not support the deprecated camelCase `dateFormat`, `timeFormat` and `pickerUtc` options. Use `date_format`, `time_format` and `picker_utc` instead.

Also, Sveltia CMS (and Decap CMS 3.1.1) has replaced the Moment.js library with Day.js for date formatting and parsing. Since [Day.js tokens](https://day.js.org/docs/en/display/format) are not 100% compatible with [Moment.js tokens](https://momentjs.com/docs/#/displaying/format/), this could be a breaking change in certain cases. Check your `format`, `date_format` and `time_format` options if you’re migrating from Netlify CMS or earlier versions of Decap CMS.

##### `default`

- **Type**: `string`
- **Default**: `""`

A default date and/or time value for the field in ISO 8601 format or the specified custom format. Use `{{now}}` to set the default value to the current date and time.

##### `auto_now`

- **Type**: `boolean` or `string[]`
- **Default**: `false`

Whether to set the field to the current date and time automatically when an entry is saved. This is useful for keeping track of when an entry was created and last modified, such as the `date` and `lastmod` front matter fields in Hugo. Accepted values:

- `true`: The value is set whenever the entry is saved. Same as `[create, update]`.
- `false` (default): The value is not set automatically.
- An array of the stages at which the value is set:
  - `create`: When the entry is first saved. It also covers a value that hasn’t been set yet, such as one in a List item added to an existing entry, or one in an entry saved before the option was enabled.
  - `update`: Whenever an existing entry is saved.

Use `[create]` for a creation date and `true` for a last modified date.

Unlike `default: '{{now}}'`, which fills in the current date and time when a new entry draft is created, this option sets the value at the time of saving. The value is stored in the same format as other values, with options such as `format`, `input_timezone` and `output_utc` applied, but it includes seconds. All the fields and locales saved together get the same value.

The field is read-only: its value is shown as text rather than an input, and it’s not validated. The field is hidden while a new entry is being created, because it has no value until the entry is saved. All locales get the same date and time; with the [`localize_format`](#localize-format) option, it’s written in each locale’s language.

**Limitations**

The option is ignored in a field within a [rich text editor component](https://sveltiacms.app/en/docs/fields/richtext#editor-components), where the field can be edited as usual. Setting the value when an entry is published with the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) is not supported yet.

##### `type`

- **Type**: `string`
- **Default**: `"datetime-local"`

The [`type`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#input_types) HTML attribute value for the date/time input. Accepted values:

- `"datetime-local"` (default): Accepts both date and time values.
- `"date"`: Accepts date values only; the time part is disabled.
- `"time"`: Accepts time values only; the date part is disabled.

##### `min`

- **Type**: `string`
- **Default**: `undefined`

The [`min`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/min) HTML attribute value for the date/time input. The expected format depends on the `type` option:

- `"datetime-local"`: `YYYY-MM-DDTHH:mm`
- `"date"`: `YYYY-MM-DD`
- `"time"`: `HH:mm`

##### `max`

- **Type**: `string`
- **Default**: `9999-12-31T23:59` for `datetime-local`, `9999-12-31` for `date` and `undefined` for `time`

The [`max`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/max) HTML attribute value for the date/time input. The expected format depends on the `type` option:

- `"datetime-local"`: `YYYY-MM-DDTHH:mm`
- `"date"`: `YYYY-MM-DD`
- `"time"`: `HH:mm`

##### `step`

- **Type**: `number` or `"any"`
- **Default**: `60` for `datetime-local` and `time`; `1` for `date`

The [`step`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/step) HTML attribute value for the date/time input. Accepts a positive integer or `"any"`.

- For `"datetime-local"` and `"time"` inputs, the integer represents the step in seconds (e.g. `300` for 5-minute steps).
- For `"date"` inputs, the integer represents the step in days (e.g. `7` for weekly steps).

##### `picker_utc`

- **Type**: `boolean`
- **Default**: `false`

**Use other options instead**

This option is available for backward compatibility with Netlify/Decap CMS. The newer `input_timezone` and `output_utc` options provide more flexibility and supersede this option. `picker_utc: true` is equivalent to `input_timezone: utc`.

Determines whether the date/time picker uses UTC time or the user’s local timezone. This is particularly useful when using date-only input (`type: date`); without UTC, the stored date may shift depending on the user’s timezone.

If set to `false` (default), the picker will use the local timezone of the user. If the format is date/time or time-only, the stored value will not include timezone information.

If set to `true`, the date/time picker will use UTC time instead of the local timezone. If the format is date/time or time-only, the stored value will include the `Z` suffix to indicate UTC time.

##### `input_timezone`

- **Type**: `'local' | 'utc' | string`
- **Default**: `'local'`

Timezone used by the date/time input. This option supersedes `picker_utc`. Accepted values:

- `local` (default): The browser’s local timezone is used.
- `utc`: UTC is used.
- Custom timezone name: A timezone from the [IANA timezone database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) can be provided, e.g. `America/New_York`, `Asia/Tokyo`.

##### `output_utc`

- **Type**: `boolean`
- **Default**: `false`

Whether to convert stored values to UTC. This option supersedes `picker_utc`.

If `false` (default), output values preserve the timezone semantics of `input_timezone`:

- `local`: Omits timezone information (e.g. `2025-08-15T14:30:00`).
- `utc`: Appends a `Z` suffix to indicate UTC (e.g. `2025-08-15T14:30:00Z`).
- Custom timezone: Preserves the timezone offset (e.g. `2025-08-15T14:30:00-04:00` for `America/New_York`, Eastern Daylight Time).

If `true`, the input value is converted to UTC for storage. When no custom `format` is specified, a `Z` suffix is appended to the ISO 8601 output. When a custom `format` is used, the value is stored in UTC but formatted according to that pattern — which won’t include an explicit timezone indicator unless the format itself contains `Z`.

**UTC Already Implied**

Note that `input_timezone: utc` already implies UTC semantics, so `output_utc` has no additional effect in that case.

**Limited Timezone Support for Time-only Fields**

For time-only fields (`type: time` or `date_format: false`), the only timezone setting that affects the stored value is `input_timezone: utc`, which appends a `Z` suffix (e.g. `14:30:00Z`).

A custom `input_timezone` and `output_utc` are ignored, and the time is stored as entered (e.g. `14:30:00`). This is because converting a wall-clock time to another timezone requires a reference date. Use a date/time field if you need the value converted.

##### `format`

- **Type**: `string`
- **Default**: `undefined`

A custom format for displaying and storing the date and/or time using [Day.js format tokens](https://day.js.org/docs/en/display/format). If not specified, the field will use ISO 8601 format.

**Format Recommendation**

For data portability, we recommend saving date/time values in ISO 8601 format by omitting the `format` option. Formatting is better handled in your application code. Using custom formats is generally discouraged unless you have a specific need for it, e.g. integrating with a framework that doesn’t support date formatting or requires a specific format.

##### `localize_format`

- **Type**: `boolean` or `string`
- **Default**: `false`

Whether to write the locale-dependent parts of a custom [`format`](#format), such as month names (`MMMM`, `MMM`) and the AM/PM marker (`A`, `a`), in a language other than English. Accepted values:

- `false` (default): English is used, as with Netlify/Decap CMS.
- `true`: The locale of the content is used. With [i18n support](https://sveltiacms.app/en/docs/i18n) enabled, each locale gets the value in its own language, e.g. `1 March 2026` in English and `1 März 2026` in German.
- A locale code, e.g. `de` or `pt-BR`: That locale is used for every value. This also works without i18n support, e.g. on a German-only site.

Values are read in the same locale, so an existing value is shown in the date/time picker as usual.

With `true`, a value copied to another locale is written again in that locale. A value is copied in these cases:

- with the `duplicate` [i18n strategy](https://sveltiacms.app/en/docs/i18n/options#field-level-configuration)
- when a locale is enabled for an entry
- with bulk editing

The locale also applies to the `date` [string transformation](https://sveltiacms.app/en/docs/string-transformations), entry summaries, sorting and filtering.

The option has no effect without a custom format, because an ISO 8601 value doesn’t depend on the locale. A locale code Day.js doesn’t [support](https://github.com/iamkun/dayjs/tree/dev/src/locale) falls back to English. Both cases are reported as a warning in the browser console, as is `true` in a collection without i18n support.

The locale data is loaded from the UNPKG CDN when the CMS starts, or bundled with the [npm package](https://sveltiacms.app/en/docs/releases#cdn-or-npm-package). If it can’t be loaded, values are written in English.

**Limitations**

- Day.js can’t read weekday names (`dddd`, `ddd` and `dd`) in any language, including English. A value written in a format with them can’t be read back, so the date/time picker is left empty.
- A value with a UTC offset (`Z` or `ZZ`) copied to another locale is written in UTC. It refers to the same moment, written differently.

##### `date_format`

- **Type**: `string` or `boolean`
- **Default**: `true`

A date storage format written in [Day.js format tokens](https://day.js.org/docs/en/display/format) if the value is a string and the `format` option is not defined. If `true`, ISO 8601 format is used unless the `format` option is defined. If `false`, date input/output is disabled.

**Use other options instead**

This option is available for backward compatibility with Netlify/Decap CMS. Use the `format` or `type` option instead. `date_format: false` is equivalent to `type: time`.

##### `time_format`

- **Type**: `string` or `boolean`
- **Default**: `true`

A time storage format written in [Day.js format tokens](https://day.js.org/docs/en/display/format) if the value is a string and the `format` option is not defined. If `true`, ISO 8601 format is used unless the `format` option is defined. If `false`, time input/output is disabled.

**Use other options instead**

This option is available for backward compatibility with Netlify/Decap CMS. Use the `format` or `type` option instead. `time_format: false` is equivalent to `type: date`.

### Examples

#### Date and Time

By default, the DateTime field includes both date/time pickers. The output is in ISO 8601 format:

```yaml [YAML]
- name: eventDateTime
  label: Event Date and Time
  widget: datetime
```

```toml [TOML]
[[fields]]
name = "eventDateTime"
label = "Event Date and Time"
widget = "datetime"
```

```json [JSON]
{
  "name": "eventDateTime",
  "label": "Event Date and Time",
  "widget": "datetime"
}
```

```js [JavaScript]
{
  name: "eventDateTime",
  label: "Event Date and Time",
  widget: "datetime",
}
```

Output example:

```yaml [YAML]
eventDateTime: 2025-08-15T14:30:00
```

```toml [TOML]
eventDateTime = 2025-08-15T14:30:00.000
```

```json [JSON]
{
  "eventDateTime": "2025-08-15T14:30:00"
}
```

#### Date-only

Set `type` to `"date"` to make the input [date only](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date):

```yaml [YAML]
- name: startDate
  label: Start Date
  widget: datetime
  type: date
```

```toml [TOML]
[[fields]]
name = "startDate"
label = "Start Date"
widget = "datetime"
type = "date"
```

```json [JSON]
{
  "name": "startDate",
  "label": "Start Date",
  "widget": "datetime",
  "type": "date"
}
```

```js [JavaScript]
{
  name: "startDate",
  label: "Start Date",
  widget: "datetime",
  type: "date",
}
```

Output example:

```yaml [YAML]
startDate: 2025-08-15
```

```toml [TOML]
startDate = 2025-08-15
```

```json [JSON]
{
  "startDate": "2025-08-15"
}
```

#### Time-only

Set `type` to `"time"` to make the input [time only](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time):

```yaml [YAML]
- name: startTime
  label: Start Time
  widget: datetime
  type: time
```

```toml [TOML]
[[fields]]
name = "startTime"
label = "Start Time"
widget = "datetime"
type = "time"
```

```json [JSON]
{
  "name": "startTime",
  "label": "Start Time",
  "widget": "datetime",
  "type": "time"
}
```

```js [JavaScript]
{
  name: "startTime",
  label: "Start Time",
  widget: "datetime",
  type: "time",
}
```

Output example:

```yaml [YAML]
startTime: 14:30:00
```

```toml [TOML]
startTime = 14:30:00.000
```

```json [JSON]
{
  "startTime": "14:30:00"
}
```

#### UTC Picker and Default Now

Set `picker_utc` to `true` to use UTC time in the date/time picker. The `default` option is set to `{{now}}` to use the current date and time as the default value:

```yaml [YAML]
- name: eventDateTimeUtc
  label: Event Date and Time (UTC)
  widget: datetime
  picker_utc: true
  default: '{{now}}'
```

```toml [TOML]
[[fields]]
name = "eventDateTimeUtc"
label = "Event Date and Time (UTC)"
widget = "datetime"
picker_utc = true
default = "{{now}}"
```

```json [JSON]
{
  "name": "eventDateTimeUtc",
  "label": "Event Date and Time (UTC)",
  "widget": "datetime",
  "picker_utc": true,
  "default": "{{now}}"
}
```

```js [JavaScript]
{
  name: "eventDateTimeUtc",
  label: "Event Date and Time (UTC)",
  widget: "datetime",
  picker_utc: true,
  default: '{{now}}',
}
```

Output example:

```yaml [YAML]
eventDateTimeUtc: 2025-08-15T14:30:00Z
```

```toml [TOML]
eventDateTimeUtc = 2025-08-15T14:30:00.000Z
```

```json [JSON]
{
  "eventDateTimeUtc": "2025-08-15T14:30:00Z"
}
```

#### Creation and Modification Dates

Use the `auto_now` option to record when an entry was created and last modified. The `date` field is set when the entry is first saved, and the `lastmod` field whenever it’s saved:

```yaml [YAML]
fields:
  - name: date
    label: Created
    widget: datetime
    auto_now: [create]
  - name: lastmod
    label: Last Modified
    widget: datetime
    auto_now: true
```

```toml [TOML]
[[fields]]
name = "date"
label = "Created"
widget = "datetime"
auto_now = ["create"]

[[fields]]
name = "lastmod"
label = "Last Modified"
widget = "datetime"
auto_now = true
```

```json [JSON]
{
  "fields": [
    {
      "name": "date",
      "label": "Created",
      "widget": "datetime",
      "auto_now": ["create"]
    },
    {
      "name": "lastmod",
      "label": "Last Modified",
      "widget": "datetime",
      "auto_now": true
    }
  ]
}
```

```js [JavaScript]
fields: [
  {
    name: 'date',
    label: 'Created',
    widget: 'datetime',
    auto_now: ['create'],
  },
  {
    name: 'lastmod',
    label: 'Last Modified',
    widget: 'datetime',
    auto_now: true,
  },
],
```

Output example, after the entry is updated:

```yaml [YAML]
date: 2025-08-15T14:30:12
lastmod: 2025-09-02T09:05:47
```

```toml [TOML]
date = 2025-08-15T14:30:12.000
lastmod = 2025-09-02T09:05:47.000
```

```json [JSON]
{
  "date": "2025-08-15T14:30:12",
  "lastmod": "2025-09-02T09:05:47"
}
```

#### Custom Format

The `format` option allows specifying a custom format for both displaying and storing the date and/or time using [Day.js format tokens](https://day.js.org/docs/en/display/format). For example, to use the format `MM/DD/YYYY HH:mm`:

```yaml [YAML]
- name: eventDateTime
  label: Event Date and Time
  widget: datetime
  format: MM/DD/YYYY HH:mm
```

```toml [TOML]
[[fields]]
name = "eventDateTime"
label = "Event Date and Time"
widget = "datetime"
format = "MM/DD/YYYY HH:mm"
```

```json [JSON]
{
  "name": "eventDateTime",
  "label": "Event Date and Time",
  "widget": "datetime",
  "format": "MM/DD/YYYY HH:mm"
}
```

```js [JavaScript]
{
  name: "eventDateTime",
  label: "Event Date and Time",
  widget: "datetime",
  format: "MM/DD/YYYY HH:mm",
}
```

Output example:

```yaml [YAML]
eventDateTime: 08/15/2025 14:30
```

```toml [TOML]
eventDateTime = "08/15/2025 14:30"
```

```json [JSON]
{
  "eventDateTime": "08/15/2025 14:30"
}
```

#### Localized Format

Use the `localize_format` option to write month names in the language of each locale. For example, with English and German enabled in the [i18n options](https://sveltiacms.app/en/docs/i18n), the `duplicate` strategy copies a date picked in English to the German content, written in German:

```yaml [YAML]
- name: eventDate
  label: Event Date
  widget: datetime
  type: date
  format: D MMMM YYYY
  localize_format: true
  i18n: duplicate
```

```toml [TOML]
[[fields]]
name = "eventDate"
label = "Event Date"
widget = "datetime"
type = "date"
format = "D MMMM YYYY"
localize_format = true
i18n = "duplicate"
```

```json [JSON]
{
  "name": "eventDate",
  "label": "Event Date",
  "widget": "datetime",
  "type": "date",
  "format": "D MMMM YYYY",
  "localize_format": true,
  "i18n": "duplicate"
}
```

```js [JavaScript]
{
  name: "eventDate",
  label: "Event Date",
  widget: "datetime",
  type: "date",
  format: "D MMMM YYYY",
  localize_format: true,
  i18n: "duplicate",
}
```

Output example in English and German:

```yaml [English]
eventDate: 1 March 2026
```

```yaml [German]
eventDate: 1 März 2026
```

To write the value in a single language on a site without i18n support, set the option to a locale code instead, e.g. `localize_format: de`.

#### Date with Constraints

Use `min`, `max` and `step` to restrict the allowed date range and increment. For example, to limit a booking date to the first quarter of 2026 with weekly steps:

```yaml [YAML]
- name: bookingDate
  label: Booking Date
  widget: datetime
  type: date
  min: 2026-01-01
  max: 2026-03-31
  step: 7
```

```toml [TOML]
[[fields]]
name = "bookingDate"
label = "Booking Date"
widget = "datetime"
type = "date"
min = "2026-01-01"
max = "2026-03-31"
step = 7
```

```json [JSON]
{
  "name": "bookingDate",
  "label": "Booking Date",
  "widget": "datetime",
  "type": "date",
  "min": "2026-01-01",
  "max": "2026-03-31",
  "step": 7
}
```

```js [JavaScript]
{
  name: "bookingDate",
  label: "Booking Date",
  widget: "datetime",
  type: "date",
  min: "2026-01-01",
  max: "2026-03-31",
  step: 7,
}
```

Output example:

```yaml [YAML]
bookingDate: 2026-01-08
```

```toml [TOML]
bookingDate = 2026-01-08
```

```json [JSON]
{
  "bookingDate": "2026-01-08"
}
```

#### Time with Step

Use `step` to control the time increment in seconds. For example, to allow 15-minute steps for a time-only input:

```yaml [YAML]
- name: appointmentTime
  label: Appointment Time
  widget: datetime
  type: time
  min: 09:00
  max: 17:00
  step: 900
```

```toml [TOML]
[[fields]]
name = "appointmentTime"
label = "Appointment Time"
widget = "datetime"
type = "time"
min = "09:00"
max = "17:00"
step = 900
```

```json [JSON]
{
  "name": "appointmentTime",
  "label": "Appointment Time",
  "widget": "datetime",
  "type": "time",
  "min": "09:00",
  "max": "17:00",
  "step": 900
}
```

```js [JavaScript]
{
  name: "appointmentTime",
  label: "Appointment Time",
  widget: "datetime",
  type: "time",
  min: "09:00",
  max: "17:00",
  step: 900,
}
```

Output example:

```yaml [YAML]
appointmentTime: 10:15:00
```

```toml [TOML]
appointmentTime = 10:15:00.000
```

```json [JSON]
{
  "appointmentTime": "10:15:00"
}
```

#### Custom Timezone with `input_timezone`

Use `input_timezone` to make the date/time picker use a specific timezone. For example, to allow users to schedule events in New York time:

```yaml [YAML]
- name: eventTime
  label: Event Time (New York)
  widget: datetime
  input_timezone: America/New_York
```

```toml [TOML]
[[fields]]
name = "eventTime"
label = "Event Time (New York)"
widget = "datetime"
input_timezone = "America/New_York"
```

```json [JSON]
{
  "name": "eventTime",
  "label": "Event Time (New York)",
  "widget": "datetime",
  "input_timezone": "America/New_York"
}
```

```js [JavaScript]
{
  name: "eventTime",
  label: "Event Time (New York)",
  widget: "datetime",
  input_timezone: "America/New_York",
}
```

Output example (with timezone offset preserved):

```yaml [YAML]
eventTime: 2025-08-15T14:30:00-04:00
```

```toml [TOML]
eventTime = 2025-08-15T14:30:00.000-04:00
```

```json [JSON]
{
  "eventTime": "2025-08-15T14:30:00-04:00"
}
```

#### UTC Conversion with `output_utc`

Use `output_utc: true` to store all date/time values in UTC, regardless of the user’s input timezone. This is useful for ensuring consistent data storage:

```yaml [YAML]
- name: eventTime
  label: Event Time
  widget: datetime
  input_timezone: America/New_York
  output_utc: true
```

```toml [TOML]
[[fields]]
name = "eventTime"
label = "Event Time"
widget = "datetime"
input_timezone = "America/New_York"
output_utc = true
```

```json [JSON]
{
  "name": "eventTime",
  "label": "Event Time",
  "widget": "datetime",
  "input_timezone": "America/New_York",
  "output_utc": true
}
```

```js [JavaScript]
{
  name: "eventTime",
  label: "Event Time",
  widget: "datetime",
  input_timezone: "America/New_York",
  output_utc: true,
}
```

Output example (converted to UTC with `Z` suffix):

```yaml [YAML]
eventTime: 2025-08-15T18:30:00Z
```

```toml [TOML]
eventTime = 2025-08-15T18:30:00Z
```

```json [JSON]
{
  "eventTime": "2025-08-15T18:30:00Z"
}
```

#### Local Timezone with Custom Format

Combine `input_timezone`, `output_utc` and `format` to store values in a custom format while maintaining timezone awareness:

```yaml [YAML]
- name: publishTime
  label: Publish Time
  widget: datetime
  input_timezone: local
  output_utc: true
  format: YYYY-MM-DD HH:mm
```

```toml [TOML]
[[fields]]
name = "publishTime"
label = "Publish Time"
widget = "datetime"
input_timezone = "local"
output_utc = true
format = "YYYY-MM-DD HH:mm"
```

```json [JSON]
{
  "name": "publishTime",
  "label": "Publish Time",
  "widget": "datetime",
  "input_timezone": "local",
  "output_utc": true,
  "format": "YYYY-MM-DD HH:mm"
}
```

```js [JavaScript]
{
  name: "publishTime",
  label: "Publish Time",
  widget: "datetime",
  input_timezone: "local",
  output_utc: true,
  format: "YYYY-MM-DD HH:mm",
}
```

Output example (UTC time in custom format):

```yaml [YAML]
publishTime: 2025-08-15 18:30
```

```toml [TOML]
publishTime = "2025-08-15 18:30"
```

```json [JSON]
{
  "publishTime": "2025-08-15 18:30"
}
```

Source: https://sveltiacms.app/en/docs/fields/datetime

---

## Map Field

The Map field type allows users to select geographic locations using an interactive map interface. It supports selecting single points, lines or polygons, and stores the selected geometry as a GeoJSON string.

### User Interface

#### Editor

An interactive map interface that enables users to select geographic locations visually by clicking on the map. The map supports zooming and panning for better precision. It also includes the following features:

- A search box to find locations by name or address.
- A button to center the map on the user’s current location using the browser’s [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
- A Clear button to remove the selected location(s).

The map UI is built with the [Leaflet](https://leafletjs.com/) and [Terra Draw](https://github.com/JamesLMilner/terra-draw) libraries, utilizing [OpenStreetMap](https://www.openstreetmap.org/) tiles and the [Nominatim](https://nominatim.org/) search API. You don’t need to set up any API keys to use those free services.

**CSP**

You may need to update your Content Security Policy (CSP) to allow loading map tiles and making search API requests. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

**Future Plans**

We plan to add support for additional map providers in the future, such as Mapbox and Google Maps, to offer more customization options.

#### Preview

The data output, which is a GeoJSON string, is displayed. See below for details on the data format.

### Data Type

A stringified [GeoJSON](https://geojson.org/) object representing the selected geometry. Depending on the selected `type` option, the GeoJSON will be in one of the following formats:

```
{"type":"Point","coordinates":[lng,lat]}
```

```
{"type":"LineString","coordinates":[[lng1,lat1],[lng2,lat2],...]}
```

```
{"type":"Polygon","coordinates":[[[lng1,lat1],[lng2,lat2],[lng3,lat3],...]]}
```

You need to parse this string to work with the GeoJSON data in your application.

**Coordinate Order**

The coordinates are in the order of longitude first, then latitude, as per the GeoJSON spec. Some libraries use latitude-longitude order, so be cautious when integrating with other mapping tools.

If the `required` option is set to `false` and locations are not selected, the value will be an empty string.

### Data Validation

- If the `required` option is set to `true`, a valid GeoJSON string must be provided.
- The GeoJSON string must conform to the specified geometry `type` (Point, LineString or Polygon).
- Coordinates must be valid latitude and longitude values.

### Options

In addition to the [common field options](https://sveltiacms.app/en/docs/fields#common-options), the Map field supports the following options:

#### Required Options

##### `widget`

- **Type**: `string`
- **Default**: `string`

Must be set to `map`.

#### Optional Options

##### `default`

- **Type**: `string`
- **Default**: `""`

A default GeoJSON string to prepopulate the field. The string should be a valid GeoJSON representation of the selected geometry. The `type` option should match the geometry type of the default value.

##### `decimals`

- **Type**: `number`
- **Default**: `7`

Number of decimal places for coordinates. Higher values provide more precision but may increase the size of the stored data.

##### `type`

- **Type**: `string`
- **Default**: `Point`

Type of geometry to select. Supported values are:

- `Point`: Allows selecting a single location on the map.
- `LineString`: Allows drawing a line by selecting multiple points.
- `Polygon`: Allows drawing a polygon by selecting multiple points that form a closed shape.

##### `center`

- **Type**: `[number, number]`
- **Default**: `[0, 0]`

Default center coordinates of the map as `[longitude, latitude]`, following the GeoJSON coordinate order. This is used as the initial map view when no value is set. If a value already exists, the map centers on the stored geometry instead.

##### `zoom`

- **Type**: `number`
- **Default**: `2`

Default zoom level of the map when no value is set.

### Examples

#### Basic Map Field

This example shows a simple Map field configuration, which allows users to select a single location on the map.

```yaml [YAML]
- name: location
  label: Location
  widget: map
```

```toml [TOML]
[[fields]]
name = "location"
label = "Location"
widget = "map"
```

```json [JSON]
{
  "name": "location",
  "label": "Location",
  "widget": "map"
}
```

```js [JavaScript]
{
  name: 'location',
  label: 'Location',
  widget: 'map',
}
```

Output example:

```yaml [YAML]
location: '{"type":"Point","coordinates":[-122.4194015,37.7749144]}'
```

```toml [TOML]
location = '{"type":"Point","coordinates":[-122.4194015,37.7749144]}'
```

```json [JSON]
{
  "location": "{\"type\":\"Point\",\"coordinates\":[-122.4194015,37.7749144]}"
}
```

#### LineString Geometry with Decimals

This example shows a Map field configured to select a LineString geometry with a specified number of decimal places for coordinates.

```yaml [YAML]
- name: route
  label: Route
  widget: map
  type: LineString
  decimals: 5
```

```toml [TOML]
[[fields]]
name = "route"
label = "Route"
widget = "map"
type = "LineString"
decimals = 5
```

```json [JSON]
{
  "name": "route",
  "label": "Route",
  "widget": "map",
  "type": "LineString",
  "decimals": 5
}
```

```js [JavaScript]
{
  name: 'route',
  label: 'Route',
  widget: 'map',
  type: 'LineString',
  decimals: 5,
}
```

Output example:

```yaml [YAML]
route: '{"type":"LineString","coordinates":[[-122.41940,37.77490],[-122.41800,37.77550]]}'
```

```toml [TOML]
route = '{"type":"LineString","coordinates":[[-122.41940,37.77490],[-122.41800,37.77550]]}'
```

```json [JSON]
{
  "route": "{\"type\":\"LineString\",\"coordinates\":[[-122.41940,37.77490],[-122.41800,37.77550]]}"
}
```

#### Default Center and Zoom

This example shows a Map field configured with a default center and zoom level, so the map opens in a specific region when no value is set.

```yaml [YAML]
- name: location
  label: Location
  widget: map
  center: [-122.4194, 37.7749]
  zoom: 12
```

```toml [TOML]
[[fields]]
name = "location"
label = "Location"
widget = "map"
center = [-122.4194, 37.7749]
zoom = 12
```

```json [JSON]
{
  "name": "location",
  "label": "Location",
  "widget": "map",
  "center": [-122.4194, 37.7749],
  "zoom": 12
}
```

```js [JavaScript]
{
  name: 'location',
  label: 'Location',
  widget: 'map',
  center: [-122.4194, 37.7749],
  zoom: 12,
}
```

Source: https://sveltiacms.app/en/docs/fields/map
