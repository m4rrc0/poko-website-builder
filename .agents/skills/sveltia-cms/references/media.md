# Media Storage

Media folder configuration and internal Git-based storage. For third-party services, see `media-external.md` and `media-s3.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Media Storage

Sveltia CMS supports multiple media storage providers for managing media assets such as images and files. You can choose from the built-in internal media storage that saves files directly in your Git repository, or integrate with popular cloud-based media storage services for enhanced capabilities.

**Note for Netlify/Decap CMS users**

In Sveltia CMS, the term “media storage provider” is used instead of “media library” to avoid confusion with Sveltia CMS’s [Asset Library feature](https://sveltiacms.app/en/docs/ui/asset-library) that lets users manage media assets from multiple sources in one place. There is no change in functionality or configuration; it’s simply a terminology update.

### Internal Storage

The [internal media storage](https://sveltiacms.app/en/docs/media/internal) allows you to store media files directly in your Git repository along with your content files. It supports various configuration options for organizing and managing media files effectively.

### External Storage

Sveltia CMS supports integrations with popular cloud-based media storage providers for enhanced capabilities such as automatic image transformations, CDN delivery and more. Sveltia CMS currently supports the following external media storage providers:

- [Amazon S3](https://sveltiacms.app/en/docs/media/amazon-s3) and S3-compatible providers:
  - [Backblaze B2](https://sveltiacms.app/en/docs/media/backblaze-b2)
  - [Bunny Storage](https://sveltiacms.app/en/docs/media/bunny-storage)
  - [Cloudflare R2](https://sveltiacms.app/en/docs/media/cloudflare-r2)
  - [DigitalOcean Spaces](https://sveltiacms.app/en/docs/media/digitalocean-spaces)
  - [Neon Object Storage](https://sveltiacms.app/en/docs/media/neon-object-storage)
  - [Scaleway Object Storage](https://sveltiacms.app/en/docs/media/scaleway-object-storage)
  - [Supabase Storage](https://sveltiacms.app/en/docs/media/supabase-storage)
  - Any other S3-compatible service, including self-hosted servers such as [Garage](https://garagehq.deuxfleurs.fr/) and [MinIO](https://www.min.io/), through the Amazon S3 integration’s `endpoint` option. See [Self-Hosted Storage](https://sveltiacms.app/en/docs/media/amazon-s3#self-hosted-storage) for details.
- [Azure Blob Storage](https://sveltiacms.app/en/docs/media/azure-blob-storage)
- [Cloudinary](https://sveltiacms.app/en/docs/media/cloudinary)
- [Uploadcare](https://sveltiacms.app/en/docs/media/uploadcare)

Unlike backends, you can use multiple storage providers simultaneously in Sveltia CMS. Each media storage provider integration includes its own configuration instructions.

**Breaking changes from Netlify/Decap CMS**

Sveltia CMS does not support the deprecated **Netlify Large Media** service. If you’re using it with Netlify/Decap CMS, you will need to migrate your assets to one of the supported providers mentioned above.

Also, Sveltia CMS does not support the undocumented custom media storage provider API. The `CMS.registerMediaLibrary` method is a no-op in Sveltia CMS. We may add support for custom storage providers in future releases, though compatibility with existing Netlify/Decap CMS custom media libraries is not guaranteed.

**Future Plans**

More integration options may be added in the future.

### Configuration

Relevant configuration options can be set in the `media_folder`, `public_folder` and `media_libraries` options of your CMS configuration file. The `media_library` option from Netlify/Decap CMS is also supported for backward compatibility.

The following example demonstrates how to configure multiple providers in Sveltia CMS:

```yaml [YAML]
# Default media storage paths
media_folder: /public/media
public_folder: /media

# Media provider features
media_libraries:
  default:
    config:
      max_file_size: 1024000 # default: Infinity
      slugify_filename: true # default: false
      # transformations: # See the documentation for details
  cloudinary:
    config:
      cloud_name: YOUR_CLOUD_NAME
      api_key: YOUR_API_KEY
    output_filename_only: true
  uploadcare:
    config:
      publicKey: YOUR_PUBLIC_KEY
    settings:
      autoFilename: true
      defaultOperations: '/resize/800x600/'
```

```toml [TOML]
# Default media storage paths
media_folder = "/public/media"
public_folder = "/media"

# Media provider features
[media_libraries.default]
[media_libraries.default.config]
max_file_size = 1024000 # default: Infinity
slugify_filename = true # default: false
# transformations: See the documentation for details

[media_libraries.cloudinary]
output_filename_only = true

[media_libraries.cloudinary.config]
cloud_name = "YOUR_CLOUD_NAME"
api_key = "YOUR_API_KEY"

[media_libraries.uploadcare]
[media_libraries.uploadcare.config]
publicKey = "YOUR_PUBLIC_KEY"

