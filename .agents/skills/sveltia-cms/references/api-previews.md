# JavaScript API: Preview Templates, Styles and Customization

Custom preview templates, preview styles and other admin UI customization.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Custom Preview Templates

A custom preview template allows you to define how content entries are displayed in the CMS preview pane. By registering a custom preview template, you can create a more tailored and user-friendly editing experience for content editors.

**Compatibility Note**

Because there is little [Netlify/Decap CMS documentation](https://decapcms.org/docs/customization/#registerpreviewtemplate) on this topic, Sveltia CMS may not be fully compatible with existing preview templates. Our implementation does not include any undocumented component props.

### Overview

To register a custom preview template, use the `registerPreviewTemplate` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerPreviewTemplate(name, component);
```

#### Parameters

- `name` (string, required): The name of the [entry collection](https://sveltiacms.app/en/docs/collections/entries), or the name of the file in a [file collection](https://sveltiacms.app/en/docs/collections/files) or [singleton collection](https://sveltiacms.app/en/docs/collections/singletons), for which the preview template is being registered. Registering a template with the same name again replaces the previous one.
- `component` (React component, required): A [React component](https://sveltiacms.app/en/docs/api#writing-react-components) that defines the preview template. This component receives the entry data as props and should render the preview accordingly. You can write the component with [HTM](https://sveltiacms.app/en/docs/api#using-htm), JSX or `h()` calls — see the [Writing React Components](https://sveltiacms.app/en/docs/api#writing-react-components) section for more details.

### Component Props

The component you register receives the following props during render:

- `entry` ([Immutable Map](https://immutable-js.com/docs/v5/Map/)): Contains the entry data with the following structure:
  ```js
  {
    data: { ... },      // Data of the locale being previewed
    i18n: {             // Data of the other locales (if i18n is enabled)
      [locale]: {
        data: { ... }
      }
    },
    slug,               // Entry slug, or an empty string for a new entry
    path,               // Entry file path, or an empty string for a new entry
    newRecord,          // Always `false` in a preview
    collection,         // Collection name, or `_singletons` for a singleton
    mediaFiles,         // Array of all the media files in the collection's media folder
  }
  ```
- `widgetFor` (function): Returns a React element rendering a Svelte field preview for a given field key path. Useful for rendering individual field previews.
- `widgetsFor` (function): Returns widget data for a given top-level field name: an array of Immutable Maps for a List field, a single Immutable Map for an Object field or the raw value for any other field. Each Map has:
  ```js
  {
    data: { ... },              // Raw values of the list item or object
    widgets: { ... }            // Immutable Map of React preview elements keyed by subfield name
  }
  ```
  `widgets` is empty for a list item that is a primitive value, such as a string.
- `getAsset` (function): Takes a file path and returns an asset object, or `undefined` if no matching asset is found. The path is typically a File or Image field value, including the temporary `blob:` URL the field holds for a file that hasn’t been saved yet. The asset object has the following properties:
  - `url` (string): A URL to display the file in the preview, typically a `blob:` URL. The public path is used until the blob URL is available.
  - `path` (string): The public path of the file, or the temporary `blob:` URL of a file that hasn’t been saved yet.
  - `fileObj` (`File` or `undefined`): The file selected by the user, if the file hasn’t been saved yet.
  - `field` (`undefined`): Always `undefined`. It’s included only for compatibility with Netlify/Decap CMS.
  - `toString()` (function): Returns `url`, so Netlify/Decap CMS code like `getAsset(path).toString()` keeps working. Use optional chaining (`getAsset(path)?.toString()`) to handle a missing asset.
  - `toBase64()` (function): Async function that resolves to the file content as a Base64-encoded string, without the `data:` URL prefix. It rejects with an error if the file can’t be retrieved.
- `getCollection` (function): Async function that returns entries from a specified collection. Each entry is an Immutable Map with the same structure as `entry`, where `data` holds the default locale’s content. Takes parameters:
  - `collectionName` (string): Name of the collection to query. Use `_singletons` for [singletons](https://sveltiacms.app/en/docs/collections/singletons#referencing-singleton-files). The Promise is rejected if the collection is not found.
  - `slug` (string, optional): Entry slug to fetch a specific entry, or the filename in a file collection or the singleton collection. If omitted, returns all entries. If no entry matches, an entry with empty `data` and `slug` is returned.
- `fieldsMetaData` (Immutable Map): Metadata for each field keyed by the field’s name, as in Netlify/Decap CMS. Useful for accessing related entry data from relation fields: `fieldsMetaData.getIn([fieldName, collectionName, value])` returns the referenced entry’s content. For a field inside an Object or List field, start the path with the names of the parent fields. List item indexes are not part of the path, so the metadata of all the items is merged. Examples of paths for a relation field referencing the `authors` collection:
  - `['author', 'authors', value]` for a top-level field, with or without the `multiple` option
  - `['details', 'author', 'authors', value]` for a field nested in an Object field named `details`
  - `['books', 'author', 'authors', value]` for one in the items of a List field named `books`
  - `['tags', 'tag', 'authors', value]` for the single `field` named `tag` of a List field named `tags`

  The metadata of a nested field is also available under its key path without a trailing index, e.g. `details.author`, `books.0.author` or `tags` for the single `field` of a List field, for compatibility with earlier versions of Sveltia CMS. These keys are deprecated and will be removed in a future release.
- `document` (Document): The preview pane iframe’s Document object. Use this instead of the global `document` to manipulate the preview DOM.
- `window` (Window): The preview pane iframe’s Window object. Use this instead of the global `window` to access the preview window context.

### Working with Immutable Data

The `entry` and `fieldsMetaData` props are [Immutable Map](https://immutable-js.com/docs/v5/Map/) objects. Use their methods to safely access nested data:

- `entry.getIn(['data', 'fieldName'])` — Access field values
- `entry.get('i18n')` — Access internationalization data
- `.toJS()` — Convert to a plain JavaScript object

For more information on working with Immutable data structures, see the [Immutable.js documentation](https://immutable-js.com/docs/v5/Map/).

### Styling the Preview

The preview pane is a sandboxed `<iframe>` with its own document, so it doesn’t inherit any stylesheets from the admin page. That includes CSS that your bundler emits for the template or for a component library it uses.

Register the styles the template depends on with [`CMS.registerPreviewStyle()`](https://sveltiacms.app/en/docs/api/preview-styles), either as a file path or as a raw CSS string:

```js
import css from './preview.css?inline'; // Vite

CMS.registerPreviewStyle('/admin/preview.css');
CMS.registerPreviewStyle(css, { raw: true });
```

If you render a [Svelte](https://svelte.dev/) component inside the template, you can compile it with `css: "injected"` instead. Set it either per component with [`<svelte:options>`](https://svelte.dev/docs/svelte/svelte-options) or for the whole bundle with the `compilerOptions` of `@sveltejs/vite-plugin-svelte`. Svelte then appends the component’s styles to the document it’s mounted in, which is the preview iframe:

```svelte
<svelte:options css="injected" />
```

[Vue](https://vuejs.org/) has no equivalent. The `<style>` block of a single-file component always goes through the bundler’s CSS pipeline, so it ends up in the admin page. Keep the styles of a Vue preview component in a separate CSS file and register it as shown above.

### Linking to the Edit Pane

The default preview supports [Scroll Synchronization and Click-to-Highlight](https://sveltiacms.app/en/docs/ui/content-editor). Scrolling one pane scrolls the other to the same field, and clicking a field in the preview highlights it in the Edit Pane.

A custom preview template gets both features by marking its elements with the `data-key-path` attribute. Its value is the key path of the field the element displays:

- A top-level field uses its name, e.g. `title`.
- A field nested in an Object field adds its name with a dot, e.g. `details.author`.
- A field in a List item adds the item’s zero-based index, e.g. `sections.0.heading` for the `heading` subfield of the first item in the `sections` List field.

Clicking a marked element, or anything inside it, highlights the field of the innermost marked element. The Edit Pane expands any collapsed List or Object field containing it, scrolls it into view and focuses it.

To let keyboard users do the same, make the element focusable with `tabindex="0"`. Pressing Enter on it then highlights the field.

An event handler in the template can call `event.preventDefault()` to stop a click or Enter key press from highlighting a field, e.g. for a button that does something else.

```js [HTM]
html`
  <article>
    <h1 data-key-path="title" tabindex="0">${entry.getIn(['data', 'title'])}</h1>
    <div data-key-path="sections">
      ${entry.getIn(['data', 'sections'])?.map(
        (section, index) => html`
          <section key=${index}>
            <h2 data-key-path="sections.${index}.heading">${section.get('heading')}</h2>
          </section>
        `,
      )}
    </div>
  </article>
`;
```

```jsx [JSX]
<article>
  <h1 data-key-path="title" tabIndex={0}>
    {entry.getIn(['data', 'title'])}
  </h1>
  <div data-key-path="sections">
    {entry.getIn(['data', 'sections'])?.map((section, index) => (
      <section key={index}>
        <h2 data-key-path={`sections.${index}.heading`}>{section.get('heading')}</h2>
      </section>
    ))}
  </div>
</article>
```

```js [h()]
h(
  'article',
  {},
  h('h1', { 'data-key-path': 'title', tabIndex: 0 }, entry.getIn(['data', 'title'])),
  h(
    'div',
    { 'data-key-path': 'sections' },
    entry
      .getIn(['data', 'sections'])
      ?.map((section, index) =>
        h(
          'section',
          { key: index },
          h('h2', { 'data-key-path': `sections.${index}.heading` }, section.get('heading')),
        ),
      ),
  ),
);
```

The field previews that `widgetFor` and `widgetsFor` return are already marked.

### Examples

**HTM, JSX or `h()`**

Each example below comes in three versions:

- [HTM](https://sveltiacms.app/en/docs/api#using-htm), which runs in the browser as is and is the recommended way
- [JSX](https://sveltiacms.app/en/docs/api#using-jsx), which requires a build step to transpile it to JavaScript
- [`h()`](https://sveltiacms.app/en/docs/api#using-h), which is compatible with Netlify/Decap CMS

The HTM versions use function components, while the others use class components. See [Writing React Components](https://sveltiacms.app/en/docs/api#writing-react-components) for more details.

#### Basic Entry Preview

Display a simple blog post preview with a title and featured image:

```js [HTM]
const PostPreview = ({ entry, widgetFor, getAsset }) => {
  const image = entry.getIn(['data', 'image']);
  const imageAsset = image ? getAsset(image) : null;

  return html`
    <div style="padding: 20px; font-family: sans-serif">
      <h1>${entry.getIn(['data', 'title'])}</h1>
      ${
        imageAsset &&
        html`<img src=${imageAsset.url} alt="Featured" style="max-width: 100%; height: auto" />`
      }
      <div style="margin-top: 20px">${widgetFor('body')}</div>
    </div>
  `;
};

CMS.registerPreviewTemplate('posts', PostPreview);
```

```jsx [JSX]
export default class PostPreview extends React.Component {
  render() {
    const { entry, widgetFor, getAsset } = this.props;
    const image = entry.getIn(['data', 'image']);
    const imageAsset = image ? getAsset(image) : null;

    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>{entry.getIn(['data', 'title'])}</h1>
        {imageAsset && (
          <img src={imageAsset.url} alt="Featured" style={{ maxWidth: '100%', height: 'auto' }} />
        )}
        <div style={{ marginTop: '20px' }}>{widgetFor('body')}</div>
      </div>
    );
  }
}

