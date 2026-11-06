# Entry Collections: Nested, Single-File and Preview Paths

Nested entries, single-file collections and preview paths. For collection options, file formats and slugs, see `entries.md`. For listing and view options, see `entries-listing.md`. For operation options, see `entries-operations.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Nested Entries

With the `nested` and `meta` options, you can organize content that has a hierarchical relationship, such as categories and subcategories, and allow editors to create nested entries easily.

**Note for Netlify/Decap CMS users**

In Sveltia CMS, what was previously referred to as a **nested collection** in Netlify/Decap CMS is now called **nested entries**. This change was made to better reflect that the entries are nested in a folder tree within a single collection, rather than collections nested in each other.

Sveltia CMS also fixes a number of long-standing problems with this feature, which remains in beta in Netlify/Decap CMS. These include entry paths, preview paths, media folders, folder labels and i18n support. See [Nested entry enhancements](https://sveltiacms.app/en/docs/successor-to-netlify-cms#nested-entries) for the details.

The `nested` option turns the collection into a folder tree in the sidebar and lets entries live in subfolders of any depth. The `meta.path` option adds a Path field to the Content Editor, so editors can choose where a new entry goes and move an existing one later.

```yaml [YAML]{6-10}
collections:
  - name: pages
    label: Pages
    label_singular: Page
    folder: /content/pages
    nested:
      depth: 100
      summary: '{{title}}'
      subfolders: true
    meta: { path: { index_file: _index } }
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: markdown }
```

```toml [TOML]{6-17}
[[collections]]
name = "pages"
label = "Pages"
label_singular = "Page"
folder = "/content/pages"

[collections.nested]
depth = 100
summary = "{{title}}"
subfolders = true

[collections.meta.path]
index_file = "_index"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "markdown"
```

```json [JSON]{8-17}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "label_singular": "Page",
      "folder": "/content/pages",
      "nested": {
        "depth": 100,
        "summary": "{{title}}",
        "subfolders": true
      },
      "meta": {
        "path": {
          "index_file": "_index"
        }
      },
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "markdown" }
      ]
    }
  ]
}
```

```js [JavaScript]{8-17}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      label_singular: "Page",
      folder: "/content/pages",
      nested: {
        depth: 100,
        summary: "{{title}}",
        subfolders: true,
      },
      meta: {
        path: {
          index_file: "_index",
        },
      },
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "markdown" },
      ],
    },
  ],
}
```

### Nested Entry Options

The `nested` option accepts the following properties:

- `depth`: The maximum number of path segments below the collection `folder`, counting the filename itself. A file stored deeper than this is not part of the collection. The default is unlimited.
  - In the default `subfolders` mode, where the last segment is always the index file, `depth: 3` allows up to two folder levels, such as `products/hardware/_index.md`.
  - The segments of a [`path`](https://sveltiacms.app/en/docs/collections/entries/slugs#using-subfolders) template are part of the count, too.
- `summary`: A [summary template](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) used to label the folders in the tree. It overrides the collection’s own `summary` option, which continues to be used in the entry list. The default is the collection’s `summary` option value.
- `subfolders`: Whether each entry is stored as an index file in its own folder. The default is `true`. See below for what changes when it’s `false`.

### Storing Nested Entries

In the default `subfolders` mode, a folder _is_ an entry: each entry is stored as an index file, and the folders below it are its children. This suits [Hugo](https://sveltiacms.app/en/docs/frameworks/hugo) and [Zola](https://sveltiacms.app/en/docs/frameworks/zola), which both make a folder a section by putting an `_index.md` file in it, and any other generator that gives a folder a page of its own:

```
.
└─ content/
   └─ pages/
      ├─ _index.md              # Home
      └─ products/
         ├─ _index.md           # Products
         ├─ hardware/
         │  └─ _index.md        # Hardware
         └─ software/
            └─ _index.md        # Software