[media_libraries.uploadcare.settings]
autoFilename = true
defaultOperations = "/resize/800x600/"
```

```json [JSON]
{
  "media_folder": "/public/media",
  "public_folder": "/media",
  "media_libraries": {
    "default": {
      "config": {
        "max_file_size": 1024000,
        "slugify_filename": true
      }
    },
    "cloudinary": {
      "config": {
        "cloud_name": "YOUR_CLOUD_NAME",
        "api_key": "YOUR_API_KEY"
      },
      "output_filename_only": true
    },
    "uploadcare": {
      "config": {
        "publicKey": "YOUR_PUBLIC_KEY"
      },
      "settings": {
        "autoFilename": true,
        "defaultOperations": "/resize/800x600/"
      }
    }
  }
}
```

```js [JavaScript]
{
  media_folder: "/public/media",
  public_folder: "/media",
  media_libraries: {
    default: {
      config: {
        max_file_size: 1024000,
        slugify_filename: true,
      },
    },
    cloudinary: {
      config: {
        cloud_name: "YOUR_CLOUD_NAME",
        api_key: "YOUR_API_KEY",
      },
      output_filename_only: true,
    },
    uploadcare: {
      config: {
        publicKey: "YOUR_PUBLIC_KEY",
      },
      settings: {
        autoFilename: true,
        defaultOperations: "/resize/800x600/",
      },
    },
  },
}
```

See the individual media storage provider documentation for specific configuration options and details.

The `media_libraries` option can also be defined for a [File](https://sveltiacms.app/en/docs/fields/file) or [Image](https://sveltiacms.app/en/docs/fields/image) field. The options of each provider are merged over the same provider’s top-level options. This includes the internal media storage (`default`), the stock photo providers (`stock_assets`) and the shared `all` options. A field therefore only needs to set the options it changes, or `false` to make the provider unavailable for the field. Providers not defined at the field level fall back to the top-level configuration.

The options are merged as follows:

- A nested object such as `config` is merged key by key, but only one level deep.
- Other values, including arrays such as the `providers` list, are replaced.
- The `all` options are merged shallowly, too.

As a result, a field-level `transformations` map, under `all` or `default.config`, replaces the top-level one as a whole rather than being merged format by format.

**Legacy `media_library` Option**

Sveltia CMS supports the legacy `media_library` option for backward compatibility with Netlify/Decap CMS. For new configurations, use the `media_libraries` option instead.

With the legacy option, only a single media storage provider can be configured. If both options define the same provider, `media_libraries` takes precedence. Netlify/Decap CMS requires the `name`, but Sveltia CMS applies a legacy option without a `name` to the internal media storage.

Here is an example of configuring Cloudinary using the legacy option:

```yaml
media_library:
  name: cloudinary
  config:
    cloud_name: YOUR_CLOUD_NAME
    api_key: YOUR_API_KEY
  output_filename_only: true
```

### Additional Features

A couple of additional features are available to enhance media management. These features apply to the internal media storage and to files uploaded to external storage providers, except for Cloudinary, which uses its own Media Library widget.

The configuration goes in the `media_libraries` option, under the `all` key. For the internal media storage, these options can be overridden by the same options in `media_libraries.default.config`. A File or Image field can also have its own `media_libraries.all` options, which are merged into the global ones.

For the internal media storage, the options are applied in this order, each overriding the previous ones:

1. the top-level `all`
1. the top-level `default.config`
1. the field-level `all`
1. the field-level `default.config`

So a field-level `all` option takes precedence over the same option in the top-level `default.config`.

#### Image Optimization

You can enable automatic image optimization by configuring the `transformations` option in the `media_libraries` configuration. This allows you to specify how uploaded images should be processed and optimized before being stored.

For example, you can convert raster images to WebP format, resize them to a maximum dimension and optimize SVG files.

```yaml [YAML]{3-10}
media_libraries:
  all:
    transformations:
      raster_image: # original format
        format: webp # new format, only `webp` is supported
        quality: 85 # integer between 0 and 100, default: 85
        width: 2048 # default: original size
        height: 2048 # default: original size
      svg:
        optimize: true # default: false
