export default async function ({ content, tag, class: className }) {
  return tag || className
    ? `<${tag || "section"} class="section-raw ${className || ""}">
${content}
</${tag || "section"}>`
    : content;
}
