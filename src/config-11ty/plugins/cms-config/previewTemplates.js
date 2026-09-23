import { activeCollections } from "./env.js";
import { previewState, getRenderer, pushSectionsHtml } from "./preview-runtime.js";

const toJs = (v) => (v && typeof v.toJS === "function" ? v.toJS() : v);

const toCollectionItem = (entry, getAsset) => {
  const d = entry?.data ?? {};
  let image = d.preview?.image || d.metadata?.image || null;
  const asset = image?.src && getAsset ? getAsset(image.src) : undefined;
  if (asset?.url) image = { ...image, src: asset.url };
  const pagePreview = {
    title: d.preview?.title || d.title || d.name || null,
    description:
      d.preview?.description || d.metadata?.description || null,
    image,
  };
  return {
    data: {
      ...d,
      lang: d.lang ?? d.page?.lang ?? previewState.lang,
      pagePreview,
      url: "#",
    },
    url: "#",
    page: { fileSlug: entry?.slug ?? "" },
  };
};

const PagePreview = window.createClass({
  componentDidMount() {
    this.refresh();
  },
  componentDidUpdate() {
    this.refresh();
  },
  async refresh() {
    const seq = (this.seq = (this.seq || 0) + 1);
    const { entry, getCollection, getAsset } = this.props;
    const data = toJs(entry)?.data ?? {};
    previewState.lang = data.lang ?? data.page?.lang ?? "";
    const names = activeCollections
      .filter((c) => c.folder)
      .map((c) => c.name);
    const collections = {};
    await Promise.all(
      names.map(async (name) => {
        try {
          const entries = await getCollection(name);
          collections[name] = (entries ?? []).map((e) =>
            toCollectionItem(toJs(e), getAsset),
          );
        } catch (e) {
          collections[name] = [];
        }
      }),
    );
    collections.all = Object.values(collections).flat();
    if (seq !== this.seq) return;
    previewState.collections = collections;
    const html = await getRenderer().renderSections(data.sections);
    if (seq !== this.seq) return;
    pushSectionsHtml(html);
  },
  render() {
    return window.h(
      "div",
      { className: "cms-page-preview" },
      this.props.widgetFor("body"),
    );
  },
});

export function registerPreviewTemplates(CMS) {
  activeCollections
    .filter((c) => c.fields?.some((f) => f.name === "sections"))
    .forEach((c) => CMS.registerPreviewTemplate(c.name, PagePreview));
}
