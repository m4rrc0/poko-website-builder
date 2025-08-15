<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="generator" content="{{ eleventy.generator }}" />
<meta name="generator" content="poko" />

{# Metadata #}
{% include "_metadata-default.md" ignore missing %}
{% include "_metadata.md" ignore missing %}

{# Alternate langs #}
{% for link in templateTranslations %}

<link rel="alternate" hreflang="{{link.lang}}" href="{{baseUrl}}{{link.url}}" />
{% endfor %}
{% if defaultLanguage %}
<link rel="alternate" hreflang="x-default" href="{{baseUrl}}{{defaultLanguage.url}}" />
{% endif %}

{# Favicons #} {# TODO: Generate favicons, manifest, etc #}

{# HTML head injection #}

{% include "_html-head.md" ignore missing %}
{{ globalSettings.htmlHead | safe }}
{% getBundle "html", "head" %}

{# Internal CSS: E-mail obfuscation + CSS head injection (from globalSettings) + bundle #}

<style>
a[href^="mailto:"] b {display: none;}
{{ globalSettings.cssHead | safe }}
{% getBundle "css" %}
</style>

{# JS: detection + bundle #}

<script>
(function(H){H.className=H.className.replace(/\bno-js\b/,'js')})(document.documentElement)
{% getBundle "js" %}
</script>
