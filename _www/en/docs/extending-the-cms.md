---
translationKey: extending-the-cms
order: 11
lang: en
createdAt: 2026-05-13T07:46:00.000Z
ldType: WebPage
name: Extending the CMS
docsNav:
  section: advanced
  order: 3
vars: {}
---
{% raw %}
## Adding new fields to the CMS content

To add new fields to the CMS "content" area, define them in the JavaScript configuration file located at: `_content/_config/editorComponents.js`.

For specific properties such as `id`, `label`, `fields`, `widget`, or `required`, please refer to the [Sveltia documentation](https://sveltiacms.app/en/docs/intro).

**Key functions for custom fields:**

- **`pattern`**: Matches the block structure within the Markdown file and extracts the relevant values.
- **`fromBlock`**: Receives the values extracted by the `pattern` and displays them within the CMS interface.
- **`toBlock`**: Converts the data entered in the CMS back into Markdown by injecting it into a `partialWrapper` template.
- **`toPreview`**: Generates the visual preview shown in the CMS editor.

### Example: custom field configuration

```jsx
const multilineToInline = (multi) => {
  return multi?.replace(/\\n/g, "\\\\n")?.replace(/"/g, '\\\\"');
};

const inlineToMultiline = (inline) => {
  return inline?.replace(/\\\\n/g, "\\n")?.replace(/\\\\"/g, '"');
};

export const myNewField = {
  id: "myNewField",
  label: "My new field",
  icon: "new_icon",
  fields: [
    {
      name: "content",
      label: "Content",
      widget: "markdown",
      required: true,
    },
    {
      name: "image",
      label: "Image",
      widget: "image",
      required: true,
    },
  ],
  pattern: /^{% partialWrapper "new-field\\.njk", { image: "(?<image>.*?)", class: "(?<class>.*?)" } %}(?<content>.*?){% endpartialWrapper %}$/ms,
  fromBlock: function (match) { /* ... */ },
  toBlock: function ({ image, class: className, content }) { /* ... */ },
  toPreview: function (data) { 
    return `TEST`; 
  },
};
```

## Adding custom collections

To add custom collections, modify the configuration file: `_content/_config/index.js`. New objects should be placed immediately following the `custom-pages` object.

- **`collections`**: An array defining the page collections available in the CMS.
- **`pages` & `spreadPageSetup`**: Core helpers for defining collection structures.
- **`icon`**: The name of the icon displayed in the CMS. You can find the available names in the [Material Icons library](https://material.io/resources/icons/?style=baseline).

### Example: collection definition

```jsx
export const collections = [
  {
    ...pages,
    ...spreadPageSetup("custom-pages"),
    icon: "exercise",
  },
  {
    ...pages,
    ...spreadPageSetup("my-new-collection"),
    icon: "icon-name",
  },
];
```

### Example: new “Trainings” collection

```jsx
import {
  NODE_ENV,
  SRC_DIR_FROM_WORKING_DIR,
  WORKING_DIR_ABSOLUTE,
  CONTENT_PATH_PREFIX,
  CONTENT_DIR,
  PROD_URL,
  DISPLAY_URL,
  CMS_AUTH_URL,
  CMS_REPO,
  CMS_BACKEND,
  CMS_BRANCH,
} from "../../env.config.js";

const { pages, spreadPageSetup } = await import(
  `../${SRC_DIR_FROM_WORKING_DIR}/config-11ty/plugins/cms-config/index.js`
);

const additionalTrainingFields = [
  {
    name: "subtitle",
    type: "string",
    required: false,
  },
  {
    name: "tempo",
    type: "string",
    required: false,
  },
  {
    name: "duration",
    type: "string",
    required: false,
  },
  {
    name: "price",
    type: "string",
    required: false,
  },
  {
    name: "place",
    type: "string",
    required: false,
  },
  {
    name: "nextDate",
    type: "markdown",
    required: false,
  },
  {
    name: "adress",
    type: "string",
    required: false,
  },
  {
    name: "speakers",
    type: "string",
    required: false,
  }
];
const pos = 5;
const trainingFields = [
  ...pages.fields.slice(0, pos),
  ...additionalTrainingFields,
  ...pages.fields.slice(pos),
];

export const collections = [
  {
    ...pages,
    ...spreadPageSetup("trainings"),
    icon: "exercise",
    fields: trainingFields,
  },
];

export const singletons = [];
```

## Customizing the build

You can extend the builder using specific configuration files:

## CMS schema

Can be configured in `_content/_config/index.js`. This file allows you to define custom collections or singletons for your CMS:

```jsx
// _content/_config/index.js
export const collections = [
  {
    name: "events",
    label: "Events",
    folder: "_content/events",
    create: true,
    fields: [
      { label: "Title", name: "title", widget: "string" },
      { label: "Date", name: "date", widget: "datetime" },
      { label: "Body", name: "body", widget: "markdown" }
    ]
  }
];

export const singletons = [];
```

## CMS editor components

Can be configured in `_content/_config/editorComponents.js`
{% endraw %}