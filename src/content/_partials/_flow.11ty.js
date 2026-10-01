export default function ({
  content,
  type,
  gap,
  recursive,
  class: className,
  tag,
}) {
  const styles = { "--flow-space": gap };
  let styleStr = Object.entries(styles)
    .filter(([_, value]) => value)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
  styleStr = styleStr ? `style="${styleStr}"` : "";

  return `<${tag || "div"} class="layout area main list-flow ${type || "flow"} ${recursive ? "recursive" : ""} ${className || ""}" ${styleStr}>
${content}
</${tag || "div"}>`;
}
