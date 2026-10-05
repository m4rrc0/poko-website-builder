---
translationKey: deployment
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Deployment
docsNav:
  section: developers
  order: 11
metadata:
  description: Deploy poko to Cloudflare Pages, GitHub Pages, Netlify or Vercel — and the config each path needs
---

# Deployment

poko builds a static `dist/` — it hosts anywhere. The repo ships ready-made config for the common hosts.

## The unified `deploy.yml` workflow

`.github/workflows/deploy.yml` handles the main paths automatically:

- **Push to `main`** → deploys to **Cloudflare Pages** when the `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` secrets are set, otherwise to **GitHub Pages**.
- **Push to any other branch** → Cloudflare Pages preview deployments only.
- **Manual** (`Actions → Deploy Site → Run workflow`) → pick `github-pages` or `cloudflare-pages` explicitly.
- A commit containing `[skip ci]` skips deployment.

**Repository variables** the workflow reads (Settings → Secrets and variables → Actions → *Variables*): `BASE_URL`, `PROD_URL`, `CONTENT_DIR`, `CMS_AUTH_URL`, `PROD_BRANCH`, `CMS_REPO`, `CMS_BRANCH`, `CMS_BACKEND`, `CMS_IMPORT`, `BUN_VERSION` (falls back to `engines.bun`).

## Cloudflare Pages

Two ways:

- **Pages git integration** (simplest) — import the repo in Workers & Pages: build command `bun run cf-build`, output `dist`, production branch `main`. `wrangler.jsonc` sets `pages_build_output_dir` and an `UNSTABLE_PRE_BUILD` that runs `bun i`/`npm i`.
- **`deploy.yml`** — set the `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets and pushes deploy (with branch previews).

`wrangler.jsonc` also applies to a Workers + assets setup if you move off Pages.

## GitHub Pages

- **Settings → Pages → Source: GitHub Actions** — `deploy.yml` targets Pages automatically when no Cloudflare secrets exist.
- Watch for path-prefix hosting (`/<repo>/`) — set `BASE_URL`/`WEBSITE_PATH_PREFIX` accordingly if links/assets need the prefix.

## Netlify / Vercel

Both have shipped config:

- `netlify.toml` — build `bun run build` (npm fallback), publish `dist/`.
- `vercel.json` — build `node scripts/run.js build`, output `dist`.

## Environment variables that matter at deploy time

| Var | Purpose |
| --- | --- |
| `CONTENT_DIR` | Which content folder to build (`_content`, `_www`…). |
| `BUILD_LEVEL` | `production` (published only), `draft` (+ drafts), `active`. |
| `REPO` / `PROD_BRANCH` / `BRANCH` | Git target for CMS commits. |
| `CMS_AUTH_URL` | OAuth bridge for the CMS login (optional — PAT login needs no worker). |
| `PREFERRED_HOSTING` | Fallback host hint for local dev. |
| `POKO_THEME` | Theme under `src/themes/`. |

## Build commands cheat sheet

| Command | Effect |
| --- | --- |
| `bun run build` / `cf-build` | Production build → `dist/` |
| `bun run build:gh-pages` | Build tuned for GitHub Pages |
| `bun run build:demo` / `build:content` | Build a named content dir |
| `bun run dev` | Dev server with reload |
| `bun run poko` | The poko CLI (`scripts/cli.js`) |
