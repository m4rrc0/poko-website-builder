// const njkAttrsStringFromObj = (obj) =>
//   Object.entries(obj)
//     .filter(
//       ([key, value]) =>
//         !!value && key !== "content" && !key.startsWith("content:"),
//     )
//     .map(([key, value]) => {
//       if (typeof value === "string") {
//         return `${key}="${value}"`;
//       }
//       return `${key}=` + JSON.stringify(value);
//     })
//     .join(", ");

import { COLLECTION_EMPTY_MARKER } from "../../config-11ty/plugins/partialShortcodes/render-structured-section.js";

export default async function (data) {
  const {
    // Data from context template
    collections,
    lang,
    // Data passed to the shortcode
    // content,
    collection,
    filters,
    exclusions,
    keepVisible,
    sortCriterias,
    type,
    gap,
    widthWrap,
    columns,
    widthColumnMin,
    widthColumnMax,
    itemWidth,
    height,
    noBar,
    class: className,
    tag,
    itemPartial,
    wrapperPartial,
    content: itemMarkup,
  } = data;

  // Data cascade for the nested renders below. `this.ctx` is undefined inside
  // an 11ty.js partial, so the cascade travels through the reserved
  // `__cascade` prop injected by `renderPartial`. Without it, shortcodes like
  // `link` lose `collections` / `globalSettings` and throw.
  const cascade = data?.__cascade ?? {};

  const filterCollection = this.filterCollection;
  const sortCollection = this.sortCollection;
  const partialSc = this.partial;
  const renderContentFn = this.renderContent;
  // const partialWrapperSc = this.partialWrapper;

  // 1. Get the collection of items
  let items = collections[collection || "all"] || [];
  // 2. First: Sort the collection (if sort criteria are provided) before filtering
  items = sortCollection(items, sortCriterias);
  // 3. Filter the collection if filters are provided
  // TODO: Provide an escape hatch if we want to filter by another language that the current one
  items = filterCollection(items, [{ by: "lang", value: lang }]);

  if (filters && filters.length > 0) {
    items = filterCollection(items, filters, exclusions);
  }

  // 4. Nothing left to show: without an explicit `keepVisible` option the
  // enclosing section must disappear entirely, which it cannot detect on its
  // own in inline mode — hence the marker (stripped/consumed by the caller).
  if (items.length === 0) {
    // `keepVisible.enabled` is a hidden persistence flag (see `keepVisibleField`
    // in the CMS config); an explicit `false` still means "hide".
    if (!keepVisible || keepVisible.enabled === false) {
      return COLLECTION_EMPTY_MARKER;
    }

    const fallback = keepVisible.fallbackMessage
      ? await renderContentFn.call(
          this,
          keepVisible.fallbackMessage,
          "njk,md",
          {
            ...cascade,
          },
        )
      : "";

    return fallback
      ? `<div class="collection-empty">
${fallback}
</div>`
      : "";
  }

  const itemMarkupTrimmed =
    typeof itemMarkup === "string" ? itemMarkup.trim() : "";

  const itemsStr = (
    await Promise.all(
      items.map(async (item, index, items) => {
        // If inline item markup was provided as paired-shortcode content,
        // render it per item with `item` in scope instead of using a partial.
        if (itemMarkupTrimmed) {
          return await renderContentFn.call(this, itemMarkupTrimmed, "njk,md", {
            ...cascade,
            ...item.data,
            item,
            index,
            items,
          });
        }
        return await partialSc.call(this, itemPartial || "_collectionItem", {
          // Most precise cascade for this subtree: the item's own data
          // cascade layered over the page's.
          __cascade: { ...cascade, ...item.data },
          index,
          items,
          ...item.data,
          rawInput: item.rawInput ?? item.template?.inputContent ?? "",
          // rawInput: item.rawInput,
          // content: item?.content, // Error: render template too early
        });
      }),
    )
  ).join("\n");

  // const itemsStr = items
  //   .map((item, index) => {
  //     const itemAttrs = njkAttrsStringFromObj(item.data);
  //     return `{% partial "${itemPartial || "_collectionItem"}", index=${index}, ${itemAttrs} %}`;
  //   })
  //   .join("\n");

  // const contentRendered = await this.renderTemplate(content, "njk,md");
  // const gridItemRegex = /class=["'][^"']*\bitem-grid\b[^"']*["']/g;
  // const childrenNb = (content?.match(gridItemRegex) || []).length;
  const layoutClass = items.length > 3 ? "grid-fluid" : "switcher";
  // const layoutClass = "grid-fluid";
  const isFlow = type === "flow";
  // `columns` is a shorthand for `<column-width> || <column-count>`, so the two
  // distinct CMS knobs compose into a single value. Width must come first.
  // width only -> fluid count; count only -> exactly N; both -> >=width, max N.
  const columnsFauxMasonry =
    type === "faux-masonry"
      ? [widthColumnMin, columns].filter(Boolean).join(" ") || undefined
      : undefined;
  const styles = {
    "--columns": columns,
    [isFlow ? "--flow-space" : "--gap"]: gap,
    "--width-column-min": widthColumnMin,
    "--width-column-max": widthColumnMax,
    "--width-wrap": widthWrap,
    "--item-width": itemWidth,
    "--height": height,
    "--columns-faux-masonry": columnsFauxMasonry,
  };
  let styleStr = Object.entries(styles)
    .filter(([key, value]) => value)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
  // styleStr = styleStr ? `style="${styleStr}"` : "";
  const wrapperClasses = `layout area main list-collection ${collection || "all"} ${type || layoutClass} ${noBar ? "no-bar" : ""} ${className || ""}`;

  // const wrapperStr = await partialWrapperSc.call(
  //   this,
  //   wrapperPartial || "training-cards" || "_collectionWrapper",
  //   {
  //     class: wrapperClasses,
  //     style: styleStr,
  //     items,
  //     content: itemsStr,
  //   },
  // );

  // return wrapperStr;

  // TODO: Improve. This seems fragile!
  //  Should we use partialSc instead of partialWrapperSc to process with JS?

  return wrapperPartial
    ? `{% partialWrapper "${wrapperPartial}", class="${wrapperClasses}", style="${styleStr}" %}
${itemsStr}
{% endpartialWrapper %}`
    : `<${tag || "div"} class="${wrapperClasses}" style="${styleStr}">
${itemsStr}
</${tag || "div"}>`;
}
