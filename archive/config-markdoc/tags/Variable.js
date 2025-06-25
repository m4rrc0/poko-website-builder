import Markdoc from "@markdoc/markdoc";
import { getNestedValue, tryMatchNestedVariable } from "../../utils/objects.js";

// const globalKeys = ['item', ['item', 'data'], ['item', 'page'], '', 'page', 'globalSettings' ]

export const Variable = {
    // render: 'link-c',
    attributes: {
      key: { type: String, required: true }
    },
    transform: (node, config) => {
        const attributes = node.transformAttributes(config);
        const { key } = attributes;
        const className = 'Variable'
        let style = ''

        // let i = 0;
        // let value = undefined;
        // // Try and match more specific selectors first, then bare one, then globals
        // while (!value && i < globalKeys.length) {
        //   if (Array.isArray(globalKeys[i])) {
        //     value = getNestedValue(config.variables?.[globalKeys[i][0]]?.[globalKeys[i][1]], key);
        //   } else if (!globalKeys[i]) {
        //     value = getNestedValue(config.variables, key);
        //   } else {
        //     value = getNestedValue(config.variables?.[globalKeys[i]], key);
        //   }
        //   i++;
        // }

        const value = tryMatchNestedVariable(config.variables, key);

        if (!value) {
            value = `⚠️ ${key} (not found)`;
            style = 'outline: 1px solid red; padding: 0 0.5rem;'
        }
        
        // TODOs: 
        // - Make it possible to apply functions / filters
        // - Strigify non string values. How? Should we format dates, arrays (with ', '), etc.?
        
        return new Markdoc.Tag("span", {class: className, style}, value);
      }
}
