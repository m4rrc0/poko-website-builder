// Custom CMS field types ("widgets") shipped by default.
//
// Each export is an object shaped `{ name, control, preview, schema }` that
// `admin/index.html` registers with `CMS.registerWidget()`. Sveltia exposes
// `h` (React.createElement), `rf` (React.Fragment) and `createClass` on
// `window` so components can be written without a build step or JSX.
//
// `select-other` mirrors the built-in `select` field but appends an "Other"
// choice which reveals a free-form input below, so editors can fall back to
// a custom value. The stored value stays a plain scalar (or an array with
// `multiple: true`), exactly like `select`, so consumers of the content see
// no difference. A stored value that matches none of `options` is shown as
// the "other" choice with the value pre-filled in the free input.
//
// Field options — in addition to the ones `select` already supports
// (`options`, `multiple`, `dropdown_threshold`, `default`, `required`...):
// - `other_label` (string, default "Other"): label of the extra choice. It
//   is also used as the label of the free input it reveals.
// - `other_widget` (string, default "string"): widget type used for the
//   free input — one of `string`, `text`, `number`, `boolean`, `color`,
//   `date`, `datetime`. Any other value falls back to `string`.
//
// Example:
//   {
//     name: "category",
//     label: "Category",
//     widget: "select-other",
//     options: [{ label: "News", value: "news" }, { label: "Docs", value: "docs" }],
//     other_label: "Something else",
//     other_widget: "text",
//   }

const { h, createClass } = window;

// Value assigned to the "other" choice in the native <select> rendering path.
const OTHER_OPTION_VALUE = "__other__";

// Match the look of Sveltia's own textboxes.
const textboxStyles = {
  width: "100%",
  padding: "8px 16px",
  border:
    "var(--sui-textbox-border-width, 1px) solid var(--sui-textbox-border-color, #b3b3b3)",
  borderRadius: "var(--sui-textbox-border-radius, 4px)",
  backgroundColor: "var(--sui-textbox-background-color, transparent)",
  color: "var(--sui-textbox-foreground-color, inherit)",
  fontFamily: "var(--sui-textbox-font-family, inherit)",
  fontSize: "var(--sui-textbox-font-size, inherit)",
  lineHeight: "var(--sui-textbox-multiline-line-height, inherit)",
  boxSizing: "border-box",
};

const listStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const choiceStyles = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  fontWeight: "400",
};

// `field` is an Immutable Map per the Sveltia API; tolerate a plain object.
const fieldGet = (field, key, fallback) => {
  let raw =
    field && typeof field.get === "function" ? field.get(key) : field?.[key];
  if (raw === undefined) raw = fallback;
  return raw && typeof raw.toJS === "function" ? raw.toJS() : raw;
};

// Options can be scalars or `{ label, value }` objects.
const toOption = (option) =>
  option !== null && typeof option === "object"
    ? {
        label:
          option.label === undefined
            ? String(option.value)
            : String(option.label),
        value: option.value,
      }
    : { label: String(option), value: option };

const isEmptyValue = (value) =>
  value === undefined || value === null || value === "";

// Free-form input shown when "other" is selected. The `other_widget` field
// option selects which control renders; unknown names fall back to `string`.
function OtherValueInput({ id, label, widgetType, value, onChange }) {
  const shared = {
    id,
    style: textboxStyles,
    "aria-label": label,
  };
  switch (widgetType) {
    case "text":
      return h("textarea", {
        ...shared,
        rows: 4,
        value: value ?? "",
        onChange: (e) => onChange(e.target.value),
      });
    case "number":
      return h("input", {
        ...shared,
        type: "number",
        value: value ?? "",
        onChange: (e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value)),
      });
    case "boolean":
      return h("input", {
        id,
        type: "checkbox",
        "aria-label": label,
        checked: Boolean(value),
        onChange: (e) => onChange(e.target.checked),
      });
    case "color":
      return h("input", {
        ...shared,
        style: { ...shared.style, padding: "0 4px", height: "40px" },
        type: "color",
        value: value || "#000000",
        onChange: (e) => onChange(e.target.value),
      });
    case "date":
      return h("input", {
        ...shared,
        type: "date",
        value: value ?? "",
        onChange: (e) => onChange(e.target.value),
      });
    case "datetime":
      return h("input", {
        ...shared,
        type: "datetime-local",
        value: value ?? "",
        onChange: (e) => onChange(e.target.value),
      });
    case "string":
    default:
      return h("input", {
        ...shared,
        type: "text",
        value: value ?? "",
        onChange: (e) => onChange(e.target.value),
      });
  }
}

