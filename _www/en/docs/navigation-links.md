---
translationKey: navigation-links
order: 5
lang: en
createdAt: 2026-05-13T07:44:00.000Z
ldType: WebPage
name: Navigation & links
docsNav:
  section: content
  order: 3
vars: {}
---
{% raw %}
## Links shortcode

The `link` shortcode is a versatile helper for creating different types of links. It can automatically detect the link type based on the `url` provided, or you can explicitly set it with the `linkType` attribute.

You can use it in two ways:

1. With named attributes: `{% link url="...", text="..." %}`
2. With a positional URL: `{% link "/my-page/", text="..." %}`

Any additional attributes you provide (like `class`, `id`, `target`, etc.) are passed directly to the final `<a>` tag.

### Internal links

Creates a link to another page within your site. It uses the project's collections and internationalization (i18n) features to find the correct, language-specific URL.

- **`url`**: The `translationKey` or slug of the page you want to link to.
- **`collection`**: The collection the page belongs to (e.g., `"articles"`). This is optional but highly recommended for better performance.
- **`text`**: If you don't provide text, it will automatically use the target page's title.
- **`anchor`** : An optional ID for linking to a specific section (anchor) on the page (do not include the `#`)

```markdown
{% link url="my-article", text="See the article", anchor="", linkType="internal", collection="articles" %}

{# Renders: #}
<a href="/en/articles/my-article/">See the article</a>
```

### External links

Creates a standard link to an external website. This is automatically detected for any `url` starting with `http` or `www.`.

- **Good practice**: For security and user experience, it's recommended to add `target="_blank"` and `rel="noopener"` to open external links in a new tab.

```markdown
{% link url="https://poko.eco", text="poko", target="_blank", rel="noopener" %}

{# Renders: #}
<a href="https://poko.eco" target="_blank" rel="noopener">poko</a>
```

### Email links

Creates a `mailto:` link that opens the user's default email client. This is automatically detected for any `url` that is a valid email address.

- **Spam protection**: The email address is automatically obfuscated in the final HTML to protect it from spam bots.
- **Pre-fill email**: You can pre-fill the email using the `subject`, `body`, `cc`, and `bcc` attributes.

```markdown
{% link url="hello@email.com", text="Contact Us", subject="Info Request", body="Hello!" %}

{# Renders an obfuscated mailto link, which behaves like: #}
<a href="mailto:hello@email.com?subject=Info%20Request&body=Hello!">Contact Us</a>
```

### File links

Creates a link to a file, which can be made downloadable. This is automatically detected for paths that end with a file extension (e.g., `.pdf`, `.zip`).

- **Download**: To make the browser download the file instead of trying to open it, add the `download=true` attribute.

```markdown
{% link "/assets/my-document.pdf", text="Download the file", download=true %}

{# Renders: #}
<a href="/assets/my-document.pdf" download="true">Download the file</a>
```

## Navigation bar

Navigation is managed via YAML files in `_content/_data/[lang]/nav/`.
Example `main.yaml`:

```yaml
- items:
	- linkTo:
	    type: pages
	    slug: about
	- linkTo:
	    type: url
	    url: "https://google.com"
	    label: "Blog"
	- linkTo:
	    type: subItems
	    label: "Services"
	    subItems:
	      - linkTo:
	          type: pages
	          slug: web-design
```

### Navigation structure

The builder supports different types of links in your navigation menus, defined by the `type` property:

- **`type: pages`**: Links dynamically to an internal page using its `slug` (or `translationKey`). It automatically uses the target page's title as the link label and handles language prefixes automatically.
- **`type: url`**: Used for custom external links or specific hardcoded paths. You must provide the exact `url` and a `label`.
- **`type: subItems`**: Creates a dropdown or a nested menu structure. This item itself isn't a link; instead, it uses the `label` to group a list of nested `linkTo` items defined in the `subItems` array.

### Active state recognition

The navigation system automatically detects which page you are currently viewing. During the build process, Poko compares the generated URL of each navigation link against the current page's URL. When there is a match, the system automatically applies an **`aria-current="page"`** attribute to the corresponding HTML element. This allows your CSS to effortlessly highlight the current active page in the menu without any manual configuration.

### Customizing navigation selection

- **Global default:** Set `customNav: main` in `globalSettings.yaml` to apply this menu site-wide.
- **Page override:** Set `pageNav: otherNav` in the page's Front-Matter to use a different menu just for that specific page.
{% endraw %}