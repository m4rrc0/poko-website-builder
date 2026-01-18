<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="generator" content="{{ eleventy.generator }}" />
<meta name="generator" content="poko" />

{# NoIndex check #}
{% if status == "noindex" %}

<meta name="robots" content="noindex" />
{% endif %}

{# Metadata #}
{% partial "_metadata-default.md" %}
{% partial "_metadata.md" %}

{# Alternate langs #}
{% for link in templateTranslations %}

<link rel="alternate" hreflang="{{link.lang}}" href="{{baseUrl}}{{link.url}}" />

{% if link.isDefaultLang %}

<link rel="alternate" hreflang="x-default" href="{{baseUrl}}{{link.url}}" />
{% endif %}

{% if link.isCurrentLang %}

<meta property="og:locale" content="{{link.lang}}" />
{% else %}
<meta property="og:locale:alternate" content="{{link.lang}}" />
{% endif %}

{% endfor %}

{# Favicons #} {# TODO: Generate favicons, manifest, etc #}

{# HTML head injection #}

{% partial "_html-head.md" %}
{{ globalSettings.htmlHead | safe }}
{# {% getBundle "html", "head" %} #}

{{ fontPreloadTags | safe }}

{# Internal CSS: E-mail obfuscation + CSS head injection (from globalSettings) + bundle #}

{% if inlineAllStyles %}

<style>
{{externalStylesInline | safe}}
</style>

{% else %}

{{htmlExternalCssFiles | safe}}

{% endif %}

{# TODO: Avoid generating this tag if no content in the bundle #}
{% set externalBundleContent %}{% getBundle 'css', 'external' %}{% endset %}
{% if externalBundleContent == '/*__EleventyBundle:get:css:external:EleventyBundle__*/' %}
<!-- No forced external CSS bundle -->
{% else %}
<link rel="stylesheet" href="{% getBundleFileUrl 'css', 'external' %}" fetchpriority="low">
{% endif %}

<style>
{{ globalSettings.cssHead | safe }}
{% getBundle "css" %}
</style>

{# JS: detection + bundle #}

<script>
(function(H){H.className=H.className.replace(/\bno-js\b/,'js')})(document.documentElement)
{% getBundle "js" %}
</script>
