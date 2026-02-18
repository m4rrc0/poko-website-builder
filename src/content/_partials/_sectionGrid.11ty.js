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
    return `<section class="section section-grid">
${content}
</section>`;
  }
}

export default Grid;
