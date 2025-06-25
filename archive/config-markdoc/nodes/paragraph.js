import Markdoc from '@markdoc/markdoc';

// TODO: Needs more testing
export const paragraph = {
    // render: 'p',
    children: ['inline'],
    transform(node, config) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);
        const l = children.length;
        const c = children[0];

        if (l === 1 && typeof c === 'string' && c.trim() === '') {
            return null;
        }
        if (l === 1 && typeof c !== 'string' && c.name === 'p') {
            return children[0];
        }
        // if (l === 1 && typeof c !== 'string') {
        //     console.log({ c, type: typeof c, name: c.name })
        // }
        return new Markdoc.Tag('p', attributes, children);
    }
};
