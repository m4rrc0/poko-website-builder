# Poko website template

Minimal website consuming the [`poko-website-builder`](https://github.com/m4rrc0/poko-website-builder) engine.

## Layout

- `package.json` — depends on the engine, exposes `poko build` / `poko dev`
- `eleventy.config.js` — thin re-export of the engine configuration
- `.env` — environment (copy from `.env.example`)
- `_content/` — everything specific to this website
  - `_config/index.js` — CMS collections and singletons
  - `_data/globalSettings.yaml` — site name, languages, collections
  - `_data/brand.yaml` — colors, typography, layout scales
  - `en/pages/index.md` — a page

## Usage

```sh
npm install    # or: bun install
cp .env.example .env
npm run dev    # build, watch and serve on http://localhost:8080
npm run build  # write the site to dist/
```
