{% set docsPages = collections.docs
  | filterCollection([{ by: "lang", value: lang }])
  | sortCollection([{ by: "docsNav.order", direction: "asc" }]) %}

{% set navSections = [
  { key: "getting-started", label: "Getting Started" },
  { key: "content",         label: "Content" },
  { key: "building-pages",  label: "Building Pages" },
  { key: "advanced",        label: "Advanced" }
] %}

<nav class="docs-nav-sidebar flow">
  {% for section in navSections %}
    {%- set sectionPages = docsPages | filterCollection([{ by: "docsNav.section", value: section.key }]) %}
    {%- if sectionPages | length %}
      {%- set sectionUrls = [] %}
      {%- for p in sectionPages %}{%- set __ = (sectionUrls.push(p.url), null) %}{%- endfor %}
      <details class="docs-nav-group"{% if page.url in sectionUrls %} open{% endif %}>
        <summary class="docs-nav-section-title">{{ section.label }}</summary>
        <ul role="list" class="docs-nav-list reset">
          {%- for p in sectionPages %}
          <li><a href="{{ p.url }}"{% if p.url == page.url %} aria-current="page"{% endif %}>{{ p.data.name }}</a></li>
          {%- endfor %}
        </ul>
      </details>
    {%- endif %}
  {%- endfor %}
</nav>

{% css %}

.docs-nav-group {
  border-inline-start: 2px solid transparent;
  transition: border-color 0.15s;
  margin-inline: 0;
}

.docs-nav-group[open] {
  border-inline-start-color: var(--color-pop);
}

.docs-nav-section-title {
  text-transform: uppercase;
  color: var(--color-pop);
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding-inline-start: var(--step--2);
}

.docs-nav-section-title::before {
  content: '';
  display: inline-block;
  width: 0.5em;
  height: 0.5em;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(-45deg);
  transition: transform 0.2s;
  flex-shrink: 0;
}

details[open] .docs-nav-section-title::before {
  transform: rotate(45deg);
}

.docs-nav-list {
  margin: 0;
  padding-block: var(--step--3);
  font-family: Calibri, sans-serif;
  display: flex;
  flex-direction: column;
  gap: var(--step--3);
}

.docs-nav-list a {
  text-decoration: none;
  font-size: var(--step--1);
  padding-inline-start: var(--step-0);
  border-inline-start: 2px solid transparent;
  display: block;
  color: var(--color-text);
}

.docs-nav-list a:hover,
.docs-nav-list a[aria-current="page"] {
  color: var(--color-pop);
  border-inline-start-color: var(--color-pop);
}
{% endcss %}
