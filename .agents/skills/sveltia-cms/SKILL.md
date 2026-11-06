---
name: sveltia-cms
description: Set up, configure and debug Sveltia CMS, the Git-based headless CMS that replaces Netlify CMS and Decap CMS. Use when adding a CMS to a static site (Astro, Eleventy, Hugo, Jekyll, Next.js, Nuxt, SvelteKit, VitePress, Zola or any other), writing or reviewing an admin config file (config.yml, config.toml, config.json) with backend, collections, fields or i18n options, migrating from Netlify/Decap/Static CMS, or troubleshooting a CMS admin page that shows a blank screen, fails to authenticate, or reports config validation errors on the login screen. Also use whenever a project contains a config file with a `backend` and `collections` structure, or an admin page loading sveltia-cms.js.
license: MIT
compatibility: Works anywhere. No tools, dependencies or network access are required.
metadata:
  authority: Generated from the official documentation at https://sveltiacms.app
  documentation: https://sveltiacms.app
  repository: https://github.com/sveltia/sveltia-cms
---

# Sveltia CMS

Sveltia CMS is a Git-based headless CMS delivered as a single JavaScript bundle from a CDN. It reads and writes content files directly in a Git repository, so there is no database, no server and no build step for the CMS itself.

It is a drop-in replacement for Netlify CMS and Decap CMS: the configuration format is largely compatible, so an existing config usually works after swapping the script tag.

Sveltia CMS is pre-1.0 and ships several times a week. Never state a version number or claim a feature exists from memory — check the configuration schema or the documentation instead.

## Ground rules

