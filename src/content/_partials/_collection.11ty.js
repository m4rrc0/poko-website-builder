export default async function ({
  // Data from context template
  collections,
  lang,
  // Data passed to the shortcode
  // content,
  collection,
  filters,
  exclusions,
  sortCriterias,
  type,
  gap,
  widthWrap,
  columns,
  widthColumnMin,
  widthColumnMax,
  class: className,
  tag,
  itemPartial,
  wrapperPartial,
}) {
  const filterCollection = this.filterCollection;
  const sortCollection = this.sortCollection;
  const partialSc = this.partial;
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

  const itemsStr = (
    await Promise.all(
      items.map(async (item, index) => {
        return await partialSc.call(this, itemPartial || "_collectionItem", {
          index,
          ...item.data,
        });
      }),
    )
  ).join("\n");

  // const contentRendered = await this.renderTemplate(content, "njk,md");
  // const gridItemRegex = /class=["'][^"']*\bitem-grid\b[^"']*["']/g;
  // const childrenNb = (content?.match(gridItemRegex) || []).length;
  const layoutClass = items.length > 3 ? "grid-fluid" : "switcher";
  // const layoutClass = "grid-fluid";
  const styles = {
    "--columns": columns,
    "--gap": gap,
    "--width-column-min": widthColumnMin,
    "--width-column-max": widthColumnMax,
    "--width-wrap": widthWrap,
  };
  let styleStr = Object.entries(styles)
    .filter(([key, value]) => value)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
  // styleStr = styleStr ? `style="${styleStr}"` : "";
  const wrapperClasses = `layout area main list-collection ${type || layoutClass} ${className || ""}`;

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
