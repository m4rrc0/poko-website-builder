import slugify from "@sindresorhus/slugify";
// NOTE: I need to work on a Sveltia fork: https://github.com/sveltia/sveltia-cms/issues/180#issuecomment-2256112119
import {
  NODE_ENV,
  BUILD_LEVEL,
  WORKING_DIR_ABSOLUTE,
  CONTENT_DIR,
  PROD_URL,
  DISPLAY_URL,
  CMS_AUTH_URL,
  CMS_REPO,
  CMS_BACKEND,
  CMS_BRANCH,
  NAV_DEPTH_MAX,
  COLLECTIONS,
  selectedCollections,
  allLanguages,
  userCmsConfig,
} from "../../../../env.config.js";
import { nativeFontStacks } from "../../../utils/transformStyles.js";
import {
  sectionHeaderField,
  sectionFooterField,
  sectionWrapperField,
  layoutTypeNone,
  layoutTypeSwitcher,
  layoutTypeGridFluid,
  layoutTypeCluster,
  layoutTypeFixedFluid,
  layoutTypeFlow,
  layoutTypeReel,
  layoutTypeFlowGap,
  gridItemFields,
  flowItemFields,
  reelItemFields,
  twoColumnsItemFields,
  collectionSelectField,
  sortAndFilterOptionsField,
  itemPartialField,
  buildAreasField,
} from "./section-primitives.js";
import { shortList as langCodesList } from "../../../utils/langCodesList.js";

const isDev = NODE_ENV === "development";
const mustSetup = !allLanguages?.length;

const default_locale = allLanguages.find((lang) => lang.isCmsDefault)?.code;
const locales = allLanguages
  .filter((lang) => /^published|draft/.test(lang.status))
  .map((lang) => lang.code);

export const keyField = {
  name: "key",
  label: "Key",
  widget: "string",
  required: true,
  hint: "Unique identifier for the data item",
  i18n: "duplicate",
};
export const tagsListField = {
  name: "tagsList",
  label: "Tags List (tagsList)",
  widget: "list",
  required: false,
  collapsed: true,
  i18n: true,
  allow_reorder: true,
  summary: "{{slug}}: {{label}}",
  fields: [
    {
      name: "slug",
      label: "Slug",
      widget: "string",
      required: true,
      i18n: "duplicate",
    },
    {
      name: "label",
      label: "Label",
      widget: "string",
      required: true,
      i18n: true,
    },
  ],
};
export const varsField = {
  name: "vars",
  label: "Variables (vars)",
  widget: "keyvalue",
  i18n: true,
  required: false,
  preview: false,
  dataField: true,
};
export const imageFields = [
  {
    name: "src",
    label: "Image",
    widget: "image",
    required: true,
    i18n: true,
  },
  {
    name: "alt",
    label: "Alt Text",
    widget: "string",
    required: false,
    hint: "~125 characters max; Be specific, concise, focused on the image purpose, avoid redundant phrases like 'image of…'",
    i18n: true,
  },
  {
    name: "title",
    label: "Title",
    widget: "string",
    required: false,
    i18n: true,
  },
  {
    name: "width",
    label: "Width",
    widget: "number",
    value_type: "int",
    required: false,
    hint: "In px; Leave empty for auto; Useful for image optimization when not full width.",
    i18n: "duplicate",
  },
  {
    name: "aspectRatio",
    label: "Aspect Ratio",
    widget: "number",
    value_type: "float",
    hint: "Width / Height => square = 1; 16:9 = 1.78; 4:3 = 1.33; Extra wide = 4;",
    required: false,
    i18n: "duplicate",
  },
  {
    name: "loading",
    label: "Loading",
    widget: "select",
    options: [
      { value: "", label: "Default" },
      { value: "lazy", label: "Lazy" },
      { value: "eager", label: "Eager" },
    ],
    required: false,
    hint: "Select 'Eager' for images that are visible in the initial viewport;",
    i18n: "duplicate",
  },
  {
    name: "imgAttrs",
    label: "Other Image Attributes",
    widget: "string",
    required: false,
    i18n: "duplicate",
  },
];
export const dataListField = {
  name: "dataList",
  label: "Data List (dataList)",
  hint: "Custom data items freely usable across the website",
  widget: "list",
  required: false,
  collapsed: true,
  i18n: "duplicate",
  allow_reorder: true,
  preview: false,
  dataField: true,
  types: [
    {
      name: "text",
      label: "Text",
      widget: "object",
      required: false,
      fields: [
        keyField,
        {
          name: "value",
          label: "Value",
          widget: "string",
          required: false,
          i18n: true,
        },
      ],
    },
    {
      name: "markdown",
      label: "Markdown",
      widget: "object",
      required: false,
      fields: [
        keyField,
        {
          name: "value",
          label: "Value",
          widget: "richtext",
          required: false,
          i18n: true,
        },
      ],
    },
    {
      name: "image",
      label: "Image",
      widget: "object",
      required: false,
      fields: [keyField, ...imageFields],
    },
  ],
};
export const pageStylesField = {
  name: "pageStyles",
  label: "Page Styles",
  hint: "Custom CSS to apply to the page",
  widget: "code",
  required: false,
  output_code_only: true,
  default_language: "css",
  allow_language_selection: false,
  i18n: "duplicate",
  preview: false,
  dataField: true,
};
export const statusField = {
  name: "status",
  label: "Status",
  widget: "select",
  options: [
    { value: "", label: "Default" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "noindex", label: "Noindex" },
    // TODO: later implement encrypted pages
    // { value: 'private', label: 'Private' },
    { value: "inactive", label: "Inactive" },
  ],
  default: "",
  required: false,
  i18n: true,
  preview: false,
  dataField: true,
};
export const generatePageField = {
  name: "generatePage",
  label: "Generate Page",
  widget: "select",
  hint: "Generate page for this entry or only use it as preview in lists etc?",
  options: [
    { value: "", label: "Default" },
    { value: "normal", label: "Generate Page" },
    { value: "previewOnly", label: "Preview Only" },
  ],
  default: "",
  required: false,
  i18n: "duplicate",
  preview: false,
  dataField: true,
};
export const pageLayoutRelationField = {
  name: "pageLayout",
  label: "Page Layout",
  widget: "relation",
  collection: "layouts",
  hint: "Select a layout for this page or leave empty to use the default layout",
  required: false,
  i18n: "duplicate",
  preview: false,
  dataField: true,
};

// footer defined page by page (in the CMS)
// export const pageFooterRelationField = {
//   name: "pageFooter",
//   label: "Footer",
//   widget: "relation",
//   // collection: "footers",
//   collection: "partials",
//   hint: "Select a partial as footer for this entry. Leave empty to use default footer set in global settings.",
//   required: false,
//   i18n: "duplicate",
//   search_fields: ["slug"],
//   display_fields: ["slug"],
//   value_field: "{{slug}}",
//   preview: false,
// };
// export const pageNavRelationField = {
//   name: "pageNav",
//   label: "Page Navigation",
//   widget: "relation",
//   collection: "navs",
//   hint: "Select a navigation for this page or leave empty to use the default navigation",
//   required: false,
//   i18n: "duplicate",
//   search_fields: ["name"],
//   value_field: "{{name}}",
//   display_fields: ["name"],
//   preview: false,
// };

// const bodyMarkdownField = {
//   name: "body",
//   label: "Content",
//   widget: "richtext",
//   required: false,
//   i18n: true,
//   editor_components: [
//     // "eleventyImage",
//     "imageShortcode",
//     "partial",
//     "wrapper",
//     "section",
//     "links",
//     ...defaultEditorComponentNames,
//   ],
// };
export const eleventyNavigationField = {
  name: "eleventyNavigation",
  label: "to Main Navigation",
  widget: "object",
  collapsed: true,
  required: false,
  // summary: "Position: {{fields.order}} | Nav Title: {{fields.title}}",
  summary:
    "Custom order: {{fields.order}} | Nav Title: {{fields.title}}{{fields.title | ternary('', '(Page Name)')}}",
  i18n: "duplicate",
  preview: false,
  fields: [
    {
      name: "add",
      label: "Add to Navigation",
      widget: "hidden",
      default: "Nav",
      required: true,
      i18n: "duplicate",
    },
    {
      name: "title",
      label: "Title",
      widget: "string",
      required: false,
      i18n: true,
      hint: "Default: Page Name",
    },
    {
      name: "parent",
      label: "Parent Page",
      widget: "relation",
      collection: "pages",
      search_fields: ["name"],
      value_field: "name",
      display_fields: ["name"],
      required: false,
      i18n: "duplicate",
    },
    // {
    //   name: "order",
    //   label: "Order",
    //   widget: "number",
    //   // default: 0,
    //   required: false,
    //   i18n: "duplicate",
    // },
  ],
};
export const orderField = {
  name: "order",
  label: "Order",
  widget: "number",
  required: false,
  i18n: "duplicate",
  preview: false,
};
export const simpleMetadataField = {
  name: "metadata",
  label: "Metadata",
  widget: "object",
  required: false,
  collapsed: "auto",
  i18n: true,
  preview: false,
  dataField: true,
  fields: [
    {
      name: "title",
      label: "Title",
      widget: "string",
      required: false,
      hint: "Default: Page Name",
      i18n: true,
    },
    {
      name: "description",
      label: "Description",
      widget: "text",
      required: false,
      i18n: true,
    },
    {
      name: "image",
      label: "Image",
      widget: "object",
      required: false,
      hint: "The default image used when sharing this web page",
      i18n: "duplicate",
      fields: [
        {
          name: "src",
          label: "Image",
          widget: "image",
          required: true,
          i18n: true,
        },
        {
          name: "alt",
          label: "Alt Text",
          widget: "string",
          required: false,
          hint: "~125 characters max; Be specific, concise, focused on the image purpose, avoid redundant phrases like 'image of…'",
          i18n: true,
        },
      ],
    },
  ],
};
export const pagePreviewField = {
  name: "preview",
  label: "Preview",
  widget: "object",
  required: false,
  collapsed: true,
  i18n: true,
  hint: "Fields to be used when linking to this page or listing it",
  preview: false,
  dataField: true,
  fields: [
    {
      name: "title",
      label: "Title",
      widget: "string",
      required: false,
      // hint: "Default: Page Name",
      i18n: true,
    },
    {
      name: "description",
      label: "Description",
      // widget: "text",
      widget: "richtext",
      required: false,
      // hint: "Default: Metadata description",
      i18n: true,
    },
    {
      name: "image",
      label: "Image",
      widget: "object",
      required: false,
      // hint: "The default image used when creating a visual preview of the page on your website. Default: Metadata image",
      // allow_multiple: false,
      i18n: true,
      fields: imageFields,
    },
  ],
};
export const tagsField = {
  name: "tags",
  label: "Tags",
  widget: "relation",
  multiple: true,
  // collection: "tags",
  // search_fields: ["name"],
  // value_field: "{{slug}}",
  // display_fields: ["name"],
  collection: "dataFiles",
  file: "translatedData",
  value_field: "tagsList.*.slug",
  display_fields: ["tagsList.*.label"],
  required: false,
  i18n: "duplicate",
  preview: false,
  dataField: true,
};
export const brandColorField = {
  widget: "relation",
  collection: "stylesConfig",
  file: "brand",
  value_field: "colors.*.name",
  required: false,
};
export const nativeFontStackSelectField = {
  widget: "select",
  required: false,
  options: Object.keys(nativeFontStacks).map((key) => ({
    label: key,
    value: key,
  })),
};
export const fontStackDefinitionField = (nativeDefault = "system-ui") => ({
  widget: "object",
  required: true,
  fields: [
    {
      name: "native",
      label: "Native Font Stack",
      required: true,
      ...nativeFontStackSelectField,
      default: nativeDefault,
      hint: "Native font stacks are drawn from https://modernfontstacks.com/ (Click for a preview)",
    },
    // TODO: Allow imported fonts
    {
      name: "custom",
      label: "Custom Font Override",
      widget: "relation",
      collection: "stylesConfig",
      file: "brand",
      value_field: "customFontsImport.*.name",
      required: false,
    },
  ],
});
export const styleContextRelationField = (valField) => ({
  widget: "relation",
  required: true,
  collection: "stylesConfig",
  file: "brand",
  value_field: `${valField}.*.name`,
});

