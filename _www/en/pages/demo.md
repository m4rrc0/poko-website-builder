---
translationKey: demo
lang: en
createdAt: 2025-10-24T10:33:00.000Z
uuid: 0d9ff3624fe0
localizationKey: 28b6c009944e
status: noindex
name: Demo pages
---
# Demo page

{% links linksData=[{"type":"pages","slugs":["demo-html5","demo-poko"]}], itemLayout={}, wrapperLayout={"type":"markdown","value":" <ul>{% for link in links %}<li>{{link.html | safe}}</li>{% endfor %}<ul>"} %}
