<div class="people grid-auto">
{% for ageGroup, items in collections.people | groupby("data.vars.ageGroup") %}
{% for item in items %}
<div>
<figure class="front-and-back pile">
<img
  class="person back"
  src="{{ item.data.dataList[0].src }}"
  alt="{{ item.data.name }}"
  loading="lazy"
  aria-hidden="true"
  width="450"
/>
<img
  class="person front"
  src="{{ item.data.preview.image.src }}"
  alt="{{ item.data.name }}"
  loading="lazy"
  width="450"
/>
</figure>
<p><strong>{{ item.data.name }}</strong></p>
{% if item.data.vars.role %}
<p class="h5">{{ item.data.vars.role }}</p>
{% endif %}
{% if item.data.vars.classroom %}
<p class="h5">{{ item.data.vars.classroom }}</p>
{% endif %}
{% if item.data.vars.classCycle %}
<p class="h5">{{ item.data.vars.classCycle }}</p>
{% endif %}
{% if item.data.vars.personalEmail %}
<p class="h5">{{ item.data.vars.personalEmail | emailLink }}</p>
{% endif %}
</div>
{% endfor %}
{% endfor %}
</div>

{% css %}
.people.grid-auto { --width-column-min: calc(var(--width-max) / 6); --width-column-max: calc(var(--width-max) / 3); }
.people.grid-auto .front-and-back { margin: 0; box-shadow: var(--box-shadow-grid); border-radius: var(--border-radius-grid); overflow: hidden; }
.person.front { background: var(--color-bg); }
.person { max-inline-size: 450px; aspect-ratio: 1; }
.people .h5 { margin-block-start: 0; }
/* Front and back animation */
.front-and-back > .front { opacity: 1; transition: opacity 0.1s ease-in-out; }
.front-and-back:hover > .front { opacity: 0; }
{% endcss %}