export const postalAddressFields = [
  {
    name: "streetAddress",
    label: "Street Address",
    widget: "string",
    required: false,
    i18n: true,
  },
  {
    name: "postalCode",
    label: "Postal Code",
    widget: "string",
    required: false,
    i18n: "duplicate",
  },
  {
    name: "addressLocality",
    label: "City",
    widget: "string",
    required: false,
    i18n: true,
  },
  {
    name: "addressRegion",
    label: "State/Province",
    widget: "string",
    required: false,
    i18n: true,
  },
  {
    name: "addressCountry",
    label: "Country",
    widget: "string",
    required: false,
    i18n: true,
  },
];

export const commonCollectionFields = [
  {
    name: "lang",
    label: "Language",
    widget: "hidden",
    default: "{{locale}}",
    i18n: true,
  },
  {
    name: "createdAt",
    label: "Created At",
    widget: "hidden",
    default: "{{datetime}}",
    i18n: true,
  },
  // {
  //   name: "uuid",
  //   label: "UUID",
  //   widget: "hidden",
  //   default: "{{uuid_short}}",
  //   i18n: true,
  // },
  // {
  //   name: "localizationKey",
  //   label: "Localization Key",
  //   widget: "hidden",
  //   default: "{{uuid_short}}",
  //   i18n: "duplicate",
  // },
];

export const mostCommonMarkdownCollectionConfig = {
  i18n: true,
  folder: `${CONTENT_DIR}`,
  extension: "md",
  format: "yaml-frontmatter",
  create: true,
  duplicate: true,
  identifier_field: "name",
  summary: "{{name}}",
  sortable_fields: {
    fields: ["name"],
    default: {
      field: "name",
      direction: "ascending",
    },
  },
  view_groups: {
    groups: [
      {
        label: "Nav Items",
        field: "eleventyNavigation.add",
        value: "Nav",
      },
      {
        label: "Tags",
        field: "tags",
      },
    ],
    default: "eleventyNavigation.add",
  },
  // editor: {
  //   preview: false,
  // },
};

export const stylesheetsCollection = {
  name: "stylesheets",
  label: "Stylesheets",
  label_singular: "Stylesheet",
  path: "{{slug}}",
  slug: "{{fields._slug}}",
  icon: "css",
  folder: `${CONTENT_DIR}/_styles`,
  extension: "css",
  format: undefined,
  create: true,
  // MEDIAS
  media_folder: `/${CONTENT_DIR}/_images`,
  public_folder: "/_images",
  sortable_fields: {
    fields: ["slug"],
    default: {
      field: "slug",
      direction: "ascending",
    },
  },
  fields: [
    {
      name: "body",
      label: "Content",
      widget: "code",
      required: false,
      output_code_only: true,
      default_language: "css",
      allow_language_selection: false,
    },
  ],
};

export const advancedDataFilesCollection = {
  // ...mostCommonMarkdownCollectionConfig,
  // i18n: false,
  icon: "hardware",
  name: "advancedDataFiles",
  label: "Advanced Files",
  label_singular: "Advanced File",
  editor: { preview: false },
  i18n: true,
  files: [
    {
      name: "metadata",
      label: "Default Metadata",
      icon: "page_info",
      file: `${CONTENT_DIR}/_data/metadata.yaml`,
      // format: "yaml",
      fields: [
        {
          name: "image",
          label: "Image",
          widget: "image",
        },
      ],
    },
    {
      name: "redirects",
      label: "Global Redirects",
      icon: "call_split",
      file: `${CONTENT_DIR}/_files/_redirects`,
      // format: "yaml",
      fields: [
        {
          name: "body",
          label: "Redirects",
          widget: "code",
          required: false,
          output_code_only: true,
          allow_language_selection: false,
        },
      ],
    },
    {
      name: "headers",
      label: "Headers",
      icon: "contract",
      file: `${CONTENT_DIR}/_files/_headers`,
      // format: "yaml",
      fields: [
        {
          name: "body",
          label: "Headers",
          widget: "code",
          required: false,
          output_code_only: true,
          allow_language_selection: false,
        },
      ],
    },
  ],
};

export const pageLayoutsCollection = {
  name: "layouts",
  label: "Page Layouts",
  label_singular: "Page Layout",
  path: "{{slug}}",
  slug: "{{fields._slug}}",
  icon: "edit_document",
  folder: `${CONTENT_DIR}/_layouts`,
  format: undefined,
  extension: "njk",
  create: true,
  // MEDIAS
  media_folder: `/${CONTENT_DIR}/_images`,
  public_folder: "/_images",
  sortable_fields: {
    fields: ["slug"],
    default: {
      field: "slug",
      direction: "ascending",
    },
  },
  fields: [
    {
      name: "body",
      label: "Layout Markup",
      hint: "Page layout markup as Nunjucks flavored HTML",
      widget: "code",
      language: "html",
      required: false,
      output_code_only: true,
      allow_language_selection: false,
      default: `<!DOCTYPE html>
<html lang="{{lang or 'en'}}" class="no-js">
<head>
{% partial "_html-head-default.md" %}
{% getBundle "html", "head" %}
</head>
<body>
<!-- Navigation -->
{% partial "_main-nav.md", {}, "njk" %}

<!-- Content -->
{% partial "_main-content.md" %}

<!-- Footer -->
{% partial '_footer.md' %}
</body>
</html>
`,
    },
  ],
};
// ?? Should we keep this kind of logic ?? Currently overlap htmlPartials
// export const sectionLayoutsCollection = {
//   name: "sectionLayouts",
//   label: "Section Layouts",
//   label_singular: "Section Layout",
//   path: "{{slug}}",
//   slug: "{{fields._slug}}",
//   icon: "slide_library",
//   folder: `${CONTENT_DIR}/_partials`,
//   format: undefined,
//   extension: "njk",
//   create: true,
//   // MEDIAS
//   media_folder: `/${CONTENT_DIR}/_images`,
//   public_folder: "/_images",
//   sortable_fields: {
//     fields: ["slug"],
//     default: {
//       field: "slug",
//       direction: "ascending",
//     },
//   },
//   fields: [
//     {
//       name: "body",
//       label: "Layout Markup",
//       hint: "Section layout markup as Nunjucks flavored HTML",
//       widget: "code",
//       language: "html",
//       required: false,
//       output_code_only: true,
//       allow_language_selection: false,
//       default: `<div
// class="switcher {{ class }}"
// style="--width-wrap: {{widthWrap or 'var(--width-prose)'}}; --gap-switcher: {{gap or '1em'}}"
// >
// {% for block in blocks %} {% if block.type == "markdown" %}
// <div class="block-markdown {{ block.class }}">
// {{ block.value | renderContent("njk,md", { languages: languages, collections: collections }) | safe }}
// </div>
// {% endif %} {% if block.type == "image" %}
// <img {{ block | htmlImgAttrs({ type: null, class: 'block-image ' + (block.class or '') }) }} />
// {% endif %} {% endfor %}
// </div>`,
//     },
//   ],
// };
export const partialsCollection = {
  name: "partials",
  label: "Partials",
  label_singular: "Partial",
  slug: "{{fields._slug}}",
  icon: "extension",
  identifier_field: "{{slug}}",
  // folder: `${CONTENT_DIR}/_partials`,
  // path: "{{slug}}",
  i18n: true,
  folder: `${CONTENT_DIR}`,
  path: "_partials/{{slug}}",
  extension: "md",
  format: "yaml-frontmatter",
  create: true,
  summary: "{{slug}}",
  // MEDIAS
  media_folder: `/${CONTENT_DIR}/_images`,
  public_folder: "/_images",
  sortable_fields: {
    fields: ["slug"],
    default: {
      field: "slug",
      direction: "ascending",
    },
  },
  fields: [
    {
      name: "body",
      label: "Content",
      widget: "richtext",
      required: false,
      i18n: true,

      // widget: "code",
      // required: false,
      // output_code_only: true,
      // allow_language_selection: false,
    },
  ],
};
export const htmlPartialsCollection = {
  ...partialsCollection,
  name: "htmlPartials",
  label: "Partials (HTML)",
  label_singular: "Partial (HTML)",
  icon: "code_blocks",
  format: undefined,
  extension: "njk",
  fields: [
    {
      name: "body",
      label: "Content",
      required: false,
      widget: "code",
      output_code_only: true,
      allow_language_selection: false,
      language: "html",
      i18n: true,
    },
  ],
};
// const sectionFields = [
//   ...commonCollectionFields,
//   {
//     name: "name",
//     label: "Name",
//     widget: "string",
//     required: true,
//     i18n: "duplicate",
//   },
//   {
//     name: "blocks",
//     label: "Blocks",
//     widget: "list",
//     required: false,
//     i18n: true,
//     types: [
//       {
//         name: "images",
//         label: "Images",
//         widget: "object",
//         required: false,
//         fields: [
//           {
//             name: "images",
//             label: "Images",
//             widget: "image",
//             required: false,
//             allow_multiple: true,
//           },
//         ],
//       },
//       {
//         name: "markdown",
//         label: "Markdown",
//         widget: "object",
//         required: false,
//         fields: [
//           {
//             name: "value",
//             label: "Value",
//             widget: "richtext",
//             required: false,
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: "styles",
//     label: "Styles",
//     widget: "code",
//     required: false,
//     output_code_only: true,
//     allow_language_selection: false,
//     language: "css",
//   },
// ];
// const sectionsCollection = {
//   name: "sections",
//   label: "Sections",
//   label_singular: "Section",
//   icon: "add_column_right",
//   slug: "{{name}}", // This allows the slug to be localized
//   folder: `${CONTENT_DIR}`,
//   path: "sections/{{slug}}",
//   i18n: { structure: "single_file" },
//   extension: "yaml",
//   create: true,
//   identifier_field: "name",
//   summary: "{{name}}",
//   sortable_fields: {
//     fields: ["name"],
//     default: {
//       field: "name",
//       direction: "ascending",
//     },
//   },
//   // MEDIAS
//   media_folder: `/${CONTENT_DIR}/_images`,
//   public_folder: "/_images",
//   fields: sectionFields,
// };

let defaultEditorComponentNames = [];
let userEditorComponentNames = [];

try {
  // TODO: find a better way to pass this to config
  const path =
    "./src/config-11ty/plugins/cms-config/defaultEditorComponents.js";
  const code = await Bun.file(path).text();
  // Regex to find 'export const name', 'export function name', etc.
  defaultEditorComponentNames = [
    ...code.matchAll(/^export\s+(?:const|let|var|function|class)\s+(\w+)/gm),
  ].map((match) => match[1]);
} catch (error) {
  console.error("Failed to retrieve default Editor Components\n", error);
}
try {
  const path = `${WORKING_DIR_ABSOLUTE}/_config/editorComponents.js`;
  const code = await Bun.file(path).text();
  // Regex to find 'export const name', 'export function name', etc.
  userEditorComponentNames = [
    ...code.matchAll(/^export\s+(?:const|let|var|function|class)\s+(\w+)/gm),
  ].map((match) => match[1]);
} catch (error) {
  console.warn(
    `INFO: No user's Editor Components found at "${WORKING_DIR_ABSOLUTE}/_config/editorComponents.js"`,
  );
}

// Export a function that lists editor components
export function getActiveEditorComponents() {
  return [
    "code-block",
    ...defaultEditorComponentNames,
    ...userEditorComponentNames,
  ];
}

export const defaultMarkdownOptions = {
  allow_nested_components: "exclude_self",
  buttons: [
    "bold",
    "italic",
    "strikethrough",
    "code",
    // "link",
    "heading-one",
    "heading-two",
    "heading-three",
    "heading-four",
    "heading-five",
    "heading-six",
    "bulleted-list",
    "numbered-list",
    "quote",
  ],
  editor_components: [
    // "eleventyImage", // Removed
    // "imageShortcode",
    // "partial",
    // "htmlPartial",
    // "wrapper",
    // "section",
    // "links",
    "code-block",
    // "image",
    ...defaultEditorComponentNames,
    ...userEditorComponentNames,
  ],
};

