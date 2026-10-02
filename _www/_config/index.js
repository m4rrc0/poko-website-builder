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

const { projects, pages, spreadPageSetup } = await import(
  `../${SRC_DIR_FROM_WORKING_DIR}/config-11ty/plugins/cms-config/index.js`
);

const additionalProjectConfig = [
    {
        name: "url",
        label: "Project URL",
        type: "string",
        required: true,
        i18n: "duplicate"
    },
    {
        name: "description",
        label: "Description",
        widget: "markdown",
        required: false,
        i18n: true,
    },
    {
        name: "image",
        label: "Image",
        widget: "object",
        required: false,
        i18n: "duplicate",
        fields: [
            {
                name: "src",
                label: "Image",
                widget: "image",
                required: true,
            },
            {
                name: "alt",
                label: "Alt Text",
                widget: "string",
                required: false,
            },
        ],
    },
    {
        name: "highlights",
        label: "Highlights",
        widget: "list",
        fields: [
            {
                name: "text",
                label: "Text",
                type: "string",
                required: false,
                i18n: true,
            },
            {
                name: "url",
                label: "URL",
                type: "string",
                required: false,
                i18n: true,
            }
        ],
    },
    {
        name: "backgroundColor",
        label: "Background color for highlights",
        widget: "string",
        required: true,
        i18n: "duplicate"
    },
    {
        name: "textColor",
        label: "Text color for highlights",
        hint: "If not set, it will be determined based on the background color",
        widget: "string",
        required: false,
        i18n: "duplicate"
    },
    {
        name: "capsuleBackgroundColor",
        label: "Capsule background color",
        hint: "If not set, it will be set to white",
        widget: "string",
        required: false,
        i18n: "duplicate"
    },
]

const pos = 4;
const projectFields = [
    ...projects.fields.slice(0, pos),
    ...additionalProjectConfig,
    ...projects.fields.slice(pos),
]

const additionalDocsConfig = [
    {
        name: "docsNav",
        label: "Docs Navigation",
        widget: "object",
        collapsed: false,
        required: false,
        i18n: "duplicate",
        fields: [
            {
                name: "section",
                label: "Section",
                widget: "select",
                required: false,
                i18n: "duplicate",
                options: [
                    { value: "getting-started", label: "Getting Started" },
                    { value: "content", label: "Content" },
                    { value: "building-pages", label: "Building Pages" },
                    { value: "advanced", label: "Advanced" },
                ],
            },
            {
                name: "order",
                label: "Order",
                widget: "number",
                value_type: "int",
                required: false,
                hint: "Position dans la section",
                i18n: "duplicate",
            },
        ],
    },
];

const docsFields = [
    ...pages.fields.slice(0, pos),
    ...additionalDocsConfig,
    ...pages.fields.slice(pos),
]

export const collections = [
    {
        ...projects,
        ...spreadPageSetup("projects"),
        icon: "folder_open",
        fields: projectFields,
    },
    {
        ...spreadPageSetup("docs"),
        icon: "menu_book",
        fields: docsFields,
    },
];

export const singletons = [];
