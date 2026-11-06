# JavaScript API

Manual initialization, events, custom file formats, custom string transformations and custom pages. For custom field types, see `api-field-types.md`; for editor components, see `api-editor-components.md`; for preview customization, see `api-previews.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## JavaScript API

Sveltia CMS provides a flexible, client-side JavaScript/TypeScript API that allows developers to customize and extend its functionality. This document provides an overview of the main API components and how to use them.

### Accessing the `CMS` Object

The main entry point for the Sveltia CMS JavaScript API is the global `CMS` object. This object exposes various methods for initializing the CMS, registering custom components and interacting with the CMS programmatically.

There are two primary ways to access the `CMS` object: via a CDN build or by installing the npm package.

#### Using the CDN

`CMS` is exposed as a global variable when using the UNPKG CDN build. You can access it directly in your scripts:

```html
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
<script>
  CMS.init({ config });
  CMS.registerPreviewStyle(filePath);
  CMS.registerEditorComponent(definition);
</script>
```

Alternatively, you can use the ES module version, which can be imported using the `mjs` file extension:

```html
<script type="module">
  import CMS from 'https://unpkg.com/@sveltia/cms/dist/sveltia-cms.mjs';

  CMS.init({ config });
  CMS.registerPreviewStyle(filePath);
  CMS.registerEditorComponent(definition);
</script>
```

#### Using the npm Package

The npm package is a separate build of the app for use with a build tool like [Vite](https://vite.dev/) or [webpack](https://webpack.js.org/), which doesn’t load any files from CDNs. See [CDN or npm Package](https://sveltiacms.app/en/docs/releases#cdn-or-npm-package) for how it differs from the CDN builds.

Install the `@sveltia/cms` package via your preferred package manager:

```bash [npm]
npm install @sveltia/cms
```

```bash [yarn]
yarn add @sveltia/cms
```

```bash [pnpm]
pnpm add @sveltia/cms
```

```bash [bun]
bun add @sveltia/cms
```

Then, import the `CMS` object in your script to access the initialization and other API methods:

```js
import CMS from '@sveltia/cms';

CMS.init({ config });
CMS.registerPreviewStyle(filePath);
CMS.registerEditorComponent(definition);
```

or import only the methods you need:

```js
import { init } from '@sveltia/cms';

init({ config });
```

TypeScript types are included in the package, so if you edit your project with a TypeScript-aware editor like VS Code, you should get type checking and autocompletion without any additional setup.

### Available Methods

Currently, the following methods are available on the `CMS` object:

| Feature | Methods |
| --- | --- |
| [Manual Initialization](https://sveltiacms.app/en/docs/api/initialization) | `init` |
| [Custom Preview Styles](https://sveltiacms.app/en/docs/api/preview-styles) | `registerPreviewStyle` |
| [Custom Preview Templates](https://sveltiacms.app/en/docs/api/preview-templates) | `registerPreviewTemplate` |
| [Custom Editor Components](https://sveltiacms.app/en/docs/api/editor-components) | `registerEditorComponent` |
| [Custom Field Types](https://sveltiacms.app/en/docs/api/field-types) | `registerFieldType` (alias: `registerWidget`)<br />`getFieldType` (alias: `getWidget`) |
| [Custom File Formats](https://sveltiacms.app/en/docs/api/file-formats) | `registerCustomFormat` |
| [Custom String Transformations](https://sveltiacms.app/en/docs/api/string-transformations) | `registerStringTransformation` |
| [Custom Pages](https://sveltiacms.app/en/docs/api/custom-pages) | `registerCustomPage` |
| [Event Hooks](https://sveltiacms.app/en/docs/api/events) | `registerEventListener` |
| [Rendering Markdown](https://sveltiacms.app/en/docs/api/rendering-markdown) | `renderRichText` |

**Breaking changes from Netlify/Decap CMS**

The methods other than those listed above are not supported in Sveltia CMS. This includes:

- `registerLocale`: Sveltia CMS automatically detects and uses the browser’s language settings for localization. No manual registration of locales is necessary.
- `registerRemarkPlugin`: Sveltia CMS uses the Lexical framework for Markdown processing instead of Remark. Therefore, Remark plugins are not compatible.
- All other undocumented methods, including custom backends and custom media storage providers. We may support these features in the future, but our implementation would likely be incompatible with Netlify/Decap CMS.

### Writing React Components

For [Custom Preview Templates](https://sveltiacms.app/en/docs/api/preview-templates), [Custom Editor Components](https://sveltiacms.app/en/docs/api/editor-components), [Custom Field Types](https://sveltiacms.app/en/docs/api/field-types) and [Custom Pages](https://sveltiacms.app/en/docs/api/custom-pages), you can use React components to create rich, interactive previews and editor interfaces. Sveltia CMS supports three ways to write the markup of these components, and the examples throughout the documentation show all of them:

- [HTM](#using-htm) — HTML-like markup in a tagged template literal. It works without a build step, so it’s the recommended way.
- [JSX](#using-jsx) — The familiar React syntax, which requires a build step.
- [`h()`](#using-h) — Plain function calls, compatible with Netlify/Decap CMS.

A component can be a class component, a function component or a component wrapped with `memo` or `forwardRef`.

Sveltia CMS bundles its own copy of React 19 to render them, so write your components for React 19. That copy is available as `CMS.React` and as the `React` export of the npm package. It gives you the full React API, including [hooks](#using-hooks).

#### Using HTM

[HTM](https://github.com/developit/htm) lets you write JSX-like markup in a standard JavaScript [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates), so your components run in the browser as is, with no transpiler involved.

Sveltia CMS bundles HTM and exposes the `html` tag on the `window` object, bound to its copy of React. No imports are necessary to use it, even if you install the npm package:

```js
const Greeting = ({ name }) => html`<p class="greeting">Hello, ${name}!</p>`;
```

The syntax is close to JSX, with a few differences:

- Embed a value with `${}` instead of `{}`, both in text and in attributes, e.g. `<input value=${value} />`. An attribute can also mix static text and values, e.g. `style="color: ${color}"`.
- Embed a component the same way, e.g. `<${Badge} label="New" />`. Close it with `<//>` or `</${Badge}>`.
- Spread props with `...${props}`, e.g. `<input ...${props} />`.
- A template can have multiple root elements, in which case it returns an array of them, so you don’t need a fragment.

