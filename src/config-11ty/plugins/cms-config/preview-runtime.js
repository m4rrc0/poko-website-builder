import { createRenderer } from "./preview-renderer.js";

export const previewState = { collections: {}, lang: "", sectionsHtml: "" };
export const sectionsSlots = new Set();

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
// Sveltia exposes its DOMPurify instance on `window`; never insert unsanitized HTML without it
const sanitize = (html) =>
  window.DOMPurify?.sanitize
    ? window.DOMPurify.sanitize(html)
    : `<pre>${escapeHtml(html)}</pre>`;
export const renderMarkdown = (src) =>
  window.marked?.parse
    ? window.marked.parse(String(src ?? ""))
    : `<p>${escapeHtml(src)}</p>`;
export const setHtml = (el, html) => {
  el.innerHTML = sanitize(html);
};
export const getRenderer = () =>
  createRenderer({
    renderMarkdown,
    collections: previewState.collections,
    lang: previewState.lang,
  });
export const asyncPreview = (promise) => {
  const el = document.createElement("div");
  el.className = "cms-preview";
  Promise.resolve(promise)
    .then((html) => setHtml(el, html || ""))
    .catch((e) => {
      console.error(e);
      setHtml(el, "<p><em>Preview error</em></p>");
    });
  return el;
};
export const pushSectionsHtml = (html) => {
  previewState.sectionsHtml = html;
  for (const el of sectionsSlots) {
    if (el.isConnected) setHtml(el, html || SECTIONS_EMPTY_NOTE);
    else sectionsSlots.delete(el);
  }
};
export const SECTIONS_EMPTY_NOTE = `<p class="cms-sections-note"><em>Page sections (from the Sections field) render here.</em></p>`;
