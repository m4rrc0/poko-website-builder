export default async function (data) {
  const { title, description, image } = data.pagePreview;
  const imageStr = image?.src ? `<img src="${image.src}" alt="">` : "";
  const titleStr = title ? `<h3><a href="${data.url}">${title}</a></h3>` : "";
  const descriptionStr = description ? `<p>${description}</p>` : "";
  const output = [imageStr, titleStr, descriptionStr]
    .filter(Boolean)
    .join("\n");

  // const pagePreviewSc = this.pagePreview
  // const articlePreviewSc = this.articlePreview
  return `<${data.tag || "article"} class="cell item-collection breakout-clickable">
${output}
</${data.tag || "article"}>`;
}