```

```toml [TOML]{2-9}
[media_libraries.all]
[media_libraries.all.transformations]
[media_libraries.all.transformations.raster_image]
format = "webp"
quality = 85
width = 2048
height = 2048
[media_libraries.all.transformations.svg]
optimize = true
```

```json [JSON]{4-14}
{
  "media_libraries": {
    "all": {
      "transformations": {
        "raster_image": {
          "format": "webp",
          "quality": 85,
          "width": 2048,
          "height": 2048
        },
        "svg": {
          "optimize": true
        }
      }
    }
  }
}
```

```js [JavaScript]{4-14}
{
  media_libraries: {
    all: {
      transformations: {
        raster_image: {
          format: "webp",
          quality: 85,
          width: 2048,
          height: 2048,
        },
        svg: {
          optimize: true,
        },
      },
    },
  },
}
```

Then, whenever a user selects images to upload, those images are automatically optimized, all within the browser. Raster images such as JPEG and PNG are converted to WebP format and resized if necessary. If the `optimize` option is `true`, SVG images are minified using the [SVGO](https://github.com/svg/svgo) library, which removes unnecessary data such as comments and editor metadata.

In case you’re not aware, [WebP](https://developers.google.com/speed/webp) offers better compression than conventional formats and is now [widely supported](https://caniuse.com/webp) across major browsers. So there is no reason not to use WebP on the web.

- `raster_image` applies to any supported raster image format: `avif`, `gif`, `heic`, `jpeg`, `png` and `webp`. If you like, you can use a specific format as key instead of `raster_image`, or in addition to it to give one format different options.
- The `width` and `height` options are the maximum width and height in pixels, respectively. If an image is larger than the specified dimension, it will be scaled down, keeping the aspect ratio. Smaller images will not be scaled up.
- If the browser can’t encode WebP, the image may be saved in PNG format instead, with the file extension changed accordingly.
- File processing is a bit slow on Safari because [native WebP encoding](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp) is [not supported](https://bugs.webkit.org/show_bug.cgi?id=183257) and the [jSquash](https://github.com/jamsinclair/jSquash) library is used instead.
- AVIF conversion is not supported because no browser has native AVIF encoding support ([Chromium won’t fix it](https://issues.chromium.org/issues/40848792)) and the third-party library (and AVIF encoding in general) is very slow.
- This feature is not intended for creating image variants in different formats and sizes. It should be done with a framework during the build process. Popular frameworks like [Astro](https://docs.astro.build/en/guides/images/), [Eleventy](https://www.11ty.dev/docs/plugins/image/), [Hugo](https://gohugo.io/content-management/image-processing/), [Next.js](https://nextjs.org/docs/pages/api-reference/components/image) and [SvelteKit](https://svelte.dev/docs/kit/images) have built-in image processing capabilities.
- Animated GIF, WebP and PNG images are uploaded as they are, without conversion or resizing, because only their first frame would be kept otherwise.
- Exif metadata is stripped from raster images to reduce file size. If you want to keep it, upload the original files without optimization and use the framework to process them later.

##### HEIC Photos

Photos taken on an iPhone or a recent Android phone are often saved in HEIC (HEIF) format, which only Safari can display. When the `raster_image` or `heic` transformation is configured, HEIC photos are accepted by Image fields and the Asset Library, and converted on upload like any other raster image:

- The photo is decoded within the browser using [libheif](https://github.com/strukturag/libheif) compiled to WebAssembly. The decoder, [`@discourse/heic`](https://www.npmjs.com/package/@discourse/heic), is a build from the [jSquash](https://github.com/jamsinclair/jSquash) project and is downloaded from UNPKG on first use (about 300 KB). Decoding runs in a Web Worker so the interface stays responsive. It takes about half a second for a 12-megapixel photo on a recent laptop. Photos are decoded one at a time. Safari decodes HEIC natively, so nothing is downloaded there.
- A HEIC photo saved with a `.jpg` extension is detected by its content and converted as well. This happens when a photo is renamed rather than converted. Without HEIC conversion, such a file is rejected as unusable, because browsers other than Safari can’t display it.
- A HEIC photo that can’t be decoded is rejected rather than uploaded as is.
- Use the `heic` key to give HEIC photos their own options, such as a smaller maximum dimension, since they’re typically full-resolution camera shots.
- If your site adopts a [Content Security Policy](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy), add `blob:` to the `worker-src` directive so that the decoder can run in a Web Worker. The decoder falls back to the main thread otherwise, which freezes the interface during decoding.

Without HEIC conversion, Image fields don’t offer HEIC photos in the file picker, while `.heic` files uploaded to the Asset Library are stored as they are.

Thumbnails of HEIC photos already in the repository are generated with the same decoder regardless of the configuration.

**Future Plans**

We may add more transformation options in the future.

#### File Size Limits

To restrict the maximum file size for uploads, set the `max_file_size` option (in bytes) in the `media_libraries` configuration, either at the top level or in a File/Image field. The default value is `Infinity`, meaning there is no limit. The legacy field-level `media_library.config.max_file_size` option from Netlify/Decap CMS is also supported for the internal media storage.

For example, to set a maximum file size of 1 MB for all uploads, add the following to your `config.yml`:

```yaml [YAML]{3}
media_libraries:
  all:
    max_file_size: 1024000
```

```toml [TOML]{2}
[media_libraries.all]
max_file_size = 1024000
```

```json [JSON]{4}
{
  "media_libraries": {
    "all": {
      "max_file_size": 1024000
    }
  }
}
```

```js [JavaScript]{4}
{
  media_libraries: {
    all: {
      max_file_size: 1024000,
    },
  },
}
```

#### Slugification of Filenames

Some frameworks and static site generators have restrictions on filenames, such as not allowing spaces or special characters. To ensure compatibility, you can enable filename slugification by setting the `slugify_filename` option to `true` in the `media_libraries` configuration.

```yaml [YAML]{3}
media_libraries:
  all:
    slugify_filename: true
```

```toml [TOML]{2}
[media_libraries.all]
slugify_filename = true
```

```json [JSON]{4}
{
  "media_libraries": {
    "all": {
      "slugify_filename": true
    }
  }
}
```

```js [JavaScript]{4}
{
  media_libraries: {
    all: {
      slugify_filename: true,
    },
  },
}
```

Once enabled, any uploaded file will have its filename converted to a URL-friendly format, according to the [global slug options](https://sveltiacms.app/en/docs/collections/entries/slugs#global-slug-options). The same applies to a file renamed in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library), or in a [File](https://sveltiacms.app/en/docs/fields/file) or [Image](https://sveltiacms.app/en/docs/fields/image) field before the entry is saved. The resulting filename is shown below the input. For example, `Blog Photo 1.jpg` is saved as `blog-photo-1.jpg`.

#### Renaming Uploaded Files

Files are uploaded with their original names by default, which are often meaningless, like `IMG_1234.jpg`, or may reveal private information. To give uploaded files consistent names, set the `filename_template` option to a template for the new filename.

```yaml [YAML]{3}
media_libraries:
  all:
    filename_template: '{{year}}{{month}}{{day}}-{{uuid_short}}'
