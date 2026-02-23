export default async function ({ content = "", title, description, image }) {
  const titleStr = title ? `<h3>${title}</h3>` : "";
  const descriptionStr = description ? `<p>${description}</p>` : "";
  const imageStr = image ? `<img src="${image.src}" alt="">` : "";
  const output = [titleStr, descriptionStr, imageStr]
    .filter(Boolean)
    .join("\n");

  // const pagePreviewSc = this.pagePreview
  // const articlePreviewSc = this.articlePreview
  return `<div class="collection-item">
${output}
</div>`;
}
