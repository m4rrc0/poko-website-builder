# Internationalization: Structures and Slugs

How localized entries and files are laid out in the repository, plus localized, editable and UUID slugs and preview paths. For the i18n options themselves, see `i18n.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## I18n Content Structures

The `structure` i18n option defines how localized content is stored on disk. It is set in the [top-level or collection-level configuration](https://sveltiacms.app/en/docs/i18n/options). Sveltia CMS supports five different structures:

- `single_file`: All locales are stored in a single file. This is the default structure.
- `single_file_default_root`: Like `single_file`, but the default locale’s fields are stored at the root level of the file (without a locale key), while non-default locales are nested under their locale key. This is designed to support [Lume’s Multilanguage plugin](https://lume.land/plugins/multilanguage/#multilanguage-data).
- `multiple_files`: Each locale has its own file with the locale code in the filename.
- `multiple_folders`: Each locale has its own folder containing the localized files.
- `multiple_root_folders`: Each locale has its own root folder containing all collections.

An entry collection can also put the `{{locale}}` placeholder in its `folder` option to place the locale folder anywhere in the path, as in `content/{{locale}}/posts`. See [Custom Locale Folder Placement](#custom-locale-folder-placement) below.

**Deprecation Notice**

The `multiple_folders_i18n_root` structure is deprecated and will be removed in Sveltia CMS v1.0.0. Use `multiple_root_folders` instead, which has a more intuitive name and the same file structure.

Some frameworks and static site generators may have specific requirements for multilingual content organization. Choose the structure that best fits your project’s needs.

When using a structure other than `single_file`, Sveltia CMS automatically links localized entries and files based on their filenames or folder paths. From the Content Editor perspective, they appear as a single entry or file with multiple locales, regardless of the underlying file structure. There’s no need to manually link translations.

### Entry Collections

The `structure` i18n option defines how localized content is stored for entry collections. Below are examples of each structure type.

#### Single File

```yaml [YAML]{2}
i18n:
  structure: single_file
  locales: [en, de, fr]
```

```toml [TOML]{2}
[i18n]
structure = "single_file"
locales = ["en", "de", "fr"]
```

```json [JSON]{3}
{
  "i18n": {
    "structure": "single_file",
    "locales": ["en", "de", "fr"]
  }
}
```

```js [JavaScript]{3}
{
  i18n: {
    structure: "single_file",
    locales: ["en", "de", "fr"],
  },
}
```

The `single_file` structure stores all locales in a single file:

```
/<folder>/<path>.<extension>
```

The file path remains the same for all locales:

```
.
└─ content/
   └─ pages/
      └─ about.md
```

And the file contains all locales in a single file, with locale keys as top-level properties:

```yaml
de:
  title: Über uns
  content: Dies ist die deutsche Version der Seite.
en:
  title: About Us
  content: This is the English version of the page.
fr:
  title: À propos de nous
  content: Ceci est la version française de la page.
```

#### Single File (Default Root)

```yaml [YAML]{2}
i18n:
  structure: single_file_default_root
  locales: [en, de, fr]
```

```toml [TOML]{2}
[i18n]
structure = "single_file_default_root"
locales = ["en", "de", "fr"]
```

```json [JSON]{3}
{
  "i18n": {
    "structure": "single_file_default_root",
    "locales": ["en", "de", "fr"]
  }
}
```

```js [JavaScript]{3}
{
  i18n: {
    structure: "single_file_default_root",
    locales: ["en", "de", "fr"],
  },
}
```

The `single_file_default_root` structure stores all locales in a single file, just like `single_file`. The difference is that the **default locale’s fields are written at the root level** of the file, while non-default locales are nested under their locale key:

```yaml
lang: [en, de, fr] # auto-generated list of all enabled locales
title: About Us
content: This is the English version of the page.
de:
  title: Über uns # default locale (de) at root
  content: Dies ist die deutsche Version der Seite.
fr:
  title: À propos de nous
  content: Ceci est la version française de la page.
```

This format is compatible with [Lume’s Multilanguage plugin](https://lume.land/plugins/multilanguage/#multilanguage-data), which resolves field values from the root level for the default locale and from the nested locale keys for other locales. The `lang` field is automatically maintained by Sveltia CMS and lists all currently enabled locales.

**Limitation**

Unlike the examples in Lume’s documentation, all non-default locales will have a complete set of fields, even if their values are the same as the default locale. When making changes manually, make sure to keep the non-default locale fields in sync with the default locale. Otherwise, you may end up with inconsistent content across locales.

#### Multiple Files

```yaml [YAML]{2}
i18n:
  structure: multiple_files
  locales: [en, de, fr]
