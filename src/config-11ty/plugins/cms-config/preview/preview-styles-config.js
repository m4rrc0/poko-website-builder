// Kitchen-sink preview for the stylesConfig file collection.
//
// Sveltia keys file-collection preview templates by FILE name — every file
// registered in previewTemplates.js renders this same markup. Deliberately
// content-agnostic: no collections, no eleventyComputed, no layout — just the
// default HTML a poko page emits, plus swatch sections derived from the
// resolved brand data (`ctxData` is a live bundle binding hydrated from the
// CMS store; class names like `palette-x`/`profile-y`/`ctx-z` are
// user-defined so they're generated, not hardcoded).
//
// Live-update path: editing a styles file → preparePreview →
// hydratePreviewFromCms overlays the draft onto brandConfig → deriveEnv
// recompiles ctxData + brandStyles → updateUnoStyles regenerates the
// #cms-preview-uno overlay → new vars land on :root/classes automatically.
import { ctxData } from "./preview-renderer.js";
import { renderStylesConfigPreview } from "./preview-runtime.js";

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const COLOR_ROLES = ["read", "neutral", "pop", "tone"];

// Inline-styled swatch — reads a CSS var so it follows live brand edits.
const chip = (label, cssVar) =>
  `<span style="display:inline-flex;align-items:center;gap:.4em;margin:0 .5em .5em 0"><i style="display:inline-block;width:1.2em;height:1.2em;border:1px solid currentColor;background:${cssVar}"></i><code>${esc(label)}</code></span>`;

const INLINE_SAMPLE = `<p>Body text with a <a href="#">link</a>, <strong>strong</strong>, <em>em</em>, <b>b</b>, <i>i</i>, <mark>mark</mark>, <code>code</code>, <kbd>kbd</kbd>, <samp>samp</samp>, <small>small</small>, <abbr title="abbreviation">abbr</abbr>, H<sub>2</sub>O, x<sup>2</sup>, <del>del</del>, <ins>ins</ins>.</p>`;

const STATIC_ELEMENTS = `
<h1>Kitchen sink</h1>
<p>Default HTML a poko page emits — styles update live as you edit.</p>

<section>
  <h2>Headings</h2>
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>
</section>

<section>
  <h2>Text</h2>
  ${INLINE_SAMPLE}
  <p>Second paragraph — flow spacing between blocks.</p>
  <blockquote>
    <p>A block quotation, set off from the main text.</p>
    <cite><a href="#">Said no one, ever.</a></cite>
  </blockquote>
  <hr />
  <pre><code>pre &gt; code block
const answer = 42;</code></pre>
  <address>Address element — 1 rue de l'exemple, 1000 Bruxelles</address>
</section>

<section>
  <h2>Lists</h2>
  <ul>
    <li>Unordered item</li>
    <li>Unordered item<ul><li>Nested</li></ul></li>
  </ul>
  <ol>
    <li>Ordered item</li>
    <li>Ordered item</li>
  </ol>
  <dl>
    <dt>Term</dt>
    <dd>Definition</dd>
    <dt>Term</dt>
    <dd>Definition</dd>
  </dl>
</section>

<section>
  <h2>Table</h2>
  <table>
    <caption>Caption</caption>
    <thead><tr><th>Head</th><th>Head</th></tr></thead>
    <tbody><tr><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td></tr></tbody>
    <tfoot><tr><td>Foot</td><td>Foot</td></tr></tfoot>
  </table>
</section>

<section>
  <h2>Details</h2>
  <details>
    <summary>Summary</summary>
    <p>Details content.</p>
  </details>
</section>

<section>
  <h2>Figure &amp; SVG</h2>
  <figure>
    <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="sample icon"><circle cx="32" cy="32" r="28" /></svg>
    <figcaption>Figure caption — svg fill/stroke follow color intents.</figcaption>
  </figure>
</section>

<section>
  <h2>Form</h2>
  <form>
    <fieldset>
      <legend>Legend</legend>
      <p><label>Text <input type="text" placeholder="placeholder" /></label></p>
      <p><label>Email <input type="email" /></label></p>
      <p><label>Number <input type="number" value="3" /></label></p>
      <p><label>Date <input type="date" /></label></p>
      <p><label>Color <input type="color" value="#3366cc" /></label></p>
      <p>
        <label>Select
          <select>
            <optgroup label="Group"><option>Option A</option><option>Option B</option></optgroup>
          </select>
        </label>
      </p>
      <p><label>Textarea<br /><textarea rows="3">Textarea</textarea></label></p>
      <p><label><input type="checkbox" checked /> Checkbox</label></p>
      <p><label><input type="radio" name="r" checked /> Radio</label> <label><input type="radio" name="r" /> Radio</label></p>
      <p><label>Range <input type="range" value="40" /></label></p>
      <p><progress value="40" max="100">40%</progress> <meter value="0.6">60%</meter></p>
      <p>
        <button type="button">Button</button>
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
        <button type="button" disabled>Disabled</button>
      </p>
      <p><output>Output element</output></p>
    </fieldset>
  </form>
</section>
`;

