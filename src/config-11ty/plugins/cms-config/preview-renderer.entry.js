import { filterCollection, sortCollection } from "../../../utils/arrays.js";
import _sectionRaw from "../../../content/_partials/_sectionRaw.11ty.js";
import _sectionFlow from "../../../content/_partials/_sectionFlow.11ty.js";
import _sectionGrid from "../../../content/_partials/_sectionGrid.11ty.js";
import _sectionTwoColumns from "../../../content/_partials/_sectionTwoColumns.11ty.js";
import _sectionReel from "../../../content/_partials/_sectionReel.11ty.js";
import _sectionCollection from "../../../content/_partials/_sectionCollection.11ty.js";
import _sectionBuilder from "../../../content/_partials/_sectionBuilder.11ty.js";
import _sectionHeader from "../../../content/_partials/_sectionHeader.11ty.js";
import _sectionFooter from "../../../content/_partials/_sectionFooter.11ty.js";
import _flow from "../../../content/_partials/_flow.11ty.js";
import _flowItem from "../../../content/_partials/_flowItem.11ty.js";
import _grid from "../../../content/_partials/_grid.11ty.js";
import _gridItem from "../../../content/_partials/_gridItem.11ty.js";
import _twoColumns from "../../../content/_partials/_twoColumns.11ty.js";
import _twoColumnsItem from "../../../content/_partials/_twoColumnsItem.11ty.js";
import _reel from "../../../content/_partials/_reel.11ty.js";
import _reelItem from "../../../content/_partials/_reelItem.11ty.js";
import _collection from "../../../content/_partials/_collection.11ty.js";
import _collectionItem from "../../../content/_partials/_collectionItem.11ty.js";
import _areaRaw from "../../../content/_partials/_areaRaw.11ty.js";
import _wrapper from "../../../content/_partials/_wrapper.11ty.js";
import _collectionWrapper from "../../../content/_partials/_collectionWrapper.11ty.js";

const partials = {
  _sectionRaw,
  _sectionFlow,
  _sectionGrid,
  _sectionTwoColumns,
  _sectionReel,
  _sectionCollection,
  _sectionBuilder,
  _sectionHeader,
  _sectionFooter,
  _flow,
  _flowItem,
  _grid,
  _gridItem,
  _twoColumns,
  _twoColumnsItem,
  _reel,
  _reelItem,
  _collection,
  _collectionItem,
  _areaRaw,
  _area: _areaRaw,
  _wrapper,
  _collectionWrapper,
};

const previewFilterCollection = (collection, filtersRaw, exclusions = false) => {
  const filters = Array.isArray(filtersRaw) ? filtersRaw : [filtersRaw];
  const normalizedFilters = filters.map((filter) =>
    filter?.by === "lang" && filter.value === ""
      ? { ...filter, value: undefined }
      : filter,
  );
  return filterCollection(collection, normalizedFilters, exclusions);
};

export function createRenderer({
  renderMarkdown,
  collections = {},
  lang = "",
}) {
  const cascade = { collections, lang };
  const ctx = {
    page: {},
    filterCollection: previewFilterCollection,
    sortCollection,
    renderTemplate: (src) => renderMarkdown(src ?? ""),
    renderContent: (src) => renderMarkdown(src ?? ""),
    async partial(name, data) {
      const fn =
        partials[name] ??
        (data?.pagePreview ? partials._collectionItem : undefined);
      if (!fn) {
        console.warn(`[cms preview] unknown partial "${name}"`);
        return "";
      }
      return fn.call(ctx, { __cascade: cascade, ...data });
    },
  };

  async function renderSection(section) {
    if (!section?.type || !partials[`_${section.type}`]) return "";
    const { type, content, ...rest } = section;
    const html = content ? await renderMarkdown(content) : "";
    return ctx.partial(`_${type}`, {
      content: html,
      ...rest,
      collections,
      lang,
    });
  }

  async function renderSections(sections) {
    const list = Array.isArray(sections) ? sections : [];
    return (await Promise.all(list.map(renderSection))).filter(Boolean).join("\n");
  }

  return { renderSection, renderSections };
}
