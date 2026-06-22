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
{# Has to be outside... Something to do with content rendering as md or something like that. It escapes the <head> #}
{# {% getBundle "html", "head" %} #}

{{ fontPreloadTags | safe }}

{# Order of CSS imports for cascade: CTX, Uno, Proj. Stylesheets, Proj. external bundle, Proj. CssHead, Proj. CSS bundles #}
{# UnoCSS styles contain brand styles as preload #}

{% if inlineAllStyles %}

<style eleventy:ignore>
/* CTX CSS Styles */
{{CtxCssInline | safe}}
/* UnoCSS Styles */
.noop-load-uno{}
/* Project Stylesheets */
{{externalStylesInline | safe}}
</style>

{% else %}

<!-- CTX CSS Styles -->

{{htmlExternalCtxCssTag | safe}}

<!-- UnoCSS Styles -->
<style eleventy:ignore>
.noop-load-uno{}
</style>
<!-- Project Stylesheets -->

{{htmlExternalCssTags | safe}}

{% endif %}

{# NOTE: Avoid generating this tag if no content in the bundle #}
{% set externalBundleContent %}{% getBundle 'css', 'external' %}{% endset %}
{% if externalBundleContent == '/*__EleventyBundle:get:css:external:EleventyBundle__*/' %}

<!-- No forced external CSS bundle -->

{% else %}

<link rel="stylesheet" href="{% getBundleFileUrl 'css', 'external' %}" fetchpriority="low" data-forced-external-css>
{% endif %}

<style eleventy:ignore>
/* globalSettings.cssHead */
{{ globalSettings.cssHead | safe }}
/* CSS template bundles */
{% getBundle "css" %}
</style>

{# JS: detection + bundle #}

<script eleventy:ignore>
(function(H){H.className=H.className.replace(/\bno-js\b/,'js')})(document.documentElement)
{% getBundle "js" %}
</script>

<script src="{% getBundleFileUrl 'js', 'async' %}" async fetchpriority="low" eleventy:ignore></script>
<script src="{% getBundleFileUrl 'js', 'defer' %}" defer fetchpriority="low" eleventy:ignore></script>

{% partial "_metadata-jsonld" %}

<script src="/assets/js/instant-page.js" type="module" eleventy:ignore></script>
