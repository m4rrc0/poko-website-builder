class Grid {
  // or `async data() {`
  // or `get data() {`
  // data() {
  // 	return {
  // 		name: "Ted",
  // 		layout: "teds-rad-layout",
  // 		// … other front matter keys
  // 	};
  // }

  async render({
    content,
    type,
    gap,
    class: className,
    widthWrap,
    columns,
    widthColumnMin,
    widthColumnMax
  }) {
    // const contentRendered = await this.renderTemplate(content, "njk,md");
    const gridItemRegex = /class=["'][^"']*\bgrid-item\b[^"']*["']/g;
    const childrenNb = (content?.match(gridItemRegex) || []).length;
    const layoutClass = childrenNb > 3 ? "grid-fluid" : "switcher";
    const styles = {
      ["--columns"]: columns,
      ["--gap"]: gap,
      ["--width-column-min"]: widthColumnMin,
      ["--width-column-max"]: widthColumnMax,
      ["--width-wrap"]: widthWrap,
    }
    let styleStr = Object.entries(styles).filter(([key, value]) => value).map(([key, value]) => `${key}: ${value};`).join(' ');
    styleStr = styleStr ? `style="${styleStr}"` : '';

    return `<div class="list-grid ${type || layoutClass} ${className || ''}" ${styleStr}>
${content}
</div>
{% partial "styles/_grid" %}`;
  }
}

export default Grid;
