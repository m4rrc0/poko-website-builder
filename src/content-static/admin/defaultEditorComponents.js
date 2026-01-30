import { env } from "./env.js";

// let env;
// let currentCollections = [];
// let iconLists = {};
// let iconLibs = [];

const currentCollections = env?.collections || []
const iconLists = env?.iconLists || {}
const iconLibs = Object.keys(iconLists) || []

// try {
//   const envModule = await import("./env.js");
//   env = envModule.env;

// } catch (error) {
//   if (typeof window !== 'undefined') {
//     console.error("Failed to import env\n", error);
//   }
// }


console.log({ iconLists, iconLibs, env })


// Helper function to extract property values with balanced brackets/braces
const extractProperty = (argumentsString, propName) => {
  const startIndex = argumentsString.indexOf(propName + '=');
  if (startIndex === -1) return null;

  const valueStart = startIndex + propName.length + 1;
  const firstChar = argumentsString[valueStart];

  // Determine opening and closing delimiters
  let openChar, closeChar;
  if (firstChar === '[') {
    openChar = '[';
    closeChar = ']';
  } else if (firstChar === '{') {
    openChar = '{';
    closeChar = '}';
  } else {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = valueStart; i < argumentsString.length; i++) {
    const char = argumentsString[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === openChar) depth++;
      if (char === closeChar) {
        depth--;
        if (depth === 0) {
          return argumentsString.substring(valueStart, i + 1);
        }
      }
    }
  }
  return null;
};

// Helper function to extract quoted string values
const extractQuotedString = (argumentsString, propName) => {
  const startIndex = argumentsString.indexOf(propName + '=');
  if (startIndex === -1) return null;

  const valueStart = startIndex + propName.length + 1;
  const firstChar = argumentsString[valueStart];

  // Must start with a quote
  if (firstChar !== '"') return null;

  let escape = false;

  // Start from the character after the opening quote
  for (let i = valueStart + 1; i < argumentsString.length; i++) {
    const char = argumentsString[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (char === '\\') {
      escape = true;
      continue;
    }
    if (char === '"') {
      // Found closing quote - return the content without quotes
      return argumentsString.substring(valueStart + 1, i);
    }
  }
  return null;
};

const parsePartialSyntax = (match) => {
    // Parse the arguments from the captured string
    const partialSlug = match[1];
    // argumentString is in the form of `, {some: "value"}, "njk,md"`
    const argumentsString = match[2];
    const trimmedArgsString = argumentsString.replace(/^\s*,\s*/, "");

    let data = undefined;
    let templateEngineOverride = undefined;

    // Match object followed by optional string
    // Object: starts with { and ends with } (handles nested structures)
    // String: quoted string after the object
    const objectMatch = trimmedArgsString.match(/^(\{[\s\S]*?\})(?:\s*,\s*["']([^"']+)["'])?$/);

    if (objectMatch) {
        try {
          // Use Function constructor to safely evaluate JS object literal (not just JSON)
          data = new Function("return " + objectMatch[1])();
        } catch (e) {
          console.log("Error parsing data object:", e);
        }
        if (objectMatch[2]) {
          templateEngineOverride = objectMatch[2];
        }
    }

    return {
      partialSlug,
      data,
      templateEngineOverride,
    };
}

const stringifyPartial = (data, ext = ".md", scName = "partial") => {
  const parts = [`"${data.partialSlug}${ext}"`];

  const hasData = data.data && Object.keys(data.data).length > 0;
  const hasOverride = data.templateEngineOverride;

  if (hasData) {
      parts.push(JSON.stringify(data.data));
  } else if (hasOverride) {
      parts.push("{}");
  }

  if (hasOverride) {
      parts.push(`"${data.templateEngineOverride}"`);
  }

  return `{% ${scName} ${parts.join(", ")} %}`;
}

const imageFields = [
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
    hint: "~125 characters max; Be specific, concise, focused on the image purpose, avoid redundant phrases like 'image of…'",
  },
  {
    name: "title",
    label: "Title",
    widget: "string",
    required: false,
  },
  {
    name: "width",
    label: "Width",
    widget: "number",
    value_type: "int",
    required: false,
    hint: "In px; Leave empty for auto; Useful for image optimization when not full width.",
  },
  {
    name: "aspectRatio",
    label: "Aspect Ratio",
    widget: "number",
    value_type: "float",
    hint: "Width / Height => square = 1; 16:9 = 1.78; 4:3 = 1.33; Extra wide = 4;",
    required: false,
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
  },
  {
    name: "rawAttrs",
    label: "Other Image Attributes",
    widget: "string",
    required: false,
  },
];

