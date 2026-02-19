---
translationKey: demo-html5
lang: en
createdAt: 2025-10-24T11:19:00.000Z
uuid: 4bebefc7e99a
localizationKey: 49e6ae094a58
status: noindex
name: Thème 1 .v2
vars: {}
---

{#TODO: faire le mapping des variables afin de les réutiliser #}

{% partial "theme1-v2" %}
{% partial "demo-page" %}
{% partial "theme1-v2-css" %}

{% css %}
:root {

/* Variables: Palette de couleurs */
--color-typo: var(--theme1-v2-light-typo);
--color-alt: var(--theme1-v2-light-alt);
--color-accent: var(--theme1-v2-light-accent);
--color-contrast: var(--theme1-v2-light-contrast);

/* Variables: width */
--width-featured: ;
--width-card: 300px;


/* Variables: border et border radius */
--border: ;
--radius-max: ;
--radius-prose: 1.8rem; /* +/- 30px */
--radius-featured: ;
--radius-card: ;
--radius-token: ;

--radius-pill: ;
--radius-round: ;

}

{% endcss %}
