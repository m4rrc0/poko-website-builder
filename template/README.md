# Poko website template

Minimal website setup consuming the [`poko-website-builder`](https://github.com/m4rrc0/poko-website-builder) engine.

## Layout

- `package.json` — depends on the engine, exposes `poko build` / `poko dev`
- `eleventy.config.js` — thin re-export of the engine configuration
- `.env` — optional environment variables (copy from `.env.example`)
- `_content/` — everything specific to this website
  - `_config/index.js` — CMS collections and singletons
  - `_data/globalSettings.yaml` — site name, languages, collections
  - `_data/brand.yaml` — colors, typography, layout scales

## Usage

```sh
git init
npm install    # or: bun install
npm run dev    # build, watch and serve on http://localhost:8080
npm run build  # write the site to dist/
```

## Customize config

```sh
cp .env.example .env
```

Then configure environment variables according to your project