export const imageShortcode = {
  id: "imageShortcode",
  label: "Image",
  icon: "image",
  summary: "{{alt}} {{src}}",
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
    {
      name: "aspectRatio",
      label: "Aspect Ratio",
      widget: "number",
      value_type: "float",
      hint: "Width / Height => square = 1; 16:9 = 1.78; 4:3 = 1.33; Extra wide = 4;",
      required: false,
    },
    {
      name: "width",
      label: "Width (px)",
      widget: "number",
      value_type: "int",
      required: false,
      hint: "Leave empty for auto; Useful for image optimization when not full width.",
    },
    {
      name: "advanced",
      label: "Advanced Attributes",
      widget: "object",
      required: false,
      collapsed: true,
      fields: [
        {
          name: "class",
          label: "Class",
          widget: "string",
          required: false
        },
        {
          name: "id",
          label: "Id",
          widget: "string",
          required: false
        },
        {
          name: "title",
          label: "Title",
          widget: "string",
          required: false,
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
        },
        {
          name: "wrapper",
          label: "Wrapper",
          widget: "string",
          required: false,
          hint: "HTML tag to wrap the image in; Leave empty for none;",
        },
        {
          name: "imgAttrs",
          label: "Other raw image attributes",
          widget: "string",
          required: false,
        },
      ]
    },
  ],
  pattern: /^{% image\s+(.*?)\s*%}$/ms,
  fromBlock: function (match) {
    // Parse the arguments from the captured string
    const argumentsString = match[1];
    // Currently in this form:
    // {% image src="path/to/image.jpg", alt="Description", width="800" %}

    const src = extractQuotedString(argumentsString, 'src') || "";
    const alt = extractQuotedString(argumentsString, 'alt') || "";
    const aspectRatio = extractQuotedString(argumentsString, 'aspectRatio') || "";
    const width = extractQuotedString(argumentsString, 'width') || "";
    const className = extractQuotedString(argumentsString, 'class') || "";
    const id = extractQuotedString(argumentsString, 'id') || "";
    const title = extractQuotedString(argumentsString, 'title') || "";
    const loading = extractQuotedString(argumentsString, 'loading') || "";
    const wrapper = extractQuotedString(argumentsString, 'wrapper') || "";
    const imgAttrs = argumentsString.replace(/(src|alt|aspectRatio|width|class|id|title|loading|wrapper)="[^"]*"(?:\s*,)?/g, '').trim();

    return {
      src,
      ...(alt && { alt }),
      ...(aspectRatio && { aspectRatio }),
      ...(width && { width }),
      advanced: {
        ...(className && { class: className }),
        ...(id && { id }),
        ...(title && { title }),
        ...(loading && { loading }),
        ...(wrapper && { wrapper }),
        ...(imgAttrs && { imgAttrs }),
      }
    };
  },
  toBlock: function (data) {
    const {
      src,
      alt,
      aspectRatio,
      width,
      advanced
    } = data;
    const {
      class: className,
      id,
      title,
      loading,
      wrapper,
      imgAttrs,
    } = advanced || {};

    const attrs = {
      src,
      ...(alt && { alt }),
      ...(aspectRatio && { aspectRatio }),
      ...(width && { width }),
      ...(className && { class: className }),
      ...(id && { id }),
      ...(title && { title }),
      ...(loading && { loading }),
      ...(wrapper && { wrapper }),
      // ...(imgAttrs && { imgAttrs }),
    }
    const attrsStr = Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(", ");

    return `{% image ${attrsStr}${imgAttrs ? ", " + imgAttrs : ""} %}`;
  },
  toPreview: function () {
    return `<img src="{{src}}" alt="{{alt}}" width="300" />`;
  },
}

