// Shared rendering logic for the structured ("data-driven") section types
// dispatched by the `sections` shortcode. Mirrors the canonical CMS schema
// (header/items/footer/sectionWrapper) so frontmatter authoring produces the
// same HTML as the inline editor-component shortcodes.
//
// Each section partial stays thin: it provides the outer wrapper class and an
// `renderInner` callback that knows how to render the layout body (items list,
// column pair, etc.).

// All exported helpers below are designed to be invoked with `.call(this,
// …)` from inside an 11ty.js partial — exactly like 11ty itself does for
// shortcodes/filters. That keeps the original render context (`this`)
// flowing through every nested partial call without the helpers having to
// know what's on it. Callers can therefore reach `this.page`, `this.partial`,
// `this.renderTemplate`, etc. inside any `renderInner` callback.
//
// What `this` does NOT carry is the data cascade: inside an 11ty.js partial
// `this.ctx` is undefined (Eleventy augments the instance with `page`/
// `eleventy` only). The cascade travels through the reserved `__cascade` prop
// instead — injected by `renderPartial` (plugins/partials/index.js) into every
// partial's data, and threaded on by the helpers below as their `cascade`
// option. Every nested string render must receive it, otherwise shortcodes
// like `link` lose `collections` / `globalSettings` and throw.
//
// Layering rule: always `{ ...cascade, ...localProps }`, so the more specific
// value wins (e.g. a collection item's own data beats the page's).

// Emitted by the `_collection` partial when the filtered collection is empty
// and no `keepVisible` option was set. It lets the enclosing section detect the
// emptiness even in inline mode, where the section body (header + `{% collection
// %}` + footer) reaches `_sectionCollection` already rendered as a single HTML
// string. Consumers strip it (or drop their whole output).
export const COLLECTION_EMPTY_MARKER = "<!--poko:collection-empty-->";

/**
 * Must be invoked as `renderStructuredSection.call(this, data, opts)`.
 *
 * @this  {object}  the 11ty.js partial render context.
 * @param {object}  data  the full section object forwarded by the dispatcher.
 * @param {object}  opts
 * @param {string}  opts.outerClass  CSS class applied to the outer
 *   `<section>` element (e.g. "section-grid").
 * @param {(this: object, data: object) => Promise<string>} opts.renderInner
 *   returns the HTML between the header and the footer. Called with the
 *   partial's `this` so it can use `this.partial`, `this.ctx`, etc. directly.
 */
export async function renderStructuredSection(data, opts) {
  const cascade = data?.__cascade ?? {};
  const renderMarkdown = (src) =>
    src
      ? this.renderTemplate.call(this, src, "njk,md", { ...cascade })
      : Promise.resolve("");

  const {
    // Legacy / inline: pre-rendered HTML wrapped as-is.
    content,
    // Structured fields (canonical CMS shape).
    header,
    footer,
    sectionWrapper,
    // Wrapper fallbacks (in case caller passes flat class/tag).
    class: flatClass,
    tag,
  } = data || {};

  let innerContent = content;

  if (!innerContent) {
    const parts = [];

    if (header?.content) {
      const html = await renderMarkdown(header.content);
      parts.push(
        await this.partial.call(this, "_sectionHeader", {
          __cascade: cascade,
          content: html,
          class: header.class,
        }),
      );
    }

    const inner = await opts.renderInner.call(this, data);
    if (inner) parts.push(inner);

    if (footer?.content) {
      const html = await renderMarkdown(footer.content);
      parts.push(
        await this.partial.call(this, "_sectionFooter", {
          __cascade: cascade,
          content: html,
          class: footer.class,
        }),
      );
    }

    innerContent = parts.join("\n");
  }

  const wrapperClass = sectionWrapper?.class ?? flatClass ?? "";
  const wrapperAttrs = sectionWrapper?.attributes
    ? ` ${sectionWrapper.attributes}`
    : "";

  return `<${tag || "section"} class="${opts.outerClass} ${wrapperClass}"${wrapperAttrs}>
${innerContent || ""}
</${tag || "section"}>`;
}

/**
 * Render an items list (used by grid / flow / reel-style sections). Each item
 * is rendered via `itemPartial`, then collected into a single body wrapped by
 * `wrapperPartial` (the inner layout element, e.g. `_grid`).
 *
 * Returns "" if the list is empty so callers can chain it directly.
 *
 * Must be invoked as `renderItemsListInner.call(this, { … })`.
 */
export async function renderItemsListInner({
  items,
  itemPartial,
  wrapperPartial,
  wrapperProps,
  cascade = {},
}) {
  if (!Array.isArray(items) || items.length === 0) return "";

  const renderMarkdown = (src) =>
    src
      ? this.renderTemplate.call(this, src, "njk,md", { ...cascade })
      : Promise.resolve("");

  const itemsHtml = (
    await Promise.all(
      items.map(async (item) => {
        const html = await renderMarkdown(item?.content);
        return await this.partial.call(this, itemPartial, {
          __cascade: cascade,
          content: html,
          class: item?.class,
        });
      }),
    )
  ).join("\n");

  return await this.partial.call(this, wrapperPartial, {
    __cascade: cascade,
    content: itemsHtml,
    ...(wrapperProps || {}),
  });
}

