import Markdoc from "@markdoc/markdoc";
import {
  varArrayToObj,
  PartialFile,
  formatPartialFileName,
  retrievePartial,
} from './_utils.js';
import { filterCollection, sortCollection } from '../../utils/arrays.js';

export const ReferencesAuto = {
  inline: false,
  selfClosing: false,
  attributes: {
    references: { type: Object, required: true },
    // collection: { type: String, required: true },
    // TODO: Understand why this does not pass validation
    partial: { type: PartialFile, render: false, required: true },
    variables: { type: Array, render: false, default: [] }
  },
  transform: (node, config) => {
    const {
      references: {
        collection: collectionName,
        sort,
        filter,
      } = {},
      partial: { discriminant, value },
      variables: varArray,
    } = node.attributes
    // Constants
    const className = `references list auto ${collectionName}`
    const childClassName = `references item auto ${collectionName}`

    // Format sort criterias
    const sortCriterias = sort.map(s => {
      const direction = s.direction;
      const by = s.by.discriminant === 'custom' ? s.by.value : s.by.discriminant;
      return { direction, by }
    })
    // Format filters
    const filters = filter.map(f => {
      const by = f.by.discriminant;
      const value = f.by.value;
      return { by, value }
    })

    const collection = config.variables?.collections[collectionName] || []
    const sortedCollection = sortCollection(collection, sortCriterias);
    const filteredCollection = filterCollection(sortedCollection, filters);
    const file = formatPartialFileName(discriminant, value);
    const partial = retrievePartial(config, file);

    if (!partial) {
      // TODO: Decide if we should keep this as a fallback
      // Implementation without Partial just in case...?
      const children = filteredCollection.map(item => {
        return new Markdoc.Tag("li", {}, [new Markdoc.Tag("a", {
          href: item.page.url,
        }, item.data.title)])
      })
      return new Markdoc.Tag("div", {}, [
        new Markdoc.Tag("p", { style: 'color: red' }, `Partial "${file}" not found`),
        new Markdoc.Tag("ul", {}, children)
      ])
    }

    const variables = varArrayToObj(varArray);

    const scopedConfig = {
      ...config,
      variables: {
        ...config.variables,
        ...variables,
        collection: filteredCollection,
      },
    };

    const transformChildren = (part) =>{
      return part.resolve(scopedConfig).transformChildren(scopedConfig);
    }

    return Array.isArray(partial)
      ? partial.flatMap(transformChildren)
      : transformChildren(partial);


  }
}