```

```toml [TOML]{2}
[i18n]
structure = "multiple_files"
locales = ["en", "de", "fr"]
```

```json [JSON]{3}
{
  "i18n": {
    "structure": "multiple_files",
    "locales": ["en", "de", "fr"]
  }
}
```

```js [JavaScript]{3}
{
  i18n: {
    structure: "multiple_files",
    locales: ["en", "de", "fr"],
  },
}
```

The `multiple_files` structure creates separate files for each locale, with the locale code included in the filename:

```yaml
/<folder>/<path>.<locale>.<extension>
```

The file paths for each locale would look like this:

```yaml
.
└─ content/
   └─ pages/
      ├─ about.de.md  # German
      ├─ about.en.md  # English (default locale)
      └─ about.fr.md  # French
```

**Omitting Default Locale from File Path**

When the `omit_default_locale_from_file_path` option is set to `true`, the path depends on the locale being the default locale or not:

```yaml
/<folder>/<path>.<extension> # default locale
/<folder>/<path>.<locale>.<extension> # other locales
```

For example, with `en` as the default locale, the English file would be named `about.md`, while the German and French files would retain the locale suffix:

```yaml
.
└─ content/
   └─ pages/
      ├─ about.md     # English (default locale)
      ├─ about.de.md  # German
      └─ about.fr.md  # French
```

#### Multiple Folders

```yaml [YAML]{2}
i18n:
  structure: multiple_folders
  locales: [en, de, fr]
```

```toml [TOML]{2}
[i18n]
structure = "multiple_folders"
locales = ["en", "de", "fr"]
```

```json [JSON]{3}
{
  "i18n": {
    "structure": "multiple_folders",
    "locales": ["en", "de", "fr"]
  }
}
```

```js [JavaScript]{3}
{
  i18n: {
    structure: "multiple_folders",
    locales: ["en", "de", "fr"],
  },
}
```

The `multiple_folders` structure creates separate folders for each locale, containing the localized files:

```yaml
/<folder>/<locale>/<path>.<extension>
```

The file paths for each locale would look like this:

```yaml
.
└─ content/
   └─ pages/
      ├─ de/
      │  └─ about.md  # German
      ├─ en/
      │  └─ about.md  # English (default locale)
      └─ fr/
         └─ about.md  # French
```

**Omitting Default Locale from File Path**

When the `omit_default_locale_from_file_path` option is set to `true`, the path depends on the locale being the default locale or not:

```yaml
/<folder>/<path>.<extension> # default locale
/<folder>/<locale>/<path>.<extension> # other locales
```

For example, with `en` as the default locale, the English file would be located at `content/pages/about.md`, while the German and French files would be located in their respective locale folders:

```yaml
.
└─ content/
   └─ pages/
      ├─ about.md     # English (default locale)
      ├─ de/
      │  └─ about.md  # German
      └─ fr/
         └─ about.md  # French
```

#### Multiple Root Folders

```yaml [YAML]{2}
i18n:
  structure: multiple_root_folders
  locales: [en, de, fr]
```

```toml [TOML]{2}
[i18n]
structure = "multiple_root_folders"
locales = ["en", "de", "fr"]
```

```json [JSON]{3}
{
  "i18n": {
    "structure": "multiple_root_folders",
    "locales": ["en", "de", "fr"]
  }
}
```

```js [JavaScript]{3}
{
  i18n: {
    structure: "multiple_root_folders",
    locales: ["en", "de", "fr"],
  },
}
```

The `multiple_root_folders` structure creates separate root folders for each locale, containing all collections:

```yaml
/<locale>/<folder>/<path>.<extension>
```

The file paths for each locale would look like this:

```yaml
.
├─ de/
│  └─ pages/
│     └─ about.md  # German
├─ en/
│  └─ pages/
│     └─ about.md  # English (default locale)
└─ fr/
   └─ pages/
      └─ about.md  # French
```

**Omitting Default Locale from File Path**

When the `omit_default_locale_from_file_path` option is set to `true`, the path depends on the locale being the default locale or not:

```yaml
/<folder>/<path>.<extension> # default locale
/<locale>/<folder>/<path>.<extension> # other locales
```

For example, with `en` as the default locale, the English file would be located at `pages/about.md`, while the German and French files would be located in their respective locale root folders:

```yaml
.
├─ pages/
│  └─ about.md     # English (default locale)
├─ de/
│  └─ pages/
│     └─ about.md  # German
└─ fr/
   └─ pages/
      └─ about.md  # French