const selectOtherControl = createClass({
  getInitialState() {
    // `otherActive` tracks the "selected but still empty" case: once the user
    // types, the value itself marks the field as "other" and this flag is
    // only needed while the free input is shown with no value yet.
    return { otherActive: false };
  },

  componentDidUpdate(prevProps) {
    // Collapse the free input when the stored value is reset to a known
    // option (undo, duplicated entry, programmatic update...). Guarded on an
    // actual prop change: selecting "other" emits `null` while props may
    // still hold the previous option for a beat — don't self-cancel that.
    if (!this.state.otherActive || prevProps.value === this.props.value)
      return;
    if (!this.isMultiple() && this.isKnown(this.props.value)) {
      this.setState({ otherActive: false });
    }
  },

  isMultiple() {
    return Boolean(fieldGet(this.props.field, "multiple", false));
  },

  getOptions() {
    return (fieldGet(this.props.field, "options", []) || []).map(toOption);
  },

  isKnown(value) {
    return this.getOptions().some((option) => option.value === value);
  },

  isOtherValue(value) {
    return !isEmptyValue(value) && !this.isKnown(value);
  },

  // Every stored value that matches no option is the custom "other" value.
  getOtherContext(options) {
    const { value } = this.props;
    if (this.isMultiple()) {
      const values = Array.isArray(value) ? value : [];
      const unknowns = values.filter((v) => this.isOtherValue(v));
      return {
        values,
        unknowns,
        otherActive: this.state.otherActive || unknowns.length > 0,
        otherText: unknowns.length ? unknowns[unknowns.length - 1] : "",
      };
    }
    const otherActive = this.state.otherActive || this.isOtherValue(value);
    return {
      values: [],
      otherActive,
      otherText: this.isOtherValue(value) ? value : "",
    };
  },

  emitOtherText(text) {
    const { value, onChange } = this.props;
    if (this.isMultiple()) {
      const values = Array.isArray(value) ? value : [];
      const known = values.filter((v) => this.isKnown(v));
      onChange(isEmptyValue(text) ? known : [...known, text]);
    } else {
      onChange(isEmptyValue(text) ? null : text);
    }
  },

  selectOption(optionValue) {
    this.setState({ otherActive: false });
    this.props.onChange(optionValue);
  },

  selectOther() {
    this.setState({ otherActive: true });
    // Clear a previously selected concrete option so the draft matches the UI.
    if (!this.isMultiple()) {
      if (this.isKnown(this.props.value)) this.props.onChange(null);
    }
  },

  renderOptionChoice(option, otherActive, value) {
    return h(
      "label",
      { key: String(option.value), style: choiceStyles },
      h("input", {
        type: "radio",
        name: this.props.forID,
        checked: !otherActive && value === option.value,
        onChange: () => this.selectOption(option.value),
      }),
      h("span", null, option.label),
    );
  },

  renderDropdown(options, otherActive, value, required, otherLabel) {
    const { forID } = this.props;
    return h(
      "select",
      {
        id: forID,
        style: textboxStyles,
        value: otherActive
          ? OTHER_OPTION_VALUE
          : isEmptyValue(value)
            ? ""
            : value,
        onChange: (e) => {
          const raw = e.target.value;
          if (raw === "") {
            this.setState({ otherActive: false });
            this.props.onChange(null);
            return;
          }
          if (raw === OTHER_OPTION_VALUE) {
            this.selectOther();
            return;
          }
          // e.target.value is always a string; recover the original typed
          // option value (options may be numbers or booleans).
          const option = options.find((o) => String(o.value) === raw);
          if (option) this.selectOption(option.value);
        },
      },
      // An empty row keeps the select honest when nothing is picked yet, and
      // lets non-required fields be cleared; disabled so it can't be picked
      // manually on required fields.
      h(
        "option",
        { key: "__none__", value: "", disabled: required },
        required ? "" : "None",
      ),
      ...options.map((option) =>
        h("option", { key: String(option.value), value: option.value }, option.label),
      ),
      h("option", { key: OTHER_OPTION_VALUE, value: OTHER_OPTION_VALUE }, otherLabel),
    );
  },

  renderCheckboxChoice(option, values) {
    return h(
      "label",
      { key: String(option.value), style: choiceStyles },
      h("input", {
        type: "checkbox",
        checked: values.includes(option.value),
        onChange: (e) => {
          const known = values.filter((v) => this.isKnown(v));
          const unknowns = values.filter((v) => this.isOtherValue(v));
          const next = e.target.checked
            ? [...known, option.value]
            : known.filter((v) => v !== option.value);
          this.props.onChange([...next, ...unknowns]);
        },
      }),
      h("span", null, option.label),
    );
  },

  render() {
    const { value, field, forID, classNameWrapper } = this.props;
    const options = this.getOptions();
    const multiple = this.isMultiple();
    const required = Boolean(fieldGet(field, "required", false));
    const threshold = Number(fieldGet(field, "dropdown_threshold", 5));
    const otherLabel =
      String(fieldGet(field, "other_label", "Other") || "") || "Other";
    const otherWidget =
      String(fieldGet(field, "other_widget", "string") || "") || "string";

    const { values, otherActive, otherText } = this.getOtherContext(options);

    const selector = multiple
      ? h(
          "div",
          { id: forID, role: "group", style: listStyles },
          ...options.map((option) =>
            this.renderCheckboxChoice(option, values),
          ),
          h(
            "label",
            { key: OTHER_OPTION_VALUE, style: choiceStyles },
            h("input", {
              type: "checkbox",
              checked: otherActive,
              onChange: (e) => {
                if (e.target.checked) {
                  this.setState({ otherActive: true });
                } else {
                  this.setState({ otherActive: false });
                  this.props.onChange(values.filter((v) => this.isKnown(v)));
                }
              },
            }),
            h("span", null, otherLabel),
          ),
        )
      : options.length + 1 > threshold
        ? this.renderDropdown(options, otherActive, value, required, otherLabel)
        : h(
            "div",
            { id: forID, role: "radiogroup", style: listStyles },
            ...options.map((option) =>
              this.renderOptionChoice(option, otherActive, value),
            ),
            h(
              "label",
              { key: OTHER_OPTION_VALUE, style: choiceStyles },
              h("input", {
                type: "radio",
                name: forID,
                checked: otherActive,
                onChange: () => this.selectOther(),
              }),
              h("span", null, otherLabel),
            ),
          );

    return h(
      "div",
      { className: classNameWrapper },
      selector,
      otherActive
        ? h(
            "div",
            { style: { marginTop: "8px" } },
            h(
              "label",
              {
                htmlFor: `${forID}-other`,
                style: {
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "4px",
                },
              },
              otherLabel,
            ),
            h(OtherValueInput, {
              id: `${forID}-other`,
              label: otherLabel,
              widgetType: otherWidget,
              value: otherText,
              onChange: (text) => this.emitOtherText(text),
            }),
          )
        : null,
    );
  },
});

const selectOtherPreview = createClass({
  render() {
    const { value, field } = this.props;
    const options = (fieldGet(field, "options", []) || []).map(toOption);
    const labelFor = (v) =>
      options.find((o) => o.value === v)?.label ?? String(v);
    return h(
      "span",
      null,
      Array.isArray(value) ? value.map(labelFor).join(", ") : labelFor(value),
    );
  },
});

export const selectOther = {
  name: "select-other",
  control: selectOtherControl,
  preview: selectOtherPreview,
  schema: {
    type: "object",
    properties: {
      options: {
        type: "array",
        items: {
          oneOf: [
            { type: "string" },
            { type: "number" },
            { type: "boolean" },
            {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: ["string", "number", "boolean"] },
              },
              required: ["value"],
            },
          ],
        },
      },
      multiple: { type: "boolean" },
      dropdown_threshold: { type: "integer" },
      other_label: { type: "string" },
      other_widget: {
        type: "string",
        enum: ["string", "text", "number", "boolean", "color", "date", "datetime"],
      },
    },
    required: ["options"],
  },
};
