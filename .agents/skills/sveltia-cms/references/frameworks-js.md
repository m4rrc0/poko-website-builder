# Framework Guides: JavaScript Frameworks

Setting up Sveltia CMS with Astro, Docusaurus, Eleventy, Next.js, Nuxt, Starlight, SvelteKit and VitePress: where the admin page goes, how to serve and link to it, and example collections. For Hugo, Jekyll, Middleman and Zola, see `frameworks-other.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Astro Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [Astro](https://astro.build/), a modern static site builder.

### Starter Templates

Here are some starter templates built by the community using Astro:

- [Astros](https://github.com/majesticooss/astros) by [zanhk](https://github.com/zanhk)
- [Astro i18n Starter](https://github.com/yacosta738/astro-cms) by [yacosta738](https://github.com/yacosta738)
- [astro-sveltia-cms](https://github.com/knolljo/astro-sveltia-cms) by [knolljo](https://github.com/knolljo)
- [Nebulix](https://nebulix.unfolding.io/) by [Unfolding.io](https://github.com/unfolding-io)
- [StarFunnel](https://starfunnel.unfolding.io/) by [Unfolding.io](https://github.com/unfolding-io)

**Disclaimer**

These third-party resources are not necessarily reviewed by the Sveltia CMS team. We are not responsible for their maintenance or support. Please contact the respective authors for any issues or questions.

### Examples

See real-world examples of Astro integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=astro). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with Astro.

### Setup

#### Adding the Admin Page

Astro serves static files from the [`public` folder](https://docs.astro.build/en/basics/project-structure/#public). Create `public/admin/index.html` and `public/admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide.

The Astro development server doesn’t serve `index.html` for a folder path in `public`, so open `/admin/index.html` instead of `/admin/` during development. On the built site, most hosting services serve the admin page at `/admin/` as usual.

**Don’t Use an Astro Page**