```

#### Custom Locale Folder Placement

The `multiple_folders` structure puts the locale folder right below the collection folder, and `multiple_root_folders` puts it in front of everything. Some sites keep the locale folders somewhere in between. For example, Hugo’s [translation by content directory](https://gohugo.io/content-management/multilingual/#translation-by-content-directory) gives each language a `contentDir` like `content/en` and `content/de`. The locale then sits below the `content` folder but above the sections in it.

To support such a layout, put the `{{locale}}` placeholder in the collection’s `folder` option where the locale folder goes:

```yaml [YAML]{2,8}
i18n:
  structure: multiple_folders
  locales: [en, de, fr]

collections:
  - name: posts
    label: Posts
    folder: content/{{locale}}/posts
    i18n: true
    fields:
      - { name: title, label: Title, i18n: true }
```

```toml [TOML]{2,8}
[i18n]
structure = "multiple_folders"
locales = ["en", "de", "fr"]

[[collections]]
name = "posts"
label = "Posts"
folder = "content/{{locale}}/posts"
i18n = true
fields = [{ name = "title", label = "Title", i18n = true }]
```

```json [JSON]{3,10}
{
  "i18n": {
    "structure": "multiple_folders",
    "locales": ["en", "de", "fr"]
  },
  "collections": [
    {
      "name": "posts",
      "label": "Posts",
      "folder": "content/{{locale}}/posts",
      "i18n": true,
      "fields": [{ "name": "title", "label": "Title", "i18n": true }]
    }
  ]
}
```

```js [JavaScript]{3,10}
{
  i18n: {
    structure: "multiple_folders",
    locales: ["en", "de", "fr"],
  },
  collections: [
    {
      name: "posts",
      label: "Posts",
      folder: "content/{{locale}}/posts",
      i18n: true,
      fields: [{ name: "title", label: "Title", i18n: true }],
    },
  ],
}
```

The placeholder is filled in with each locale code, and the `path` and filename follow as usual:

```yaml
/<folder with the locale filled in>/<path>.<extension>
```

The file paths for each locale would look like this:

```yaml
.
└─ content/
   ├─ de/
   │  └─ posts/
   │     └─ hello.md  # German
   ├─ en/
   │  └─ posts/
   │     └─ hello.md  # English (default locale)
   └─ fr/
      └─ posts/
         └─ hello.md  # French
```

The placeholder takes precedence over the `structure` option for that collection. The collection gets a folder per locale wherever the placeholder is, whatever the site-level structure says. This way, the other collections can keep a different structure.

Everything that works with the `multiple_folders` structure works here too, including [localized slugs](https://sveltiacms.app/en/docs/i18n/slugs#localizing-entry-slugs), [nested entries](#nested-entries) and [page bundles](#page-bundles). The collection’s [special index file](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file) lands in each locale’s collection folder, e.g. `content/en/posts/_index.md`. That’s where Hugo expects a section’s list page to be.

Note that the `multiple_folders` and `multiple_root_folders` structures are the same as `folder: content/posts/{{locale}}` and `folder: {{locale}}/content/posts`, respectively.

A few rules apply to the placeholder:

- It must be a whole folder name, used once, like `content/{{locale}}/posts`, `{{locale}}/posts` or `content/{{locale}}`. A folder name that merely contains it, like `content-{{locale}}`, is rejected.
- The collection must have i18n enabled, with locales defined at the site level or on the collection. Otherwise, the placeholder has nothing to be filled in with, and the configuration is rejected.
- It’s the `folder` option that takes the placeholder, not the `path` option, which is relative to the folder and filled in per entry.

**Omitting Default Locale from File Path**

When the `omit_default_locale_from_file_path` option is set to `true`, the placeholder folder is left out of the default locale’s path:

```yaml
/<folder without the locale>/<path>.<extension> # default locale
/<folder with the locale filled in>/<path>.<extension> # other locales
```

For example, with `en` as the default locale, the English file would be located at `content/posts/hello.md`, while the German and French files would be located in their respective locale folders:

```yaml
.
└─ content/
   ├─ posts/
   │  └─ hello.md     # English (default locale)
   ├─ de/
   │  └─ posts/
   │     └─ hello.md  # German
   └─ fr/
      └─ posts/
         └─ hello.md  # French
```

#### Nested Entries

A collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) organizes entries into a folder tree. This tree is separate from the folders and filenames i18n adds, and the two combine. The locale is taken off the file path before the tree is worked out, so the same tree appears whichever structure is chosen. The localized files of one entry are linked as usual.

The examples below use a `pages` collection with a `products/hardware` entry. In the default `subfolders` mode, where each entry is an index file in a folder of its own:

```yaml
# single_file
content/pages/products/hardware/_index.md

