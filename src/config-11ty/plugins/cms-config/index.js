// NOTE: I I need to work on a Sveltia fork: https://github.com/sveltia/sveltia-cms/issues/180#issuecomment-2256112119
import { NODE_ENV, CONTENT_DIR, PROD_URL, DISPLAY_URL, CMS_AUTH_URL, CMS_REPO, CMS_BACKEND, CMS_BRANCH } from "../../../../env.config.js";

const isDev = NODE_ENV === 'development';

const commonCollectionFields = [
  { name: "lang", label: "Language", widget: "hidden", default: "{{locale}}", i18n: true },
  { name: "createdAt", label: "Created At", widget: "hidden", default: "{{datetime}}", i18n: true },
  { name: "uuid", label: "UUID", widget: "hidden", default: "{{uuid_short}}", i18n: true },
  { name: "localizationKey", label: "Localization Key", widget: "hidden", default: "{{uuid_short}}", i18n: "duplicate" },
];

const mostCommonMdocCollectionConfig = {
  i18n: true,
  folder: `${CONTENT_DIR}`,
  extension: "mdoc",
  format: "yaml-frontmatter",
  create: true,
  identifier_field: "name",
  summary: "{{name}}",
  sortable_fields: {
    fields: ["name"],
    default: {
      field: "name",
      direction: "ascending"
    }
  },
}


class CmsConfig {
	data() {
		return {
      layout: false,
			permalink: "/admin/config.json",
		};
	}
	render(data) {
        const pageFields = [
          ...commonCollectionFields,
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
          { name: "name", label: "Page Name", widget: "string", required: true, i18n: true },
          // { name: "path", label: "Page URL path", widget: "string", required: true, pattern: ['^(?![\s\/\-]*$)(?!\/)[a-z0-9\/\-]*[a-z0-9\-]$', "URL must contain only letters, numbers, dashes, and forward slashes (not starting or ending with a slash or dash), and at least one letter or number"], hint: "URL-friendly slug or path (may contain '/' and '-'). NOTE: The homepage must be called 'index'"},
          { name: "body", label: "Content", widget: "markdown", required: false, i18n: true },
          { name: "eleventyNavigation", label: "Main Navigation", widget: "object", collapsed: true, required: false, summary: 'Position: {{fields.order}} | Nav Title: {{fields.title}}', i18n: true, fields: [
              { name: "title", label: "Title", widget: "string", required: false, i18n: true, hint: "Default: Page Name" },
              { name: "parent", label: "Parent Page", widget: "relation", collection: "pages", search_fields: ["name"], value_field: "name", display_fields: ["name"], required: false, i18n: 'duplicate' },
              { name: "order", label: "Order", widget: "number", default: 0, required: false, i18n: 'duplicate' }
          ]},
          { name: "metadata", label: "Metadata", widget: "object", collapsed: true, i18n: true, fields: [
              { name: "title", label: "Title", widget: "string", required: false, hint: "Default: Page Name", i18n: true },
              { name: "description", label: "Description", widget: "text", required: false, i18n: true },
              { name: "image", label: "Image", widget: "image", required: false, hint: "The default image used for sharing preview", allow_multiple: false, media_library: { config: { max_file_size: 10000000 } }, i18n: true },
          ]},
        ]
        const pagesCollection = {
          ...mostCommonMdocCollectionConfig,
            name: "pages",
            label: "Pages",
            label_singular: "Page",
            path: "pages/{{slug}}",
            summary: "{{name}} {{eleventyNavigation.add | ternary(' (nav ', '')}}{{eleventyNavigation.order}}{{eleventyNavigation.add | ternary(')', '')}}",
            sortable_fields: {
              fields: ["eleventyNavigation.parent", "name", "eleventyNavigation.add", "eleventyNavigation.order"],
              default: {
                field: "eleventyNavigation.order",
                direction: "ascending"
              }
            },
            view_filters: [
              {
                label: "Navigation",
                field: "eleventyNavigation.add",
                pattern: true
              }
            ],
            // MEDIAS
            media_folder: `/${CONTENT_DIR}/_images`,
            public_folder: "/_images",
            fields: pageFields
        };
        const articleFields = [
          ...commonCollectionFields,
          { name: "name", label: "Article Name", widget: "string", required: true, hint: "Internal name that will be used to generate the URL", i18n: true },
          { name: "body", label: "Content", widget: "markdown", required: false, i18n: true },
        ]
        const articlesCollection = {
          ...mostCommonMdocCollectionConfig,
          name: "articles",
          label: "Articles",
          label_singular: "Article",
          // description: "Articles of the website",
          path: "articles/{{slug}}",
          media_folder: `/${CONTENT_DIR}/_images`,
          public_folder: "/_images",
          fields: articleFields
        };
        const filesCollection = {
          ...mostCommonMdocCollectionConfig,
          name: "files",
          label: "Files",
          label_singular: "File",
          // description: "Articles of the website",
          path: "files/{{slug}}",
          media_folder: `/${CONTENT_DIR}/_files`,
          public_folder: "/_files",
          fields: [
            ...commonCollectionFields,
          ]
        };

        const generalConfig = {
            backend: {
                name: CMS_BACKEND,
                repo: CMS_REPO,
                branch: CMS_BRANCH,
                base_url: CMS_AUTH_URL,
                automatic_deployments: false,
            },
            site_url: PROD_URL,
            display_url: DISPLAY_URL,
            // logo_url: "https://your-site.com/images/logo.svg",
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
                      quality: 85,
                      width: 2048,
                      height: 2048
                    },
                    svg: {
                      optimize: true
                    }
                  }
                }
              }
            },
            // I18N
            locale: "en", // Locale for the CMS admin ("en" or "jp" while in beta)
            i18n: {
              structure: "multiple_folders",
              locales: ["it", "en", "fr"],
              default_locale: "it", // Defaults to the first locale in the list
            },
            collections: [pagesCollection, articlesCollection, filesCollection]
        };

		return JSON.stringify(generalConfig, null, isDev ? 2 : 0);
	}
}

export default async function(eleventyConfig, pluginOptions) {
    eleventyConfig.versionCheck(">=3.0.0-alpha.1");
    
    eleventyConfig.addTemplate("admin/config.11ty.js", CmsConfig);
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