export const bodyMarkdownField = {
  name: "body",
  label: "Content",
  widget: "richtext",
  required: false,
  i18n: true,
  // ...defaultMarkdownOptions, // defined at global level in field_defaults
};
// Per-project collection options for the `collection` select widget. Mirrors
// the shape produced by `defaultEditorComponents.js` from `activeCollections`.
//
// Accepts either an array of collection-name strings (legacy: the
// `selectedCollections` env export) or an array of full collection-definition
// objects with `{ name, label }` (the shape merged at render time from
// `getSelectedCollections()` + `userCmsConfig().collections`). The `pages`
// pseudo-collection is excluded since it has its own dedicated branch.
function buildCollectionSelectOptions(activeCollections) {
  return (activeCollections || [])
    .map((c) =>
      typeof c === "string"
        ? { value: c, label: COLLECTIONS?.[c]?.label || c }
        : { value: c?.name, label: c?.label || c?.name },
    )
    .filter((o) => o.value && o.value !== "pages");
}

// Factory: builds the `sections` field config for the given active
// collections. The two collection-aware branches (`sectionCollection` and
// `sectionBuilder`'s collection area) draw their select options from
// `activeCollections`. All other branches are static.
//
// The module-eval `sectionsField` export below uses the legacy built-in
// list (`selectedCollections`) so existing collection-shape exports
// (`pages`, `articles`, …) keep working. The `config.11ty.js` render
// rebuilds with the full active list and patches each generated CMS
// collection's `fields` array — see that file for details.
export function buildSectionsField(activeCollections) {
  const collectionSelectOptions =
    buildCollectionSelectOptions(activeCollections);
  return {
    name: "sections",
    label: "Sections",
    widget: "list",
    required: false,
    i18n: true,
    collapsed: true,
    types: [
      {
        name: "sectionRaw",
        label: "Section Raw",
        fields: [
          {
            ...bodyMarkdownField,
            name: "content",
          },
          sectionWrapperField,
        ],
      },
      {
        name: "sectionGrid",
        label: "Section > Grid",
        fields: [
          sectionHeaderField,
          {
            name: "items",
            label: "Grid Items",
            widget: "list",
            required: true,
            default: [{ content: "" }, { content: "" }, { content: "" }],
            summary: "{{content | truncate(50)}}",
            fields: gridItemFields,
          },
          {
            name: "layoutOptions",
            label: "Layout Options",
            hint: "Manually select a layout and related options",
            widget: "object",
            required: false,
            collapsed: true,
            i18n: true,
            types: [
              layoutTypeSwitcher,
              layoutTypeGridFluid,
              layoutTypeCluster,
              layoutTypeNone,
            ],
          },
          {
            name: "class",
            label: "Layout Class Names",
            widget: "string",
            hint: "Class names added to the inner layout element ({% grid %}). For classes on the outer section element, use the Section Wrapper below.",
            required: false,
          },
          sectionFooterField,
          sectionWrapperField,
        ],
      },
      {
        name: "sectionFlow",
        label: "Section > Flow",
        fields: [
          sectionHeaderField,
          {
            name: "items",
            label: "Flow Items",
            widget: "list",
            required: true,
            default: [{ content: "" }, { content: "" }],
            summary: "{{content | truncate(50)}}",
            fields: flowItemFields,
          },
          {
            name: "layoutOptions",
            label: "Layout Options",
            hint: "Manually select a layout and related options",
            widget: "object",
            required: false,
            collapsed: true,
            i18n: true,
            types: [layoutTypeFlowGap, layoutTypeNone],
          },
          {
            name: "class",
            label: "Layout Class Names",
            widget: "string",
            hint: "Class names added to the inner layout element ({% flow %}). For classes on the outer section element, use the Section Wrapper below.",
            required: false,
          },
          sectionFooterField,
          sectionWrapperField,
        ],
      },
      {
        name: "sectionTwoColumns",
        label: "Section > Two Columns",
        fields: [
          sectionHeaderField,
          {
            name: "itemLeft",
            label: "Column Left",
            widget: "object",
            required: true,
            i18n: true,
            summary: "{{content | truncate(50)}}",
            fields: twoColumnsItemFields("Left"),
          },
          {
            name: "itemRight",
            label: "Column Right",
            widget: "object",
            required: true,
            i18n: true,
            summary: "{{content | truncate(50)}}",
            fields: twoColumnsItemFields("Right"),
          },
          {
            name: "layoutOptions",
            label: "Layout Options",
            hint: "Manually select a layout and related options",
            widget: "object",
            required: false,
            collapsed: true,
            i18n: true,
            types: [layoutTypeSwitcher, layoutTypeFixedFluid, layoutTypeNone],
          },
          {
            name: "class",
            label: "Layout Class Names",
            widget: "string",
            hint: "Class names added to the inner layout element ({% twoColumns %}). For classes on the outer section element, use the Section Wrapper below.",
            required: false,
          },
          sectionFooterField,
          sectionWrapperField,
        ],
      },
      {
        name: "sectionReel",
        label: "Section > Reel",
        fields: [
          sectionHeaderField,
          {
            name: "items",
            label: "Reel Items",
            widget: "list",
            required: true,
            default: [{ content: "" }, { content: "" }],
            summary: "{{content | truncate(50)}}",
            fields: reelItemFields,
          },
          {
            name: "layoutOptions",
            label: "Layout Options",
            hint: "Manually select a layout and related options",
            widget: "object",
            required: false,
            collapsed: true,
            i18n: true,
            types: [layoutTypeReel, layoutTypeNone],
          },
          {
            name: "class",
            label: "Layout Class Names",
            widget: "string",
            hint: "Class names added to the inner layout element ({% reel %}). For classes on the outer section element, use the Section Wrapper below.",
            required: false,
          },
          sectionFooterField,
          sectionWrapperField,
        ],
      },
      {
        name: "sectionCollection",
        label: "Section > Collection List",
        fields: [
          sectionHeaderField,
          collectionSelectField(collectionSelectOptions),
          sortAndFilterOptionsField,
          {
            name: "layoutOptions",
            label: "Layout Options",
            hint: "Manually select a layout and related options",
            widget: "object",
            required: false,
            collapsed: true,
            i18n: true,
            types: [
              layoutTypeSwitcher,
              layoutTypeGridFluid,
              layoutTypeCluster,
              layoutTypeFlow,
              layoutTypeReel,
              layoutTypeNone,
            ],
          },
          {
            name: "class",
            label: "Layout Class Names",
            widget: "string",
            hint: "Class names added to the inner layout element ({% collection %}). For classes on the outer section element, use the Section Wrapper below.",
            required: false,
          },
          itemPartialField,
          sectionFooterField,
          sectionWrapperField,
        ],
      },
      {
        name: "sectionBuilder",
        label: "Section > Builder",
        fields: [
          sectionHeaderField,
          buildAreasField(collectionSelectOptions),
          sectionFooterField,
          sectionWrapperField,
        ],
      },
    ],
  };
}

// Backward-compat module-eval-time value. Uses only the built-in selected
// collections — `userCmsConfig()` is async so user-defined collections are
// merged at render time by `config.11ty.js` via `buildSectionsField()`.
export const sectionsField = buildSectionsField(selectedCollections);

