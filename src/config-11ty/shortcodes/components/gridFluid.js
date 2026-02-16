export function gridFluid(unnamedAttrOrObj, optionalAttrsObj) {
  const {
    __keywords,
    gap = 1,
    columns = 2,
    minWidth = "200px",
    maxWidth = "1fr",
    ...attrs
  } = optionalAttrsObj || unnamedAttrOrObj || {};

  const attrStr = Object.entries(attrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  return `<div class="grid-fluid" style="--gap:${gap}rem; --columns:${columns}; --min-width:${minWidth}; --max-width:${maxWidth}" ${attrStr}></div>`;
}
