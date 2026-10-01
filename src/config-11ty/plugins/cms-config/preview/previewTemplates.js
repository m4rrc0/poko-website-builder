import {
  pagesCollection,
  activeCollections,
  previewOnlyCollections,
} from "./env.js";
import {
  previewState,
  sanitizeHtml,
  updateUnoStyles,
  postprocessMedia,
  applyHtmlClasses,
  preparePreview,
  renderEntryPreview,
} from "./preview-runtime.js";

// Thin Sveltia adapter: the whole pipeline (hydrate → normalize → collections
// → computed → render → layout) lives in preview-runtime.js — this class only
// translates component lifecycle calls into it. Sveltia's preview props carry
// no `collection`, so each collection gets its own class bound to its name
// (collectionName drives the dir-data tier, filePathStem, and the self-upsert
// into its own collection).
const makePagePreview = (collectionName) =>
  window.createClass({
    componentDidMount() {
      // Asset blobs/icons resolve async — when pending fetches drain with new
      // urls, re-run refresh so the next render emits them (innerHTML is a
      // snapshot).
      previewState.requestRerender = () => this.refresh();
      this.refresh();
    },
    componentWillUnmount() {
      previewState.requestRerender = null;
    },
    componentDidUpdate(prevProps) {
      // refresh() ends in forceUpdate — only re-run on a real entry change or
      // this loops forever (Sveltia swaps the immutable entry object per edit).
      if (prevProps?.entry !== this.props.entry) {
        this.refresh();
        return;
      }
      // forceUpdate render (fresh preview DOM) — re-apply injected classes
      // and resolve media attrs on the inserted markup.
      const doc = this.props.document ?? document;
      applyHtmlClasses(doc);
      postprocessMedia(doc.querySelector(".cms-page-preview") ?? doc);
    },
    async refresh() {
      // A newer refresh wins the shared job seq — bail silently when
      // superseded instead of applying stale state.
      if (!(await preparePreview(this.props, collectionName))) return;
      // Debounce the heavy tail (collections → render → uno → DOM): a
      // keystroke burst pays ONE render, not one per keystroke. Asset-settle
      // re-renders ride the same path (their 200ms tail is fine).
      clearTimeout(this.renderTimer);
      this.renderTimer = setTimeout(() => this.runRender(), 200);
    },
    async runRender() {
      const result = await renderEntryPreview();
      if (!result) return; // superseded — a newer render owns the state
      this.noPage = result.noPage;
      this.html = result.html ?? "";
      updateUnoStyles(this.props.document, this.html);
      this.forceUpdate?.();
    },
    render() {
      if (this.noPage) return null;
      return window.h("div", {
        className: "cms-page-preview",
        style: {
          display: "contents",
        },
        dangerouslySetInnerHTML: {
          __html: sanitizeHtml(this.html ?? ""),
        },
      });
    },
  });

export function registerPreviewTemplates(CMS) {
  [pagesCollection, ...activeCollections]
    // Every folder collection gets the custom preview unless its directory
    // data file marks it previewOnly — entries with no body/sections still
    // render their layout (e.g. plays → play.njk renders its fields).
    .filter((c) => c.folder && !previewOnlyCollections.includes(c.name))
    .forEach((c) =>
      CMS.registerPreviewTemplate(c.name, makePagePreview(c.name)),
    );
}
