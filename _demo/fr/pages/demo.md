---
translationKey: demo-html5
lang: en
createdAt: 2025-10-24T11:19:00.000Z
uuid: 4bebefc7e99a
localizationKey: 49e6ae094a58
status: noindex
name: Demo HTML5
vars: {}
---

<div id="top"></div>
<div id="backToTop" class="flex justify-end">
<a href="#top">[Top]</a>
</div>

{% partial "theme1" %}
{% partial "demo-page" %}
{% partial "theme1-css" %}

{% css %}
:root {
--color-typo: var(--theme1-v1-light-typo);
--color-alt: var(--theme1-v1-light-alt);
--color-accent: var(--theme1-v1-light-accent);
--color-contrast: var(--theme1-v1-light-contrast);

--width-featured: ;
--width-card: 300px;

--border: ;
--radius-max: ;
--radius-prose: ;
--radius-featured: ;
--radius-card: ;
--radius-token: ;

--radius-pill: ;
--radius-round: ;
}

#backToTop {
position: fixed;
bottom: 1rem;
right: 1rem;
background-color: rgba(0, 0, 0, 0.5);
color: white;
padding: 0.5rem 1rem;
border-radius: 0.25rem;
}
#backToTop a {
color: white;
text-decoration: none;
background: none;
}

{% endcss %}
