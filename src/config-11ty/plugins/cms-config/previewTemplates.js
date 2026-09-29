import { pagesCollection, activeCollections } from "./env.js";
import { adminEntryUrl } from "./admin-url.js";
import {
  previewState,
  getRenderer,
  sanitizeHtml,
  toJs,
  resolveAssetsDeep,
  resetAssetRetries,
  hydratePreviewFromCms,
  updateUnoStyles,
} from "./preview-runtime.js";

// html-classes-transform parity: the project's `_config/htmlClasses.js` maps
// selectors → classes injected on matching nodes. The preview DOM is already
// parsed in the iframe, so this is querySelectorAll + classList.add — no
// second HTML pass. `html`/`body` selectors target the iframe's own
// <html>/<body> (what the transform hits in real pages); other selectors are
// scoped to the preview root so editor-component previews are unaffected.
const applyHtmlClasses = (doc) => {
  const d = doc ?? document;
  const map = getRenderer().userHtmlClasses ?? {};
  const scope = d.querySelector(".cms-page-preview") ?? d;
  for (const [selector, className] of Object.entries(map)) {
    const names = String(className).split(/\s+/).filter(Boolean);
    if (!names.length) continue;
    const targets =
      selector === "html"
        ? [d.documentElement]
        : selector === "body"
          ? [d.body]
          : [...scope.querySelectorAll(selector)];
    for (const el of targets) el?.classList?.add(...names);
  }
};

const toCollectionItem = (entry, getAsset, collectionName) => {
  const d = resolveAssetsDeep(entry?.data ?? {});
  const image = d.preview?.image || d.metadata?.image || null;
  const pagePreview = {
    title: d.preview?.title || d.title || d.name || null,
    description: d.preview?.description || d.metadata?.description || null,
    image,
  };
  const lang = d.lang ?? d.page?.lang ?? previewState.lang;
  const slug = entry?.slug ?? "";
  // Rendered urls point at the CMS entry editor (same convention as the link
  // editor component's toPreview); page.url keeps a pseudo site url so
  // translationKey/url matching still resolves.
  const siteUrl = `/${[lang, slug === "index" ? "" : slug].filter(Boolean).join("/")}/`;
  const adminUrl = adminEntryUrl(collectionName, slug);
  const title = d.title || d.name || slug;
  return {
    data: {
      ...d,
      lang,
      pagePreview,
      url: adminUrl,
      // `body` (the markdown body field), not `entry.raw` — Sveltia's raw
      // includes frontmatter; `{% if rawInput %}{{ rawInput|md }}` must match
      // Eleventy's post-frontmatter inputContent.
      rawInput: d.body ?? "",
      // eleventyNavigation reads item.data.page.url when resolving entries
      page: {
        fileSlug: slug,
        url: siteUrl,
        lang,
        filePathStem: `/${[lang, collectionName, slug].filter(Boolean).join("/")}`,
        outputFileExtension: "html",
      },
      // Minimal self-translation so `locale_url`/`locale_links` resolve
      templateTranslations: d.templateTranslations || [
        { lang, url: adminUrl, title, name: d.name || slug },
      ],
    },
    url: adminUrl,
    page: { fileSlug: slug, url: siteUrl, lang },
    // Eleventy collection-item shape: partials read item.rawInput /
    // item.template.inputContent at TOP level (see _collection.11ty.js).
    rawInput: d.body ?? "",
    template: { inputContent: d.body ?? "" },
  };
};

