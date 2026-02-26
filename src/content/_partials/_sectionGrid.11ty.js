export default function ({ content, class: className }) {
  return `<section class="section section-grid ${className || ""}">
${content}
</section>`;
}