# multiple_files
content/pages/products/hardware/_index.en.md
content/pages/products/hardware/_index.de.md

# multiple_folders
content/pages/en/products/hardware/_index.md
content/pages/de/products/hardware/_index.md

# multiple_root_folders
en/content/pages/products/hardware/_index.md
de/content/pages/products/hardware/_index.md

# folder: content/{{locale}}/pages
content/en/pages/products/hardware/_index.md
content/de/pages/products/hardware/_index.md
```

And with `subfolders: false`, where each entry is a regular file that keeps its own name:

```yaml
# single_file
content/pages/products/hardware.md

# multiple_files
content/pages/products/hardware.en.md
content/pages/products/hardware.de.md

# multiple_folders
content/pages/en/products/hardware.md
content/pages/de/products/hardware.md

# multiple_root_folders
en/content/pages/products/hardware.md
de/content/pages/products/hardware.md

# folder: content/{{locale}}/pages
content/en/pages/products/hardware.md
content/de/pages/products/hardware.md
```

In every case the entry sits at `products/hardware` in the tree, and the sidebar shows one `products` folder rather than one per locale. The `omit_default_locale_from_file_path` option works as it does elsewhere, dropping the locale from the default locale’s path only.

A few things worth knowing:

- The `depth` option counts the path segments below the collection folder, and the locale is not one of them. A locale folder or filename suffix therefore never uses up part of the depth budget.
- Moving an entry with the [path editor](https://sveltiacms.app/en/docs/collections/entries/nested#moving-entries) moves every locale’s file in the same commit. In the `subfolders` mode it takes the entry’s child entries along, in every locale.
- [Entry-relative media](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders) is stored once, not once per locale. Some setups give each locale a folder of its own: the `multiple_folders` and `multiple_root_folders` structures, and a `folder` with the `{{locale}}` placeholder. With these, the file is saved in the default locale’s folder and every locale’s entry refers to it by the same relative path. The other structures keep each locale’s file in the folder holding the entry, so the media already sits beside all of them.

##### Localized Folder Names

The folder names can be localized as well, giving nested content fully localized permalinks. In the `subfolders` mode, a folder is named after the slug of the entry stored in it. [Localizing the entry slugs](https://sveltiacms.app/en/docs/i18n/slugs#localizing-entry-slugs) with the `localize` filter therefore localizes the whole folder chain above an entry along with the entry itself. With the `multiple_folders` structure, a `products/hardware` entry in English could then be stored as follows:

```
content/pages/en/products/hardware/_index.md
content/pages/de/produkte/hardware/_index.md
```

The tree in the sidebar and the [path editor](https://sveltiacms.app/en/docs/collections/entries/nested#choosing-a-parent-folder) still go by the default locale’s names, because that’s how the entries are identified. However, the other locales’ path editor panes show the folder as it’s named in their own locale.

The localized folder names are taken from the entries stored in the folders, including unpublished ones with the Editorial Workflow. This means a section and its sub-pages can be created in one sitting. A folder whose entry lacks a locale keeps its default name in that locale.

When an entry is moved to a different folder, each locale’s file goes below the localized folder chain, and its child entries are moved along in every locale. Renaming the folder is done in the [Slug panel](https://sveltiacms.app/en/docs/ui/content-editor#slug-panel), which offers a folder name per locale when the slugs are localized.

Like localized slugs in general, this requires the `multiple_files` or `multiple_folders` structure, or a `folder` with the [`{{locale}}` placeholder](#custom-locale-folder-placement).

With `subfolders: false`, entries are files rather than folders. A folder therefore takes its localized name from the entry it belongs to, which is one of the following:

1. its index file, as named with the `meta.path.index_file` option or conventionally `index` or `_index`
1. otherwise, a file of the same name stored beside it, such as `about.md` next to the `about` folder in an Eleventy or Jekyll project

A folder with neither keeps the same name in every locale.

A nested entry is identified by its path within the collection folder rather than by a bare slug. The `translationKey` property therefore holds that path, e.g. `products/hardware/_index`, so two entries with the same slug in different folders stay apart. When an entry is moved, the property is updated in every file it takes along.

#### Page Bundles

A [page bundle](https://gohugo.io/content-management/page-bundles/) keeps an entry’s content file and its media together in one folder. There are two ways to store entries as bundles:

- To store each entry as a leaf bundle, give a collection a [`path`](https://sveltiacms.app/en/docs/collections/entries/slugs#using-subfolders) option ending in a fixed filename.
- To store each one as a branch bundle, use the `subfolders` mode of a collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested#nesting-page-bundles).

Combined with [entry-relative media](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders), uploads land in the bundle instead of a shared media folder.

The examples below use a `posts` collection with `path: '{{slug}}/index'`, `media_folder: ''` and `public_folder: ''`, holding a `my-first-post` entry with a `cover` image.

The `single_file` and `multiple_files` structures keep every locale in the same bundle, so the media sits beside all of them. The latter is how Hugo’s own translation by filename is organized:

```yaml
# single_file
content/posts/my-first-post/index.md      # cover: image1.jpg, under each locale key
content/posts/my-first-post/image1.jpg

