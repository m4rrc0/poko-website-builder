import {
  env,
  activeCollections,
  // activeCollectionNames,
  iconLists,
} from "./env.js";

const { CONTENT_DIR } = env;
// const iconLists = env?.iconLists || {};
const iconLibs = Object.keys(iconLists) || [];

const multilineToInline = (multi) => {
  return multi?.replace(/\n/g, "\\n")?.replace(/"/g, '\\"');
};
const inlineToMultiline = (inline) => {
  return inline?.replace(/\\n/g, "\n")?.replace(/\\"/g, '"');
};

// Apparently, in Sveltia, an object with an md field can hold keys like 'content:c111:text'
const njkAttrsStringFromObj = (obj) =>
  Object.entries(obj)
    .filter(
      ([key, value]) =>
        !!value && key !== "content" && !key.startsWith("content:"),
    )
    .map(([key, value]) => {
      if (typeof value === "string") {
        return `${key}="${value}"`;
      }
      return `${key}=` + JSON.stringify(value);
    })
    .join(", ");

const njkAttrsStringFromSectionAreaData = (areaData) => {
  const { content, attributes, ...isolatedAttrs } = areaData || {};
  const constructedAttrs = njkAttrsStringFromObj(isolatedAttrs);
  const attrs = [constructedAttrs, attributes || ""].filter(Boolean).join(", ");

  return attrs;
};

function toQuotableString(text) {
  return text
    ? text
        .replace(/\\/g, "\\\\") // escape backslashes first
        .replace(/"/g, '\\"') // escape double quotes
        .replace(/\n/g, "\\n") // escape newlines
        .replace(/\r/g, "\\r") // escape carriage returns
        .replace(/\t/g, "\\t") // escape tabs
    : undefined;
}

function fromQuotableString(text) {
  return text
    .replace(/\\t/g, "\t") // unescape tabs
    .replace(/\\r/g, "\r") // unescape carriage returns
    .replace(/\\n/g, "\n") // unescape newlines
    .replace(/\\"/g, '"') // unescape double quotes
    .replace(/\\\\/g, "\\"); // unescape backslashes last
}

// Helper function to extract property values with balanced brackets/braces
const extractProperty = (argumentsString, propName) => {
  const startIndex = argumentsString.indexOf(propName + "=");
  if (startIndex === -1) return null;

  const valueStart = startIndex + propName.length + 1;
  const firstChar = argumentsString[valueStart];

  // Determine opening and closing delimiters
  let openChar, closeChar;
  if (firstChar === "[") {
    openChar = "[";
    closeChar = "]";
  } else if (firstChar === "{") {
    openChar = "{";
    closeChar = "}";
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
    if (char === "\\") {
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

const extractJsonProperty = (str, propName) => {
  const value = extractProperty(str, propName);
  return value ? JSON.parse(value) : null;
};

// Helper function to extract quoted string values
const extractQuotedString = (argumentsString, propName) => {
  const startIndex = argumentsString.indexOf(propName + "=");
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
    if (char === "\\") {
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

// Helper function to extract simple values (quoted strings, numbers, booleans, unquoted strings)
// Does NOT match complex values like objects {} or arrays []
const extractSimpleValue = (argumentsString, propName) => {
  const startIndex = argumentsString.indexOf(propName + "=");
  if (startIndex === -1) return null;

  const valueStart = startIndex + propName.length + 1;
  const firstChar = argumentsString[valueStart];

  // Skip if it's a complex value (object or array)
  if (firstChar === "{" || firstChar === "[") return null;

  // Handle quoted strings (double quotes)
  if (firstChar === '"') {
    let escape = false;
    for (let i = valueStart + 1; i < argumentsString.length; i++) {
      const char = argumentsString[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"') {
        return argumentsString.substring(valueStart + 1, i);
      }
    }
    return null;
  }

  // Handle quoted strings (single quotes)
  if (firstChar === "'") {
    let escape = false;
    for (let i = valueStart + 1; i < argumentsString.length; i++) {
      const char = argumentsString[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === "'") {
        return argumentsString.substring(valueStart + 1, i);
      }
    }
    return null;
  }

  // Handle unquoted values (numbers, booleans, simple strings)
  // Extract until we hit a delimiter (comma, space, or end of string)
  let valueEnd = valueStart;
  while (
    valueEnd < argumentsString.length &&
    argumentsString[valueEnd] !== "," &&
    argumentsString[valueEnd] !== " " &&
    argumentsString[valueEnd] !== "\n" &&
    argumentsString[valueEnd] !== "\r" &&
    argumentsString[valueEnd] !== "\t"
  ) {
    valueEnd++;
  }

  const rawValue = argumentsString.substring(valueStart, valueEnd).trim();
  if (!rawValue) return null;

  return rawValue;
};

// ⚠️ Use this one !!!
/**
 * Extracts specified attributes from a string (quoted or unquoted)
 * Works with both Nunjucks (comma-separated) and HTML (space-separated) attributes
 * @param {string} attributesString - The string containing attributes
 * @param {string[]} propNames - Array of attribute names to extract
 * @returns {{ extracted: Object<string, string|boolean|number|null>, remaining: string }}
 */
const extractAttributes = (attributesString, propNames) => {
  const extracted = {};
  let remaining = attributesString;

  for (const propName of propNames) {
    // Pattern handles:
    // - Double quoted: attr="value" (with escape support)
    // - Single quoted: attr='value' (with escape support)
    // - Unquoted: attr=value (ends at comma, space, or end)
    const pattern = new RegExp(
      `(^|[,\\s])\\s*(${propName}\\s*=\\s*(?:` +
        `"(?:[^"\\\\]|\\\\.)*"|` + // double quoted
        `'(?:[^'\\\\]|\\\\.)*'|` + // single quoted
        `[^,\\s"']+` + // unquoted (no spaces, commas, or quotes)
        `))\\s*([,\\s]|$)`,
    );

    const match = remaining?.match(pattern);
    if (match) {
      // Extract value - handle all three formats
      const attrPart = match[2];
      const eqIndex = attrPart.indexOf("=");
      let value = attrPart.slice(eqIndex + 1).trim();

      // Remove surrounding quotes and unescape if quoted
      const isQuoted =
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"));

      if (isQuoted) {
        const quote = value[0];
        value = value
          .slice(1, -1)
          .replace(new RegExp(`\\\\${quote}`, "g"), quote);
      } else {
        // Coerce unquoted values to native types
        if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "null") value = null;
        else if (value === "undefined") value = undefined;
        else if (!isNaN(value) && value !== "") value = Number(value);
      }
      extracted[propName] = value;

      // Remove the attribute, preserving one separator if between other attrs
      const leadingSep = match[1];
      const trailingSep = match[3];
      let replacement = "";
      if (
        leadingSep &&
        trailingSep &&
        !/^$/.test(leadingSep) &&
        !/^$/.test(trailingSep)
      ) {
        replacement = leadingSep === "," || trailingSep === "," ? ", " : " ";
      }
      remaining = remaining.replace(match[0], replacement);
    } else {
      // Ignoring absent attributes should be fine
      // extracted[propName] = null;
    }
  }

  // Clean up separators and whitespace
  remaining = remaining
    ?.replace(/^[,\s]+|[,\s]+$/g, "")
    .replace(/\s*,\s*,\s*/g, ", ")
    .trim();

  return { extracted, remaining };
};

/**
 * Extracts attributes and content from a paired Nunjucks tag
 * @param {string} contentString - The string to search in
 * @param {string} tagName - The tag name (e.g., 'sectionHeader', 'gridItem')
 * @returns {{ attributes: string|null, content: string } | null}
 */
const extractWithNunjucksTag = (contentString, tagName) => {
  if (!contentString) return null;

  // Matches: {% tagName [attributes] %} content {% endtagName %}
  const regex = new RegExp(
    `{%\\s*${tagName}(?:\\s+([^%]*?))?\\s*%}\\s*([\\s\\S]*?)\\s*{%\\s*end${tagName}\\s*%}`,
    "ms",
  );

  const match = contentString.match(regex);
  if (!match) return null;

  return {
    attributes: match[1]?.trim() || null, // null if no attributes
    content: match[2].trim(),
  };
};

// Variant for extracting ALL occurrences
const extractAllWithNunjucksTag = (contentString, tagName) => {
  if (!contentString) return [];

  const regex = new RegExp(
    `{%\\s*${tagName}(?:\\s+([^%]*?))?\\s*%}\\s*([\\s\\S]*?)\\s*{%\\s*end${tagName}\\s*%}`,
    "gms",
  );

  const results = [];
  let match;
  while ((match = regex.exec(contentString)) !== null) {
    results.push({
      attributes: match[1]?.trim() || null,
      content: match[2].trim(),
    });
  }
  return results;
};

const extractSectionAreaData = (contentString, tagName) => {
  const { attributes, content } =
    extractWithNunjucksTag(contentString || "", tagName) || {};
  const { extracted, remaining } = extractAttributes(attributes || "", [
    "class",
  ]);
  const className = extracted?.class || null;
  return { class: className, attributes: remaining, content };
};

const extractAllSectionAreaData = (contentString, tagName) => {
  let items = extractAllWithNunjucksTag(contentString || "", tagName);
  items = items.map(({ attributes, content }) => {
    const { extracted, remaining } = extractAttributes(attributes || "", [
      "class",
    ]);
    const className = extracted?.class || null;
    return { class: className, attributes: remaining, content };
  });

  return items;
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
  const objectMatch = trimmedArgsString.match(
    /^(\{[\s\S]*?\})(?:\s*,\s*["']([^"']+)["'])?$/,
  );

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
};

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
};

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

// Section fields
const sectionHeaderField = {
  name: "header",
  label: "Section Header",
  widget: "object",
  required: false,
  summary: "{{content | truncate(50)}}",
  // collapsed: true,
  fields: [
    {
      name: "content",
      label: "Header Content",
      widget: "markdown",
      required: false,
    },
    {
      name: "class",
      label: "Header Classes",
      widget: "string",
      required: false,
    },
    {
      name: "attributes",
      label: "Header Raw Attributes",
      widget: "hidden",
      required: false,
    },
  ],
};
const sectionFooterField = {
  name: "footer",
  label: "Section Footer",
  widget: "object",
  required: false,
  summary: "{{content | truncate(50)}}",
  // collapsed: true,
  fields: [
    {
      name: "content",
      label: "Footer Content",
      widget: "markdown",
      required: false,
    },
    {
      name: "class",
      label: "Footer Classes",
      widget: "string",
      required: false,
    },
    {
      name: "attributes",
      label: "Footer Raw Attributes",
      widget: "hidden",
      required: false,
    },
  ],
};

// Layout options
const layoutTypeGridFluid = {
  name: "grid-fluid",
  // label: "Fluid Grid: Fluid sized blocks wrap automatically",
  label: "Fluid Grid",
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
};
const layoutTypeSwitcher = {
  name: "switcher",
  // label: "Switcher: Switch from side by side to vertical display",
  label: "Switcher",
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
};
const layoutTypeFixedFluid = {
  name: "fixedFluid",
  label: "Asymmetrical Columns",
  collapsed: true,
  fields: [
    {
      name: "fixedSide",
      label: "Small Column Side",
      widget: "select",
      hint: "The position of the small column.",
      required: true,
      default: "fixedLeft",
      options: [
        { value: "fixedLeft", label: "Left" },
        { value: "fixedRight", label: "Right" },
      ],
    },
    {
      name: "widthFixed",
      label: "Small Column Width",
      widget: "string",
      hint: "The width of the small column. (e.g. 20rem, 800px, 0px [no wrap])",
      required: false,
    },
    {
      name: "widthFluidMin",
      label: "Wide Column Min Width",
      widget: "string",
      hint: "The minimum width of the wide column. (e.g. 50% [default], 30rem, 800px, 0px [no wrap])",
      required: false,
    },
    {
      name: "gap",
      label: "Gap",
      widget: "string",
      hint: "The gap between columns (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
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
};
const layoutTypeCluster = {
  name: "cluster",
  label: "Cluster",
  collapsed: true,
  fields: [
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
  ]
}

export const link = {
  id: "link",
  label: "Link",
  icon: "link",
  dialog: true,
  summary:
    "🔗 {{content | truncate(20)}}{{content | ternary(': ', '')}}{{linkType.url | truncate(30)}}",
  fields: [
    {
      name: "linkType",
      label: "Link Type",
      widget: "object",
      required: true,
      types: [
        {
          name: "pages",
          label: "Page",
          fields: [
            {
              name: "url",
              label: "Select Page",
              widget: "relation",
              collection: "pages",
              required: true,
            },
            {
              name: "anchor",
              label: "Anchor",
              widget: "string",
              // type: "url", // NOTE: might be useful but not working currently
              required: false,
              hint: "Optional anchor. Link to any title by copy-pasting it here",
            },
          ],
        },
        ...activeCollections.map((collection) => ({
          name: collection.name,
          label:
            collection.label_singular || collection.label || collection.name,
          fields: [
            {
              name: "url",
              label:
                "Select " + collection.label_singular ||
                collection.label ||
                collection.name,
              widget: "relation",
              collection: collection.name,
              required: true,
            },
            {
              name: "anchor",
              label: "Anchor",
              widget: "string",
              // type: "url", // NOTE: might be useful but not working currently
              required: false,
              hint: "Optional anchor. Link to any title by copy-pasting it here",
            },
          ],
        })),
        {
          name: "external",
          label: "External Link",
          fields: [
            {
              name: "url",
              label: "URL",
              widget: "string",
              required: true,
              default: "https://",
            },
          ],
        },
        {
          name: "email",
          label: "Email",
          fields: [
            {
              name: "url",
              label: "Email address",
              widget: "string",
              required: true,
            },
            {
              name: "advanced",
              label: "Advanced options",
              widget: "object",
              required: false,
              fields: [
                {
                  name: "cc",
                  label: "CC",
                  widget: "string",
                  required: false,
                },
                {
                  name: "bcc",
                  label: "BCC",
                  widget: "string",
                  required: false,
                },
                {
                  name: "subject",
                  label: "Email subject",
                  widget: "string",
                  required: false,
                },
                {
                  name: "body",
                  label: "Body",
                  widget: "text",
                  required: false,
                },
              ],
            },
          ],
        },
        {
          name: "file",
          label: "File",
          fields: [
            {
              name: "url",
              label: "Select File",
              widget: "file",
              required: true,
              // TODO: ⚠️ Overriding media_folder and public_folder does not work!
              media_folder: `/${CONTENT_DIR}/_files`,
              public_folder: "/_files",
            },
          ],
        },
      ],
    },
    {
      name: "text",
      label: "Text",
      widget: "hidden",
      required: false,
      hint: "Optional text to display for the link",
    },
    {
      name: "content",
      label: "Content",
      widget: "markdown",
      minimal: true,
      buttons: ["bold", "italic", "strikethrough", "code"],
      editor_components: ["icon", "imageShortcode"],
      required: false,
      hint: "Optional content to display for the link. Defaults to internal page name or link URL",
    },
    {
      name: "otherAttrs",
      label: "Other raw attributes",
      widget: "hidden",
      required: false,
    },
  ],
  // pattern: /{% link\s+(.*?)\s*%}/,
  pattern: /{%\s*link\s*([^>]*?)\s*%}(.*?){% endlink %}/,
  fromBlock: function (match) {
    const argumentsString = match[1] || "";
    const text = extractQuotedString(argumentsString, "text") || "";
    const content = match[2] || text;
    const url = extractQuotedString(argumentsString, "url") || "";
    const anchor = extractQuotedString(argumentsString, "anchor") || "";
    const linkType = extractQuotedString(argumentsString, "linkType") || "";
    let type = extractQuotedString(argumentsString, "type") || linkType || "";
    let collection = extractQuotedString(argumentsString, "collection") || "";
    const cc = extractQuotedString(argumentsString, "cc") || "";
    const bcc = extractQuotedString(argumentsString, "bcc") || "";
    const subject = extractQuotedString(argumentsString, "subject") || "";
    let body = extractQuotedString(argumentsString, "body") || "";
    body = fromQuotableString(body);

    // Clean up otherAttrs by removing a leading comma and the attributes we've already parsed
    const otherAttrs = argumentsString
      .replace(/^\s*,\s*/, "")
      .replace(
        /(text|content|url|linkType|type|collection|cc|bcc|subject|body|anchor)="[^"]*"(?:\s*,)?/g,
        "",
      )
      .trim();

    function isFileUrl(urlString) {
      try {
        // Use a dummy base for relative URLs
        const url = new URL(urlString, "http://x");
        const pathname = url.pathname;

        if (pathname.endsWith("/")) return false;

        return /\.\w{2,5}$/i.test(pathname);
      } catch {
        return false;
      }
    }

    if (!type) {
      // Atribute a type if it is not provided
      if (url.startsWith("http") || url.startsWith("www.")) {
        type = "external";
      } else if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(url)) {
        type = "email";
      } else if (isFileUrl(url)) {
        type = "file";
      } else {
        type = "external";
      }
    }

    if (type == "internal") {
      collection = collection || "pages";
    }

    let advanced;

    if (cc || bcc || subject || body) {
      advanced = {
        cc,
        bcc,
        subject,
        body,
      };
    }

    return {
      linkType: {
        type: type === "internal" ? collection : type,
        url,
        anchor,
        ...(type === "email" && advanced ? { advanced } : {}),
      },
      // text: text || "",
      content: content || "",
      otherAttrs,
    };
  },

  toBlock: function (data) {
    const content = data?.content || data?.text || "";
    let type = data?.linkType?.type;
    const url = data?.linkType?.url;
    const anchor = data?.linkType?.anchor;
    const advanced = data?.linkType?.advanced || {};
    const { cc, bcc, subject, body } = advanced;
    const otherAttrs = data?.otherAttrs;
    const otherAttrsString = otherAttrs?.trim() ? `, ${otherAttrs}` : "";

    let attrsStr = "";

    if (type === "external" || type === "file") {
      attrsStr = njkAttrsStringFromObj({ url, type });
    } else if (type === "email") {
      attrsStr = njkAttrsStringFromObj({
        url,
        type,
        cc,
        bcc,
        subject,
        body: toQuotableString(body),
      });
    } else {
      attrsStr = njkAttrsStringFromObj({
        url,
        anchor,
        type: "internal",
        collection: type,
      });
    }

    return `{% link ${attrsStr}${otherAttrsString} %}${content || ""}{% endlink %}`;
  },

  toPreview: (data) => {
    const content = data?.content || data?.text || "";
    let type = data?.linkType?.type;
    const url = data?.linkType?.url;
    const isInternal =
      type !== "external" && type !== "email" && type !== "file";
    // For internal link, lead to the relevant page in the CMS
    const href = isInternal
      ? `/admin/#/collections/pages/entries/${type}/${url}`
      : url;

    return `<a href="${href}">${content || url}${isInternal ? ` <sup>🢱${url}</sup>` : ""}</a>`;
  },
};

export const icon = {
  id: "icon",
  label: "Icon",
  icon: "triangle_circle",
  dialog: true,
  summary: "🔅 {{icon.iconLib.iconName}}",
  fields: [
    {
      name: "icon",
      label: "Icon",
      widget: "object",
      required: true,
      collapsed: true,
      summary:
        "{{iconLib.type}} : {{iconLib.iconName}}  {{size}} {{class}} {{otherAttrs}}",
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
            ...iconLibs.map((libName) => ({
              name: libName,
              label: libName,
              widget: "object",
              required: true,
              collapsed: true,
              fields: [
                {
                  name: "iconName",
                  label: "Icon Name",
                  widget: "select",
                  required: true,
                  options: iconLists[libName],
                  ...(libName === "simple" && {
                    hint: "Select an icon from https://simpleicons.org/",
                  }),
                  ...((libName === "tablerOutline" ||
                    libName === "tablerFilled") && {
                    hint: "Select an icon from https://tabler.io/icons",
                  }),
                },
              ],
            })),
          ],
        },
        { name: "size", label: "Size", widget: "string", required: false },
        { name: "class", label: "Class", widget: "string", required: false },
        {
          name: "otherAttrs",
          label: "Other raw attributes",
          widget: "string",
          required: false,
        },
      ],
    },
  ],
  // Match example: {% icon "tablerOutline:layout-bottombar", width="50", height="50", class="", ...other attrs %}
  pattern: /{% icon\s+"([^"]+)"(.*?)\s*%}/,
  fromBlock: function (match) {
    const iconId = match[1] || "";
    let [iconLib = "", iconName = ""] = iconId.split(":");
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
    const size = extractQuotedString(argumentsString, "width") || "";
    const className = extractQuotedString(argumentsString, "class") || "";

    // Clean up otherAttrs by removing a leading comma and the attributes we've already parsed
    const otherAttrs = argumentsString
      .replace(/^\s*,\s*/, "")
      .replace(/(width|height|class)="[^"]*"(?:\s*,)?/g, "")
      .trim();

    return {
      icon: {
        iconLib: { type: iconLib, iconName: iconName },
        // iconName,
        size,
        class: className,
        otherAttrs,
      },
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
};

export const imageShortcode = {
  id: "imageShortcode",
  label: "Image",
  icon: "image",
  // dialog: true,
  // summary:
  //   "🖼️ {{attributes.alt | truncate(20)}}{{attributes.alt | ternary(': ', '')}}{{src | truncate(30)}}",
  fields: [
    {
      name: "src",
      label: "Image",
      widget: "image",
      required: true,
    },
    {
      name: "attributes",
      label: "Attributes",
      widget: "object",
      required: true,
      collapsed: true,
      summary: "{{alt}}",
      fields: [
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
              required: false,
            },
            {
              name: "id",
              label: "Id",
              widget: "string",
              required: false,
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
          ],
        },
      ],
    },
  ],
  pattern: /{% image\s+(.*?)\s*%}/,
  fromBlock: function (match) {
    // Parse the arguments from the captured string
    const argumentsString = match[1];
    // Currently in this form:
    // {% image src="path/to/image.jpg", alt="Description", width="800" %}
    const { extracted, remaining: imgAttrs } = extractAttributes(
      argumentsString,
      [
        "src",
        "alt",
        "aspectRatio",
        "width",
        "class",
        "id",
        "title",
        "loading",
        "wrapper",
      ],
    );
    const {
      src,
      alt,
      aspectRatio,
      width,
      class: className,
      id,
      title,
      loading,
      wrapper,
    } = extracted;

    return {
      src,
      attributes: {
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
        },
      },
    };
  },
  toBlock: function (data) {
    const { src, attributes } = data;
    const { alt, aspectRatio, width, advanced } = attributes || {};
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
    };
    const attrsStr = njkAttrsStringFromObj(attrs);

    return `{% image ${attrsStr}${imgAttrs ? ", " + imgAttrs : ""} %}`;
  },
  toPreview: function () {
    return `<img src="{{src}}" alt="{{alt}}" width="300" />`;
  },
};

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
};

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
};

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
        { value: "div", label: "Simple box (div)" },
        { value: "section", label: "Section (section)" },
        { value: "hgroup", label: "Heading Group (hgroup)" },
        { value: "article", label: "article" },
        { value: "figure", label: "figure" },
        { value: "figcaption", label: "figcaption" },
        { value: "details", label: "details" },
        { value: "summary", label: "summary" },
        { value: "dialog", label: "dialog" },
        { value: "aside", label: "aside" },
        { value: "header", label: "header" },
        { value: "footer", label: "footer" },
        { value: "nav", label: "nav" },
        { value: "main", label: "main" },
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

    return `{% wrapper tag="${wrapperTag}"${tagAttrs ? `, ${tagAttrs}` : ""} %}
${content}
{% endwrapper %}`;
  },
  toPreview: function (data) {
    return `TEST`;
  },
};

