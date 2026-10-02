---
translationKey: get-started
lang: en
createdAt: 2025-10-16T08:13:00.000Z
name: Get Started
eleventyNavigation:
  title: Get Started
  order: 2
docsNav:
  section: start-here
  order: 1
metadata:
  description: Set up your free poko website in about 15–30 minutes, no code required
---

# Get Started

This guide takes you from zero to a live website you can edit yourself. Everything happens in your browser — you will never need to install anything or touch a line of code.

::: aside {.callout .prose .box .palette--tone}

## Need help or want a professionally designed site? {.h4}

We offer tailored website creation and setup assistance.

<p>{% linkSimple url="hello@poko.eco", text="Contact us", linkType="mailTo", class="cta cta-secondary" %}</p>

:::

## Before you begin

**Time required:** \~15–30 minutes for first-time setup.

**What you need:**

- A [GitHub](https://github.com) account (free)

**Optional:**

- A [Cloudflare](https://www.cloudflare.com) account (free) — the recommended hosting, or any other static host (Netlify, Vercel…). GitHub Pages also works and needs no extra account.
- A domain name (you can buy one later and attach it anytime)

::: aside {.review-note}

**REVIEW — @m4rrc0:** The screenshots below come from the old French tutoriels (`_images/tutos/`). Some show outdated GitHub/Cloudflare UI in French. Flag the ones you want re-captured — or drop replacements in `_images/tutos/` and I'll rewire them.

:::

## How it works, in one picture

1. **Fork** the poko repository → your own copy of the whole website lives on your GitHub account.
2. **Host it** on Cloudflare Pages or GitHub Pages → every save rebuilds your site automatically.
3. **Edit it** through the CMS at `your-site/admin` → a friendly interface that writes your changes back to the repository for you.

## Step 1 — Fork the repository

A *fork* is your own copy of the poko project, stored on your GitHub account. Everything you change stays in your copy; the original project is untouched.

- Make sure you are logged into GitHub, then open [m4rrc0/poko-website-builder](https://github.com/m4rrc0/poko-website-builder) and click **Fork** (top right). ⚡️ Quick link: [Fork the repo](https://github.com/m4rrc0/poko-website-builder/fork)

{% image src="/_images/tutos/fork.webp" %}

- Give your project a name (this becomes part of your free web address) and an optional description, then click **Create fork**.

{% image src="/_images/tutos/2-new-fork.webp", width="600" %}

You now own a complete copy of the website builder.

> **Tip — multiple sites?** GitHub allows one free site per account, but you can create free *organizations* (each with their own fork and site) as many times as you like. See [Collaborators & organizations](/en/docs/collaborators/).

## Step 2 — Create a personal access token

The CMS needs permission to save your edits back into the repository. You grant that with a **token** — a secret string that works like a password limited to your repository.

> ⚠️ Treat a token like a password: never share it, and store it somewhere safe (a password manager is ideal). GitHub will only show it once — if you lose it, just create a new one.

- Open the [pre-filled token creation form](https://github.com/settings/personal-access-tokens/new?name=poko-website-builder+token&description=Read+and+write+repo+access+for+the+CMS&expires_in=none&contents=write).
- Review the pre-filled settings:
  - If you forked into an *organization*, change **Resource owner** to your organization name.
  - Optionally set an expiration date or restrict **Repository access** to just your fork.
- Click **Generate token** at the bottom.

{% image src="/_images/tutos/3-creation-de-token.webp", width="600" %}

- **Copy the token** and save it in your password manager — you will paste it once when you first log into the CMS.

{% image src="/_images/tutos/6-token.webp", width="600" %}

## Step 3 — Put your site online

Pick one of the two free hosting options below. Cloudflare Pages is the recommended one (faster builds, nicer URLs); GitHub Pages needs no extra account.

### Option A — Cloudflare Pages (recommended)

- Create a free [Cloudflare](https://www.cloudflare.com) account, then go to **Workers & Pages → Create → Pages → Import an existing Git repository** and connect your GitHub account.
- Select your forked repository.

{% image src="/_images/tutos/9-chois-du-compte.webp", width="600" %}

- Configure the build settings:
  - **Production branch:** `main`
  - **Build command:** `bun run cf-build`
  - **Build output directory:** `dist`
- Click **Save and Deploy** and wait \~30 seconds for the first build.

{% image src="/_images/tutos/12-configurer-les-versions-et-les-deploiements-2.webp", width="600" %}

- When it succeeds, Cloudflare gives your site an address like `https://your-project.pages.dev`. **Keep this URL — it is your site.**

::: aside {.review-note}

**REVIEW — @m4rrc0:** `cf-build` and `build` are identical aliases in `package.json` — kept `cf-build` per your existing docs. Remove this note if confirmed.

:::

### Option B — GitHub Pages (no extra account)

Your fork ships a **Deploy Site** workflow (`.github/workflows/deploy.yml`) that builds and publishes to GitHub Pages automatically — including every later publish.

- In your fork on GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.

{% image src="/_images/tutos/3-giyhub-action.webp", width="600" %}

- Open the **Actions** tab and enable workflows if asked. The next push to `main` deploys automatically — or select **Deploy Site → Run workflow** with the `github-pages` target to trigger it now.

{% image src="/_images/tutos/6-run-workflow.webp", width="600" %}

- When the workflow finishes, your site is live at `https://your-username.github.io/your-repo/`.

::: aside {.review-note}

**REVIEW — @m4rrc0:** `deploy.yml` reads GitHub *vars* (`BASE_URL`, `PROD_URL`, `CONTENT_DIR`…). For a fork under a `/<repo>/` Pages path, does `BASE_URL` need to be set to `/your-repo/` (or similar) for assets/links to work? One line on which vars a GitHub-Pages fork must set, and I'll add it.

:::

## Step 4 — Log into the CMS

The CMS (Content Management System) is the friendly interface where you'll do all your editing.

- Go to your site address and add `/admin` at the end — for example `https://your-project.pages.dev/admin`.
- Choose **Sign in with GitHub Using a PAT** and paste the token from step 2.

{% image src="/_images/tutos/17-cms-connection-admin.webp", width="500" %}

You're in! The token is remembered in this browser; you'll need it again on other devices or browsers.

## Step 5 — First configuration

On the very first visit, the CMS only lets you edit **Global Settings** — fill it in before anything else.

- Open **Global Settings** in the sidebar.

{% image src="/_images/tutos/20-cms-pages-d-accueil-vide.webp" %}

- Set your **Site Name**.
- Set **Production URL** to your full site address, e.g. `https://your-project.pages.dev` (keep the `https://`, no trailing `/admin`).

{% image src="/_images/tutos/21-cms-settings-url.webp", width="300" %}

- Open **Languages** and add the language(s) your site will use (at least one, marked published).

{% image src="/_images/tutos/22-cms-settings-langue-1.webp", width="300" %}

- Fill every required field (marked `*`), then click **Save and Publish** in the top-left (under the Save arrow).

{% image src="/_images/tutos/24-cms-save-and-publish.webp", width="300" %}

- Wait a minute or two while your site rebuilds, then refresh your site. When your site name appears — you're live. 🎉

{% image src="/_images/tutos/26-cms-fin.webp", width="200" %}

## Next steps

Your site is online. Now learn the tools:

- [The CMS interface](/en/docs/cms-tour/) — find your way around
- [Pages](/en/docs/pages/) — create and organize your pages
- [Sections](/en/docs/sections/) — build page layouts visually
- [Brand & design](/en/docs/brand-design/) — colors, fonts and palettes

## Need help?

- **Professional setup:** {{ "hello@poko.eco" | emailLink("Contact us") }} for hands-on assistance
- **Community support:** [GitHub discussions](https://github.com/m4rrc0/poko-website-builder/discussions)
- **Troubleshooting:** [common issues & fixes](/en/docs/troubleshooting/)
