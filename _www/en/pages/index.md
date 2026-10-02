---
translationKey: index
order: null
lang: en
createdAt: 2025-09-30T20:01:00.000Z
name: The Liberating Website Builder
metadata:
  description: poko is a lightweight, eco-focused, powerful, hackable website builder for the people
  image:
    src: /_images/device-set_v01_mockup-poko.webp
pageLayout: homepage
localizationKey: 8c143928dd34
uuid: b59c6173211c
---

::: section

## Why poko?

Most website builders lock you into expensive subscriptions and proprietary systems. We want to build something different.

### Free & independent {.h4}

Host your site for free on modern static platforms. No subscriptions, no vendor lock-in.
We will even let you use our domain name for free if you want.

### Planet-friendly by default {.h4}

Your site emits \~90% less CO² than typical WordPress or Wix sites. Lightweight code means faster loading, smoother performance, better SEO and a lighter footprint.

### Ridiculously simple {.h4}

No database. No plugins. Your content lives in readable files you control. Updates are optional. Maintenance is optional. Everything just works.

### Secure & future-proof {.h4}

Static sites can't execute malicious code—hackers have no way in. No security updates needed. Set it up once, and it stays secure.

{% linkSimple url="get-started", text="Get Started", linkType="internal", class="cta" %}
:::

::: section

## How it works

**1. Set up your project**
Clone the starter template, install dependencies, and configure your site. Takes about 15 minutes.

**2. Edit with the CMS**
Use the no-code interface to manage your content. Or dig into the code if you want—nothing is hidden.

**3. Deploy and go live**
Push to GitHub, connect to free hosting, and your site goes live. Updates deploy automatically.

{% linkSimple url="get-started", text="Get Started", linkType="internal", class="cta" %}
:::

{% css %}
main {
padding-block-start: 0;
}
.scroll {
--scroll-arrow-ratio: var(--step-2);
inline-size: var(--scroll-arrow-ratio);
block-size: var(--scroll-arrow-ratio);
margin-inline: auto;
animation: down 1.5s infinite;
align-items: center;
justify-items: center;
width: fit-content;
margin-block-end: var(--step-2) !important;
}

@keyframes down {
0% {transform: translate(0);}
20% {transform: translateY(calc(var(--scroll-arrow-ratio) / 4));}
40% {transform: translate(0);}
}

.hero-homepage {
  margin-block: auto;
}

{% endcss %}
