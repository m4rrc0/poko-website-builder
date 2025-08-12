---
translationKey: articles
status: published
name: Articles
eleventyNavigation:
  order: 9
---

# La parole de l'Autre École

Cette page rassemble les articles, réflexions et témoignages rédigés par les différents acteurs de notre communauté éducative : animateurs, parents, enfants et partenaires. Chaque contribution illustre une facette de notre projet pédagogique et de notre vie coopérative.

## Nos derniers articles

<div class="articles-list">
{%- for post in collections.articles -%}
  <article class="article-card">
    <h3 class="h4"><a href="{{ post.url }}">{{ post.data.title }}</a></h3>
    <div class="article-meta">
      <span class="article-date">{{ post.date | toLocaleString(lang, { dateStyle: "short" }) }}</span>
      {% if post.data.author %}<span class="article-author">par {{ post.data.author }}</span>{% endif %}
    </div>
    {% if post.data.description %}
    <p class="article-description">{{ post.data.description }}</p>
    {% endif %}
    <a href="{{ post.url }}" class="read-more">Lire la suite</a>
  </article>
{%- endfor -%}
</div>

## Contribuer à la réflexion collective

La pédagogie Freinet encourage l'expression libre et la coopération. Dans cet esprit, nous accueillons les contributions de tous les membres de notre communauté :

- **Témoignages de pratiques** partagés par les animateurs
- **Récits d'expériences** vécues par les enfants
- **Réflexions pédagogiques** des parents et partenaires
- **Comptes-rendus** des projets et événements de l'école

Si vous êtes membre de notre communauté et souhaitez proposer un article, contactez la commission Communication via l'adresse {{ "communication@autre-ecole.org" | emailLink }}.

## Archives par thématiques

Bientôt disponible : accès aux articles classés par thématiques (pédagogie Freinet, projets d'école, vie de classe, témoignages, événements...).

{% if collections.articles.length == 0 %}

<div class="notice">
  <p>Aucun article n'est publié pour le moment. Revenez prochainement !</p>
</div>
{% endif %}
