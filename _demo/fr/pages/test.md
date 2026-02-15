---
translationKey: test
lang: fr
createdAt: 2025-07-21T21:32:00.000Z
uuid: 67aafa1236a4
localizationKey: c7f9edeffc0c
name: Test
status: published
vars: null
body:data: null
---

# Page Test

Avec contenu

{% partial "test.md" %}

{% wrapper tag="section", class="box", id="awesome" %}
Some content !{% n %}{% n %}{% wrapper tag="footer", class="box" %}My section footer{% endwrapper %}
{% endwrapper %}
