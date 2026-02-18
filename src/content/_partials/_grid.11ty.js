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

  async render({ content }) {
    // const contentRendered = await this.renderTemplate(content, "njk,md");
    const gridItemRegex = /class=["'][^"']*\bgrid-item\b[^"']*["']/g;
    const childrenNb = (content?.match(gridItemRegex) || []).length;
    const layoutClass = childrenNb > 3 ? "grid-fluid" : "switcher";

    console.log({ childrenNb, content });

    return `
<div class="list-grid ${layoutClass}">
${content}
</div>`;
  }
}

export default Grid;
