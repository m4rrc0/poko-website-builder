{% set navPages = collections.all | filterCollection([{ by: 'lang', value:
lang }, { by: 'parent', value: undefined }]) | eleventyNavigation %}

{% if navPages | length %}

<header>
<a href="/">
<img src="/_images/logo-AE-new-blue.svg" alt="" loading="eager" class="nav-logo" />
</a>
<nav>
<!-- Main pages navigation -->
<ul role="list" id="main-nav">
    {% for link in navPages %}
    <li>
    {# prettier-ignore #}
    <a
        href="{{link.url}}"
        hreflang="{{link.lang}}"
        {% if link.url == page.url %}aria-current="page"{% endif %}
        >{{link.title}}</a
    >
    </li>
    {% endfor %}
</ul>
</nav>

</header>
{% endif %}