# multiple_files
content/posts/my-first-post/index.en.md   # cover: image1.jpg
content/posts/my-first-post/index.de.md   # cover: image1.jpg
content/posts/my-first-post/image1.jpg
```

The `multiple_folders` and `multiple_root_folders` structures, as well as a `folder` with the [`{{locale}}` placeholder](#custom-locale-folder-placement), give each locale a bundle of its own. The media is not copied into each one: it’s stored in the default locale’s bundle, and every locale’s entry refers to it by the same relative path:

```yaml
# multiple_folders
content/posts/en/my-first-post/index.md   # cover: image1.jpg
content/posts/de/my-first-post/index.md   # cover: image1.jpg
content/posts/en/my-first-post/image1.jpg

# multiple_root_folders
en/content/posts/my-first-post/index.md   # cover: image1.jpg
de/content/posts/my-first-post/index.md   # cover: image1.jpg
en/content/posts/my-first-post/image1.jpg

# folder: content/{{locale}}/posts
content/en/posts/my-first-post/index.md   # cover: image1.jpg
content/de/posts/my-first-post/index.md   # cover: image1.jpg
content/en/posts/my-first-post/image1.jpg
```

Sveltia CMS resolves that path across locales, so the image appears in the content editor whichever locale the user is editing. Hugo resolves it as well, because [a page bundle inherits the resources of its translated pages](https://gohugo.io/content-management/multilingual/). However, this only works where the two are linked as translations, which Hugo determines from each language’s `contentDir`. The last layout above is Hugo’s own [translation by content directory](https://gohugo.io/content-management/multilingual/#translation-by-content-directory), with `contentDir` set to `content/en` and `content/de`. If your framework has no equivalent mechanism, prefer `single_file` or `multiple_files`, which keep the media in the same bundle as every locale’s content file.

### File Collections

The `structure` i18n option only applies to entry collections, except for the `single_file_default_root` structure as [described below](#single-file-default-root-structure-for-file-collections). Other `structure` option values are ignored for file collections, and the organization of localized files is determined by the `file` path option in the file collection configuration.

You can use the `{{locale}}` placeholder in the `file` path option to create separate files or folders for each locale. If the placeholder is not used, the structure defaults to `single_file`, meaning the same file is shared across all locales.

The following example demonstrates how to set up a file collection with different i18n structures using the `{{locale}}` placeholder:

```yaml [YAML]{4,8-9,12-13,16-17,20-21}
collections:
  - name: pages
    label: Pages
    i18n: true
    files:
      - name: contact
        label: Contact Page
        i18n: true
        file: content/contact.md # equivalent to single_file
      - name: about
        label: About Page
        i18n: true
        file: content/about.{{locale}}.md # multiple_files
      - name: products
        label: Products Page
        i18n: true
        file: content/{{locale}}/products.md # multiple_folders
      - name: settings
        label: Site Settings
        i18n: true
        file: '{{locale}}/settings.yaml' # multiple_root_folders
```

```toml [TOML]{4,9-10,15-16,21-22,27-28}
[[collections]]
name = "pages"
label = "Pages"
i18n = true

[[collections.files]]
name = "contact"
label = "Contact Page"
i18n = true
file = "content/contact.md"

[[collections.files]]
name = "about"
label = "About Page"
i18n = true
file = "content/about.{{locale}}.md"

[[collections.files]]
name = "products"
label = "Products Page"
i18n = true
file = "content/{{locale}}/products.md"

