---
translationKey: showcase
order: null
lang: en
createdAt: 2025-11-05T14:35:00.000Z
name: Showcase
eleventyNavigation:
  order: 8
localizationKey: 02fc4e97117e
uuid: 4861cc7cab24
---
{% partial "page-header.njk", {title: "Showcase"} %}

poko is still young but here are some examples of what it can do. { .text-center}

{% sectionCollection  %}

{% collection collection="projects", type="flow", class="v--flow-space:5rem"%}{% endcollection %}

{% endsectionCollection %}

{% css %}
.collection-item h2,
.collection-item h2 a,
    .highlights li {
    }
  .collection-item ul {
    list-style: none;
    padding-left: 0;
    justify-content: center;
    align-items: center;
    margin-inline: auto;
  }
  .collection-item ul li {
    padding-inline: var(--step--1);
    border-radius: .5rem;
  }

  .collection-item ul li.small:hover {
    color: var(--color-pop);
  }

  .collection-item_header h2 {
    margin-inline: auto;
  }

  .collection-item_content {
    border-radius: var(--step--2);
    overflow: hidden;
  }
{% endcss %}