// export const section = {
//   id: "section",
//   label: "Section",
//   icon: "brick",
//   fields: [
//     {
//       name: "type",
//       label: "Type",
//       widget: "object",
//       required: true,
//       collapsed: true,
//       hint: "Select a pre-defined section type or use one of your custom section layouts (selectable in 'Advanced' bellow)",
//       types: [
//         {
//           name: "grid-fluid",
//           label: "Fluid Grid: Fluid sized blocks wrap automatically",
//           widget: "object",
//           required: false,
//           fields: [
//             {
//               name: "columns",
//               label: "Columns",
//               widget: "number",
//               hint: "The number of columns on large screens [note: can be overwritten with a custom variable widthColumnMin defining a min column size in CSS units]",
//               required: false,
//             },
//             {
//               name: "gap",
//               label: "Gap",
//               widget: "string",
//               hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
//               required: false,
//             },
//             {
//               name: "class",
//               label: "Class Names",
//               widget: "string",
//               hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
//               required: false,
//             },
//           ],
//         },
//         {
//           name: "switcher",
//           label: "Switcher: Switch from side by side to vertical display",
//           widget: "object",
//           required: false,
//           hint: "Switch between side by side and vertical display based on section width",
//           fields: [
//             {
//               name: "widthWrap",
//               label: "Width Wrap",
//               widget: "string",
//               hint: "Section width to switch from side by side to vertical display. (e.g. var(--width-prose) [default], 30rem, 800px, 0px [no wrap])",
//               required: false,
//             },
//             {
//               name: "gap",
//               label: "Gap",
//               widget: "string",
//               hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
//               required: false,
//             },
//             {
//               name: "class",
//               label: "Class Names",
//               widget: "string",
//               hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
//               required: false,
//             },
//           ],
//         },
//         {
//           name: "fixed-fluid",
//           label: "Fixed-Fluid: 2 columns, fixed width on one side",
//           widget: "object",
//           required: false,
//           hint: "2 blocks side by side, fixed width on one side",
//           fields: [
//             {
//               name: "widthFixed",
//               label: "Fixed column width",
//               widget: "string",
//               hint: "The width of the fixed sized column (e.g. 'calc(var(--width-prose) / 2.5)' [default], 20rem, 300px, ...)",
//               required: false,
//             },
//             {
//               name: "widthFluidMin",
//               label: "Fluid column min width",
//               widget: "string",
//               hint: "The minimum width of the fluid column (e.g. '50%' [default], 20rem, 300px, ...)",
//               required: false,
//             },
//             {
//               name: "fixedRight",
//               label: "Fixed column on the right",
//               widget: "boolean",
//               hint: "Place the fixed column on the right instead of left (default: false)",
//               required: false,
//             },
//             {
//               name: "gap",
//               label: "Gap",
//               widget: "string",
//               hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
//               required: false,
//             },
//             {
//               name: "class",
//               label: "Class Names",
//               widget: "string",
//               hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
//               required: false,
//             },
//           ],
//         },
//         {
//           name: "cover",
//           label: "Cover: Fixed height section with optional padding",
//           widget: "object",
//           required: false,
//           fields: [
//             {
//               name: "minHeight",
//               label: "Min Height",
//               widget: "string",
//               hint: "The minimum height of the cover (e.g. 100svh [default], 30rem, 800px)",
//               required: false,
//             },
//             {
//               name: "noPadding",
//               label: "Remove Default Padding",
//               widget: "boolean",
//               required: false,
//             },
//             {
//               name: "gap",
//               label: "Gap",
//               widget: "string",
//               hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
//               required: false,
//             },
//             {
//               name: "class",
//               label: "Class Names",
//               widget: "string",
//               hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
//               required: false,
//             },
//           ],
//         },
//         {
//           name: "custom",
//           label: "Custom: Use your own Section Layout",
//           widget: "object",
//           required: false,
//           fields: [],
//         },
//       ],
//     },
//     {
//       name: "blocks",
//       label: "Blocks",
//       widget: "list",
//       required: false,
//       i18n: true,
//       collapsed: true,
//       allow_reorder: true,
//       types: [
//         {
//           name: "image",
//           label: "Image",
//           widget: "object",
//           required: false,
//           summary: "{{src}}",
//           fields: imageFields,
//         },
//         {
//           name: "markdown",
//           label: "Markdown",
//           widget: "object",
//           required: false,
//           summary: "{{value | truncate(50)}}",
//           fields: [
//             {
//               name: "value",
//               widget: "markdown",
//               required: false,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       name: "advanced",
//       label: "Advanced",
//       widget: "object",
//       required: false,
//       fields: [
//         {
//           name: "sectionSlug",
//           label: "Overwrite Section Layout",
//           widget: "relation",
//           collection: "sectionLayouts",
//           required: false,
//         },
//         {
//           name: "vars",
//           label: "Custom Variables",
//           widget: "keyvalue",
//           required: false,
//         },
//       ],
//     },
//   ],
//   pattern: /^{% section\s+(.*?)\s*%}$/ms,
//   fromBlock: function (match) {
//     // Parse the arguments from the captured string
//     const argumentsString = match[1];
//     // Currently in this form:
//     // {% section type="grid", vars={}, blocks=[], advanced={ sectionSlug="", vars={}} %}