[[collections.files]]
name = "settings"
label = "Site Settings"
i18n = true
file = "{{locale}}/settings.yaml"
```

```json [JSON]{6,11-12,17-18,23-24,29-30}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "i18n": true,
      "files": [
        {
          "name": "contact",
          "label": "Contact Page",
          "i18n": true,
          "file": "content/contact.md"
        },
        {
          "name": "about",
          "label": "About Page",
          "i18n": true,
          "file": "content/about.{{locale}}.md"
        },
        {
          "name": "products",
          "label": "Products Page",
          "i18n": true,
          "file": "content/{{locale}}/products.md"
        },
        {
          "name": "settings",
          "label": "Site Settings",
          "i18n": true,
          "file": "{{locale}}/settings.yaml"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{6,11-12,17-18,23-24,29-30}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      i18n: true,
      files: [
        {
          name: "contact",
          label: "Contact Page",
          i18n: true,
          file: "content/contact.md",
        },
        {
          name: "about",
          label: "About Page",
          i18n: true,
          file: "content/about.{{locale}}.md",
        },
        {
          name: "products",
          label: "Products Page",
          i18n: true,
          file: "content/{{locale}}/products.md",
        },
        {
          name: "settings",
          label: "Site Settings",
          i18n: true,
          file: "{{locale}}/settings.yaml",
        },
      ],
    },
  ],
}
```

The resulting file structure would be:

```yaml
.
├─ content/
│  ├─ contact.md      # shared across all locales (single_file)
│  ├─ about.de.md     # German
│  ├─ about.en.md     # English (default locale)
│  ├─ about.fr.md     # French
│  ├─ de/
│  │  └─ products.md  # German
│  ├─ en/
│  │  └─ products.md  # English (default locale)
│  └─ fr/
│     └─ products.md  # French
├─ de/
│  └─ settings.yaml   # German
├─ en/
│  └─ settings.yaml   # English (default locale)
└─ fr/
   └─ settings.yaml   # French
```

#### Omitting Default Locale from File Path

As with entry collections, the `omit_default_locale_from_file_path` option can be used to omit the locale code from the file path for the default locale when using the `{{locale}}` placeholder in file collections. The above example would result in the following file structure if `en` is the default locale and `omit_default_locale_from_file_path` is set to `true`:

```yaml
.
├─ content/
│  ├─ contact.md      # shared across all locales (single_file)
│  ├─ about.md        # English (default locale)
│  ├─ about.de.md     # German
│  ├─ about.fr.md     # French
│  ├─ products.md     # English (default locale)
│  ├─ de/
│  │  └─ products.md  # German
│  └─ fr/
│     └─ products.md  # French
├─ settings.yaml      # English (default locale)
├─ de/
│  └─ settings.yaml   # German
└─ fr/
   └─ settings.yaml   # French
```

##### Where the Placeholder Can Be Omitted

The `{{locale}}` placeholder can only be removed where the rest of the path still makes sense without it:

| Position | Example | Default locale’s path |
| --- | --- | --- |
| A whole folder name | `content/{{locale}}/about.md` | `content/about.md` |
| Between the filename and the extension | `about.{{locale}}.md` | `about.md` |
| In front of the filename, separated by a dot | `{{locale}}.about.md` | `about.md` |

In any other position, removing the placeholder would turn the path into something else. For example, `i18n/{{locale}}.yaml` would become `i18n/yaml`, and `settings_{{locale}}.json` would become `settings_json`. Instead, the default locale is kept in such a path, and a configuration warning is shown. If the filename is fixed by your framework, like Hugo’s `i18n/en.yaml`, set the option to `false` in that [file’s `i18n` option](https://sveltiacms.app/en/docs/i18n/options#file-level-configuration) to keep the locale and silence the warning:

```yaml [YAML]{6-7}
collections:
  - name: data
    files:
      - name: translations
        file: i18n/{{locale}}.yaml
        i18n:
          omit_default_locale_from_file_path: false
```

```toml [TOML]{7-8}
[[collections]]
name = "data"

[[collections.files]]
name = "translations"
file = "i18n/{{locale}}.yaml"
[collections.files.i18n]
omit_default_locale_from_file_path = false
```

```json [JSON]{9-11}
{
  "collections": [
    {
      "name": "data",
      "files": [
        {
          "name": "translations",
          "file": "i18n/{{locale}}.yaml",
          "i18n": {
            "omit_default_locale_from_file_path": false
          }
        }
      ]
    }
  ]
}
```

```js [JavaScript]{9-11}
{
  collections: [
    {
      name: "data",
      files: [
        {
          name: "translations",
          file: "i18n/{{locale}}.yaml",
          i18n: {
            omit_default_locale_from_file_path: false,
          },
        },
      ],
    },
  ],
}
```

If the placeholder appears more than once in a path, only the first occurrence is removed.

#### Single File (Default Root) Structure for File Collections

The [`single_file_default_root` structure](#single-file-default-root) can also be used for file collections. The example below shows how to configure a file collection with this structure:

```yaml [YAML]{2}
i18n:
  structure: single_file_default_root
  locales: [en, de, fr]

collections:
  - name: pages
    label: Pages
    files:
      - name: about
        label: About Page
        file: content/about.md