export const partial = {
  id: "partial",
  label: "Partial",
  icon: "brick",
  fields: [
    {
      name: "partialSlug",
      label: "Select Partial",
      widget: "relation",
      collection: "partials",
      required: true,
      value_field: "{{slug}}",
    },
    // {
    //   name: "data",
    //   label: "Data",
    //   widget: "keyvalue",
    //   required: false,
    // },
    // {
    //   name: "data",
    //   label: "Data",
    //   widget: "code",
    //   required: false,
    //   // TODO: default-language not working
    //   default_language: "json",
    //   output_code_only: true,
    //   allow_language_selection: false,
    // },
    {
      name: "templateEngineOverride",
      label: "Markup language override",
      // widget: "select",
      widget: "hidden",
      required: false,
      // default: "njk,md",
      options: [
        { value: "", label: "Default" },
        { value: "njk,md", label: "Markdown" },
        { value: "njk", label: "Nunjucks (HTML)" },
        { value: "webc", label: "WebC" },
      ],
    },
  ],
  // Match example: {% include "book-btn.md" %} or {% partial "book-btn.md" %}
  // pattern: /^{% (?:include|partial) "(.*?)\.md" %}$/ms,
  // pattern: /^{% (?:include|partial)\s+([^>]*?)\s*%}$/ms,
  pattern: /^{% (?:include|partial) "(.*?)\.md"(.*?)\s*%}$/ms,
  fromBlock: function (match) {
    return parsePartialSyntax(match);
  },
  toBlock: function (data) {
    return stringifyPartial(data, ".md", "partial");
  },
  toPreview: function (data) {
    return `TEST`;
  },
}

export const htmlPartial = {
  id: "htmlPartial",
  label: "Partial (HTML)",
  icon: "code_blocks",
  fields: [
    {
      name: "partialSlug",
      label: "Select Partial",
      widget: "relation",
      collection: "htmlPartials",
      required: true,
      value_field: "{{slug}}",
    },
    // {
    //   name: "data",
    //   label: "Data",
    //   widget: "keyvalue",
    //   required: false,
    // },
    // {
    //   name: "data",
    //   label: "Data",
    //   widget: "code",
    //   required: false,
    //   // TODO: default-language not working
    //   default_language: "json",
    //   output_code_only: true,
    //   allow_language_selection: false,
    // },
    {
      name: "templateEngineOverride",
      label: "Markup language override",
      // widget: "select",
      widget: "hidden",
      required: false,
      // default: "njk,md",
      options: [
        { value: "", label: "Default" },
        { value: "njk,md", label: "Markdown" },
        { value: "njk", label: "Nunjucks (HTML)" },
        { value: "webc", label: "WebC" },
      ],
    },
  ],
  // Match example: {% include "book-btn.md" %} or {% partial "book-btn.md" %}
  // pattern: /^{% (?:include|partial) "(.*?)\.md" %}$/ms,
  pattern: /^{% (?:htmlPartial|partial) "(.*?)\.njk"(.*?)\s*%}$/ms,
  fromBlock: function (match) {
    return parsePartialSyntax(match);
  },
  toBlock: function (data) {
    return stringifyPartial(data, ".njk", "htmlPartial");
  },
  toPreview: function (data) {
    return `TEST`;
  },
}

