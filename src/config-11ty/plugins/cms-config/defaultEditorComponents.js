import {
  env,
  activeCollections,
  editorComponents,
  // activeCollectionNames,
  iconLists,
} from "./env.js";

const { CONTENT_DIR } = env;
// const iconLists = env?.iconLists || {};
const iconLibs = Object.keys(iconLists) || [];

const SECTION_WRAPPER_STYLE = `background-color: hsl(var(--sui-background-color-3-hsl) / 0.3);`;
const AREA_ITEM_PREVIEW_STYLE = `border: 1px dashed hsl(var(--sui-background-color-4-hsl) / 1); margin-block-start: .5rem; padding: 0 1rem .5rem;`;
const AREA_PREVIEW_STYLE = `border: 1px dashed hsl(var(--sui-background-color-4-hsl) / 1); margin-block-start: .5rem; padding: 0 .5rem .5rem;`;

const ec = (idExcl) => editorComponents.filter((id) => id !== idExcl);
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
  // `type` is a CMS-side discriminator for the sectionBuilder areas list
  // (e.g. "areaRaw", "area"). It must NOT be serialized onto the tag.
  // `tagName` is an internal helper produced when parsing existing markup
  // and must also not be serialized.
  const {
    content,
    attributes,
    type: _type,
    tagName: _tagName,
    ...isolatedAttrs
  } = areaData || {};
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
const extractProperty = (argumentsString = "", propName) => {
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
    // Fast-path: bracket/brace values (e.g. filters=[...]) cannot be matched by
    // the regex below. Delegate to extractProperty which does balanced parsing.
    const jsonValue = extractProperty(remaining, propName);
    if (jsonValue !== null) {
      extracted[propName] = JSON.parse(jsonValue);
      const token = propName + "=" + jsonValue;
      const idx = remaining.indexOf(token);
      const before = remaining.slice(0, idx);
      const after = remaining.slice(idx + token.length);
      remaining = (before + after)
        .replace(/^[,\s]+|[,\s]+$/g, "")
        .replace(/\s*,\s*,\s*/g, ", ")
        .trim();
      continue;
    }

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

const extractAllSectionAreaDataMultipleTags = (contentString, tagNames) => {
  if (!contentString || !tagNames?.length) return [];

  const allMatches = [];

  tagNames.forEach((tagName) => {
    const regex = new RegExp(
      `{%\\s*${tagName}(?:\\s+([^%]*?))?\\s*%}\\s*([\\s\\S]*?)\\s*{%\\s*end${tagName}\\s*%}`,
      "gms",
    );

    let match;
    while ((match = regex.exec(contentString)) !== null) {
      allMatches.push({
        tagName,
        index: match.index,
        attributes: match[1]?.trim() || null,
        content: match[2].trim(),
      });
    }
  });

  // Sort by position to maintain order
  allMatches.sort((a, b) => a.index - b.index);

  // Process attributes for each match.
  // NOTE: only `class` is promoted to top-level here. `type` MUST be left in
  // the remaining attributes string so that `parseLayoutAttrs` (called later
  // by parseTwoColumnsBody/parseGridBody/parseFlowBody/parseReelBody/
  // parseCollectionBody) can capture it as the `layoutOptions.type`
  // discriminator (e.g. "switcher", "fixedFluid", "grid-fluid", ...).
  const items = allMatches.map(({ tagName, attributes, content }) => {
    const { extracted, remaining } = extractAttributes(attributes || "", [
      "class",
    ]);
    const className = extracted?.class || null;
    return {
      tagName,
      class: className,
      attributes: remaining,
      content,
    };
  });

  return items;
};

// ---------------------------------------------------------------------------
// Section helpers
// Shared building blocks for section fromBlock/toBlock implementations.
// ---------------------------------------------------------------------------

const buildBodyPreview = ({ items }) => {
  const itemsStr = items?.length
    ? items
        .map((item) => {
          return item?.content
            ? `<div style="${AREA_ITEM_PREVIEW_STYLE}">

${item.content}
</div>`
            : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  if (!itemsStr) return "";

  return `<div style="${AREA_PREVIEW_STYLE}">

${itemsStr}
</div>`;
};

/**
 * Parse sectionHeader and sectionFooter from a section's inner content.
 * Returns `undefined` for empty header/footer so callers can spread directly.
 */
const parseSectionHeaderFooter = (sectionInner) => {
  const header = extractSectionAreaData(sectionInner, "sectionHeader");
  const footer = extractSectionAreaData(sectionInner, "sectionFooter");
  return {
    header: header?.content ? header : undefined,
    footer: footer?.content ? footer : undefined,
  };
};

/**
 * Build the `{% sectionHeader %}` and `{% sectionFooter %}` markup strings.
 * Returns empty strings for missing header/footer.
 */
const buildSectionHeaderFooterMarkup = ({ header, footer }) => {
  const headerAttrs = njkAttrsStringFromSectionAreaData(header);
  const headerContent = header?.content
    ? `{% sectionHeader ${headerAttrs} %}
${header.content}
{% endsectionHeader %}`
    : "";

  const footerAttrs = njkAttrsStringFromSectionAreaData(footer);
  const footerContent = footer?.content
    ? `{% sectionFooter ${footerAttrs} %}
${footer.content}
{% endsectionFooter %}`
    : "";

  return { headerContent, footerContent };
};

const buildSectionHeaderFooterMarkupPreview = ({ header, footer }) => {
  const headerContent = header?.content
    ? `<header>

${header.content}
</header>`
    : "";

  const footerContent = footer?.content
    ? `<footer>

${footer.content}
</footer>`
    : "";

  return { headerContent, footerContent };
};

/**
 * Parse a layout tag's attribute string into { class, layoutOptions, attributes }.
 * `class` is promoted to top-level; `layoutOptions` holds the remaining known
 * layout keys; `attributes` holds any leftover raw attribute string.
 */
const parseLayoutAttrs = (attrsString, layoutKeys) => {
  const { extracted, remaining } = extractAttributes(attrsString || "", [
    "class",
    ...layoutKeys,
  ]);
  const { class: className, ...layoutOptions } = extracted;
  return {
    class: className || undefined,
    layoutOptions,
    attributes: remaining || undefined,
  };
};

/**
 * Build a layout tag's attribute string from { class, layoutOptions, attributes }.
 * Produces `layoutKey1="v1", layoutKey2="v2", class="...", <raw attributes>`.
 */
const buildLayoutAttrsString = ({
  class: className,
  layoutOptions,
  attributes,
}) =>
  [
    njkAttrsStringFromObj({ ...(layoutOptions || {}), class: className }),
    attributes || "",
  ]
    .filter(Boolean)
    .join(", ");

// Known layout attribute keys per layout element
const FLOW_LAYOUT_KEYS = ["type", "gap"];
const TWO_COLUMNS_LAYOUT_KEYS = [
  "type",
  "gap",
  "widthWrap",
  "widthFixed",
  "widthFluidMin",
  "fixedSide",
];
const GRID_LAYOUT_KEYS = ["type", "gap", "widthWrap", "columns"];
const REEL_LAYOUT_KEYS = ["type", "itemWidth", "height", "gap", "noBar"];
// Union of all layout keys supported by the collection component
const COLLECTION_LAYOUT_KEYS = [
  "type",
  "gap",
  "widthWrap",
  "columns",
  "itemWidth",
  "height",
  "noBar",
];

/**
 * Parse a `{% twoColumns %}...{% endtwoColumns %}` block into structured data.
 * `block` is the result of `extractWithNunjucksTag` (or equivalent), i.e.
 * `{ attributes, content }`. Returns `undefined` if block is missing.
 */
const parseTwoColumnsBody = (block) => {
  if (!block) return undefined;
  const {
    class: className,
    layoutOptions,
    attributes,
  } = parseLayoutAttrs(block.attributes, TWO_COLUMNS_LAYOUT_KEYS);

  const items = extractAllSectionAreaData(
    block.content || "",
    "twoColumnsItem",
  );

  return {
    class: className,
    layoutOptions,
    attributes,
    itemLeft: items[0]?.content ? items[0] : undefined,
    itemRight: items[1]?.content ? items[1] : undefined,
  };
};

/**
 * Build a `{% twoColumns %}...{% endtwoColumns %}` markup string from structured data.
 * Returns an empty string if neither itemLeft nor itemRight has content.
 */
const buildTwoColumnsBody = ({
  class: className,
  layoutOptions,
  attributes,
  itemLeft,
  itemRight,
}) => {
  const leftAttrs = njkAttrsStringFromSectionAreaData(itemLeft);
  const leftContent = itemLeft?.content
    ? `{% twoColumnsItem ${leftAttrs} %}
${itemLeft.content}
{% endtwoColumnsItem %}`
    : "";

  const rightAttrs = njkAttrsStringFromSectionAreaData(itemRight);
  const rightContent = itemRight?.content
    ? `{% twoColumnsItem ${rightAttrs} %}
${itemRight.content}
{% endtwoColumnsItem %}`
    : "";

  if (!leftContent && !rightContent) return "";

  const attrsStr = buildLayoutAttrsString({
    class: className,
    layoutOptions,
    attributes,
  });

  return `{% twoColumns ${attrsStr} %}
${leftContent}
${rightContent}
{% endtwoColumns %}`;
};

/**
 * Parse a `{% grid %}...{% endgrid %}` block into structured data.
 * `block` is `{ attributes, content }`. Returns `undefined` if block is missing.
 */
const parseGridBody = (block) => {
  if (!block) return undefined;
  const {
    class: className,
    layoutOptions,
    attributes,
  } = parseLayoutAttrs(block.attributes, GRID_LAYOUT_KEYS);

  const items = extractAllSectionAreaData(block.content || "", "gridItem");

  return {
    class: className,
    layoutOptions,
    attributes,
    items,
  };
};

/**
 * Build a `{% grid %}...{% endgrid %}` markup string from structured data.
 * Returns an empty string if there are no items.
 */
const buildGridBody = ({
  class: className,
  layoutOptions,
  attributes,
  items,
}) => {
  const gridItemsStr = items?.length
    ? items
        .map((item) => {
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

  if (!gridItemsStr) return "";

  const attrsStr = buildLayoutAttrsString({
    class: className,
    layoutOptions,
    attributes,
  });

  return `{% grid ${attrsStr} %}
${gridItemsStr}
{% endgrid %}`;
};

/**
 * Strip a single surrounding `{% raw %}…{% endraw %}` pair (with optional
 * whitespace) from the captured body, so the editor stores only the meaningful
 * per-item markup. Returns `undefined` for empty/whitespace-only input.
 */
const stripRawTags = (content) => {
  if (typeof content !== "string") return undefined;
  const trimmed = content.trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^\{%\s*raw\s*%\}([\s\S]*?)\{%\s*endraw\s*%\}$/);
  return match ? match[1].trim() : trimmed;
};

/**
 * Wrap the stored item template back into `{% raw %}…{% endraw %}` so the
 * paired `{% collection %}` shortcode receives it unrendered.
 */
const wrapInRawTags = (itemTemplate) => {
  const t = typeof itemTemplate === "string" ? itemTemplate.trim() : "";
  return t
    ? `
{% raw %}
${t}
{% endraw %}
`
    : "";
};

/**
 * Parse a collection area's body content and attributes into structured data.
 * Extracts collection-specific fields (collection, filters, sortCriterias, exclusions)
 * and layout options from the {% collection %} tag.
 */
const parseCollectionBody = ({ attributes, content }) => {
  const filters = extractJsonProperty(attributes, "filters") || [];
  const sortCriterias = extractJsonProperty(attributes, "sortCriterias") || [];

  // Extract collection-specific attrs first
  const { extracted: collectionSpecific, remaining: afterCollectionSpecific } =
    extractAttributes(attributes, [
      "collection",
      "filters",
      "sortCriterias",
      "exclusions",
      "itemPartial",
    ]);

  // Then parse layout attrs from what remains. `remaining` here holds any
  // unknown leftover attributes (e.g. `tag="ul"`) that we round-trip via the
  // hidden `attributes` field.
  const {
    class: className,
    layoutOptions,
    attributes: remainingAttributes,
  } = parseLayoutAttrs(afterCollectionSpecific, COLLECTION_LAYOUT_KEYS);
  // `itemPartial` was already pulled out into `collectionSpecific` above.
  const itemPartial = collectionSpecific.itemPartial;

  const sortAndFilterOptions =
    filters.length || sortCriterias.length || collectionSpecific.exclusions
      ? {
          filters,
          sortCriterias,
          exclusions: !!collectionSpecific.exclusions,
        }
      : undefined;

  return {
    collection: collectionSpecific.collection,
    sortAndFilterOptions,
    class: className,
    itemPartial,
    itemTemplate: stripRawTags(content),
    layoutOptions,
    attributes: remainingAttributes,
  };
};

/**
 * Build the Nunjucks markup for a collection area from structured data.
 * Takes collection, sortAndFilterOptions, class, layoutOptions, and attributes
 * and returns the {% collection %} tag with proper attributes.
 */
const buildCollectionBody = ({
  collection,
  sortAndFilterOptions,
  class: className,
  itemPartial,
  itemTemplate,
  layoutOptions,
  attributes,
}) => {
  const { filters, sortCriterias, exclusions } = sortAndFilterOptions || {};

  const collAttrs = {
    collection: collection || "all",
    filters,
    exclusions,
    sortCriterias,
    ...(layoutOptions || {}),
    class: className,
    itemPartial,
  };
  const collAttrsStr = [njkAttrsStringFromObj(collAttrs), attributes || ""]
    .filter(Boolean)
    .join(", ");
  const body = wrapInRawTags(itemTemplate);

  return `{% collection ${collAttrsStr} %}${body}{% endcollection %}`;
};

/**
 * Parse a flow area's body content and attributes into structured data.
 * Extracts flow-specific fields (items, gap) and layout options from the {% flow %} tag.
 */
const parseFlowBody = (block) => {
  if (!block) return undefined;
  const {
    class: className,
    layoutOptions,
    attributes,
  } = parseLayoutAttrs(block.attributes, FLOW_LAYOUT_KEYS);

  const items = extractAllSectionAreaData(block.content || "", "flowItem");

  return {
    class: className,
    layoutOptions,
    attributes,
    items,
  };
};

/**
 * Build the Nunjucks markup for a flow area from structured data.
 * Takes items, class, layoutOptions, and attributes and returns the {% flow %} tag with proper attributes.
 */
const buildFlowBody = ({
  class: className,
  layoutOptions,
  attributes,
  items,
}) => {
  const flowItemsStr = items?.length
    ? items
        .map((item) => {
          const itemAttrs = njkAttrsStringFromSectionAreaData(item);
          return item.content
            ? `{% flowItem ${itemAttrs} %}
${item.content}
{% endflowItem %}`
            : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  if (!flowItemsStr) return "";

  const attrsStr = buildLayoutAttrsString({
    class: className,
    layoutOptions,
    attributes,
  });

  return `{% flow ${attrsStr} %}
${flowItemsStr}
{% endflow %}`;
};

/**
 * Parse a reel area's body content and attributes into structured data.
 * Extracts reel-specific fields (items, itemWidth, height, gap, noBar) and layout options from the {% reel %} tag.
 */
const parseReelBody = (block) => {
  if (!block) return undefined;
  const {
    class: className,
    layoutOptions,
    attributes,
  } = parseLayoutAttrs(block.attributes, REEL_LAYOUT_KEYS);

  const items = extractAllSectionAreaData(block.content || "", "reelItem");

  return {
    class: className,
    layoutOptions,
    attributes,
    items,
  };
};

/**
 * Build the Nunjucks markup for a reel area from structured data.
 * Takes items, class, layoutOptions, and attributes and returns the {% reel %} tag with proper attributes.
 */
const buildReelBody = ({
  class: className,
  layoutOptions,
  attributes,
  items,
}) => {
  const reelItemsStr = items?.length
    ? items
        .map((item) => {
          const itemAttrs = njkAttrsStringFromSectionAreaData(item);
          return item.content
            ? `{% reelItem ${itemAttrs} %}
${item.content}
{% endreelItem %}`
            : "";
        })
        .filter(Boolean)
        .join("\n")
    : "";

  if (!reelItemsStr) return "";

  const attrsStr = buildLayoutAttrsString({
    class: className,
    layoutOptions,
    attributes,
  });

  return `{% reel ${attrsStr} %}
${reelItemsStr}
{% endreel %}`;
};

/**
 * Parse a section's outer-tag attribute string into structured `sectionWrapper`
 * data: `{ class, attributes }`. The `class` is promoted to a first-class field
 * so it stops being hidden inside the raw attributes string.
 */
const parseSectionWrapper = (attrsString) => {
  const { extracted, remaining } = extractAttributes(attrsString || "", [
    "class",
  ]);
  return {
    class: extracted?.class || undefined,
    attributes: remaining || undefined,
  };
};

/**
 * Build the section's outer-tag attribute string from `sectionWrapper` data.
 */
const buildSectionWrapperString = (sectionWrapper) => {
  const { class: className, attributes } = sectionWrapper || {};
  return [className ? `class="${className}"` : "", attributes || ""]
    .filter(Boolean)
    .join(", ");
};

/**
 * Shared CMS field definition for the section wrapper. Groups together the
 * class names and raw attributes that apply to the OUTER section element
 * (e.g. `{% sectionGrid %}`), as opposed to the inner layout element
 * (e.g. `{% grid %}`). Collapsed by default since it is rarely edited.
 */
const sectionWrapperField = {
  name: "sectionWrapper",
  label: "Section Wrapper Options",
  hint: "Class names and raw attributes applied to the outer section element",
  widget: "object",
  required: false,
  collapsed: true,
  i18n: true,
  fields: [
    {
      name: "class",
      label: "Section Class Names",
      widget: "string",
      hint: "Class names added to the outer section element (e.g. 'my-class another-class')",
      required: false,
      i18n: "duplicate",
    },
    {
      name: "attributes",
      label: "Section Raw Attributes",
      widget: "string",
      required: false,
      i18n: "duplicate",
    },
  ],
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
const sectionHeaderField = (parentCompName) => ({
  name: "header",
  label: "Section Header",
  widget: "object",
  required: false,
  // collapsed: true,
  i18n: true,
  summary: "{{content | truncate(50)}}",
  fields: [
    {
      name: "content",
      label: "Header Content",
      widget: "richtext",
      required: false,
      i18n: true,
      // editor_components: ec(parentCompName),
    },
    {
      name: "class",
      label: "Header Classes",
      widget: "string",
      required: false,
      i18n: true,
    },
    {
      name: "attributes",
      label: "Header Raw Attributes",
      widget: "hidden",
      required: false,
      i18n: true,
    },
  ],
});
const sectionFooterField = (parentCompName) => ({
  name: "footer",
  label: "Section Footer",
  widget: "object",
  required: false,
  // collapsed: true,
  i18n: true,
  summary: "{{content | truncate(50)}}",
  fields: [
    {
      name: "content",
      label: "Footer Content",
      widget: "richtext",
      required: false,
      i18n: true,
      // editor_components: ec(parentCompName),
    },
    {
      name: "class",
      label: "Footer Classes",
      widget: "string",
      required: false,
      i18n: true,
    },
    {
      name: "attributes",
      label: "Footer Raw Attributes",
      widget: "hidden",
      required: false,
      i18n: true,
    },
  ],
});

// Layout options
const layoutTypeNone = {
  name: "layout-none",
  label: "No Layout",
  required: false,
  fields: [],
};
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
  ],
};
const layoutTypeSwitcher = {
  name: "switcher",
  // label: "Switcher: Switch from side by side to vertical display",
  label: "Switcher (Symmetrical Columns)",
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
  ],
};
const layoutTypeFixedFluid = {
  name: "fixedFluid",
  label: "Fixed-Fluid (Asymmetrical Columns)",
  collapsed: true,
  // icon: "vertical_split", // Would be nice
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
  ],
};
const layoutTypeFlow = {
  name: "flow",
  label: "Flow",
  collapsed: true,
  fields: [
    {
      name: "gap",
      label: "Gap",
      widget: "string",
      hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
      required: false,
    },
  ],
};
const layoutTypeReel = {
  name: "reel",
  label: "Reel",
  collapsed: true,
  fields: [
    {
      name: "itemWidth",
      label: "Item Width",
      widget: "string",
      hint: "The width of each child element (e.g. 20rem, 300px)",
      required: false,
    },
    {
      name: "height",
      label: "Height",
      widget: "string",
      hint: "The height of the parent (Reel) element (e.g. 20rem, 300px)",
      required: false,
    },
    {
      name: "gap",
      label: "Gap",
      widget: "string",
      hint: "The gap between reel items (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
      required: false,
    },
    {
      name: "noBar",
      label: "Hide Scrollbar",
      widget: "boolean",
      hint: "Whether to hide the scrollbar",
      default: false,
      required: false,
    },
  ],
};

export const link = {
  id: "link",
  label: "Link",
  icon: "link",
  mode: "dialog",
  // dialog: true, // Legacy
  summary:
    "🔗 {{content | truncate(20)}}{{content | ternary(': ', '')}}{{linkType.url | truncate(30)}}",
  fields: [
    {
      name: "linkType",
      label: "Link Type",
      widget: "object",
      required: true,
      i18n: true,
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
              i18n: true,
              fields: [
                {
                  name: "cc",
                  label: "CC",
                  widget: "string",
                  required: false,
                  i18n: true,
                },
                {
                  name: "bcc",
                  label: "BCC",
                  widget: "string",
                  required: false,
                  i18n: true,
                },
                {
                  name: "subject",
                  label: "Email subject",
                  widget: "string",
                  required: false,
                  i18n: true,
                },
                {
                  name: "body",
                  label: "Body",
                  widget: "text",
                  required: false,
                  i18n: true,
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
              multiple: false,
              // TODO: ⚠️ Overriding media_folder and public_folder does not work!
              media_folder: `/${CONTENT_DIR}/_files`,
              public_folder: "/assets/files",
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
      widget: "richtext",
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
  mode: "dialog",
  // dialog: true, // Legacy
  summary: "🔅 {{icon.iconLib.iconName}}",
  fields: [
    {
      name: "icon",
      label: "Icon",
      widget: "object",
      required: true,
      collapsed: true,
      i18n: true,
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
          i18n: true,
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
              i18n: true,
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
      i18n: true,
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
          i18n: true,
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
              name: "objectPosition",
              label: "Image Position",
              widget: "string",
              required: false,
              hint: "Position the image vertically and horizontally with CSS object-position (e.g., 'center', 'top left', 'center 75%')",
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
        "objectPosition",
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
      objectPosition,
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
          ...(objectPosition && { objectPosition }),
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
      objectPosition,
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
      ...(objectPosition && { objectPosition }),
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
  icon: "extension",
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
    return `<PARTIAL>`;
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
    return `<HTML PARTIAL>`;
  },
};

console.log({ editorComponents });

export const wrapper = {
  id: "wrapper",
  label: "Wrapper",
  icon: "lunch_dining",
  fields: [
    {
      name: "content",
      label: "Content",
      widget: "richtext",
      required: false,
      // editor_components: ec("wrapper"),
    },
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
    const { content, tag, class: className } = data;

    return `<${tag || "div"} class="${className || ""}">

${content}
</${tag || "div"}>`;
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
//               widget: "richtext",
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
//               widget: "richtext",
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
//               widget: "richtext",
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

export const sectionFlow = {
  id: "sectionFlow",
  label: "Section > Flow",
  icon: "flex_direction",
  fields: [
    sectionHeaderField("sectionFlow"),
    {
      name: "items",
      label: "Flow Items",
      widget: "list",
      required: true,
      default: [{ content: "" }, { content: "" }],
      summary: "{{item | truncate(50)}}",
      fields: [
        {
          name: "content",
          label: "Flow Item Content",
          widget: "richtext",
          required: false,
          // editor_components: ec("sectionFlow"),
        },
        {
          name: "class",
          label: "Flow Item Classes",
          widget: "string",
          required: false,
        },
        {
          name: "attributes",
          label: "Flow Item Raw Attributes",
          widget: "hidden",
          required: false,
        },
      ],
    },
    {
      name: "layoutOptions",
      label: "Layout Options",
      hint: "Manually select a layout and related options",
      widget: "object",
      required: false,
      collapsed: true,
      i18n: true,
      types: [layoutTypeFlow, layoutTypeNone],
    },
    {
      name: "class",
      label: "Layout Class Names",
      widget: "string",
      hint: "Class names added to the inner layout element ({% flow %}). For classes on the outer section element, use the Section Wrapper below.",
      required: false,
    },
    sectionFooterField("sectionFlow"),
    sectionWrapperField,
  ],
  pattern:
    /^{%\s*sectionFlow\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionFlow\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    const { header, footer } = parseSectionHeaderFooter(sectionInner);
    const flow = parseFlowBody(extractWithNunjucksTag(sectionInner, "flow"));

    return {
      header,
      footer,
      items: flow?.items || [],
      layoutOptions: flow?.layoutOptions || {},
      class: flow?.class,
      sectionWrapper: parseSectionWrapper(sectionAttributes),
    };
  },
  toBlock: function (data) {
    const { headerContent, footerContent } = buildSectionHeaderFooterMarkup({
      header: data?.header,
      footer: data?.footer,
    });

    const flowContent = buildFlowBody({
      class: data?.class,
      layoutOptions: data?.layoutOptions,
      items: data?.items,
    });

    const sectionAttrsStr = buildSectionWrapperString(data?.sectionWrapper);

    return `{% sectionFlow ${sectionAttrsStr} %}
${headerContent}
${flowContent}
${footerContent}
{% endsectionFlow %}`;
  },
  toPreview: (data) => {
    const { headerContent, footerContent } =
      buildSectionHeaderFooterMarkupPreview({
        header: data?.header,
        footer: data?.footer,
      });

    const areaContent = buildBodyPreview({ items: data?.items });

    return `<section class="section-flow" style="${SECTION_WRAPPER_STYLE}">
<small style="float:right;">Flow</small>

${headerContent}

${areaContent}

${footerContent}

</section>
`;
  },
};

export const sectionGrid = {
  id: "sectionGrid",
  label: "Section > Grid",
  // icon: "flex_wrap",
  icon: "grid_view",
  fields: [
    sectionHeaderField("sectionGrid"),
    {
      name: "items",
      label: "Grid Items",
      widget: "list",
      required: true,
      default: [{ content: "" }, { content: "" }, { content: "" }],
      summary: "{{item | truncate(50)}}",
      // collapsed: true,
      fields: [
        {
          name: "content",
          label: "Grid Item Content",
          widget: "richtext",
          required: false,
          // editor_components: ec("sectionGrid"),
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
    {
      name: "layoutOptions",
      label: "Layout Options",
      hint: "Manually select a layout and related options",
      comment:
        "Elements in a 'Fluid Grid' will wrap automatically one by one when there is not enough space while the 'Switcher' layout switches between horizontal and vertical layout at once at a specified width.",
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
    sectionFooterField("sectionGrid"),
    sectionWrapperField,
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

    const { header, footer } = parseSectionHeaderFooter(sectionInner);
    const grid = parseGridBody(extractWithNunjucksTag(sectionInner, "grid"));

    return {
      header,
      footer,
      items: grid?.items || [],
      layoutOptions: grid?.layoutOptions || {},
      class: grid?.class,
      sectionWrapper: parseSectionWrapper(sectionAttributes),
    };
  },
  toBlock: function (data) {
    const { headerContent, footerContent } = buildSectionHeaderFooterMarkup({
      header: data?.header,
      footer: data?.footer,
    });

    const gridContent = buildGridBody({
      class: data?.class,
      layoutOptions: data?.layoutOptions,
      items: data?.items,
    });

    const sectionAttrsStr = buildSectionWrapperString(data?.sectionWrapper);

    return `{% sectionGrid ${sectionAttrsStr} %}
${headerContent}
${gridContent}
${footerContent}
{% endsectionGrid %}`;
  },
  toPreview: (data) => {
    const { headerContent, footerContent } =
      buildSectionHeaderFooterMarkupPreview({
        header: data?.header,
        footer: data?.footer,
      });

    const areaContent = buildBodyPreview({ items: data?.items });

    return `<section class="section-grid" style="${SECTION_WRAPPER_STYLE}">
<small style="float:right;">Grid</small>

${headerContent}

${areaContent}

${footerContent}

</section>
`;
  },
};

export const sectionTwoColumns = {
  id: "sectionTwoColumns",
  label: "Section > Two Columns",
  icon: "view_column_2",
  icon: "vertical_split",
  fields: [
    sectionHeaderField("sectionTwoColumns"),
    {
      name: "itemLeft",
      label: "Column Left",
      widget: "object",
      required: true,
      i18n: true,
      summary: "{{content | truncate(50)}}",
      // collapsed: true,
      fields: [
        {
          name: "content",
          label: "Column Left Content",
          widget: "richtext",
          required: false,
          // editor_components: ec("sectionTwoColumns"),
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
      i18n: true,
      summary: "{{content | truncate(50)}}",
      // collapsed: true,
      fields: [
        {
          name: "content",
          label: "Column Right Content",
          widget: "richtext",
          required: false,
          // editor_components: ec("sectionTwoColumns"),
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
    sectionFooterField("sectionTwoColumns"),
    sectionWrapperField,
  ],
  pattern:
    /^{%\s*sectionTwoColumns\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionTwoColumns\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    const { header, footer } = parseSectionHeaderFooter(sectionInner);
    const twoColumns = parseTwoColumnsBody(
      extractWithNunjucksTag(sectionInner, "twoColumns"),
    );

    return {
      header,
      footer,
      itemLeft: twoColumns?.itemLeft,
      itemRight: twoColumns?.itemRight,
      layoutOptions: twoColumns?.layoutOptions || {},
      class: twoColumns?.class,
      sectionWrapper: parseSectionWrapper(sectionAttributes),
    };
  },
  toBlock: function (data) {
    const { headerContent, footerContent } = buildSectionHeaderFooterMarkup({
      header: data?.header,
      footer: data?.footer,
    });

    const twoColumnsContent = buildTwoColumnsBody({
      class: data?.class,
      layoutOptions: data?.layoutOptions,
      itemLeft: data?.itemLeft,
      itemRight: data?.itemRight,
    });

    const sectionAttrsStr = buildSectionWrapperString(data?.sectionWrapper);

    return `{% sectionTwoColumns ${sectionAttrsStr} %}
${headerContent}
${twoColumnsContent}
${footerContent}
{% endsectionTwoColumns %}`;
  },
  toPreview: (data) => {
    const { headerContent, footerContent } =
      buildSectionHeaderFooterMarkupPreview({
        header: data?.header,
        footer: data?.footer,
      });

    const areaContent = buildBodyPreview({
      items: [data?.itemLeft, data?.itemRight],
    });

    return `<section class="section-two-columns" style="${SECTION_WRAPPER_STYLE}">
<small style="float:right;">Two Columns</small>

${headerContent}

${areaContent}

${footerContent}

</section>
`;
  },
};

export const sectionReel = {
  id: "sectionReel",
  label: "Section > Reel",
  // icon: "view_week",
  icon: "flex_no_wrap",
  fields: [
    sectionHeaderField("sectionReel"),
    {
      name: "items",
      label: "Reel Items",
      widget: "list",
      required: true,
      default: [{ content: "" }, { content: "" }],
      summary: "{{item | truncate(50)}}",
      fields: [
        {
          name: "content",
          label: "Reel Item Content",
          widget: "richtext",
          required: false,
          // editor_components: ec("sectionReel"),
        },
        {
          name: "class",
          label: "Reel Item Classes",
          widget: "string",
          required: false,
        },
        {
          name: "attributes",
          label: "Reel Item Raw Attributes",
          widget: "hidden",
          required: false,
        },
      ],
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
    sectionFooterField("sectionReel"),
    sectionWrapperField,
  ],
  pattern:
    /^{%\s*sectionReel\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionReel\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    const { header, footer } = parseSectionHeaderFooter(sectionInner);
    const reel = parseReelBody(extractWithNunjucksTag(sectionInner, "reel"));

    return {
      header,
      footer,
      items: reel?.items || [],
      layoutOptions: reel?.layoutOptions || {},
      class: reel?.class,
      sectionWrapper: parseSectionWrapper(sectionAttributes),
    };
  },
  toBlock: function (data) {
    const { headerContent, footerContent } = buildSectionHeaderFooterMarkup({
      header: data?.header,
      footer: data?.footer,
    });

    const reelContent = buildReelBody({
      class: data?.class,
      layoutOptions: data?.layoutOptions,
      items: data?.items,
    });

    const sectionAttrsStr = buildSectionWrapperString(data?.sectionWrapper);

    return `{% sectionReel ${sectionAttrsStr} %}
${headerContent}
${reelContent}
${footerContent}
{% endsectionReel %}`;
  },
  toPreview: (data) => {
    const { headerContent, footerContent } =
      buildSectionHeaderFooterMarkupPreview({
        header: data?.header,
        footer: data?.footer,
      });

    const areaContent = buildBodyPreview({ items: data?.items });

    return `<section class="section-reel" style="${SECTION_WRAPPER_STYLE}">
<small style="float:right;">Reel</small>

${headerContent}

${areaContent}

${footerContent}

</section>
`;
  },
};

export const sectionCollection = {
  id: "sectionCollection",
  label: "Section > Collection List",
  icon: "bookmark_stacks",
  fields: [
    sectionHeaderField("sectionCollection"),
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
      i18n: true,
      fields: [
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
            {
              name: "random",
              label: "Randomize",
              collapsed: true,
              fields: [],
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
              summary: "{{value}}", // TODO: understand why this is not working
              fields: [
                {
                  name: "value",
                  label: "Tag Name",
                  hint: "Tags must first exist in [Data Files > Translated Data](/admin/#/collections/dataFiles/entries/translatedData)",
                  widget: "relation",
                  collection: "dataFiles",
                  file: "translatedData",
                  value_field: "tagsList.*.slug",
                  display_fields: ["tagsList.*.label"],
                  required: true,
                  multiple: true,
                },
              ],
            },
            {
              name: "name",
              label: "Filter by Name",
              fields: [
                {
                  name: "value",
                  label: "Name matches",
                  hint: "Case-insensitive, partial match. Provide one or more values; an item matches if any value is found in its name.",
                  widget: "list",
                  allow_add: true,
                  required: true,
                  field: {
                    name: "value",
                    label: "Value",
                    widget: "string",
                  },
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
      ],
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
    {
      name: "itemPartial",
      label: "Item Partial",
      hint: "Select a custom partial to be used to display items",
      widget: "relation",
      collection: "htmlPartials",
      required: false,
      value_field: "{{slug}}",
    },
    {
      name: "itemTemplate",
      label: "Item Template (raw)",
      widget: "hidden",
      // widget: "richtext",
      // editor_components: ec("sectionCollection"),
      required: false,
      i18n: true,
    },
    {
      name: "attributes",
      label: "Collection Raw Attributes",
      widget: "hidden",
      required: false,
      i18n: true,
    },
    sectionFooterField("sectionCollection"),
    sectionWrapperField,
  ],
  pattern:
    /^{%\s*sectionCollection\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionCollection\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    const { header, footer } = parseSectionHeaderFooter(sectionInner);

    const collection = extractWithNunjucksTag(sectionInner, "collection");
    const parsed = parseCollectionBody({
      attributes: collection?.attributes,
      content: collection?.content,
    });

    return {
      header,
      footer,
      collection: parsed?.collection,
      sortAndFilterOptions: parsed?.sortAndFilterOptions,
      layoutOptions: parsed?.layoutOptions,
      class: parsed?.class,
      itemPartial: parsed?.itemPartial,
      itemTemplate: parsed?.itemTemplate,
      attributes: parsed?.attributes,
      sectionWrapper: parseSectionWrapper(sectionAttributes),
    };
  },
  toBlock: function (data) {
    const { headerContent, footerContent } = buildSectionHeaderFooterMarkup({
      header: data?.header,
      footer: data?.footer,
    });

    const collectionContent = buildCollectionBody({
      collection: data?.collection,
      sortAndFilterOptions: data?.sortAndFilterOptions,
      class: data?.class,
      itemPartial: data?.itemPartial,
      itemTemplate: data?.itemTemplate,
      layoutOptions: data?.layoutOptions,
      attributes: data?.attributes,
    });

    const sectionAttrsStr = buildSectionWrapperString(data?.sectionWrapper);

    return `{% sectionCollection ${sectionAttrsStr} %}
${headerContent}
${collectionContent}
${footerContent}
{% endsectionCollection %}`;
  },
  toPreview: (data) => `<span>COLLECTION SECTION</span>`,
};

export const sectionBuilder = {
  id: "sectionBuilder",
  label: "Section > Builder",
  icon: "brick",
  fields: [
    sectionHeaderField("sectionBuilder"),
    {
      name: "areas",
      label: "Areas",
      label_singular: "Area",
      widget: "list",
      required: false,
      collapsed: false,
      hint: "Select a pre-defined section type or use one of your custom section layouts (selectable in 'Advanced' bellow)",
      types: [
        {
          name: "areaRaw",
          label: "Raw content",
          fields: [
            {
              name: "content",
              label: "Content",
              widget: "richtext",
            },
            {
              name: "class",
              label: "Area Classes",
              widget: "string",
              required: false,
            },
            {
              name: "attributes",
              label: "Area Raw Attributes",
              widget: "hidden",
              required: false,
            },
          ],
        },
        {
          name: "twoColumns",
          label: "Two Columns",
          fields: [
            {
              name: "itemLeft",
              label: "Column Left",
              widget: "object",
              required: true,
              i18n: true,
              summary: "{{content | truncate(50)}}",
              // collapsed: true,
              fields: [
                {
                  name: "content",
                  label: "Column Left Content",
                  widget: "richtext",
                  required: false,
                  editor_components: ec("sectionBuilder"),
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
              i18n: true,
              summary: "{{content | truncate(50)}}",
              // collapsed: true,
              fields: [
                {
                  name: "content",
                  label: "Column Right Content",
                  widget: "richtext",
                  required: false,
                  editor_components: ec("sectionBuilder"),
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
            {
              name: "class",
              label: "Area Classes",
              widget: "string",
              required: false,
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
              name: "attributes",
              label: "Area Raw Attributes",
              widget: "hidden",
              required: false,
            },
          ],
        },
        {
          name: "grid",
          label: "Grid",
          fields: [
            {
              name: "items",
              label: "Grid Items",
              label_singular: "Grid Item",
              widget: "list",
              required: true,
              collapsed: true,
              default: [{ content: "" }, { content: "" }, { content: "" }],
              summary: "{{content | truncate(50)}}",
              fields: [
                {
                  name: "content",
                  label: "Item Content",
                  widget: "richtext",
                  required: false,
                  editor_components: ec("sectionBuilder"),
                },
                {
                  name: "class",
                  label: "Item Classes",
                  widget: "string",
                  required: false,
                },
                {
                  name: "attributes",
                  label: "Item Raw Attributes",
                  widget: "hidden",
                  required: false,
                },
              ],
            },
            {
              name: "class",
              label: "Area Classes",
              widget: "string",
              required: false,
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
              name: "attributes",
              label: "Area Raw Attributes",
              widget: "hidden",
              required: false,
            },
          ],
        },
        {
          name: "collection",
          label: "Collection",
          fields: [
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
              i18n: true,
              fields: [
                {
                  name: "sortCriterias",
                  label: "Sorting rules to apply on the Collection",
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
                  ],
                },
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
                          display_fields: ["tagsList.*.label"],
                          required: true,
                          multiple: true,
                        },
                      ],
                    },
                    {
                      name: "name",
                      label: "Filter by Name",
                      fields: [
                        {
                          name: "value",
                          label: "Name matches",
                          hint: "Case-insensitive, partial match. Provide one or more values; an item matches if any value is found in its name.",
                          widget: "list",
                          allow_add: true,
                          required: true,
                          field: {
                            name: "value",
                            label: "Value",
                            widget: "string",
                          },
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
              ],
            },
            {
              name: "class",
              label: "Area Classes",
              widget: "string",
              required: false,
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
              name: "itemPartial",
              label: "Item Partial",
              hint: "Select a custom partial to be used to display items",
              widget: "relation",
              collection: "htmlPartials",
              required: false,
              value_field: "{{slug}}",
            },
            {
              name: "attributes",
              label: "Area Raw Attributes",
              widget: "hidden",
              required: false,
            },
          ],
        },
        {
          name: "flow",
          label: "Flow",
          fields: [
            {
              name: "items",
              label: "Flow Items",
              label_singular: "Flow Item",
              widget: "list",
              required: true,
              collapsed: false,
              summary: "{{content | truncate(50)}}",
              default: [{ content: "" }, { content: "" }],
              fields: [
                {
                  name: "content",
                  label: "Item Content",
                  widget: "richtext",
                  required: false,
                  editor_components: ec("sectionBuilder"),
                },
                {
                  name: "class",
                  label: "Item Classes",
                  widget: "string",
                  required: false,
                },
                {
                  name: "attributes",
                  label: "Item Raw Attributes",
                  widget: "hidden",
                  required: false,
                },
              ],
            },
            {
              name: "class",
              label: "Area Classes",
              widget: "string",
              required: false,
            },
            {
              name: "layoutOptions",
              label: "Layout Options",
              hint: "Manually select a layout and related options",
              widget: "object",
              required: false,
              collapsed: true,
              i18n: true,
              types: [layoutTypeFlow, layoutTypeNone],
            },
            {
              name: "attributes",
              label: "Area Raw Attributes",
              widget: "hidden",
              required: false,
            },
          ],
        },
        {
          name: "reel",
          label: "Reel",
          fields: [
            {
              name: "items",
              label: "Reel Items",
              label_singular: "Reel Item",
              widget: "list",
              required: true,
              collapsed: false,
              summary: "{{content | truncate(50)}}",
              default: [{ content: "" }, { content: "" }],
              fields: [
                {
                  name: "content",
                  label: "Item Content",
                  widget: "richtext",
                  required: false,
                  editor_components: ec("sectionBuilder"),
                },
                {
                  name: "class",
                  label: "Item Classes",
                  widget: "string",
                  required: false,
                },
                {
                  name: "attributes",
                  label: "Item Raw Attributes",
                  widget: "hidden",
                  required: false,
                },
              ],
            },
            {
              name: "class",
              label: "Area Classes",
              widget: "string",
              required: false,
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
              name: "attributes",
              label: "Area Raw Attributes",
              widget: "hidden",
              required: false,
            },
          ],
        },
        // {
        //   name: "cover",
        //   label: "Cover: Fixed height section with optional padding",
        //   widget: "object",
        //   required: false,
        //   i18n: true,
        //   fields: [
        //     {
        //       name: "minHeight",
        //       label: "Min Height",
        //       widget: "string",
        //       hint: "The minimum height of the cover (e.g. 100svh [default], 30rem, 800px)",
        //       required: false,
        //     },
        //     {
        //       name: "noPadding",
        //       label: "Remove Default Padding",
        //       widget: "boolean",
        //       required: false,
        //     },
        //     {
        //       name: "gap",
        //       label: "Gap",
        //       widget: "string",
        //       hint: "The gap between blocks (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
        //       required: false,
        //     },
        //     {
        //       name: "class",
        //       label: "Class Names",
        //       widget: "string",
        //       hint: "Additional class names to add to the section (e.g. 'my-class another-class')",
        //       required: false,
        //     },
        //   ],
        // },
        // {
        //   name: "custom",
        //   label: "Custom: Use your own Section Layout",
        //   widget: "object",
        //   required: false,
        //   i18n: true,
        //   fields: [],
        // },
      ],
    },
    sectionFooterField("sectionBuilder"),
    sectionWrapperField,
  ],
  pattern:
    /^{%\s*sectionBuilder\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsectionBuilder\s*%}$/gm,
  fromBlock: function (match) {
    const sectionAttributes = match[1];
    const sectionInner = match[2];

    const { header, footer } = parseSectionHeaderFooter(sectionInner);

    // Extract all areas with their attributes.
    // Note: `extractAllSectionAreaDataMultipleTags` already pulls `class` out of
    // `area.attributes` into `area.class`. We preserve that behaviour.
    const areas = extractAllSectionAreaDataMultipleTags(sectionInner || "", [
      "area",
      "areaRaw",
      "twoColumns",
      "grid",
      "collection",
      "flow",
      "reel",
    ]);

    // Enrich complex area types with structured data.
    const processedAreas = areas.map((area) => {
      if (area.tagName === "twoColumns") {
        const parsed = parseTwoColumnsBody({
          attributes: area.attributes,
          content: area.content,
        });

        return {
          type: "twoColumns",
          class: area.class || parsed?.class,
          layoutOptions: parsed?.layoutOptions || {},
          attributes: parsed?.attributes,
          itemLeft: parsed?.itemLeft,
          itemRight: parsed?.itemRight,
        };
      }
      if (area.tagName === "grid") {
        const parsed = parseGridBody({
          attributes: area.attributes,
          content: area.content,
        });
        return {
          type: "grid",
          class: area.class || parsed?.class,
          layoutOptions: parsed?.layoutOptions || {},
          attributes: parsed?.attributes,
          items: parsed?.items || [],
        };
      }
      if (area.tagName === "collection") {
        const parsed = parseCollectionBody({
          attributes: area.attributes,
          content: area.content,
        });
        return {
          type: "collection",
          class: area.class || parsed?.class,
          layoutOptions: parsed?.layoutOptions || {},
          attributes: parsed?.attributes,
          collection: parsed?.collection,
          sortAndFilterOptions: parsed?.sortAndFilterOptions,
          itemPartial: parsed?.itemPartial,
        };
      }
      if (area.tagName === "flow") {
        const parsed = parseFlowBody(
          extractWithNunjucksTag(sectionInner, "flow"),
        );
        return {
          type: "flow",
          class: area.class || parsed?.class,
          layoutOptions: parsed?.layoutOptions || {},
          attributes: parsed?.attributes,
          items: parsed?.items || [],
        };
      }
      if (area.tagName === "reel") {
        const parsed = parseReelBody(
          extractWithNunjucksTag(sectionInner, "reel"),
        );
        return {
          type: "reel",
          class: area.class || parsed?.class,
          layoutOptions: parsed?.layoutOptions || {},
          attributes: parsed?.attributes,
          items: parsed?.items || [],
        };
      }
      // `area` and `areaRaw`: map `tagName` (parser output) onto `type`
      // (the sectionBuilder areas-list discriminator expected by Decap).
      if (area.tagName === "area" || area.tagName === "areaRaw") {
        return {
          type: area.tagName,
          class: area.class || undefined,
          attributes: area.attributes || undefined,
          content: area.content,
        };
      }
      return area;
    });

    return {
      header,
      footer,
      areas: processedAreas,
      sectionWrapper: parseSectionWrapper(sectionAttributes),
    };
  },
  toBlock: function (data) {
    const { headerContent, footerContent } = buildSectionHeaderFooterMarkup({
      header: data?.header,
      footer: data?.footer,
    });

    const areasStr = data?.areas?.length
      ? data.areas
          .map((area) => {
            switch (area.type) {
              case "twoColumns":
                return buildTwoColumnsBody({
                  class: area.class,
                  layoutOptions: area.layoutOptions,
                  attributes: area.attributes,
                  itemLeft: area.itemLeft,
                  itemRight: area.itemRight,
                });

              case "grid":
                return buildGridBody({
                  class: area.class,
                  layoutOptions: area.layoutOptions,
                  attributes: area.attributes,
                  items: area.items,
                });

              case "collection":
                return buildCollectionBody({
                  collection: area.collection,
                  sortAndFilterOptions: area.sortAndFilterOptions,
                  class: area.class,
                  layoutOptions: area.layoutOptions,
                  attributes: area.attributes,
                  itemPartial: area.itemPartial,
                });

              case "flow":
                return buildFlowBody({
                  class: area.class,
                  layoutOptions: area.layoutOptions,
                  attributes: area.attributes,
                  items: area.items,
                });

              case "reel":
                return buildReelBody({
                  class: area.class,
                  layoutOptions: area.layoutOptions,
                  attributes: area.attributes,
                  items: area.items,
                });

              case "areaRaw": {
                if (!area.content) return "";
                const areaAttrs = njkAttrsStringFromSectionAreaData(area);
                return `{% areaRaw ${areaAttrs} %}
${area.content}
{% endareaRaw %}`;
              }

              case "area":
              default: {
                if (!area.content) return "";
                const areaAttrs = njkAttrsStringFromSectionAreaData(area);
                return `{% area ${areaAttrs} %}
${area.content}
{% endarea %}`;
              }
            }
          })
          .filter(Boolean)
          .join("\n")
      : "";

    const sectionAttrsStr = buildSectionWrapperString(data?.sectionWrapper);

    return `{% sectionBuilder ${sectionAttrsStr} %}
${headerContent}
${areasStr}
${footerContent}
{% endsectionBuilder %}`;
  },
  toPreview: (data) => {
    const { headerContent, footerContent } =
      buildSectionHeaderFooterMarkupPreview({
        header: data?.header,
        footer: data?.footer,
      });

    let itemStr = "";
    const wrapItemStr = ({ itemStr: str, label }) => `<div>
<small style="float:right;clear:both;margin-right:.5rem;">${label}</small>

${str}
</div>`;

    const areasStr = data?.areas?.length
      ? data.areas
          .map((area) => {
            switch (area.type) {
              case "twoColumns":
                itemStr = buildBodyPreview({
                  items: [area.itemLeft, area.itemRight],
                });
                return wrapItemStr({ itemStr, label: "Two Columns" });

              case "grid":
                itemStr = buildBodyPreview({ items: area?.items });
                return wrapItemStr({ itemStr, label: "Grid" });

              case "collection":
                itemStr = "<COLLECTION>";
                return wrapItemStr({ itemStr, label: "Collection" });

              case "flow":
                itemStr = buildBodyPreview({ items: area?.items });
                return wrapItemStr({ itemStr, label: "Flow" });

              case "reel":
                itemStr = buildBodyPreview({ items: area?.items });
                return wrapItemStr({ itemStr, label: "Reel" });

              case "areaRaw":
              case "area":
              default: {
                if (!area.content) return "";
                itemStr = buildBodyPreview({ items: [area] });
                return wrapItemStr({ itemStr, label: "Raw" });
              }
            }
          })
          .filter(Boolean)
          .join("\n")
      : "";

    // const areaContent = buildBodyPreview({ items: data?.items });

    return `<section class="section-builder" style="${SECTION_WRAPPER_STYLE}">
<small style="float:right;">Builder</small>

${headerContent}

${areasStr}

${footerContent}

</section>
`;
  },
};

export const sections = {
  id: "sections",
  label: "Sections",
  icon: "open_jam",
  fields: [],
  pattern:
    /^{%\s*sections\s*([^>]*?)\s*%}\s*([\S\s]*?)\s*{%\s*endsections\s*%}$/gm,
  fromBlock: function (match) {
    return {};
  },
  toBlock: function (data) {
    return `{% sections %}{% endsections %}`;
  },
  toPreview: (data) => `<span>SECTIONS</span>`,
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
//       widget: "richtext",
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