//     const typeMatch = argumentsString.match(/type="(.*?)"/);
//     const varsString = extractProperty(argumentsString, "vars") || "{}";
//     const blocksString = extractProperty(argumentsString, "blocks") || "[]";
//     const advancedString = extractProperty(argumentsString, "advanced") || "{}";

//     const type = typeMatch?.[1] || "";

//     const vars = JSON.parse(varsString) || {};
//     const blocks = JSON.parse(blocksString) || [];
//     const advanced = JSON.parse(advancedString) || {};

//     return {
//       type: {
//         type,
//         ...vars,
//       },
//       blocks,
//       advanced,
//     };
//   },
//   toBlock: function (data) {
//     const { type: typeField, blocks, advanced } = data;
//     const { type, ...vars } = typeField || {};

//     const varsString = JSON.stringify(vars);
//     const blocksString = JSON.stringify(blocks);
//     const advancedString = JSON.stringify(advanced);

//     return `{% section type="${type}", vars=${varsString}, blocks=${blocksString}, advanced=${advancedString} %}`;
//   },
//   toPreview: function (data) {
//     return `TEST`;
//   },
// };

// export const links = {
//   id: "links",
//   label: "Links",
//   icon: "link",
//   fields: [
//     {
//       name: "linksData",
//       label: "Links References",
//       label_singular: "Link Reference",
//       widget: "list",
//       required: true,
//       collapsed: true,
//       hint: "",
//       types: [
//         {
//           name: "external",
//           label: "External link",
//           widget: "object",
//           required: false,
//           collapsed: true,
//           summary: "{{href}}",
//           fields: [
//             {
//               name: "href",
//               label: "URL",
//               widget: "string",
//               required: true,
//             },
//             {
//               name: "text",
//               label: "Text",
//               widget: "string",
//               required: false,
//               hint: "Display Text. Optional: Shows the URL if not defined",
//             },
//             {
//               name: "target",
//               label: "Target",
//               widget: "select",
//               required: false,
//               options: [
//                 { value: "_blank", label: "_blank" },
//                 { value: "_self", label: "_self" },
//                 { value: "_parent", label: "_parent" },
//                 { value: "_top", label: "_top" },
//               ],
//             },
//             {
//               name: "rel",
//               label: "Rel",
//               widget: "select",
//               required: false,
//               multiple: true,
//               default: ["noopener"],
//               options: [
//                 { value: "noopener", label: "noopener" },
//                 { value: "noreferrer", label: "noreferrer" },
//                 { value: "nofollow", label: "nofollow" },
//                 { value: "alternate", label: "alternate" },
//               ],
//             },
//           ],
//         },
//         {
//           name: "collections",
//           label: "Collections",
//           widget: "object",
//           required: false,
//           collapsed: false,
//           summary: "{{collectionNames}}",
//           fields: [
//             {
//               name: "collectionNames",
//               label: "Select whole collections",
//               widget: "select",
//               required: true,
//               multiple: true,
//               options: [
//                 { value: "all", label: "All Collections" },
//                 { value: "pages", label: "Pages" },
//                 ...(activeCollections || []).map((collection) => ({
//                   value: collection.name,
//                   label: collection.label || collection.name,
//                 })),
//               ],
//             },
//           ],
//         },
//         {
//           name: "tags",
//           label: "Tags",
//           widget: "object",
//           required: false,
//           collapsed: false,
//           summary: "{{collectionNames}}",
//           fields: [
//             {
//               name: "collectionNames",
//               label: "Select Tags",
//               widget: "relation",
//               collection: "dataFiles",
//               file: "translatedData",
//               value_field: "tagsList.*.slug",
//               // display_fields: ["tagsList.*.name"],
//               required: true,
//               multiple: true,
//             },
//           ],
//         },
//         {
//           name: "pages",
//           label: "Pages",
//           widget: "object",
//           required: false,
//           collapsed: false,
//           summary: "{{slugs}}",
//           fields: [
//             {
//               name: "slugs",
//               label: "Select pages",
//               widget: "relation",
//               collection: "pages",
//               required: true,
//               multiple: true,
//             },
//           ],
//         },
//         {
//           name: "articles",
//           label: "Articles",
//           widget: "object",
//           required: false,
//           collapsed: false,
//           summary: "{{slugs}}",
//           fields: [
//             {
//               name: "slugs",
//               label: "Select articles",
//               widget: "relation",
//               collection: "articles",
//               required: true,
//               multiple: true,
//             },
//           ],
//         },
//         {
//           name: "articles",
//           label: "Articles",
//           widget: "object",
//           required: false,
//           collapsed: false,
//           summary: "{{slugs}}",
//           fields: [
//             {
//               name: "slugs",
//               label: "Select articles",
//               widget: "relation",
//               collection: "articles",
//               required: true,
//               multiple: true,
//             },
//           ],
//         },
//       ],
//     },
//     {
//       name: "itemLayout",
//       label: "Item Layout",
//       widget: "object",
//       required: false,
//       collapsed: true,
//       types: [
//         {
//           name: "markdown",
//           label: "Markdown",
//           widget: "object",
//           required: false,
//           summary: "{{value | truncate(50)}}",
//           fields: [
//             {
//               name: "value",
//               widget: "markdown",
//               required: false,
//             },
//           ],
//         },
//         {
//           name: "partial",
//           label: "Partial",
//           widget: "object",
//           summary: "{{slug}}",
//           fields: [
//             {
//               name: "slug",
//               label: "Partial Slug",
//               widget: "relation",
//               collection: "partials",
//               required: false,
//               value_field: "{{slug}}",
//             },
//           ],
//         },
//       ],
//     },
//     {
//       name: "wrapperLayout",
//       label: "Wrapper Layout",
//       widget: "object",
//       required: false,
//       collapsed: true,
//       hint: "Warning: If using a Wrapper Layout AND an Item Layout, you will have to use your Item Layout manually in the Wrapper.",
//       types: [
//         {
//           name: "markdown",
//           label: "Markdown",
//           widget: "object",
//           required: false,
//           summary: "{{value | truncate(50)}}",
//           fields: [
//             {
//               name: "value",
//               widget: "markdown",
//               required: false,
//               default:
//                 "<ul>{% for link in links %}<li>{{link.html | safe}}</li>{% endfor %}<ul>",
//             },
//           ],
//         },
//         {
//           name: "partial",
//           label: "Partial",
//           widget: "object",
//           summary: "{{slug}}",
//           fields: [
//             {
//               name: "slug",
//               label: "Partial Slug",
//               widget: "relation",
//               collection: "partials",
//               required: false,
//               value_field: "{{slug}}",
//             },
//           ],
//         },
//       ],
//     },
//   ],
//   pattern: /^{% links\s+(.*?)\s*%}$/ms,
//   // pattern: /{% links\s+(.*?)\s*%}/,
//   fromBlock: function (match) {
//     // Parse the arguments from the captured string
//     const argumentsString = match[1];
//     // Currently in this form:
//     // {% links linksData=[{"type":"pages","slugs":["test","index"]}] %}

