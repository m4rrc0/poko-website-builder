import Markdoc from "@markdoc/markdoc";

export const ListItem = {
    // render: 'link-c',
    // attributes: { collection: { type: String, required: true } },
    transform: (node, config) => {
        // const attributes = node.transformAttributes(config);
        const attributes = node.attributes || {};
        const localConfig = {...config, variables: {...config.variables, ...attributes.variables}}
        const children = node.transformChildren(localConfig);

        const className = 'list-item'
        
        // const props = removeUndefinedProps(rawProps);

        return new Markdoc.Tag("li", {class: className}, children);
      }
}
