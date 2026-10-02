---
translationKey: introduction
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Introduction
docsNav:
  section: start-here
  order: 2
metadata:
  description: What poko is and how its pieces fit together
---

# Introduction

**poko** is a website builder for small teams, non-profits and freelancers: you own everything (content, design, hosting), it costs nothing to run, and you edit it through a friendly admin interface — no code required.

## The moving parts

Four pieces work together:

1. **The repository** — your website's home on GitHub. It stores every page, image and setting as plain files you own forever. You get your own copy by *forking*.
2. **The CMS** — the admin interface at `your-site/admin`. It reads and writes the files in your repository for you, so editing feels like using a word processor rather than a code editor.
3. **The site generator** — every time you save, your content files are turned into a fast static website (this is called a *build*).
4. **The host** — a free service (Cloudflare Pages, GitHub Pages…) that builds and serves your site to visitors.

```
you edit → CMS saves to GitHub → host rebuilds → visitors see the new site
```

## Which docs should I read?

- **You create content and never want to see code** → follow **For Editors** in the sidebar. Start with [Get Started](/en/docs/get-started/) if your site isn't set up yet.
- **You are a developer** → jump to **For Developers** for setup, architecture and reference material.

::: aside {.review-note}

**REVIEW — @m4rrc0:** a diagram of the four pieces (repo ↔ CMS ↔ host) would be great here. I can generate a simple SVG if you'd like — say the word.

:::

## Concepts used everywhere

These four ideas come back constantly — the editor docs explain each in context, so a one-line memory of each is enough for now:

- **Sections** — the horizontal blocks a page is made of (a grid of cards, a two-column block…). You build pages by stacking sections.
- **Palettes** — your site's color sets. Any page or section can switch palette; variants (contrast, pop…) derive automatically.
- **Partials** — reusable snippets (header, footer, cards…) defined once and inserted anywhere.
- **Utility classes** — a shared vocabulary of style names (`width-prose`, `breathe`…) that the CMS offers as pick-lists, so design stays consistent.
