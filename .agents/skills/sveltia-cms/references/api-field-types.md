# JavaScript API: Custom Field Types

Registering custom field types (widgets) with their own control and preview components.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Custom Field Types

A custom field type allows you to create reusable, complex input controls and previews available in the CMS interface. Registered field types can be used in your collection just like [built-in field types](https://sveltiacms.app/en/docs/fields#built-in-field-types).

**Compatibility Note**

Because there is little [Netlify/Decap CMS documentation](https://decapcms.org/docs/custom-widgets/#registerwidget) on this topic, Sveltia CMS may not be fully compatible with existing preview templates. Our implementation does not include undocumented component props, with these exceptions:

- the [`entry` and `getAsset` props](#control-component-props) for control components
- the [`entry`, `getAsset` and `fieldsMetaData` props](#preview-component-props) for preview components

Two sets of undocumented props are replaced:

- `onPersistMedia` is replaced with the [`addFile` prop](#uploading-files), which is designed for the way Sveltia CMS saves entries.
- `onOpenMediaLibrary` and `mediaPaths` are replaced with the [`pickFile` prop](#picking-files). It resolves with what the user picked instead of leaving the control to watch a Redux store.

**Naming Convention**

In Sveltia CMS, what was previously referred to as a **widget** in Netlify/Decap CMS is now called a **field type**. This change was made to better align with common content management terminology, as originally [proposed](https://github.com/decaporg/decap-cms/issues/3719) by Netlify CMS maintainers themselves.

The `registerWidget` method from Netlify/Decap CMS has been renamed to `registerFieldType` in Sveltia CMS to reflect this terminology change. The old name remains available as an alias for backward compatibility. The signature and behavior are identical.

### Registering a Custom Field Type

To register a custom field type, use the `registerFieldType` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerFieldType(name, control, [preview], [schema]);
```

Alternatively, pass a single definition object, which also accepts a [summary component](#summary-component):

```js
CMS.registerFieldType({
  name,
  controlComponent,
  previewComponent, // optional
  summaryComponent, // optional
  schema, // optional
});
```

For backward compatibility with Netlify/Decap CMS, the `registerWidget` method is available as an alias with the same signatures.

#### Parameters

- `name` (string, required): The name of the custom field type. This is the name you will use in your collection configuration to reference this type. It cannot be the name of a [built-in field type](https://sveltiacms.app/en/docs/fields#built-in-field-types), or an error is thrown. Registering a field type with the same name again replaces the previous one.
- `control` (React component or string, required): A [React component](https://sveltiacms.app/en/docs/api#writing-react-components) that defines the control (input) part of the field. Alternatively, the name of another registered custom field type whose control should be reused. Built-in field type names are not supported here: the field shows no control, and a warning is logged to the browser console. To reuse a built-in control, use [`getFieldType`](#getting-a-field-type) instead.
- `preview` (React component, optional): A [React component](https://sveltiacms.app/en/docs/api#writing-react-components) that defines how the field’s value is previewed in the CMS preview pane. If not provided, no preview will be shown.
- `schema` (object, optional): A [JSON schema](https://json-schema.org/) (draft-07) object that defines the configuration options for the field type. See [Field Schema](#field-schema) below.

The definition object takes the same options under the following names:

- `name` (string, required): Same as the `name` parameter.
- `controlComponent` (React component or string, required): Same as the `control` parameter.
- `previewComponent` (React component, optional): Same as the `preview` parameter.
- `summaryComponent` (React component, optional): A [React component](https://sveltiacms.app/en/docs/api#writing-react-components) that draws a collapsed List field item. See [Summary Component](#summary-component) below.
- `schema` (object, optional): Same as the `schema` parameter.

When a definition object is given, any other arguments are ignored. The format is the same as the one the undocumented Netlify/Decap CMS `registerWidget` method accepts, so existing code works as is. The only exception is that the Netlify/Decap CMS-specific `globalStyles` and `allowMapValue` options are ignored.

You can write the components with [HTM](https://sveltiacms.app/en/docs/api#using-htm), JSX or `h()` calls — see the [Writing React Components](https://sveltiacms.app/en/docs/api#writing-react-components) section for more details.

#### Control Component Props

The control component receives the following props:

- `value` (any): The current field value. Your component should display this value and call `onChange` when the user modifies it.
- `field` ([Immutable Map](https://immutable-js.com/docs/v5/Map/)): An Immutable Map of the current field configuration from the CMS config. Contains all field properties including `name`, `label`, `widget` and any custom properties you define in your schema. Access properties using methods like `field.get('name')` or `field.getIn(['custom', 'property'])`.
- `forID` (string): The HTML `id` attribute that should be used for the main input element. This enables proper label association and accessibility.
- `classNameWrapper` (string): A CSS class name that can be applied to your input element for consistent styling with built-in field controls.
- `entry` ([Immutable Map](https://immutable-js.com/docs/v5/Map/)): The data of the entry being edited. Read the content with `entry.getIn(['data', 'fieldName'])`. This lets your control display values derived from other fields in the same entry, such as dynamically generated select options. The prop is updated whenever any field in the entry is modified, so your control always sees the latest content. See the [Dependent Select](#dependent-select) example below.
- `getAsset` (function): Returns an asset object for a given file path, or `undefined` if not found, just like the [`getAsset` prop](#preview-component-props) of a preview component. Use its `url` property to display a file stored in the value, such as an image the user picked with the [`pickFile` prop](#picking-files). See the [Image with Derived Files](#image-with-derived-files) example below.
- `onChange` (function): A callback function that must be called with the new value whenever the user modifies the field. This updates the entry draft in the CMS.
- `addFile` (function): A function that adds a file to the entry draft, so that the file is uploaded along with the entry when it’s saved. It returns a Promise that resolves to a temporary URL to be stored in the field value. See [Uploading Files](#uploading-files) below.
- `pickFile` (function): A function that opens the same file selection dialog as a built-in File or Image field, so the user can pick an existing file, upload a new one, enter a URL or choose a stock photo. It returns a Promise that resolves to the picked file, with the value to be stored in the field. See [Picking Files](#picking-files) below.

##### Uploading Files

A control that produces files — an image editor, a control that downloads a remote image or one that derives a thumbnail from an upload, for example — can hand them to the CMS with the `addFile` prop:

```js
const url = await this.props.addFile(file, options);
```

- `file` (`File` or `Blob`, required): The file to be added.
- `options.name` (string): The filename, including the extension. It’s required when a `Blob` is given, because a `Blob` has no name of its own. When a `File` is given, the option overrides its name.
- `options.replace` (boolean): Whether the file replaces an existing file with the same name in the target folder, rather than being saved with a unique name next to it. See [Replacing Files](#replacing-files) below. Default: `false`.

The function resolves to a temporary `blob:` URL. Store it in the field value with `onChange`, either as the value itself or anywhere within an object or array value, just like the [Image with Derived Files](#image-with-derived-files) example below does. The URL can also be used to display the file in the control and the preview pane while the entry is being edited.

When the entry is saved, the CMS replaces each URL in the value with the public path of the uploaded file, and commits the file along with the entry. Everything works the same way as a file selected in a built-in [File](https://sveltiacms.app/en/docs/fields/file) or [Image](https://sveltiacms.app/en/docs/fields/image) field:

- The file is saved to the field’s own `media_folder` if the option is defined on the field, otherwise to the collection-level or top-level folder. See [Configuring Folder Paths](https://sveltiacms.app/en/docs/media/internal#configuring-folder-paths).
- The filename is sanitized. If another file in the folder already has the same name, the name is made unique, unless the `replace` option is enabled.
- The [internal media storage options](https://sveltiacms.app/en/docs/media/internal#additional-features), such as `max_file_size` and `transformations`, are applied. If the file exceeds the size limit or cannot be decoded, the Promise is rejected with an error. Wrap the call in `try`/`catch` to show a message to the user.
- A file identical to one already uploaded, or already added to the draft, is not uploaded twice. The existing path or URL is returned instead.
- The file is included in the same commit as the entry, so the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) and [Open Authoring](https://sveltiacms.app/en/docs/workflows/open) work as usual. A file that is no longer referenced in the value when the entry is saved is simply discarded.

The function is only available while an entry is being edited. Otherwise, it rejects.

###### Replacing Files

A control often regenerates a file whenever the entry changes. Examples include a thumbnail rendered from the entry, an Open Graph image drawn from the title or an image a framework expects under a fixed name, such as `featured.jpg` in a Hugo page bundle.

By default, each new version is saved next to the previous one as `thumb-1.webp`, `thumb-2.webp` and so on, leaving the old files behind. Enable the `replace` option to overwrite the existing file instead:

```js
const url = await this.props.addFile(blob, { name: 'thumb.webp', replace: true });
```

With the option, the file is always saved under the given name:

- If a file with the same name exists in the target folder, it’s updated in the same commit as the entry. The names are compared without regard to case, so `Thumb.webp` is overwritten by `thumb.webp` instead of clashing with it on a case-insensitive file system.
- If there is no such file, the file is created as usual.
- The `filename_template` option of the [internal media storage](https://sveltiacms.app/en/docs/media/internal#additional-features) is not applied, but the name is still sanitized. A [transformation](https://sveltiacms.app/en/docs/media/internal#additional-features) that converts the file to another format changes its extension.
- An identical file is reused only if it has the same name. If the file is unchanged from the one already in the folder, nothing is committed.
- If two files with the same name are added to the same folder, only the first one replaces the existing file. The other is saved with a unique name.

**Keep the URL intact**

The CMS finds the files to be uploaded by looking for the temporary URLs in the field value. Your control may transform the URL before storing it, for example by encoding it or embedding it in a string that is later serialized differently. In that case, the file won’t be uploaded and the value will end up with a dangling `blob:` URL.

##### Picking Files

A control that stores a file reference in a shape of its own shouldn’t have to reimplement file browsing. Examples include an image with alt text and a focal point, a gallery with per-item captions or a download with a label.

The `pickFile` prop opens the same dialog as a built-in [File](https://sveltiacms.app/en/docs/fields/file) or [Image](https://sveltiacms.app/en/docs/fields/image) field, complete with the folder list, search, uploads, URL input and [stock photo](https://sveltiacms.app/en/docs/integrations/stock-photos) integrations:

```js
const picked = await this.props.pickFile(options);
```

All the options are optional:

- `options.kind` (`image` or `file`): The kind of file to pick. With `image`, the dialog is limited to images, just like an Image field. If omitted, the dialog is limited to images when `accept` only lists image types, and offers any file otherwise.
- `options.accept` (string): A comma-separated list of accepted file types, such as `image/*` or `.pdf,.docx`, applied to files uploaded through the dialog. Same as the [`accept` option](https://sveltiacms.app/en/docs/fields/file#options) of a File field.
- `options.multiple` (boolean): Whether to let the user pick several files at once. Default: `false`.
- `options.allowURL` (boolean): Whether to let the user enter a URL instead of picking a file. Same as the [`choose_url` option](https://sveltiacms.app/en/docs/fields/file#options) of a File field. Default: `true`.

When the dialog is closed with the Insert button, the function resolves to an object with the following properties. When `multiple` is enabled, it resolves to an array of such objects:

- `value` (string): The value to be stored in the field. Store it with `onChange`, either as the value itself or anywhere within an object or array value. A temporary URL is handled like one returned from `addFile`: the file is uploaded when the entry is saved, and the URL is replaced with the public path. The value is exactly what a built-in File or Image field would store for the same pick:
  - the public path of an existing file
  - a temporary `blob:` URL for a file uploaded through the dialog
  - an external URL
- `file` (`Blob`): The contents of the file, for a control that needs the bytes, such as one deriving a thumbnail like the [Image with Derived Files](#image-with-derived-files) example below. It’s `undefined` for an external URL.
- `credit` (string): Attribution HTML for a stock photo, including the photographer and service links. It’s `undefined` otherwise.

It resolves to `null` when the dialog is dismissed, or when none of the picked files can be used, so a control can simply return early:

```js
const picked = await this.props.pickFile({ accept: 'image/*' });

if (picked) {
  this.props.onChange({ src: picked.value, alt: '' });
}
```

The dialog lists the folders a File or Image field in the same place would offer: the field’s own `media_folder` if the option is defined on the field, otherwise the collection-level and top-level folders. See [Configuring Folder Paths](https://sveltiacms.app/en/docs/media/internal#configuring-folder-paths).

Files uploaded through the dialog are handled exactly like files given to `addFile`, including naming, deduplication and the [internal media storage options](https://sveltiacms.app/en/docs/media/internal#additional-features). A file that exceeds the size limit or cannot be decoded is reported to the user in a dialog, the way a built-in field does. The Promise isn’t rejected in that case. It’s only rejected if the contents of a picked file cannot be retrieved.

The function is only available while an entry is being edited. Otherwise, it rejects.

##### Custom Validation

Control components may optionally implement an `isValid` method for custom validation:

- On a class component, it’s an instance method.
- A function component has no instance, so it exposes the method with the [`useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle) hook from `CMS.React` instead. Pass it the `ref` prop the component receives, or the ref passed by `forwardRef`.

See [Using Hooks](https://sveltiacms.app/en/docs/api#using-hooks). The method should return:

- `true` when the value is valid.
- `false` or `{ error: { message: "text" } }` when the value is invalid.
- A Promise that resolves to any of the above formats for async validation.

The method is called with two arguments: the current field value and the field configuration as an [Immutable Map](https://immutable-js.com/docs/v5/Map/), the same as the `field` prop.

It runs whenever any field in the entry is modified, not only your field. This means it can also check the value against other fields read from the `entry` prop.

If the method is called again before an earlier Promise settles, the earlier result is discarded, so you can simply return a new Promise on each call. Saving the entry waits for any pending validation to complete. If the method throws an error or returns a rejected Promise, the value is considered invalid, and the error message is shown to the user.

In a function component, the method can be exposed as follows. See the [Number with Validation](#number-with-validation) example below for a complete field type, implemented as a function component in the HTM version and as a class component in the others.

```js [HTM]
const { useImperativeHandle } = CMS.React;

const NumberControl = ({ forID, classNameWrapper, value, onChange, ref }) => {
  useImperativeHandle(
    ref,
    () => ({
      isValid: (value) =>
        value == null || !Number.isNaN(value) || { error: { message: 'Must be a number' } },
    }),
    [],
  );

  return html`
    <input
      id=${forID}
      class=${classNameWrapper}
      type="number"
      value=${value ?? ''}
      onChange=${(event) =>
        onChange(event.target.value === '' ? null : parseFloat(event.target.value))}
    />
  `;
};
```

```jsx [JSX]
const { useImperativeHandle } = CMS.React;

const NumberControl = ({ forID, classNameWrapper, value, onChange, ref }) => {
  useImperativeHandle(
    ref,
    () => ({
      isValid: (value) =>
        value == null || !Number.isNaN(value) || { error: { message: 'Must be a number' } },
    }),
    [],
  );

  return (
    <input
      id={forID}
      className={classNameWrapper}
      type="number"
      value={value ?? ''}
      onChange={(event) =>
        onChange(event.target.value === '' ? null : parseFloat(event.target.value))
      }
    />
  );
};
```

```js [h()]
const { useImperativeHandle } = CMS.React;

const NumberControl = ({ forID, classNameWrapper, value, onChange, ref }) => {
  useImperativeHandle(
    ref,
    () => ({
      isValid: (value) =>
        value == null || !Number.isNaN(value) || { error: { message: 'Must be a number' } },
    }),
    [],
  );

  return h('input', {
    id: forID,
    className: classNameWrapper,
    type: 'number',
    value: value ?? '',
    onChange: (event) =>
      onChange(event.target.value === '' ? null : parseFloat(event.target.value)),
  });
};
```

#### Preview Component Props

The preview component receives the following props:

- `value` (any): The current field value to display in the preview.
- `field` ([Immutable Map](https://immutable-js.com/docs/v5/Map/)): An Immutable Map of the current field configuration. Use `field.get('name')` to access properties.
- `metadata` (Immutable Map): Any available metadata for the current field, looked up in `fieldsMetaData` by the names of the field and its parent fields, so it works for a field nested in an Object or List field too. For relation fields, it contains referenced entry data. Use Immutable Map methods to access nested data.
- `entry` ([Immutable Map](https://immutable-js.com/docs/v5/Map/)): The data of the entry being edited, with the same structure as the [`entry` prop](https://sveltiacms.app/en/docs/api/preview-templates#component-props) of a custom preview template. Read the content with `entry.getIn(['data', 'fieldName'])`.
- `getAsset` (function): Returns an asset object for a given file path, or `undefined` if not found. Use its `url` property to display an image. The path can also be a temporary `blob:` URL returned from the [`addFile`](#uploading-files) or [`pickFile`](#picking-files) prop. See the [`getAsset` prop](https://sveltiacms.app/en/docs/api/preview-templates#component-props) of a custom preview template for the object’s properties.
- `fieldsMetaData` (Immutable Map): Metadata for each field in the entry, keyed by the field’s name, with the names of its parent fields first for a nested field. It’s the same as the [`fieldsMetaData` prop](https://sveltiacms.app/en/docs/api/preview-templates#component-props) of a custom preview template. `metadata` is the item of this map for the current field.

#### Summary Component

When a [List](https://sveltiacms.app/en/docs/fields/list) field has a single subfield, defined with the `field` option, a collapsed item shows text. By default, it’s the item’s value, or the text made from the List field’s `summary` option. That’s fine for a plain string, but a custom field type that stores a file path or an ID can draw something more meaningful, such as a small picture and a title.

To do so, register the field type with a `summaryComponent` in a [definition object](#registering-a-custom-field-type). The component receives the same [props as a preview component](#preview-component-props), with `value` being the value of the item. It’s drawn in place of the summary text whenever the item is collapsed:

```js
const PhotoSummary = ({ value, getAsset }) => html`
  <span style="display: flex; align-items: center; gap: 8px;">
    <img src=${getAsset(value)?.url} alt="" style="width: 32px; height: 32px; object-fit: cover;" />
    ${value?.split('/').pop()}
  </span>
`;

CMS.registerFieldType({
  name: 'photo',
  controlComponent: PhotoControl,
  previewComponent: PhotoPreview,
  summaryComponent: PhotoSummary,
});
```

```yaml
fields:
  - name: photos
    label: Photos
    widget: list
    field:
      name: photo
      widget: photo # custom field type name
```

A few notes:

- The component is only used for a List field with a single subfield of your field type. A List field with multiple subfields or variable types, and an Object field, still show the text made from the `summary` option.
- A thumbnail made from the List field’s [`thumbnail` option](https://sveltiacms.app/en/docs/fields/list#thumbnail), if any, is still shown beside the component.
- The summary text is still used where plain text is needed, such as the label of an item being dragged.

#### Field Schema

The `schema` parameter is a [JSON schema](https://json-schema.org/) (draft-07) object that defines the configuration options for your field type. When users include your custom field type in their collection config, they can set these configuration options. For example:

```js
const schema = {
  properties: {
    separator: { type: 'string' },
    maxItems: { type: 'integer' },
  },
};
```

Users would then configure the field like:

```yaml
fields:
  - name: tags
    label: Tags
    widget: array # custom field type name
    separator: ', ' # custom configuration option
    maxItems: 10 # custom configuration option
```

Whenever a field uses your field type, the schema is applied to the whole field object. This is part of the [runtime validation](https://sveltiacms.app/en/docs/config-basics#runtime-validation) that runs each time the CMS loads. A configuration that doesn’t match is reported on the login screen, alongside the built-in checks:

> Posts collection, `tags` field: The `maxItems` option must be an integer.

Only the options your schema describes are checked. Anything else stays valid, so a schema that lists `separator` doesn’t stop a user from setting the common field options such as `label` and `required`.

**Keep the schema valid**

If the schema itself can’t be compiled — a misspelled `type` such as `int` instead of `integer`, for example — it is ignored, and a warning naming your field type is logged to the browser console. The rest of the configuration is still validated.

### Getting a Field Type

To get the definition of a registered field type, use the `getFieldType` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.getFieldType(name);
```

For backward compatibility with Netlify/Decap CMS, the `getWidget` method is available as an alias with the same signature.

The method returns an object with the following properties, or `undefined` if the field type is unavailable:

- `control` (React component): The control component of the field type.
- `preview` (React component): The preview component of the field type, if any.
- `summary` (React component): The [summary component](#summary-component) of the field type, if any. Built-in field types don’t provide a summary component.
- `schema` (object): The field schema, if any. Built-in field types don’t provide a schema.

This is mainly useful for building a custom field type on top of an existing one, so you don’t have to reimplement a control from scratch. For example, you can reuse the built-in [Select](https://sveltiacms.app/en/docs/fields/select) control while providing your own dynamically generated options. See the [Dependent Select](#dependent-select) example below.

#### Reusing a Built-In Field Type

Sveltia CMS is built with Svelte rather than React, so built-in field controls and previews are Svelte components. The components returned from `getFieldType` are React wrappers that render those Svelte components for you. You can compose them into your own React components as usual.

Only the built-in field types that work outside the entry editor can be reused this way:

`boolean`, `color`, `datetime`, `map`, `number`, `select`, `string`, `text`, `uuid`

For any other built-in field type, such as `list` or `object`, the method returns `undefined` and logs a warning to the browser console. Those editors read from and write to the entry draft directly, so they can’t be rendered on their own.

The returned control component accepts the same `value`, `field`, `forID` and `onChange` props as a custom control, with two differences:

- The `field` prop can be an [Immutable Map](https://immutable-js.com/docs/v5/Map/), a plain object or any object exposing an Immutable Map-like `get` method. A plain object is the simplest way to pass an ad hoc field configuration. The other shapes let you reuse a control wrapper ported from Netlify/Decap CMS as is.
- The `classNameWrapper` prop is ignored, because built-in components come with their own styles.

You can also pass the optional `locale`, `keyPath`, `required`, `readonly` and `invalid` props. When they are omitted, they are inherited from the field being edited. A reused control therefore behaves consistently with the rest of the CMS: it’s marked required, read-only and invalid exactly when your custom field is.

This inheritance takes precedence over the ad hoc field configuration, because the configuration typically describes how to render the input rather than the field itself. For example, a `required: false` option there won’t make a required field optional. Otherwise, the user could select an empty value that the CMS then rejects.

The returned preview component accepts the `value` and `field` props, plus the optional `locale` and `keyPath` props.

**Compatibility Note**

In Netlify/Decap CMS, the undocumented `getWidget` method returns any built-in or custom widget. In Sveltia CMS, the method is limited to the field types listed above for the reason described. The returned object also omits the Netlify/Decap CMS-specific `globalStyles` and `allowMapValue` properties, which have no equivalent in Sveltia CMS.

### Examples

**HTM, JSX or `h()`**

Each example below comes in three versions:

- [HTM](https://sveltiacms.app/en/docs/api#using-htm), which runs in the browser as is and is the recommended way
- [JSX](https://sveltiacms.app/en/docs/api#using-jsx), which requires a build step to transpile it to JavaScript
- [`h()`](https://sveltiacms.app/en/docs/api#using-h), which is compatible with Netlify/Decap CMS

The HTM versions use function components, while the others use class components. See [Writing React Components](https://sveltiacms.app/en/docs/api#writing-react-components) for more details.

#### Simple Text Array

A custom field type that converts a comma-separated string to an array and back:

```js [HTM]
const ArrayControl = ({ field, forID, classNameWrapper, value, onChange }) => {
  const separator = field.get('separator', ', ');

  return html`
    <input
      id=${forID}
      class=${classNameWrapper}
      type="text"
      value=${value ? value.join(separator) : ''}
      onChange=${(e) => onChange(e.target.value.split(separator).map((item) => item.trim()))}
    />
  `;
};

const ArrayPreview = ({ value }) => html`
  <ul style="margin: 0; padding-left: 20px">
    ${Array.isArray(value) && value.map((item, index) => html`<li key=${index}>${item}</li>`)}
  </ul>
`;

const schema = {
  properties: {
    separator: { type: 'string' },
  },
};

CMS.registerFieldType('array', ArrayControl, ArrayPreview, schema);
```

```jsx [JSX]
class ArrayControl extends React.Component {
  handleChange = (e) => {
    const separator = this.props.field.get('separator', ', ');
    this.props.onChange(e.target.value.split(separator).map((item) => item.trim()));
  };

  render() {
    const separator = this.props.field.get('separator', ', ');
    const value = this.props.value;

    return (
      <input
        id={this.props.forID}
        className={this.props.classNameWrapper}
        type="text"
        value={value ? value.join(separator) : ''}
        onChange={this.handleChange}
      />
    );
  }
}

class ArrayPreview extends React.Component {
  render() {
    const value = this.props.value;

    return (
      <ul style={{ margin: '0', paddingLeft: '20px' }}>
        {Array.isArray(value) && value.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
  }
}

const schema = {
  properties: {
    separator: { type: 'string' },
  },
};

CMS.registerFieldType('array', ArrayControl, ArrayPreview, schema);
```

```js [h()]
const ArrayControl = createClass({
  handleChange: function (e) {
    const separator = this.props.field.get('separator', ', ');
    this.props.onChange(e.target.value.split(separator).map((item) => item.trim()));
  },

  render: function () {
    const separator = this.props.field.get('separator', ', ');
    const value = this.props.value;
    return h('input', {
      id: this.props.forID,
      className: this.props.classNameWrapper,
      type: 'text',
      value: value ? value.join(separator) : '',
      onChange: this.handleChange,
    });
  },
});

const ArrayPreview = createClass({
  render: function () {
    const value = this.props.value;
    return h(
      'ul',
      { style: { margin: '0', paddingLeft: '20px' } },
      Array.isArray(value) && value.map((item, index) => h('li', { key: index }, item)),
    );
  },
});

const schema = {
  properties: {
    separator: { type: 'string' },
  },
};

CMS.registerFieldType('array', ArrayControl, ArrayPreview, schema);
```

#### Color Picker

A custom field type with a color input and preview:

```js [HTM]
const ColorControl = ({ forID, classNameWrapper, value, onChange }) => html`
  <input
    id=${forID}
    class=${classNameWrapper}
    type="color"
    value=${value || '#000000'}
    onChange=${(e) => onChange(e.target.value)}
  />
`;

const ColorPreview = ({ value }) => html`
  <div
    style=${{
      display: 'inline-block',
      width: '30px',
      height: '30px',
      backgroundColor: value || '#000000',
      border: '1px solid #ddd',
      borderRadius: '4px',
    }}
  />
`;

CMS.registerFieldType('color-swatch', ColorControl, ColorPreview);
```

```jsx [JSX]
class ColorControl extends React.Component {
  render() {
    return (
      <input
        id={this.props.forID}
        className={this.props.classNameWrapper}
        type="color"
        value={this.props.value || '#000000'}
        onChange={(e) => this.props.onChange(e.target.value)}
      />
    );
  }
}

class ColorPreview extends React.Component {
  render() {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '30px',
          height: '30px',
          backgroundColor: this.props.value || '#000000',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      />
    );
  }
}

CMS.registerFieldType('color-swatch', ColorControl, ColorPreview);
```

```js [h()]
const ColorControl = createClass({
  render: function () {
    return h('input', {
      id: this.props.forID,
      className: this.props.classNameWrapper,
      type: 'color',
      value: this.props.value || '#000000',
      onChange: (e) => this.props.onChange(e.target.value),
    });
  },
});

const ColorPreview = createClass({
  render: function () {
    return h('div', {
      style: {
        display: 'inline-block',
        width: '30px',
        height: '30px',
        backgroundColor: this.props.value || '#000000',
        border: '1px solid #ddd',
        borderRadius: '4px',
      },
    });
  },
});

CMS.registerFieldType('color-swatch', ColorControl, ColorPreview);
```

#### Number with Validation

A field type for numbers with custom validation and constraints:

```js [HTM]
const { useImperativeHandle } = CMS.React;

const NumberControl = ({ field, forID, classNameWrapper, value, onChange, ref }) => {
  const min = field.get('min');
  const max = field.get('max');

  useImperativeHandle(
    ref,
    () => ({
      isValid: (value) => {
        // Leave an empty field to the `required` option
        if (value == null) {
          return true;
        }

        if (Number.isNaN(value)) {
          return { error: { message: 'Must be a number' } };
        }

        if (min !== undefined && value < min) {
          return { error: { message: `Value must be at least ${min}` } };
        }

        if (max !== undefined && value > max) {
          return { error: { message: `Value must be no more than ${max}` } };
        }

        return true;
      },
    }),
    [min, max],
  );

  return html`
    <input
      id=${forID}
      class=${classNameWrapper}
      type="number"
      value=${value ?? ''}
      min=${min}
      max=${max}
      onChange=${(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
    />
  `;
};

const NumberPreview = ({ value }) => html`<span>${String(value ?? '')}</span>`;

const schema = {
  properties: {
    min: { type: 'number' },
    max: { type: 'number' },
  },
};

CMS.registerFieldType('bounded-number', NumberControl, NumberPreview, schema);
```

```jsx [JSX]
class NumberControl extends React.Component {
  isValid(value) {
    const min = this.props.field.get('min');
    const max = this.props.field.get('max');

    // Leave an empty field to the `required` option
    if (value == null) {
      return true;
    }

    if (Number.isNaN(value)) {
      return { error: { message: 'Must be a number' } };
    }

    if (min !== undefined && value < min) {
      return { error: { message: `Value must be at least ${min}` } };
    }

    if (max !== undefined && value > max) {
      return { error: { message: `Value must be no more than ${max}` } };
    }

    return true;
  }

  render() {
    const min = this.props.field.get('min');
    const max = this.props.field.get('max');

    return (
      <input
        id={this.props.forID}
        className={this.props.classNameWrapper}
        type="number"
        value={this.props.value ?? ''}
        min={min}
        max={max}
        onChange={(e) =>
          this.props.onChange(e.target.value === '' ? null : parseFloat(e.target.value))
        }
      />
    );
  }
}

class NumberPreview extends React.Component {
  render() {
    return <span>{String(this.props.value ?? '')}</span>;
  }
}

const schema = {
  properties: {
    min: { type: 'number' },
    max: { type: 'number' },
  },
};

CMS.registerFieldType('bounded-number', NumberControl, NumberPreview, schema);
```

```js [h()]
const NumberControl = createClass({
  isValid: function (value) {
    const min = this.props.field.get('min');
    const max = this.props.field.get('max');

    // Leave an empty field to the `required` option
    if (value == null) {
      return true;
    }

    if (Number.isNaN(value)) {
      return { error: { message: 'Must be a number' } };
    }

    if (min !== undefined && value < min) {
      return { error: { message: `Value must be at least ${min}` } };
    }

    if (max !== undefined && value > max) {
      return { error: { message: `Value must be no more than ${max}` } };
    }

    return true;
  },

  render: function () {
    const min = this.props.field.get('min');
    const max = this.props.field.get('max');

    return h('input', {
      id: this.props.forID,
      className: this.props.classNameWrapper,
      type: 'number',
      value: this.props.value ?? '',
      min: min,
      max: max,
      onChange: (e) =>
        this.props.onChange(e.target.value === '' ? null : parseFloat(e.target.value)),
    });
  },
});

const NumberPreview = createClass({
  render: function () {
    return h('span', {}, String(this.props.value ?? ''));
  },
});

const schema = {
  properties: {
    min: { type: 'number' },
    max: { type: 'number' },
  },
};

CMS.registerFieldType('bounded-number', NumberControl, NumberPreview, schema);
```

#### JSON Editor

A field type for editing JSON data with validation:

```js [HTM]
const { useImperativeHandle } = CMS.React;

const JsonControl = ({ forID, classNameWrapper, value, onChange, ref }) => {
  useImperativeHandle(
    ref,
    () => ({
      isValid: (value) => {
        if (typeof value !== 'string') {
          return true; // Allow null/undefined
        }

        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return { error: { message: `Invalid JSON: ${e.message}` } };
        }
      },
    }),
    [],
  );

  const stringValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

  return html`
    <textarea
      id=${forID}
      class=${classNameWrapper}
      value=${stringValue || ''}
      onChange=${(e) => onChange(e.target.value)}
      style="font-family: monospace; font-size: 12px; min-height: 200px"
    />
  `;
};

const JsonPreview = ({ value }) => {
  let parsed;
  try {
    parsed = typeof value === 'string' ? JSON.parse(value) : value;
  } catch (e) {
    return html`<div style="color: red">Invalid JSON</div>`;
  }

  return html`
    <pre
      style=${{
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '300px',
      }}
    >
      ${JSON.stringify(parsed, null, 2)}
    </pre>
  `;
};

CMS.registerFieldType('json', JsonControl, JsonPreview);
```

```jsx [JSX]
class JsonControl extends React.Component {
  isValid(value) {
    if (typeof value !== 'string') {
      return true; // Allow null/undefined
    }

    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return { error: { message: `Invalid JSON: ${e.message}` } };
    }
  }

  render() {
    const value = this.props.value;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

    return (
      <textarea
        id={this.props.forID}
        className={this.props.classNameWrapper}
        value={stringValue || ''}
        onChange={(e) => this.props.onChange(e.target.value)}
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          minHeight: '200px',
        }}
      />
    );
  }
}

class JsonPreview extends React.Component {
  render() {
    const value = this.props.value;

    let parsed;
    try {
      parsed = typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
      return <div style={{ color: 'red' }}>Invalid JSON</div>;
    }

    return (
      <pre
        style={{
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '300px',
        }}
      >
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  }
}

CMS.registerFieldType('json', JsonControl, JsonPreview);
```

```js [h()]
const JsonControl = createClass({
  isValid: function (value) {
    if (typeof value !== 'string') {
      return true; // Allow null/undefined
    }

    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return { error: { message: `Invalid JSON: ${e.message}` } };
    }
  },

  render: function () {
    const value = this.props.value;
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

    return h('textarea', {
      id: this.props.forID,
      className: this.props.classNameWrapper,
      value: stringValue || '',
      onChange: (e) => this.props.onChange(e.target.value),
      style: {
        fontFamily: 'monospace',
        fontSize: '12px',
        minHeight: '200px',
      },
    });
  },
});

const JsonPreview = createClass({
  render: function () {
    const value = this.props.value;

    let parsed;
    try {
      parsed = typeof value === 'string' ? JSON.parse(value) : value;
    } catch (e) {
      return h('div', { style: { color: 'red' } }, 'Invalid JSON');
    }

    return h(
      'pre',
      {
        style: {
          backgroundColor: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '300px',
        },
      },
      JSON.stringify(parsed, null, 2),
    );
  },
});

CMS.registerFieldType('json', JsonControl, JsonPreview);
```

#### Image with Metadata

A field type that stores both image path and alt text:

```js [HTM]
const ImageMetaControl = ({ forID, value, onChange }) => {
  const current = value || {};

  const handleChange = (field, fieldValue) => {
    onChange({
      ...current,
      [field]: fieldValue,
    });
  };

  return html`
    <div style="display: flex; flex-direction: column; gap: 10px">
      <div>
        <label for="${forID}-image">Image path:</label>
        <input
          id="${forID}-image"
          type="text"
          value=${current.image || ''}
          onChange=${(e) => handleChange('image', e.target.value)}
          style="width: 100%; padding: 8px"
        />
      </div>
      <div>
        <label for="${forID}-alt">Alt text:</label>
        <textarea
          id="${forID}-alt"
          value=${current.alt || ''}
          onChange=${(e) => handleChange('alt', e.target.value)}
          style="width: 100%; padding: 8px; min-height: 60px"
        />
      </div>
    </div>
  `;
};

const ImageMetaPreview = ({ value, getAsset }) => {
  const current = value || {};
  // Resolve a path in the repository to a URL, or use an external URL as is
  const src = current.image && (getAsset(current.image)?.url ?? current.image);

  return html`
    <div>
      ${src && html`<img src=${src} alt=${current.alt || ''} style="max-width: 200px" />`}
      ${current.alt && html`<p style="font-size: 12px; color: #666">Alt: ${current.alt}</p>`}
    </div>
  `;
};

CMS.registerFieldType('imageMeta', ImageMetaControl, ImageMetaPreview);
```

```jsx [JSX]
class ImageMetaControl extends React.Component {
  handleChange = (field, value) => {
    const current = this.props.value || {};
    this.props.onChange({
      ...current,
      [field]: value,
    });
  };

  render() {
    const value = this.props.value || {};

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label htmlFor={`${this.props.forID}-image`}>Image path:</label>
          <input
            id={`${this.props.forID}-image`}
            type="text"
            value={value.image || ''}
            onChange={(e) => this.handleChange('image', e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div>
          <label htmlFor={`${this.props.forID}-alt`}>Alt text:</label>
          <textarea
            id={`${this.props.forID}-alt`}
            value={value.alt || ''}
            onChange={(e) => this.handleChange('alt', e.target.value)}
            style={{ width: '100%', padding: '8px', minHeight: '60px' }}
          />
        </div>
      </div>
    );
  }
}

class ImageMetaPreview extends React.Component {
  render() {
    const value = this.props.value || {};
    // Resolve a path in the repository to a URL, or use an external URL as is
    const src = value.image && (this.props.getAsset(value.image)?.url ?? value.image);

    return (
      <div>
        {src && <img src={src} alt={value.alt || ''} style={{ maxWidth: '200px' }} />}
        {value.alt && <p style={{ fontSize: '12px', color: '#666' }}>Alt: {value.alt}</p>}
      </div>
    );
  }
}

CMS.registerFieldType('imageMeta', ImageMetaControl, ImageMetaPreview);
```

```js [h()]
const ImageMetaControl = createClass({
  handleChange: function (field, value) {
    const current = this.props.value || {};
    this.props.onChange({
      ...current,
      [field]: value,
    });
  },

  render: function () {
    const value = this.props.value || {};

    return h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      h(
        'div',
        {},
        h('label', { htmlFor: `${this.props.forID}-image` }, 'Image path:'),
        h('input', {
          id: `${this.props.forID}-image`,
          type: 'text',
          value: value.image || '',
          onChange: (e) => this.handleChange('image', e.target.value),
          style: { width: '100%', padding: '8px' },
        }),
      ),
      h(
        'div',
        {},
        h('label', { htmlFor: `${this.props.forID}-alt` }, 'Alt text:'),
        h('textarea', {
          id: `${this.props.forID}-alt`,
          value: value.alt || '',
          onChange: (e) => this.handleChange('alt', e.target.value),
          style: { width: '100%', padding: '8px', minHeight: '60px' },
        }),
      ),
    );
  },
});

const ImageMetaPreview = createClass({
  render: function () {
    const value = this.props.value || {};
    // Resolve a path in the repository to a URL, or use an external URL as is
    const src = value.image && (this.props.getAsset(value.image)?.url ?? value.image);

    return h(
      'div',
      {},
      src && h('img', { src, alt: value.alt || '', style: { maxWidth: '200px' } }),
      value.alt && h('p', { style: { fontSize: '12px', color: '#666' } }, `Alt: ${value.alt}`),
    );
  },
});

CMS.registerFieldType('imageMeta', ImageMetaControl, ImageMetaPreview);
```

#### Image with Derived Files

A field type that lets the user pick an image with the [`pickFile` prop](#picking-files), generates a small WebP thumbnail in the browser and stores the paths of both files along with the aspect ratio. The user can either upload a new image or choose one already in the repository. The thumbnail is added to the entry draft with the [`addFile` prop](#uploading-files), and any new file is uploaded when the entry is saved.

Given the following field configuration, the files are saved to the `static/photos` folder and referenced as `/photos/...` in the entry:

```yaml
fields:
  - name: photo
    label: Photo
    widget: photo # custom field type name
    media_folder: /static/photos
    public_folder: /photos
```

```js [HTM]
const { useState } = CMS.React;

/**
 * Resize an image file to the given width and return it as a WebP `Blob`.
 */
const createThumbnail = async (file, width) => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = width / bitmap.width;

  canvas.width = width;
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return {
    blob: await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp')),
    aspectRatio: bitmap.width / bitmap.height,
  };
};

const PhotoControl = ({ forID, value, onChange, getAsset, addFile, pickFile }) => {
  const [error, setError] = useState(null);
  // `getAsset` resolves both a public path and a temporary URL to a URL that can be displayed
  const thumbnailAsset = value?.thumbnail && getAsset(value.thumbnail);

  const handlePick = async () => {
    try {
      // The URL option is disabled because the thumbnail can only be derived from the file contents
      const picked = await pickFile({ accept: 'image/*', allowURL: false });

      if (!picked) {
        return;
      }

      const { blob, aspectRatio } = await createThumbnail(picked.file, 50);
      const fileName = picked.file.name || picked.value.split('/').pop();
      const baseName = fileName.replace(/\.[^.]+$/, '');

      // `original` is either the public path of an existing image or a temporary URL of a new
      // upload; `thumbnail` is always a temporary URL. Temporary URLs are replaced with the public
      // paths of the uploaded files when the entry is saved
      const original = picked.value;
      const thumbnail = await addFile(blob, { name: `${baseName}-thumb.webp` });

      setError(null);
      onChange({ original, thumbnail, aspectRatio });
    } catch (e) {
      setError(e.message);
    }
  };

  return html`
    <div style="display: flex; flex-direction: column; gap: 10px">
      <button id=${forID} type="button" onClick=${handlePick}>Choose Image</button>
      ${thumbnailAsset && html`<img src=${thumbnailAsset.url} alt="" width="50" />`}
      ${error && html`<p style="color: red">${error}</p>`}
    </div>
  `;
};

const PhotoPreview = ({ value, getAsset }) => {
  const original = value?.original && getAsset(value.original);

  if (!original) {
    return null;
  }

  return html`<img src=${original.url} alt="" style="max-width: 300px" />`;
};

CMS.registerFieldType('photo', PhotoControl, PhotoPreview);
```

```jsx [JSX]
/**
 * Resize an image file to the given width and return it as a WebP `Blob`.
 */
const createThumbnail = async (file, width) => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = width / bitmap.width;

  canvas.width = width;
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return {
    blob: await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp')),
    aspectRatio: bitmap.width / bitmap.height,
  };
};

class PhotoControl extends React.Component {
  state = { error: null };

  handlePick = async () => {
    try {
      // The URL option is disabled because the thumbnail can only be derived from the file contents
      const picked = await this.props.pickFile({ accept: 'image/*', allowURL: false });

      if (!picked) {
        return;
      }

      const { blob, aspectRatio } = await createThumbnail(picked.file, 50);
      const fileName = picked.file.name || picked.value.split('/').pop();
      const baseName = fileName.replace(/\.[^.]+$/, '');

      // `original` is either the public path of an existing image or a temporary URL of a new
      // upload; `thumbnail` is always a temporary URL. Temporary URLs are replaced with the public
      // paths of the uploaded files when the entry is saved
      const original = picked.value;
      const thumbnail = await this.props.addFile(blob, { name: `${baseName}-thumb.webp` });

      this.setState({ error: null });
      this.props.onChange({ original, thumbnail, aspectRatio });
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  render() {
    const value = this.props.value || {};
    // `getAsset` resolves both a public path and a temporary URL to a URL that can be displayed
    const thumbnail = value.thumbnail && this.props.getAsset(value.thumbnail);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button id={this.props.forID} type="button" onClick={this.handlePick}>
          Choose Image
        </button>
        {thumbnail && <img src={thumbnail.url} alt="" width={50} />}
        {this.state.error && <p style={{ color: 'red' }}>{this.state.error}</p>}
      </div>
    );
  }
}

class PhotoPreview extends React.Component {
  render() {
    const value = this.props.value || {};
    const original = value.original && this.props.getAsset(value.original);

    if (!original) {
      return null;
    }

    return <img src={original.url} alt="" style={{ maxWidth: '300px' }} />;
  }
}

CMS.registerFieldType('photo', PhotoControl, PhotoPreview);
```

```js [h()]
/**
 * Resize an image file to the given width and return it as a WebP `Blob`.
 */
const createThumbnail = async (file, width) => {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = width / bitmap.width;

  canvas.width = width;
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return {
    blob: await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp')),
    aspectRatio: bitmap.width / bitmap.height,
  };
};

const PhotoControl = createClass({
  getInitialState: function () {
    return { error: null };
  },

  handlePick: async function () {
    try {
      // The URL option is disabled because the thumbnail can only be derived from the file contents
      const picked = await this.props.pickFile({ accept: 'image/*', allowURL: false });

      if (!picked) {
        return;
      }

      const { blob, aspectRatio } = await createThumbnail(picked.file, 50);
      const fileName = picked.file.name || picked.value.split('/').pop();
      const baseName = fileName.replace(/\.[^.]+$/, '');

      // `original` is either the public path of an existing image or a temporary URL of a new
      // upload; `thumbnail` is always a temporary URL. Temporary URLs are replaced with the public
      // paths of the uploaded files when the entry is saved
      const original = picked.value;
      const thumbnail = await this.props.addFile(blob, { name: `${baseName}-thumb.webp` });

      this.setState({ error: null });
      this.props.onChange({ original, thumbnail, aspectRatio });
    } catch (error) {
      this.setState({ error: error.message });
    }
  },

  render: function () {
    const value = this.props.value || {};
    // `getAsset` resolves both a public path and a temporary URL to a URL that can be displayed
    const thumbnail = value.thumbnail && this.props.getAsset(value.thumbnail);

    return h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
      h(
        'button',
        { id: this.props.forID, type: 'button', onClick: this.handlePick },
        'Choose Image',
      ),
      thumbnail && h('img', { src: thumbnail.url, alt: '', width: 50 }),
      this.state.error && h('p', { style: { color: 'red' } }, this.state.error),
    );
  },
});

const PhotoPreview = createClass({
  render: function () {
    const value = this.props.value || {};
    const original = value.original && this.props.getAsset(value.original);

    if (!original) {
      return null;
    }

    return h('img', { src: original.url, alt: '', style: { maxWidth: '300px' } });
  },
});

CMS.registerFieldType('photo', PhotoControl, PhotoPreview);
```

Once saved, the entry holds the public paths, which your site can use for a blurred placeholder, a `srcset` or a fixed-ratio box that avoids layout shift:

```yaml
photo:
  original: /photos/sunset.jpg
  thumbnail: /photos/sunset-thumb.webp
  aspectRatio: 1.5
```

#### Dependent Select

A field type that reuses the built-in [Select](https://sveltiacms.app/en/docs/fields/select) control, with options generated from another field in the same entry. This solves a common need that a static `options` list or a [Relation](https://sveltiacms.app/en/docs/fields/relation) field can’t cover: the choices are defined by the user in the entry they are editing.

Given a collection where a `groups` list field defines named items, and each item of a `content` list field has to reference one of those groups:

```yaml
fields:
  - name: groups
    label: Groups
    widget: list
    fields:
      - name: name
        label: Name
        widget: string
      - name: text
        label: Text
        widget: markdown
  - name: content
    label: Content
    widget: list
    fields:
      - name: group
        label: Referenced Group
        widget: group-select # custom field type name
```

The `group-select` control reads the group names from the `entry` prop and passes them to the built-in Select control as options. Because the `entry` prop is updated whenever any field in the entry is modified, the options reflect the group names as they are typed, with no need to save and reload:

```js [HTM]
const SelectControl = CMS.getFieldType('select').control;

const GroupSelectControl = ({ entry, field, forID, value, onChange }) => {
  const groups = entry.getIn(['data', 'groups']);

  const options = (groups?.toJS() ?? [])
    .filter((group) => !!group.name)
    .map((group) => ({ label: group.name, value: group.name }));

  return html`
    <${SelectControl}
      field=${{ name: field.get('name'), options }}
      value=${value}
      forID=${forID}
      onChange=${onChange}
    />
  `;
};

CMS.registerFieldType('group-select', GroupSelectControl);
```

```jsx [JSX]
const SelectControl = CMS.getFieldType('select').control;

class GroupSelectControl extends React.Component {
  render() {
    const groups = this.props.entry.getIn(['data', 'groups']);

    const options = (groups?.toJS() ?? [])
      .filter((group) => !!group.name)
      .map((group) => ({ label: group.name, value: group.name }));

    return (
      <SelectControl
        field={{ name: this.props.field.get('name'), options }}
        value={this.props.value}
        forID={this.props.forID}
        onChange={this.props.onChange}
      />
    );
  }
}

CMS.registerFieldType('group-select', GroupSelectControl);
```

```js [h()]
const SelectControl = CMS.getFieldType('select').control;

const GroupSelectControl = createClass({
  render: function () {
    const groups = this.props.entry.getIn(['data', 'groups']);

    const options = (groups?.toJS() ?? [])
      .filter((group) => !!group.name)
      .map((group) => ({ label: group.name, value: group.name }));

    return h(SelectControl, {
      field: { name: this.props.field.get('name'), options },
      value: this.props.value,
      forID: this.props.forID,
      onChange: this.props.onChange,
    });
  },
});

CMS.registerFieldType('group-select', GroupSelectControl);
```

**Tip**

The field configuration passed to a built-in control doesn’t have to come from your CMS config, as shown above. Any option supported by the field type can be set, such as [`multiple`](https://sveltiacms.app/en/docs/fields/select#multiple) or [`dropdown_threshold`](https://sveltiacms.app/en/docs/fields/select#dropdown-threshold) for the Select field type.

### Showcase

Real-world examples of custom field types can be found in our [showcase](https://sveltiacms.app/en/showcase?feature=field-types).

Source: https://sveltiacms.app/en/docs/api/field-types
