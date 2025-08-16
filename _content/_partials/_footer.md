<footer class="palette-contrast full-bleed-before flow" style="gap: 1rem;">
<address>
<p>{{ data.name }}</p>
<p>{{ data.address }}</p>
<p>{{ data.phone }}</p>
<p>{{ data.email | emailLink }}</p>
</address>
<div>
<p>Site web éco-conçu avec passion par les parents d’Oona et Liloo</p>
<p><a href="https://www.mookai.be/" target="_blank">mookaï asbl</a></p>
</div>
</footer>

{% css "external" %}
body > footer {
padding-block: 2rem;
text-align: center;
& > :is(address, div) > p {
margin-block-start: 0;
}
}
{% endcss %}