CMS.registerPreviewTemplate('posts', PostPreview);
```

```js [h()]
const PostPreview = createClass({
  render: function () {
    const { entry, widgetFor, getAsset } = this.props;
    const image = entry.getIn(['data', 'image']);
    const imageAsset = image ? getAsset(image) : null;

    return h(
      'div',
      { style: { padding: '20px', fontFamily: 'sans-serif' } },
      h('h1', {}, entry.getIn(['data', 'title'])),
      imageAsset &&
        h('img', {
          src: imageAsset.url,
          alt: 'Featured',
          style: { maxWidth: '100%', height: 'auto' },
        }),
      h('div', { style: { marginTop: '20px' } }, widgetFor('body')),
    );
  },
});

CMS.registerPreviewTemplate('posts', PostPreview);
```

#### List Fields

Preview a collection entry with a list of authors:

```js [HTM]
const AuthorsPreview = ({ widgetsFor }) => {
  const authors = widgetsFor('authors');

  return html`
    <div style="padding: 20px">
      <h2>Authors</h2>
      ${
        Array.isArray(authors) &&
        authors.map(
          (author, index) => html`
            <div key=${index} style="margin-bottom: 20px; border-bottom: 1px solid #eee">
              <strong>${author.getIn(['data', 'name'])}</strong>
              <p>${author.getIn(['data', 'description'])}</p>
              ${author.getIn(['widgets', 'description'])}
            </div>
          `,
        )
      }
    </div>
  `;
};