// Per-palette block: role bindings + extras resolve inside `palette-{name}`
// because the slot/intent reset re-declares on every [class*="palette"].
const paletteSection = (p) => `
<section class="palette-${esc(p.name)}">
  <h3><code>.palette-${esc(p.name)}</code></h3>
  <p>${COLOR_ROLES.map((r) => chip(r, `var(--color-${r}-palette)`)).join("")}${(
    p.extras ?? []
  )
    .map((e) => chip(e.name, `var(--color-${e.name}-palette)`))
    .join("")}</p>
  ${INLINE_SAMPLE}
  <p><button type="button">Button</button></p>
</section>`;

const profileSection = (prof) => `
<section class="profile-${esc(prof.name)}">
  <h3><code>.profile-${esc(prof.name)}</code></h3>
  ${INLINE_SAMPLE}
</section>`;

const named = (list) =>
  (Array.isArray(list) ? list : []).filter((i) => i?.name);

export const buildKitchenSink = (ctx) => {
  ctx = ctx ?? {};
  const sections = [];
  const colors = named(ctx.colors);
  if (colors.length)
    sections.push(
      `<section><h2>Color tokens</h2><p>${colors
        .map((c) => chip(c.name, `var(--${c.name})`))
        .join("")}</p></section>`,
    );
  for (const p of named(ctx.palettes)) sections.push(paletteSection(p));
  // `.profile-*` classes are only emitted when at least 2 profiles exist
  // (the first profile is the default intent map) — same gate as ctx-css.
  const profiles = named(ctx.colorProfiles);
  if (profiles.length > 1)
    for (const prof of profiles) sections.push(profileSection(prof));
  for (const c of named(ctx.settings?.styleContexts))
    sections.push(
      `<section class="ctx-${esc(c.name)}"><h3><code>.ctx-${esc(c.name)}</code></h3>${INLINE_SAMPLE}<p><button type="button">Button</button></p></section>`,
    );
  for (const w of named(ctx.spaces?.widthsContexts))
    sections.push(
      `<section><h3><code>.widths-${esc(w.name)}</code></h3><div class="widths-${esc(
        w.name,
      )}"><p style="max-width:var(--width-prose);border:1px dashed currentColor;padding:.5em">prose width</p><p style="max-width:var(--width-page);border:1px dashed currentColor;padding:.5em">page width</p></div></section>`,
    );
  for (const f of named(ctx.fontStacksContexts))
    sections.push(
      `<section class="fonts-${esc(f.name)}"><h3><code>.fonts-${esc(f.name)}</code></h3><h4>Heading font</h4><p>Body font — the quick brown fox jumps over the lazy dog.</p><pre><code>code font</code></pre></section>`,
    );
  for (const t of named(ctx.typeScales))
    sections.push(
      `<section class="type-scale-${esc(t.name)}"><h3><code>.type-scale-${esc(t.name)}</code></h3><h1>H1</h1><h2>H2</h2><h3>H3</h3><p>body</p><p><small>small</small></p></section>`,
    );
  return `${STATIC_ELEMENTS}\n<section><h2>Brand contexts</h2><p>Classes below are generated from your brand config.</p></section>\n${sections.join("\n")}`;
};

// Render fn for the previewTemplates adapter — ctxData is a live binding, so
// this reads the freshly-hydrated values at render time.
export const renderStylesConfigSink = () =>
  renderStylesConfigPreview(buildKitchenSink(ctxData));