export const wrapper = {
  id: "wrapper",
  label: "Wrapper",
  icon: "lunch_dining",
  fields: [
    { name: "content", label: "Content", widget: "markdown", required: false },
    {
      name: "wrapperTag",
      label: "Wrapper Tag",
      required: false,
      widget: "select",
      options: [
        { value: "div", label: "div" },
        { value: "section", label: "section" },
        { value: "article", label: "article" },
        { value: "aside", label: "aside" },
        { value: "header", label: "header" },
        { value: "footer", label: "footer" },
        { value: "main", label: "main" },
        { value: "nav", label: "nav" },
        { value: "figure", label: "figure" },
        { value: "figcaption", label: "figcaption" },
        { value: "details", label: "details" },
        { value: "summary", label: "summary" },
        { value: "dialog", label: "dialog" },
      ],
    },
    {
      name: "wrapperAttrs",
      label: "Wrapper Attributes",
      widget: "string",
      required: false,
    },
  ],
  pattern:
    /^{%\s*wrapper\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endwrapper\s*%}$/ms,
  fromBlock: function (match) {
    // console.log({ match });
    const propsRaw = match[1];
    // const inlineContent = match[2];
    const content = match[2];
    const wrapperTag = propsRaw.match(/tag="(.*?)"(,\s*)?/)?.[1];
    const wrapperAttrs = propsRaw.replace(/tag="(.*?)"(,\s*)?/g, "");

    // Convert from inline to multiline for editing
    // const multilineContent = inlineToMultiline(inlineContent);
    return {
      //content: multilineContent,
      content,
      wrapperTag,
      wrapperAttrs,
    };
  },
  toBlock: function (data) {
    const { content, wrapperTag = "div", wrapperAttrs = "" } = data;
    // Convert from multiline to inline for storage
    // const inlineContent = multilineToInline(content);

    // TODO: improve parsing here to make sure we output properly formatted attributes list
    // {% wrapper tag="div", class="any number of classes", id="any" %}
    // Probable separators: ` `, `,`, `, `
    // But we need to avoid splitting spaces in between quotes (like in `class`)
    const tagAttrs = wrapperAttrs;

    return `{% wrapper tag="${wrapperTag}"${
      tagAttrs ? `, ${tagAttrs}` : ""
    } %}
${content}
{% endwrapper %}`;
  },
  toPreview: function (data) {
    return `TEST`;
  },
}

