export const For = {
  inline: false,
  selfClosing: false,
  attributes: {
    primary: { type: Array, required: true },
    as: { type: String, required: false },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const { primary: list, as } = attributes;

    if (!list) return null;
    if (!Array.isArray(list)) return null;
    if (list.length === 0) return null;

    return list.map((item, index) => {
      let i;
      if (typeof item === "object") i = { ...item, index };
      else i = item;

      const scopedConfig = {
        ...config,
        variables: {
          ...config.variables,
          [as || "i"]: i,
        },
      };

      const transformChildren = (part) =>
        part.resolve(scopedConfig).transformChildren(scopedConfig);

      return Array.isArray(node.rawChildren)
        ? node.rawChildren.flatMap(transformChildren)
        : transformChildren(node.rawChildren);
    });
  },
};
