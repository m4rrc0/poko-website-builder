// Reusable CMS field primitives shared by section types declared in
// `sectionsField.types` (this folder's `index.js`).
//
// IMPORTANT: These shapes are intentionally aligned with the inline editor
// components in `src/content-static/admin/defaultEditorComponents.js` so that
// inline (`{% sectionGrid %}…{% endsectionGrid %}`) and structured
// (frontmatter `sections:`) authoring produce the same HTML. When updating a
// shape here, update its counterpart there as well. A future step will emit
// this module to `/admin/section-primitives.js` (via `addTemplate`) so the
// admin file can import directly — eliminating the manual mirror.

// ---- Section header / footer / wrapper -----------------------------------

export const sectionHeaderField = {
  name: "header",
  label: "Section Header",
  widget: "object",
  required: false,
  i18n: true,
  summary: "{{content | truncate(50)}}",
  fields: [
    {
      name: "content",
      label: "Header Content",
      widget: "markdown",
      required: false,
      i18n: true,
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
};

export const sectionFooterField = {
  name: "footer",
  label: "Section Footer",
  widget: "object",
  required: false,
  i18n: true,
  summary: "{{content | truncate(50)}}",
  fields: [
    {
      name: "content",
      label: "Footer Content",
      widget: "markdown",
      required: false,
      i18n: true,
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
};

export const sectionWrapperField = {
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

// ---- Layout-option "types" (tagged union variants under `layoutOptions`) --

export const layoutTypeNone = {
  name: "layout-none",
  label: "No Layout",
  required: false,
  fields: [],
};

export const layoutTypeSwitcher = {
  name: "switcher",
  label: "Switcher (Symmetrical Columns)",
  required: false,
  fields: [
    {
      name: "widthWrap",
      label: "Width Wrap",
      widget: "string",
      required: false,
    },
    { name: "gap", label: "Gap", widget: "string", required: false },
  ],
};

export const layoutTypeGridFluid = {
  name: "grid-fluid",
  label: "Fluid Grid",
  required: false,
  fields: [
    { name: "columns", label: "Columns", widget: "number", required: false },
    { name: "gap", label: "Gap", widget: "string", required: false },
  ],
};

export const layoutTypeCluster = {
  name: "cluster",
  label: "Cluster",
  collapsed: true,
  fields: [{ name: "gap", label: "Gap", widget: "string", required: false }],
};

export const layoutTypeFixedFluid = {
  name: "fixedFluid",
  label: "Fixed-Fluid (Asymmetrical Columns)",
  collapsed: true,
  fields: [
    {
      name: "fixedSide",
      label: "Small Column Side",
      widget: "select",
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
      required: false,
    },
    {
      name: "widthFluidMin",
      label: "Wide Column Min Width",
      widget: "string",
      required: false,
    },
    { name: "gap", label: "Gap", widget: "string", required: false },
  ],
};

export const layoutTypeFlow = {
  name: "flow",
  label: "Flow",
  collapsed: true,
  fields: [{ name: "gap", label: "Gap", widget: "string", required: false }],
};

export const layoutTypeReel = {
  name: "reel",
  label: "Reel",
  collapsed: true,
  fields: [
    {
      name: "itemWidth",
      label: "Item Width",
      widget: "string",
      required: false,
    },
    { name: "height", label: "Height", widget: "string", required: false },
    { name: "gap", label: "Gap", widget: "string", required: false },
    {
      name: "noBar",
      label: "Hide Scrollbar",
      widget: "boolean",
      default: false,
      required: false,
    },
  ],
};

// Single-variant tagged union used by sectionFlow (gap-only).
export const layoutTypeFlowGap = {
  name: "gap",
  label: "Gap",
  fields: [
    {
      name: "gap",
      label: "Gap",
      widget: "string",
      hint: "The gap between flow items (e.g. 1em [default], var(--step-2) [fluid type scale], 0 [no gap])",
      default: "1em",
      required: false,
    },
  ],
};

// ---- Item-object field factories -----------------------------------------

export const gridItemFields = [
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
];

export const reelItemFields = [
  {
    name: "content",
    label: "Reel Item Content",
    widget: "markdown",
    required: false,
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
];

export const flowItemFields = [
  {
    name: "content",
    label: "Flow Item Content",
    widget: "markdown",
    required: false,
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
];

// ---- Collection-section building blocks ----------------------------------

/**
 * Build the "collection" select field used by sectionCollection (and
 * sectionBuilder's collection area). The caller is responsible for supplying
 * the dynamic per-project collection options (typically derived from the
 * project's COLLECTIONS map and `selectedCollections`).
 *
 * @param {Array<{value: string, label: string}>} extraOptions
 */
export const collectionSelectField = (extraOptions = []) => ({
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
    ...extraOptions,
  ],
});

/**
 * Sort & filter object used by collection-shaped fields. Mirrors the inline
 * editor's exact shape so frontmatter and inline modes round-trip identically.
 */
export const sortAndFilterOptionsField = {
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
        { name: "random", label: "Randomize", collapsed: true, fields: [] },
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
          summary: "{{value}}",
          fields: [
            {
              name: "value",
              label: "Tag Name",
              hint: "Tags must first exist in [Data Files > Translated Data](/admin/#/collections/dataFiles/entries/translatedData)",
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
              field: { name: "value", label: "Value", widget: "string" },
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
      hint: "When enabled, the defined filters will exclude items instead of including them.",
    },
  ],
};

export const itemPartialField = {
  name: "itemPartial",
  label: "Item Partial",
  hint: "Select a custom partial to be used to display items",
  widget: "relation",
  collection: "htmlPartials",
  required: false,
  value_field: "{{slug}}",
};

/**
 * Column object used by sectionTwoColumns (itemLeft / itemRight).
 * @param {"Left"|"Right"} side
 */
export const twoColumnsItemFields = (side) => [
  {
    name: "content",
    label: `Column ${side} Content`,
    widget: "markdown",
    required: false,
  },
  {
    name: "class",
    label: `Column ${side} Classes`,
    widget: "string",
    required: false,
  },
  {
    name: "attributes",
    label: `Column ${side} Raw Attributes`,
    widget: "hidden",
    required: false,
  },
];

// ---- sectionBuilder area variants ----------------------------------------
//
// `areas` is a tagged union list. Each variant is an "inner-layout" — i.e.
// the body equivalent of a top-level section type minus the section header
// and footer. Per-area `class`/`attributes` apply to the inner layout
// element, not the outer section wrapper (that lives once at the
// sectionBuilder level via `sectionWrapperField`).

export const areaRawAreaFields = [
  // The inline editor authors `content` as `richtext` (HTML). In frontmatter
  // mode authors can supply either pre-rendered HTML or markdown — the
  // matching partial (`_areaRaw`) just wraps the value as-is, so consistency
  // with inline mode is the author's responsibility.
  { name: "content", label: "Content", widget: "richtext" },
  { name: "class", label: "Area Classes", widget: "string", required: false },
  {
    name: "attributes",
    label: "Area Raw Attributes",
    widget: "hidden",
    required: false,
  },
];

export const twoColumnsAreaFields = [
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
  { name: "class", label: "Area Classes", widget: "string", required: false },
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
];

export const gridAreaFields = [
  {
    name: "items",
    label: "Grid Items",
    label_singular: "Grid Item",
    widget: "list",
    required: true,
    collapsed: true,
    default: [{ content: "" }, { content: "" }, { content: "" }],
    summary: "{{content | truncate(50)}}",
    fields: gridItemFields,
  },
  { name: "class", label: "Area Classes", widget: "string", required: false },
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
];

export const flowAreaFields = [
  {
    name: "items",
    label: "Flow Items",
    label_singular: "Flow Item",
    widget: "list",
    required: true,
    collapsed: false,
    summary: "{{content | truncate(50)}}",
    default: [{ content: "" }, { content: "" }],
    fields: flowItemFields,
  },
  { name: "class", label: "Area Classes", widget: "string", required: false },
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
];

export const reelAreaFields = [
  {
    name: "items",
    label: "Reel Items",
    label_singular: "Reel Item",
    widget: "list",
    required: true,
    collapsed: false,
    summary: "{{content | truncate(50)}}",
    default: [{ content: "" }, { content: "" }],
    fields: reelItemFields,
  },
  { name: "class", label: "Area Classes", widget: "string", required: false },
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
];

/**
 * Build the collection-area fields. Takes the same `extraOptions` array as
 * `collectionSelectField`.
 */
export const collectionAreaFields = (extraOptions = []) => [
  collectionSelectField(extraOptions),
  sortAndFilterOptionsField,
  { name: "class", label: "Area Classes", widget: "string", required: false },
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
  itemPartialField,
  {
    name: "attributes",
    label: "Area Raw Attributes",
    widget: "hidden",
    required: false,
  },
];

/**
 * Build the full `areas` list field used by sectionBuilder. Aggregates the
 * six area-type variants into a single tagged-union list. The caller passes
 * the `collectionExtraOptions` for the collection area's select widget.
 */
export const buildAreasField = (collectionExtraOptions = []) => ({
  name: "areas",
  label: "Areas",
  label_singular: "Area",
  widget: "list",
  required: false,
  collapsed: false,
  hint: "Select a pre-defined section type or use one of your custom section layouts",
  types: [
    { name: "areaRaw", label: "Raw content", fields: areaRawAreaFields },
    { name: "twoColumns", label: "Two Columns", fields: twoColumnsAreaFields },
    { name: "grid", label: "Grid", fields: gridAreaFields },
    {
      name: "collection",
      label: "Collection",
      fields: collectionAreaFields(collectionExtraOptions),
    },
    { name: "flow", label: "Flow", fields: flowAreaFields },
    { name: "reel", label: "Reel", fields: reelAreaFields },
  ],
});
