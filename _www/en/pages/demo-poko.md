---
translationKey: demo-poko
lang: en
createdAt: 2025-10-24T11:25:00.000Z
uuid: b736ba6346b2
localizationKey: fff31c33de74
status: noindex
name: Demo poko
vars: {}
---
{% links linksData=[{"type":"pages","slugs":["demo"]}], itemLayout=null, wrapperLayout=null %}

# poko design demo

## Sections examples

{% section type="cover", vars={"minHeight":"","noPadding":false,"gap":""}, blocks=[{"value":"### A cover section {.centered}\n\nIt takes up vertical space","type":"markdown"}], advanced={} %}

{% section type="grid-fluid", vars={"columns":3,"gap":""}, blocks=[{"value":"A fluid grid","type":"markdown"},{"value":"Spanning 3 columns","type":"markdown"},{"value":"On large screens","type":"markdown"}], advanced={} %}

{% section type="switcher", vars={"widthWrap":"","gap":""}, blocks=[{"value":"## A switcher","type":"markdown"},{"alt":"","title":"","width":null,"aspectRatio":null,"loading":"","rawAttrs":"","type":"image","src":"/_images/poko-logo-rvb-02.webp"},{"value":"It switches between horizontal and vertical layout at once","type":"markdown"}], advanced={} %}

{% css %}

.cover, .grid-fluid, .switcher {border:3px solid CurrentColor; margin-block-start:var(--step-4);}

{% endcss %}
