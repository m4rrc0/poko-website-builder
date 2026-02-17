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
    // const testContent = await this.renderTemplate(
    //   `# I am a title`,
    //   "njk,md",
    // );
    return `
<div>
    <h2>GRID</h2>
    ${content}
</div>`;
  }
}

export default Grid;
