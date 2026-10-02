import { image as imageShortcode } from "../../src/config-11ty/shortcodes/components/image.js";

export default async function (data) {
  const { title, description, url, image, highlights, pagePreview } = data;

  const imageStr = image?.src
    ? await imageShortcode({ src: image.src, alt: image.alt || "" })
    : "";

  const highlightsStr = (highlights || [])
    .map(({ text, url: hUrl }) =>
      hUrl ? `<li class="small" style="background-color: ${data.capsuleBackgroundColor || "white"};">
    <a href="${hUrl}" style="color: ${data.textColor || data.backgroundColor || "inherit"}" target='_blank' rel='noopener noreferrer'>${text}</a></li>` : `<li class="small" style="background-color: ${data.capsuleBackgroundColor || "white"}; color: ${data.textColor || data.backgroundColor || "inherit"}">${text}</li>`
    )
    .join("\n");

  return `<article class="collection-item breakout-clickable width-max center text flow; ${pagePreview ? "page-preview" : ""}">
    <header class="collection-item_header center text">
    <h2><a href="${url}" class="clickable h3" target="_blank" rel="noopener noreferrer">${title}</a></h2>
        ${description ? `<p class="width-max">${description}</p>` : ""}
    </header>
    <div class="collection-item_content" style="margin-top: var(--step-0);">
        ${imageStr}
        <div class="highlights" style="background-color: ${data.backgroundColor}; padding: var(--step-0);">
            ${highlights?.length ? `<ul class="cluster v--gap-cluster:var(--step--2)">\n${highlightsStr}\n</ul>` : ""}
        </div>
    </div>
</article>`;
}