// export const commonPageFields = [
//   {
//     name: "name",
//     label: "Name",
//     widget: "string",
//     required: true,
//     i18n: true,
//     // PERSON had ...
//     // i18n: "duplicate",
//   },
//   // {
//   //   name: "currentSlug",
//   //   label: "Current slug",
//   //   widget: "compute",
//   //   value: "{{fields.name}}",
//   //   i18n: true,
//   // },
//   // { name: "path", label: "Page URL path", widget: "string", required: true, pattern: ['^(?![\s\/\-]*$)(?!\/)[a-z0-9\/\-]*[a-z0-9\-]$', "URL must contain only letters, numbers, dashes, and forward slashes (not starting or ending with a slash or dash), and at least one letter or number"], hint: "URL-friendly slug or path (may contain '/' and '-'). NOTE: The homepage must be called 'index'"},
//   bodyMarkdownField,
//   eleventyNavigationField,
//   simpleMetadataField,
//   pagePreviewField,
//   tagsField,
//   statusField,
//   pageLayoutRelationField,
//   pageFooterRelationField,
//   pageNavRelationField,
//   generatePageField,
//   varsField,
//   dataListField,
// ];
export function spreadCommonPageFields(modFields) {
  const defaultFields = {
    name: {
      name: "name",
      label: "Name",
      widget: "string",
      required: true,
      i18n: true,
      // PERSON had ...
      // i18n: "duplicate",
      preview: false,
    },
    // {
    //   name: "currentSlug",
    //   label: "Current slug",
    //   widget: "compute",
    //   value: "{{fields.name}}",
    //   i18n: true,
    // },
    // { name: "path", label: "Page URL path", widget: "string", required: true, pattern: ['^(?![\s\/\-]*$)(?!\/)[a-z0-9\/\-]*[a-z0-9\-]$', "URL must contain only letters, numbers, dashes, and forward slashes (not starting or ending with a slash or dash), and at least one letter or number"], hint: "URL-friendly slug or path (may contain '/' and '-'). NOTE: The homepage must be called 'index'"},
    bodyMarkdown: bodyMarkdownField,
    sections: sectionsField,
    eleventyNavigation: eleventyNavigationField,
    order: orderField,
    simpleMetadata: simpleMetadataField,
    pagePreview: pagePreviewField,
    tags: tagsField,
    status: statusField,
    pageLayoutRelation: pageLayoutRelationField,
    // pageFooterRelation: pageFooterRelationField,
    // pageNavRelation: pageNavRelationField,
    generatePage: generatePageField,
    vars: varsField,
    dataList: dataListField,
    pageStyles: pageStylesField,
    ...modFields,
  };
  return Object.values(defaultFields);
}
export const pageFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["pages"].ldType,
  },
  ...spreadCommonPageFields(),
];
export const pages = {
  ...mostCommonMarkdownCollectionConfig,
  name: COLLECTIONS.pages.name,
  label: COLLECTIONS.pages.label,
  label_singular: COLLECTIONS.pages.label_singular,
  icon: "description",
  thumbnail: ["pagePreview.image.src", "metadata.image.src"],
  // TODO: check if it works
  slug: "{{name | localize}}", // This allows the slug to be localized
  // slug: "{{fields._slug | localize}}",
  reorder: true,
  summary:
    "{{order | default('x')}} - **{{name}}** {{tags.0 | ternary('- #', '')}}{{tags}}",

  // MEDIAS
  media_folder: `/${CONTENT_DIR}/_images`,
  public_folder: "/_images",
  fields: pageFields,
};
export const pagesCollection = {
  ...pages,
  path: "pages/{{slug}}",
  // summary:
  //   "{{name}} {{eleventyNavigation.order | ternary(' (nav ', '')}}{{eleventyNavigation.order}}{{eleventyNavigation.order | ternary(')', '')}}",
  // summary: "{{order | default('x')}} - {{name}}",
  sortable_fields: {
    fields: [
      "eleventyNavigation.parent",
      "name",
      // "eleventyNavigation.add",
      "eleventyNavigation.order",
    ],
    default: {
      field: "eleventyNavigation.order",
      direction: "ascending",
    },
  },
  // view_filters: [
  //   {
  //     label: "Navigation",
  //     field: "eleventyNavigation.add",
  //     pattern: true,
  //   },
  // ],
  // index_file: {
  //   name: "pages",
  //   label: "Page Data",
  //   // path: "_index",
  //   // path: "pages/pages.yaml",
  //   file: `${CONTENT_DIR}/{{locale}}/pages/pages.yaml`,
  //   // extension: "yaml",
  //   // file: `${CONTENT_DIR}/_data/brand.yaml`,
  //   // format: "yaml",
  //   icon: "home",
  //   editor: { preview: false },
  //   // i18n: false,
  //   fields: [
  //     {
  //       name: "layout",
  //       label: "Layout",
  //       widget: "string",
  //       default: "base",
  //       required: false,
  //     },
  //   ],
  // },
};
export function spreadPageSetup(collectionNameRaw) {
  // Make sure the collection name is hyphenized/slugified (kebab-case)
  const collectionName = slugify(collectionNameRaw);

  // replace kebab-case to space-separated capitalized words
  const label = collectionName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const label_singular = label.endsWith("s") ? label.slice(0, -1) : label;
  return {
    ...pages,
    name: collectionName,
    label,
    label_singular,
    path: `${collectionName}/{{slug}}`,
  };
}
// CREATIVE WORKS
export const creativeWorkFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["creativeWorks"].ldType,
  },
  ...spreadCommonPageFields({
    simpleMetadata: {
      ...simpleMetadataField,
      fields: [
        ...simpleMetadataField.fields,
        {
          name: "author",
          label: "Author",
          type: "text",
          widget: "relation",
          collection: "people",
          multiple: true,
          required: false,
          i18n: "duplicate",
        },
        {
          name: "datePublished",
          label: "Date Published",
          type: "datetime",
          widget: "datetime",
          format: "YYYY-MM-DDTHH:mm:ss",
          required: false,
          i18n: true,
        },
        {
          name: "dateModified",
          label: "Date Modified",
          type: "datetime",
          widget: "datetime",
          format: "YYYY-MM-DDTHH:mm:ss",
          required: false,
          i18n: true,
        },
      ],
    },
  }),
];
export const creativeWorks = {
  ...spreadPageSetup("creativeWorks"),
  name: COLLECTIONS.creativeWorks.name,
  label: COLLECTIONS.creativeWorks.label,
  label_singular: COLLECTIONS.creativeWorks.label_singular,
  icon: "wall_art",
  fields: creativeWorkFields,
};
export const creativeWorksCollection = { ...creativeWorks };
// ARTICLES
export const articleFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["articles"].ldType,
  },
  ...spreadCommonPageFields({
    simpleMetadata: {
      ...simpleMetadataField,
      fields: [
        ...simpleMetadataField.fields,
        {
          name: "author",
          label: "Author",
          type: "text",
          widget: "relation",
          collection: "people",
          multiple: true,
          required: false,
          i18n: "duplicate",
        },
        {
          name: "datePublished",
          label: "Date Published",
          type: "datetime",
          widget: "datetime",
          format: "YYYY-MM-DDTHH:mm:ss",
          required: false,
          i18n: true,
        },
        {
          name: "dateModified",
          label: "Date Modified",
          type: "datetime",
          widget: "datetime",
          format: "YYYY-MM-DDTHH:mm:ss",
          required: false,
          i18n: true,
        },
      ],
    },
  }),
];
export const articles = {
  ...spreadPageSetup("articles"),
  name: COLLECTIONS.articles.name,
  label: COLLECTIONS.articles.label,
  label_singular: COLLECTIONS.articles.label_singular,
  icon: "ink_pen",
  fields: articleFields,
};
export const articlesCollection = { ...articles };
// SERVICES
export const serviceFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["services"].ldType,
  },
  ...spreadCommonPageFields({
    simpleMetadata: {
      ...simpleMetadataField,
      fields: [
        ...simpleMetadataField.fields,
        {
          name: "slogan",
          label: "Slogan",
          widget: "string",
          type: "text",
          required: false,
          i18n: true,
        },
      ],
    },
  }),
];
export const services = {
  ...spreadPageSetup("services"),
  name: COLLECTIONS.services.name,
  label: COLLECTIONS.services.label,
  label_singular: COLLECTIONS.services.label_singular,
  icon: "hand_meal",
  fields: serviceFields,
};
export const servicesCollection = { ...services };
// EVENTS
export const eventFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["events"].ldType,
  },
  ...spreadCommonPageFields({
    simpleMetadata: {
      ...simpleMetadataField,
      fields: [
        ...simpleMetadataField.fields,
        {
          name: "startDate",
          label: "Start Date",
          widget: "datetime",
          type: "datetime",
          hint: "Start date of the event",
          format: "YYYY-MM-DDTHH:mm:ss",
          required: false,
          i18n: "duplicate",
        },
        {
          name: "endDate",
          label: "End Date",
          widget: "datetime",
          type: "datetime",
          hint: "End date of the event",
          format: "YYYY-MM-DDTHH:mm:ss",
          required: false,
          i18n: "duplicate",
        },
        {
          name: "eventStatus",
          label: "Event Status",
          widget: "select",
          hint: "Status of the event",
          default: "scheduled",
          options: [
            { value: "EventScheduled", label: "Scheduled" },
            { value: "EventRescheduled", label: "Rescheduled" },
            { value: "EventMovedOnline", label: "Moved Online" },
            { value: "EventCancelled", label: "Cancelled" },
            { value: "EventPostponed", label: "Postponed" },
          ],
          required: false,
          i18n: "duplicate",
        },
        {
          name: "location",
          label: "Location",
          widget: "object",
          required: false,
          i18n: true,
          fields: [
            {
              name: "name",
              label: "Name",
              widget: "string",
              hint: "Name of the location",
              required: false,
              i18n: true,
            },
            {
              name: "address",
              label: "Address",
              widget: "object",
              required: false,
              i18n: "duplicate",
              collapsed: "auto",
              fields: postalAddressFields,
            },
          ],
        },
        {
          name: "offers",
          label: "Offers",
          widget: "list",
          hint: "Offers for the event for example tickets, etc.",
          required: false,
          i18n: true,
          fields: [
            {
              name: "url",
              label: "URL",
              widget: "string",
              required: true,
              i18n: true,
              hint: "Link to ticketing or registration page",
            },
            {
              name: "price",
              label: "Price",
              widget: "number",
              required: false,
              i18n: true,
              hint: "Price of the event tickets",
            },
            {
              name: "priceCurrency",
              label: "Price Currency",
              widget: "string",
              required: false,
              i18n: true,
              hint: "Currency of the price (e.g. 'USD', 'EUR')",
            },
            {
              name: "availability",
              label: "Availability",
              widget: "select",
              default: "inStock",
              options: [
                { value: "InStock", label: "In Stock" },
                { value: "SoldOut", label: "Sold Out" },
                { value: "PreOrder", label: "Pre-order" },
              ],
              required: false,
              i18n: true,
              hint: "Availability status of the event tickets",
            },
            {
              name: "validFrom",
              label: "Valid From",
              widget: "datetime",
              type: "datetime",
              format: "YYYY-MM-DDTHH:mm:ss",
              required: false,
              i18n: true,
              hint: "Start date and time when the offer becomes valid",
            },
          ],
        },
        {
          name: "performer",
          label: "Performers",
          widget: "relation",
          collection: "people",
          multiple: true,
          required: false,
          i18n: true,
        },
        {
          name: "organizer",
          label: "Organizers",
          widget: "relation",
          collection: "people",
          multiple: true,
          required: false,
          i18n: true,
        },
      ],
    },
  }),
];
export const events = {
  ...spreadPageSetup("events"),
  name: COLLECTIONS.events.name,
  label: COLLECTIONS.events.label,
  label_singular: COLLECTIONS.events.label_singular,
  icon: "event",
  fields: eventFields,
};
export const eventsCollection = { ...events };
// PEOPLE
export const personFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["people"].ldType,
  },
  ...spreadCommonPageFields({
    simpleMetadata: {
      ...simpleMetadataField,
      fields: [
        ...simpleMetadataField.fields,
        {
          name: "jobTitle",
          label: "Job Title",
          widget: "string",
          required: false,
          i18n: true,
        },
        {
          name: "email",
          label: "Email",
          widget: "string",
          required: false,
          i18n: "duplicate",
        },
        {
          name: "telephone",
          label: "Phone number",
          widget: "string",
          required: false,
          i18n: "duplicate",
        },
        {
          name: "links",
          label: "Links",
          widget: "list",
          required: false,
          i18n: true,
          fields: [
            {
              name: "name",
              label: "Name",
              widget: "string",
              required: false,
              i18n: true,
            },
            {
              name: "url",
              label: "URL",
              widget: "string",
              required: false,
              i18n: true,
            },
          ],
        },
      ],
    },
  }),
];
export const people = {
  ...spreadPageSetup("people"),
  name: COLLECTIONS.people.name,
  label: COLLECTIONS.people.label,
  label_singular: COLLECTIONS.people.label_singular,
  icon: "person",
  fields: personFields,
};
export const peopleCollection = { ...people };
// ORGANIZATIONS
export const organizationFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["organizations"].ldType,
  },
  ...spreadCommonPageFields({
    simpleMetadata: {
      ...simpleMetadataField,
      fields: [
        ...simpleMetadataField.fields,
        {
          name: "legalName",
          label: "Legal Name",
          widget: "string",
          required: false,
          i18n: "duplicate",
        },
        {
          name: "email",
          label: "Email",
          widget: "string",
          required: false,
          i18n: true,
        },
        {
          name: "telephone",
          label: "Telephone",
          widget: "string",
          required: false,
          i18n: true,
        },
        {
          name: "address",
          label: "Address",
          widget: "object",
          required: false,
          i18n: "duplicate",
          collapsed: "auto",
          fields: postalAddressFields,
        },
        {
          name: "legalAddress",
          label: "Legal Address",
          widget: "object",
          required: false,
          i18n: "duplicate",
          collapsed: "auto",
          fields: postalAddressFields,
        },
        {
          name: "vatID",
          label: "VAT ID",
          widget: "string",
          required: false,
          i18n: "duplicate",
        },
        {
          name: "links",
          label: "Links",
          widget: "list",
          required: false,
          i18n: true,
          collapsed: "auto",
          fields: [
            {
              name: "name",
              label: "Name",
              widget: "string",
              required: false,
              i18n: true,
            },
            {
              name: "url",
              label: "URL",
              widget: "string",
              required: false,
              i18n: true,
            },
          ],
        },
      ],
    },
  }),
];
export const organizations = {
  ...spreadPageSetup("organizations"),
  name: COLLECTIONS.organizations.name,
  label: COLLECTIONS.organizations.label,
  label_singular: COLLECTIONS.organizations.label_singular,
  icon: "add_home_work",
  fields: organizationFields,
};
export const organizationsCollection = { ...organizations };
// COURSES
export const courseFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["courses"].ldType,
    dataField: {
      widget: "string",
    },
  },
  ...spreadCommonPageFields(),
];
export const courses = {
  ...spreadPageSetup("courses"),
  name: COLLECTIONS.courses.name,
  label: COLLECTIONS.courses.label,
  label_singular: COLLECTIONS.courses.label_singular,
  icon: "school",
  fields: courseFields,
};
export const coursesCollection = { ...courses };
// PLACES
export const placeFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["places"].ldType,
    dataField: {
      widget: "string",
    },
  },
  ...spreadCommonPageFields(),
];
export const places = {
  ...spreadPageSetup("places"),
  name: COLLECTIONS.places.name,
  label: COLLECTIONS.places.label,
  label_singular: COLLECTIONS.places.label_singular,
  icon: "location_on",
  fields: placeFields,
};
export const placesCollection = { ...places };
// PRODUCTS
export const productFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["products"].ldType,
    dataField: {
      widget: "string",
    },
  },
  ...spreadCommonPageFields(),
];
export const products = {
  ...spreadPageSetup("products"),
  name: COLLECTIONS.products.name,
  label: COLLECTIONS.products.label,
  label_singular: COLLECTIONS.products.label_singular,
  icon: "add_shopping_cart",
  fields: productFields,
};
export const productsCollection = { ...products };
// REVIEWS
export const reviewFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["reviews"].ldType,
    dataField: {
      widget: "string",
    },
  },
  ...spreadCommonPageFields(),
];
export const reviews = {
  ...spreadPageSetup("reviews"),
  name: COLLECTIONS.reviews.name,
  label: COLLECTIONS.reviews.label,
  label_singular: COLLECTIONS.reviews.label_singular,
  icon: "reviews",
  fields: reviewFields,
};
export const reviewsCollection = { ...reviews };
// FAQs
export const faqFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["faqs"].ldType,
    dataField: {
      widget: "string",
    },
  },
  ...spreadCommonPageFields({
    simpleMetadata: {
      ...simpleMetadataField,
      fields: [
        ...simpleMetadataField.fields,
        {
          name: "faq",
          label: "FAQ Items",
          widget: "list",
          required: false,
          i18n: true,
          fields: [
            {
              name: "question",
              label: "Question",
              widget: "text",
              required: false,
              i18n: true,
            },
            {
              name: "answer",
              label: "Answer",
              widget: "text",
              required: false,
              i18n: true,
            },
          ],
        },
      ],
    },
  }),
];
export const faqs = {
  ...spreadPageSetup("faqs"),
  name: COLLECTIONS.faqs.name,
  label: COLLECTIONS.faqs.label,
  label_singular: COLLECTIONS.faqs.label_singular,
  icon: "indeterminate_question_box",
  fields: faqFields,
};
export const faqsCollection = { ...faqs };
// PROJECTS
export const projectFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["projects"].ldType,
    dataField: {
      widget: "string",
    },
  },
  ...spreadCommonPageFields(),
];
export const projects = {
  ...spreadPageSetup("projects"),
  name: COLLECTIONS.projects.name,
  label: COLLECTIONS.projects.label,
  label_singular: COLLECTIONS.projects.label_singular,
  icon: "folder_open",
  fields: projectFields,
};
export const projectsCollection = { ...projects };
// HowTo in schema.org
export const howtoFields = [
  ...commonCollectionFields,
  {
    name: "ldType",
    label: "LD Type",
    widget: "hidden",
    required: false,
    i18n: "duplicate",
    default: COLLECTIONS["howtos"].ldType,
    dataField: {
      widget: "string",
    },
  },
  ...spreadCommonPageFields(),
];
export const howtos = {
  ...spreadPageSetup("howtos"),
  name: COLLECTIONS.howtos.name,
  label: COLLECTIONS.howtos.label,
  label_singular: COLLECTIONS.howtos.label_singular,
  icon: "menu_book",
  fields: projectFields,
};
export const howtoCollection = { ...howtos };