```

With `subfolders: false`, entries are regular files that keep their own names, and folders are just folders. This suits [Docusaurus](https://sveltiacms.app/en/docs/frameworks/docusaurus), [VitePress](https://sveltiacms.app/en/docs/frameworks/vitepress), [Starlight](https://sveltiacms.app/en/docs/frameworks/starlight), [MkDocs](https://www.mkdocs.org/user-guide/writing-your-docs/), as well as the pages of an [Eleventy](https://sveltiacms.app/en/docs/frameworks/eleventy) or [Jekyll](https://sveltiacms.app/en/docs/frameworks/jekyll) site, and similar setups, where every file becomes a page at its own path:

```
.
└─ content/
   └─ pages/
      ├─ overview.md            # Overview
      └─ products/
         ├─ hardware.md         # Hardware
         └─ software.md         # Software
```

The mode determines which entries are listed when a folder is selected:

- In the `subfolders` mode, the list shows the entries in the immediate subfolders, plus the collection’s own index file at the root. In the tree above, `Products` lists `Hardware` and `Software`, and the collection root lists `Home` and `Products`.
- Otherwise, the list shows the files stored directly in the selected folder. In the tree above, `products` lists `Hardware` and `Software`, while the root lists `Overview`.

A nested entry is identified by where it sits rather than by a name of its own. Its [slug](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs) is therefore its path below the collection folder — `products/hardware` for the tree above.

Wherever that slug is used to refer to the entry, the filename shared by every entry is left out. This applies to a [preview path](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) and to the value a [Relation field](https://sveltiacms.app/en/docs/fields/relation#value-field) stores. The collection’s own index file keeps its name, because there would be nothing left of it otherwise.

The root index file is only picked up when it fits the collection’s file paths. With a [`path`](https://sveltiacms.app/en/docs/collections/entries/slugs#using-subfolders) option such as `{{slug}}/_index`, a bare `content/pages/_index.md` has no slug folder in front of it, so it’s not part of the collection. To bring it in, use the [`index_file`](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file) collection option, which also lets it have fields of its own.

The mode also decides what happens when an entry is filed elsewhere with the [path editor](#moving-entries). In the `subfolders` mode, the entry’s whole folder moves, taking its children along. Otherwise, only the entry’s own file moves, and it keeps its name.

### Nesting Page Bundles

Because the `subfolders` mode gives each entry a folder of its own, a relative [`media_folder`](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders) is enough to turn the collection into a tree of [page bundles](https://sveltiacms.app/en/docs/collections/entries/slugs#creating-page-bundles), where each entry keeps its media beside its index file. Adding the `path` option on top restricts the collection to those index files, so that other files stored in the same folders are left alone:

```yaml [YAML]{6-8}
collections:
  - name: pages
    label: Pages
    label_singular: Page
    folder: /content/pages
    path: '{{slug}}/_index'
    media_folder: ''
    public_folder: ''
    nested:
      depth: 100
      summary: '{{title}}'
      subfolders: true
    meta: { path: { index_file: _index } }
    fields:
      - { name: title, label: Title }
      - { name: body, label: Body, widget: markdown }
      - { name: image, label: Image, widget: image }
```

```toml [TOML]{6-8}
[[collections]]
name = "pages"
label = "Pages"
label_singular = "Page"
folder = "/content/pages"
path = "{{slug}}/_index"
media_folder = ""
public_folder = ""

[collections.nested]
depth = 100
summary = "{{title}}"
subfolders = true

[collections.meta.path]
index_file = "_index"

[[collections.fields]]
name = "title"
label = "Title"

[[collections.fields]]
name = "body"
label = "Body"
widget = "markdown"

[[collections.fields]]
name = "image"
label = "Image"
widget = "image"
```

```json [JSON]{8-10}
{
  "collections": [
    {
      "name": "pages",
      "label": "Pages",
      "label_singular": "Page",
      "folder": "/content/pages",
      "path": "{{slug}}/_index",
      "media_folder": "",
      "public_folder": "",
      "nested": {
        "depth": 100,
        "summary": "{{title}}",
        "subfolders": true
      },
      "meta": {
        "path": {
          "index_file": "_index"
        }
      },
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "body", "label": "Body", "widget": "markdown" },
        { "name": "image", "label": "Image", "widget": "image" }
      ]
    }
  ]
}
```

```js [JavaScript]{8-10}
{
  collections: [
    {
      name: "pages",
      label: "Pages",
      label_singular: "Page",
      folder: "/content/pages",
      path: "{{slug}}/_index",
      media_folder: "",
      public_folder: "",
      nested: {
        depth: 100,
        summary: "{{title}}",
        subfolders: true,
      },
      meta: {
        path: {
          index_file: "_index",
        },
      },
      fields: [
        { name: "title", label: "Title" },
        { name: "body", label: "Body", widget: "markdown" },
        { name: "image", label: "Image", widget: "image" },
      ],
    },
  ],
}
```

The `path` option is optional here. For nested entries, it says where an entry sits within the folder holding it, rather than within the collection folder. It therefore takes the same form as in a flat collection, and its last segment — the filename — has to match `meta.path.index_file`.

If you leave it out, the collection takes in every file below its folder. If you set it, only the index files are entries. That’s what you want if the same folders hold other Markdown that isn’t a page.

Either way, entries can be nested to any depth, each with media of its own:

```
.
└─ content/
   └─ pages/
      └─ about/
         ├─ _index.md           # About
         ├─ portrait.jpg
         └─ team/
            ├─ _index.md        # Team
            └─ group-photo.jpg