/**
 * Render the `areas` list used by sectionBuilder. Each area is a tagged
 * union; this dispatches each variant to the matching inner-layout partial
 * (no per-area header/footer — those live once on the outer section).
 *
 * Supported area types: areaRaw, area (legacy parser-only), twoColumns,
 * grid, flow, reel, collection.
 */
export async function renderAreasInner({
  areas,
  collections,
  lang,
  cascade = {},
}) {
  if (!Array.isArray(areas) || areas.length === 0) return "";

  const self = this;
  const renderMarkdown = (src) =>
    src
      ? self.renderTemplate.call(self, src, "njk,md", { ...cascade })
      : Promise.resolve("");

  const rendered = await Promise.all(
    areas.map(async (area) => {
      switch (area?.type) {
        case "areaRaw":
        case "area": {
          const partialName = area.type === "areaRaw" ? "_areaRaw" : "_area";
          const html = await renderMarkdown(area.content);
          return await self.partial.call(self, partialName, {
            __cascade: cascade,
            content: html,
            class: area.class,
          });
        }

        case "twoColumns":
          return await renderColumnsPairInner.call(self, {
            cascade,
            itemLeft: area.itemLeft,
            itemRight: area.itemRight,
            itemPartial: "_twoColumnsItem",
            wrapperPartial: "_twoColumns",
            wrapperProps: {
              type: area.layoutOptions?.type,
              gap: area.layoutOptions?.gap,
              widthWrap: area.layoutOptions?.widthWrap,
              fixedSide: area.layoutOptions?.fixedSide,
              widthFixed: area.layoutOptions?.widthFixed,
              widthFluidMin: area.layoutOptions?.widthFluidMin,
              class: area.class,
            },
          });

        case "grid":
          return await renderItemsListInner.call(self, {
            cascade,
            items: area.items,
            itemPartial: "_gridItem",
            wrapperPartial: "_grid",
            wrapperProps: {
              type: area.layoutOptions?.type,
              gap: area.layoutOptions?.gap,
              widthWrap: area.layoutOptions?.widthWrap,
              columns: area.layoutOptions?.columns,
              class: area.class,
            },
          });

        case "flow":
          return await renderItemsListInner.call(self, {
            cascade,
            items: area.items,
            itemPartial: "_flowItem",
            wrapperPartial: "_flow",
            wrapperProps: {
              gap: area.layoutOptions?.gap,
              class: area.class,
            },
          });

        case "reel":
          return await renderItemsListInner.call(self, {
            cascade,
            items: area.items,
            itemPartial: "_reelItem",
            wrapperPartial: "_reel",
            wrapperProps: {
              type: area.layoutOptions?.type,
              gap: area.layoutOptions?.gap,
              itemWidth: area.layoutOptions?.itemWidth,
              height: area.layoutOptions?.height,
              noBar: area.layoutOptions?.noBar,
              class: area.class,
            },
          });

        case "collection": {
          const html = await self.partial.call(self, "_collection", {
            __cascade: cascade,
            collections,
            lang,
            collection: area.collection,
            sortCriterias: area.sortAndFilterOptions?.sortCriterias,
            filters: area.sortAndFilterOptions?.filters,
            exclusions: area.sortAndFilterOptions?.exclusions,
            keepVisible: area.sortAndFilterOptions?.keepVisible,
            type: area.layoutOptions?.type,
            gap: area.layoutOptions?.gap,
            widthWrap: area.layoutOptions?.widthWrap,
            columns: area.layoutOptions?.columns,
            widthColumnMin: area.layoutOptions?.widthColumnMin,
            widthColumnMax: area.layoutOptions?.widthColumnMax,
            itemWidth: area.layoutOptions?.itemWidth,
            height: area.layoutOptions?.height,
            noBar: area.layoutOptions?.noBar,
            class: area.class,
            itemPartial: area.itemPartial,
          });
          // An empty, non-`keepVisible` collection drops the area only.
          return html.replace(COLLECTION_EMPTY_MARKER, "");
        }

        default:
          // eslint-disable-next-line no-console
          console.warn(
            `sectionBuilder: unknown area type "${area?.type}" — skipping.`,
          );
          return "";
      }
    }),
  );

  return rendered.filter(Boolean).join("\n");
}

/**
 * Render a column pair (used by twoColumns-style sections). Both `itemLeft`
 * and `itemRight` follow the same `{ content, class }` shape as list items.
 */
export async function renderColumnsPairInner({
  itemLeft,
  itemRight,
  itemPartial,
  wrapperPartial,
  wrapperProps,
  cascade = {},
}) {
  if (!itemLeft && !itemRight) return "";

  const self = this;
  const renderMarkdown = (src) =>
    src
      ? self.renderTemplate.call(self, src, "njk,md", { ...cascade })
      : Promise.resolve("");

  const renderColumn = async (col) => {
    const html = await renderMarkdown(col?.content);
    return await self.partial.call(self, itemPartial, {
      __cascade: cascade,
      content: html,
      class: col?.class,
    });
  };

  const colsHtml = [
    await renderColumn(itemLeft),
    await renderColumn(itemRight),
  ].join("\n");

  return await self.partial.call(self, wrapperPartial, {
    __cascade: cascade,
    content: colsHtml,
    ...(wrapperProps || {}),
  });
}
