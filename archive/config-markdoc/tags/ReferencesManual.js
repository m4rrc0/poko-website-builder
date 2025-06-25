import Markdoc from "@markdoc/markdoc";
import { sort } from 'fast-sort';
import { ensureKeyValObject } from "../../utils/objects.js";
import { replaceVariablesInKeyValObject } from "./_utils.js";

export const ReferencesManual = {
  inline: false,
  selfClosing: false,
  attributes: {
    collection: { type: String, required: true },
    wrapper: {type: Object, default: {tag: "ul"}},
    child: {type: Object, default: {tag: "li"}},
  },
  transform: (node, config) => {
    const attributes = node.transformAttributes(config);
    const {
      collection: collectionName,
      wrapper,
      child,
    } = attributes
    const collection = config.variables?.collections[collectionName] || []
    // Possible sorting keys: data.title, data.date, data.page.url
    // const sortedCollection = sort(collection).desc(u => {
    //   // console.log(u)
    //   return u.data.date
    // });
    // console.log(sortedCollection.map(u => u.data.date))
    const attrs = ensureKeyValObject(wrapper.attrs)
    replaceVariablesInKeyValObject(attrs, config.variables)
    const className = `references list manual ${collectionName}`
    const childClassName = `references item manual ${collectionName}`

    // console.log({
    //   wrapper,
    //   child,
    //   attrs
    // })

    // const props = removeUndefinedProps(rawProps);

    const children = collection.map((item, index) => {
      const scopedConfig = {...config, variables: {...config.variables, item, index}}
      const scopedChildren = node.rawChildren && Markdoc.transform(node.rawChildren, scopedConfig);
      // Unwrap children if child is defined but has no tag or attrs
      if (child && !child.tag && !child.attrs) {
        return scopedChildren
      }
      const childAttrs = ensureKeyValObject(child.attrs)
      replaceVariablesInKeyValObject(childAttrs, scopedConfig.variables)
      return new Markdoc.Tag(child.tag || "li", {
        ...childAttrs,
        class: `${childClassName} ${childAttrs.class || ''}`,
      }, scopedChildren)
    })

    return new Markdoc.Tag(wrapper.tag || "ul", {
      ...attrs,
      class: `${className} ${attrs.class || ''}`
    }, children)

  }
}