CMS.registerPreviewTemplate('team', AuthorsPreview);
```

```jsx [JSX]
export default class AuthorsPreview extends React.Component {
  render() {
    const { widgetsFor } = this.props;
    const authors = widgetsFor('authors');

    return (
      <div style={{ padding: '20px' }}>
        <h2>Authors</h2>
        {Array.isArray(authors) &&
          authors.map((author, index) => (
            <div key={index} style={{ marginBottom: '20px', borderBottom: '1px solid #eee' }}>
              <strong>{author.getIn(['data', 'name'])}</strong>
              <p>{author.getIn(['data', 'description'])}</p>
              {author.getIn(['widgets', 'description'])}
            </div>
          ))}
      </div>
    );
  }
}

CMS.registerPreviewTemplate('team', AuthorsPreview);
```

```js [h()]
const AuthorsPreview = createClass({
  render: function () {
    const { widgetsFor } = this.props;
    const authors = widgetsFor('authors');

    return h(
      'div',
      { style: { padding: '20px' } },
      h('h2', {}, 'Authors'),
      Array.isArray(authors) &&
        authors.map(function (author, index) {
          return h(
            'div',
            { key: index, style: { marginBottom: '20px', borderBottom: '1px solid #eee' } },
            h('strong', {}, author.getIn(['data', 'name'])),
            h('p', {}, author.getIn(['data', 'description'])),
            author.getIn(['widgets', 'description']),
          );
        }),
    );
  },
});

CMS.registerPreviewTemplate('team', AuthorsPreview);
```

#### Object Fields

Preview settings stored as an object structure:

```js [HTM]
const SiteSettingsPreview = ({ entry, widgetsFor }) => {
  const settings = widgetsFor('site_config');

  return html`
    <div style="padding: 20px; background-color: #f5f5f5; border-radius: 4px">
      <h2>${entry.getIn(['data', 'title'])}</h2>
      <dl>
        <dt>Posts per page:</dt>
        <dd>${settings.getIn(['data', 'posts_per_page'])}</dd>

        <dt>Site tagline:</dt>
        <dd>${settings.getIn(['data', 'tagline'])}</dd>

        <dt>Enable comments:</dt>
        <dd>${settings.getIn(['data', 'enable_comments']) ? 'Yes' : 'No'}</dd>
      </dl>
    </div>
  `;
};

