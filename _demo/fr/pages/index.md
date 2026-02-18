---
translationKey: index
lang: fr
createdAt: 2025-07-19T20:12:00.000Z
uuid: 2530cfdfddec
localizationKey: fa748ce625bb
name: Accueil
eleventyNavigation: null
metadata:
  title: ''
  description: ''
  image: ''
tags:
  - featured
status: published
vars: null
---

# poko demo FR

{% icon "tablerOutline:device-ipad-horizontal-up" %}

{% link url="mon-article", text="article", linkType="internal", collection="articles" %}

{% link url="test@mail.com", text="bcjkqsncsqlkn", linkType="email", cc="", bcc="", subject="Hello", body="Hello\n\nWorld", class="button" %}

{% image src="/_images/POKO-logo-RVB-01.jpg", alt="poko logo square" %}

{% sectionGrid %}
{% sectionHeader %}
## My section Header

And a paragraph

{% image src="/_images/POKO-logo-RVB-01.jpg" %}
{% endsectionHeader %}
{% grid type="switcher" %}
{% gridItem %}
#### Hello inside gridItem 1
{% endgridItem %}
{% gridItem %}
#### Hello inside gridItem 2
{% endgridItem %}
{% gridItem %}
#### Hello inside gridItem 3
{% endgridItem %}
{% endgrid %}

{% endsectionGrid %}
