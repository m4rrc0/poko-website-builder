class PartialFile {
  validate(file, config) {
    const { partials = {} } = config;
    const partial = partials[file];

    if (!partial)
      return [
        {
          id: 'attribute-value-invalid',
          level: 'error',
          message: `Partial \`${file}\` not found. The 'file' attribute must be set in \`config.partials\``,
        },
      ];

    return [];
  }
}

export const partial = {
  inline: false,
  selfClosing: true,
  attributes: {
    file: { type: PartialFile, render: false, required: true },
    variables: { type: Object, render: false },
  },
  transform(node, config) {
    const { partials = {} } = config;
    const { file, variables } = node.attributes;
    const partial = partials[file];

    if (!partial) return null;

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