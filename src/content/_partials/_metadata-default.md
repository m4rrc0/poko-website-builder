{# TODO: Improve metadata #}
{% set metaImage = metadata.image.src or metadata.image %}

<title>{{ metadata.title }}</title>
<meta property="og:title" content="{{ metadata.title }}" />

{% if metadata.description %}

<meta name="description" content="{{ metadata.description }}" />
<meta property="og:description" content="{{ metadata.description }}" />
{% endif %}
{% if metaImage %}
<meta name="image" content="{{ metaImage | ogImage }}" />
<meta property="og:image" content="{{ metaImage | ogImage }}" />
<meta property="og:image:url" content="{{ metaImage | ogImage }}" />
<meta property="twitter:image" content="{{ metaImage | ogImage }}" />
{% endif %}