export const section = {
  id: "section",
  label: "Section",
  icon: "brick",
  fields: [
    {
      name: "type",
      label: "Type",
      widget: "object",
      required: true,
      collapsed: true,
      hint: "Select a pre-defined section type or use one of your custom section layouts (selectable in 'Advanced' bellow)",
      types: [
        {
          name: "grid-fluid",
          label: "Fluid Grid: Fluid sized blocks wrap automatically",
          widget: "object",
          required: false,
          fields: [
            {
              name: "columns",
              label: "Columns",
              widget: "number",
              hint: "The number of columns on large screens [note: can be overwritten with a custom variable widthColumnMin defining a min column size in CSS units]",
              required: false,
            },
            {
              name: "gap",
              label: "Gap",
              widget: "string",
              hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
              required: false,
            },
            {
              name: "class",
              label: "Class Names",
              widget: "string",
              hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
              required: false,
            },
          ],
        },
        {
          name: "switcher",
          label: "Switcher: Switch from side by side to vertical display",
          widget: "object",
          required: false,
          hint: "Switch between side by side and vertical display based on section width",
          fields: [
            {
              name: "widthWrap",
              label: "Width Wrap",
              widget: "string",
              hint: "Section width to switch from side by side to vertical display. (e.g. var(--width-prose) [default], 30rem, 800px, 0px [no wrap])",
              required: false,
            },
            {
              name: "gap",
              label: "Gap",
              widget: "string",
              hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
              required: false,
            },
            {
              name: "class",
              label: "Class Names",
              widget: "string",
              hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
              required: false,
            },
          ],
        },
        {
          name: "fixed-fluid",
          label: "Fixed-Fluid: 2 columns, fixed width on one side",
          widget: "object",
          required: false,
          hint: "2 blocks side by side, fixed width on one side",
          fields: [
            {
              name: "widthFixed",
              label: "Fixed column width",
              widget: "string",
              hint: "The width of the fixed sized column (e.g. 'calc(var(--width-prose) / 2.5)' [default], 20rem, 300px, ...)",
              required: false,
            },
            {
              name: "widthFluidMin",
              label: "Fluid column min width",
              widget: "string",
              hint: "The minimum width of the fluid column (e.g. '50%' [default], 20rem, 300px, ...)",
              required: false,
            },
            {
              name: "fixedRight",
              label: "Fixed column on the right",
              widget: "boolean",
              hint: "Place the fixed column on the right instead of left (default: false)",
              required: false,
            },
            {
              name: "gap",
              label: "Gap",
              widget: "string",
              hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
              required: false,
            },
            {
              name: "class",
              label: "Class Names",
              widget: "string",
              hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
              required: false,
            },
          ],
        },
        {
          name: "cover",
          label: "Cover: Fixed height section with optional padding",
          widget: "object",
          required: false,
          fields: [
            {
              name: "minHeight",
              label: "Min Height",
              widget: "string",
              hint: "The minimum height of the cover (e.g. 100svh [default], 30rem, 800px)",
              required: false,
            },
            {
              name: "noPadding",
              label: "Remove Default Padding",
              widget: "boolean",
              required: false,
            },
            {
              name: "gap",
              label: "Gap",
              widget: "string",
              hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
              required: false,
            },
            {
              name: "class",
              label: "Class Names",
              widget: "string",
              hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
              required: false,
            },
          ],
        },
        {
          name: "custom",
          label: "Custom: Use your own Section Layout",
          widget: "object",
          required: false,
          fields: [],
        },
      ],
    },
    {
      name: "blocks",
      label: "Blocks",
      widget: "list",
      required: false,
      i18n: true,
      collapsed: true,
      allow_reorder: true,
      types: [
        {
          name: "image",
          label: "Image",
          widget: "object",
          required: false,
          summary: "{{src}}",
          fields: imageFields,
        },
        {
          name: "markdown",
          label: "Markdown",
          widget: "object",
          required: false,
          summary: "{{value | truncate(50)}}",
          fields: [
            {
              name: "value",
              widget: "markdown",
              required: false,
            },
          ],
        },
      ],
    },
    {
      name: "advanced",
      label: "Advanced",
      widget: "object",
      required: false,
      fields: [
        {
          name: "sectionSlug",
          label: "Overwrite Section Layout",
          widget: "relation",
          collection: "sectionLayouts",
          required: false,
        },
        {
          name: "vars",
          label: "Custom Variables",
          widget: "keyvalue",
          required: false,
        }
      ],
    },
  ],
  pattern: /^{% section\s+(.*?)\s*%}$/ms,
  fromBlock: function (match) {
    // Parse the arguments from the captured string
    const argumentsString = match[1];
    // Currently in this form:
    // {% section type="grid", vars={}, blocks=[], advanced={ sectionSlug="", vars={}} %}

    const typeMatch = argumentsString.match(/type="(.*?)"/);
    const varsString = extractProperty(argumentsString, 'vars') || "{}";
    const blocksString = extractProperty(argumentsString, 'blocks') || "[]";
    const advancedString = extractProperty(argumentsString, 'advanced') || "{}";

    const type = typeMatch?.[1] || "";

    const vars = JSON.parse(varsString) || {};
    const blocks = JSON.parse(blocksString) || [];
    const advanced = JSON.parse(advancedString) || {};

    return {
      type: {
        type,
        ...vars,
      },
      blocks,
      advanced
    };
  },
  toBlock: function (data) {
    const { type: typeField, blocks, advanced } = data;
    const { type, ...vars } = typeField || {};

    const varsString = JSON.stringify(vars);
    const blocksString = JSON.stringify(blocks);
    const advancedString = JSON.stringify(advanced);

    return `{% section type="${type}", vars=${varsString}, blocks=${blocksString}, advanced=${advancedString} %}`;
  },
  toPreview: function (data) {
    return `TEST`;
  },
}

