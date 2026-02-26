export default function ({ content, class: className }) {
  return `<div class="card grid-item ${className || ""}">
${content}
</div>`;
}