//     const linksDataString =
//       extractProperty(argumentsString, "linksData") || "[]";
//     const itemLayoutString =
//       extractProperty(argumentsString, "itemLayout") || "{}";
//     const wrapperLayoutString =
//       extractProperty(argumentsString, "wrapperLayout") || "{}";
//     const linksData = JSON.parse(linksDataString) || [];
//     const itemLayout = JSON.parse(itemLayoutString) || {};
//     const wrapperLayout = JSON.parse(wrapperLayoutString) || {};

//     console.log("From Block", { wrapperLayout });

//     return {
//       linksData,
//       itemLayout,
//       wrapperLayout,
//     };
//   },
//   toBlock: function (data) {
//     const { linksData, itemLayout, wrapperLayout } = data;
//     console.log("To Block", { wrapperLayout });
//     const linksDataString = JSON.stringify(linksData);
//     const itemLayoutString = JSON.stringify(itemLayout);
//     const wrapperLayoutString = JSON.stringify(wrapperLayout);

//     return [
//       `{% links linksData=${linksDataString}`,
//       itemLayoutString ? `, itemLayout=${itemLayoutString}` : "",
//       wrapperLayoutString ? `, wrapperLayout=${wrapperLayoutString}` : "",
//       ` %}`,
//     ].join("");
//   },
//   toPreview: function (data) {
//     return `TEST`;
//   },
// };