const optionalCollections = {
  creativeWorks: creativeWorksCollection,
  articles: articlesCollection,
  services: servicesCollection,
  events: eventsCollection,
  products: productsCollection,
  projects: projectsCollection,
  people: peopleCollection,
  organizations: organizationsCollection,
  courses: coursesCollection,
  places: placesCollection,
  reviews: reviewsCollection,
  faqs: faqsCollection,
  howtos: howtoCollection, //HowTo in schema.org
};
export function getSelectedCollections() {
  const selectedOptionalCollections = (selectedCollections || [])
    .map((collectionName) => optionalCollections[collectionName])
    .filter(Boolean);
  return selectedOptionalCollections;
}

/**
 * Single source of truth for the merged "active collections" list (built-in
 * collections enabled via `selectedCollections` + user-defined collections
 * from `_config/index.js`). Returns the full collection-definition objects.
 *
 * Async because `userCmsConfig()` performs a dynamic import of the user's
 * project-local config file. Use this anywhere the merged list is needed
 * (e.g. `env.11ty.js`, `config.11ty.js` render) to keep the merge logic in
 * one place.
 */
export async function getActiveCollections() {
  const userConfig = await userCmsConfig();
  return [...getSelectedCollections(), ...(userConfig?.collections || [])];
}
// const selectedOptionalCollections = (selectedCollections || [])
//   .map((collectionName) => optionalCollections[collectionName])
//   .filter(Boolean);

const getMiscLinkTypes = (allSelectedCollections, currentLevel, maxLevels) =>
  allSelectedCollections.map((collection) => ({
    name: collection.name,
    label: collection.label_singular,
    fields: [
      {
        name: "slug",
        label: "Select " + collection.label_singular,
        widget: "relation",
        collection: collection.name,
        search_fields: ["name"],
        display_fields: ["name"],
        required: false,
        i18n: "duplicate",
      },
      {
        name: "label",
        label: "Label",
        widget: "string",
        required: false,
        hint: "Override the page name",
        i18n: true,
      },
      {
        name: "image",
        label: "Image",
        widget: "object",
        hint: "Override the page title with an image",
        required: false,
        i18n: "duplicate",
        summary: "{{src}}",
        fields: [
          {
            name: "src",
            label: "Image",
            widget: "image",
            required: true,
            i18n: true,
          },
        ],
      },
    ],
  }));

function createNavLevels(allSelectedCollections, currentLevel, maxLevels) {
  if (currentLevel > maxLevels) return [];

  return [
    {
      name: "subItems",
      label: "Items",
      label_singular: "Item",
      widget: "list",
      i18n: "duplicate",
      required: true,
      fields: [
        {
          name: "linkTo",
          label: "Link to",
          widget: "object",
          required: true,
          i18n: "duplicate",
          collapsed: "auto",
          root: true,
          types: [
            {
              name: "pages",
              label: "Page",
              fields: [
                {
                  name: "slug",
                  label: "Select Page",
                  widget: "relation",
                  collection: "pages",
                  search_fields: ["name"],
                  display_fields: ["name"],
                  required: true,
                  i18n: "duplicate",
                },
                {
                  name: "label",
                  label: "Label",
                  widget: "string",
                  required: false,
                  hint: "Override the page title",
                  i18n: true,
                },
                {
                  name: "image",
                  label: "Image",
                  widget: "object",
                  hint: "Override the page title with an image",
                  required: false,
                  i18n: "duplicate",
                  summary: "{{src}}",
                  fields: [
                    {
                      name: "src",
                      label: "Src",
                      widget: "image",
                      required: true,
                      i18n: true,
                    },
                  ],
                },
              ],
            },
            ...getMiscLinkTypes(
              allSelectedCollections,
              currentLevel,
              maxLevels,
            ),
            {
              name: "url",
              label: "Custom URL",
              fields: [
                {
                  name: "label",
                  label: "Label",
                  widget: "string",
                  required: false,
                  hint: "Override the page title",
                  i18n: true,
                },
                {
                  name: "url",
                  label: "Custom URL",
                  widget: "string",
                  required: true,
                  hint: "Use this for external links or if you want to override the page link.",
                  i18n: true,
                },
                {
                  name: "image",
                  label: "Image",
                  widget: "object",
                  hint: "Override the page title with an image",
                  required: false,
                  i18n: "duplicate",
                  summary: "{{src}}",
                  fields: [
                    {
                      name: "src",
                      label: "Src",
                      widget: "image",
                      required: true,
                      i18n: true,
                    },
                  ],
                },
              ],
            },
            {
              name: "subItems",
              label: "Sub Menu",
              fields: [
                {
                  name: "label",
                  label: "Label",
                  widget: "string",
                  required: false,
                  hint: "Override the page title",
                  i18n: true,
                },
                {
                  name: "image",
                  label: "Image",
                  widget: "object",
                  hint: "Override the page title with an image",
                  required: false,
                  i18n: "duplicate",
                  summary: "{{src}}",
                  fields: [
                    {
                      name: "src",
                      label: "Src",
                      widget: "image",
                      required: true,
                      i18n: true,
                    },
                  ],
                },
                ...createNavLevels(
                  allSelectedCollections,
                  currentLevel + 1,
                  maxLevels,
                ),
              ],
            },
          ],
        },
      ],
    },
  ];
}

// export const navCollection = (allSelectedCollections) => ({
//   ...mostCommonMarkdownCollectionConfig,
//   identifier_field: "{{slug}}",
//   name: "nav",
//   label: "Navigations",
//   label_singular: "Navigation",
//   path: "nav/{{slug}}",
//   slug: "{{fields._slug}}",
//   icon: "menu_open",
//   folder: `${CONTENT_DIR}/_data`,
//   format: "yaml",
//   extension: "yaml",
//   summary: "{{slug}}",
//   media_folder: `/${CONTENT_DIR}/_images`,
//   public_folder: "/_images",
//   fields: [
//     {
//       name: "items",
//       label: "Items",
//       label_singular: "Item (Level 1)",
//       widget: "list",
//       i18n: "duplicate",
//       required: true,
//       fields: [
//         {
//           name: "linkTo",
//           label: "Link to ...",
//           widget: "object",
//           required: false,
//           i18n: "duplicate",
//           collapsed: "auto",
//           types: [
//             {
//               name: "linkTo",
//               label: "Link to ...",
//               widget: "object",
//               required: false,
//               i18n: "duplicate",
//               collapsed: "auto",
//               root: true,
//               types: [
//                 {
//                   name: "pages",
//                   label: "Page",
//                   fields: [
//                     {
//                       name: "slug",
//                       label: "Select Page",
//                       widget: "relation",
//                       collection: "pages",
//                       search_fields: ["name"],
//                       display_fields: ["name"],
//                       required: false,
//                       i18n: "duplicate",
//                     },
//                     {
//                       name: "label",
//                       label: "Label",
//                       widget: "string",
//                       required: false,
//                       hint: "Override the page title",
//                       i18n: true,
//                     },
//                     {
//                       name: "image",
//                       label: "Image",
//                       widget: "object",
//                       hint: "Override the page title with an image",
//                       required: false,
//                       i18n: "duplicate",
//                       summary: "{{src}}",
//                       fields: [
//                         {
//                           name: "src",
//                           label: "Image",
//                           widget: "image",
//                           required: true,
//                           i18n: true,
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 ...getMiscLinkTypes(allSelectedCollections, 1, NAV_DEPTH_MAX),
//                 {
//                   name: "url",
//                   label: "Custom URL",
//                   fields: [
//                     {
//                       name: "label",
//                       label: "Label",
//                       widget: "string",
//                       required: false,
//                       hint: "Override the page title",
//                       i18n: true,
//                     },
//                     {
//                       name: "url",
//                       label: "Custom URL",
//                       widget: "string",
//                       required: false,
//                       hint: "Use this for external links or if you want to override the page link.",
//                       i18n: true,
//                     },
//                     {
//                       name: "image",
//                       label: "Image",
//                       widget: "object",
//                       hint: "Override the page title with an image",
//                       required: false,
//                       i18n: "duplicate",
//                       summary: "{{src}}",
//                       fields: [
//                         {
//                           name: "src",
//                           label: "Src",
//                           widget: "image",
//                           required: true,
//                           i18n: true,
//                         },
//                       ],
//                     },
//                   ],
//                 },
//                 {
//                   name: "subItems",
//                   label: "Sub Menu",
//                   fields: [
//                     {
//                       name: "label",
//                       label: "Label",
//                       widget: "string",
//                       required: true,
//                       hint: "Override the page title",
//                       i18n: true,
//                     },
//                     {
//                       name: "image",
//                       label: "Image",
//                       widget: "object",
//                       hint: "Override the page title with an image",
//                       required: false,
//                       i18n: "duplicate",
//                       summary: "{{src}}",
//                       fields: [
//                         {
//                           name: "src",
//                           label: "Src",
//                           widget: "image",
//                           required: true,
//                           i18n: true,
//                         },
//                       ],
//                     },
//                     ...createNavLevels(
//                       allSelectedCollections,
//                       1,
//                       NAV_DEPTH_MAX,
//                     ), // Adjust the second argument to set max levels
//                   ],
//                 },
//                 ...createNavLevels(allSelectedCollections, 1, NAV_DEPTH_MAX), // Adjust the second argument to set max levels
//               ],
//             },
//             ...getMiscLinkTypes(allSelectedCollections, 1, NAV_DEPTH_MAX),
//             {
//               name: "url",
//               label: "Custom URL",
//               fields: [
//                 {
//                   name: "label",
//                   label: "Label",
//                   widget: "string",
//                   required: false,
//                   hint: "Override the page title",
//                   i18n: true,
//                 },
//                 {
//                   name: "url",
//                   label: "Custom URL",
//                   widget: "string",
//                   required: false,
//                   hint: "Use this for external links or if you want to override the page link.",
//                   i18n: true,
//                 },
//                 ...createNavLevels(allSelectedCollections, 1, NAV_DEPTH_MAX), // Adjust the second argument to set max levels
//               ],
//             },
//             {
//               name: "label",
//               label: "Label Only",
//               fields: [
//                 {
//                   name: "label",
//                   label: "Label",
//                   widget: "string",
//                   required: false,
//                   hint: "Override the page title",
//                   i18n: true,
//                 },
//                 ...createNavLevels(allSelectedCollections, 1, NAV_DEPTH_MAX), // Adjust the second argument to set max levels
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   ],
// });

export function removeNonDataFields(fields) {
  // Uses a hook on field config named `dataField` which can be true or an object to be merged as the field config
  // TODO: Might want to do something smarter with `ldType` or add custom fields for more precise metadata management
  return fields
    .map((field) => {
      if (field.dataField === true) {
        return field;
      }
      if (typeof field.dataField === "object") {
        return { ...field, ...field.dataField };
      }
      return null;
    })
    .filter(Boolean);
}

