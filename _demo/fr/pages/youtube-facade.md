---
translationKey: youtube-facade
lang: fr
createdAt: 2026-10-04T07:00:00.000Z
uuid: 4bebefc7e99f
localizationKey: 49e6ae094a5f
name: YouTube facade
eleventyNavigation:
  title: ''
  parent: ''
  order: 3
status: noindex
vars: null
---

<div id="top"></div>

## YouTube facade (GDPR-friendly embeds)

Bare YouTube URLs become a `<lite-youtube>` facade: self-hosted poster +
disclaimer, nothing reaches Google until play is clicked.

### HD video (maxresdefault exists)

https://www.youtube.com/watch?v=dQw4w9WgXcQ

### Old 240p video (cascade: maxres+sd are 404, hq wins)

https://youtu.be/jNQXAC9IVRw

### Shorts URL

https://www.youtube.com/shorts/9d8wWcJLnFI

### URL with start time

https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s

### Playlist (unsupported by lite embeds -> stays a link)

https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