Don’t load Sveltia CMS from an Astro page, such as `src/pages/admin.astro` or `src/pages/admin/index.astro`, even if you import it from the [npm package](https://sveltiacms.app/en/docs/api#using-the-npm-package). The Astro development server reloads such a page every time a file changes. This can interrupt saving when you [work with a local repository](https://sveltiacms.app/en/docs/workflows/local), leaving a file empty or a temporary `.sveltia-tmp-*` file behind. Sveltia CMS shows a warning at the top of the page in this case. A static HTML file in the `public` folder is not reloaded.

If your site uses the [`<ClientRouter />`](https://docs.astro.build/en/guides/view-transitions/) component for view transitions, add the `data-astro-reload` attribute to links to the admin page, so they are opened as regular pages instead of being handled by the router:

```html
<a href="/admin/" data-astro-reload>Edit content</a>
```

### Configuration

Astro manages Markdown content with [content collections](https://docs.astro.build/en/guides/content-collections/) defined in `src/content.config.ts`. Each collection loads files with a loader like `glob()` and validates their front matter with a [Zod](https://zod.dev/) schema:

```ts [src/content.config.ts]
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      pubDate: z.coerce.date(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

The matching Sveltia CMS entry collection uses the `base` folder of the loader. The following example stores each post in a folder of its own as `index.md`, with [entry-relative media folders](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders), so the hero image is saved next to the post and can be [optimized by Astro](https://docs.astro.build/en/guides/images/#images-in-content-collections) with the `image()` schema helper:

```yaml [public/admin/config.yml]
media_folder: public/images
public_folder: /images
output:
  omit_empty_optional_fields: true
collections:
  - name: blog
    label: Blog
    folder: src/content/blog
    path: '{{slug}}/index'
    media_folder: ''
    public_folder: ''
    create: true
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, required: false }
      - { name: pubDate, label: Publish Date, widget: datetime }
      - { name: heroImage, label: Hero Image, widget: image, required: false }
      - { name: tags, label: Tags, widget: list, required: false }
      - { name: body, label: Body, widget: markdown }
```

If you store posts as single files instead, remove the `path`, `media_folder` and `public_folder` options from the collection. Images are then saved in the `public/images` folder defined at the top level, which Astro serves as is without optimization, so use `z.string()` instead of `image()` in the schema.

#### Omitting Empty Optional Fields

Sveltia CMS saves an empty value, such as an empty string, an empty array or `null`, for an optional field that is left empty. Zod’s `.optional()` only accepts a missing property, so these values can cause a build error like “data does not match collection schema”. Set the [`omit_empty_optional_fields`](https://sveltiacms.app/en/docs/data-output#controlling-data-output) output option to `true`, as in the example above, to leave empty optional fields out of the front matter.

### Support for Astro

We have implemented specific features to enhance the integration of Sveltia CMS with Astro:

- [Starlight](https://sveltiacms.app/en/docs/frameworks/starlight): Manage a Starlight documentation site, including its folder tree, front matter and multilingual content.
- The [`value_field`](https://sveltiacms.app/en/docs/fields/relation#value-field) Relation field option can contain a locale prefix like `{{locale}}/{{slug}}`, which will be replaced with the current locale. It’s intended to support i18n in Astro. ([Discussion](https://github.com/sveltia/sveltia-cms/discussions/302))
- [Localizing entry slugs](https://sveltiacms.app/en/docs/i18n/slugs#localizing-entry-slugs): Generate localized slugs for multilingual Astro sites, notably with the [@astrolicious/i18n](https://github.com/astrolicious/i18n) library. ([Discussion](https://github.com/sveltia/sveltia-cms/issues/137))
- [Omitting empty optional fields](https://sveltiacms.app/en/docs/data-output#controlling-data-output): Set the `omit_empty_optional_fields` output option to `true` so that content with unfilled optional fields passes [content collection schema](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema) validation. ([Discussion](https://github.com/sveltia/sveltia-cms/issues/241))

Source: https://sveltiacms.app/en/docs/frameworks/astro

---

## Docusaurus Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [Docusaurus](https://docusaurus.io/), a popular static site generator focused on documentation websites.

### Examples

See real-world examples of Docusaurus integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=docusaurus). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with Docusaurus.

### Setup

#### Adding the Admin Page

Docusaurus serves static files from the [`static` folder](https://docusaurus.io/docs/static-assets). Create `static/admin/index.html` and `static/admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide. The admin page is then available at `/admin/` on the development server started with `docusaurus start` as well as on the built site.

#### Linking to the Admin Page

The admin page is not part of the Docusaurus route system, so a regular link to it would be handled by the client-side router and lead to a 404 page. Use the [`pathname://` protocol](https://docusaurus.io/docs/advanced/routing#escaping-from-spa-redirects) to link to it as if it were an external page:

```md
[Edit content](pathname:///admin/)
```

### Configuration

#### Blog Posts

The [blog plugin](https://docusaurus.io/docs/blog) reads posts from the `blog` folder and takes the date and slug from date-prefixed names. A post can be a single file like `2026-10-01-hello-world.md`, or a folder like `2026-10-01-hello-world/index.md` that also holds the post’s images. The following example uses the folder style with [entry-relative media folders](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders), so images inserted into a post are stored next to its `index.md` file:

```yaml [static/admin/config.yml]
media_folder: static/img
public_folder: /img
collections:
  - name: blog
    label: Blog
    folder: blog
    path: '{{year}}-{{month}}-{{day}}-{{slug}}/index'
    media_folder: ''
    public_folder: ''
    create: true
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, required: false }
      - name: authors
        label: Authors
        widget: list
        required: false
        fields:
          - { name: name, label: Name }
          - { name: title, label: Title, required: false }
          - { name: url, label: URL, required: false }
          - { name: image_url, label: Image URL, required: false }
      - { name: tags, label: Tags, widget: list, required: false }
      - { name: draft, label: Draft, widget: boolean, required: false }
      - { name: body, label: Body, widget: markdown }
```

Some notes on authors and tags:

- [Authors](https://docusaurus.io/docs/blog#blog-post-authors) are defined inline in the example above. If you maintain the authors in `blog/authors.yml` instead, the front matter refers to them by key, such as `authors: [jane]`. Since the file is a map keyed by author, it can’t be edited easily in the CMS. However, a Select field with the keys as `options` and `multiple: true` lets editors pick authors from the list.
- [Tags](https://docusaurus.io/docs/blog#blog-post-tags) can be free-form strings, as in the example above. If you predefine tags in `blog/tags.yml`, Docusaurus warns about tags that are not in the file by default, so use a Select field with the same keys as `options` and `multiple: true` instead of a List field.

#### Docs

Every Markdown file in the `docs` folder becomes a [doc page](https://docusaurus.io/docs/create-doc), and the folder structure becomes the sidebar structure. A collection of [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) in the `subfolders: false` mode manages this structure as a folder tree:

```yaml
collections:
  - name: docs
    label: Docs
    label_singular: Doc
    folder: docs
    create: true
    nested:
      subfolders: false
    meta: { path: {} }
    fields:
      - { name: title, label: Title }
      - { name: sidebar_label, label: Sidebar Label, required: false }
      - { name: sidebar_position, label: Sidebar Position, widget: number, required: false }
      - { name: body, label: Body, widget: markdown }
```

The `sidebar_label` and `sidebar_position` fields correspond to the [front matter](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter) options that control the [autogenerated sidebar](https://docusaurus.io/docs/sidebar/autogenerated). Category labels and positions are defined in `_category_.json` or `_category_.yml` files, which are not entries and can be edited outside the CMS.

Docusaurus validates front matter and stops the build when an optional property has an empty value, such as `sidebar_position: null` or `sidebar_label: ''`. Since Sveltia CMS saves empty values for optional fields by default, set the [`omit_empty_optional_fields`](https://sveltiacms.app/en/docs/data-output#controlling-data-output) output option to `true` to leave them out:

```yaml
output:
  omit_empty_optional_fields: true
```

**MDX Content**

Docusaurus parses `.md` and `.mdx` files as [MDX](https://docusaurus.io/docs/markdown-features/react) by default, which allows JSX components in Markdown. Sveltia CMS doesn’t support MDX yet (it’s on our [roadmap](https://sveltiacms.app/en/docs/roadmap)), so editing a file with components in the rich text editor may change or break them.

Also, an entry collection uses one file extension, so `.md` and `.mdx` files in the same folder need to be managed by separate collections with the [`extension`](https://sveltiacms.app/en/docs/collections/entries/formats#extension) option.

### Support for Docusaurus

We have implemented specific features to enhance the integration of Sveltia CMS with Docusaurus:

- If an entry collection has only a Markdown `body` field, the [slug](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs) and [summary](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) of the entries will be generated from a header in the Markdown content, if one exists. ([Discussion](https://github.com/sveltia/sveltia-cms/issues/230))
- [Nested entries](https://sveltiacms.app/en/docs/collections/entries/nested): Manage a [docs folder tree](https://docusaurus.io/docs/create-doc) in the sidebar with the `subfolders: false` mode, where every file is a page at its own path and editors can create new folders as needed.

Source: https://sveltiacms.app/en/docs/frameworks/docusaurus

---

## Eleventy Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [Eleventy](https://www.11ty.dev/) (11ty), a simple and flexible static site generator.

### Starter Templates

Here are some starter templates built by the community using Eleventy:

- [Eleventy starter template](https://github.com/danurbanowicz/eleventy-sveltia-cms-starter) by [danurbanowicz](https://github.com/danurbanowicz)
- [ZeroPoint](https://getzeropoint.com/) by [MWDelaney](https://github.com/MWDelaney)
- [Huwindty](https://github.com/aloxe/huwindty) by [aloxe](https://github.com/aloxe)
- [One Starter](https://github.com/buildawesome-one/starter) by [buildawesome-one](https://github.com/buildawesome-one)

**Disclaimer**

These third-party resources are not necessarily reviewed by the Sveltia CMS team. We are not responsible for their maintenance or support. Please contact the respective authors for any issues or questions.

### Examples

See real-world examples of Eleventy integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=eleventy). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with Eleventy.

### Setup

#### Adding the Admin Page

Eleventy doesn’t have a static files folder. It processes template files, including HTML, in the input folder, which is the project root by default. Other files are ignored.

Create `admin/index.html` and `admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide. Then add a [passthrough file copy](https://www.11ty.dev/docs/copy/) to your Eleventy configuration file so that both files are copied to the output folder as is:

```js [eleventy.config.js]
export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('admin');
}
```

Without this, `config.yml` is not copied at all, and the CMS fails to load the configuration. If your input folder is not the project root, such as `src`, put the admin folder in it and use `addPassthroughCopy('src/admin')` instead. The admin page is then available at `/admin/` on the development server started with `eleventy --serve` as well as on the built site.

### Configuration

Eleventy doesn’t have a fixed content folder, so blog posts can be stored in any folder in the input folder, such as `posts`. The following example manages Markdown posts in the `posts` folder:

```yaml [admin/config.yml]
media_folder: images
public_folder: /images
collections:
  - name: posts
    label: Posts
    folder: posts
    create: true
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime }
      - { name: tags, label: Tags, widget: list, required: false }
      - { name: body, label: Body, widget: markdown }
```

Some notes on this configuration:

- The `images` media folder also needs a passthrough file copy, such as `addPassthroughCopy('images')`, to be included in the output.
- The layout and the `posts` tag shared by all posts are usually defined in a [directory data file](https://www.11ty.dev/docs/data-template-dir/) like `posts/posts.json` instead of the front matter of each post. Eleventy merges the `tags` in the front matter with the ones in the data file, so editors only need to add extra tags. The data file itself can be managed in the same collection, as explained below.
- Eleventy uses the filename as the URL of a post by default, such as `/posts/hello-world/`. Each post can override it with a [`permalink`](https://www.11ty.dev/docs/permalinks/) property, which can be added as a String field if needed.

### Support for Eleventy

We have implemented specific features to enhance the integration of Sveltia CMS with Eleventy:

- [Nested entries](https://sveltiacms.app/en/docs/collections/entries/nested): Manage a folder tree of pages in the sidebar with the `subfolders: false` mode, where every file is a page at its own [path-based permalink](https://www.11ty.dev/docs/permalinks/) and editors can create new folders as needed.
- [Directory data files](https://sveltiacms.app/en/docs/collections/entries/listings#managing-eleventy-s-directory-data-file): Manage a folder’s [directory data file](https://www.11ty.dev/docs/data-template-dir/), like `posts/posts.json`, beside the Markdown entries it applies to, using the `index_file` option with an `extension` or `format` of its own.
- [Editor components](https://sveltiacms.app/en/docs/api/editor-components#styled-separator): An example of a custom component that inserts an Eleventy [shortcode](https://www.11ty.dev/docs/shortcodes/) into Markdown content.

Source: https://sveltiacms.app/en/docs/frameworks/eleventy

---

## Next.js Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [Next.js](https://nextjs.org/), a popular React framework for building server-side rendered and static websites.

### Examples

See real-world examples of Next.js integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=next). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with Next.js.

### Setup

#### Adding the Admin Page

Next.js serves static files from the [`public` folder](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder). Create `public/admin/index.html` and `public/admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide.

#### Serving the Admin Page

Unlike most static site generators, Next.js doesn’t serve `index.html` for a folder path. `/admin/` is redirected to `/admin`, which returns a 404 Not Found error, so the CMS is only available at `/admin/index.html` out of the box. To make `/admin` work, add a [rewrite](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites) to `next.config.ts`:

```ts [next.config.ts]
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/admin', destination: '/admin/index.html' }];
  },
};

export default nextConfig;
```

Rewrites are not supported for a [static export](https://nextjs.org/docs/app/guides/static-exports) with `output: 'export'`. In that case, the `public` folder is copied to the `out` folder as is, and most static hosting services serve `admin/index.html` at `/admin/` without additional configuration.

#### Linking to the Admin Page

The admin page is not part of your Next.js app, so link to it with a regular `<a>` element instead of the `<Link>` component, which would try to render it as a client-side route:

```tsx
<a href="/admin/index.html">Edit content</a>
```

### Configuration

Next.js doesn’t have a built-in content folder, so you can store Markdown files anywhere outside the `app` folder. The following example stores blog posts in `content/posts` and images in `public/images`:

```yaml [public/admin/config.yml]
media_folder: public/images
public_folder: /images
collections:
  - name: posts
    label: Blog Posts
    folder: content/posts
    create: true
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime }
      - { name: description, label: Description, required: false }
      - { name: image, label: Cover Image, widget: image, required: false }
      - { name: body, label: Body, widget: markdown }
```

The `media_folder` must be inside `public` so the images are served by Next.js, while the `public_folder` is the URL path written to the content. See [Internal Media Storage](https://sveltiacms.app/en/docs/media/internal) for more options.

### Loading Content

Read the Markdown files in a [Server Component](https://nextjs.org/docs/app/getting-started/server-and-client-components) with Node.js’s `fs` module, then parse the front matter with a library like [gray-matter](https://github.com/jonschlinkert/gray-matter) and convert the body to HTML with a Markdown processor like [remark](https://github.com/remarkjs/remark) or [marked](https://marked.js.org/). Use [`generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) to generate a page for each post at build time. If you prefer MDX, see the [Next.js MDX guide](https://nextjs.org/docs/app/guides/mdx) for options.

Since content files are bundled with your site, the site must be rebuilt to reflect content changes made in the CMS. Most hosting services, including Vercel and Netlify, rebuild the site automatically when a commit is pushed to the repository.

Source: https://sveltiacms.app/en/docs/frameworks/next

---

## Nuxt Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [Nuxt](https://nuxt.com/), a popular Vue.js framework for building server-side rendered and static websites.

### Examples

See real-world examples of Nuxt integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=nuxt). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with Nuxt.

### Setup

#### Adding the Admin Page

Nuxt serves static files from the [`public` folder](https://nuxt.com/docs/4.x/directory-structure/public). Create `public/admin/index.html` and `public/admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide. The admin page is then available at `/admin/` on both the development server and the production site.

If your project still uses Nuxt 2, the static files folder is `static` instead of `public`.

#### Linking to the Admin Page

The admin page is not part of your Nuxt app. If you link to it with the `<NuxtLink>` component, add the `external` prop so that Vue Router doesn’t try to render it as a page:

```vue
<NuxtLink to="/admin/" external>Edit content</NuxtLink>
```

A regular `<a href="/admin/">` element works as well.

### Configuration

Most Nuxt sites manage Markdown content with the [Nuxt Content](https://content.nuxt.com/) module, which reads files from the `content` folder. In Nuxt Content v3, the files are grouped into [collections](https://content.nuxt.com/docs/collections/define) defined in `content.config.ts`, and each collection’s front matter can be validated with a [Zod](https://zod.dev/) schema:

```ts [content.config.ts]
import { defineCollection, defineContentConfig } from '@nuxt/content';
import { z } from 'zod';

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        date: z.date(),
        image: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
  },
});
```

The matching Sveltia CMS entry collection uses the folder of the `source` pattern, prefixed with `content/`. `title` and `description` are built-in fields of a `page` collection, so they don’t need to be defined in the schema, but they should be added to the CMS configuration:

```yaml [public/admin/config.yml]
media_folder: public/images
public_folder: /images
output:
  omit_empty_optional_fields: true
collections:
  - name: blog
    label: Blog
    folder: content/blog
    create: true
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, required: false }
      - { name: date, label: Date, widget: datetime }
      - { name: image, label: Cover Image, widget: image, required: false }
      - { name: tags, label: Tags, widget: list, required: false }
      - { name: body, label: Body, widget: markdown }
```

The [`omit_empty_optional_fields`](https://sveltiacms.app/en/docs/data-output#controlling-data-output) output option keeps empty optional fields out of the front matter. Without it, empty fields are saved as an empty string, an empty array or `null` depending on the field type, which may not pass your schema. For example, `z.string().optional()` accepts a missing property but rejects `null`.

### Loading Content

Query a collection with [`queryCollection`](https://content.nuxt.com/docs/utils/query-collection) and render the Markdown body with the [`<ContentRenderer>`](https://content.nuxt.com/docs/components/content-renderer) component. For example, a catch-all page like `app/pages/[...slug].vue` can find the entry whose path matches the current route.

Nuxt Content parses the content files when the site is built, so the site must be rebuilt to reflect content changes made in the CMS. Most hosting services rebuild the site automatically when a commit is pushed to the repository.

Source: https://sveltiacms.app/en/docs/frameworks/nuxt

---

## Starlight Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [Starlight](https://starlight.astro.build/), a documentation website framework built on [Astro](https://sveltiacms.app/en/docs/frameworks/astro).

### Examples

See real-world examples of Starlight integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=starlight). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with Starlight.

### Setup

#### Adding the Admin Page

Like any Astro site, Starlight serves static files from the [`public` folder](https://starlight.astro.build/guides/project-structure/). Create `public/admin/index.html` and `public/admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide.

The Astro development server doesn’t serve `index.html` for a folder path in `public`, so open `/admin/index.html` instead of `/admin/` during development. On the built site, most hosting services serve the admin page at `/admin/` as usual.

### Configuration

#### Docs Collection

Starlight turns every Markdown file in `src/content/docs` into a page at its own path. The folder structure becomes the URL structure. With [autogenerated sidebar groups](https://starlight.astro.build/guides/sidebar/#autogenerated-links), it also becomes the sidebar structure. A collection of [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) in the `subfolders: false` mode manages this structure as a folder tree, where editors can create new folders as needed:

```yaml [public/admin/config.yml]
media_folder: public/images
public_folder: /images
output:
  omit_empty_optional_fields: true
collections:
  - name: docs
    label: Docs
    label_singular: Page
    folder: src/content/docs
    create: true
    nested:
      subfolders: false
    meta: { path: {} }
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, required: false }
      - name: sidebar
        label: Sidebar
        widget: object
        required: false
        collapsed: true
        fields:
          - { name: label, label: Label, required: false }
          - { name: order, label: Order, widget: number, required: false }
          - { name: hidden, label: Hidden, widget: boolean, required: false }
          - { name: badge, label: Badge, required: false }
      - name: template
        label: Template
        widget: select
        options: [doc, splash]
        default: doc
      - { name: draft, label: Draft, widget: boolean, required: false }
      - { name: body, label: Body, widget: markdown }
```

The fields correspond to the [front matter](https://starlight.astro.build/reference/frontmatter/) options of the same names. `title` is the only required option in Starlight. Add other options, such as `hero` for a splash page or `tableOfContents`, as needed.

#### Omitting Empty Optional Fields

Starlight validates front matter with the [`docsSchema()`](https://starlight.astro.build/reference/configuration/#docsschema) helper defined in `src/content.config.ts`. The schema uses Zod’s `.optional()`, which only accepts a missing property. An empty value saved by Sveltia CMS for an optional field, such as `order: null`, can therefore cause a build error. The [`omit_empty_optional_fields`](https://sveltiacms.app/en/docs/data-output#controlling-data-output) output option in the example above leaves such fields out of the front matter.

#### Images

Images uploaded in the CMS are saved in the `public/images` folder in the example above and referenced as `/images/file.png`. Starlight serves these files as is. If you want Astro to optimize images, they need to be stored in `src/assets` or next to the page and referenced with a relative path. The `subfolders: false` mode doesn’t support this, because the relative path differs for each folder level.

### Multilingual Sites

Starlight stores the pages of each language in a subfolder of `src/content/docs` named after the [locale](https://starlight.astro.build/guides/i18n/), such as `en` and `fr`. This matches the [`multiple_folders`](https://sveltiacms.app/en/docs/i18n/structures) i18n structure of Sveltia CMS:

```yaml [public/admin/config.yml]
i18n:
  structure: multiple_folders
  locales: [en, fr]
collections:
  - name: docs
    # ...
    i18n: true
    fields:
      - { name: title, label: Title, i18n: true }
      - { name: description, label: Description, required: false, i18n: true }
      # ...
      - { name: body, label: Body, widget: markdown, i18n: true }
```

Each locale has its own file, so fields that should appear in every file need the field-level [`i18n`](https://sveltiacms.app/en/docs/i18n/options#field-level-configuration) option. Set it to `true` for translatable fields like `title`, which Starlight requires for every page, and `duplicate` for fields that should have the same value in all locales, such as the sidebar order.

If your site uses a [root locale](https://starlight.astro.build/guides/i18n/#use-a-root-locale), the pages of the default language are stored directly in `src/content/docs`, while the other languages are in their own subfolders. Add the [`omit_default_locale_from_file_path`](https://sveltiacms.app/en/docs/i18n/options#top-level-configuration) option to match this structure:

```yaml [public/admin/config.yml]
i18n:
  structure: multiple_folders
  locales: [en, fr]
  omit_default_locale_from_file_path: true
```

With this option, a folder in the default language whose name matches another locale code, such as `fr`, is treated as that locale’s folder, so avoid using locale codes as folder names.

Source: https://sveltiacms.app/en/docs/frameworks/starlight

---

## SvelteKit Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [SvelteKit](https://svelte.dev/docs/kit/introduction), a framework for building web applications using Svelte.

### Examples

See real-world examples of SvelteKit integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=sveltekit). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with SvelteKit.

### Setup

#### Adding the Admin Page

SvelteKit serves static files from the [`static` folder](https://svelte.dev/docs/kit/project-structure#Project-files-static). Create `static/admin/index.html` and `static/admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide.

The Vite development server doesn’t serve `index.html` for a folder path in `static`, so open `/admin/index.html` instead of `/admin/` during development. On a site built with [`adapter-static`](https://svelte.dev/docs/kit/adapter-static), most hosting services serve the admin page at `/admin/` as usual.

#### Linking to the Admin Page

The admin page is not a SvelteKit route. Add the [`data-sveltekit-reload`](https://svelte.dev/docs/kit/link-options#data-sveltekit-reload) attribute to links to it, so they are opened as regular pages instead of being handled by the client-side router:

```html
<a href="/admin/" data-sveltekit-reload>Edit content</a>
```

### Configuration

SvelteKit doesn’t have a built-in content folder, so Markdown files can be stored anywhere in the project, such as `src/posts`. The following example manages blog posts in that folder and stores images in the `static` folder:

```yaml [static/admin/config.yml]
media_folder: static/images
public_folder: /images
collections:
  - name: posts
    label: Posts
    folder: src/posts
    create: true
    fields:
      - { name: title, label: Title }
      - { name: date, label: Date, widget: datetime }
      - { name: description, label: Description, required: false }
      - { name: body, label: Body, widget: markdown }
```

### Loading Content

A key step in integrating Sveltia CMS with SvelteKit is using Vite’s [glob import](https://vite.dev/guide/features#glob-import). It loads all your content files at once in [`+layout.js`](https://svelte.dev/docs/kit/load#Layout-data) or somewhere else in your SvelteKit app. Since SvelteKit uses Vite under the hood, you can take advantage of the `import.meta.glob` function without additional configuration. This allows you to easily access and manage your content within the SvelteKit framework.

Since content files are bundled with your site, the site must be rebuilt to reflect content changes made in the CMS. Most hosting services rebuild the site automatically when a commit is pushed to the repository.

### Serving the CMS as a SvelteKit Route

The standard setup is to place `index.html` and `config.yml` in the `static/admin` folder as described in the Setup section above. However, if you’re using the [npm package](https://sveltiacms.app/en/docs/api#using-the-npm-package), you can also serve the CMS from a regular SvelteKit route. This is useful when you want to:

- bundle the CMS with your site instead of loading it from a CDN
- define the [configuration in JavaScript/TypeScript](https://sveltiacms.app/en/docs/api/initialization), so it can be shared with your site’s content schemas or switched between a real and a test repository depending on the environment

Sveltia CMS is a client-side single-page application that needs the `window` and `document` objects, so it can’t be rendered on the server. Disable SSR for the admin route by exporting `ssr = false` from its `+page.js` (or `+page.ts`) file. Otherwise, you’ll see an error like “Cannot read properties of undefined (reading 'bind')” during server-side rendering. The rest of your site can still be server-rendered or built as static pages as usual.

`src/routes/admin/+page.ts`:

```ts
export const ssr = false;
```

`src/routes/admin/+page.svelte`:

```svelte
<script lang="ts">
  import CMS from '@sveltia/cms';
  import { config } from '$lib/cms-config';

  CMS.init({ config: { load_config_file: false, ...config } });
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
  <title>Sveltia CMS</title>
</svelte:head>

<div id="nc-root"></div>
```

`src/lib/cms-config.ts`:

```ts
import type { CmsConfig } from '@sveltia/cms';

export const config: CmsConfig = {
  backend: {
    name: 'github',
    repo: 'owner/repo',
  },
  media_folder: 'static/uploads',
  public_folder: '/uploads',
  collections: [
    // ...
  ],
};
```

Some notes on this setup:

- `load_config_file: false` tells the CMS not to fetch `config.yml`, since the configuration is passed directly to `init()`. Omit it if you’d rather keep `config.yml` in the `static` folder and only override some options.
- The `<div id="nc-root">` is a [custom mount element](https://sveltiacms.app/en/docs/customization#custom-mount-element). It keeps the CMS scoped to the page so your site’s layout doesn’t interfere with it. If the admin route has its own [layout group](https://svelte.dev/docs/kit/advanced-routing#Advanced-layouts-group) that doesn’t load any of your site’s CSS, JavaScript or HTML, you can drop the wrapper and let the CMS mount to `<body>` as it normally does.
- The `noindex` meta tag prevents the admin page from being indexed by search engines.

This approach was shared in a [community discussion](https://github.com/sveltia/sveltia-cms/discussions/665) and should work similarly with other frameworks that let you turn off SSR per page, such as Astro.

Source: https://sveltiacms.app/en/docs/frameworks/sveltekit

---

## VitePress Integration Guide

This guide provides resources and information for integrating Sveltia CMS with [VitePress](https://vitepress.dev/), a static site generator powered by Vite and Vue.

### Examples

See real-world examples of VitePress integrations in our [Showcase](https://sveltiacms.app/en/showcase?framework=vitepress). Most of the listed sites include links to their source code, so you can explore how they implemented Sveltia CMS with VitePress.

### Setup

#### Adding the Admin Page

VitePress serves static files from the [`public` folder](https://vitepress.dev/guide/asset-handling#the-public-directory) inside the source folder, which is the project root by default but is often a subfolder named `docs`. For example, if your Markdown files are in `docs`, create `docs/public/admin/index.html` and `docs/public/admin/config.yml` as described in the [Getting Started](https://sveltiacms.app/en/docs/start#manual-installation) guide.

The VitePress development server doesn’t serve `index.html` for a folder path, so open `/admin/index.html` instead of `/admin/` during development. On the built site, most hosting services serve the admin page at `/admin/` as usual.

#### Linking to the Admin Page

VitePress handles internal links with its client-side router, which shows a 404 page for the admin page because it isn’t a VitePress page. Add `target="_self"` to [links to non-VitePress pages](https://vitepress.dev/guide/routing#linking-to-non-vitepress-pages) so they are opened as regular pages:

```md
[Edit content](/admin/){target="_self"}
```

The same applies to a link in the [navigation bar](https://vitepress.dev/reference/default-theme-nav#navigation-links):

```js [.vitepress/config.js]
export default {
  themeConfig: {
    nav: [{ text: 'Edit', link: '/admin/', target: '_self' }],
  },
};
```

### Configuration

In VitePress, every Markdown file in the source folder becomes a page at its own path, and the folder structure becomes the URL structure. A collection of [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) in the `subfolders: false` mode manages this structure as a folder tree. The following example manages all the pages in the `docs` folder:

```yaml [docs/public/admin/config.yml]
media_folder: docs/public/images
public_folder: /images
collections:
  - name: pages
    label: Pages
    label_singular: Page
    folder: docs
    create: true
    nested:
      subfolders: false
    meta: { path: {} }
    fields:
      - { name: title, label: Title }
      - { name: description, label: Description, required: false }
      - name: layout
        label: Layout
        widget: select
        options: [doc, home, page]
        default: doc
      - { name: body, label: Body, widget: markdown }
```

The `title` and `description` fields correspond to the [front matter](https://vitepress.dev/reference/frontmatter-config) options of the same names, and `layout` selects one of the [default theme layouts](https://vitepress.dev/reference/default-theme-layout). VitePress can take the page title from the first heading instead. However, the `title` field is required here, because Sveltia CMS uses it to generate the filename of a new page.

The home page uses many layout-specific options, such as `hero` and `features`, so you may want to manage `index.md` with a [file collection](https://sveltiacms.app/en/docs/collections/files) of its own instead.

### Support for VitePress

We have implemented specific features to enhance the integration of Sveltia CMS with VitePress:

- The [`folder` option](https://sveltiacms.app/en/docs/collections/entries#creating-an-entry-collection) for an entry collection can be an empty string (or `.` or `/`) if you want to store entries in the root folder. ([Discussion](https://github.com/sveltia/sveltia-cms/issues/230))
- If an entry collection has only a Markdown `body` field, the [slug](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs) and [summary](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) of the entries will be generated from a header in the Markdown content, if one exists. ([Discussion](https://github.com/sveltia/sveltia-cms/issues/230))
- [Nested entries](https://sveltiacms.app/en/docs/collections/entries/nested): Manage a [folder tree of pages](https://vitepress.dev/guide/routing#source-directory) in the sidebar with the `subfolders: false` mode, where every file is a page at its own path and editors can create new folders as needed.

Source: https://sveltiacms.app/en/docs/frameworks/vitepress