const PagePreview = window.createClass({
  componentDidMount() {
    // Asset blobs resolve async — when pending fetches drain with new urls,
    // re-run refresh so the next render emits them (innerHTML is a snapshot).
    previewState.requestRerender = () => this.refresh();
    this.refresh();
  },
  componentWillUnmount() {
    previewState.requestRerender = null;
  },
  componentDidUpdate(prevProps) {
    // refresh() calls forceUpdate — only re-run on a real entry change or this
    // loops forever (Sveltia swaps the immutable entry object per edit)
    if (prevProps?.entry !== this.props.entry) {
      this.refresh();
      return;
    }
    // forceUpdate render (fresh preview DOM) — re-apply injected classes
    applyHtmlClasses(this.props.document);
  },
  async refresh() {
    const seq = (this.seq = (this.seq || 0) + 1);
    const { entry, getCollection, getAsset, collection } = this.props;
    if (typeof getAsset === "function") previewState.getAsset = getAsset;
    if (typeof getCollection === "function")
      previewState.getCollection = getCollection;
    const collectionName = collection?.name ?? "";
    previewState.collectionName = collectionName;
    // Entry refresh = retry failed asset fetches (a dropped file may have
    // landed in the store since the last render).
    resetAssetRetries();
    const data = resolveAssetsDeep(toJs(entry)?.data ?? {});
    previewState.entry = data;
    previewState.computed = null;
    const slug = entry?.slug ?? data.slug ?? data.page?.fileSlug ?? "";
    previewState.lang = data.lang ?? data.page?.lang ?? "";
    const rawInput = toJs(entry)?.raw ?? data.body ?? "";
    previewState.page = {
      ...(data.page ?? {}),
      fileSlug: slug,
      url: data.page?.url ?? `/${slug}/`,
      lang: previewState.lang,
      // Computed data (lang, permalink, ldType…) derives from filePathStem —
      // the stem mirrors the collection's folder layout: /<lang>/<coll>/<slug>
      filePathStem: `/${[previewState.lang, collectionName, slug]
        .filter(Boolean)
        .join("/")}`,
      outputFileExtension: "html",
      rawInput,
    };
    // CMS-managed `_data` (globalSettings, brand, dataFiles) → env bindings +
    // siteData. Before collections so computed data sees the fresh values.
    await hydratePreviewFromCms();
    if (seq !== this.seq) return;
    // Debounce the heavy tail (hydrate → collections → render → uno → DOM):
    // a keystroke burst pays ONE render, not one per keystroke. Asset-settle
    // re-renders ride the same path (their 200ms tail is fine).
    clearTimeout(this.renderTimer);
    this.renderTimer = setTimeout(
      () => this.runRender(seq, data, collectionName),
      200,
    );
  },
  async runRender(seq, data, collectionName) {
    const { entry, getCollection, getAsset } = this.props;
    const names = [pagesCollection, ...activeCollections]
      .filter((c) => c.folder)
      .map((c) => c.name);
    const collections = {};
    await Promise.all(
      names.map(async (name) => {
        try {
          const entries = await getCollection(name);
          collections[name] = (entries ?? []).map((e) =>
            toCollectionItem(toJs(e), getAsset, name),
          );
        } catch (e) {
          collections[name] = [];
        }
      }),
    );

    // The entry being edited isn't in saved collections yet — upsert it so
    // self-references (locale_url, collection filters incl. itself) resolve.
    if (collectionName && collections[collectionName]) {
      const item = toCollectionItem(toJs(entry), getAsset, collectionName);
      const i = collections[collectionName].findIndex(
        (it) => it.page?.fileSlug === item.page?.fileSlug,
      );
      if (i >= 0) collections[collectionName][i] = item;
      else collections[collectionName].push(item);
    }
    collections.all = Object.values(collections).flat();
    if (seq !== this.seq) return;
    previewState.collections = collections;
    // Real eleventyComputed: lang/title/permalink/metadata/templateTranslations…
    const computed = await getRenderer().compute(data);
    if (seq !== this.seq) return;
    previewState.computed = computed;
    previewState.lang = computed.lang ?? previewState.lang;
    // Whole body through the app pipeline: `{% sections %}` inside it resolves
    // against entry.sections, shortcodes render like the site. Collections
    // with a `sections` field but no `body` still get their sections rendered.
    const body = String(data.body ?? "");
    const html = body
      ? await getRenderer().renderRich(body)
      : await getRenderer().renderSections(data.sections);
    if (seq !== this.seq) return;
    this.html = html;
    updateUnoStyles(this.props.document, html);
    this.forceUpdate?.();
  },
  render() {
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
    .filter(
      (c) =>
        c.folder &&
        c.fields?.some((f) => f.name === "body" || f.name === "sections"),
    )
    .forEach((c) => CMS.registerPreviewTemplate(c.name, PagePreview));
}
