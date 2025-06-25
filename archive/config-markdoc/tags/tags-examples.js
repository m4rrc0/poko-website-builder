import Markdoc from "@markdoc/markdoc";
import { markdocToRenderableTree, replaceChildrenInRenderableTree } from '../../utils/html-in-mdoc.js';

// TODO: Document: This is an implementation using a paired shortcode
export const calloutShortcode = (content, { title }) => {
  return `<div class="callout-shortcode"><p><strong>${title}</strong></p>${content}</div>`;
};

// TODO: Document: This is an implementation using WebC
export const calloutWebc = {
  render: 'callout-webc',
  attributes: {
    title: {
      type: String
    }
  } 
}

// TODO: Document: This is an implementation creating a parent node in the renderable tree
export const callout = {
  attributes: {
    title: {
      type: String
    }
  },
  transform(node, config) {
    // Prepare attributes
    const attributes = { ...node.attributes, ...node.transformAttributes(config) };
    attributes.class = `${attributes.class || ''} callout-mdoc`;
    attributes.style = `${attributes.style || ''} border: 1px solid #222; padding-inline: 1rem;`;
    const children = node.transformChildren(config);

    // Construct the new tag tree
    return new Markdoc.Tag("div", attributes, [
      new Markdoc.Tag("p", {}, [
        new Markdoc.Tag("strong", {}, attributes.title)
      ]),
      ...children
    ]);
  }
};

// TODO: Document: This is an attempt implementation using Markdoc syntax
// Warning: We cannot mix and match HTML and Markdoc
// TODO: This should be possible by merging renderable Trees, inserting children in the right place (a Slot node maybe)
export const calloutBis = {
  attributes: {
    title: {
      type: String
    }
  },
  transform: (node, config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    // const innerHtml = Markdoc.renderers.html(children);

    const wrappingContent = `<div>
<p><strong>${attributes.title}</strong></p>CHILDREN</div>`

    let renderableTree = markdocToRenderableTree(wrappingContent, { ...config, variables: { ...config.variables, ...attributes }});
    
    // Apply the replacement to the entire tree
    renderableTree = replaceChildrenInRenderableTree(renderableTree, children, 'CHILDREN');
    
    return renderableTree
  }
}

// TODO: We cannot mix and match Markdoc and HTML currently...
export const div = {
  transform: (node, config) => {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    
    return new Markdoc.Tag("div", {...node.attributes, ...attributes}, children);
  }
}