The template creates React elements, so props are the same as in JSX. Event handlers are named `onClick`, `onChange` and so on, and a component receives whatever you pass.

For convenience, you can also use some HTML attribute names and values that React doesn’t accept in JSX:

- `class` and `for` work in place of `className` and `htmlFor`.
- The `style` attribute can be a CSS string, e.g. `style="margin: 0; color: red"`, as well as an object.

See the [HTM documentation](https://github.com/developit/htm#syntax-like-jsx-but-also-lit) for the full syntax.

#### Using JSX

Sveltia CMS does not provide a built-in JSX transpiler. To use JSX syntax, you need a build step to transpile it to JavaScript, such as [Vite](https://vitejs.dev/).

#### Using `h()`

Netlify/Decap CMS documents components written with plain `createElement()` calls, without any markup. For compatibility, Sveltia CMS exposes a few shorthands globally: `h` (and its alias `createElement`) and `createClass`, plus `rf` for `React.Fragment`:

- `h` (or `createElement`) — An alias for `CMS.React.createElement()`, used to create React elements in the `h()` examples
- `rf` — An alias for `CMS.React.Fragment`, used to create React fragments in the `h()` examples
- `createClass` — Used to define React class components without the `class` syntax. It comes from the [`create-react-class`](https://www.npmjs.com/package/create-react-class) package, as React itself no longer provides it

These are available on the `window` object when Sveltia CMS is loaded, so no imports are necessary to use them. React itself isn’t a global, so it can’t clash with another copy of React your page may load. Use `CMS.React` for anything else.

Define the methods you pass to `createClass`, such as `render`, as function expressions rather than arrow functions. `createClass` binds each method to the component instance, but an arrow function can’t be bound, so `this.props` would be undefined within it. Any other function, including a callback within a method, can be an arrow function.

See [React Without JSX](https://legacy.reactjs.org/docs/react-without-jsx.html) for more information on how to use React without JSX.

#### Using Hooks

Function components can use React hooks such as `useState` and `useEffect`, as long as the hooks come from the copy of React bundled with Sveltia CMS — `CMS.React`, or the `React` export of the npm package:

```js [CDN]
const { useState, useEffect } = CMS.React;
```

```js [npm]
import CMS, { React } from '@sveltia/cms';

const { useState, useEffect } = React;
```

For example, the following control for a [custom field type](https://sveltiacms.app/en/docs/api/field-types) keeps whether its text area is expanded in state:

```js [HTM]
const { useState } = CMS.React;

const NotesControl = ({ forID, classNameWrapper, value, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  return html`
    <textarea
      id=${forID}
      class=${classNameWrapper}
      rows=${expanded ? 12 : 3}
      value=${value ?? ''}
      onChange=${(event) => onChange(event.target.value)}
    />
    <button type="button" onClick=${() => setExpanded(!expanded)}>
      ${expanded ? 'Collapse' : 'Expand'}
    </button>
  `;
};

CMS.registerFieldType('notes', NotesControl);
```

```jsx [JSX]
const { useState } = CMS.React;

const NotesControl = ({ forID, classNameWrapper, value, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <textarea
        id={forID}
        className={classNameWrapper}
        rows={expanded ? 12 : 3}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="button" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Collapse' : 'Expand'}
      </button>
    </>
  );
};

CMS.registerFieldType('notes', NotesControl);
```

```js [h()]
const { useState } = CMS.React;

const NotesControl = ({ forID, classNameWrapper, value, onChange }) => {
  const [expanded, setExpanded] = useState(false);

  return h(
    rf,
    null,
    h('textarea', {
      id: forID,
      className: classNameWrapper,
      rows: expanded ? 12 : 3,
      value: value ?? '',
      onChange: (event) => onChange(event.target.value),
    }),
    h(
      'button',
      { type: 'button', onClick: () => setExpanded(!expanded) },
      expanded ? 'Collapse' : 'Expand',
    ),
  );
};

CMS.registerFieldType('notes', NotesControl);
```

A hook imported from another copy of React, such as the `react` package in your project’s dependencies, throws an “Invalid hook call” error. Take your hooks from the right place, and never from the `react` package:

- If you install the npm package, import `React` from `@sveltia/cms` and take the hooks from it.
- If you load Sveltia CMS from the CDN, take the hooks from `CMS.React` (`window.CMS.React`). This applies even when you bundle your own components with a build tool, because importing `@sveltia/cms` in that case would load a second copy of the CMS.

The JSX itself can still be compiled with your project’s `react` package, as long as it’s React 19 too, so that Sveltia CMS can render the elements it creates.

Source: https://sveltiacms.app/en/docs/api

---

## Manual Initialization

By default, Sveltia CMS automatically initializes itself when the script is loaded. However, in some cases, you may want to have more control over when and how the CMS is initialized. This is where the `init` function comes into play.

### Overview

To manually initialize the CMS, call the `init` function on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.init({ config });
```

#### Parameters

- `config` (optional): An object that can contain any of the configuration options available in the `config.yml` file. If provided, how it’s used depends on the `load_config_file` option:
  - If `load_config_file` is `true` or omitted, this configuration is merged with the one loaded from `config.yml`, and its options take precedence over the file’s. The exception is arrays such as `collections`, which are concatenated rather than replaced, so an item can be added but not replaced.
  - If `load_config_file` is `false`, this configuration is used directly as a complete configuration.

#### Return Value

The function returns a Promise that resolves once the app has been mounted. The app is mounted on the [`<div id="nc-root">`](https://sveltiacms.app/en/docs/customization#custom-mount-element) element if present, or the `<body>` element otherwise. If the page is still loading and there is no such element yet, the CMS waits for the page content to be loaded first.

If `config` is neither an object nor `undefined`, the Promise is rejected with a `TypeError`. Calls after the first one are ignored, so the CMS can only be initialized once.

**Config File Loading Behavior**

Unless you set the `load_config_file` option to `false`, the CMS will always attempt to load the `config.yml` file, even when you provide a configuration object. It raises an error if the file is not found or cannot be loaded. If you want to completely bypass loading the configuration file, make sure to set this option accordingly.

### Usage Notes

#### Preventing Automatic Initialization

If you use the UNPKG CDN, you have to set a global variable `CMS_MANUAL_INIT` to `true` before loading the script to prevent automatic initialization.

```html
<script>
  // Set this before loading the CMS script
  window.CMS_MANUAL_INIT = true;
</script>
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
<script>
  // Now you can call init() manually
  CMS.init();
</script>
```

The `init` function is also exposed as the global `initCMS` variable, so code written for Netlify/Decap CMS, such as `const { CMS, initCMS: init } = window;`, works as is.

For npm installations, you don’t need this step; manual initialization is the default behavior. In other words, you always have to call `init()` yourself.

#### Registering Customizations

The `register*` methods, such as `registerPreviewTemplate` and `registerFieldType`, can be called before or after `init()`. Registered items are looked up when they are needed, and the configuration is loaded asynchronously after `init()` is called. Anything registered in the same script is therefore picked up either way.

However, field type [schemas](https://sveltiacms.app/en/docs/api/field-types#field-schema), [editor component](https://sveltiacms.app/en/docs/api/editor-components) fields, [custom file formats](https://sveltiacms.app/en/docs/api/file-formats) and [custom string transformations](https://sveltiacms.app/en/docs/api/string-transformations) are used when the configuration or the content is loaded. Register them synchronously rather than in a delayed callback, so they are available by then.

#### Typing the Configuration Object

The `CMS` object is typed, so if you are using TypeScript, you will get type checking and autocompletion when providing the configuration object to the `init` function.

You can also import the `CmsConfig` type from the `@sveltia/cms` package to type the configuration object if you construct it outside of the `init` call. Here’s an example:

```ts
import { init, type CmsConfig } from '@sveltia/cms';

const config: CmsConfig = {
  // your config here
};

init({ config });
```

**Experimental Types**

Types other than `CmsConfig` can also be imported for more specific parts of the configuration, such as `GitHubBackend`, `EntryCollection`, `DateTimeField`, etc. However, this is experimental and subject to change, so it’s recommended to use `CmsConfig` for now.

### Examples

#### Initializing the CMS Normally

This will load the configuration from `config.yml` and initialize the CMS as usual, just like the automatic initialization.

```js
CMS.init();
```

#### Providing a Full Configuration

When the `load_config_file` option is set to `false`, the configuration provided here will be used directly, and the `config.yml` file will not be loaded. Make sure to include all required options: `backend`, `media_folder` and `collections`.

```js {3}
CMS.init({
  config: {
    load_config_file: false,
    backend: {
      name: 'github',
      repo: 'user/repo',
    },
    media_folder: '/public/media',
    public_folder: '/media',
    collections: [
      // your collections here
    ],
  },
});
```

#### Providing a Partial Configuration

If the `load_config_file` option is set to `true` or omitted, the configuration provided here will be merged with the one loaded from `config.yml`. The merge uses the [`@fastify/deepmerge`](https://www.npmjs.com/package/@fastify/deepmerge) library, so you can override or add specific settings. Use cases for this are more limited, but it can be useful in some scenarios.

For example, you could override the [backend branch](https://sveltiacms.app/en/docs/backends#branch-selection) like this:

```js
CMS.init({
  config: {
    backend: {
      branch: 'development',
    },
  },
});
```

Objects are merged recursively, but arrays are appended rather than replaced. For example, if `config.yml` defines a `posts` collection and the manual configuration defines a `pages` collection, the CMS will have both collections, in that order:

```js
CMS.init({
  config: {
    collections: [
      {
        name: 'pages',
        // other options
      },
    ],
  },
});
```

This means you can’t use a partial configuration to remove, reorder or modify items in an array such as `collections`. A collection with the same name as one in `config.yml` is added as a separate item rather than overriding it. If you need full control, set `load_config_file` to `false` and provide the complete configuration instead.

**Note for Netlify/Decap CMS users**

The Netlify/Decap CMS documentation says arrays are replaced during the merge. However, Netlify/Decap CMS actually appends them, just like Sveltia CMS, so your existing configuration will work the same way.

### Showcase

Real-world examples of manual initialization can be found in our [showcase](https://sveltiacms.app/en/showcase?feature=initialization).

Source: https://sveltiacms.app/en/docs/api/initialization

---

## Event Hooks

Event hooks allow developers to execute custom code in response to specific events within Sveltia CMS. This feature enables advanced customization and integration with other systems by providing a way to listen for and react to various actions taken within the CMS.

### Overview

To register an event listener, use the `registerEventListener` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerEventListener({ name, handler });
```

The `registerEventListener` method allows you to register a callback function (`handler`) that will be invoked when a specific event (`name`) occurs within the CMS. The handler function receives an object containing relevant data about the event, allowing you to perform custom logic based on the event context.

Multiple event listeners can be registered for the same event, and they will be executed in the order they were registered.

#### Parameters

- `name` (string): The name of the event to listen for. See the [Supported Events](#supported-events) section for a list of available events.
- `handler` (function): A callback function that will be executed when the event is triggered. See the [Event Handler](#event-handler) section for details on the parameters passed to the handler.

<!-- Decap CMS probably doesn’t support multiple listeners -->

### Supported Events

The following events are supported for event hooks:

- `preSave`: Triggered before an entry is saved. You can modify the entry data before it is persisted.
- `postSave`: Triggered after an entry has been saved.

Additionally, the following events are available when using [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial):

- `prePublish`: Triggered before an entry is published. Unlike `preSave`, the handler can’t modify the entry, and a returned value is ignored. This is because the content is already committed to the pull/merge request by this point.
- `postPublish`: Triggered after an entry has been published.
- `preUnpublish`: Triggered before a published entry is removed from the configured branch. This happens when a deletion is published, not when it’s requested.
- `postUnpublish`: Triggered after a published entry has been removed from the configured branch.

### Event Handler

The handler function receives an object with the following properties:

- `author`: The author object that contains the `login` (login name) and `name` (display name) of the user who triggered the event. Both are always strings. A value that isn’t available is an empty string, such as with the [local development workflow](https://sveltiacms.app/en/docs/workflows/local), which doesn’t track user information.
- `entry`: The entry object serialized to an [Immutable Map](https://immutable-js.com/docs/v5/Map/). It contains the following properties:
  ```js
  {
    data: { ... }, // Default locale data
    i18n: {
      [locale]: {
        data: { ... } // Non-default locale data
      }
    },
    slug, // Entry slug
    path, // Entry path
    newRecord, // Boolean indicating if it's a new entry
    collection, // Collection name, or `_singletons` for a singleton
    mediaFiles, // Array of associated media files
  }
  ```

<!-- any other properties? -->

For the `preSave` event, the handler can change the data before it is saved. To do so, return a modified entry object in Immutable Map format, or just the modified `data` Map like `entry.get('data').set('title', 'New Title')`.

Only the changes to `data` and `i18n.*.data` are applied. Changes to other properties, such as `slug`, are ignored.

The handler can be asynchronous and return a Promise that resolves to the modified `entry` or entry `data`. If multiple handlers are registered, each one receives the changes made by the previous ones.

For other events, the return value is ignored.

### Examples

#### Modifying Entry Data Before Save

The following example demonstrates how to register a pre-save hook that adds a last modified timestamp to the entry data before it is saved.

```js
CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    return entry.get('data').set('last_modified', new Date().toISOString());
  },
});
```

#### Accessing I18n Data

If you have [internationalization](https://sveltiacms.app/en/docs/i18n) (i18n) support enabled, event handlers can access and modify localized data under the `i18n` property of the entry object.

The following example shows how to read and update localized fields in a pre-save hook, assuming the entry has English (default), French and other locales configured.

```js
CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    console.info('English Title:', entry.getIn(['data', 'title']));

    entry.get('i18n').forEach((localeData, locale) => {
      console.info(`Locale (${locale}) Title:`, localeData.getIn(['data', 'title']));
    });

    return entry.setIn(['i18n', 'fr', 'data', 'title'], 'Titre en Français');
  },
});
```

The [`getIn`](<https://immutable-js.com/docs/v5/Map/#getIn()>) and [`setIn`](<https://immutable-js.com/docs/v5/Map/#setIn()>) methods from Immutable.js are used to work with nested data structures.

#### Accessing Media Files

The `mediaFiles` property of the entry object lists the assets referenced by the entry’s [Image](https://sveltiacms.app/en/docs/fields/image) and [File](https://sveltiacms.app/en/docs/fields/file) fields. Only assets stored in a [collection-level or field-level media folder](https://sveltiacms.app/en/docs/media/internal) are listed. Assets in the global media folder aren’t included. Each item has the following properties:

- `id`: The Git object ID (SHA-1 hash) of the file.
- `name`: The filename.
- `path`: The file path, relative to the repository root.
- `size`: The file size in bytes.
- `url` and `displayURL`: A temporary [blob URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static) for the file, or `undefined` if it hasn’t been loaded into the browser yet.
- `file`: The [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) object. It’s only set for newly uploaded files that haven’t been saved yet, so you can inspect what’s about to be committed.

The following example demonstrates how to register a pre-save hook that lists the media files associated with the entry and warns about large uploads.

```js
CMS.registerEventListener({
  name: 'preSave',
  handler: ({ entry }) => {
    entry.get('mediaFiles').forEach((media) => {
      const { name, path, size, file } = media.toJS();

      console.info(`${file ? 'Uploading' : 'Referencing'} ${name} (${size} bytes) at ${path}`);

      if (file && size > 1024 * 1024) {
        console.warn(`${name} is larger than 1 MB`);
      }
    });
  },
});
```

The handler doesn’t need to return anything here because the entry data isn’t modified.

#### Getting Notification of Saved Entries

The following example demonstrates how to register a post-save hook that logs information about the saved entry and the author who made the changes.

```js
CMS.registerEventListener({
  name: 'postSave',
  handler: ({ author, entry }) => {
    console.log(`Entry saved by ${author.login || 'Unknown'}:`, entry.toJS());
  },
});
```

The [`toJS`](<https://immutable-js.com/docs/v5/Map/#toJS()>) method from Immutable.js is used to convert the entry object back to a plain JavaScript object for easier logging.

### Showcase

Real-world examples of event hooks can be found in our [showcase](https://sveltiacms.app/en/showcase?feature=events).

Source: https://sveltiacms.app/en/docs/api/events

---

## Custom File Formats

Sveltia CMS comes with built-in support for common file formats like JSON, YAML, TOML and Markdown. However, you can also register your own custom parsers and formatters to handle different file types or formats.

### Overview

To register a custom file format, use the `registerCustomFormat` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerCustomFormat(name, extension, { fromFile, toFile });
```

#### Parameters

- `name` (string): A unique name for the custom format. This name will be used to reference the format in collection configurations. A custom format with the same name as a built-in one, such as `json`, takes precedence over the built-in format. Registering a format with the same name again replaces the previous one.
- `extension` (string): The file extension associated with this format, without a leading dot (e.g. `json5`, `yaml`, `toml`).
- `fromFile` (function): A parser function that takes a string (the content of the file, trimmed and with line breaks normalized to `\n`) and returns a JavaScript object.
- `toFile` (function): A formatter function that takes a JavaScript object and returns a string (the content to be saved to the file). The output is trimmed and a trailing line break is added. The function also receives a context object as the second argument, which has the following property:
  - `serialize` (function): An async function that takes a JavaScript object and returns the content the built-in formatter would save, with the same options, such as the front matter delimiters, field comments and [output options](https://sveltiacms.app/en/docs/data-output#controlling-data-output). The given object is left unchanged. It’s only available when the format name is a built-in one, such as `yaml` or `yaml-frontmatter`. Otherwise, it throws an error. See [Post-Processing Built-In Output](#post-processing-built-in-output) for an example.

You can omit either `fromFile` or `toFile` if you only need to customize one direction (parsing or formatting). You must provide at least one of the two functions, or an error is thrown.

If you omit `fromFile`, the CMS will use the built-in parser for the format name, if any, such as `yaml` or `json`. Similarly, if you omit `toFile`, the CMS will use the built-in formatter.

If the format name isn’t a built-in one, provide both functions:

- Without `fromFile`, files in the format can’t be loaded.
- Without `toFile`, saving an entry fails with an error, leaving the file untouched.

The CMS logs a warning to the browser console when such a function is missing.

The functions `fromFile` and `toFile` can also be asynchronous, allowing you to perform async operations if needed.

### Using Custom Formats

Once registered, the custom format can be used in your collection configurations by specifying the `format` property. For example:

```yaml [YAML]
collections:
  - name: myCollection
    format: json5
    fields:
      - name: item1
        label: Item 1
```

```toml [TOML]
[[collections]]
name = "myCollection"
format = "json5"

[[collections.fields]]
name = "item1"
label = "Item 1"
```

```json [JSON]
{
  "collections": [
    {
      "name": "myCollection",
      "format": "json5",
      "fields": [
        {
          "name": "item1",
          "label": "Item 1"
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
      name: "myCollection",
      format: "json5",
      fields: [
        {
          name: "item1",
          label: "Item 1",
        },
      ],
    },
  ],
}
```

You don’t need to specify the file `extension` in the collection configuration. The CMS will automatically use the extension of the registered format. If the collection has an `extension` option, it’s ignored in favor of the registered one.

### Examples

#### YAML with Alternative Library

By default, Sveltia CMS uses the `yaml` library to parse and format YAML files. If you want to use the `js-yaml` library instead, you can register a custom formatter as follows:

```js
import YAML from 'js-yaml';

CMS.registerCustomFormat('yaml', 'yml', {
  fromFile: (text) => YAML.load(text),
  toFile: (data) => YAML.dump(data),
});
```

The file `extension` in the second argument is set to `yml` to match the default extension for YAML files. You can change it to `yaml` if you prefer.

#### JSON5

The following example demonstrates how to register a custom formatter for the JSON5 format using the `json5` library:

```js
import JSON5 from 'json5';

CMS.registerCustomFormat('json5', 'json5', {
  fromFile: (text) => JSON5.parse(text),
  toFile: (data) => JSON5.stringify(data, null, 2),
});
```

#### JSON with Additional Metadata

You can customize the behavior of the formatter functions. For example, you might want to add a timestamp and version number to the JSON file whenever it is saved:

```js
CMS.registerCustomFormat('json', 'json', {
  toFile: (data) => {
    const completeData = {
      ...data,
      last_updated: new Date().toISOString(),
      version: (data.version ?? 0) + 1,
    };

    return JSON.stringify(completeData, null, 2);
  },
});
```

An [event hook](https://sveltiacms.app/en/docs/api/events) is a better way to add metadata like timestamps, but this example illustrates how you can customize the formatter functions.

`fromFile` is omitted in this example, so the CMS will use the default `JSON.parse` method to parse JSON files.

#### JavaScript Module

The following example demonstrates how to register a custom formatter for JavaScript modules that export data using `export default` syntax and parse it back into a JavaScript object:

```js
CMS.registerCustomFormat('mjs', 'js', {
  fromFile: (text) => JSON.parse(text.replace(/^export default (.+);$/s, '$1')),
  toFile: (data) => `export default ${JSON.stringify(data, null, 2)};`,
});
```

The file extension is set to `js` for demonstration purposes. You can use `mjs` if you prefer.

This example uses a simple regex to extract the JSON object from the `export default` statement. If you need a more robust solution for parsing JavaScript modules, consider using a library like `acorn` or `esbuild` to handle the parsing.

#### Asynchronous Formatter

The parser and formatter functions can also be asynchronous. For example, you might want to format JSON data using a library like Prettier, which returns a promise:

```js
import * as Prettier from 'prettier/standalone';
import * as babelPlugin from 'prettier/plugins/babel';
import * as estreePlugin from 'prettier/plugins/estree';

CMS.registerCustomFormat('json', 'json', {
  toFile: async (data) =>
    Prettier.format(JSON.stringify(data), {
      parser: 'json',
      plugins: [babelPlugin, estreePlugin],
    }),
});
```

If you omit `fromFile`, the CMS will fall back to the built-in parser for the format name. In this case, the standard `JSON.parse` method will be used to parse JSON files.

#### Post-Processing Built-In Output

Instead of formatting the data from scratch, a formatter can call the `serialize` function it receives. This gives it the content the built-in formatter would save, which it can then process further. You keep the CMS’s handling of front matter, field comments and [output options](https://sveltiacms.app/en/docs/data-output#controlling-data-output) while applying your own code formatter, for example to match the formatting rules of your repository:

```js
import * as Prettier from 'prettier/standalone';
import * as markdownPlugin from 'prettier/plugins/markdown';
import * as yamlPlugin from 'prettier/plugins/yaml';

CMS.registerCustomFormat('frontmatter', 'md', {
  toFile: async (data, { serialize }) =>
    Prettier.format(await serialize(data), {
      parser: 'markdown',
      plugins: [markdownPlugin, yamlPlugin],
      proseWrap: 'always',
      printWidth: 100,
    }),
});
```

The format name must match the `format` option of your collection, which is `frontmatter` in this example. The `frontmatter` format reads YAML, TOML and JSON front matter alike. In such a collection, `serialize` writes an existing file in the front matter format it was read in. `fromFile` is omitted, so the built-in parser is used.

If `serialize` or your code formatter throws an error, the entry isn’t saved and the error is shown to the user, leaving the file untouched.

#### Custom Markdown Parser/Formatter

The following example demonstrates how to register a custom parser and formatter for Markdown files that follow a specific structure:

```js
CMS.registerCustomFormat('custom-markdown', 'md', {
  fromFile: (text) => {
    const regex =
      /^# (?<title>.+)\n\n!\[(?<alt>.*)\]\((?<src>.*)\)\n\n> (?<excerpt>.*)\n\n(?<body>[\s\S]*)$/;

    const {
      title = '',
      alt = '',
      src = '',
      excerpt = '',
      body = '',
    } = text.match(regex)?.groups ?? {};

    return {
      title,
      cover: { src, alt },
      excerpt,
      body,
    };
  },
  toFile: (data) => {
    const {
      title,
      cover: { src, alt },
      excerpt,
      body,
    } = data;

    return `# ${title}\n\n![${alt}](${src})\n\n> ${excerpt}\n\n${body}`;
  },
});
```

The above example uses a regular expression to parse the Markdown content into a structured object with `title`, `cover`, `excerpt` and `body` fields. The formatter function then converts the structured object back into the Markdown format.

An example of a Markdown file that would be parsed by this custom format is as follows:

```markdown
# My First Post

![A beautiful sunrise](sunrise.jpg)

> This is a brief excerpt of my first post.

This is the body of my first post. It can contain multiple paragraphs, lists, and other Markdown elements.
```

The collection configuration for this custom format would look like this:

```yaml [YAML]
collections:
  - name: posts
    label: Posts
    thumbnail: cover.src
    folder: content/posts
    format: custom-markdown
    fields:
      - name: title
        label: Title
        widget: string
      - name: cover
        label: Cover Image
        widget: object
        fields:
          - name: src
            label: Source
            widget: image
          - name: alt
            label: Alt Text
            widget: string
      - name: excerpt
        label: Excerpt
        widget: text
      - name: body
        label: Body
        widget: richtext
```

```toml [TOML]
[[collections]]
name = "posts"
label = "Posts"
thumbnail = "cover.src"
folder = "content/posts"
format = "custom-markdown"
[[collections.fields]]
name = "title"
label = "Title"
widget = "string"
[[collections.fields]]
name = "cover"
label = "Cover Image"
widget = "object"
[[collections.fields.fields]]
name = "src"
label = "Source"
widget = "image"
[[collections.fields.fields]]
name = "alt"
label = "Alt Text"
widget = "string"
[[collections.fields]]
name = "excerpt"
label = "Excerpt"
widget = "text"
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
      "label": "Posts",
      "thumbnail": "cover.src",
      "folder": "content/posts",
      "format": "custom-markdown",
      "fields": [
        {
          "name": "title",
          "label": "Title",
          "widget": "string"
        },
        {
          "name": "cover",
          "label": "Cover Image",
          "widget": "object",
          "fields": [
            {
              "name": "src",
              "label": "Source",
              "widget": "image"
            },
            {
              "name": "alt",
              "label": "Alt Text",
              "widget": "string"
            }
          ]
        },
        {
          "name": "excerpt",
          "label": "Excerpt",
          "widget": "text"
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
      name: 'posts',
      label: 'Posts',
      thumbnail: 'cover.src',
      folder: 'content/posts',
      format: 'custom-markdown',
      fields: [
        {
          name: 'title',
          label: 'Title',
          widget: 'string',
        },
        {
          name: 'cover',
          label: 'Cover Image',
          widget: 'object',
          fields: [
            {
              name: 'src',
              label: 'Source',
              widget: 'image',
            },
            {
              name: 'alt',
              label: 'Alt Text',
              widget: 'string',
            },
          ],
        },
        {
          name: 'excerpt',
          label: 'Excerpt',
          widget: 'text',
        },
        {
          name: 'body',
          label: 'Body',
          widget: 'richtext',
        },
      ],
    },
  ],
}
```

### Showcase

Real-world examples of custom file formats can be found in our [showcase](https://sveltiacms.app/en/showcase?feature=file-formats).

Source: https://sveltiacms.app/en/docs/api/file-formats

---

## Custom String Transformations

Sveltia CMS comes with built-in [string transformations](https://sveltiacms.app/en/docs/string-transformations) like `upper`, `truncate` and `date`, which format values in template tags such as `{{title | upper}}`. You can also register your own transformations with JavaScript and use them in the same way.

### Overview

To register a custom string transformation, use the `registerStringTransformation` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerStringTransformation(name, transform);
```

#### Parameters

- `name` (string): The name of the transformation, used in template tags like `{{title | name}}`. It can contain letters, digits and underscores, and cannot start with a digit. The names of the built-in transformations, such as `upper` and `default`, are reserved and cannot be used. Registering a transformation with the same name again replaces the previous one.
- `transform` (function): A function that transforms a value. See below for details.

An error is thrown if the name is invalid or reserved, or if `transform` is not a function.

#### Transform Function

The `transform` function receives two arguments and returns the transformed string:

```js
const transform = (value, { args, locale }) => {
  // Return the transformed value
};
```

- `value`: The value of the template tag, or the output of the previous transformation if transformations are chained. It’s usually the field’s display value, such as the label of a selected option in a [Select](https://sveltiacms.app/en/docs/fields/select) or [Relation](https://sveltiacms.app/en/docs/fields/relation) field. It’s not always a string, though: a [Boolean](https://sveltiacms.app/en/docs/fields/boolean) field value may come as a boolean, and a missing value as `undefined`. Convert it with `String(value)` if you need a string.
- `args`: An array of the arguments given to the transformation in the template tag. A quoted argument comes as a string, and an unquoted one as a number. For example, `{{title | pad(10, '-')}}` gives `[10, '-']`. The array is empty if no arguments are given.
- `locale`: The locale code of the entry content being processed, such as `en` or `ja`. It’s useful for locale-aware formatting. It’s `undefined` if [internationalization](https://sveltiacms.app/en/docs/i18n) is not enabled for the collection.

The function must return the result synchronously. Async functions are not supported. A return value other than a string is converted to a string, with `null` and `undefined` resulting in an empty string.

If the function throws an error or returns a Promise, the original value is used as is, so a broken transformation doesn’t break the CMS. The error is logged to the browser console the first time it happens for each transformation.

### Using Custom Transformations

Once registered, a custom transformation can be used in [all the contexts](https://sveltiacms.app/en/docs/string-transformations#available-contexts) where the built-in ones are supported, including the collection `summary`, `slug`, `path` and `preview_path` options, and the Compute field’s `value` option. The same [syntax rules](https://sveltiacms.app/en/docs/string-transformations#syntax) apply:

- String arguments must be enclosed in single quotes, while numeric arguments should not be quoted. Other kinds of arguments, such as `true` or a field name without quotes, are not supported. The transformation is ignored if it has any of them.
- Custom transformations can be chained with each other and with the built-in ones, e.g. `{{title | reverse | upper | truncate(20)}}`.

As with the `default` and `ternary` transformations, a string argument can contain [nested template tags](https://sveltiacms.app/en/docs/string-transformations#default) to use other field values, e.g. `{{title | wrap('[', ' {{fields.subtitle}}]')}}`.

A transformation that isn’t registered is ignored, and the value is used as is.

#### Missing Values

Like the built-in `default` transformation, a custom transformation also runs when the field has no value, so it can provide a fallback value.

Without a custom transformation, a template tag that has no value is handled as follows:

- In entry slugs and file paths, it’s usually replaced with a random ID.
- In the `preview_path` option, the preview link is not shown.

With a custom transformation, its result is used instead, unless it’s an empty string.

In List and Object field summaries and editor component summaries, however, a missing value results in an empty string without running any transformations.

#### When to Register

Register custom transformations before or right after the CMS is initialized, in the same script. They are then available when entry summaries and field values are first rendered. Entry summaries are cached, so a transformation registered later, e.g. in a delayed callback, may not be applied to the entries that have already been displayed.

### Examples

#### Simple Transformation

The following example registers a `reverse` transformation that reverses the characters of a string:

```js
CMS.registerStringTransformation('reverse', (value) => [...String(value)].reverse().join(''));
```

It can be used like this:

```yaml
summary: '{{title | reverse}}'
```

#### Transformation with Arguments

The following example registers a `replace` transformation that replaces all occurrences of a string with another string:

```js
CMS.registerStringTransformation('replace', (value, { args: [search, replacement] }) =>
  String(value).replaceAll(search, replacement),
);
```

For example, use it to show a slug-like field value with spaces in the entry summary:

```yaml
summary: "{{fields.code | replace('-', ' ') | upper}}"
```

#### Locale-Aware Formatting

The following example registers a `locale_upper` transformation that converts a string to uppercase using the rules of the entry locale. Unlike the built-in `upper` transformation, it converts the Turkish `i` to `İ` rather than `I` when the locale is `tr`:

```js
CMS.registerStringTransformation('locale_upper', (value, { locale }) =>
  String(value).toLocaleUpperCase(locale),
);
```

```yaml
summary: '{{title | locale_upper}}'
```

#### Fallback Value

The following example registers a `fallback` transformation that works like the built-in `default` transformation, but also treats a value consisting only of whitespace as empty:

```js
CMS.registerStringTransformation(
  'fallback',
  (value, { args: [fallbackValue] }) => String(value ?? '').trim() || fallbackValue,
);
```

```yaml
slug: "{{fields.slug | fallback('{{fields.title}}')}}"
```

#### Compute Field

Custom transformations are especially useful in the [Compute](https://sveltiacms.app/en/docs/fields/compute) field’s `value` option to save a derived value. The following example saves the initials of the `name` field value:

```js
CMS.registerStringTransformation('initials', (value) =>
  String(value ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .join(''),
);
```

```yaml
fields:
  - name: name
    label: Name
  - name: initials
    label: Initials
    widget: compute
    value: '{{fields.name | initials}}'
```

Source: https://sveltiacms.app/en/docs/api/string-transformations

---

## Custom Pages

A custom page lets you add your own page to the CMS, next to the Contents, Assets and Editorial Workflow pages. It can:

- show a dashboard built with a React component
- embed another web page, such as your analytics or deployment status
- simply link to an external site

### Overview

To register a custom page, use the `registerCustomPage` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerCustomPage(definition);
```

#### Parameters

- `definition` (object, required): The page definition, with the following properties:
  - `id` (string, required): A unique identifier for the page, consisting of alphanumeric characters, hyphens and underscores. The page is opened at `#/pages/{id}`, so you can link to it directly. Registering a page with the same ID again replaces the previous one in place.
  - `label` (string, required): The label of the page, displayed as the page title and as the tooltip of the page’s button.
  - `icon` (string, optional): The name of a [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols) icon displayed on the page’s button, e.g. `monitoring`. Defaults to `extension`.
  - `component` (React component): A [React component](https://sveltiacms.app/en/docs/api#writing-react-components) rendering the page content. The component receives no props. You can write it with [HTM](https://sveltiacms.app/en/docs/api#using-htm), JSX or `h()` calls.
  - `url` (string): The URL of a web page to show. A relative URL is resolved against the current page URL. Only `http` and `https` URLs are supported.
  - `newTab` (boolean, optional): Whether to open the `url` in a new browser tab instead of embedding it in the CMS. Defaults to `false`. Can only be used with `url`.

Either `component` or `url` must be given, but not both. An invalid definition throws a `TypeError`.

### Where Pages Appear

On desktop, custom pages are listed in the global toolbar after the built-in pages, in the order of registration. Like the built-in pages, they can be opened with the <kbd>Alt</kbd>+<kbd>1</kbd>–<kbd>9</kbd> keyboard shortcuts. A page opening in a new tab is shown as a separate button after the page buttons.

On mobile, the bottom navigation has little room, so custom pages are listed in the Pages section of the Menu page instead.

Pages can be registered before or after the CMS is initialized. A page registered later appears right away, and a link to `#/pages/{id}` shows the page as soon as it’s registered.

### Examples

#### React Component

The following page greets the user and counts their clicks, using the `useState` hook. A component can use any [hook](https://sveltiacms.app/en/docs/api#using-hooks) taken from `CMS.React`.

```js [HTM]
const { useState } = CMS.React;

const Dashboard = () => {
  const [count, setCount] = useState(0);

  return html`
    <div style="padding: 16px">
      <h3>Welcome back!</h3>
      <p>You’ve clicked the button ${count} times.</p>
      <button type="button" onClick=${() => setCount(count + 1)}>Click Me</button>
    </div>
  `;
};

CMS.registerCustomPage({
  id: 'dashboard',
  label: 'Dashboard',
  icon: 'dashboard',
  component: Dashboard,
});
```

```jsx [JSX]
const { useState } = CMS.React;

const Dashboard = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 16 }}>
      <h3>Welcome back!</h3>
      <p>You’ve clicked the button {count} times.</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Click Me
      </button>
    </div>
  );
};

CMS.registerCustomPage({
  id: 'dashboard',
  label: 'Dashboard',
  icon: 'dashboard',
  component: Dashboard,
});
```

```js [h()]
const { useState } = CMS.React;

const Dashboard = () => {
  const [count, setCount] = useState(0);

  return h(
    'div',
    { style: { padding: 16 } },
    h('h3', null, 'Welcome back!'),
    h('p', null, `You’ve clicked the button ${count} times.`),
    h('button', { type: 'button', onClick: () => setCount(count + 1) }, 'Click Me'),
  );
};

CMS.registerCustomPage({
  id: 'dashboard',
  label: 'Dashboard',
  icon: 'dashboard',
  component: Dashboard,
});
```

The page area has no padding, so your component can fill it, e.g. with a full-size chart. Add your own padding as needed.

#### Embedded Web Page

To show another web page within the CMS, provide its URL. The page is embedded in an iframe that fills the page area.

```js
CMS.registerCustomPage({
  id: 'analytics',
  label: 'Analytics',
  icon: 'monitoring',
  url: 'https://plausible.io/share/example.com?auth=XXXXXXXX',
});
```

A relative URL is resolved against the CMS admin page URL, so a page of your own site can be embedded as well:

```js
CMS.registerCustomPage({
  id: 'style-guide',
  label: 'Style Guide',
  icon: 'palette',
  url: '/style-guide/',
});
```

**Embedding restrictions**

Many sites prevent their pages from being embedded in an iframe with the `X-Frame-Options` or `Content-Security-Policy` response header. Such a page appears blank or shows an error in the CMS. Use the `newTab` option for these sites instead.

**Security note**

A page embedded from the same origin as the CMS has full access to the CMS, including the signed-in user’s access token stored in the browser. This is the case, for example, with a page on your own site when the CMS is served from the same domain. Only embed pages you trust.

#### Link Opening in a New Tab

To add a shortcut to an external site, such as your hosting dashboard or a style guide, set the `newTab` option to `true`. The URL is opened in a new browser tab, and the user stays where they are in the CMS.

```js
CMS.registerCustomPage({
  id: 'netlify',
  label: 'Netlify Dashboard',
  icon: 'cloud',
  url: 'https://app.netlify.com/sites/example/overview',
  newTab: true,
});
```

### Migrating from Static CMS

Static CMS provided a similar feature with the `CMS.registerAdditionalLink()` method. As Static CMS has been archived, Sveltia CMS doesn’t support the method. Use `CMS.registerCustomPage()` instead:

- `id` and `title` correspond to `id` and `label`, respectively.
- `data` corresponds to `component` for a React component, or `url` for a link. Add `newTab: true` to open the link in a new tab, or omit it to embed the page in the CMS.
- `options.iconName` corresponds to `icon`, which takes a Material Symbols icon name rather than the name of an icon registered with `CMS.registerIcon()`.

Source: https://sveltiacms.app/en/docs/api/custom-pages
