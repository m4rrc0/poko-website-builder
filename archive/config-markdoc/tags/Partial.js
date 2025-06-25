import {
  varArrayToObj,
  PartialFile,
  formatPartialFileName,
  retrievePartial,
} from './_utils.js';

export const Partial = {
  inline: false,
  selfClosing: true,
  attributes: {
    file: { type: PartialFile, render: false, required: true },
    // variables: { type: Object, render: false },
    variables: { type: Array, render: false, default: [] }
  },
  transform(node, config) {
    const { file: { discriminant, value }, variables: varArray } = node.attributes;
    const file = formatPartialFileName(discriminant, value);
    const partial = retrievePartial(config, file);

    if (!partial) return null;

    const variables = varArrayToObj(varArray);

    const scopedConfig = {
      ...config,
      variables: {
        ...config.variables,
        ...variables,
        ['$$partial:filename']: file,
      },
    };

    const transformChildren = (part) =>
      part.resolve(scopedConfig).transformChildren(scopedConfig);

    return Array.isArray(partial)
      ? partial.flatMap(transformChildren)
      : transformChildren(partial);
  },
};