```

The `depth` option counts path segments the same way as it does without `path`, with the template’s own segments included in the count. Because `{{slug}}/_index` takes two of them, `depth: 3` allows one more folder level, such as `about/team/_index.md`.

### Browsing Nested Entries

The collection appears in the sidebar as a tree. Selecting a folder lists its entries in the main area, and the URL reflects the folder being browsed, so a link to a specific folder can be shared:

```
https://YOUR_DOMAIN/admin/#/collections/COLLECTION_NAME/filter/FOLDER_PATH
```

Such a link keeps working for as long as the folder does. A folder exists while it holds an entry, directly or further down. A folder that has been emptied — or that never existed — shows a Not Found page rather than an empty list. So does a folder path on a collection without the `nested` option.

A folder that still holds an entry but has nothing to list, such as a page with no children, shows an empty list as usual.

In the `subfolders` mode, a folder that has no subfolder of its own is left out of the tree, because such a folder is an entry rather than a container — it’s already listed in its parent folder’s entry list. Set `subfolders: false` if you want every folder to appear in the tree.

Each folder in the tree is labeled with the summary of its index file, falling back to the folder name. With `subfolders: false`, the folder name is always used.

### Choosing a Parent Folder

The `meta.path` option adds a Parent Folder field above the other fields in the Content Editor. It shows the folder the entry is filed in and opens a folder tree for choosing a different one. The option accepts the following properties:

- `index_file`: The filename, without an extension, that every entry in the collection is saved as, such as `_index` or `index`. The `subfolders` mode needs it, because a folder’s own entry has to have a fixed name. Without it, each entry is named after its slug and stored as a regular file in the chosen folder. It has no effect with `subfolders: false`, where entries always keep their own names.
- `widget` and `label`: Accepted for compatibility with Netlify/Decap CMS but ignored. The field is always a folder picker.

**Note for Netlify/Decap CMS users**

Netlify offered an [experimental `parent` widget](https://github.com/netlify-labs/netlify-cms-widget-parent) that allowed users to select a parent folder from a dropdown list rather than a string field. However, this feature was never integrated into Netlify CMS itself and is not compatible with Decap CMS. Sveltia CMS has its own built-in folder picker to improve the user experience, so the `widget` option is ignored. The `label` option is also ignored because the field is always labeled “Parent Folder”.

**`index_file` vs `meta.path.index_file`**

These two options look similar but do different things. The [`index_file`](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file) collection option includes _one_ special file, Hugo’s `_index.md`, in a regular entry collection and lets it have its own set of fields. The `meta.path.index_file` option names _every_ entry in a collection with nested entries. You can use both in the same collection if the root index file needs different fields than the section pages.

The option has no effect on its own: it needs `nested`, because without a hierarchy there is no folder to choose.

#### Creating Entries in a Folder

When an editor creates an entry while browsing a folder, the field starts on that folder, so the new entry is filed alongside the ones already listed. The tree lists every folder in the collection, and the folder an entry occupies is left out of its own picker so it can’t be filed within itself.

In the `subfolders` mode, a new entry gets a folder of its own within the chosen one, named after its [slug](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs). Creating “Release Notes” while browsing `docs/guides` therefore stores it at `docs/guides/release-notes/_index.md`. Elsewhere, the entry is a regular file named after its slug, so the same page becomes `docs/guides/release-notes.md`.

#### Creating Folders

With `subfolders: false`, creating an entry never creates a folder, so the tree would only ever show folders that already contain a file. The New Folder button below the tree fills that gap. Pick the parent folder, enter a name, and the new folder becomes the parent of the entry you’re creating.

The name is normalized like an [entry slug](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs), so “User Guides” becomes `user-guides`. It’s rejected if it:

- contains a slash
- starts with a dot, which would hide the folder
- has no letters or numbers left after normalization
- is already used by another folder in the same parent

The folder reaches the repository only when you save an entry into it. Git tracks files, not folders, so it can’t commit an empty folder.

The button isn’t shown in the `subfolders` mode, because creating an entry there already creates its folder.

#### Moving Entries

Choosing a different folder for an existing entry moves its file, keeping the name it already has. The Save button is enabled by the folder change alone, so an entry can be moved without touching its content. The CMS rejects a folder that is already taken by another entry.

In the `subfolders` mode, everything below the entry’s folder moves with it in the same commit: its child entries, as well as any [entry-relative media](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders) stored alongside them. A whole section can therefore be reorganized in one save.

To change the entry’s name instead of the folder it sits in, use the [Slug panel](https://sveltiacms.app/en/docs/ui/content-editor#slug-panel). It renames the entry’s own folder and takes everything below it along the same way.

Source: https://sveltiacms.app/en/docs/collections/entries/nested

---

## Single-File Collections

An entry collection normally stores each entry in a file of its own. With the `file` option instead of `folder`, all the entries are stored in one JSON file, as an array of objects. This suits sites that read their content from a data file, such as a vanilla JavaScript site fetching a list of team members, products or links, or a static site generator’s data file.

**Tip**

Sveltia CMS can also edit such a file as a single entry, with a [top-level List field](https://sveltiacms.app/en/docs/fields/list#top-level-list) in a file collection. Use that instead if the list is short and edited as a whole, e.g. a navigation menu, or if the file isn’t in JSON format.

### Creating a Single-File Collection

Here is an example configuration for a list of team members:

```yaml [YAML]{5}
collections:
  - name: members
    label: Team Members
    label_singular: Team Member
    file: /data/members.json
    identifier_field: name
    fields:
      - { name: id, label: ID }
      - { name: name, label: Name }
      - { name: role, label: Role, required: false }
      - { name: photo, label: Photo, widget: image, required: false }