export const links = {
  id: "links",
  label: "Links",
  icon: "link",
  fields: [
    {
      name: "linksData",
      label: "Links References",
      label_singular: "Link Reference",
      widget: "list",
      required: true,
      collapsed: true,
      hint: "",
      types: [
        {
          name: "external",
          label: "External link",
          widget: "object",
          required: false,
          collapsed: true,
          summary: "{{href}}",
          fields: [
            {
              name: "href",
              label: "URL",
              widget: "string",
              required: true,
            },
            {
              name: "text",
              label: "Text",
              widget: "string",
              required: false,
              hint: "Display Text. Optional: Shows the URL if not defined"
            },
            {
              name: "target",
              label: "Target",
              widget: "select",
              required: false,
              options: [
                { value: "_blank", label: "_blank" },
                { value: "_self", label: "_self" },
                { value: "_parent", label: "_parent" },
                { value: "_top", label: "_top" },
              ],
            },
            {
              name: "rel",
              label: "Rel",
              widget: "select",
              required: false,
              multiple: true,
              default: ["noopener"],
              options: [
                { value: "noopener", label: "noopener" },
                { value: "noreferrer", label: "noreferrer" },
                { value: "nofollow", label: "nofollow" },
                { value: "alternate", label: "alternate" },
              ],
            },
          ],
        },
        {
          name: "collections",
          label: "Collections",
          widget: "object",
          required: false,
          collapsed: false,
          summary: "{{collectionNames}}",
          fields: [
            {
              name: "collectionNames",
              label: "Select whole collections",
              widget: "select",
              required: true,
              multiple: true,
              options: [
                { value: "all", label: "All Collections" },
                { value: "pages", label: "Pages" },
                ...(currentCollections || []).map((collection) => ({
                  value: collection,
                  label: collection
                }))
              ],
            },
          ],
        },
        {
          name: "tags",
          label: "Tags",
          widget: "object",
          required: false,
          collapsed: false,
          summary: "{{collectionNames}}",
          fields: [
            {
              name: "collectionNames",
              label: "Select Tags",
              widget: "relation",
              collection: "dataFiles",
              file: "translatedData",
              value_field: "tagsList.*.slug",
              // display_fields: ["tagsList.*.name"],
              required: true,
              multiple: true,
            },
          ],
        },
        {
          name: "pages",
          label: "Pages",
          widget: "object",
          required: false,
          collapsed: false,
          summary: "{{slugs}}",
          fields: [
            {
              name: "slugs",
              label: "Select pages",
              widget: "relation",
              collection: "pages",
              required: true,
              multiple: true,
            },
          ],
        },
        {
          name: "articles",
          label: "Articles",
          widget: "object",
          required: false,
          collapsed: false,
          summary: "{{slugs}}",
          fields: [
            {
              name: "slugs",
              label: "Select articles",
              widget: "relation",
              collection: "articles",
              required: true,
              multiple: true,
            },
          ],
        },
        {
          name: "articles",
          label: "Articles",
          widget: "object",
          required: false,
          collapsed: false,
          summary: "{{slugs}}",
          fields: [
            {
              name: "slugs",
              label: "Select articles",
              widget: "relation",
              collection: "articles",
              required: true,
              multiple: true,
            },
          ],
        },
      ],
    },
    {
      name: "itemLayout",
      label: "Item Layout",
      widget: "object",
      required: false,
      collapsed: true,
      types: [
        {
          name: "markdown",
          label: "Markdown",
          widget: "object",
          required: false,
          summary: "{{value | truncate(50)}}",
          fields: [
            {
              name: "value",
              widget: "markdown",
              required: false,
            },
          ],
        },
        {
          name: "partial",
          label: "Partial",
          widget: "object",
          summary: "{{slug}}",
          fields: [
            {
              name: "slug",
              label: "Partial Slug",
              widget: "relation",
              collection: "partials",
              required: false,
              value_field: "{{slug}}",
            },
          ],
        },
      ],
    },
    {
      name: "wrapperLayout",
      label: "Wrapper Layout",
      widget: "object",
      required: false,
      collapsed: true,
      hint: "Warning: If using a Wrapper Layout AND an Item Layout, you will have to use your Item Layout manually in the Wrapper.",
      types: [
        {
          name: "markdown",
          label: "Markdown",
          widget: "object",
          required: false,
          summary: "{{value | truncate(50)}}",
          fields: [
            {
              name: "value",
              widget: "markdown",
              required: false,
              default: "<ul>{% for link in links %}<li>{{link.html | safe}}</li>{% endfor %}<ul>",
            },
          ],
        },
        {
          name: "partial",
          label: "Partial",
          widget: "object",
          summary: "{{slug}}",
          fields: [
            {
              name: "slug",
              label: "Partial Slug",
              widget: "relation",
              collection: "partials",
              required: false,
              value_field: "{{slug}}",
            },
          ],
        },
      ],
    },
  ],
  pattern: /^{% links\s+(.*?)\s*%}$/ms,
  // pattern: /{% links\s+(.*?)\s*%}/,
  fromBlock: function (match) {
    // Parse the arguments from the captured string
    const argumentsString = match[1];
    // Currently in this form:
    // {% links linksData=[{"type":"pages","slugs":["test","index"]}] %}

    const linksDataString = extractProperty(argumentsString, 'linksData') || "[]";
    const itemLayoutString = extractProperty(argumentsString, 'itemLayout') || "{}";
    const wrapperLayoutString = extractProperty(argumentsString, 'wrapperLayout') || "{}";
    const linksData = JSON.parse(linksDataString) || [];
    const itemLayout = JSON.parse(itemLayoutString) || {};
    const wrapperLayout = JSON.parse(wrapperLayoutString) || {};

    console.log("From Block", { wrapperLayout })

    return {
      linksData,
      itemLayout,
      wrapperLayout,
    };
  },
  toBlock: function (data) {
    const { linksData, itemLayout, wrapperLayout } = data;
    console.log("To Block", { wrapperLayout })
    const linksDataString = JSON.stringify(linksData);
    const itemLayoutString = JSON.stringify(itemLayout);
    const wrapperLayoutString = JSON.stringify(wrapperLayout);

    return [
      `{% links linksData=${linksDataString}`,
      itemLayoutString ? `, itemLayout=${itemLayoutString}` : "",
      wrapperLayoutString ? `, wrapperLayout=${wrapperLayoutString}` : "",
      ` %}`
    ].join("");
  },
  toPreview: function (data) {
    return `TEST`;
  },
}

