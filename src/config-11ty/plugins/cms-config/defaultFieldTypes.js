// Custom CMS field types ("widgets") shipped by default.
//
// Each export is an object shaped `{ name, control, preview, schema }` that
// `admin/index.html` registers with `CMS.registerWidget()`. Sveltia exposes
// `h` (React.createElement), `rf` (React.Fragment) and `createClass` on
// `window` so components can be written without a build step or JSX.
//
// `select-other` composes the built-in `select` field type via
// `CMS.getFieldType('select')` (see "Reusing a Built-In Field Type" in the
// Sveltia docs) and appends an "Other" choice which reveals a second
// built-in control below, so editors can fall back to a custom value. The
// stored value stays a plain scalar (or an array with `multiple: true`),
// exactly like `select`, so consumers of the content see no difference: a
// stored value that matches none of `options` is shown as the "other"
// choice with the value pre-filled in the free input.
//
// Field options — in addition to the ones `select` already supports
// (`options`, `multiple`, `dropdown_threshold`, `default`, `required`,
// `min`, `max`, ...):
// - `other_label` (string, default "Other"): label of the extra choice. It
//   is also used as the label of the free input it reveals.
// - `other_widget` (string, default "string"): built-in field type used for
//   the free input — one of `string`, `text`, `number`, `boolean`, `color`,
//   `datetime`, `map`, `uuid`. Any other value falls back to `string`.
//   (These are the built-in controls Sveltia allows outside the entry
//   editor via `getFieldType`.)
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

// Value appended as the "other" choice in the options handed to the
// built-in select control. It never reaches the stored value — the control
// intercepts it in `onChange` — but it is compared against stored values on
// load, so it should be a string unlikely to be used as a real option.
const OTHER_OPTION_VALUE = "__other__";

// Built-in field types Sveltia can render outside the entry editor, i.e.
// the names `getFieldType` accepts (excluding `select`, which would nest).
const REUSABLE_OTHER_WIDGETS = [
  "boolean",
  "color",
  "datetime",
  "map",
  "number",
  "string",
  "text",
  "uuid",
];

const otherLabelStyles = {
  display: "block",
  fontSize: "12px",
  fontWeight: "600",
  marginBottom: "4px",
};

// `field` is an Immutable Map per the Sveltia API; tolerate a plain object.
const fieldGet = (field, key, fallback) => {
  let raw =
    field && typeof field.get === "function" ? field.get(key) : field?.[key];
  if (raw === undefined) raw = fallback;
  return raw && typeof raw.toJS === "function" ? raw.toJS() : raw;
};

const fieldConfig = (field) =>
  field && typeof field.toJS === "function" ? field.toJS() : { ...field };

// Options can be scalars or `{ label, value }` objects.
const optionValue = (option) =>
  option !== null && typeof option === "object" ? option.value : option;

const isEmptyValue = (value) =>
  value === undefined || value === null || value === "";

// Stored values match options loosely: content saved by a previously
// `number`-typed field (e.g. `1.78`) still lands in the right place — `1`
// maps back to a "1" option, anything else shows in the free input. On the
// next save the CMS rewrites it as a string, which is acceptable.
const sameOptionValue = (a, b) => a === b || String(a) === String(b);

const getFieldType = (name) =>
  window.CMS?.getFieldType?.(name) ?? window.CMS?.getWidget?.(name);

