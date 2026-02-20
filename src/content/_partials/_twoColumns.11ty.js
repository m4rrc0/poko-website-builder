class TwoColumns {
  async render({
    content,
    type,
    gap,
    class: className,
    // Switcher options
    widthWrap,
    // Fixed-fluid options
    fixedSide,
    widthFixed,
    widthFluidMin,
  }) {
    let layoutClass;
    let styles = {};
    let modifierClass = "";

    if (type === "fixedFluid") {
      layoutClass = "fixed-fluid";
      // small="fixedLeft" → no extra class (left is default)
      // small="fixedRight" → add "fixed-right" class
      modifierClass = fixedSide === "fixedRight" ? "fixed-right" : "";
      styles = {
        "--width-fixed": widthFixed || undefined,
        "--width-fluid-min": widthFluidMin || undefined,
        "--gap-fixed-fluid": gap || undefined,
      };
    } else {
      // Default: switcher (Symmetrical)
      layoutClass = "switcher";
      styles = {
        "--width-wrap": widthWrap || undefined,
        "--gap": gap || undefined,
      };
    }

    let styleStr = Object.entries(styles)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");
    styleStr = styleStr ? `style="${styleStr}"` : "";

    const classes = ["two-columns", layoutClass, modifierClass, className || ""]
      .filter(Boolean)
      .join(" ");

    return `<div class="${classes}" ${styleStr}>
${content}
</div>
{% css %}
.fixed-fluid {
  --width-fixed: calc(var(--width-max) - var(--width-prose) - var(--gap-fixed-fluid, 1em));

}
{% endcss %}
{% partial "styles/_twoColumns" %}
`;
  }
}

export default TwoColumns;
