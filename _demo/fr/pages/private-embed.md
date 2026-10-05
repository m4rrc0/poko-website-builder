---
translationKey: private-embed
lang: fr
createdAt: 2026-10-04T07:00:00.000Z
uuid: 4bebefc7e99f
localizationKey: 49e6ae094a5f
name: Private embeds
eleventyNavigation:
  title: ''
  parent: ''
  order: 3
status: noindex
vars: null
---

<div id="top"></div>

## Private embeds (GDPR-friendly)

`{% embed url="…" %}` renders a `<lite-youtube>` / `<lite-vimeo>` facade:
self-hosted poster + disclaimer, nothing reaches the provider until play is
clicked.

### YouTube — HD video (maxresdefault exists)

{% embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" %}

### YouTube — old 240p video (cascade: maxres+sd are 404, hq wins)

{% embed url="https://youtu.be/jNQXAC9IVRw" %}

### YouTube — Shorts URL

{% embed url="https://www.youtube.com/shorts/9d8wWcJLnFI" %}

### YouTube — URL with start time (t=42s)

{% embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s" %}

### YouTube — with free + utility classes and a title override

{% embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ", class="my-embed-class", title="Custom label", start=10 %}

### Vimeo

{% embed url="https://vimeo.com/76979871" %}

### Unsupported URL (playlist / unknown host -> stays a link)

{% embed url="https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf" %}

### Bare URL (auto-transform is off -> stays a link)

https://www.youtube.com/watch?v=dQw4w9WgXcQ
