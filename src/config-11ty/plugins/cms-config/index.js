// NOTE: I I need to work on a Sveltia fork: https://github.com/sveltia/sveltia-cms/issues/180#issuecomment-2256112119
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
  collections as selectedCollections,
  languages,
} from "../../../../env.config.js";

const isDev = NODE_ENV === "development";
const mustSetup = !languages?.length;

const default_locale = languages.find((lang) => lang.isCmsDefault)?.code;
const locales = languages
  .filter((lang) => /^published|draft/.test(lang.status))
  .map((lang) => lang.code);

const commonCollectionFields = [
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
  {
    name: "uuid",
    label: "UUID",
    widget: "hidden",
    default: "{{uuid_short}}",
    i18n: true,
  },
  {
    name: "localizationKey",
    label: "Localization Key",
    widget: "hidden",
    default: "{{uuid_short}}",
    i18n: "duplicate",
  },
];

const mostCommonMarkdownCollectionConfig = {
  i18n: true,
  folder: `${CONTENT_DIR}`,
  extension: "md",
  format: "yaml-frontmatter",
  create: true,
  identifier_field: "name",
  summary: "{{name}}",
  sortable_fields: {
    fields: ["name"],
    default: {
      field: "name",
      direction: "ascending",
    },
  },
};

class CmsConfig {
  data() {
    return {
      layout: false,
      permalink: "/admin/config.json",
      lang: "en",
    };
  }
  render(data) {
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
          name: "languages",
          label: "Languages",
          description: "❗️ Re-build your site to see your changes here",
          widget: "list",
          required: true,
          collapsed: true,
          summary:
            "{{status | capitalize}}: {{code | upper}} - {{name}} -- Default for: {{isCmsDefault | ternary('CMS', '')}} {{isWebsiteDefault | ternary('Website', '')}}",
          fields: [
            {
              name: "code",
              label: "Language Code",
              widget: "string",
              required: true,
            },
            {
              name: "name",
              label: "Language Name",
              widget: "string",
              required: true,
            },
            {
              name: "customUrlPrefix",
              label: "Custom URL Prefix",
              widget: "object",
              collapsed: false,
              required: false,
              // summary: "Position: {{fields.order}} | Nav Title: {{fields.title}}",
              fields: [
                {
                  name: "prefix",
                  label: "URL Prefix",
                  widget: "string",
                  required: false,
                },
              ],
            },
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
              name: "isCmsDefault",
              label: "Is CMS Default",
              description: "Defaults to the first language of the list",
              widget: "boolean",
              required: true,
              default: false,
            },
            {
              name: "isWebsiteDefault",
              label: "Is Website Default",
              description: "Defaults to the first language of the list",
              widget: "boolean",
              required: true,
              default: false,
            },
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
          options: ["articles"],
        },
      ],
    };

    const dataCollection = {
      // ...mostCommonMarkdownCollectionConfig,
      // i18n: false,
      icon: "table_edit",
      name: "data",
      label: "Data",
      editor: { preview: false },
      i18n: true,
      files: [
        {
          name: "languageData",
          label: "Language Data",
          icon: "translate",
          file: `${CONTENT_DIR}/{{locale}}/{{locale}}.yaml`,
          // format: "yaml",
          i18n: true,
          fields: [
            {
              name: "dico",
              label: "Dico",
              widget: "keyvalue",
              i18n: true,
              required: false,
            },
            {
              name: "data",
              label: "Data",
              widget: "keyvalue",
              i18n: true,
              required: false,
            },
            // {
            //   name: "defaultLanguage",
            //   label: "Default Language",
            //   widget: "string",
            // },
            // {
            //   name: "languages",
            //   label: "Languages",
            //   widget: "select",
            //   multiple: true,
            //   options: ["it", "en", "fr"],
            // },
          ],
        },
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
        {
          name: "dataFiles",
          label: "Data Files",
          icon: "code",
          file: `${CONTENT_DIR}/_data/none.yaml`,
          media_folder: `/${CONTENT_DIR}/_data`,
          public_folder: "/_data",
          fields: [],
        },
        {
          name: "publicFiles",
          label: "Public Files",
          icon: "attach_file",
          file: `${CONTENT_DIR}/_files/none.yaml`,
          media_folder: `/${CONTENT_DIR}/_files`,
          public_folder: "/_files",
          fields: [],
        },
      ],
    };
    const stylesFields = [
      {
        name: "body",
        label: "Content",
        widget: "code",
        required: false,
        output_code_only: true,
        default_language: "css",
        allow_language_selection: false,
      },
    ];
    const stylesCollection = {
      name: "styles",
      label: "Styles",
      label_singular: "Style",
      path: "{{slug}}",
      icon: "brush",
      folder: `${CONTENT_DIR}/_styles`,
      extension: "css",
      format: "yaml-frontmatter",
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
      fields: stylesFields,
    };
    const partialsFields = [
      {
        name: "body",
        label: "Content",
        widget: "markdown",
        required: false,

        // widget: "code",
        // required: false,
        // output_code_only: true,
        // allow_language_selection: false,
      },
    ];
    const partialsCollection = {
      name: "partials",
      label: "Partials",
      label_singular: "Partial",
      path: "{{slug}}",
      icon: "brick",
      folder: `${CONTENT_DIR}/_partials`,
      extension: "md",
      format: "yaml-frontmatter",
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
      fields: partialsFields,
    };
    const sectionFields = [
      ...commonCollectionFields,
      {
        name: "name",
        label: "Name",
        widget: "string",
        required: true,
        i18n: "duplicate",
      },
      {
        name: "blocks",
        label: "Blocks",
        widget: "list",
        required: false,
        i18n: true,
        types: [
          {
            name: "images",
            label: "Images",
            widget: "object",
            required: false,
            fields: [
              {
                name: "images",
                label: "Images",
                widget: "image",
                required: false,
                allow_multiple: true,
              },
            ],
          },
          {
            name: "markdown",
            label: "Markdown",
            widget: "object",
            required: false,
            fields: [
              {
                name: "value",
                label: "Value",
                widget: "markdown",
                required: false,
              },
            ],
          },
        ],
      },
      {
        name: "styles",
        label: "Styles",
        widget: "code",
        required: false,
        output_code_only: true,
        allow_language_selection: false,
        language: "css",
      },
    ];
    const sectionsCollection = {
      name: "sections",
      label: "Sections",
      label_singular: "Section",
      icon: "add_column_right",
      slug: "{{name}}", // This allows the slug to be localized
      folder: `${CONTENT_DIR}`,
      path: "sections/{{slug}}",
      i18n: { structure: "single_file" },
      extension: "yaml",
      create: true,
      identifier_field: "name",
      summary: "{{name}}",
      sortable_fields: {
        fields: ["name"],
        default: {
          field: "name",
          direction: "ascending",
        },
      },
      // MEDIAS
      media_folder: `/${CONTENT_DIR}/_images`,
      public_folder: "/_images",
      fields: sectionFields,
    };
    const pageFields = [
      ...commonCollectionFields,
      // {
      //   name: "partial",
      //   label: "Partial",
      //   widget: "relation",
      //   collection: "partials",
      // },
      // { name: 'collection', label: 'Collection', widget: 'object', types: [
      //   { name: 'pages', label: 'Pages', widget: 'object', fields: [
      //     { name: 'pages', label: 'Pages', widget: 'relation', collection: 'pages' },
      //   ]},
      //   { name: 'articles', label: 'Articles', widget: 'object', fields: [
      //     { name: 'articles', label: 'Articles', widget: 'relation', collection: 'articles' },
      //   ]},
      // ]},
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
      {
        name: "status",
        label: "Status",
        widget: "select",
        options: [
          { value: "published", label: "Published" },
          { value: "draft", label: "Draft" },
          { value: "noindex", label: "Noindex" },
          // TODO: later implement encrypted pages
          // { value: 'private', label: 'Private' },
          { value: "inactive", label: "Inactive" },
        ],
        default: "published",
        required: true,
        i18n: true,
      },
      {
        name: "name",
        label: "Page Name",
        widget: "string",
        required: true,
        i18n: true,
      },
      // {
      //   name: "currentSlug",
      //   label: "Current slug",
      //   widget: "compute",
      //   value: "{{fields.name}}",
      //   i18n: true,
      // },
      // { name: "path", label: "Page URL path", widget: "string", required: true, pattern: ['^(?![\s\/\-]*$)(?!\/)[a-z0-9\/\-]*[a-z0-9\-]$', "URL must contain only letters, numbers, dashes, and forward slashes (not starting or ending with a slash or dash), and at least one letter or number"], hint: "URL-friendly slug or path (may contain '/' and '-'). NOTE: The homepage must be called 'index'"},
      {
        name: "body",
        label: "Content",
        widget: "markdown",
        required: false,
        i18n: true,
        editor_components: ["eleventyImage", "partial", "wrapper"],
      },
      {
        name: "eleventyNavigation",
        label: "Main Navigation",
        widget: "object",
        collapsed: true,
        required: false,
        summary: "Position: {{fields.order}} | Nav Title: {{fields.title}}",
        i18n: true,
        fields: [
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
          {
            name: "order",
            label: "Order",
            widget: "number",
            default: 0,
            required: false,
            i18n: "duplicate",
          },
        ],
      },
      {
        name: "metadata",
        label: "Metadata",
        widget: "object",
        required: false,
        collapsed: true,
        i18n: true,
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
            widget: "image",
            required: false,
            hint: "The default image used for sharing preview",
            allow_multiple: false,
            media_library: { config: { max_file_size: 10000000 } },
            i18n: "duplicate",
          },
        ],
      },
      {
        name: "pagePreview",
        label: "Page Preview",
        widget: "object",
        required: false,
        collapsed: true,
        i18n: true,
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
            hint: "Default: Metadata description",
            i18n: true,
          },
          {
            name: "image",
            label: "Image",
            widget: "image",
            required: false,
            hint: "The default image used when creating a visual preview of the page on your website. Default: Metadata image",
            allow_multiple: false,
            media_library: { config: { max_file_size: 10000000 } },
            i18n: "duplicate",
          },
        ],
      },
    ];
    const pagesCollection = {
      ...mostCommonMarkdownCollectionConfig,
      name: "pages",
      label: "Pages",
      label_singular: "Page",
      icon: "description",
      thumbnail: ["pagePreview.image", "metadata.image"],
      path: "pages/{{slug}}",
      // TODO: check if it works
      slug: "{{name | localize}}", // This allows the slug to be localized
      summary:
        "{{name}} {{eleventyNavigation.order | ternary(' (nav ', '')}}{{eleventyNavigation.order}}{{eleventyNavigation.order | ternary(')', '')}}",
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
      // MEDIAS
      media_folder: `/${CONTENT_DIR}/_images`,
      public_folder: "/_images",
      fields: pageFields,
      index_file: {
        name: "pages",
        label: "Page Data",
        format: "yaml",
        icon: "home",
        editor: { preview: false },
        fields: [
          {
            name: "layout",
            label: "Layout",
            widget: "string",
            default: "base",
            required: false,
          },
        ],
      },
    };
    const articleFields = [
      ...commonCollectionFields,
      {
        name: "name",
        label: "Article Name",
        widget: "string",
        required: true,
        hint: "Internal name that will be used to generate the URL",
        i18n: true,
      },
      {
        name: "body",
        label: "Content",
        widget: "markdown",
        required: false,
        i18n: true,
      },
    ];
    const articlesCollection = {
      ...mostCommonMarkdownCollectionConfig,
      // icon: "article",
      icon: "ink_pen",
      name: "articles",
      label: "Articles",
      label_singular: "Article",
      // description: "Articles of the website",
      path: "articles/{{slug}}",
      media_folder: `/${CONTENT_DIR}/_images`,
      public_folder: "/_images",
      fields: articleFields,
    };

    // const rawFilesCollection = {
    //   // ...mostCommonMarkdownCollectionConfig,
    //   // i18n: false,
    //   icon: "code",
    //   name: "files",
    //   label: "Files",
    //   description: "Files of the website",

    //   // label_singular: "Data",
    //   // path: "_data/{{slug}}",
    //   // media_folder: `/${CONTENT_DIR}/_data`,
    //   // public_folder: "/_data",
    //   // fields: [...commonCollectionFields],
    //   files: [
    //     {
    //       name: "rawFiles",
    //       label: "Raw Files",
    //       file: `${CONTENT_DIR}/_files/none.yaml`,
    //       media_folder: `/${CONTENT_DIR}/_files`,
    //       public_folder: "/_files",
    //       fields: [],
    //     },
    //     // {
    //     //   name: "dataFiles",
    //     //   label: "Data Files",
    //     //   file: `${CONTENT_DIR}/_data/none.yaml`,
    //     //   media_folder: `/${CONTENT_DIR}/_data`,
    //     //   public_folder: "/_data",
    //     //   fields: [],
    //     // },
    //   ],
    // };
    // const filesCollection = {
    //   ...mostCommonMarkdownCollectionConfig,
    //   name: "files",
    //   label: "Files",
    //   label_singular: "File",
    //   // description: "Articles of the website",
    //   path: "files/{{slug}}",
    //   media_folder: `/${CONTENT_DIR}/_files`,
    //   public_folder: "/_files",
    //   fields: [...commonCollectionFields],
    // };
    // const dataFilesCollection = {
    //   ...mostCommonMarkdownCollectionConfig,
    //   create: false,
    //   extension: "yaml",
    //   name: "dataFiles",
    //   label: "Data Files",
    //   label_singular: "Data File",
    //   path: "_data/{{slug}}",
    //   media_folder: `/${CONTENT_DIR}/_data`,
    //   public_folder: "/_data",
    //   fields: [...commonCollectionFields],
    // };

    const optionalCollections = {
      articles: articlesCollection,
    };
    const selectedOptionalCollections = (selectedCollections || [])
      .map((collectionName) => optionalCollections[collectionName])
      .filter(Boolean);

    const generalConfig = {
      backend: {
        name: CMS_BACKEND,
        repo: CMS_REPO,
        branch: CMS_BRANCH,
        base_url: CMS_AUTH_URL,
        automatic_deployments: false,
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
      // logo_url: "https://your-site.com/images/logo.svg",
      logo_url:
        "https://raw.githubusercontent.com/m4rrc0/poko-website-builder/3fbe32b2f8a00e5e2b1a8fff60d7772ace8e1820/assets/favicon-POKO-01.png",
      // MEDIAS
      media_folder: `/${CONTENT_DIR}/_images`,
      public_folder: "/_images",
      media_libraries: {
        stock_assets: { providers: [] },
        default: {
          config: {
            transformations: {
              raster_image: {
                format: "webp",
                quality: 98,
                width: 2048,
                height: 2048,
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
        save_all_locales: false, // default: true // Allows for disabling a localization
        initial_locales: "default", // default: "all" // Allows for setting the initial locales
      },
      slug: {
        encoding: "ascii",
        clean_accents: true, // Transliterate accented characters to their closest ASCII equivalent
      },
      collections: [
        ...(mustSetup
          ? []
          : [
              dataCollection,
              stylesCollection,
              { divider: true },
              partialsCollection,
              sectionsCollection,
              { divider: true },
              pagesCollection,
              ...selectedOptionalCollections,
              {
                divider: Boolean(
                  !mustSetup && data.userConfig.collections?.length
                ),
              },
              ...data.userConfig.collections,
            ]),
      ],
      singletons: [
        globalSettingsSingleton,
        { divider: Boolean(!mustSetup && data.userConfig.singletons?.length) },
        ...(mustSetup ? [] : [...data.userConfig.singletons]),
      ],
    };

    return JSON.stringify(generalConfig, null, isDev ? 2 : 0);
  }
}

export default async function (eleventyConfig, pluginOptions) {
  eleventyConfig.versionCheck(">=3.0.0-alpha.1");

  let userConfig = {
    collections: [],
    singletons: [],
  };

  try {
    const uc = await import(`${WORKING_DIR_ABSOLUTE}/_config/index.js`);
    userConfig = {
      ...userConfig,
      ...uc,
    };
  } catch (error) {
    console.error("Could not import user config\n", error);
  }

  eleventyConfig.addTemplate("admin/config.11ty.js", CmsConfig, { userConfig });
}

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
// - { label: "Body", name: "body", widget: "markdown", required: false }
