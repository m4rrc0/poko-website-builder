---
translationKey: introduction-setup
order: 13
lang: en
createdAt: 2026-05-13T08:33:00.000Z
ldType: WebPage
name: Introduction & setup
docsNav:
  section: developers
  order: 1
vars: {}
---
{% raw %}
Poko is a lightweight, high-performance website builder tailored for seamless web development and content management. Why choose poko over other builders? It stands out with its **native internationalization (i18n)**, ensuring your content is ready for a global audience right out of the box. It features a **fluid design system**, allowing you to craft beautiful, responsive interfaces effortlessly. Built for speed, poko guarantees **top-tier performance** for both the end-user and the developer.

The source code is available on the open-source repository: 
[https://github.com/m4rrc0/poko-website-builder](https://github.com/m4rrc0/poko-website-builder)

Depending on your goal with poko website builder:

### 1. Create your own site (fork)

- **Fork** the repository to your GitHub account.
- Then, **clone** the project to your machine:

```bash
git clone https://github.com/YOUR_USERNAME/poko-website-builder.git
```

### 2. For testing only (clone)

- **Clone** the repository directly:

```bash
git clone https://github.com/m4rrc0/poko-website-builder.git
```

## Project architecture

The project strictly separates source code from content files — see [Architecture](/en/docs/architecture/) for the full tour:

- `src`: Contains the source code (Eleventy configuration, JavaScript, CSS).
- `_content` (or your `CONTENT_DIR`): Contains site files only (Markdown, images). This is where the CMS operates to avoid merge conflicts.
- `dist`: The final generated site directory (Do not modify manually).
- `eleventy.config.js`: The Eleventy configuration file.

## Environment variables (.env)

Create a `.env` file at the root with the following variables:

```yaml
DEBUG=false
NODE_ENV=development
CMS_AUTH_URL="https://sveltia-cms-auth.workers.dev/"
BUILD_LEVEL="draft"
CONTENT_DIR="_content"
REPO="my-org/poko-website-builder"
PROD_BRANCH="my-project/prod"
BRANCH="my-project/prod"
CONTENT_PATH_PREFIX="../../other-directory/poko-website-builder"
```

Here is a breakdown of the key variables and their roles:

- **`DEBUG` & `NODE_ENV`**: Standard variables for controlling debug logging and setting the environment (development vs. production).
- **`CMS_AUTH_URL`**: The authentication endpoint for the CMS. It handles the OAuth login to your Git repository (e.g., when using Sveltia CMS).
- **`BUILD_LEVEL`**: Determines which content is included in the build. For instance, setting it to `draft` will include draft articles, while other levels might restrict the build to published content only.
- **`CONTENT_DIR`**: Specifies the directory where your content files (like Markdown and images) are stored. You can point this to your own custom content folder instead of the default `_content`.
- **`REPO`, `PROD_BRANCH`, `BRANCH`**: Used by the CMS to know exactly which repository and branches to target for content commits.
- **`CONTENT_PATH_PREFIX`**: A relative path to resolve content assets, useful if your content directory is located outside the main project folder.

## Prerequisites

Before starting, ensure your system meets the minimum version requirements:

- **Node.js**: v18 or higher
- **Bun**: v1.0 or higher (recommended)

## Getting started

The project uses [Bun](https://bun.sh/) as the package manager so make sure to have it installed on your computer.

- **Install dependencies:**

```bash
bun install
```

- **Start development server:**

```bash
bun --bun start (Accessible at http://localhost:8080)
```

- **Production build:**

```bash
bun run build
```

**Warning:** Refer to the **environment variables (.env)** section before starting the project.

**Note:** If Node.js is used instead of Bun, use `npm install` for dependency management.

## CMS access (Sveltia)

Once the server is running, the CMS interface is available at `/admin`. This allows you to manage your content visually without editing Markdown files manually.

Sign in with a GitHub **personal access token** (contents: write on the repo) — no OAuth worker needed. For OAuth-style login instead, deploy the `sveltia-cms-auth` Cloudflare Worker (see the [Sveltia CMS documentation](https://sveltiacms.app/)) and set `CMS_AUTH_URL` in `.env`.

## Deployment and production

When you are ready to publish your website, run the following command:

```bash
bun run build
```

This will generate the final static website inside the `dist/` directory.

Poko outputs a pure static site, making it incredibly easy to host anywhere — see [Deployment](/en/docs/deployment/) for the shipped Cloudflare Pages, GitHub Pages, Netlify and Vercel configs.
{% endraw %}