```

```toml [TOML]{2}
[media_libraries.all]
filename_template = "{{year}}{{month}}{{day}}-{{uuid_short}}"
```

```json [JSON]{4}
{
  "media_libraries": {
    "all": {
      "filename_template": "{{year}}{{month}}{{day}}-{{uuid_short}}"
    }
  }
}
```

```js [JavaScript]{4}
{
  media_libraries: {
    all: {
      filename_template: "{{year}}{{month}}{{day}}-{{uuid_short}}",
    },
  },
}
```

With this configuration, a photo named `IMG_1234.jpg` uploaded on September 29, 2026, would be saved as something like `20260929-392bdcf3b642.jpg`.

The template supports the same [template tags](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags) and [string transformations](https://sveltiacms.app/en/docs/string-transformations) as the entry `slug` option, plus the following tags for the original file:

- `{{filename}}`: The original filename without the extension, e.g. `IMG_1234`.
- `{{extension}}`: The original file extension, e.g. `jpg`.

Keep these points in mind:

- The file extension is always appended to the new filename, so don’t include it in the template. If the file is converted to another format by [image optimization](#image-optimization), the new extension is used.
- The value of each tag is slugified according to the [global slug options](https://sveltiacms.app/en/docs/collections/entries/slugs#global-slug-options), while the rest of the template is used as is, except for characters that are not allowed in filenames. Enable the [`slugify_filename`](#slugification-of-filenames) option as well to slugify the whole filename.
- If a file with the same name already exists in the folder, a number is appended to the new filename, like `20260929-392bdcf3b642-1.jpg`.
- A file that replaces an existing asset keeps the name of that asset.

When a file is added to a [File](https://sveltiacms.app/en/docs/fields/file) or [Image](https://sveltiacms.app/en/docs/fields/image) field in the internal media storage, it’s renamed when the entry is saved. So you can also use the tags that refer to the entry, like `{{slug}}` for the entry slug and `{{fields.title}}` for a field value.

Before the entry is saved, the field shows the file with its new filename, and the name follows any changes to the entry. For example, with the `{{slug}}-{{filename}}` template, a photo named `IMG_1234.jpg` added to an entry with the `summer-trip` slug would be saved as `summer-trip-img-1234.jpg`.

In a multilingual entry, the tags are filled with the content of the default locale, so a file used in several locales has the same name everywhere. If the user renames the file by hand before saving the entry, the template no longer applies to the file.

A file uploaded in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) or to an external storage provider is renamed right away, without an entry, so only the date/time tags, the unique identifier tags, `{{filename}}` and `{{extension}}` make sense there. Any other tag is replaced with a random value.

The option can also be set for a specific File or Image field, under the field’s `media_libraries` option. For example, to name the cover images of blog posts after the entry:

```yaml
collections:
  - name: posts
    fields:
      - name: cover
        label: Cover Image
        widget: image
        media_libraries:
          default:
            config:
              filename_template: '{{slug}}-cover'