```

```toml [TOML]{5}
[[collections]]
name = "members"
label = "Team Members"
label_singular = "Team Member"
file = "/data/members.json"
identifier_field = "name"

[[collections.fields]]
name = "id"
label = "ID"

[[collections.fields]]
name = "name"
label = "Name"

[[collections.fields]]
name = "role"
label = "Role"
required = false

[[collections.fields]]
name = "photo"
label = "Photo"
widget = "image"
required = false
```

```json [JSON]{7}
{
  "collections": [
    {
      "name": "members",
      "label": "Team Members",
      "label_singular": "Team Member",
      "file": "/data/members.json",
      "identifier_field": "name",
      "fields": [
        { "name": "id", "label": "ID" },
        { "name": "name", "label": "Name" },
        { "name": "role", "label": "Role", "required": false },
        { "name": "photo", "label": "Photo", "widget": "image", "required": false }
      ]
    }
  ]
}
```

```js [JavaScript]{7}
{
  collections: [
    {
      name: "members",
      label: "Team Members",
      label_singular: "Team Member",
      file: "/data/members.json",
      identifier_field: "name",
      fields: [
        { name: "id", label: "ID" },
        { name: "name", label: "Name" },
        { name: "role", label: "Role", required: false },
        { name: "photo", label: "Photo", widget: "image", required: false },
      ],
    },
  ],
}
```

The file then looks like this, with one object for each entry:

```json
[
  { "id": "alice", "name": "Alice", "role": "Chair" },
  { "id": "bob", "name": "Bob", "role": "Treasurer" }
]
```

The `file` option is a path to a `.json` file, relative to the repository’s root directory. JSON is the only supported format, so the `format` option can only be `json`, if set. The `folder` and `file` options can’t be used together.

The file doesn’t have to exist yet: it’s created when the first entry is saved.

### How It Works

- Each object in the array is an entry. The entries are listed in the order of the array.
- A new entry is added to the end of the array.
- Deleting an entry removes its object from the array.
- The entries can always be [reordered](https://sveltiacms.app/en/docs/collections/entries/operations#reordering-entries) with the drag-and-drop UI, without the `reorder` option. The objects are moved within the array, and no `order` field is written.
- Saving an entry rewrites the whole file, but only the object of that entry changes. Items that aren’t objects, and properties that aren’t defined as fields, are kept as they are.

Other entry collection options, such as `create`, `delete`, `duplicate`, `limit`, `filter`, `summary`, `sortable_fields`, `view_filters`, `view_groups`, `bulk_edit` and `media_folder`, work as usual. A relative `media_folder` is relative to the folder of the file. Images are not deleted along with an entry, because all the entries share that folder and can use any image in it.

### Unsupported Options

The following entry collection options assume one file per entry, so they can’t be used with the `file` option, and the configuration is reported as invalid if they are:

- `extension`, `path`, `slug` and `slug_length`
- `nested` and `meta`
- `index_file`
- `reorder`, as the entries can always be reordered

Editorial Workflow is not supported either. The collection can’t use the `editorial_workflow` or `preview` [publish mode](https://sveltiacms.app/en/docs/workflows/editorial), and Open Authoring can’t be enabled. If Editorial Workflow is enabled for the whole site, set the collection’s `publish_mode` option to `simple`. For the same reason, a Relation field in the collection can’t refer to a collection that uses Editorial Workflow. Renaming or deleting an entry there would update the references to it in a pull request.

### Internationalization

With [i18n](https://sveltiacms.app/en/docs/i18n) enabled for the collection, each object holds all the translations, like a file with the [`single_file` structure](https://sveltiacms.app/en/docs/i18n/structures#single-file) does, whatever structure is configured for the site:

```json
[
  {
    "en": { "name": "Alice", "role": "Chair" },
    "fr": { "name": "Alice", "role": "Direction" }
  }
]
```

If the [`single_file_default_root` structure](https://sveltiacms.app/en/docs/i18n/structures#single-file-default-root) is configured, the default locale’s fields are stored at the top level of each object instead. The `{{locale}}` placeholder can’t be used in the file path.

### Identifying Entries

An entry is identified by its position in the array, which serves as its slug: `0` for the first entry, `1` for the second, and so on. The position changes when the entries are reordered or one is deleted, so the slug can’t be used to refer to an entry from elsewhere:

- A [Relation field](https://sveltiacms.app/en/docs/fields/relation) referring to the collection must store a field value with the `value_field` option, preferably a field with a unique value like `id` in the example above. The default `{{slug}}` value is reported as invalid.
- The `preview_path` and `thumbnail` options can’t contain the `{{slug}}` tag. Use a field instead, e.g. `/team/{{id}}`.
- The URL of an entry in the CMS points to its position, so a bookmarked entry may open another one after a reorder.
- Unsaved changes are not backed up in the browser, as a backup could otherwise be restored to another entry.

The commit author and date of an entry are those of the file’s last commit, which may be about another entry, so the entries can’t be sorted by them.

### Editing at the Same Time

**Risk of data loss**

All the entries are stored in one file, and Sveltia CMS doesn’t lock entries while someone edits them. Keep the following in mind when several people edit the same collection.

Before saving, Sveltia CMS checks the repository for changes made by someone else, then applies only the user’s change to the file as it is now. A colleague’s change to another entry is kept.

The save is refused if, in the meantime:

- the entry being edited has been changed or deleted, or
- another entry has moved to its position because entries were added, deleted or reordered.

The user is then asked to cancel editing and open the entry again from the list to make the edits. Unlike an entry stored in a file of its own, the user can’t save over the other change, as the entry at the same position may be a different one. Deleting or reordering entries is refused the same way.

There is still a short window between the check and the commit itself:

- With GitHub, the commit is rejected if someone else has committed in between, and the user can save again.
- With Gitea/Forgejo, the commit is rejected if the file has changed in between.
- With GitLab, the other commit is overwritten, and the change made in it is lost. If several people edit a large file frequently, consider taking turns, or split the content into several collections.

As the file changes with every save, its commit history covers all the entries, and the History panel in the Content Editor’s sidebar lists every commit made to the file.

Source: https://sveltiacms.app/en/docs/collections/entries/single-file

---

## Preview Paths and Redirects

The `preview_path` option tells Sveltia CMS where an entry lives on your site, which enables site previews, deploy previews and automatic redirects when an entry’s slug changes.

### Preview Paths

The `preview_path` option allows you to define a custom URL path for previewing entries on your live site. This option accepts a string with template tags that will be replaced with entry-specific values when generating the preview URL. The CMS provides links to preview the entries based on this URL structure.

Without `preview_path`, the CMS can’t tell where an entry lives, so a published entry has no preview link. An unpublished entry in [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) still links to the root of its [deploy preview](https://sveltiacms.app/en/docs/deployments/previews). The deploy preview’s address changes with each pull request, so the link is the easiest way to find it.

A `preview_path` that can’t be filled in for an entry, such as one with date tags on an entry whose date is empty, gives no link at all.

The path is appended to your site’s own address, or to the address of a build made for the entry when your repository is connected to a CI/CD provider. See [Deploy Previews](https://sveltiacms.app/en/docs/deployments/previews) for how those are found.

The [slug template tags](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags) can be used in the `preview_path` option, with the following exceptions:

- `{{slug}}`: the entire slug of the entry, not just the slugified entry identifier.
- `{{year}}`, `{{month}}`, `{{day}}`, `{{hour}}`, `{{minute}}`, `{{second}}`: these tags are based on the entry’s [DateTime field](https://sveltiacms.app/en/docs/fields/datetime). The CMS looks for the first DateTime field in the collection to extract the date and time information. Use the `preview_path_date_field` option to specify a different top-level DateTime field.
  - If no DateTime field is found, the `preview_path` option will be ignored. A configuration warning is shown so the missing link doesn’t go unexplained.
  - A field that exists but is left empty on an entry has the same effect on that entry.
- `{{dirname}}`: the directory name of the entry file relative to the collection `folder`, without the locale folder of an [i18n structure](https://sveltiacms.app/en/docs/i18n/structures) with a folder per locale. This is useful when using the `path` option to create subfolders.
- `{{filename}}`: the filename of the entry without the extension. This is useful when you want to use the exact filename in the preview URL.
- `{{extension}}`: the file extension of the entry. This is useful when you want to include the file type in the preview URL.
- `{{locale}}`: the locale code of the entry when using [i18n support](https://sveltiacms.app/en/docs/i18n/slugs#preview-paths). This is useful when you want to include the locale in the preview URL.

Just like the `slug` and `path` options, any field name defined in the collection’s `fields` option can also be used as a template tag in `preview_path`. A field’s name may match one of the predefined tags listed above or in the [slug template tags](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags), such as `slug`, `year` or `uuid`. If so, prefix it with `fields.`, like `{{fields.slug}}`, to avoid confusion with the tag itself.

You can use [string transformations](https://sveltiacms.app/en/docs/string-transformations) with these template tags.

The example below shows how to configure a blog posts collection with a custom preview URL structure.

```yaml [YAML]{5-6}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    preview_path: '/blog/{{year}}/{{month}}/{{slug}}'
    preview_path_date_field: created_at
    fields:
      - { name: title, label: Title }
      - { name: created_at, label: Created At, widget: datetime }
      - { name: body, label: Body, widget: richtext }