CMS.registerPreviewTemplate('settings', SiteSettingsPreview);
```

```jsx [JSX]
export default class SiteSettingsPreview extends React.Component {
  render() {
    const { entry, widgetsFor } = this.props;
    const settings = widgetsFor('site_config');

    return (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h2>{entry.getIn(['data', 'title'])}</h2>
        <dl>
          <dt>Posts per page:</dt>
          <dd>{settings.getIn(['data', 'posts_per_page'])}</dd>

          <dt>Site tagline:</dt>
          <dd>{settings.getIn(['data', 'tagline'])}</dd>

          <dt>Enable comments:</dt>
          <dd>{settings.getIn(['data', 'enable_comments']) ? 'Yes' : 'No'}</dd>
        </dl>
      </div>
    );
  }
}

CMS.registerPreviewTemplate('settings', SiteSettingsPreview);
```

```js [h()]
const SiteSettingsPreview = createClass({
  render: function () {
    const { entry, widgetsFor } = this.props;
    const settings = widgetsFor('site_config');

    return h(
      'div',
      { style: { padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' } },
      h('h2', {}, entry.getIn(['data', 'title'])),
      h(
        'dl',
        {},
        h('dt', {}, 'Posts per page:'),
        h('dd', {}, settings.getIn(['data', 'posts_per_page'])),

        h('dt', {}, 'Site tagline:'),
        h('dd', {}, settings.getIn(['data', 'tagline'])),

        h('dt', {}, 'Enable comments:'),
        h('dd', {}, settings.getIn(['data', 'enable_comments']) ? 'Yes' : 'No'),
      ),
    );
  },
});

CMS.registerPreviewTemplate('settings', SiteSettingsPreview);
```

#### Accessing Metadata & Relations

Display entry data with related entries fetched via `fieldsMetaData`:

```js [HTM]
const ArticlePreview = ({ entry, fieldsMetaData, widgetFor }) => {
  const authorSlug = entry.getIn(['data', 'author']);
  const authorData = fieldsMetaData.getIn(['author', 'authors', authorSlug])?.toJS();

  return html`
    <article style="padding: 20px; max-width: 600px">
      <h1>${entry.getIn(['data', 'title'])}</h1>

      ${
        authorData &&
        html`
          <div style="margin-bottom: 20px; font-style: italic; color: #666">
            By <strong>${authorData.name}</strong>
          </div>
        `
      }

      <div style="margin-top: 20px">${widgetFor('content')}</div>

      <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee">
        <small>Published: ${entry.getIn(['data', 'date'])}</small>
      </footer>
    </article>
  `;
};

CMS.registerPreviewTemplate('posts', ArticlePreview);
```

```jsx [JSX]
export default class ArticlePreview extends React.Component {
  render() {
    const { entry, fieldsMetaData, widgetFor } = this.props;
    const authorSlug = entry.getIn(['data', 'author']);
    const authorData = fieldsMetaData.getIn(['author', 'authors', authorSlug])?.toJS();

    return (
      <article style={{ padding: '20px', maxWidth: '600px' }}>
        <h1>{entry.getIn(['data', 'title'])}</h1>

        {authorData && (
          <div style={{ marginBottom: '20px', fontStyle: 'italic', color: '#666' }}>
            By <strong>{authorData.name}</strong>
          </div>
        )}

        <div style={{ marginTop: '20px' }}>{widgetFor('content')}</div>

        <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
          <small>Published: {entry.getIn(['data', 'date'])}</small>
        </footer>
      </article>
    );
  }
}

CMS.registerPreviewTemplate('posts', ArticlePreview);
```

```js [h()]
const ArticlePreview = createClass({
  render: function () {
    const { entry, fieldsMetaData, widgetFor } = this.props;
    const authorSlug = entry.getIn(['data', 'author']);
    const authorData = fieldsMetaData.getIn(['author', 'authors', authorSlug])?.toJS();

    return h(
      'article',
      { style: { padding: '20px', maxWidth: '600px' } },
      h('h1', {}, entry.getIn(['data', 'title'])),

      authorData &&
        h(
          'div',
          { style: { marginBottom: '20px', fontStyle: 'italic', color: '#666' } },
          'By ',
          h('strong', {}, authorData.name),
        ),

      h('div', { style: { marginTop: '20px' } }, widgetFor('content')),

      h(
        'footer',
        { style: { marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee' } },
        h('small', {}, `Published: ${entry.getIn(['data', 'date'])}`),
      ),
    );
  },
});

CMS.registerPreviewTemplate('posts', ArticlePreview);
```

#### Using `getAsset`

Display multiple images from a gallery field with proper asset resolution:

```js [HTM]
const GalleryPreview = ({ entry, getAsset }) => {
  const images = entry.getIn(['data', 'gallery']) ?? [];

  return html`
    <div style="padding: 20px">
      <h2>Image Gallery</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px">
        ${images.map((imagePath, index) => {
          const asset = getAsset(imagePath);

          return asset
            ? html`
                <img
                  key=${index}
                  src=${asset.url}
                  alt="Gallery image ${index + 1}"
                  style="width: 100%; height: auto; border-radius: 4px"
                />
              `
            : null;
        })}
      </div>
    </div>
  `;
};

CMS.registerPreviewTemplate('portfolio', GalleryPreview);
```

```jsx [JSX]
export default class GalleryPreview extends React.Component {
  render() {
    const { entry, getAsset } = this.props;
    const images = entry.getIn(['data', 'gallery']) ?? [];

    return (
      <div style={{ padding: '20px' }}>
        <h2>Image Gallery</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {images.map((imagePath, index) => {
            const asset = getAsset(imagePath);
            return asset ? (
              <img
                key={index}
                src={asset.url}
                alt={`Gallery image ${index + 1}`}
                style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
              />
            ) : null;
          })}
        </div>
      </div>
    );
  }
}

CMS.registerPreviewTemplate('portfolio', GalleryPreview);
```

```js [h()]
const GalleryPreview = createClass({
  render: function () {
    const { entry, getAsset } = this.props;
    const images = entry.getIn(['data', 'gallery']) ?? [];

    return h(
      'div',
      { style: { padding: '20px' } },
      h('h2', {}, 'Image Gallery'),
      h(
        'div',
        { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' } },
        images.map(function (imagePath, index) {
          const asset = getAsset(imagePath);
          return asset
            ? h('img', {
                key: index,
                src: asset.url,
                alt: `Gallery image ${index + 1}`,
                style: { width: '100%', height: 'auto', borderRadius: '4px' },
              })
            : null;
        }),
      ),
    );
  },
});

CMS.registerPreviewTemplate('portfolio', GalleryPreview);
```

#### Using `getCollection`

Display related entries from another collection:

```js [HTM]
const { useEffect, useState } = CMS.React;

const ProductPreview = ({ entry, getCollection }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const relatedSlugs = entry.getIn(['data', 'related_products']) ?? [];

    // Fetch all products and filter for related ones
    getCollection('products').then((products) => {
      const related = products.filter((product) => {
        const slug = product.get('slug');
        return relatedSlugs.includes(slug);
      });
      setRelatedProducts(related);
    });
  }, []);

  return html`
    <div style="padding: 20px">
      <h1>${entry.getIn(['data', 'title'])}</h1>
      <p>${entry.getIn(['data', 'description'])}</p>

      ${
        relatedProducts.length > 0 &&
        html`
          <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px">
            <h3>Related Products</h3>
            <ul>
              ${relatedProducts.map(
                (product, index) => html`<li key=${index}>${product.getIn(['data', 'title'])}</li>`,
              )}
            </ul>
          </div>
        `
      }
    </div>
  `;
};

CMS.registerPreviewTemplate('products', ProductPreview);
```

```jsx [JSX]
export default class ProductPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { relatedProducts: [] };
  }

  componentDidMount() {
    const { getCollection } = this.props;
    const relatedSlugs = this.props.entry.getIn(['data', 'related_products']) ?? [];

    // Fetch all products and filter for related ones
    getCollection('products').then((products) => {
      const related = products.filter((product) => {
        const slug = product.get('slug');
        return relatedSlugs.includes(slug);
      });
      this.setState({ relatedProducts: related });
    });
  }

  render() {
    const { entry } = this.props;
    const { relatedProducts } = this.state;

    return (
      <div style={{ padding: '20px' }}>
        <h1>{entry.getIn(['data', 'title'])}</h1>
        <p>{entry.getIn(['data', 'description'])}</p>

        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <h3>Related Products</h3>
            <ul>
              {relatedProducts.map((product, index) => (
                <li key={index}>{product.getIn(['data', 'title'])}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

CMS.registerPreviewTemplate('products', ProductPreview);
```

```js [h()]
const ProductPreview = createClass({
  getInitialState: function () {
    return { relatedProducts: [] };
  },

  componentDidMount: function () {
    const { getCollection } = this.props;
    const relatedSlugs = this.props.entry.getIn(['data', 'related_products']) ?? [];

    getCollection('products').then((products) => {
      const related = products.filter(function (product) {
        const slug = product.get('slug');
        return relatedSlugs.includes(slug);
      });
      this.setState({ relatedProducts: related });
    });
  },

  render: function () {
    const { entry } = this.props;
    const { relatedProducts } = this.state;

    return h(
      'div',
      { style: { padding: '20px' } },
      h('h1', {}, entry.getIn(['data', 'title'])),
      h('p', {}, entry.getIn(['data', 'description'])),

      relatedProducts.length > 0 &&
        h(
          'div',
          { style: { marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' } },
          h('h3', {}, 'Related Products'),
          h(
            'ul',
            {},
            relatedProducts.map(function (product, index) {
              return h('li', { key: index }, product.getIn(['data', 'title']));
            }),
          ),
        ),
    );
  },
});

CMS.registerPreviewTemplate('products', ProductPreview);
```

#### Using Other Frameworks

The registered component must be a React component, but it can mount a component written in another framework into the preview document. These examples wrap a [Svelte 5](https://svelte.dev/) or [Vue 3](https://vuejs.org/) component, updating its props in place on each render instead of remounting it.

- Keep the Svelte wrapper in a `.svelte.js` file so the `$state` rune compiles.
- The Vue wrapper renders the component from a render function so that changes to the reactive props are picked up. The `rootProps` argument of `createApp()` is not reactive.

See [Styling the Preview](#styling-the-preview) for how to get the component’s CSS into the preview.

```js [Svelte]
import { mount, unmount } from 'svelte';
import NewsletterPreview from './newsletter-preview.svelte';

const NewsletterPreviewWrapper = createClass({
  componentDidMount: function () {
    const { document, entry, getAsset } = this.props;

    // `$state` can only initialize a variable, not an object property
    const svelteProps = $state({ entry, getAsset });

    this.svelteProps = svelteProps;
    // Mount into the preview iframe’s document, not the global `document`
    this.svelteComponent = mount(NewsletterPreview, {
      target: document.body,
      props: svelteProps,
    });
  },

  componentDidUpdate: function () {
    const { entry, getAsset } = this.props;

    Object.assign(this.svelteProps, { entry, getAsset });
  },

  componentWillUnmount: function () {
    unmount(this.svelteComponent);
  },

  render: function () {
    // Svelte renders directly into the document, so React has nothing to render
    return null;
  },
});

CMS.registerPreviewTemplate('newsletters', NewsletterPreviewWrapper);
```

```js [Vue]
import { createApp, h, reactive } from 'vue';
import NewsletterPreview from './NewsletterPreview.vue';

const NewsletterPreviewWrapper = createClass({
  componentDidMount: function () {
    const { document, entry, getAsset } = this.props;

    this.vueProps = reactive({ entry, getAsset });
    this.vueApp = createApp({ render: () => h(NewsletterPreview, this.vueProps) });
    // Mount into the preview iframe’s document, not the global `document`
    this.vueApp.mount(document.body);
  },

  componentDidUpdate: function () {
    const { entry, getAsset } = this.props;

    Object.assign(this.vueProps, { entry, getAsset });
  },

  componentWillUnmount: function () {
    this.vueApp.unmount();
  },

  render: function () {
    // Vue renders directly into the document, so React has nothing to render
    return null;
  },
});

CMS.registerPreviewTemplate('newsletters', NewsletterPreviewWrapper);
```

### Showcase

Real-world examples of custom preview templates can be found in our [showcase](https://sveltiacms.app/en/showcase?feature=preview-templates).

Source: https://sveltiacms.app/en/docs/api/preview-templates

---

## Custom Preview Styles

Sveltia CMS comes with built-in styles for the entry preview pane. However, you can also register your own custom preview styles to make the preview look like your site.

### Overview

To register a custom preview style, use the `registerPreviewStyle` method on the [`CMS` object](https://sveltiacms.app/en/docs/api#accessing-the-cms-object):

```js
CMS.registerPreviewStyle(filePath);
```

```js
CMS.registerPreviewStyle(cssString, { raw: true });
```

There are two ways to register custom preview styles in Sveltia CMS: by providing a file path to a CSS file or by providing a raw CSS string. If you provide a raw CSS string, you need to set the `raw` option to `true`.

#### Parameters

- `filePath` (string): The path to the CSS file containing the custom styles. This file should be accessible from the CMS admin interface. It can be a relative path, which is resolved against the current page URL, or an absolute URL.
- `cssString` (string): A string containing the raw CSS styles to be applied to the preview pane.
- `options` (object, optional): An options object that can contain the following properties:
  - `raw` (boolean): Set this to `true` if you are providing a raw CSS string. Defaults to `false`.
  - `collection` (string): The name of the collection whose entries the style applies to. Use `_singletons` for [singletons](https://sveltiacms.app/en/docs/collections/singletons#referencing-singleton-files). If omitted, the style applies to all collections.
  - `file` (string): The name of the file the style applies to, in the file collection or singleton collection given with the `collection` option. If omitted, the style applies to all the files in the collection. This option requires `collection`.

The function throws a `TypeError` if a parameter is invalid, e.g. if `filePath` is not a valid URL or file path, or if `file` is given without `collection`.

### Examples

#### Registering a Preview Style from a File

To register a preview style from a CSS file, simply provide the file path as an argument to the `registerPreviewStyle` function.

```js
CMS.registerPreviewStyle('/path/to/your/custom-style.css');
```

#### Registering a Preview Style from a Raw CSS String

You can also register a preview style by providing a raw CSS string. Make sure to set the `raw` option to `true` in the options object.

```js [JavaScript]
const customCSS = `
  body {
    background-color: lightgoldenrodyellow;
  }
`;

CMS.registerPreviewStyle(customCSS, { raw: true });
```

#### Registering Multiple Preview Styles

You can register multiple preview styles by calling the `registerPreviewStyle` function multiple times. The styles will be applied in the order they were registered.

```js
CMS.registerPreviewStyle('/path/to/first-style.css');
CMS.registerPreviewStyle('/path/to/second-style.css');
```

This allows you to layer styles and create complex customizations for the entry preview.

#### Applying Preview Styles to Specific Collections or Files

By default, a preview style applies to the entries of all collections. To apply it to the entries of a specific collection only, use the `collection` option. To apply it to a specific file in a [file collection](https://sveltiacms.app/en/docs/collections/files) or a [singleton](https://sveltiacms.app/en/docs/collections/singletons), use the `file` option along with `collection`.

```js
// All entries
CMS.registerPreviewStyle('/path/to/common-style.css');
// Entries in the `posts` entry collection
CMS.registerPreviewStyle('/path/to/post-style.css', { collection: 'posts' });
// The `about` file in the `pages` file collection
CMS.registerPreviewStyle('/path/to/about-style.css', { collection: 'pages', file: 'about' });
// The `home` singleton
CMS.registerPreviewStyle('/path/to/home-style.css', { collection: '_singletons', file: 'home' });
```

The styles that apply to an entry are combined in the order they were registered. In this example, the preview of the `about` file uses both `common-style.css` and `about-style.css`. An entry that no preview style applies to is previewed with the built-in styles only.

### Styling Specific Fields

The default preview marks each field with three attributes that identify it, which your preview styles can use to target specific fields:

- `data-field-type`: The field’s type, i.e. its `widget` option, e.g. `string`, `markdown` or the name of a [custom field type](https://sveltiacms.app/en/docs/api/field-types).
- `data-key-path`: The field’s key path. For example, `title` for a top-level field, `details.author` for a field in an Object field or `sections.0.heading` for a subfield of the first item in a List field.
- `data-typed-key-path`: The same path with every List item index replaced with an asterisk, e.g. `sections.*.heading`. One selector then matches the subfield in all the items. For a List or Object field with [variable types](https://sveltiacms.app/en/docs/fields/list#variable-type), the type name follows in angle brackets, e.g. `blocks.*<image>.src`.

```css
[data-key-path='title'] p {
  font-size: 2em;
}

[data-typed-key-path='sections.*.body'] p {
  font-family: serif;
}

[data-field-type='markdown'] {
  line-height: 1.8;
}
```

A [custom preview template](https://sveltiacms.app/en/docs/api/preview-templates#linking-to-the-edit-pane) has these attributes only where it adds them itself, apart from the field previews that `widgetFor` and `widgetsFor` return.

The fields in the Edit Pane have the same attributes, so you can also style them with CSS on your admin page. Once a preview style applies to the entry, the preview is rendered in an iframe. Your admin page styles then don’t affect the preview, and your preview styles don’t affect the Edit Pane.

The attributes are primarily for internal use. The rest of the markup, such as class names and element structure, may change in any release, so keep your selectors as simple as possible.

**Why “key path”?**

The term comes from the [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Terminology#key_path), where a key path is a dot-separated path to a value in an object. Sveltia CMS handles entry data as a flattened object keyed by these paths, so the term is used throughout the app and its API, e.g. in the `widgetFor` prop of a [custom preview template](https://sveltiacms.app/en/docs/api/preview-templates#component-props).

### Showcase

Real-world examples of custom preview styles can be found in our [showcase](https://sveltiacms.app/en/showcase?feature=preview-styles).

Source: https://sveltiacms.app/en/docs/api/preview-styles

---

## Customization

Sveltia CMS offers various customization options to tailor the admin interface and functionality to your specific needs. This guide provides an overview of the available customization features in Sveltia CMS.

### Site URL

The `site_url` configuration option allows you to specify the URL of the published site. It’s used for:

- the link to the live site in the admin interface
- entry preview links generated with the [`preview_path`](https://sveltiacms.app/en/docs/collections/entries/previews) option
- public asset URLs

If omitted, it defaults to the origin of the CMS page (`location.origin`). It must be an absolute URL.

To link the admin interface to a different URL than the one used for previews and assets, use the [`display_url`](#display-url) option.

```yaml [YAML]
site_url: https://example.com
```

```toml [TOML]
site_url = "https://example.com"
```

```json [JSON]
{
  "site_url": "https://example.com"
}
```

```js [JavaScript]
{
  site_url: 'https://example.com',
}
```

### Display URL

The `display_url` configuration option allows you to specify the URL opened by the link to the live site in the admin interface. That link is available in the account menu and on the custom logo in the application header. Unlike `site_url`, it doesn’t affect preview links or asset URLs. If omitted, it defaults to the `site_url` option value.

The value can be an absolute URL or a path relative to the CMS origin.

```yaml [YAML]
site_url: https://example.com
display_url: https://www.example.com/blog/
```

```toml [TOML]
site_url = "https://example.com"
display_url = "https://www.example.com/blog/"
```

```json [JSON]
{
  "site_url": "https://example.com",
  "display_url": "https://www.example.com/blog/"
}
```

```js [JavaScript]
{
  site_url: 'https://example.com',
  display_url: 'https://www.example.com/blog/',
}
```

### Logout Redirect URL

The `logout_redirect_url` configuration option allows you to specify a custom URL to which users will be redirected after they log out of the Sveltia CMS admin interface. This can be useful for directing users back to the main website or a specific landing page. If omitted, users stay on the CMS sign-in page after logging out.

```yaml [YAML]
logout_redirect_url: https://example.com/logged-out
```

```toml [TOML]
logout_redirect_url = "https://example.com/logged-out"
```

```json [JSON]
{
  "logout_redirect_url": "https://example.com/logged-out"
}
```

```js [JavaScript]
{
  logout_redirect_url: 'https://example.com/logged-out',
}
```

### Custom Logo

You can customize the logo displayed in the Sveltia CMS admin interface by specifying a custom logo URL in the configuration file. This allows you to replace the default Sveltia CMS logo with your own branding.

The `logo` configuration option, defined at the root level of the configuration file, accepts an object with the following properties:

- `src`: The URL or path to the custom logo image. If omitted, the deprecated `logo_url` option is used, if defined, and the Sveltia CMS logo otherwise. (Optional)
- `show_in_header`: A boolean indicating whether to display the logo in the header. It has no effect without a custom logo. (Optional, default: `true`)

Configuration example:

```yaml [YAML]
logo:
  src: /path/to/your/logo.png
  show_in_header: true
```

```toml [TOML]
[logo]
src = "/path/to/your/logo.png"
show_in_header = true
```

```json [JSON]
{
  "logo": {
    "src": "/path/to/your/logo.png",
    "show_in_header": true
  }
}
```

```js [JavaScript]
{
  logo: {
    src: '/path/to/your/logo.png',
    show_in_header: true,
  },
}
```

**Breaking change from Netlify/Decap CMS**

In Sveltia CMS, the `show_in_header` option defaults to `true`, so your logo appears in the header without extra configuration. In Decap CMS, the logo is shown in the header only when the option is explicitly set to `true`. To hide the logo from the header, set `show_in_header` to `false`.

For backward compatibility, the `logo_url` configuration option is still supported but deprecated. It is recommended to use the `logo` object for better flexibility and future-proofing.

```yaml [YAML]
logo_url: /path/to/your/logo.png
```

```toml [TOML]
logo_url = "/path/to/your/logo.png"
```

```json [JSON]
{
  "logo_url": "/path/to/your/logo.png"
}
```

```js [JavaScript]
{
  logo_url: '/path/to/your/logo.png',
}
```

#### Where the Logo Appears

- Login page
- Header of the admin interface (when `show_in_header` is set to `true`)
- Browser tab (favicon)
- Application icon when [installed as an app](https://sveltiacms.app/en/docs/ui#installing-as-an-app) on desktop and mobile devices

#### Logo Image Requirements

- Both raster (PNG, WebP, JPEG) and vector (SVG) formats are supported
- A square image works best
- The recommended size is 512 × 512 pixels, but the logo will be scaled down to fit the interface
- It is recommended to use a transparent background for better visual integration with the interface, especially for dark mode users

### Custom Application Title

With the `app_title` configuration option, you can set a custom title for the Sveltia CMS admin interface. This title will be displayed on the login page and in the browser tab. You may want to replace the default “Sveltia CMS” title with your company name or a specific title that reflects the purpose of the admin interface.

```yaml [YAML]
app_title: Acme Inc. Site Admin
```

```toml [TOML]
app_title = "Acme Inc. Site Admin"
```

```json [JSON]
{
  "app_title": "Acme Inc. Site Admin"
}
```

```js [JavaScript]
{
  app_title: 'Acme Inc. Site Admin',
}
```

Note that this is not a white-label solution, so the name of Sveltia CMS will remain visible in some places. When a custom title is set, a small “Powered by Sveltia CMS” label will appear in the footer of the login page.

### Custom Mount Element

Sveltia CMS mounts the admin interface to the `<body>` element by default. However, you can specify a custom mount element by adding a `<div>` with a specific ID in your HTML. This way, you can embed the CMS admin interface within a specific section of your webpage, with a navigation bar or other content alongside the CMS.

The ID of the custom mount element is `nc-root`.

```html
<div id="nc-root"></div>
```

Make sure to properly style the custom mount element to ensure the CMS interface displays correctly within your layout. You may need to set dimensions, overflow properties or other CSS styles depending on your design requirements. Otherwise, the admin interface may not render as expected.

Sveltia CMS will automatically detect the presence of the `nc-root` element and mount the admin interface there instead of the default `<body>` element.

**Tip**

`nc-root` is short for “Netlify CMS Root,” a naming convention carried over from Netlify/Decap CMS to maintain familiarity for users transitioning between the two systems.

### Styling Fields

Every field in the Edit Pane has the `data-field-type`, `data-key-path` and `data-typed-key-path` attributes, so you can style specific fields with CSS on your admin page:

```html
<style>
  [data-key-path='title'] input {
    font-size: 1.5em;
  }
</style>
```

The default Preview Pane marks each field with the same attributes. See [Styling Specific Fields](https://sveltiacms.app/en/docs/api/preview-styles#styling-specific-fields) for what the attributes contain and how to style the preview.

### JavaScript API

Sveltia CMS offers a comprehensive API that enables developers to extend and customize its features. You can register custom field types, preview templates, editor components and more to enhance the content management experience.

For detailed information on how to use the API, please refer to the [JavaScript API guide](https://sveltiacms.app/en/docs/api).

### Modifying Source Code

Sveltia CMS is an open source project licensed under the [MIT License](https://choosealicense.com/licenses/mit/), and its source code is available on [GitHub](https://github.com/sveltia/sveltia-cms). Advanced users and developers can fork the repository and modify the source code to implement custom features or changes that are not available through the standard customization options.

However, please note that our source code is under active development with significant refactoring and improvements happening regularly. We also plan to reevaluate the UI framework, currently [Svelte](https://svelte.dev/), at some point. Direct modifications to the source code may lead to compatibility issues with future updates.

Source: https://sveltiacms.app/en/docs/customization
