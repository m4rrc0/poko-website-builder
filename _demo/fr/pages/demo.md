---
translationKey: demo
lang: en
createdAt: 2025-10-24T11:19:00.000Z
uuid: 4bebefc7e99a
localizationKey: 49e6ae094a58
name: Demo HTML5
eleventyNavigation:
  title: ''
  parent: ''
  order: 1
status: noindex
vars: null
---

<div id="top"></div>
<div id="backToTop" class="flex justify-end">
<a href="#top">[Top]</a>
</div>

{% partial "theme1" %}
{% partial "demo-page" %}
{% partial "theme1-css-test" %}

{% css %}
:root {
--radius-token: 0.25rem;
--radius-pill: 9999px;
--radius-round: 50%;
--radius-card: Orem;
--radius-featured: 0rem;
--radius-prose: 0.0rem;
--radius-max: 0rem;

/* Width Defaults */
--width-card: 320px;
--width-featured: 60rem;

/* 2. THEME CONFIGURATION */

/* Typography Mapping */
--font-family-heading: var(--font-stack-heading, system-ui, sans-serif);
--font-family-body: var(--font-stack-body, system-ui, sans-serif);
--font-family-code: var(--font-stack-code, monospace);

--font-weight-heading: 700;
--letter-spacing-heading: -0.02em;
--text-transform-heading: uppercase;
--line-height-heading: 1.1;

/* Colors Mapping */
--theme-color-primary: var(--theme1-v1-dark-typo, #000);
--theme-color-secondary: var(--theme1-v1-dark-alt, #f0f0f0);
--theme-color-accent: var(--theme1-v1-dark-accent, #fff);
--theme-color-bg: var(--theme1-v1-dark-contrast, #fff);

/* Layout Mapping */
--section-padding-block: var(--step-6);
--hero-padding-block: var(--step-7);
--content-max-width-text: var(--width-prose, 60ch);
--gutter: var(--step-4, 1.5rem);
--card-width: var(--width-card);

/* Decoration Mapping */
--image-radius: var(--radius-max);
--card-aspect-ratio: 1/1;
--btn-radius: var(--radius-token);

/* 3. CUSTOM OVERRIDES (Example) */
/* Uncomment or add here to override the defaults above */
/* --font-size-h1: var(--step-7); */
/* --radius-max: 2rem; */

}

#backToTop {
position: fixed;
bottom: 1rem;
right: 1rem;
background-color: var(--theme1-v1-light-typo);
color: var(--theme1-v1-light-accent);
padding: 0.5rem 1rem;
border-radius: 0.25rem;
}
#backToTop a {
color: inherit;
text-decoration: none;
background-color: var(--theme1-v1-light-typo);
color: var(--theme1-v1-light-accent);
}

{% endcss %}