export const icon = {
  id: "icon",
  label: "Icon",
  icon: "triangle_circle",
  fields: [
    {
      name: "icon",
      label: "Icon",
      widget: "object",
      required: true,
      collapsed: true,
      summary: "{{iconLib.type}} : {{iconLib.iconName}}  {{size}} {{class}} {{otherAttrs}}",
      hint: "Choose between [Simple Icons](https://simpleicons.org/) or [Tabler Icons](https://tabler.io/icons)",
      fields: [
        {
          name: "iconLib",
          label: "Icon Library",
          widget: "object",
          required: true,
          collapsed: false,
          // summary:
          //   "'{{name}}' ({{type}}): {{weights}} {{styles}} {{subsets}}",
          hint: "Choose between ",
          types: [
            ...iconLibs.map(libName => ({
              name: libName,
              label: libName,
              widget: "object",
              required: true,
              collapsed: "auto",
              fields: [
                {
                  name: "iconName",
                  label: "Icon Name",
                  widget: "select",
                  required: true,
                  options: iconLists[libName],
                  ...(libName === "simple" && { hint: "Select an icon from https://simpleicons.org/" }),
                  ...((libName === "tablerOutline" || libName === "tablerFilled") && { hint: "Select an icon from https://tabler.io/icons" }),
                },
              ],
            }))
          ],
        },
        { name: "size", label: "Size", widget: "string", required: false },
        { name: "class", label: "Class", widget: "string", required: false },
        { name: "otherAttrs", label: "Other raw attributes", widget: "string", required: false },
    ]},
  ],
  // Match example: {% icon "tablerOutline:layout-bottombar", width="50", height="50", class="", ...other attrs %}
  pattern: /{% icon\s+"([^"]+)"(.*?)\s*%}/,
  fromBlock: function (match) {
    const iconId = match[1] || "";
    let [iconLib = "", iconName = ""] = iconId.split(':');
    if (!iconName) {
      iconName = iconLib;
      for (const libName of iconLibs) {
        if (iconLists[libName].includes(iconName)) {
          iconLib = libName;
          break;
        }
      }
    }
    const argumentsString = match[2] || "";

    // Extract named values from the remaining string
    const size = extractQuotedString(argumentsString, 'width') || "";
    const className = extractQuotedString(argumentsString, 'class') || "";

    // Clean up otherAttrs by removing a leading comma and the attributes we've already parsed
    const otherAttrs = argumentsString
      .replace(/^\s*,\s*/, "")
      .replace(/(width|height|class)="[^"]*"(?:\s*,)?/g, '')
      .trim();

    return {
      icon: {
        iconLib: { type: iconLib, iconName: iconName },
        // iconName,
        size,
        class: className,
        otherAttrs,
      }
    };
  },
  toBlock: function (data) {
    const iconLib = data?.icon?.iconLib?.type;
    const iconName = data?.icon?.iconLib?.iconName;
    const size = data?.icon?.size;
    const className = data?.icon?.class;
    const otherAttrs = data?.icon?.otherAttrs;

    const parts = [`"${iconLib}:${iconName}"`];

    if (size) {
      parts.push(`width="${size}"`, `height="${size}"`);
    }
    if (className) {
      parts.push(`class="${className}"`);
    }
    if (otherAttrs) {
      parts.push(otherAttrs);
    }

    return `{% icon ${parts.join(", ")} %}`;
  },

  toPreview: (data) => `<span>ICON</span>`,
}