export const dataFilesCollection = {
  // ...mostCommonMarkdownCollectionConfig,
  // i18n: false,
  icon: "table_edit",
  name: "dataFiles",
  label: "Data Files",
  editor: { preview: false },
  i18n: true,
  files: [
    {
      name: "translatedData",
      label: "Translated Data",
      icon: "translate",
      file: `${CONTENT_DIR}/{{locale}}/{{locale}}.yaml`,
      // format: "yaml",
      i18n: true,
      fields: [tagsListField, varsField, dataListField],
    },
    {
      name: "pagesData",
      label: "Pages Data",
      icon: "description",
      file: `${CONTENT_DIR}/{{locale}}/pages/pages.yaml`,
      // format: "yaml",
      i18n: true,
      fields: removeNonDataFields(pageFields),
    },
    // ... More data files are added programmatically later
  ],
};

const globalSettingsSingleton = {
  name: "globalSettings",
  label: "Global Settings",
  icon: "settings",
  file: `${CONTENT_DIR}/_data/globalSettings.yaml`,
  // format: "yaml",
  fields: [
    {
      name: "siteName",
      label: "Site Name",
      widget: "string",
    },
    {
      name: "productionUrl",
      label: "Production URL",
      widget: "string",
      pattern: [
        "^(http|https)://[\\w\\-._~:/?#[\\]@!$&'()*+,;=%]+$",
        "Must be a URL starting with http:// or https://",
      ],
      hint: "e.g. `https://www.poko.eco`",
      // TODO: add pattern validation
      // prettier-ignore
      // pattern: [
      //   "^https?://[\\w\\-._~:/?#[\\]@!$&'()*+,;=%]+$",
      //   "Must be a URL starting with http:// or https://",
      // ],
    },
    {
      name: "logo",
      label: "Logo",
      widget: "image",
      required: false,
    },
    {
      name: "htmlHead",
      label: "HTML Head",
      widget: "code",
      required: false,
      // TODO: default-language not working
      default_language: "html",
      output_code_only: true,
      allow_language_selection: false,
    },
    {
      name: "cssHead",
      label: "Internal Styles (CSS)",
      widget: "code",
      required: false,
      default_language: "css",
      output_code_only: true,
      allow_language_selection: false,
    },
    // {
    //   // footer defined in global settings (in the CMS)
    //   name: "pageFooter",
    //   label: "Default Footer",
    //   widget: "relation",
    //   collection: "footers",
    //   hint: "Footer used for all pages and collections that don't have a specific footer set.",
    //   required: false,
    //   i18n: true,
    //   // search_fields: ["slug"],
    //   // display_fields: ["fields.slug"],
    //   // value_field: "{{slug}}",
    //   // options: faire une liste avec les footers disponibles dans la collection footers
    // },
    {
      name: "languages",
      label: "Languages",
      hint: "❗️ Re-build your site to see your changes here",
      widget: "list",
      required: true,
      collapsed: true,
      allow_reorder: true,
      summary: "{{status | capitalize}}: {{code}}",
      fields: [
        {
          name: "code",
          label: "Language Code",
          // widget: "string",
          widget: "select",
          options: langCodesList.map((lang) => ({
            value: lang.code,
            label: lang.name,
          })),
          required: true,
        },
        // {
        //   name: "name",
        //   label: "Language Name",
        //   // widget: "string",
        //   widget: "hidden",
        //   required: false,
        // },
        // {
        //   name: "customUrlPrefix",
        //   label: "Custom URL Prefix",
        //   widget: "object",
        //   collapsed: false,
        //   required: false,
        //   // summary: "Position: {{fields.order}} | Nav Title: {{fields.title}}",
        //   comment:
        //     "By default, webpages URLs are prefixed with the language code. You can override this by providing a custom URL prefix",
        //   fields: [
        //     {
        //       name: "prefix",
        //       label: "URL Prefix",
        //       widget: "string",
        //       required: false,
        //       hint: "Leave this field empty to remove the prefix entirely.",
        //     },
        //   ],
        // },
        {
          name: "status",
          label: "Status",
          widget: "select",
          default: "published",
          required: true,
          options: [
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
            { value: "inactive", label: "Inactive" },
          ],
        },
        {
          name: "keepUrlPrefix",
          label: "Always keep this language prefix in URL",
          hint: "By default, URLs are prefixed with the language code (E.g. /en/about) except the first language of the list (E.g. /about). Force keeping this prefix by enabling this option.",
          widget: "boolean",
          default: false,
          required: false,
        },
        // {
        //   name: "isCmsDefault",
        //   label: "Is CMS Default",
        //   hint: "Defaults to the first language of the list",
        //   widget: "boolean",
        //   required: true,
        //   default: false,
        // },
        // {
        //   name: "isWebsiteDefault",
        //   label: "Is Website Default",
        //   hint: "Defaults to the first language of the list",
        //   widget: "boolean",
        //   required: true,
        //   default: false,
        // },
      ],
    },
    {
      name: "collections",
      label: "Active Collections",
      widget: "select",
      multiple: true,
      required: false,
      // TODO: populate this from existing collection definitions
      // TODO: more customization on collections
      options: Object.keys(optionalCollections),
      dropdown_threshold: 100,
    },
    // {
    //   name: "customNav",
    //   label: "Custom Navigation",
    //   widget: "relation",
    //   collection: "nav",
    //   value_field: "slug",
    //   search_fields: ["slug"],
    //   display_fields: ["slug"],
    //   required: false,
    //   hint: "Choose which custom nav file to use globally",
    // },
  ],
};