```

```toml [TOML]{2}
[i18n]
structure = "single_file_default_root"
locales = ["en", "de", "fr"]

[[collections]]
name = "pages"
label = "Pages"

[[collections.files]]
name = "about"
label = "About Page"
file = "content/about.md"
```

```json [JSON]{3}
{
  "i18n": {
    "structure": "single_file_default_root",
    "locales": ["en", "de", "fr"]
  },
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "files": [
        {
          "name": "about",
          "label": "About Page",
          "file": "content/about.md"
        }
      ]
    }
  ]
}
```

```js [JavaScript]{3}
{
  i18n: {
    structure: "single_file_default_root",
    locales: ["en", "de", "fr"],
  },
  collections: [
    {
      name: "pages",
      label: "Pages",
      files: [
        {
          name: "about",
          label: "About Page",
          file: "content/about.md",
        },
      ],
    },
  ],
}
```

Source: https://sveltiacms.app/en/docs/i18n/structures

---

## Localized Slugs and Preview Paths

When i18n is enabled for an entry collection, [managing entry slugs](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs) (filenames) across different locales can be challenging. Sveltia CMS offers two solutions: localized entry slugs and UUID-based slugs.

### Localizing Entry Slugs

In Sveltia CMS, it’s possible to localize entry slugs (filenames) if the i18n structure is `multiple_files`, `multiple_folders` or `multiple_root_folders`, or the `folder` option contains the `{{locale}}` placeholder. All you need is the `localize` filter for `slug` template tags:

```yaml [YAML]
i18n:
  structure: multiple_folders
  locales: [en, fr]

slug:
  encoding: ascii
  clean_accents: true

collections:
  - name: posts
    label: Blog posts
    folder: /content/posts
    slug: '{{title | localize}}'
    format: yaml
    i18n: true
    fields:
      - name: title
        label: Title
        widget: string
        i18n: true