export const sectionGrid = {
  id: "sectionGrid",
  label: "Section > Grid",
  icon: "grid_view",
  fields: [
    sectionHeaderField,
    {
      name: "items",
      label: "Grid Items",
      widget: "list",
      required: true,
      default: [{ item: "" }, { item: "" }, { item: "" }],
      summary: "{{item | truncate(50)}}",
      // collapsed: true,
      fields: [
        {
          name: "content",
          label: "Grid Item Content",
          widget: "markdown",
          required: false,
        },
        {
          name: "class",
          label: "Grid Item Classes",
          widget: "string",
          required: false,
        },
        {
          name: "attributes",
          label: "Grid Item Raw Attributes",
          widget: "hidden",
          required: false,
        },
      ],
    },
    sectionFooterField,
    {
      name: "layoutOptions",
      label: "Layout Options",
      hint: "Manually select a layout and related options",
      comment:
        "Elements in a 'Fluid Grid' will wrap automatically one by one when there is not enough space while the 'Switcher' layout switches between horizontal and vertical layout at once at a specified width.",
      widget: "object",
      required: false,
      collapsed: true,
      types: [layoutTypeSwitcher, layoutTypeGridFluid, layoutTypeCluster],
    },
    {
      name: "attributes",
      label: "Section Raw Attributes",
      widget: "string",
      required: false,
    },
    // {
    //   name: "itemsAttributes",
    //   label: "Items Raw Attributes",
    //   widget: "string",
    //   required: false,
    // },
  ],
  // Suggested mod by Claude because...
  // The ^ and $ anchors combined with the m (multiline) flag cause problems when there are multiple sectionGrid components - the pattern can match incorrectly across component boundaries.
  // pattern:
  //   /{%\s*sectionGrid\s*([^%]*?)\s*%}([\s\S]*?){%\s*endsectionGrid\s*%}/g,
  pattern:
    /^{%\s*sectionGrid\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionGrid\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    const header = extractSectionAreaData(sectionInner, "sectionHeader");
    const footer = extractSectionAreaData(sectionInner, "sectionFooter");

    const grid = extractWithNunjucksTag(sectionInner, "grid");
    const { extracted: gridAttributes } = extractAttributes(grid.attributes, [
      "type",
      "gap",
      "class",
      "widthWrap",
      "columns",
    ]);

    // Extract all gridItems with their attributes
    const items = extractAllSectionAreaData(grid?.content || "", "gridItem");

    return {
      header: header?.content ? header : undefined,
      footer: footer?.content ? footer : undefined,
      items,
      layoutOptions: gridAttributes,
      attributes: sectionAttributes,
      // itemsAttributes,
    };
  },
  toBlock: function (data) {
    const {
      type,
      gap,
      class: className,
      widthWrap,
      columns,
    } = data?.layoutOptions || {};

    const headerAttrs = njkAttrsStringFromSectionAreaData(data?.header);
    const headerContent = data?.header?.content
      ? `{% sectionHeader ${headerAttrs} %}
${data?.header?.content}
{% endsectionHeader %}`
      : "";

    const footerAttrs = njkAttrsStringFromSectionAreaData(data?.footer);
    const footerContent = data?.footer?.content
      ? `{% sectionFooter ${footerAttrs} %}
${data?.footer?.content}
{% endsectionFooter %}`
      : "";

    const gridItemsStr = data?.items?.length
      ? data.items
          .map((item, index) => {
            const itemAttrs = njkAttrsStringFromSectionAreaData(item);
            return item.content
              ? `{% gridItem ${itemAttrs} %}
${item.content}
{% endgridItem %}`
              : "";
          })
          .filter(Boolean)
          .join("\n")
      : "";

    const gridAttrs = { type, columns, gap, class: className, widthWrap };
    const gridAttrsStr = njkAttrsStringFromObj(gridAttrs);
    const gridContent = data?.items?.length
      ? `{% grid ${gridAttrsStr} %}
${gridItemsStr}
{% endgrid %}`
      : "";

    return `{% sectionGrid ${data?.attributes || ""} %}
${headerContent}
${gridContent}
${footerContent}
{% endsectionGrid %}`;
  },
  toPreview: (data) => `<span>GRID SECTION</span>`,
};

