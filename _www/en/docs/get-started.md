---
translationKey: get-started
lang: en
createdAt: 2025-10-16T08:13:00.000Z
name: Get Started
eleventyNavigation:
  title: Get Started
  order: 2
docsNav:
  section: getting-started
  order: 1
metadata:
  description: Set up your free website builder in minutes with our step-by-step guide
---

# Get Started

::: aside {.callout .prose .box .palette--tone}

## Need help or want a professionally designed site? {.h4}

We offer tailored website creation and setup assistance.

<p>{% linkSimple url="hello@poko.eco", text="Contact us", linkType="mailTo", class="cta cta-secondary" %}</p>

:::

## Before you Begin

Setting up a poko website is straightforward, but you'll need to be comfortable creating accounts and navigating web service settings. If you've set up a GitHub repository or configured hosting before, this will be a walk in the park.

**Time required:** \~15-30 minutes for first-time setup

**What you'll need:**

- A GitHub account (free)

Optional:

- A Cloudflare Pages account (free) or any other static hosting provider (Netlify, Vercel, etc.)
- A domain name

## Setup Guide

_Detailed step-by-step instructions coming soon._

**Overview of the process:**
::: div {.overview .palette--bg .width-prose .center .box}

1. Fork the [poko website builder](https://github.com/m4rrc0/poko-website-builder) repository on Github.

- ℹ️ [What is a 'Fork'?](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo)
- ⚡️ Quick link: [Fork m4rrc0/poko-website-builder](https://github.com/m4rrc0/poko-website-builder/fork)
  :::

::: div {.overview .palette--bg .width-prose .center .box} 2. Create a new fine-grained Github personal access token

- ℹ️ [What is a 'Personal Access Token' on Github?](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token)
- ⚡️ Quick link to a [pre-filled token creation form](https://github.com/settings/personal-access-tokens/new?name=poko-website-builder+token&description=Read+and+write+repo+access+for+the+CMS&expires_in=none&contents=write)
  - If you forked the repository inside an organization, change the `Resource Owner` to match your organization name
  - Feel free to set an `expiration date` or restrict the `Repository access` to specific repositories
- Copy the token value and save it in a safe place (like a password manager) - ⚠️ **Do not share this token with anyone** - ⚠️ **You will not be able to read the token from Github after you leave the page** (you can always create a new one though)
  :::

::: div {.overview .palette--bg .width-prose .center .box} 3. [Create a new project on Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/git-integration/) from the forked repository

- ⚠️ Make sure you are using a 'Pages' project, not a 'Workers' project
- Choose 'Import an existing Git repository'
- Select the forked repository as the source
- Choose a 'production' branch (usually `main`)
- Configure the build settings:
  - Build command: `bun run cf-build`
  - Publish directory: `dist`
- Click 'Create project' and wait for the first build to finish (\~30 seconds)
  :::

::: div {.overview .palette--bg .width-prose .center .box} 4. Connect to the CMS

- Find the URL of your Cloudflare Pages project (e.g. `https://project-name.pages.dev`)
- Open the URL in your browser and add `/admin` to the end (e.g. `https://project-name.pages.dev/admin`). You should see the CMS login screen.
- Choose 'Sign in with GitHub Using a PAT' and enter the token you created earlier
- The page should reload and you should be logged in
- Note: The token is saved in your browser's local storage so you won't have to enter it again in that browser. But you will need it again if you sign in from another device or browser.
  :::

::: div {.overview .palette--bg .width-prose .center .box} 5. Start editing your content

- On the first load (and only then), you will only be able to edit your 'Global Settings'. Fill in the required fields and save. You will need to wait for your site to re-build before you can see the changes.
- You can now explore the CMS interface to edit your content.
- ~~Check out our User Guide for more information.~~ (Coming soon)
  :::

## Video Walkthrough

_Video tutorial coming soon to guide you through the entire setup process._

## Next Steps

Once your site is up and running:

- Explore the CMS interface to edit your content
- Customize your design and branding
- Add pages and create your site structure
- ~~Check out our User Guide and Documentation for more information.~~ (Coming soon)

## Need Help?

Stuck on something? Here are your options:

- **Professional setup:** {{ "hello@poko.eco" | emailLink("Contact us") }} for hands-on assistance
- **Community support:** Join our [GitHub discussions](https://github.com/m4rrc0/poko-website-builder/discussions)

## Want to help us?

[Give us a Star](https://github.com/m4rrc0/poko-website-builder) on Github

We're always looking for help with testing, documentation, and community support. If you're interested, please {{ "mailto:hello@poko.eco" | emailLink("reach out by email") }} or come [discuss on Github](https://github.com/m4rrc0/poko-website-builder/discussions).

## Want to work with us?

If you are a freelancer or agency looking for a website builder to offer to your clients, we'd love to hear from you! {{ "hello@poko.eco" | emailLink("Contact us") }} right away.