```

```toml [TOML]
[i18n]
structure = "multiple_folders"
locales = ["en", "fr"]
[slug]
encoding = "ascii"
clean_accents = true
[[collections]]
name = "posts"
label = "Blog posts"
folder = "/content/posts"
slug = "{{title | localize}}"
format = "yaml"
i18n = true
[[collections.fields]]
name = "title"
label = "Title"
widget = "string"
i18n = true
```

```json [JSON]
{
  "i18n": {
    "structure": "multiple_folders",
    "locales": ["en", "fr"]
  },
  "slug": {
    "encoding": "ascii",
    "clean_accents": true
  },
  "collections": [
    {
      "name": "posts",
      "label": "Blog posts",
      "folder": "/content/posts",
      "slug": "{{title | localize}}",
      "format": "yaml",
      "i18n": true,
      "fields": [
        {
          "name": "title",
          "label": "Title",
          "widget": "string",
          "i18n": true
        }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  i18n: {
    structure: "multiple_folders",
    locales: ["en", "fr"],
  },
  slug: {
    encoding: "ascii",
    clean_accents: true,
  },
  collections: [
    {
      name: "posts",
      label: "Blog posts",
      folder: "/content/posts",
      slug: "{{title | localize}}",
      format: "yaml",
      i18n: true,
      fields: [
        {
          name: "title",
          label: "Title",
          widget: "string",
          i18n: true,
        },
      ],
    },
  ],
}
```

With this configuration, an entry is saved with localized filenames. The default locale’s slug is stored in each file as an extra `translationKey` property, which [Hugo’s multilingual support](https://gohugo.io/content-management/multilingual/#bypassing-default-linking) uses. Sveltia CMS and Hugo read this property to link localized files.

For example, if a blog post is created with the title “My trip to New York” in English and “Mon voyage à New York” in French, the following files will be created:

- `content/posts/en/my-trip-to-new-york.yaml`
  ```yaml
  translationKey: my-trip-to-new-york
  title: My trip to New York
  ```
- `content/posts/fr/mon-voyage-a-new-york.yaml`
  ```yaml
  translationKey: my-trip-to-new-york
  title: Mon voyage à New York
  ```

You can customize the property name and value for a different framework or i18n library by adding the `canonical_slug` option to your top-level or collection-level `i18n` configuration. The example below is for [@astrolicious/i18n](https://github.com/astrolicious/i18n), which requires a locale prefix in the value ([discussion](https://github.com/sveltia/sveltia-cms/issues/137)):

```yaml [YAML]
i18n:
  canonical_slug:
    key: defaultLocaleVersion # default: translationKey
    value: 'en/{{slug}}' # default: {{slug}}
```

```toml [TOML]
[i18n]
canonical_slug = { key = "defaultLocaleVersion", value = "en/{{slug}}" }
```

```json [JSON]
{
  "i18n": {
    "canonical_slug": {
      "key": "defaultLocaleVersion",
      "value": "en/{{slug}}"
    }
  }
}
```

```js [JavaScript]
{
  i18n: {
    canonical_slug: {
      key: "defaultLocaleVersion",
      value: "en/{{slug}}",
    },
  },
}
```

For [Jekyll](https://migueldavid.eu/how-to-make-jekyll-multilingual-c13e74c18f1c), you may want to use the `ref` property:

```yaml [YAML]
i18n:
  canonical_slug:
    key: ref
```

```toml [TOML]
[i18n]
canonical_slug = { key = "ref" }
```

```json [JSON]
{
  "i18n": {
    "canonical_slug": {
      "key": "ref"
    }
  }
}
```

```js [JavaScript]
{
  i18n: {
    canonical_slug: {
      key: "ref",
    },
  },
}
```

In a collection with [nested entries](https://sveltiacms.app/en/docs/i18n/structures#nested-entries), the slug names the entry’s folder, so localizing the slugs also gives every locale its own [folder names](https://sveltiacms.app/en/docs/i18n/structures#localized-folder-names).

### Making Slugs Editable

Localized slugs can be edited for each locale in the [Slug panel](https://sveltiacms.app/en/docs/ui/content-editor#slug-panel) of the Content Editor, which has a section for each locale. When the slugs aren’t localized, a single slug is shared by every locale.

Instead of adding the `localize` filter to the template tags, you can localize the slugs with the `i18n` option of the [slug options object](https://sveltiacms.app/en/docs/collections/entries/slugs#making-slugs-editable). It accepts the following values:

- `true`: Each locale has a slug of its own. Every field tag in the template is filled with the locale’s own value, so `slug: { template: '{{title}}', i18n: true }` is equivalent to `slug: '{{title | localize}}'`.
- `duplicate` (default) or `false`: The default locale’s slug is shared by every locale.

Like the `localize` filter, the `i18n` option only has an effect with the `multiple_files`, `multiple_folders` or `multiple_root_folders` structure, or a `folder` with the [`{{locale}}` placeholder](https://sveltiacms.app/en/docs/i18n/structures#custom-locale-folder-placement), where each locale has a file of its own.

To have users [type a slug](https://sveltiacms.app/en/docs/collections/entries/slugs#having-users-type-the-slug) for each locale, combine it with the `editable` option, without a `template`:

```yaml [YAML]
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    slug:
      editable: true
      i18n: true
```

```toml [TOML]
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"

[collections.slug]
editable = true
i18n = true
```

```json [JSON]
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "slug": {
        "editable": true,
        "i18n": true
      }
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      slug: {
        editable: true,
        i18n: true,
      },
    },
  ],
}
```

**Deprecation Notice**

The special `{{fields._slug | localize}}` slug template tag has been deprecated in favor of the configuration above, and will be removed in Sveltia CMS v1.0.0.

### Using Random UUIDs for Slugs

Entry titles and other fields containing non-Latin characters, such as Japanese or Chinese, may not be suitable for generating slugs. To address this issue, Sveltia CMS lets you use random UUIDs as slugs for entries in i18n collections.

This can be achieved by setting the `slug` option with the `{{uuid}}`, `{{uuid_short}}` or `{{uuid_shorter}}` [template tag](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags) in your collection configuration:

```yaml [YAML]
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    slug: "{{uuid_short}}"
```

```toml [TOML]
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
slug = "{{uuid_short}}"
```

```json [JSON]
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "slug": "{{uuid_short}}"
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      slug: "{{uuid_short}}",
    },
  ],
}
```

### Preview Paths

When i18n is enabled for an entry collection, you can manage preview paths for each locale using the [`preview_path` option](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths). This option supports the `{{locale}}` template tag, which will be replaced with the current locale in the preview URL. For example, if you set the `preview_path` to `/{{locale}}/{{slug}}`, the preview URL for an entry with the slug `my-post` in the `fr` locale would be `/fr/my-post`.

The `omit_default_locale_from_preview_path` option can be used to omit the locale code from the preview path for the default locale. For example, if `en` is the default locale and `omit_default_locale_from_preview_path` is set to `true`, the preview URL for the English version of the entry would be `/my-post`, while the preview URL for the French version would still be `/fr/my-post`.

Both options apply to [Deploy Previews](https://sveltiacms.app/en/docs/deployments/previews) as well, so each translation of an unpublished entry links to its own page on the preview build. The per-locale links are offered from the locale pane’s options menu in the Content Editor.

Source: https://sveltiacms.app/en/docs/i18n/slugs