1. **Validate every config you write or change.** Add the schema reference so the editor checks it as you type, then load the admin page and read the sign-in screen before telling the user the configuration is correct. See [Validate the configuration](#validate-the-configuration).
2. **Read the reference file for the area you are working in** before writing options. The table in [Where to look things up](#where-to-look-things-up) maps areas to files. Do not guess option names — the CMS ignores an option it does not recognize, so a misspelled one fails silently and only the editor's schema validation catches it.
3. **Never invent options.** If an option is not in the reference files or the JSON schema, it does not exist.

## Minimal setup

Two files in a folder named `admin` inside the site's static folder.

`admin/index.html` — this exact content, nothing more:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex" />
    <title>Sveltia CMS</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
  </body>
</html>
```

Three mistakes to avoid in that file, all of which break the CMS:

- **Do not add a stylesheet link.** There is no `sveltia-cms.css`. Every style is bundled in the JavaScript file. A `<link rel="stylesheet" href=".../sveltia-cms.css">` tag is a Static CMS artifact and is always wrong here.
- **Do not add `type="module"` to the script tag.** Sveltia CMS is not distributed as an ES module, and the attribute can break the JavaScript API.
- **Do not add a favicon, analytics or any other markup.** Keep the page standalone.

`admin/config.yml`:

```yaml
# yaml-language-server: $schema=https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json

backend:
  name: github
  repo: user/repo

media_folder: /public/media
public_folder: /media

collections:
  - name: posts
    label: Posts
    label_singular: Post
    folder: /content/posts
    fields:
      - { label: Title, name: title, widget: string }
      - { label: Date, name: date, widget: datetime, type: date }
      - { label: Body, name: body, widget: richtext }
```

Always include the schema reference line. It gives the user autocomplete and inline validation in their editor, and it is the single cheapest thing that keeps a config correct over time. Use the form that matches the file format:

| Format | Line to add at the top |
| --- | --- |
| YAML | `# yaml-language-server: $schema=https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json` |
| TOML | `#:schema https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json` |
| JSON | `"$schema": "https://unpkg.com/@sveltia/cms/schema/sveltia-cms.json",` |

### Where the static folder is

Put the `admin` folder inside the framework's static folder, so the page is served at `/admin/`.

| Framework | Static folder |
| --- | --- |
| Eleventy, Jekyll, Lume | `/` (repo root) |
| Angular, Astro, Fumadocs, HonoX, Next.js, Nextra, Nuxt, Qwik, React Router, SolidStart, TanStack Start, UmiJS, Vite | `/public` |
| Docusaurus, Fresh, Gatsby, Gridsome, Hugo, Nuxt 2, SvelteKit, Zola | `/static` |
| Pelican, Quartz | `/content` |
| Docsify, MkDocs | `/docs` |
| Rspress, VitePress | `<source folder>/public`, e.g. `/docs/public` |
| Hexo, Middleman | `/source` |
| Bridgetown, mdBook | `/src` |
| Analog | `/src/public` |
| Nikola | `/files` |
| VuePress | `<source folder>/.vuepress/public` |

Check the framework's own documentation if it is not listed. Eleventy, Hexo, Lume, Middleman, Pelican and Sphinx need extra configuration so the admin files are copied as is — see `references/setup.md`. Some dev servers (Astro, SvelteKit, VitePress) and Next.js don't serve `/admin/` as `/admin/index.html`, and client-side routers can intercept links to the admin page — see the framework guides in `references/frameworks-js.md` and `references/frameworks-other.md`.

## Validate the configuration

Two checks cover a configuration between them, and each catches what the other cannot.

**The editor, as you type.** The schema reference above makes any editor with JSON schema support validate the file live. This is the only check that catches a _misspelled option name_: the published schema rejects properties it doesn't know, so `requird: true` is flagged where you wrote it.

**The CMS, when the admin page loads.** Sveltia CMS validates the whole configuration against the schema published for the version it is running, on every load, and lists what it finds on the sign-in screen — each message naming the collection, file and field it belongs to. It reports wrong value types, values outside an allowed set and missing required options, plus the rules a schema cannot express: a `name` containing a space, dot or asterisk, a duplicate name, a Relation field pointing at a collection that doesn't exist, an option Sveltia CMS doesn't support. Unrecognized options are deliberately ignored here, so a configuration still carrying Netlify/Decap leftovers loads rather than being rejected.

Load `/admin/` after writing a configuration and read the sign-in screen. To do that without deploying, use the local development workflow or the `test-repo` backend — see [Testing a setup](#testing-a-setup).

Neither check helps if the admin page itself is wrong. A `sveltia-cms.css` link or `type="module"` on the script tag stops the CMS loading at all, so nothing is validated and the page stays blank. Check `admin/index.html` against [Minimal setup](#minimal-setup) first.

A configuration split across several files with `<link rel="cms-config-url">` is validated as the merged whole, so a fragment cannot be checked on its own.

## Where to look things up

Read the file that covers the area before writing options. Each is plain Markdown generated from the official documentation.

| Working on | Read |
| --- | --- |
| Installing, static folders, how the CMS loads | `references/setup.md` |
| Astro, Docusaurus, Eleventy, Next.js, Nuxt, Starlight, SvelteKit, VitePress | `references/frameworks-js.md` |
| Hugo, Jekyll, Middleman, Zola | `references/frameworks-other.md` |
| Global options, config file formats, output and slug options | `references/config.md` |
| `backend`, OAuth clients, authentication | `references/backends.md` |
| Collection types, file collections, singletons | `references/collections.md` |
| Planning collections; complete example configs for common site types | `references/content-modeling.md` |
| Entry collection options, file formats, slugs | `references/entries.md` |
| Nested entries, single-file collections, preview paths | `references/entries-structure.md` |
| Summaries, thumbnails, index files, table view, sorting, grouping, filtering | `references/entries-listing.md` |
| Create/delete/duplicate controls, entry limits, read-only content, reordering, bulk editing | `references/entries-operations.md` |
| Shared field options; String, Text, Number, Boolean, Select, Color | `references/fields.md` |
| List field | `references/fields-list.md` |
| Object, KeyValue fields | `references/fields-structural.md` |
| RichText/Markdown, Code fields | `references/fields-richtext.md` |
| Image, File, DateTime, Map fields | `references/fields-media.md` |
| Relation, Compute, UUID fields | `references/fields-relation.md` |
| `media_folder`, `public_folder`, internal Git media storage | `references/media.md` |
| Cloudinary, Uploadcare, Azure Blob Storage, stock photos | `references/media-external.md` |
| Amazon S3 and S3-compatible storage (R2, B2, Spaces, Bunny, Scaleway, Supabase) | `references/media-s3.md` |
| Multilingual content, `i18n` options, translation services | `references/i18n.md` |
| I18n file structures (single file, multiple files/folders), localized slugs | `references/i18n-structures.md` |
| Moving from Netlify CMS, Decap CMS or Static CMS; version upgrades | `references/migration.md` |
| Recipes: entry tags, raw text files, deployment config files, conditional fields, soft line breaks | `references/how-tos.md` |
| Blank page, auth failures, build errors, CSP, FAQs | `references/troubleshooting.md` |
| Local development, simple workflow, deploy previews | `references/workflows.md` |
| Editorial workflow, open authoring | `references/workflows-editorial.md` |
| The admin UI editors work in: content library, editor, asset library | `references/admin-ui.md` |
| `CMS.init()`, events, custom file formats | `references/api.md` |
| Custom field types (widgets) | `references/api-field-types.md` |
| Custom RichText editor components, Markdown rendering | `references/api-editor-components.md` |
| Preview templates, preview styles, UI customization | `references/api-previews.md` |

For anything not covered, fetch the live documentation at <https://sveltiacms.app> — the index is at <https://sveltiacms.app/llms.txt> and the full text at <https://sveltiacms.app/llms-full.txt> (large; prefer a specific page).

## Configuration essentials

### Backend

Supported: `github`, `gitlab`, `gitea` (also Forgejo), and `test-repo` for local testing without a repository.

Not supported, unlike Netlify/Decap CMS: **Azure DevOps**, **Bitbucket** and **Git Gateway**. A site using one of those must switch hosting before migrating. `CMS.registerBackend()` is a no-op.

Most setups need an OAuth application registered with the Git host, plus an OAuth client to handle the token exchange. Read `references/backends.md` before configuring one; the required options differ per backend (Gitea, for example, requires `app_id`).

### Collections and fields

- An **entry collection** (`folder`) manages many files of the same shape.
- A **file collection** (`files`) manages a fixed set of individual files.
- A **singleton** manages one standalone file.

Field types are declared with `widget`, the name kept for Netlify/Decap compatibility. The documentation calls them field types. Available: `boolean`, `code`, `color`, `compute`, `datetime`, `file`, `hidden`, `image`, `keyvalue`, `list`, `map`, `markdown`, `number`, `object`, `relation`, `richtext`, `select`, `string`, `text`, `uuid`.

`markdown` is an alias of `richtext`. The Netlify CMS `date` widget does not exist — use `datetime` with `type: date`.

Every `name` — collection, file, field and variable type — must be unique in its scope and must not contain spaces, dots or asterisks. Dots and asterisks are reserved for nested key paths and wildcards. Use nested objects rather than a dotted name.

### Media

`media_folder` is where files are written in the repository; `public_folder` is the path used in the generated content. Both are needed for images to resolve on the built site.

## Common failure modes

Match the symptom, then read the linked section of `references/troubleshooting.md`.

| Symptom | Cause and fix |
| --- | --- |
| Blank admin page on Cloudflare | Rocket Loader interferes with the bundle. Add `data-cfasync="false"` to the script tag. |
| Blank page, or a stylesheet 404 | A `sveltia-cms.css` link or `type="module"` on the script tag. Remove both. |
| "Authentication Aborted" on sign-in | A `Cross-Origin-Opener-Policy` header breaks the OAuth popup. Use `same-origin-allow-popups`; for GitLab remove the header entirely. |
| Config validation errors on the login screen | A wrong value type, an unsupported option, or a `name` with a space, dot or asterisk. Each message names the collection, file and field. |
| Broken or unstyled CMS UI | The admin page uses a framework layout. Apply a blank layout; Tailwind in particular conflicts. |
| Astro build fails on content schema validation | Set `omit_empty_optional_fields: true` so empty optional fields are dropped from the output. |
| Build fails on special characters in image paths | Set `encode_file_path: true`. |
| Jekyll or CI build fails on slugs | Set the global slug `encoding: ascii`, and `maxlength` if slugs are too long. |
| API errors behind Nginx or Apache (Gitea) | The reverse proxy double-encodes path characters. Fix the proxy's URL encoding. |

## Migrating from Netlify CMS or Decap CMS

The configuration is largely compatible. Replace the CMS script tag with the Sveltia CMS one and remove any stylesheet link. Then check `references/migration.md` for the differences that matter: unsupported backends, removed options, and behavior changes. Do not assume a Netlify/Decap option still exists — validate the config after switching.

## Testing a setup

Use the local development workflow rather than deploying to check a config: it runs against local files and surfaces validation errors immediately. See `references/workflows.md`.

The `test-repo` backend runs the CMS with no repository at all, which is useful for confirming a config loads before the OAuth setup exists.