```

Source: https://sveltiacms.app/en/docs/media

---

## Internal Media Storage

The internal media storage in Sveltia CMS uses the repository’s file system to store and manage media assets such as images and files. It provides a simple and effective way to handle media uploads directly within the CMS interface. Some additional features, such as image optimization and file size limits, are also available to enhance the media management experience.

**Considerations**

The internal storage (Git repository) may not be suitable for a large number of media files or very large files, because they can cause performance issues with Git operations. This is particularly true for the [GitHub backend](https://sveltiacms.app/en/docs/backends/github), which does not support Git LFS (Large File Storage) at this time. In such cases, consider using [external storage](https://sveltiacms.app/en/docs/media#external-storage).

### Requirements

No special requirements are needed to use the internal media storage, as it works with any backend supported by Sveltia CMS.

### Configuring Folder Paths

You can configure the folder paths for storing and accessing media files in the internal media storage at four levels: top-level, collection-level, file-level and field-level. The settings at each level override the ones at the previous level.

#### Top-Level Configuration

Define the internal media storage settings in your `config.yml` file using the `media_folder` and `public_folder` options at the root level.

```yaml [YAML]
media_folder: /public/uploads
public_folder: /uploads
```

```toml [TOML]
media_folder = "/public/uploads"
public_folder = "/uploads"
```

```json [JSON]
{
  "media_folder": "/public/uploads",
  "public_folder": "/uploads"
}
```

```js [JavaScript]
{
  media_folder: "/public/uploads",
  public_folder: "/uploads",
}
```

##### Media Folder

The `media_folder` option specifies the folder in the repository where media files will be stored. Check your framework’s static assets handling to choose an appropriate folder.

**Common static folder names**

Here’s a quick reference for various frameworks:

| Framework / SSG | Static Folder Name |
| --- | --- |
| Eleventy, Jekyll, Lume | `/` (root) |
| Pelican, Quartz | `/content` |
| Docsify, MkDocs | `/docs` |
| Rspress, VitePress | `/docs/public`¹ |
| Nikola | `/files` |
| Angular, Astro, Fumadocs, HonoX, Next.js, Nextra, Nuxt, Qwik, React Router (Remix), SolidStart, TanStack Start, UmiJS, Vite | `/public` |
| Hexo, Middleman | `/source` |
| Bridgetown, mdBook | `/src` |
| Analog | `/src/public` |
| Docusaurus, Fresh, Gatsby, Gridsome, Hugo, Nuxt 2, SvelteKit, Zola | `/static` |
| VuePress | `/docs/.vuepress/public`¹ |

¹ The `public` folder is placed under the source folder, which is often named `docs`. If your site’s Markdown files are in the root folder, use `/public` (VitePress) or `/.vuepress/public` (VuePress) instead.

Some frameworks process HTML or YAML files in these folders instead of copying them as is, so the admin folder needs extra configuration:

- **Eleventy**: Add `eleventyConfig.addPassthroughCopy('admin')` to the configuration file. Otherwise, `index.html` is rendered as a template and `config.yml` is not copied at all.
- **Hexo**: Add `skip_render: admin/**` to `_config.yml` so the theme layout is not applied to the admin page.
- **Lume**: Add `site.copy('admin')` to `_config.ts`.
- **Middleman**: Add `page '/admin/*', layout: false` to `config.rb` so the site layout is not applied to the admin page.
- **Pelican**: Add `'admin'` to `STATIC_PATHS`, and to `ARTICLE_EXCLUDES` and `PAGE_EXCLUDES`, so the admin page is copied instead of being read as an article.
- **Sphinx**: Put the admin folder in a folder listed in the `html_extra_path` option, such as `_extra`, so it’s copied to the root of the output folder.

If you’re unsure about your framework’s static files folder, please refer to its official documentation.

A few notes about this option:

- It must be an absolute path relative to the root of the repository.
- Although the leading slash can be omitted, it is recommended to include it for clarity.
- To use the repository’s root folder, set this option to a slash (`/`), a period (`.`) or an empty string (`''`).

##### Public Folder

The `public_folder` option defines the public URL path that corresponds to the `media_folder`. The leading slash is added automatically if omitted, but it is recommended to include it for clarity. If `public_folder` is not specified, it will default to the value of `media_folder` with a leading slash.

With the above configuration, if a media file is stored in `/public/uploads/image.jpg` and your site is hosted at `https://example.com`, the public URL to access the image would be `https://example.com/uploads/image.jpg`.

**Breaking change from Netlify/Decap CMS**

Sveltia CMS does not support absolute URLs in the `public_folder` option. Use relative paths starting with a slash (`/`) instead.

##### Disabling Internal Media Storage

If you only want to use an [external media storage provider](https://sveltiacms.app/en/docs/media#external-storage) and do not need the internal media storage, you can omit the `media_folder` option to disable it. Otherwise, this option is required.

Note that some of the [stock photo providers](https://sveltiacms.app/en/docs/integrations/stock-photos) may still require a `media_folder` to function properly. They don’t allow direct linking to their CDN URLs, so the images have to be copied to the local repository instead.

You can also [disable the internal media storage for specific fields](#disabling-internal-media-storage-for-a-field).

#### Collection-Level Configuration

You can override the internal media storage settings for each collection by specifying the `media_folder` and `public_folder` options in the collection configuration.

```yaml [YAML]{5-6}
collections:
  - name: products
    label: Products
    folder: content/products
    media_folder: /public/uploads/products
    public_folder: /uploads/products
```

```toml [TOML]{5-6}
[[collections]]
name = "products"
label = "Products"
folder = "content/products"
media_folder = "/public/uploads/products"
public_folder = "/uploads/products"
```

```json [JSON]{7-8}
{
  "collections": [
    {
      "name": "products",
      "label": "Products",
      "folder": "content/products",
      "media_folder": "/public/uploads/products",
      "public_folder": "/uploads/products"
    }
  ]
}
```

```js [JavaScript]{7-8}
{
  collections: [
    {
      name: "products",
      label: "Products",
      folder: "content/products",
      media_folder: "/public/uploads/products",
      public_folder: "/uploads/products",
    },
  ],
}
```

If `public_folder` is not specified, it will default to the value of the collection-level `media_folder`.

**Absolute vs. Relative Paths**

The collection-level and field-level `media_folder` option must start with a slash (`/`) to indicate an absolute path from the root of the repository, while a leading slash can be omitted in the top-level `media_folder` option.

If you use a relative path, Sveltia CMS treats it as relative to the collection `folder` (and `path`, if defined).

A [file collection](https://sveltiacms.app/en/docs/collections/files) has no folder of its own. There, the path is relative to the folder of each file that doesn’t have a `media_folder` option of its own. For example, with `media_folder: images`, the media for `content/pages/about.md` goes to `content/pages/images`. See the [Using entry-relative folders](#using-entry-relative-folders) section below for details.

A collection’s `folder` can be the root of the repository, as with `folder: .`. In that case, only the files in the relative media folder, such as `images` and the folders below it, are listed as the collection’s assets. This way, the rest of the repository isn’t mistaken for media.

For such a collection, a relative media folder that can’t be told apart from the other files in the repository lists no assets. This includes the root itself (`media_folder: ''`) and a folder starting with a placeholder like `{{slug}}`.

We recommend using absolute paths for better clarity and to avoid confusion, unless you specifically want to organize media files within the content folders.

**Note for Netlify/Decap CMS users**

The absolute path setup is not documented in the official Netlify/Decap CMS documentation, but it has been supported at least since 2020. Sveltia CMS continues to support this behavior for compatibility and better usability.

##### Using Placeholders

The following placeholder variables can be used in the `media_folder` and `public_folder` options, in addition to [slug template tags](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags):

- `{{dirname}}`: The name of the directory containing the entry file, relative to the collection `folder`. It never includes the locale folder of an [i18n structure](https://sveltiacms.app/en/docs/i18n/structures) with a folder per locale, so it’s the same in every locale.
- `{{filename}}`: The entry filename without the extension. (Not the media filename.)
- `{{extension}}`: The entry file extension. (Not the media file extension.)
- `{{media_folder}}`: Refers to the top-level `media_folder` setting.
- `{{public_folder}}`: Refers to the top-level `public_folder` setting.

The following example is the same as the previous one, but using placeholders:

```yaml [YAML]{5-6}
collections:
  - name: products
    label: Products
    folder: content/products
    media_folder: '{{media_folder}}/products'
    public_folder: '{{public_folder}}/products'
```

```toml [TOML]{5-6}
[[collections]]
name = "products"
label = "Products"
folder = "content/products"
media_folder = "{{media_folder}}/products"
public_folder = "{{public_folder}}/products"
```

```json [JSON]{7-8}
{
  "collections": [
    {
      "name": "products",
      "label": "Products",
      "folder": "content/products",
      "media_folder": "{{media_folder}}/products",
      "public_folder": "{{public_folder}}/products"
    }
  ]
}
```

```js [JavaScript]{7-8}
{
  collections: [
    {
      name: "products",
      label: "Products",
      folder: "content/products",
      media_folder: "{{media_folder}}/products",
      public_folder: "{{public_folder}}/products",
    },
  ],
}
```

##### Using Entry-Relative Folders

Some frameworks and static site generators support organizing content and media files together in the same folder. One example is [Hugo’s page bundles](https://gohugo.io/content-management/page-bundles/), where each content entry can have its own folder containing the content file and associated media files.

Assets stored in entry-relative folders are only accessible by the associated entry and not available for other entries. Therefore, Sveltia CMS automatically deletes these assets when the associated entry is deleted. When you’re [working with a local repository](https://sveltiacms.app/en/docs/workflows/local), the empty enclosing folder is also deleted.

This only applies when the entry has a folder of its own, for example with a `path` option like `{{slug}}/index`. When entries are files sharing one folder, the media files in that folder can belong to any of them, so they are left alone when an entry is deleted.

In a collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested#nesting-page-bundles), the folders below an entry hold entries of their own, so the media in them is left alone: deleting a page never touches the media of the pages beneath it.

Because these assets belong to the entry, they follow it: renaming an entry, or filing it under a different parent in a collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested#nesting-page-bundles), moves the whole folder in the same commit.

To configure Sveltia CMS to use entry-relative paths for media files, set the `media_folder` and `public_folder` options to empty strings (`''`) in your collection configuration. This tells Sveltia CMS to look for media files in the same folder as the content files.

This only makes each entry’s media its own if the entry has a folder of its own to keep it in. Two options give it one:

- the [`path`](https://sveltiacms.app/en/docs/collections/entries/slugs#using-subfolders) option, as in the example below
- the `subfolders` mode of a collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested#nesting-page-bundles)

Without either, entries are files sharing one folder. A relative `media_folder` then resolves to the collection folder, and the media is shared as well.

**Tip**

When a collection has the `path` option but no `media_folder` option of its own, its `media_folder` defaults to an empty string, and `public_folder` follows it. The entry-relative setup below is therefore implied. This applies when the [global `media_folder`](#media-folder) option is defined. Set the collection-level `media_folder` explicitly to store the media elsewhere.

```yaml [YAML]{5-7}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    path: '{{slug}}/index'
    media_folder: ''
    public_folder: ''
    fields:
      - { name: title, label: Title }
      - { name: cover, label: Cover Image, widget: image }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5-7}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
path = "{{slug}}/index"
media_folder = ""
public_folder = ""

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "cover"
label = "Cover Image"
widget = "image"

[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7-9}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "path": "{{slug}}/index",
      "media_folder": "",
      "public_folder": "",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "cover", "label": "Cover Image", "widget": "image" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]{7-9}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      path: "{{slug}}/index",
      media_folder: "",
      public_folder: "",
      fields: [
        { name: "title", label: "Title" },
        { name: "cover", label: "Cover Image", widget: "image" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

This configuration allows you to structure your content and media files like this:

```
.
└─ content/
   └─ posts/
      └─ my-first-post/
         ├─ index.md
         └─ image1.jpg
```

And the `cover` image field in the `index.md` file will omit the folder path when referencing the image:

```yaml
---
title: My First Post
cover: image1.jpg
---
Content goes here...
```

###### Multilingual Entries

With [i18n](https://sveltiacms.app/en/docs/i18n) enabled, an entry-relative file is stored once, not once per locale.

The `multiple_files` and `single_file` structures keep every locale’s content in the folder holding the entry, so the media already sits beside all of them. This is how [Hugo’s page bundles](https://gohugo.io/content-management/page-bundles/) are usually organized:

```yaml
content/posts/my-first-post/index.en.md   # cover: image1.jpg
content/posts/my-first-post/index.de.md   # cover: image1.jpg
content/posts/my-first-post/image1.jpg
```

The `multiple_folders` and `multiple_root_folders` structures give each locale a folder of its own. The file is saved in the default locale’s folder, and every locale’s entry refers to it by the same relative path, so the media is never duplicated:

```yaml
content/posts/en/my-first-post/index.md   # cover: image1.jpg
content/posts/de/my-first-post/index.md   # cover: image1.jpg
content/posts/en/my-first-post/image1.jpg
```

Sveltia CMS resolves that path across locales, so the image appears in the content editor whichever locale the user is editing.

Your framework may not do the same. Taken literally from the German entry’s own folder, `image1.jpg` points at a file that isn’t there. Hugo resolves it for page bundles, where [a bundle inherits the resources of its translated pages](https://gohugo.io/content-management/multilingual/), as long as the two are linked as translations. If your framework has no such mechanism, prefer the `multiple_files` structure, which keeps the media next to every locale’s file.

###### Media Subfolders

If you want to organize media files in a subfolder within each entry folder, you can specify the subfolder name in the `media_folder` and `public_folder` options.

```yaml [YAML]{5-7}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    path: '{{slug}}/index'
    media_folder: 'images'
    public_folder: 'images'
```

```toml [TOML]{5-7}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
path = "{{slug}}/index"
media_folder = "images"
public_folder = "images"
```

```json [JSON]{7-9}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "path": "{{slug}}/index",
      "media_folder": "images",
      "public_folder": "images"
    }
  ]
}
```

```js [JavaScript]{7-9}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      path: "{{slug}}/index",
      media_folder: "images",
      public_folder: "images",
    },
  ],
}
```

Then the folder structure would look like this:

```
.
└─ content/
   └─ posts/
      └─ my-first-post/
         ├─ index.md
         └─ images/
            └─ image1.jpg
```

And the `cover` image field in the `index.md` file would reference the image like this:

```yaml
---
title: My First Post
cover: images/image1.jpg
---
Content goes here...
```

#### File-Level Configuration

Each file in a [file collection](https://sveltiacms.app/en/docs/collections/files) can also have its own media folder settings by specifying the `media_folder` and `public_folder` options in the file configuration, which override both the top-level and collection-level settings.

```yaml [YAML]{8-9}
collections:
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: content/pages/about.md
        media_folder: /public/uploads/about
        public_folder: /uploads/about
```

```toml [TOML]{9-10}
[[collections]]
name = "pages"
label = "Pages"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/pages/about.md"
media_folder = "/public/uploads/about"
public_folder = "/uploads/about"
```

```json [JSON]{11-12}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/pages/about.md",
          "media_folder": "/public/uploads/about",
          "public_folder": "/uploads/about"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{11-12}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/pages/about.md",
          media_folder: "/public/uploads/about",
          public_folder: "/uploads/about",
        },
      ],
    },
  ],
}
```

The same [placeholder variables](#using-placeholders) mentioned above can be used in file-level `media_folder` and `public_folder` options.

A file without a `media_folder` option of its own inherits the collection’s. A relative collection-level `media_folder` is then resolved against that file’s own folder, along with the collection’s `public_folder`. Each such file appears as its own folder in the Asset Library.

#### Field-Level Configuration

You can also configure media storage settings for individual File or Image fields within a collection. This allows you to specify different media folders for different fields, overriding both the top-level and collection-level settings.

```yaml [YAML]{5-6}
fields:
  - name: thumbnail
    label: Thumbnail Image
    widget: image
    media_folder: /public/uploads/thumbnails
    public_folder: /uploads/thumbnails
```

```toml [TOML]{5-6}
[[fields]]
name = "thumbnail"
label = "Thumbnail Image"
widget = "image"
media_folder = "/public/uploads/thumbnails"
public_folder = "/uploads/thumbnails"
```

```json [JSON]{7-8}
{
  "fields": [
    {
      "name": "thumbnail",
      "label": "Thumbnail Image",
      "widget": "image",
      "media_folder": "/public/uploads/thumbnails",
      "public_folder": "/uploads/thumbnails"
    }
  ]
}
```

```js [JavaScript]{7-8}
{
  fields: [
    {
      name: "thumbnail",
      label: "Thumbnail Image",
      widget: "image",
      media_folder: "/public/uploads/thumbnails",
      public_folder: "/uploads/thumbnails",
    },
  ],
}
```

The same [placeholder variables](#using-placeholders) mentioned above can be used in field-level `media_folder` and `public_folder` options.

Field-level `media_folder` and `public_folder` options can also be set to empty strings (`''`) or subfolder names to use entry-relative paths, just like in the collection-level configuration.

##### Disabling Internal Media Storage for a Field

If you have enabled an [external media storage provider](https://sveltiacms.app/en/docs/media#external-storage), you can disable the internal media storage for a specific field. Add the `media_libraries` option to the field configuration, with the `default` library set to `false`. This will prevent the media picker from showing the internal media library and only allow selecting from the external provider.

```yaml [YAML]{5-6}
fields:
  - name: cover
    label: Cover Image
    widget: image
    media_libraries:
      default: false
```

```toml [TOML]{5-6}
[[fields]]
name = "cover"
label = "Cover Image"
widget = "image"
[fields.media_libraries]
default = false
```

```json [JSON]{7-9}
{
  "fields": [
    {
      "name": "cover",
      "label": "Cover Image",
      "widget": "image",
      "media_libraries": {
        "default": false
      }
    }
  ]
}
```

```js [JavaScript]{7-9}
{
  fields: [
    {
      name: "cover",
      label: "Cover Image",
      widget: "image",
      media_libraries: {
        default: false,
      },
    },
  ],
}
```

### Asset Collections

In addition to the [global media folder](#top-level-configuration) and [collection-specific media folders](#collection-level-configuration), Sveltia CMS supports defining separate asset collections that can be used across multiple [content collections](https://sveltiacms.app/en/docs/collections). This allows you to organize your media assets in a more structured way and reuse them in different contexts.

To define an asset collection, add a new entry to the `asset_collections` array in your `config.yml` file. Each asset collection has the following properties:

- `name`: Unique identifier for the asset collection. Required and must be unique across all collections.
- `label`: Human-readable name for the asset collection, displayed in the media picker. If omitted, it defaults to the value of `name`.
- `icon`: Optional icon for the asset collection, which can be a string representing a [Material Symbols](https://fonts.google.com/icons?icon.set=Material+Symbols&icon.platform=web) icon name.
- `media_folder`: The folder in the repository where media files for this collection will be stored. Required and must be an absolute path relative to the root of the repository. A leading slash can be omitted, but it is recommended to include it for clarity.
- `public_folder`: The public URL path that corresponds to the `media_folder`. If omitted, it defaults to the value of `media_folder`.
- `readonly`: Set to `true` to make the asset collection read-only, so assets can’t be uploaded to, changed in or deleted from it. Optional. See [Making Content Read-Only](https://sveltiacms.app/en/docs/collections/entries/operations#making-content-read-only).

Configure your asset collections like this:

```yaml [YAML]
asset_collections:
  - name: images
    label: Images
    icon: image
    media_folder: /public/uploads/images
    public_folder: /uploads/images
  - name: logos
    label: Logos
    icon: brand_family
    media_folder: /public/uploads/logos
    public_folder: /uploads/logos
  - name: documents
    label: Documents
    icon: description
    media_folder: /public/uploads/documents
    public_folder: /uploads/documents
```

```toml [TOML]
[[asset_collections]]
name = "images"
label = "Images"
icon = "image"
media_folder = "/public/uploads/images"
public_folder = "/uploads/images"

[[asset_collections]]
name = "logos"
label = "Logos"
icon = "brand_family"
media_folder = "/public/uploads/logos"
public_folder = "/uploads/logos"

[[asset_collections]]
name = "documents"
label = "Documents"
icon = "description"
media_folder = "/public/uploads/documents"
public_folder = "/uploads/documents"
```

```json [JSON]
{
  "asset_collections": [
    {
      "name": "images",
      "label": "Images",
      "icon": "image",
      "media_folder": "/public/uploads/images",
      "public_folder": "/uploads/images"
    },
    {
      "name": "logos",
      "label": "Logos",
      "icon": "brand_family",
      "media_folder": "/public/uploads/logos",
      "public_folder": "/uploads/logos"
    },
    {
      "name": "documents",
      "label": "Documents",
      "icon": "description",
      "media_folder": "/public/uploads/documents",
      "public_folder": "/uploads/documents"
    }
  ]
}
```

```js [JavaScript]
{
  asset_collections: [
    {
      name: "images",
      label: "Images",
      icon: "image",
      media_folder: "/public/uploads/images",
      public_folder: "/uploads/images",
    },
    {
      name: "logos",
      label: "Logos",
      icon: "brand_family",
      media_folder: "/public/uploads/logos",
      public_folder: "/uploads/logos",
    },
    {
      name: "documents",
      label: "Documents",
      icon: "description",
      media_folder: "/public/uploads/documents",
      public_folder: "/uploads/documents",
    },
  ],
}
```

### Additional Features

For backward compatibility, the [additional media storage features](https://sveltiacms.app/en/docs/media#additional-features) can be configured specifically for the internal media storage. This configuration goes in the `media_libraries` option, under the `default` → `config` key. This key applies only to the internal media storage provider, unlike the `all` key, which also applies to files uploaded to external storage providers. Options set here override the same options under the `all` key at the same level.

```yaml [YAML]{4-11}
media_libraries:
  default:
    config:
      transformations:
        raster_image: # original format
          format: webp # new format, only `webp` is supported
          quality: 85 # default: 85
          width: 2048 # default: original size
          height: 2048 # default: original size
        svg:
          optimize: true
```

```toml [TOML]{3-11}
[media_libraries.default]
[media_libraries.default.config]
[media_libraries.default.config.transformations]
[media_libraries.default.config.transformations.raster_image]
format = "webp"
quality = 85
width = 2048
height = 2048

[media_libraries.default.config.transformations.svg]
optimize = true
```

```json [JSON]{5-15}
{
  "media_libraries": {
    "default": {
      "config": {
        "transformations": {
          "raster_image": {
            "format": "webp",
            "quality": 85,
            "width": 2048,
            "height": 2048
          },
          "svg": {
            "optimize": true
          }
        }
      }
    }
  }
}
```

```js [JavaScript]{5-15}
{
  media_libraries: {
    default: {
      config: {
        transformations: {
          raster_image: {
            format: "webp",
            quality: 85,
            width: 2048,
            height: 2048,
          },
          svg: {
            optimize: true,
          },
        },
      },
    },
  },
}
```

```yaml [YAML]{4}
media_libraries:
  default:
    config:
      max_file_size: 1024000
```

```toml [TOML]{3}
[media_libraries.default]
[media_libraries.default.config]
max_file_size = 1024000
```

```json [JSON]{5}
{
  "media_libraries": {
    "default": {
      "config": {
        "max_file_size": 1024000
      }
    }
  }
}
```

```js [JavaScript]{5}
{
  media_libraries: {
    default: {
      config: {
        max_file_size: 1024000,
      },
    },
  },
}
```

```yaml [YAML]{4}
media_libraries:
  default:
    config:
      slugify_filename: true
```

```toml [TOML]{3}
[media_libraries.default]
[media_libraries.default.config]
slugify_filename = true
```

```json [JSON]{5}
{
  "media_libraries": {
    "default": {
      "config": {
        "slugify_filename": true
      }
    }
  }
}
```

```js [JavaScript]{5}
{
  media_libraries: {
    default: {
      config: {
        slugify_filename: true,
      },
    },
  },
}
```

### Accessing the Storage

There are two main ways to use the internal media storage in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media assets directly within the entry editor. Clicking the Browse button opens the media picker. There, users can select existing assets or upload new ones. They can also browse the [subfolders](https://sveltiacms.app/en/docs/ui/asset-library#subfolders) of the media folder and create new ones as needed. These fields also support drag-and-drop functionality for easy uploads.

#### Standalone Asset Library

The Asset Library is accessible from the main navigation menu in the CMS interface. Here, users can view, upload and manage all media assets in one place. Assets can be viewed in a grid or list format. Users can browse and organize them in [subfolders](https://sveltiacms.app/en/docs/ui/asset-library#subfolders), search for specific files, and view asset details such as file size, dimensions and a list of entries using the asset.

Source: https://sveltiacms.app/en/docs/media/internal
