class SectionCollection {
  async render({ content }) {
    return `<section class="section section-collection">
${content}
</section>`;
  }
}

export default SectionCollection;