export const sectionTwoColumns = {
  id: "sectionTwoColumns",
  label: "Section > Two Columns",
  icon: "grid_view",
  fields: [
    sectionHeaderField,
    {
      name: "itemLeft",
      label: "Column Left",
      widget: "object",
      required: true,
      summary: "{{content | truncate(50)}}",
      // collapsed: true,
      fields: [
        {
          name: "content",
          label: "Column Left Content",
          widget: "markdown",
          required: false,
        },
        {
          name: "class",
          label: "Column Left Classes",
          widget: "string",
          required: false,
        },
        {
          name: "attributes",
          label: "Column Left Raw Attributes",
          widget: "hidden",
          required: false,
        },
      ],
    },
    {
      name: "itemRight",
      label: "Column Right",
      widget: "object",
      required: true,
      summary: "{{content | truncate(50)}}",
      // collapsed: true,
      fields: [
        {
          name: "content",
          label: "Column Right Content",
          widget: "markdown",
          required: false,
        },
        {
          name: "class",
          label: "Column Right Classes",
          widget: "string",
          required: false,
        },
        {
          name: "attributes",
          label: "Column Right Raw Attributes",
          widget: "hidden",
          required: false,
        },
      ],
    },
    // {
    //   name: "items",
    //   label: "Column Items",
    //   widget: "object",
    //   required: true,
    //   default: [{ itemLeft: "", itemRight: "" }],
    //   summary: "{{item | truncate(50)}}",
    //   // collapsed: true,
    //   fields: [
    //     {
    //       name: "contentItemLeft",
    //       label: "Column Left",
    //       widget: "markdown",
    //       required: false,
    //     },
    //     {
    //       name: "classItemLeft",
    //       label: "Left Column Classes",
    //       widget: "string",
    //       required: false,
    //     },
    //     {
    //       name: "attributesItemLeft",
    //       label: "Left Column Raw Attributes",
    //       widget: "hidden",
    //       required: false,
    //     },
    //     {
    //       name: "contentItemRight",
    //       label: "Column Right",
    //       widget: "markdown",
    //       required: false,
    //     },
    //     {
    //       name: "classItemRight",
    //       label: "Right Column Classes",
    //       widget: "string",
    //       required: false,
    //     },
    //     {
    //       name: "attributesItemRight",
    //       label: "Right Column Raw Attributes",
    //       widget: "hidden",
    //       required: false,
    //     },
    //   ],
    // },
    sectionFooterField,
    {
      name: "layoutOptions",
      label: "Layout Options",
      hint: "Manually select a layout and related options",
      widget: "object",
      required: false,
      collapsed: true,
      types: [layoutTypeSwitcher, layoutTypeFixedFluid],
    },
    {
      name: "attributes",
      label: "Section Raw Attributes",
      widget: "string",
      required: false,
    },
  ],
  pattern:
    /^{%\s*sectionTwoColumns\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionTwoColumns\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    // const header = extractWithNunjucksTag(sectionInner, "sectionHeader");
    // const footer = extractWithNunjucksTag(sectionInner, "sectionFooter");

    const header = extractSectionAreaData(sectionInner, "sectionHeader");
    const footer = extractSectionAreaData(sectionInner, "sectionFooter");

    const twoColumns = extractWithNunjucksTag(sectionInner, "twoColumns");
    const { extracted: twoColumnsAttributes } = extractAttributes(
      twoColumns?.attributes,
      [
        "type",
        "gap",
        "class",
        "widthWrap",
        "widthFixed",
        "widthFluidMin",
        "fixedSide",
      ],
    );

    const items = extractAllSectionAreaData(
      twoColumns?.content || "",
      "twoColumnsItem",
    );

    // Extract the two column items (left = first, right = second)
    // const columnItems = extractAllWithNunjucksTag(
    //   twoColumns?.content || "",
    //   "twoColumnsItem",
    // );

    // const itemLeft = columnItems[0]?.content || "";
    // const attributesItemLeft = columnItems[0]?.attributes || "";

    // const itemRight = columnItems[1]?.content || "";
    // const attributesItemRight = columnItems[1]?.attributes || "";

    return {
      header: header?.content ? header : undefined,
      footer: footer?.content ? footer : undefined,
      itemLeft: items[0]?.content ? items[0] : undefined,
      itemRight: items[1]?.content ? items[1] : undefined,
      // items: {
      //   itemLeft,
      //   classItemLeft,
      //   attributesItemLeft,
      //   itemRight,
      //   classItemRight,
      //   attributesItemRight
      // },
      layoutOptions: twoColumnsAttributes,
      attributes: sectionAttributes,
    };
  },
  toBlock: function (data) {
    const {
      type,
      gap,
      class: className,
      widthWrap,
      widthFixed,
      widthFluidMin,
      fixedSide,
    } = data?.layoutOptions || {};

    const headerAttrs = njkAttrsStringFromSectionAreaData(data?.header);
    const headerContent = data?.header?.content
      ? `{% sectionHeader ${headerAttrs} %}
${data?.header?.content}
{% endsectionHeader %}`
      : "";

    const footerAttrs = njkAttrsStringFromSectionAreaData(data?.footer);
    const footerContent = data?.footer?.content
      ? `{% sectionFooter ${footerAttrs} %}
${data?.footer?.content}
{% endsectionFooter %}`
      : "";

    const itemLeftAttrs = njkAttrsStringFromSectionAreaData(data?.itemLeft);
    const itemLeftContent = data?.itemLeft?.content
      ? `{% twoColumnsItem ${itemLeftAttrs} %}
${data?.itemLeft?.content}
{% endtwoColumnsItem %}`
      : "";

    const itemRightAttrs = njkAttrsStringFromSectionAreaData(data?.itemRight);
    const itemRightContent = data?.itemRight?.content
      ? `{% twoColumnsItem ${itemRightAttrs} %}
${data?.itemRight?.content}
{% endtwoColumnsItem %}`
      : "";

    // TODO: Check what happens when one of the items is empty
    const columnItemsStr = [itemLeftContent, itemRightContent]
      .filter(Boolean)
      .join("\n");

    // Build twoColumns attributes based on layout type
    const twoColumnsAttrs = {
      type,
      gap,
      class: className,
      widthWrap,
      widthFixed,
      widthFluidMin,
      fixedSide,
    };

    const twoColumnsAttrsStr = njkAttrsStringFromObj(twoColumnsAttrs);

    const twoColumnsContent = columnItemsStr
      ? `{% twoColumns ${twoColumnsAttrsStr} %}
${columnItemsStr}
{% endtwoColumns %}`
      : "";

    return `{% sectionTwoColumns ${data?.attributes || ""} %}
${headerContent}
${twoColumnsContent}
${footerContent}
{% endsectionTwoColumns %}`;
  },
  toPreview: (data) => `<span>TWO COLUMNS SECTION</span>`,
};

