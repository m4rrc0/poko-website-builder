// CMS-preview stub for {% embed %} — browser-safe (no node imports, no
// network): the real shortcode resolves posters through eleventy-img at
// build time, none of which can run in the preview renderer. Shows a
// dark facade-shaped box instead.

const providerName = (url) =>
  /youtube\.com|youtu\.be/.test(url)
    ? "YouTube"
    : /vimeo\.com/.test(url)
      ? "Vimeo"
      : "Embed";

export function embedPreview(a, b) {
  const args =
    typeof a === "string" ? { ...(b || {}), url: a } : a && typeof a === "object" ? a : {};
  const { __keywords, ...rest } = args;
  const url = rest.url || "";
  const name = providerName(url);
  const cls = ["embed", "embed--preview", rest.class].filter(Boolean).join(" ");
  return (
    `<div class="${cls}" style="aspect-ratio:16/9;display:flex;flex-direction:column;` +
    `align-items:center;justify-content:center;gap:.4em;background:#0f0f0f;` +
    `color:#fff;font:500 .9rem/1.4 system-ui,sans-serif">` +
    `<span style="font-size:2em">▶</span><span>${name} embed</span>` +
    (url
      ? `<code style="font-size:.75em;opacity:.6">${url.slice(0, 60)}</code>`
      : "") +
    `</div>`
  );
}