```

```toml [TOML]{5-6}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
preview_path = "/blog/{{year}}/{{month}}/{{slug}}"
preview_path_date_field = "created_at"
[[collections.fields]]
name = "title"
label = "Title"
[[collections.fields]]
name = "created_at"
label = "Created At"
widget = "datetime"
[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]{7-8}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "preview_path": "/blog/{{year}}/{{month}}/{{slug}}",
      "preview_path_date_field": "created_at",
      "fields": [
        { "name": "title", "label": "Title" },
        { "name": "created_at", "label": "Created At", "widget": "datetime" },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]{7-8}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      preview_path: "/blog/{{year}}/{{month}}/{{slug}}",
      preview_path_date_field: "created_at",
      fields: [
        { name: "title", label: "Title" },
        { name: "created_at", label: "Created At", widget: "datetime" },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

With the above configuration, a blog post created on June 15, 2025, with the title “My First Post” will have a preview URL of `/blog/2025/06/my-first-post`.

Setting the `preview_path` option does two more things:

- It lets the CMS keep links working when an entry is renamed. See [Redirects](#redirects) below.
- It’s what [Deploy Previews](https://sveltiacms.app/en/docs/deployments/previews) need in order to point at an entry. Without it, there’s nothing to append to the site or preview address, so no preview link is shown.

The `preview_path` and `preview_path_date_field` options can also be set on each file of a [file collection](https://sveltiacms.app/en/docs/collections/files#preview-path), where the collection-level options have no effect.

### Redirects

Changing an entry’s slug usually changes its URL, which breaks existing links to it, including internal links, external links and search engine results. To prevent this, Sveltia CMS can record the entry’s previous path in its data, so your framework can redirect visitors from the old URL to the new one.

This requires the [`preview_path` option](#preview-paths), because that option is what tells the CMS where an entry lives on your live site. Once it’s set, saving an entry with a modified slug adds the previous path to the entry’s `aliases` property:

- If the property doesn’t exist yet, it’s created as a list with a single item.
- If the property already exists as a list, the previous path is appended to it, so redirects accumulate as an entry is renamed over time.

Entry slugs can be changed in the [Slug panel](https://sveltiacms.app/en/docs/ui/content-editor#slug-panel) of the Content Editor’s sidebar.

With the `preview_path` configuration shown above, renaming a June 2025 blog post from `my-first-post` to `hello-world` results in the following front matter:

```yaml
---
aliases:
  - /blog/2025/06/my-first-post
title: Hello World
created_at: 2025-06-15T09:00:00.000Z
---
```

The `aliases` property is supported out of the box by [Hugo](https://gohugo.io/content-management/urls/#aliases) and [Zola](https://www.getzola.org/documentation/content/page/#front-matter), which generate the redirects for you. Other frameworks may expect a different property name or require a plugin.

#### Customizing the Redirect Property

You can store the previous paths in a property other than `aliases` using the `aliases_field` option. For example, [Jekyll](https://jekyllrb.com/) sites using the [`jekyll-redirect-from`](https://github.com/jekyll/jekyll-redirect-from) plugin expect a `redirect_from` property:

```yaml [YAML]{6}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    preview_path: '/blog/{{year}}/{{month}}/{{slug}}'
    aliases_field: redirect_from
```

```toml [TOML]{6}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
preview_path = "/blog/{{year}}/{{month}}/{{slug}}"
aliases_field = "redirect_from"
```

```json [JSON]{8}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "preview_path": "/blog/{{year}}/{{month}}/{{slug}}",
      "aliases_field": "redirect_from"
    }
  ]
}
```

```js [JavaScript]{8}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      preview_path: "/blog/{{year}}/{{month}}/{{slug}}",
      aliases_field: "redirect_from",
    },
  ],
}
```

#### Disabling Redirects

If your framework doesn’t support redirects defined in entry data, set the `aliases_field` option to `false`. The CMS will then leave the property untouched when an entry is renamed, and no redirects will be generated.

```yaml [YAML]{6}
collections:
  - name: posts
    label: Blog Posts
    folder: /content/posts
    preview_path: '/blog/{{year}}/{{month}}/{{slug}}'
    aliases_field: false
```

```toml [TOML]{6}
[[collections]]
name = "posts"
label = "Blog Posts"
folder = "/content/posts"
preview_path = "/blog/{{year}}/{{month}}/{{slug}}"
aliases_field = false
```

```json [JSON]{8}
{
  "collections": [
    {
      "name": "posts",
      "label": "Blog Posts",
      "folder": "/content/posts",
      "preview_path": "/blog/{{year}}/{{month}}/{{slug}}",
      "aliases_field": false
    }
  ]
}
```

```js [JavaScript]{8}
{
  collections: [
    {
      name: "posts",
      label: "Blog Posts",
      folder: "/content/posts",
      preview_path: "/blog/{{year}}/{{month}}/{{slug}}",
      aliases_field: false,
    },
  ],
}
```

The same applies if you define a field with the same name as the redirect property in the `fields` option. The CMS assumes that the redirects are to be managed in the Content Editor, so it won’t write to the property on its own. This is the way to go to curate the list by hand while still being able to see and edit it in the CMS.

Source: https://sveltiacms.app/en/docs/collections/entries/previews
