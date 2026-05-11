export default async function ({ style, class: className, tag, content }) {
  const styleStr = style ? `style="${style}"` : "";

  return `<${tag || "div"} class="${className}" ${styleStr}>
${content}
</${tag || "div"}>`;
}