const selectOtherControl = createClass({
  getInitialState() {
    // `otherActive` tracks the "selected but still empty" case: once the
    // user types, the value itself marks the field as "other" and this flag
    // is only needed while the free input is shown with no value yet.
    // `otherDraft` mirrors the free input's content while it is open — the
    // stored value can't be trusted for that, since a partially typed
    // value may coincide with a real option (e.g. "1" on the way to
    // "16/10") and must not collapse or clear the input.
    return { otherActive: false, otherDraft: null };
  },

  componentDidUpdate(prevProps) {
    // Collapse the free input when the stored value is reset to a known
    // option (undo, duplicated entry, programmatic update...). Guarded on an
    // actual prop change: selecting "other" emits `null` while props may
    // still hold the previous option for a beat — don't self-cancel that.
    if (!this.state.otherActive || prevProps.value === this.props.value)
      return;
    // A value matching the draft came from the free input itself — e.g.
    // typing "1" while an option "1" exists — leave the input alone.
    const { otherDraft } = this.state;
    if (otherDraft !== null && sameOptionValue(otherDraft, this.props.value))
      return;
    if (!this.isMultiple() && this.isKnown(this.props.value)) {
      this.setState({ otherActive: false, otherDraft: null });
    } else if (!this.isMultiple() && isEmptyValue(this.props.value)) {
      this.setState({ otherDraft: null });
    }
  },

  isMultiple() {
    return Boolean(fieldGet(this.props.field, "multiple", false));
  },

  getOptionValues() {
    return (fieldGet(this.props.field, "options", []) || []).map(optionValue);
  },

  isKnown(value) {
    return this.getOptionValues().some((ov) => sameOptionValue(ov, value));
  },

  // The literal option value loosely matching a stored value, so the inner
  // select can highlight it even when the stored type differs (e.g. number
  // `1` vs option `"1"`).
  matchingOptionValue(value) {
    const match = this.getOptionValues().find((ov) =>
      sameOptionValue(ov, value),
    );
    return match === undefined ? value : match;
  },

  isOtherValue(value) {
    return !isEmptyValue(value) && value !== OTHER_OPTION_VALUE && !this.isKnown(value);
  },

  // Every stored value that matches no option is the custom "other" value.
  getOtherContext() {
    const { value } = this.props;
    if (this.isMultiple()) {
      const values = Array.isArray(value) ? value : [];
      const unknowns = values.filter((v) => this.isOtherValue(v));
      return {
        values,
        unknowns,
        otherActive: this.state.otherActive || unknowns.length > 0,
        otherText:
          this.state.otherDraft ??
          (unknowns.length ? unknowns[unknowns.length - 1] : ""),
      };
    }
    const otherActive = this.state.otherActive || this.isOtherValue(value);
    return {
      values: [],
      unknowns: [],
      otherActive,
      otherText: this.state.otherDraft ?? (this.isOtherValue(value) ? value : ""),
    };
  },

  emitOtherText(text) {
    const { value, onChange } = this.props;
    const prevDraft = this.state.otherDraft;
    this.setState({ otherDraft: isEmptyValue(text) ? null : text });
    if (this.isMultiple()) {
      const values = Array.isArray(value) ? value : [];
      // The previous draft may now match a real option ("1" on the way to
      // "16/10") — drop it so it is replaced by the new text rather than
      // kept as a checked option.
      const known = values.filter(
        (v) =>
          this.isKnown(v) &&
          !(prevDraft !== null && sameOptionValue(v, prevDraft)),
      );
      onChange(isEmptyValue(text) ? known : [...known, text]);
    } else {
      onChange(isEmptyValue(text) ? null : text);
    }
  },

  // onChange of the inner select control. The sentinel never reaches the
  // stored value: it only toggles the free input.
  handleSelectChange(next) {
    const { value, onChange } = this.props;
    if (this.isMultiple()) {
      const arr = Array.isArray(next) ? next : isEmptyValue(next) ? [] : [next];
      const hasOther = arr.includes(OTHER_OPTION_VALUE);
      const clean = arr.filter((v) => v !== OTHER_OPTION_VALUE);
      const { unknowns } = this.getOtherContext();
      this.setState({
        otherActive: hasOther,
        ...(hasOther ? {} : { otherDraft: null }),
      });
      // While "other" stays checked, keep the stored custom values.
      onChange(hasOther ? [...clean, ...unknowns] : clean);
    } else if (next === OTHER_OPTION_VALUE) {
      this.setState({ otherActive: true });
      // Clear a previously selected concrete option so the draft matches
      // the UI (otherwise the old option would still be saved).
      if (this.isKnown(value)) onChange(null);
    } else {
      this.setState({ otherActive: false, otherDraft: null });
      onChange(next ?? null);
    }
  },

  render() {
    const { value, field, forID, classNameWrapper } = this.props;
    const options = fieldGet(field, "options", []) || [];
    const multiple = this.isMultiple();
    const otherLabel =
      String(fieldGet(field, "other_label", "Other") || "") || "Other";
    const otherWidget =
      String(fieldGet(field, "other_widget", "string") || "") || "string";
    const fieldName = String(fieldGet(field, "name", "field") || "field");

    const { values, unknowns, otherActive, otherText } =
      this.getOtherContext();

    // The real select control, with the "other" choice appended to the
    // options. The rest of the field config (multiple, dropdown_threshold,
    // min, max, required, i18n...) passes through untouched.
    const SelectControl = getFieldType("select")?.control;
    const selectField = {
      ...fieldConfig(field),
      options: [...options, { label: otherLabel, value: OTHER_OPTION_VALUE }],
    };
    // The sentinel option is what the select displays while "other" is
    // active; it never reaches the stored value.
    const selectValue = multiple
      ? [
          ...values.filter((v) => this.isKnown(v)).map((v) => this.matchingOptionValue(v)),
          ...(otherActive ? [OTHER_OPTION_VALUE] : []),
        ]
      : otherActive
        ? OTHER_OPTION_VALUE
        : isEmptyValue(value)
          ? null
          : this.matchingOptionValue(value);

    // The free input is another built-in control, resolved through the same
    // registry; anything unavailable (e.g. "list", "markdown") falls back
    // to a plain string input.
    const OtherControl =
      (REUSABLE_OTHER_WIDGETS.includes(otherWidget) &&
        getFieldType(otherWidget)?.control) ||
      getFieldType("string")?.control;

    // String-ish free inputs expect a string; a stored number (e.g. `1.78`
    // from a previous `number` field) is shown as its text form.
    const otherControlValue =
      ["string", "text"].includes(otherWidget) &&
      !isEmptyValue(otherText) &&
      typeof otherText !== "string"
        ? String(otherText)
        : otherText;

    return h(
      "div",
      { className: classNameWrapper },
      SelectControl
        ? h(SelectControl, {
            field: selectField,
            value: selectValue,
            forID,
            onChange: (next) => this.handleSelectChange(next),
          })
        : null,
      otherActive && OtherControl
        ? h(
            "div",
            { style: { marginTop: "8px" } },
            h(
              "label",
              { htmlFor: `${forID}-other`, style: otherLabelStyles },
              otherLabel,
            ),
            h(OtherControl, {
              field: {
                name: `${fieldName}.other`,
                label: otherLabel,
                widget: otherWidget,
              },
              value: isEmptyValue(otherControlValue) ? null : otherControlValue,
              forID: `${forID}-other`,
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
    // Reuse the built-in select preview: it prints the option's label for
    // known values and the raw value for a custom "other" one.
    const SelectPreview = getFieldType("select")?.preview;
    if (SelectPreview) return h(SelectPreview, { field, value });
    const options = (fieldGet(field, "options", []) || []).map(optionValue);
    const labelFor = (v) => {
      const i = options.indexOf(v);
      const raw = (fieldGet(field, "options", []) || [])[i];
      return i >= 0 && raw && typeof raw === "object" && raw.label !== undefined
        ? String(raw.label)
        : String(v ?? "");
    };
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
      other_widget: { type: "string", enum: REUSABLE_OTHER_WIDGETS },
    },
    required: ["options"],
  },
};