// Example for project specific component def
//
// const multilineToInline = (multi) => {
//   return multi?.replace(/\n/g, "\\n")?.replace(/"/g, '\\"');
// };
// const inlineToMultiline = (inline) => {
//   return inline?.replace(/\\n/g, "\n")?.replace(/\\"/g, '"');
// };

// export const homeHeader = {
//   id: "homeHeader",
//   label: "Home Header",
//   // icon: "lunch_dining",
//   fields: [
//     {
//       name: "preHeading",
//       label: "Pre Heading",
//       widget: "string",
//       required: true,
//     },
//     {
//       name: "heading",
//       label: "Heading",
//       widget: "string",
//       required: true,
//     },
//     {
//       name: "bottom",
//       label: "Bottom",
//       widget: "markdown",
//       required: false,
//     },
//   ],
//   pattern:
//     /^{% component "home-header\.md", { preHeading: "(?<preHeading>.*?)", heading: "(?<heading>.*?)", bottom: "(?<bottom>.*?)" } %}$/ms,
//   fromBlock: function (match) {
//     return {
//       preHeading: match?.groups?.preHeading,
//       heading: match?.groups?.heading,
//       bottom: inlineToMultiline(match?.groups?.bottom) || "",
//     };
//   },
//   toBlock: function ({ preHeading, heading, bottom }) {
//     const escapedBottom = multilineToInline(bottom) || "";
//     return `{% component "home-header.md", { preHeading: "${preHeading}", heading: "${heading}", bottom: "${escapedBottom}" } %}`;
//   },
//   toPreview: function (data) {
//     return `TEST`;
//   },
// };