const stylesConfigCollection = (fontsourceFonts) => ({
  // ...mostCommonMarkdownCollectionConfig,
  // i18n: false,
  icon: "brush",
  name: "stylesConfig",
  label: "Styles Config",
  editor: { preview: false },
  i18n: false,
  files: [
    {
      name: "brand",
      label: "Brand",
      icon: "brand_family",
      file: `${CONTENT_DIR}/_data/brand.yaml`,
      // format: "yaml",
      i18n: false,
      fields: [
        {
          name: "ctxCssImport",
          label: "Apply default styles",
          widget: "boolean",
          required: false,
          default: true,
        },
        // {
        //   name: "ctxCssImport",
        //   label: "Auto ctx.css Import",
        //   widget: "object",
        //   required: false,
        //   collapsed: true,
        //   default: {
        //     filename: "ctx.css",
        //   },
        //   fields: [
        //     {
        //       name: "filename",
        //       label: "Output Filename",
        //       widget: "string",
        //       required: true,
        //       default: "ctx.css",
        //     },
        //   ],
        // },
        {
          name: "inlineAllStyles",
          label: "Inline All Styles",
          widget: "boolean",
          required: false,
          default: true,
        },
        {
          name: "widthsContexts",
          label: "Widths Contexts",
          label_singular: "Widths Context",
          widget: "list",
          required: false,
          collapsed: true,
          allow_reorder: true,
          summary: "{{name}}:  [Max width '{{max}}', Prose width '{{prose}}']",
          hint: "The first context is used as the default",
          default: [{ name: "main", max: "80rem", prose: "50rem" }],
          fields: [
            { name: "name", label: "Name", widget: "string", required: true }, // prettier-ignore
            { name: "max", label: "Max Width", widget: "string", required: true, default: '80rem' }, // prettier-ignore
            { name: "prose", label: "Prose Width", widget: "string", required: true, default: '50rem' }, // prettier-ignore
          ],
        },
        {
          name: "fontStacksContexts",
          label: "Font Stacks Contexts",
          label_singular: "Font Stack Context",
          widget: "list",
          required: false,
          collapsed: true,
          allow_reorder: true,
          summary: `
          {{name}}:
          BODY: {{body.custom}} {{body.native}} //
          HEADINGS: {{heading.custom}} {{heading.native}} //
          CODE: {{code.custom}} {{code.native}}`,
          hint: "Select your preferred font stack for every type of text. Prefer only native font stacks for performance reasons. The first values are used as the defaults.",
          // prettier-ignore
          default: [{ name: "main", body: { native: "system-ui" }, heading: { native: "system-ui" }, code: { native: "monospace-code" }}],
          fields: [
            { name: "name", label: "Name", widget: "string", required: true }, // prettier-ignore
            { name: "body", label: "Body Text Font", ...fontStackDefinitionField("system-ui") }, // prettier-ignore
            { name: "heading", label: "Heading Text Font", ...fontStackDefinitionField("system-ui") }, // prettier-ignore
            { name: "code", label: "Code Text Font", ...fontStackDefinitionField("monospace-code") }, // prettier-ignore
          ],
        },
        {
          name: "customFontsImport",
          label: "Custom Fonts Import",
          widget: "list",
          required: false,
          collapsed: true,
          summary:
            "[{{name}}] - '{{source.name}}' ({{source.type}}): {{source.weights}} {{source.styles}} {{source.subsets}}",
          fields: [
            // NOTE: Not sure I need this
            {
              name: "name",
              label: "Font Internal Name",
              widget: "string",
              required: true,
            },
            {
              name: "source",
              label: "Source Service",
              widget: "object",
              required: true,
              collapsed: false,
              summary:
                "'{{name}}' ({{type}}): {{weights}} {{styles}} {{subsets}}",
              types: [
                {
                  name: "fontsource",
                  label: "Fontsource",
                  widget: "object",
                  required: true,
                  collapsed: "auto",
                  fields: [
                    {
                      name: "name",
                      label: "Font Name",
                      widget: "select",
                      required: true,
                      options: fontsourceFonts,
                      hint: "Select a font from https://fontsource.org/; IMPORTANT NOTE: All fonts don't have all weights, styles, subsets available.",
                    },
                    {
                      name: "weights",
                      label: "Font Weights",
                      widget: "select",
                      multiple: true,
                      required: true,
                      dropdown_threshold: 10,
                      hint: "Default to all selected",
                      default: ["400"],
                      options: [
                        "100",
                        "200",
                        "300",
                        "400",
                        "500",
                        "600",
                        "700",
                        "800",
                        "900",
                      ],
                    },
                    {
                      name: "styles",
                      label: "Font Styles",
                      widget: "select",
                      multiple: true,
                      required: true,
                      default: ["normal"],
                      options: ["normal", "italic"],
                    },
                    {
                      name: "subsets",
                      label: "Font Subsets",
                      widget: "select",
                      multiple: true,
                      required: true,
                      default: ["latin"],
                      dropdown_threshold: 10,
                      options: [
                        "latin",
                        "cyrillic",
                        "greek",
                        "vietnamese",
                        "latin-ext",
                        "cyrillic-ext",
                        "greek-ext",
                        "vietnamese-ext",
                        "math",
                        "symbols",
                      ],
                    },
                    // TODO: HERE ! Subsets
                    // widths: [62.5, 125],
                    // variable: {
                    //   wght: { default: '400', min: '100', max: '900', step: '100' },
                    //   wdth: { default: '100', min: '50', max: '200', step: '10' },
                    //   slnt: { default: '0', min: '-20', max: '20', step: '1' },
                    // },
                    // preferStatic: true, // Prefer static font files over variable
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "typeScales",
          label: "Fluid Type Scales",
          label_singular: "Fluid Type Scale",
          widget: "list",
          required: false,
          collapsed: true,
          allow_reorder: true,
          summary:
            "Type Scale '{{name}}'  [Font Size '{{minFontSize}} - {{maxFontSize}}', Type Scale '{{minTypeScale}} - {{maxTypeScale}}']",
          hint: "Visualize at https://utopia.fyi/type/calculator/. The first type scale is used as the default", // prettier-ignore
          default: [{ name: "main", minFontSize: 18, maxFontSize: 20, minTypeScale: 1.2, maxTypeScale: 1.25 }], // prettier-ignore
          fields: [
            { name: "name", label: "Type Scale Name", widget: "string", required: true }, // prettier-ignore
            { name: "minFontSize", label: "Min Font Size (px)", widget: "number", value_type: "int", required: true, default: 18 }, // prettier-ignore
            { name: "maxFontSize", label: "Max Font Size (px)", widget: "number", value_type: "int", required: true, default: 20 }, // prettier-ignore
            { name: "minTypeScale", label: "Min Type Scale", widget: "number", value_type: "float", required: true, default: 1.2 }, // prettier-ignore
            { name: "maxTypeScale", label: "Max Type Scale", widget: "number", value_type: "float", required: true, default: 1.25 }, // prettier-ignore
            // prettier-ignore
            { name: "advanced", label: "Advanced Options", widget: "object", required: false, collapsed: true, fields: [ // prettier-ignore
              { name: "minWidth", label: "Min Width (px)", widget: "number", value_type: "int", required: true, default: 360 }, // prettier-ignore
              { name: "maxWidth", label: "Max Width (px)", widget: "number", value_type: "int", required: true, default: 1240 }, // prettier-ignore
              { name: "positiveSteps", label: "Positive Steps", widget: "number", value_type: "int", required: true, default: 6 }, // prettier-ignore
              { name: "negativeSteps", label: "Negative Steps", widget: "number", value_type: "int", required: true, default: 2 }, // prettier-ignore
              { name: "prefix", label: "Prefix", widget: "string", required: true, default: 'step' }, // prettier-ignore
              { name: "relativeTo", label: "Relative To", widget: "select", required: true, default: 'viewport-width', options: ['viewport-width', 'container'] }, // prettier-ignore
            ]},
            {
              name: "customSteps",
              label: "Custom Steps",
              widget: "list",
              required: false,
              collapsed: true,
              summary: "From step '{{startStep}}' to '{{endStep}}'",
              fields: [
                // prettier-ignore
                { name: "startStep", label: "Start Step", widget: "select", required: true, options: ['-2', '-1', '0', '1', '2', '3', '4', '5', '6'] }, // prettier-ignore
                { name: "endStep", label: "End Step", widget: "select", required: true, options: ['-2', '-1', '0', '1', '2', '3', '4', '5', '6'] }, // prettier-ignore
              ],
            },
          ],
        },
        {
          name: "colors",
          label: "Colors",
          label_singular: "Color",
          widget: "list",
          required: false,
          collapsed: true,
          allow_reorder: true,
          summary: "{{name}}: {{value}}",
          hint: "Colors to be used across the website, in palettes or otherwise. ❗️Save the file for new colors to appear in the palette selection.",
          fields: [
            {
              name: "name",
              label: "Name",
              widget: "string",
              required: true,
              pattern: [
                "^[a-z0-9-]+$",
                "Only lowercase letters, numbers, and hyphens are allowed",
              ],
            },
            {
              name: "value",
              label: "Color",
              widget: "color",
              required: true,
              default: "#000001",
            },
          ],
        },
        {
          name: "palettes",
          label: "Color Palettes",
          label_singular: "Color Palette",
          widget: "list",
          required: false,
          collapsed: true,
          allow_reorder: true,
          summary:
            ".palette-{{name}}  [{{read}}  {{tone}}  {{pop}}  {{neutral}}]",
          hint: "The first palette is used as the default",
          fields: [
            {
              name: "name",
              label: "Palette Name",
              widget: "string",
              required: true,
            },
            // prettier-ignore
            { name: "read", label: "read: Most readable Color (Typography)", ...brandColorField, required: true }, // prettier-ignore
            { name: "tone", label: "tone: Alternative tone Color", ...brandColorField, required: true }, // prettier-ignore
            { name: "pop", label: "pop: Accent Color that 'pops'", ...brandColorField, required: true }, // prettier-ignore
            { name: "neutral", label: "neutral: Neutral Color for surface", ...brandColorField, required: true }, // prettier-ignore
            // prettier-ignore
            {
              name: "advancedDefaults", label: "Advanced Defaults", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text", label: "Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg", label: "Background Color", ...brandColorField }, // prettier-ignore
                { name: "border", label: "Border Color", ...brandColorField }, // prettier-ignore
                { name: "text-decoration", label: "Text Decoration Color", ...brandColorField }, // prettier-ignore
                { name: "text--marker", label: "Text Marker Color (bullet points, etc.)", ...brandColorField }, // prettier-ignore
                { name: "outline", label: "Outline Color", ...brandColorField }, // prettier-ignore
                { name: "shadow", label: "Shadow Color", ...brandColorField }, // prettier-ignore
                { name: "caret", label: "Caret Color", ...brandColorField }, // prettier-ignore
                { name: "column-rule", label: "Column Rule Color", ...brandColorField }, // prettier-ignore
                { name: "outline--focus", label: "Outline Focus Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "selection", label: "Selected Text", widget: "object", collapsed: "auto", required: false, fields: [ // prettier-ignore
                { name: "text--selection", label: "Text Selection Color", ...brandColorField }, // prettier-ignore
                { name: "bg--selection", label: "Background Selection Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "strong", label: "Strong (Bold text using the <strong> tag)", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__strong", label: "Bold Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__strong", label: "Bold Background Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "em", label: "Emphasis (Italic text using the <em> tag)", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__em", label: "Italic Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__em", label: "Italic Background Color", ...brandColorField }, // prettier-ignore
                { name: "text-emphasis", label: "Emphasis symbol Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "mark", label: "Highlighted Text (using the <mark> tag)", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__mark", label: "Highlighted Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__mark", label: "Highlighted Background Color", ...brandColorField }, // prettier-ignore
                { name: "border__mark", label: "Highlighted Border Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "b", label: "Visually important text (using the <b> tag)", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__b", label: "Visually important Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__b", label: "Visually important Background Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "heading", label: "Heading", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__heading", label: "Heading Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__heading", label: "Heading Background Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "a", label: "Link (using the <a> tag)", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__a", label: "Link Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__a", label: "Link Background Color", ...brandColorField }, // prettier-ignore
                { name: "text__a--hover", label: "Link Text Hover Color", ...brandColorField }, // prettier-ignore
                { name: "bg__a--hover", label: "Link Background Hover Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "button", label: "Button", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__button", label: "Button Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__button", label: "Button Background Color", ...brandColorField }, // prettier-ignore
                { name: "border__button", label: "Button Border Color", ...brandColorField }, // prettier-ignore
                { name: "text__button--hover", label: "Button Text Hover Color", ...brandColorField }, // prettier-ignore
                { name: "bg__button--hover", label: "Button Background Hover Color", ...brandColorField }, // prettier-ignore
                { name: "border__button--hover", label: "Button Border Hover Color", ...brandColorField }, // prettier-ignore
                { name: "text__button--disabled", label: "Button Text Disabled Color", ...brandColorField }, // prettier-ignore
                { name: "bg__button--disabled", label: "Button Background Disabled Color", ...brandColorField }, // prettier-ignore
                { name: "border__button--disabled", label: "Button Border Disabled Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "code", label: "Code (using tags such as code, kbd, pre, samp)", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "text__code", label: "Code Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__code", label: "Code Background Color", ...brandColorField }, // prettier-ignore
                { name: "border__code", label: "Code Border Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "svg", label: "Default SVG & icon", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "fill", label: "Fill Color", ...brandColorField }, // prettier-ignore
                { name: "stroke", label: "Stroke Color", ...brandColorField }, // prettier-ignore
                { name: "icon-fill", label: "Icon Fill Color", ...brandColorField }, // prettier-ignore
                { name: "icon-stroke", label: "Icon Stroke Color", ...brandColorField }, // prettier-ignore
              ]
            },
            // prettier-ignore
            {
              name: "scrollbar", label: "Scroll Bar ", widget: "object", collapsed: "auto", required: false, fields: [
                { name: "track-color", label: "Scrollbar Track Color", ...brandColorField }, // prettier-ignore
                { name: "thumb-color", label: "Scrollbar Thumb Color", ...brandColorField }, // prettier-ignore
              ]
            },
            {
              name: "advanced",
              label: "Legacy options [DO NOT USE] (Deprecated)",
              widget: "object",
              collapsed: true,
              required: false,
              fields: [
                { name: "text__heading", label: "Heading Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__heading", label: "Heading Background Color", ...brandColorField }, // prettier-ignore
                { name: "text__a", label: "Link Text  Color", ...brandColorField }, // prettier-ignore
                { name: "bg__a", label: "Link Background Color", ...brandColorField }, // prettier-ignore
                { name: "text__a--hover", label: "Link Text Hover Color", ...brandColorField }, // prettier-ignore
                { name: "bg__a--hover", label: "Link Background Hover Color", ...brandColorField }, // prettier-ignore
                { name: "text__button", label: "Button Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__button", label: "Button Background Color", ...brandColorField }, // prettier-ignore
                { name: "text__button--hover", label: "Button Text Hover Color", ...brandColorField }, // prettier-ignore
                { name: "bg__button--hover", label: "Button Background Hover Color", ...brandColorField }, // prettier-ignore
                { name: "text__button--disabled", label: "Button Text Disabled Color", ...brandColorField }, // prettier-ignore
                { name: "bg__button--disabled", label: "Button Background Disabled Color", ...brandColorField }, // prettier-ignore
                { name: "icon-fill", label: "Icon Fill Color", ...brandColorField }, // prettier-ignore
                { name: "icon-stroke", label: "Icon Stroke Color", ...brandColorField }, // prettier-ignore
                { name: "text__code", label: "Code Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__code", label: "Code Background Color", ...brandColorField }, // prettier-ignore
                { name: "border__code", label: "Code Border Color", ...brandColorField }, // prettier-ignore
                { name: "text__mark", label: "Mark Text Color", ...brandColorField }, // prettier-ignore
                { name: "bg__mark", label: "Mark Background Color", ...brandColorField }, // prettier-ignore
                { name: "border__mark", label: "Mark Border Color", ...brandColorField }, // prettier-ignore
                { name: "track-color", label: "Scrollbar Track Color", ...brandColorField }, // prettier-ignore
                { name: "thumb-color", label: "Scrollbar Thumb Color", ...brandColorField }, // prettier-ignore
              ],
            },
          ],
        },
        {
          name: "styleContexts",
          label: "Style Contexts",
          label_singular: "Style Context",
          widget: "list",
          required: false,
          collapsed: true,
          allow_reorder: true,
          summary:
            "{{name}}: {{widthsContext}} | {{fontStacksContext}} | {{typeScale}} | {{palette}}",
          hint: "You can group styles in different contexts to be used across the website using a class name like '.ctx-[name]'.",
          default: [{ name: "main", value: "ctx" }],
          fields: [
            {
              name: "name",
              label: "Name",
              widget: "string",
              required: true,
              hint: "Used to generate the class name associated with this context (e.g. '.ctx-main')",
            },
            // prettier-ignore
            { label: "Widths Context", name: "widthsContext", ...styleContextRelationField("widthsContexts") }, // prettier-ignore
            { label: "Font Stacks Context", name: "fontStacksContext", ...styleContextRelationField("fontStacksContexts") }, // prettier-ignore
            { label: "Type Scale", name: "typeScale", ...styleContextRelationField("typeScales") }, // prettier-ignore
            { label: "Palette", name: "palette", ...styleContextRelationField("palettes") }, // prettier-ignore
          ],
        },
      ],
    },
  ],
});

export class CmsConfig {
  data() {
    return {
      layout: null,
      eleventyExcludeFromCollections: true,
      permalink: "/admin/config.json",
      lang: "en",
    };
  }
  async render(data) {
    const fontsourceFonts = (data.fontServices?.fontsource?.fonts || []).map(
      ({ family: value }) => ({ value, label: value }),
    );

    const userConfig = await userCmsConfig();
    const activeCollections = await getActiveCollections();

    // Rebuild the `sections` field with the fully merged active collections
    // (built-in selected + user-defined) so the section-collection select
    // widget shows every collection the user can actually pick. Then patch
    // each generated CMS collection so its `fields` array uses the fresh
    // sections field instead of the module-eval-time default (which only
    // knew about built-in `selectedCollections`).
    const freshSectionsField = buildSectionsField(activeCollections);
    const patchCollectionSections = (c) => {
      if (!Array.isArray(c?.fields)) return c;
      const idx = c.fields.findIndex((f) => f?.name === "sections");
      if (idx === -1) return c;
      const nextFields = c.fields.slice();
      nextFields[idx] = freshSectionsField;
      return { ...c, fields: nextFields };
    };

    const allSelectedCollections = activeCollections.map(
      patchCollectionSections,
    );
    // const allSelectedCollections = activeCollections;
    const allSelectedCollectionNames = allSelectedCollections?.map(
      ({ name }) => name,
    );

    // TODO: HERE
    const allDataFilesCollection = {
      ...dataFilesCollection,
      files: [
        ...dataFilesCollection.files,
        ...activeCollections
          .map((collection) => {
            const dataFields = removeNonDataFields(collection.fields);
            if (collection.dataFile === false || dataFields.length === 0) {
              return null;
            }
            return {
              name: collection.name + "Data",
              label: collection.label + " Data",
              icon: collection.icon,
              file: `${CONTENT_DIR}/{{locale}}/${collection.name}/${collection.name}.yaml`,
              // format: "yaml",
              i18n: true,
              // fields: [tagsListField, varsField, dataListField],
              fields: dataFields,
            };
          })
          .filter(Boolean),
      ],
    };

    const generalConfig = {
      backend: {
        name: CMS_BACKEND,
        repo: CMS_REPO,
        branch: CMS_BRANCH,
        base_url: CMS_AUTH_URL,
        automatic_deployments: false, // Deprecated but keeping it for a while until I'm sure everyone is upgraded
        skip_ci: true,
      },
      // TODO: configure data formating: https://github.com/sveltia/sveltia-cms?tab=readme-ov-file#controlling-data-output
      output: {
        omit_empty_optional_fields: true,
        encode_file_path: true, // true to URL-encode file paths for File/Image fields
        json: {
          indent_style: "space", // space or tab
          indent_size: 2,
        },
        yaml: {
          quote: "none", // none or single or double
          indent_size: 2,
        },
      },
      site_url: PROD_URL,
      display_url: DISPLAY_URL,
      // logo_url:
      //   "https://raw.githubusercontent.com/m4rrc0/poko-website-builder/3fbe32b2f8a00e5e2b1a8fff60d7772ace8e1820/assets/assets/POKO-favicon-RVB-light_dark.svg",
      logo_url: `https://raw.githubusercontent.com/m4rrc0/poko-website-builder/8357dd9cbcedcf179d03212531b2df941c068840/assets/POKO-favicon-RVB-light_dark.svg`,
      app_title: "poko CMS",
      // MEDIAS
      media_folder: `/${CONTENT_DIR}/_images`,
      public_folder: "/_images",
      asset_collections: [
        {
          name: "publicFiles",
          label: "Public Files",
          icon: "attach_file",
          media_folder: `/${CONTENT_DIR}/_files`,
          public_folder: "/assets/files",
        },
        {
          name: "globalPartials",
          label: "Global Partials",
          icon: "code_blocks",
          media_folder: `/${CONTENT_DIR}/_partials`,
          public_folder: "/_partials",
        },
        {
          name: "dataFiles",
          label: "Data Files",
          icon: "code",
          media_folder: `/${CONTENT_DIR}/_data`,
          public_folder: "/_data",
        },
      ],
      media_libraries: {
        // stock_assets: { providers: [] },
        default: {
          config: {
            slugify_filename: true, // default: false
            max_file_size: 25000000, // 25MB is max on CF pages. 100MB is the max on Github // TODO: What if people need larger files? Need to find a place to offload large files.
            transformations: {
              raster_image: {
                format: "webp",
                quality: 92,
                width: 5000,
                height: 5000,
              },
              svg: {
                optimize: true,
              },
            },
          },
        },
      },
      // I18N
      locale: "en", // Locale for the CMS admin ("en" or "jp" while in beta)
      i18n: {
        // multiple_folders - persists files in `<folder>/<locale>/<slug>.<extension>`
        // multiple_files - persists files in `<folder>/<slug>.<locale>.<extension>`
        // single_file - persists a single file in `<folder>/<slug>.<extension>`
        structure: "multiple_folders",
        locales,
        default_locale, // Defaults to the first locale in the list
        save_all_locales: false, // DEPRECATED: Replaced entirely by initial_locales. default: true // Allows for disabling a localization
        initial_locales: "default", // default: "all" // Allows for setting the initial locales
      },
      slug: {
        encoding: "ascii",
        clean_accents: true, // Transliterate accented characters to their closest ASCII equivalent
      },
      field_defaults: {
        richtext: {
          ...defaultMarkdownOptions,
        },
      },
      collections: [
        ...(mustSetup
          ? []
          : [
              // `pagesCollection` + `allSelectedCollections` = built-in
              // pages + selected + user-defined, each with its `sections`
              // field patched to know about every active collection (see
              // `freshSectionsField` above).
              patchCollectionSections(pagesCollection),
              ...allSelectedCollections,
              { divider: true },
              // {
              //   divider: Boolean(!mustSetup && userConfig.collections?.length),
              // },
              // navCollection(allSelectedCollections),
              // navCollection2,
              // footerCollection,
              pageLayoutsCollection,
              { divider: true },
              partialsCollection,
              htmlPartialsCollection,
              // sectionLayoutsCollection,
              { divider: true },
              stylesConfigCollection(fontsourceFonts),
              stylesheetsCollection,
              { divider: true },
              allDataFilesCollection,
              advancedDataFilesCollection,
            ]),
      ],
      singletons: [
        // ...(mustSetup ? [] : [styleTokensSingleton]),
        globalSettingsSingleton,
        { divider: Boolean(!mustSetup && userConfig.singletons?.length) },
        ...(mustSetup ? [] : [...userConfig.singletons]),
      ],
    };

    return JSON.stringify(generalConfig, null, isDev ? 2 : 0);
  }
}
// export const navCollection2 = {
//   name: "navs",
//   label: "Navs",
//   label_singular: "Nav",
//   path: "navs/{{slug}}",
//   slug: "{{fields._slug}}",
//   icon: "menu_open",
//   folder: `${CONTENT_DIR}/_partials`,
//   extension: "md",
//   format: "yaml-frontmatter",
//   create: true,
//   editor: { preview: false }, // to not display the preview of the page like in other collections
//   summary: "{{slug}}",
//   i18n: true, // to have the left-right feature with the two languages
//   // MEDIAS
//   media_folder: `/${CONTENT_DIR}/_images`,
//   public_folder: "/_images",
//   sortable_fields: {
//     fields: ["slug"],
//     default: {
//       field: "slug",
//       direction: "ascending",
//     },
//   },
//   fields: [
//     {
//       name: "body",
//       label: "Content",
//       widget: "richtext",
//       required: false,
//       i18n: true, // each language has its own body
//     },
//   ],
// };

// export const footerCollection = {
//   // identifier_field: "{{slug}}",
//   name: "footers",
//   label: "Footers",
//   label_singular: "Footer",
//   path: "footers/{{slug}}",
//   slug: "{{fields._slug}}",
//   icon: "bottom_navigation",
//   folder: `${CONTENT_DIR}/_partials`,
//   extension: "md",
//   format: "yaml-frontmatter",
//   create: true,
//   editor: { preview: false }, // to not display the preview of the page like in other collections
//   summary: "{{slug}}",
//   i18n: true, // to have the left-right feature with the two languages
//   // MEDIAS
//   media_folder: `/${CONTENT_DIR}/_images`,
//   public_folder: "/_images",
//   sortable_fields: {
//     fields: ["slug"],
//     default: {
//       field: "slug",
//       direction: "ascending",
//     },
//   },
//   fields: [
//     {
//       name: "body",
//       label: "Content",
//       widget: "richtext",
//       required: false,
//       i18n: true, // each language has its own body
//     },
//   ],
// };

// Example Blog Collection
// fields: # The fields for each document
// - name: "blog" # Used in routes, e.g., /admin/collections/blog
// label: "Blog" # Used in the UI
// folder: "${CONTENT_DIR}/blog" # The path to the folder where the documents are stored
// create: true # Allow users to create new documents in this collection
// slug: "{{year}}-{{month}}-{{day}}-{{slug}}" # Filename template, e.g., YYYY-MM-DD-title.md
// fields: # The fields for each document, usually in front matter
// - { label: "Layout", name: "layout", widget: "hidden", default: "blog" }
// - { label: "Title", name: "title", widget: "string", required: true }
// - { label: "Publish Date", name: "date", widget: "datetime", required: false }
// - { label: "Featured Image", name: "thumbnail", widget: "image", required: false }
// - { label: "Rating (scale of 1-5)", name: "rating", widget: "number", required: false }
// - { label: "Body", name: "body", widget: "richtext", required: false }

// ADVANCED LINK FIELD WIP
// {
//   name: 'advancedLink',
//   label: 'Advanced Link',
//   required: false,
//   widget: 'object',
//   types: [
//     { name: 'internal', label: 'Internal', widget: 'object', fields: [
//       { name: 'collection', label: 'Collection', widget: 'object', types: [
//         { name: 'pages', label: 'Pages', widget: 'relation', collection: 'pages', search_fields: ['name'], value_field: 'name', display_fields: ['name'] },
//         { name: 'articles', label: 'Articles', widget: 'relation', collection: 'articles', search_fields: ['name'], value_field: 'name', display_fields: ['name'] },
//       ]},
//       // { name: 'href', label: 'Href', widget: 'string' },
//       { name: 'target', label: 'Target', widget: 'select', options: [
//         { value: '_self', label: 'Self' },
//         { value: '_blank', label: 'Blank' }
//       ] },
//       { name: 'rel', label: 'Rel', widget: 'select', options: [
//         { value: 'noopener', label: 'Noopener' },
//         { value: 'noreferrer', label: 'Noreferrer' }
//       ] },
//       { name: 'class', label: 'Class', widget: 'string' }
//     ]},
//     { name: 'external', label: 'External', widget: 'object', fields: [
//       { name: 'url', label: 'URL', widget: 'string' },
//       { name: 'target', label: 'Target', widget: 'select', options: [
//         { value: '_self', label: 'Self' },
//         { value: '_blank', label: 'Blank' }
//       ] },
//       { name: 'rel', label: 'Rel', widget: 'select', options: [
//         { value: 'noopener', label: 'Noopener' },
//         { value: 'noreferrer', label: 'Noreferrer' }
//       ] },
//       { name: 'class', label: 'Class', widget: 'string' }
//     ]},
//     { name: 'file', label: 'File', widget: 'object', fields: [
//       { name: 'file', label: 'File', widget: 'object', fields: [
//         { name: 'discriminant', label: 'Discriminant', widget: 'select', options: [
//           { value: 'filesLibrary', label: 'Files Library' },
//           { value: 'local', label: 'Local' },
//           { value: 'external', label: 'External' }
//         ] },
//         { name: 'value', label: 'Value', widget: 'string' }
//       ] },
//       { name: 'target', label: 'Target', widget: 'select', options: [
//         { value: '_self', label: 'Self' },
//         { value: '_blank', label: 'Blank' }
//       ] },
//       { name: 'download', label: 'Download', widget: 'boolean' },
//       { name: 'hreflang', label: 'Hreflang', widget: 'string' },
//       { name: 'rel', label: 'Rel', widget: 'select', options: [
//         { value: 'noopener', label: 'Noopener' },
//         { value: 'noreferrer', label: 'Noreferrer' }
//       ] },
//       { name: 'class', label: 'Class', widget: 'string' }
//     ]},
//     { name: 'email', label: 'Email', widget: 'object', fields: [
//       { name: 'email', label: 'Email', widget: 'string' },
//       { name: 'subject', label: 'Subject', widget: 'string' },
//       { name: 'cc', label: 'CC', widget: 'string' },
//       { name: 'bcc', label: 'BCC', widget: 'string' },
//       { name: 'body', label: 'Body', widget: 'string' },
//       { name: 'target', label: 'Target', widget: 'select', options: [
//         { value: '_self', label: 'Self' },
//         { value: '_blank', label: 'Blank' }
//       ] },
//       { name: 'hreflang', label: 'Hreflang', widget: 'string' },
//       { name: 'rel', label: 'Rel', widget: 'select', options: [
//         { value: 'noopener', label: 'Noopener' },
//         { value: 'noreferrer', label: 'Noreferrer' }
//       ] },
//       { name: 'class', label: 'Class', widget: 'string' }
//     ]},
//     { name: 'phone', label: 'Phone', widget: 'object', fields: [
//       { name: 'phone', label: 'Phone', widget: 'string' },
//       { name: 'target', label: 'Target', widget: 'select', options: [
//         { value: '_self', label: 'Self' },
//         { value: '_blank', label: 'Blank' }
//       ] },
//       { name: 'hreflang', label: 'Hreflang', widget: 'string' },
//       { name: 'rel', label: 'Rel', widget: 'select', options: [
//         { value: 'noopener', label: 'Noopener' },
//         { value: 'noreferrer', label: 'Noreferrer' }
//       ] },
//       { name: 'class', label: 'Class', widget: 'string' }
//     ]}
//   ]
// },
