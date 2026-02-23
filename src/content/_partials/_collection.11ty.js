import {
  filterCollection,
  sortCollection,
  first as firstFilter,
  last as lastFilter,
} from "../../config-11ty/filters/array.js";

class Collection {
  async render({
    content,
    collections,
    collection,
    tag,
    sort,
    sortBy,
    filterFirst,
    filterLast,
    type,
    columns,
    widthWrap,
    gap,
    class: extraClass,
  }) {
    // Access Eleventy collections via template context
    const allCollections = collections || {};
    const collectionItemSc = this.collectionItem;

    // 1. Build the raw items list first
    let items = [];

    if (!collection || collection === "all") {
      // Merge all collections into one flat array (deduplicated by url)
      const seen = new Set();
      for (const col of Object.values(allCollections)) {
        if (Array.isArray(col)) {
          for (const item of col) {
            if (item?.url && !seen.has(item.url)) {
              seen.add(item.url);
              items.push(item);
            }
          }
        }
      }
    } else {
      items = allCollections[collection] || [];
    }

    // 2. Filter by tag
    if (tag) {
      items = filterCollection(items, { by: "tags", value: tag });
    }

    // 3. Sort
    if (sort === "asc" || sort === "desc") {
      items = sortCollection(items, { direction: sort, by: sortBy || "date" });
    }

    // 4. Apply filterFirst / filterLast
    if (filterFirst !== undefined) {
      items = firstFilter(items, Number(filterFirst));
    } else if (filterLast !== undefined) {
      items = lastFilter(items, Number(filterLast));
    }

    // 5. Render each item via collectionItem shortcode
    const itemsStr = (
      await Promise.all(
        items.map(async (item) => {
          if (collectionItemSc) {
            return await collectionItemSc.call(this, "", {
              title: item.data.pagePreview?.title,
              description: item.data.pagePreview?.description,
              image: item.data.pagePreview?.image,
            });
          }
          // Fallback if shortcode not available
          return `<div class="collection-item">
  <a href="${item?.url || "#"}">${item?.data?.name || item?.fileSlug || ""}</a>
</div>`;
        }),
      )
    ).join("\n");

    // 6. Determine layout class
    // Default: switcher for <=3 items, grid-fluid for >3
    const layoutType = type || (items.length <= 3 ? "switcher" : "grid-fluid");

    // Build inline CSS vars for layout options
    const cssVars = [
      layoutType === "grid-fluid"
        ? columns
          ? `--columns: ${columns}`
          : "--columns: 5"
        : "",
      gap ? `--gap: ${gap}` : "",
      widthWrap ? `--width-wrap: ${widthWrap}` : "",
    ]
      .filter(Boolean)
      .join("; ");

    const classAttr = ["collection", layoutType, extraClass]
      .filter(Boolean)
      .join(" ");

    return `<div class="${classAttr}" data-collection="${collection || "all"}"${tag ? ` data-tag="${tag}"` : ""}${cssVars ? ` style="${cssVars}"` : ""}>
${itemsStr}
</div>`;
  }
}

export default Collection;
