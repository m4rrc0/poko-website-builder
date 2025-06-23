import Markdoc from "@markdoc/markdoc";

export const Image = {
    // inline: true,
    // selfClosing: true,
    transform: (node, config) => {
        const { eleventy: ty = {}, ...attributes } = node.attributes || {};
        const src = attributes.src?.replaceAll(/\\_/g, '_');
        const alt = attributes.alt || "";
        const className = `image ${attributes.class || ""}`;
        const eleventyProps = Array.from(Object.entries(ty)).reduce((acc, [key, value]) => {
          acc['eleventy:' + key] = value;
          return acc;
        }, {});

        console.log({ src, alt, ty, attributes, eleventyProps })
        
        return new Markdoc.Tag("img", { ...attributes, ...eleventyProps, src, alt, class: className });
      }
}