export const sectionCollection = {
  id: "sectionCollection",
  label: "Section > Collection List",
  icon: "grid_view",
  fields: [
    sectionHeaderField,
    {
      name: "collection",
      label: "Select a collection to display",
      widget: "select",
      required: true,
      multiple: false,
      dropdown_threshold: 12,
      default: "all",
      options: [
        { value: "all", label: "All Collections" },
        { value: "pages", label: "Pages" },
        ...activeCollections.map((collection) => ({
          value: collection.name,
          label: collection.label || collection.name,
        })),
      ],
    },
    {
      name: "sortAndFilterOptions",
      label: "Sort & Filter Options",
      label_singular: "Sort & Filter Option",
      widget: "object",
      required: false,
      fields: [
        {
          name: "filters",
          label: "Filters",
          label_singular: "Filter",
          hint: "Filtering rules to apply on the Collection",
          widget: "list",
          required: false,
          collapsed: true,
          summary: "{{value}}",
          typeKey: "by",
          types: [
            {
              name: "tag",
              label: "Filter by Tag",
              fields: [
                {
                  name: "value",
                  label: "Tag Name",
                  hint: "Tags must first exist in the in [Data Files > Translated Data](/admin/#/collections/dataFiles/entries/translatedData)",
                  widget: "relation",
                  collection: "dataFiles",
                  file: "translatedData",
                  value_field: "tagsList.*.slug",
                  display_fields: ["tagsList.*.name"],
                  required: true,
                  multiple: true,
                },
              ],
            },
            {
              name: "first",
              label: "First",
              fields: [
                {
                  name: "value",
                  label: "Count",
                  hint: "Only display the first x items",
                  widget: "number",
                  required: true,
                  default: 3,
                },
              ],
            },
            {
              name: "last",
              label: "Last",
              fields: [
                {
                  name: "value",
                  label: "Count",
                  hint: "Only display the last x items",
                  widget: "number",
                  required: true,
                  default: 3,
                },
              ],
            },
          ],
        },
        {
          name: "exclusions",
          label: "Exclusions",
          label_singular: "Exclusion",
          widget: "boolean",
          required: false,
          default: false,
          hint: "When enabled, the defined filters will exclude items instead of including them. For example, if you set a Tag filter with 'example' value and enable Exclusions, items with 'example' tag will not be displayed in the section.",
        },
        {
          name: "sortCriterias",
          label: "Sort Criterias",
          label_singular: "Sort Criteria",
          hint: "Sorting rules to apply on the Collection",
          widget: "list",
          required: false,
          collapsed: true,
          summary: "{{direction}}",
          typeKey: "by",
          types: [
            {
              name: "date",
              label: "Sort by Date",
              fields: [
                {
                  name: "direction",
                  label: "Sort Direction",
                  widget: "select",
                  collapsed: true,
                  default: "desc",
                  options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                  ],
                },
              ],
            },
            {
              name: "title",
              label: "Sort by Title",
              collapsed: true,
              fields: [
                {
                  name: "direction",
                  label: "Sort Direction",
                  widget: "select",
                  default: "asc",
                  options: [
                    { value: "asc", label: "Ascending" },
                    { value: "desc", label: "Descending" },
                  ],
                },
              ],
            },
            // {
            //   name: "direction",
            //   label: "Sort Direction",
            //   widget: "select",
            //   required: false,
            //   multiple: false,
            //   default: "desc",
            //   options: [
            //     { value: "asc", label: "Ascending " },
            //     { value: "desc", label: "Descending" },
            //   ],
            // },
            // {
            //   name: "by",
            //   label: "Sort By",
            //   widget: "select",
            //   required: false,
            //   multiple: false,
            //   default: "date",
            //   options: [
            //     { value: "date", label: "Date" },
            //     // { value: "data.title", label: "Title" },
            //     { value: "title", label: "Title" },
            //   ],
            // },
          ],
        },
      ],
    },
    sectionFooterField,
    {
      name: "layoutOptions",
      label: "Layout Options",
      hint: "Manually select a layout and related options",
      widget: "object",
      required: false,
      collapsed: true,
      types: [layoutTypeSwitcher, layoutTypeGridFluid, layoutTypeCluster],
    },
    {
      name: "attributes",
      label: "Section Raw Attributes",
      widget: "string",
      required: false,
    },
  ],
  pattern:
    /^{%\s*sectionCollection\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionCollection\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    // const header = extractWithNunjucksTag(sectionInner, "sectionHeader");
    // const footer = extractWithNunjucksTag(sectionInner, "sectionFooter");
    const header = extractSectionAreaData(sectionInner, "sectionHeader");
    const footer = extractSectionAreaData(sectionInner, "sectionFooter");

    const collection = extractWithNunjucksTag(sectionInner, "collection");
    const filters =
      extractJsonProperty(collection?.attributes, "filters") || [];
    const sortCriterias =
      extractJsonProperty(collection?.attributes, "sortCriterias") || [];

    const { extracted: collectionAttributes } = extractAttributes(
      collection?.attributes,
      [
        "collection",
        "filters", // Complex value. We just extract it here to avoid polluting `remaining` attributes
        "sortCriterias", // Complex value. We just extract it here to avoid polluting `remaining` attributes
        "exclusions",
        "type",
        "gap",
        "class",
        "widthWrap",
        "columns",
      ],
    );
    const {
      collection: collectionName,
      filters: noop1, // Just to remove key from ...layoutOptions
      sortCriterias: noop2, // Just to remove key from ...layoutOptions
      exclusions,
      ...layoutOptions
    } = collectionAttributes;

    const sortAndFilterOptions =
      filters.length || sortCriterias.length || exclusions
        ? { filters, sortCriterias, exclusions: !!exclusions }
        : undefined;

    return {
      header: header?.content ? header : undefined,
      footer: footer?.content ? footer : undefined,
      collection: collectionName,
      sortAndFilterOptions,
      layoutOptions,
      sectionAttributes,
    };
  },
  toBlock: function (data) {
    const collection = data?.collection || "all";
    const { filters, sortCriterias, exclusions } = data?.sortAndFilterOptions || {};
    // const tag = data?.tags;
    // const sort = data?.sortOptions?.sort;
    // const sortBy = data?.sortOptions?.sortBy;
    // const filterOptions = data?.filterOptions || [];
    // const layoutOptions = data?.layoutOptions || {};
    // const layoutType = layoutOptions?.type;
    const {
      type,
      gap,
      class: className,
      widthWrap,
      columns,
    } = data?.layoutOptions || {};

    // Build layout attrs from layoutOptions
    // let layoutAttrs = {};
    // if (layoutType === "switcher") {
    //   layoutAttrs = {
    //     type: "switcher",
    //     ...(layoutOptions.widthWrap
    //       ? { widthWrap: layoutOptions.widthWrap }
    //       : {}),
    //     ...(layoutOptions.gap ? { gap: layoutOptions.gap } : {}),
    //     ...(layoutOptions.class ? { class: layoutOptions.class } : {}),
    //   };
    // } else if (layoutType === "grid-fluid") {
    //   layoutAttrs = {
    //     type: "grid-fluid",
    //     ...(layoutOptions.columns ? { columns: layoutOptions.columns } : {}),
    //     ...(layoutOptions.gap ? { gap: layoutOptions.gap } : {}),
    //     ...(layoutOptions.class ? { class: layoutOptions.class } : {}),
    //   };
    // }

    const headerAttrs = njkAttrsStringFromSectionAreaData(data?.header);
    const headerContent = data?.header?.content
      ? `{% sectionHeader ${headerAttrs} %}
${data?.header?.content}
{% endsectionHeader %}`
      : "";

    const footerAttrs = njkAttrsStringFromSectionAreaData(data?.footer);
    const footerContent = data?.footer?.content
      ? `{% sectionFooter ${footerAttrs} %}
${data?.footer?.content}
{% endsectionFooter %}`
      : "";

    // Build filterFirst / filterLast from filterOptions list
    // const filterFirst = filterOptions.find((o) => o.type === "filterFirst");
    // const filterLast = filterOptions.find((o) => o.type === "filterLast");

    // const colAttrs = {
    //   collection,
    //   ...(tag ? { tag } : {}),
    //   ...(sort ? { sort } : {}),
    //   ...(sortBy ? { sortBy } : {}),
    //   ...layoutAttrs,
    //   ...(filterFirst ? { filterFirst: filterFirst.count } : {}),
    //   ...(filterLast ? { filterLast: filterLast.count } : {}),
    // };
    // const colAttrsStr = Object.entries(colAttrs)
    //   .filter(([, value]) => value !== undefined && value !== "")
    //   .map(([key, value]) => `${key}="${value}"`)
    //   .join(", ");

    // const collLogicAttrs = { collection, filters, sortCriterias }
    const collAttrs = {
      collection,
      filters,
      exclusions,
      sortCriterias,
      type,
      columns,
      gap,
      class: className,
      widthWrap,
    };
    const collAttrsStr = njkAttrsStringFromObj(collAttrs);
    const collectionContent = `{% collection ${collAttrsStr} %}{% endcollection %}`;

    return `{% sectionCollection ${data?.sectionAttributes || ""} %}
${headerContent}
${collectionContent}
${footerContent}
{% endsectionCollection %}`;
  },
  toPreview: (data) => `<span>COLLECTION SECTION</span>`,
};

// Example for project specific component def

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
