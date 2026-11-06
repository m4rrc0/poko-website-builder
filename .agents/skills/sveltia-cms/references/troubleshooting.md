# Troubleshooting

Known issues and their fixes, Content Security Policy directives, and frequently asked questions.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Troubleshooting

This guide provides solutions to common issues you may encounter while using Sveltia CMS.

### Fixing a Blank Page Caused by Rocket Loader

Cloudflare’s [Rocket Loader](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/) content optimizer is known to interfere with Sveltia CMS’s JavaScript code, resulting in a blank page. If you are using Cloudflare and have Rocket Loader enabled, you may need to [disable it](https://developers.cloudflare.com/speed/optimization/content/rocket-loader/ignore-javascripts/) by adding the `data-cfasync="false"` attribute to the script tag that loads Sveltia CMS from the CDN:

```html
<script data-cfasync="false" src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

See [discussion #552](https://github.com/sveltia/sveltia-cms/discussions/552) for details.

### Working Around an Authentication Error

If you get an “Authentication Aborted” error when trying to sign in to GitHub, GitLab or Gitea/Forgejo using the authorization code flow, you may need to check your site’s [`Cross-Origin-Opener-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy). The COOP header is not widely used, but it’s known to break the OAuth flow with a popup window. If that’s your case, changing `same-origin` to `same-origin-allow-popups` may solve the problem.

For GitLab, you need to remove the COOP header entirely because the `same-origin-allow-popups` directive doesn’t seem to work. Otherwise, you will likely get stuck on the CMS login page after authentication.

See [issue #131](https://github.com/sveltia/sveltia-cms/issues/131) and [issue #815](https://github.com/sveltia/sveltia-cms/issues/815) for details.

### Avoiding API Issues with Reverse Proxy Servers

When using a self-hosted Git service like Gitea or Forgejo, it’s common to use a reverse proxy server such as Nginx or Apache to handle incoming requests. However, certain configurations of the reverse proxy can interfere with API requests made by Sveltia CMS, leading to unexpected errors.

One known issue is the [double-encoding](https://en.wikipedia.org/wiki/Double_encoding) of special characters in file paths. This can happen if the reverse proxy is not configured to properly forward requests to the Git service. To avoid this issue, make sure to review your reverse proxy settings and ensure that URL encoding is handled correctly.

See [issue #469](https://github.com/sveltia/sveltia-cms/issues/469) for details.

### Using Proper Naming Conventions

In the CMS configuration, you must define the `name` option for collections, collection files, fields and variable types. These names have to be unique within their scope and cannot contain certain special characters.

Invalid characters include spaces, colons (`:`) and angle brackets (`<`, `>`) as well as dots (`.`) and asterisks (`*`), which are used to denote nested structures and wildcards, respectively, especially for the [Relation](https://sveltiacms.app/en/docs/fields/relation) field type’s field references. If you use invalid names, the CMS will show config validation errors on the login screen.

For example, the following configuration is invalid because the field name `foo.bar` contains a dot:

```yaml
fields:
  - name: foo.bar
    widget: object
    fields:
      - name: enabled
        widget: boolean
```

To fix this, you should use nested objects instead:

```yaml
fields:
  - name: foo
    widget: object
    fields:
      - name: bar
        widget: object
        fields:
          - name: enabled
            widget: boolean
```

See [discussion #542](https://github.com/sveltia/sveltia-cms/discussions/542) for details.

### Resolving Broken UI Caused by CSS Conflicts

The Sveltia CMS script is designed to be included in a static, standalone HTML page, as shown in the [start guide](https://sveltiacms.app/en/docs/start#manual-installation). In this case, there are no CSS conflicts, and the CMS UI functions properly.

However, if you include the script in a page managed by a front-end framework, such as `admin.astro`, `admin.njk` or `+page.svelte`, you must apply a blank layout to that page. Otherwise, the default layout may contain conflicting styles with the CMS layout, resulting in a broken UI. Tailwind CSS is known to cause such conflicts, but other CSS frameworks or custom styles can cause issues as well.

Refer to your framework’s documentation for instructions on applying a blank layout to a specific page.

See [issue #330](https://github.com/sveltia/sveltia-cms/issues/330) for details.

### Fixing Build Errors Caused by Content Data

There are several types of build errors that can occur when using Sveltia CMS. The most common ones are:

#### Schema Validation

Some frameworks, like [Astro](https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema), rely on strict schema validation for content files, which can lead to build errors if the content does not conform to the expected structure.

By default, Sveltia CMS does not omit empty [optional fields](https://sveltiacms.app/en/docs/fields#required) from the content data, which can cause validation errors in frameworks that expect only defined fields. To resolve this issue, set the `omit_empty_optional_fields` global output option to `true` to automatically remove undefined fields from the serialized content data. See the [Data Output](https://sveltiacms.app/en/docs/data-output) documentation for details.

See [issue #241](https://github.com/sveltia/sveltia-cms/issues/241) for details.

#### Special Characters in Image Paths

By default, Sveltia CMS does not encode special characters in image paths, which can lead to build errors in some frameworks that expect URL-encoded paths. To resolve this issue, set the `encode_file_path` global output option to `true` to automatically encode special characters in image paths. See the [Data Output](https://sveltiacms.app/en/docs/data-output) documentation for details.

See [issue #404](https://github.com/sveltia/sveltia-cms/issues/404) for details.

#### Non-ASCII Characters in Slugs

By default, Sveltia CMS allows Unicode characters in slugs, which can lead to build errors in some frameworks, like Jekyll, that do not support them. To resolve this issue, set the `encoding` global slug option to `ascii` to automatically transliterate Unicode characters to their ASCII equivalents. See the [Entry Slugs](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs) documentation for details.

See [discussion #544](https://github.com/sveltia/sveltia-cms/discussions/544) for details.

#### Excessively Long Slugs

By default, Sveltia CMS limits generated slugs to 200 bytes, which keeps filenames and branch names valid but can still lead to build errors in some CI services that have a lower maximum slug length. To resolve this issue, set the `maxlength` global slug option to a value that is within the limits of your Git service, or adjust your collection’s `slug` template. See the [Entry Slugs](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs) documentation for details.

Source: https://sveltiacms.app/en/docs/troubleshooting

---

## Security

Security is a top priority for Sveltia CMS so that content can be managed with confidence. This document outlines the security features and practices of Sveltia CMS. It also provides best practices for securing your CMS installation.

### Our Approach

Sveltia CMS employs multiple layers of security measures to protect data and ensure a safe content management experience. Our security approach includes the following features and practices:

#### Security Features

- **XSS protection**: HTML sanitization is performed using the [DOMPurify](https://github.com/cure53/DOMPurify) library. The unpatched [XSS vulnerability](https://github.com/advisories/GHSA-xp8g-32qh-mv28) in Decap CMS does not affect Sveltia CMS. The `sanitize_preview` [RichText field](https://sveltiacms.app/en/docs/fields/richtext) option defaults to `true`.
- **No proxy required**: The [local workflow](https://sveltiacms.app/en/docs/workflows/local) eliminates attack surfaces from compromised dependencies and unauthorized API access.
- **Secure contexts only**: HTTPS is required for all site content and CMS configuration.
- **Automatic referrer policy**: The `same-origin` policy is automatically set globally in the app. An exception is the OpenStreetMap integration for the [Map field type](https://sveltiacms.app/en/docs/fields/map), which requires `strict-origin` to [load tiles properly](https://wiki.openstreetmap.org/wiki/Referer).
- **Link rel attributes**: All external links in the admin interface have `rel="noopener noreferrer"` to prevent tabnabbing and protect user privacy.
- **Sandboxed iframes**: All iframes in the admin interface are sandboxed with appropriate restrictions to prevent malicious content from executing harmful actions.
- **Simplified CSP**: No `unsafe-eval` or `unsafe-inline` needed in `script-src`. We provide a [CSP builder](#setting-up-content-security-policy) tool to help users generate a secure policy based on their specific configuration and deployment setup.
- **Signed commits**: GitHub commits are automatically GPG-signed and [verified](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification).
- **Signed uploads**: [Media uploads to Uploadcare](https://sveltiacms.app/en/docs/media/uploadcare) are signed using secure API keys.

#### Security Practices

- **AI-assisted coding**: Claude and GPT assistants are used to ensure secure coding practices and identify potential vulnerabilities during development.
- **Dependency security**: Constant full updates with `ncu -u && pnpm up`, manual and CI-driven [`pnpm audit`](https://pnpm.io/cli/audit) and Dependabot alerts deal with vulnerabilities quickly. `pnpm`’s `minimumReleaseAge` option [protects against supply chain attacks](https://pnpm.io/supply-chain-security).
- **Transparent releases**: We use pnpm, Vite, GitHub Actions and [npm package provenance](https://github.blog/security/supply-chain-security/introducing-npm-package-provenance/) for verifiable, reliable releases.
- **Immutable releases**: Newer releases are [immutable](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) and cannot be modified after publishing. This ensures that users can trust the integrity of the software they install.
- **Frequent releases**: Regular releases ensure users get the latest security fixes and improvements promptly. Timely dependency updates also reduce the risk of vulnerabilities in third-party packages.
- **Publishing security**: [Trusted publishing](https://docs.npmjs.com/trusted-publishers) and [2FA](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification) enabled.
- **Responsible disclosure**: We publish a [security policy](https://github.com/sveltia/sveltia-cms/security/policy) and encourage the responsible disclosure of vulnerabilities. We maintain a public list of [security advisories](https://github.com/sveltia/sveltia-cms/security/advisories) to keep users informed about issues and their resolutions. We give credit to security researchers who report vulnerabilities, although we do not offer bounties.
- **Swift response**: We prioritize security fixes and aim to address vulnerabilities as quickly as possible, regardless of severity. In fact, we implemented and shipped fixes for the vulnerabilities reported in the past within a few hours of them being reported, even though there were no known exploits.
- **Communication**: We announce security updates through GitHub, Discord and Bluesky.

### What You Can Do

To protect your Sveltia CMS installation and data, follow these best practices:

- Keep your Sveltia CMS installation [up to date](https://sveltiacms.app/en/docs/releases). If you use the CDN version, you’ll always get the latest version unless you specify an exact version number in the URL. If you self-host, regularly check for updates and apply them promptly.
- Set up PKCE authentication for your Git backend if possible. Sveltia CMS supports quick PAT authentication, but it’s mainly for individual developers and not recommended for multi-user teams, especially when non-technical members are involved.
- Set up two-factor authentication (2FA) for your Git instance.
- Keep your Git instance up to date if you’re self-hosting it.
- Use HTTPS for your site to ensure secure communication between the client and server. All major hosting providers use HTTPS by default. If you self-host, consider using [Let’s Encrypt](https://letsencrypt.org/) to obtain free TLS certificates. Sveltia CMS doesn’t work on HTTP sites.
- Set up Content Security Policy (CSP) for your site. See the section below for recommended policies.
- Do not disable the `sanitize_preview` option for [RichText](https://sveltiacms.app/en/docs/fields/richtext) and [Markdown](https://sveltiacms.app/en/docs/fields/markdown) fields unless you fully understand the implications. Disabling this option may expose your site to XSS attacks if untrusted users can edit content.

### Setting up Content Security Policy

If your site adopts Content Security Policy (CSP), we recommend starting with the base policy below and adding origins for any additional features you use.

```
style-src 'self' 'unsafe-inline';
font-src 'self' https://cdn.jsdelivr.net;
img-src 'self' blob: data:;
media-src blob:;
frame-src blob:;
script-src 'self' https://unpkg.com;
connect-src 'self' blob: data: https://unpkg.com;
manifest-src blob:;
```

#### Backends

##### GitHub

Also add your GitHub Enterprise Server origin if applicable.

- `img-src`
  ```
  https://*.githubusercontent.com
  ```
- `connect-src`
  ```
  https://api.github.com https://www.githubstatus.com
  ```

##### GitLab

Also add your self-hosted instance origin if applicable.

- `img-src`
  ```
  https://gitlab.com https://secure.gravatar.com
  ```
- `connect-src`
  ```
  https://gitlab.com https://status-api.hostedstatus.com
  ```

##### Gitea/Forgejo

Use your self-hosted instance origin instead if applicable.

- `img-src`
  ```
  https://gitea.com
  ```
- `connect-src`
  ```
  https://gitea.com
  ```

#### Media Storage Providers

##### Cloudinary

Replace the img-src origin with your custom domain if configured.

- `img-src`
  ```
  https://res.cloudinary.com
  ```
- `frame-src`
  ```
  https://console.cloudinary.com
  ```

##### Uploadcare

Replace the img-src origin with your custom domain if configured.

- `img-src`
  ```
  https://*.ucarecd.net https://ucarecdn.com
  ```
- `connect-src`
  ```
  https://upload.uploadcare.com https://api.uploadcare.com
  ```

#### Image Optimization

##### HEIC Conversion

Required if [HEIC photos](https://sveltiacms.app/en/docs/media#heic-photos) are converted on upload: the decoder runs in a Web Worker created from a `blob:` URL. Not required for the npm package, which serves the worker from your site.

- `worker-src`
  ```
  blob:
  ```

#### Stock Photo Providers

##### Lorem Picsum

- `img-src`
  ```
  https://picsum.photos https://fastly.picsum.photos
  ```
- `connect-src`
  ```
  https://picsum.photos
  ```

##### Pexels

- `img-src`
  ```
  https://images.pexels.com
  ```
- `connect-src`
  ```
  https://images.pexels.com https://api.pexels.com
  ```

##### Pixabay

- `img-src`
  ```
  https://pixabay.com
  ```
- `connect-src`
  ```
  https://pixabay.com
  ```

##### Unsplash

- `img-src`
  ```
  https://images.unsplash.com
  ```
- `connect-src`
  ```
  https://images.unsplash.com https://api.unsplash.com
  ```

#### AI Integrations

##### Google Cloud Translation

- `connect-src`
  ```
  https://translation.googleapis.com
  ```

##### Google Gemini

- `connect-src`
  ```
  https://generativelanguage.googleapis.com
  ```

##### Anthropic

- `connect-src`
  ```
  https://api.anthropic.com
  ```

##### DeepSeek

- `connect-src`
  ```
  https://api.deepseek.com
  ```

##### Mistral AI

- `connect-src`
  ```
  https://api.mistral.ai
  ```

##### OpenAI

- `connect-src`
  ```
  https://api.openai.com
  ```

#### Map Providers

##### OpenStreetMap

- `img-src`
  ```
  https://*.openstreetmap.org
  ```
- `connect-src`
  ```
  https://*.openstreetmap.org
  ```

#### Video Embeds

##### YouTube

- `frame-src`
  ```
  https://www.youtube-nocookie.com
  ```

#### CI/CD Providers

If you choose to [disable automatic deployments](https://sveltiacms.app/en/docs/deployments#disabling-automatic-deployments) and have configured a webhook URL, you may need to add the origin to the `connect-src` directive. Here are some examples:

##### Cloudflare Pages

- `connect-src`
  ```
  https://api.cloudflare.com
  ```

##### Netlify

- `connect-src`
  ```
  https://api.netlify.com
  ```

##### Vercel

- `connect-src`
  ```
  https://api.vercel.com
  ```

**Breaking Change in v0.174.0**

To ensure [GDPR compliance](https://github.com/sveltia/sveltia-cms/issues/443), we have replaced Google Fonts with [Fontsource](https://fontsource.org/) as the CMS’s font provider. If your site adopts a CSP, you may need to update your policy to allow the new font provider, which is served via jsDelivr. Specifically, you need to make the following changes:

- `style-src`: Remove `https://fonts.googleapis.com`
- `font-src`: Replace `https://fonts.gstatic.com` with `https://cdn.jsdelivr.net`

**Allowing All Image Sources**

If you have image field(s) and expect that images will be inserted as URLs, you may want to allow any source using a wildcard instead of specifying individual origins:

```
img-src 'self' blob: data: https://*;
```

**Recommended CSP for Media Libraries**

Please refer to the documentation for your specific storage provider for recommended CSP directives, as they typically depend on your configuration (e.g. custom domain vs. default endpoint) and may require allowing specific origins for API calls and asset URLs.

**Note for Netlify/Decap CMS users**

Sveltia CMS does not require the `unsafe-eval` and `unsafe-inline` keywords in the `script-src` CSP directive. Also, the `script-src` CSP directive is not required for the Cloudinary integration to work, as we implemented it without using their hosted widget script.

**About UNPKG origin**

The [UNPKG](https://unpkg.com/) CDN is used for the following purposes in Sveltia CMS:

- Download the CMS script bundle
- Check for the latest version of the CMS
- Retrieve locale files for the admin interface other than English (US)
- Retrieve additional dependencies such as [PDF.js](https://github.com/mozilla/pdf.js), [Leaflet](https://github.com/Leaflet/Leaflet) and [SVGO](https://github.com/SVG/svgo)
- Retrieve the WebAssembly decoder for [HEIC photos](https://sveltiacms.app/en/docs/media#heic-photos) when image optimization is enabled
- Retrieve [Shiki](https://shiki.style/) language definitions and themes for syntax highlighting in code editors
- Retrieve [Day.js](https://day.js.org/) locale data for DateTime fields with the [`localize_format`](https://sveltiacms.app/en/docs/fields/datetime#localize-format) option

The npm package doesn’t use UNPKG for any of these. See below.

**CSP for the npm Package**

The [npm package](https://sveltiacms.app/en/docs/releases#cdn-or-npm-package) serves all the files above, along with the fonts, from your own site. If you use it, you can remove `https://unpkg.com` and `https://cdn.jsdelivr.net` from the policy, and the HEIC conversion doesn’t need `blob:` in `worker-src`.

Source: https://sveltiacms.app/en/docs/security

---

## FAQ

This page addresses some of the most frequently asked questions about Sveltia CMS. If you have a question that is not covered here, feel free to ask it on the [Discussions](https://github.com/sveltia/sveltia-cms/discussions) page in our GitHub repository.

<!-- [[toc]] -->

### Licensing & Costs

#### Is Sveltia CMS free to use?

Yes. Sveltia CMS is an open source project released under the [MIT License](https://choosealicense.com/licenses/mit/). You can use it for free in both personal and commercial projects.

We receive financial support from our users through [GitHub Sponsors](https://github.com/sponsors/kyoshino), which helps us cover the costs of maintaining and improving Sveltia CMS. While contributions are appreciated, they are not required to use the product.

#### Why is it free?

The ongoing development of Sveltia CMS is currently funded by the maintainer personally. Our predecessor, Netlify CMS, was also free and open source software, and we want to continue that tradition with Sveltia CMS. The product’s target audience is individual developers and small teams who may prefer a simple CMS solution without recurring costs.

Fortunately, aside from the maintainer’s time and effort, the maintenance costs of Sveltia CMS are relatively low. Since it’s not SaaS, we don’t manage any cloud infrastructure. Services we use for distribution and hosting, such as GitHub, npm, UNPKG and Cloudflare Pages, are all available for free. We still need to cover some expenses like domain registration and development tools, but these are manageable for a single developer.

#### Can I use Sveltia CMS for commercial projects?

Of course! Sveltia CMS is released under the MIT License, which allows you to use it for both personal and commercial projects without any restrictions.

However, it’s not suitable for large enterprises that require advanced features, dedicated support or compliance certifications. In those cases, consider commercial CMS solutions designed specifically for enterprise needs.

### Project Status & Reliability

#### Can I use Sveltia CMS even though it’s still in beta?

Although it’s still in beta, [many users](https://sveltiacms.app/en/showcase) are already using our product for their projects. We can confidently say that Sveltia CMS is [much more stable and reliable than Netlify/Decap CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms), which has been widely used in production for years despite its numerous bugs and inactive development.

However, breaking changes may occur during the beta phase. We recommend keeping an eye on the [release notes](https://sveltiacms.app/en/docs/releases#release-information) for any updates that may require adjustments to your implementation. We also encourage you to [report any issues](https://sveltiacms.app/en/feedback#bug-reports) you encounter in our GitHub repository.

#### When will Sveltia CMS reach version 1.0 (GA)?

As outlined in the [roadmap](https://sveltiacms.app/en/docs/roadmap), the tentative timeline for the 1.0 release is late 2026. However, this date may change depending on various factors such as development progress, user feedback and unforeseen challenges.

We are committed to delivering a high-quality product, so we won’t rush the release just to meet a deadline. We’ll keep you updated on our progress through our [release notes](https://sveltiacms.app/en/docs/releases#release-information) and other channels.

As [mentioned above](#can-i-use-sveltia-cms-even-though-it-s-still-in-beta), being in beta doesn’t mean the product is unreliable. We have already implemented many features and improvements, and we are implementing the rest of the features planned for 1.0 in the current beta releases. We encourage you to try it out and provide feedback to help us improve the product.

#### Is Sveltia CMS suitable for large-scale projects?

No. Sveltia CMS is primarily designed for small to medium-sized projects, such as personal blogs, portfolios and small business websites. For large-scale projects with complex requirements, you might want to consider more robust, commercial CMS solutions.

#### Why is Sveltia CMS popular even during its early development stage?

Sveltia CMS has quickly gained traction due to its focus on solving the pain points of Netlify/Decap CMS users, its framework-agnostic design and its commitment to providing a high-quality user experience. The [Jamstack](https://jamstack.org/) community has been eagerly awaiting a modern, actively maintained alternative to Netlify/Decap CMS, and Sveltia CMS has effectively filled that void.

Another contributing factor is the limited number of free, Git-based headless CMS options available. Most of the open source projects in this space are either inactive or tied to specific frameworks, making Sveltia CMS an appealing choice for developers seeking a versatile and reliable solution for small to medium-sized projects.

The popularity of Sveltia CMS coincides with the [rise of Astro](https://blog.cloudflare.com/astro-joins-cloudflare/), a popular choice for building static sites. Its [compatibility with Astro](https://sveltiacms.app/en/docs/frameworks/astro) makes Sveltia CMS an attractive option for developers looking for a CMS that works well with their chosen framework.

Additionally, AI agents often recommend Sveltia CMS as a replacement for Netlify/Decap CMS, which has further boosted its visibility and adoption.

### Project Background

#### Is Sveltia CMS a personal project?

Yes, for now. Sveltia CMS is currently maintained by a single developer, who is also the creator of the project. The [maintainer](https://sveltiacms.app/en/docs/intro#about-the-author) has over 20 years of experience with a generalist skill set that covers web development, UX/UI design, localization, documentation and marketing.

At this point, the codebase still requires significant refactoring and improvements in test coverage, so pull requests from the community are not being accepted yet. However, we welcome feedback, suggestions and bug reports in our GitHub repository.

We’ll create contributor documentation in the future to encourage community contributions, once the codebase is more stable and maintainable.

#### Is Sveltia CMS a hobby project?

Absolutely not. Sveltia CMS is a serious project developed by an experienced UX engineer, with the goal of providing a reliable and high-quality CMS solution for developers and content creators. It was originally created for the maintainer’s own clients who needed a better alternative to Netlify CMS.

A hobby project wouldn’t [solve hundreds of issues](https://sveltiacms.app/en/docs/successor-to-netlify-cms) from a predecessor project, implement numerous new features, maintain a high level of quality and performance or create comprehensive 100+ page documentation.

Thousands of users worldwide trust Sveltia CMS, including government agencies, universities and nonprofit organizations. Visit our [Showcase](https://sveltiacms.app/en/showcase) page to see some of the real-world projects that are using our platform.

#### Is Sveltia CMS a student project?

Absolutely not. The maintainer is a seasoned professional with over 20 years of experience in web development and open source. Because [he looks half his age](https://github.com/kyoshino#fun-facts-about-me), some people mistakenly assume he is a student. But rest assured, Sveltia CMS is a serious project developed by an experienced UX engineer.

#### Why did you create Sveltia CMS?

Sveltia CMS was originally created for the maintainer’s freelance clients who wanted to replace their existing Netlify CMS installations, which were becoming increasingly difficult to maintain due to unresolved issues and lack of active development. I18n support was a key requirement for these clients, as they needed to manage content in multiple languages.

#### Why is it called Sveltia CMS?

Sveltia is the name of [our parent project](https://github.com/sveltia) that develops tools for the [Svelte](https://svelte.dev/) ecosystem. The name “Sveltia” is derived from the word “Svelte,” which reflects the project’s focus on simplicity, performance and elegance in web development. It’s also the name of [sea snails](https://en.wikipedia.org/wiki/Sveltia).

Sveltia CMS itself is [framework-agnostic](https://sveltiacms.app/en/docs/frameworks) and can be used with any front-end framework or library, including Astro, Eleventy and Hugo.

### Project Succession

#### Is Sveltia CMS a spiritual successor to Netlify CMS?

No. Although we did not receive an endorsement from Netlify nor take over the ownership, Sveltia CMS stands strong as the de facto successor to Netlify CMS. It continues to address issues reported to the predecessor’s repository while maintaining high compatibility.

In contrast, the official successor, Decap CMS, has been neglected, leaving most issues unresolved. It doesn’t even provide a migration guide for Netlify CMS users.

You wouldn’t call LibreOffice a spiritual [successor to OpenOffice.org](https://www.libreoffice.org/libreoffice-vs-openoffice/); it’s the de facto successor. The official successor, Apache OpenOffice, is effectively defunct. Similarly, Sveltia CMS is the de facto successor to Netlify CMS, not a spiritual one.

The official designation doesn’t matter. What matters is that Sveltia CMS is actively maintained, reliable, compatible with its predecessor and continuously dealing with issues. See the [Successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms) page for a detailed explanation.

Among Git-based headless CMSs, [Pages CMS](https://pagescms.org/) could be considered a spiritual successor. Inspired by Netlify CMS, it has a similar YAML configuration format but a different architecture. We could have taken the same approach, but we deliberately chose a more difficult path by voluntarily carrying over hundreds of issues from Netlify CMS.

#### Is Sveltia CMS a successor to Decap CMS?

Sveltia CMS was created before Decap CMS and was never intended to replace or compete with it. However, as Decap CMS has been neglected and many issues remain unresolved, Sveltia CMS can be considered the de facto successor to Decap CMS as well. It’s a more reliable and actively maintained alternative for users looking to migrate from Decap CMS.

In fact, as our [Showcase](https://sveltiacms.app/en/showcase) shows, more than 25% of Sveltia CMS users have switched from Decap CMS. Sveltia CMS also attracts more weekly downloads than Decap CMS on the [npm registry](https://www.npmjs.com/package/@sveltia/cms).

See the [Successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms) page for a detailed comparison of the two products.

#### Is Sveltia CMS a Svelte port of React-based Netlify CMS?

No, Sveltia CMS is an entirely new product, not a port or fork. Although it mimics the behavior of Netlify/Decap CMS to maintain backward compatibility, it’s built from the ground up with a new architecture and design.

We don’t use the predecessor’s codebase at all. We rarely reference it. This is not due to licensing issues, as both projects are MIT-licensed, but rather a strategic decision. Implementing the same features from scratch takes more time and effort but allows us to avoid inheriting the predecessor’s technical debt and numerous bugs.

#### What are the main differences between Sveltia CMS and Netlify/Decap CMS?

Sveltia CMS is a complete rewrite of Netlify CMS with a focus on addressing its shortcomings and providing a better user experience. It’s not a fork of Netlify/Decap CMS, but a new project built from the ground up using [Svelte](https://svelte.dev/) instead of React. Literally everything has been improved, from the architecture and design to the feature set and performance. See the [Successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms) page for a detailed comparison.

#### Are you going to solve all the remaining Netlify/Decap CMS issues?

Not literally all of them. Some issues are irrelevant to Sveltia CMS due to unsupported features or different design decisions. For example, we don’t support Azure DevOps and Bitbucket, so any issues relating to these Git service providers won’t be addressed.

However, we do plan to address the remaining relevant and worthwhile issues. In the long term, we expect the total number of solved issues to exceed 1,000, including duplicates. We even tackle issues that have been [closed as stale](https://github.com/decaporg/decap-cms/issues?q=is%3Aissue+%22Closing+as+stale%22) by the Decap CMS maintainers, as well as many others that are unlikely to ever be solved by them.

That’s what we signed up for as the [true successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms). A mere spiritual successor wouldn’t bother with that.

### Community & Support

#### Who’s using Sveltia CMS?

Sveltia CMS is already being used by thousands of individuals and organizations for their websites and projects, and the number is growing rapidly. See the [Showcase](https://sveltiacms.app/en/showcase) page for various real-world examples of Sveltia CMS in action.

Please note that the Showcase page only features a small fraction of our users because many prefer to keep their projects private. Additionally, political and religious projects are excluded because we aim to maintain a neutral stance and avoid controversy.

#### How is the Showcase curated?

We constantly [search GitHub](https://github.com/search?q=sveltia&type=commits&s=committer-date&o=desc) for new Sveltia CMS users and add them to our Showcase page if they meet our criteria. We monitor hundreds of repositories that have installed the CMS, adding new ones as sites are launched. It’s a lot of work for such a small project, but we want to recognize our users and demonstrate the growing popularity of Sveltia CMS.

[Let us know](https://github.com/sveltia/sveltia-cms/discussions/593) if you want to be featured on the Showcase page!

#### What are the criteria for being featured on the Showcase?

When deciding which projects to feature on the Showcase page, we generally consider the following criteria and perform basic due diligence:

- Projects must represent a real-world use case of Sveltia CMS. Demo projects, test sites and under-construction sites are not eligible.
- Projects must be publicly accessible as live websites or applications so visitors can see Sveltia CMS in action.
- Additionally, there must be a public repository, case study, blog post, social media post or other evidence showing how Sveltia CMS is being used.
  - If there is a public repository, it must contain commits or a README showing that the project actively uses Sveltia CMS.
  - In some cases, we may still feature projects even after the repository has been made private if we’ve seen their CMS usage in their commit history during the public phase.
- Projects by organizations or individuals with little to no online presence will not be featured because it’s difficult to verify their legitimacy.
  - We check social media profiles and other online presences to confirm that the project is legitimate and not spam or a scam. Having 100+ followers on social media is a good indicator of this.
- Projects must not contain any offensive, inappropriate, illegal or NSFW content.
- Projects containing political, religious, military or controversial content will not be featured.
  - Discussions of these topics that are academic or critical are acceptable as long as they do not advocate for a specific agenda or viewpoint.
  - We may still feature moderate grassroots campaigns and charities that primarily focus on issues such as civil rights and humanitarianism.
- Personal blogs and websites will only be featured if they have a significant online presence and credibility, such as having hundreds of followers.

Templates will not be featured on the Showcase page, but we can list them in our [Start Guide](https://sveltiacms.app/en/docs/start) and [Framework Guides](https://sveltiacms.app/en/docs/frameworks) if they are publicly available. Ping the maintainer on Discord, Bluesky or GitHub Discussions if you want your template to be listed.

#### Are there any plans for a hosted version of Sveltia CMS?

We understand that setting up and maintaining a self-hosted CMS can be challenging for some users. Therefore, we may consider offering a hosted version of Sveltia CMS in the future, depending on user demand and resource availability.

#### Can I donate to support the development of Sveltia CMS?

Maintainer [@kyoshino](https://github.com/kyoshino) is accepting donations to support the project. If you’d like to chip in financially, you can do so through [GitHub Sponsors](https://github.com/sponsors/kyoshino). Your support will help us maintain and improve Sveltia CMS, and we really appreciate it!

### Development and Maintenance

#### Is Sveltia CMS going to be actively maintained?

The maintainer wants to make Sveltia CMS a long-term project that serves the needs of developers and content creators. Therefore, he is committed to providing ongoing maintenance and support for the project for the foreseeable future.

#### What is the roadmap for Sveltia CMS?

We have a public [roadmap](https://sveltiacms.app/en/docs/roadmap) that outlines our plans for future development. It’s regularly updated based on user feedback and priorities. Check it out to see what’s coming next!

#### How often are new releases made?

Usually several times a week, depending on the number of changes and fixes. We follow a continuous release model, so new features, improvements and bug fixes are released as soon as they are ready. See the [Releases](https://sveltiacms.app/en/docs/releases) page for details.

#### How can I contribute to Sveltia CMS?

See the [Contributing page](https://github.com/sveltia/sveltia-cms/blob/main/CONTRIBUTING.md) for guidelines on how to contribute to Sveltia CMS. We welcome contributions in various forms, including bug reports, feature requests and documentation improvements. Pull requests are not being accepted at this time, but we encourage you to share your ideas and feedback.

### Features and Functionality

#### How does Sveltia CMS compare to other CMSs?

We don’t directly compare our product to other CMS solutions because each one tries to solve different problems for different target audiences. Within the small Git-based [headless CMS](https://jamstack.org/headless-cms/) category alone, it would be unfair to compare community-driven projects like Sveltia CMS with company-owned offerings that have more resources for development, support and marketing.

The only comparable product is our predecessor, Netlify/Decap CMS, which is the very particular reason why Sveltia CMS exists in the first place. We have a detailed comparison of the two products on the [Successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms) page.

To decide which CMS solution is right for your project, we recommend evaluating your specific needs and requirements, and comparing the features, pricing and support options of different solutions to find the best fit for you.

Visit our [Introduction](https://sveltiacms.app/en/docs/intro), [Features](https://sveltiacms.app/en/features) and [Architecture](https://sveltiacms.app/en/docs/architecture) pages to learn more about the benefits of Sveltia CMS, or explore our [Showcase](https://sveltiacms.app/en/showcase).

#### Is Sveltia CMS framework-agnostic?

Yes. Sveltia CMS is designed to be framework-agnostic. While it’s built with [Svelte](https://svelte.dev/), we only distribute the CMS as a precompiled vanilla JavaScript bundle. There is no Svelte-specific code in the bundle, and it doesn’t require Svelte to run. You can integrate it with [any front-end framework](https://sveltiacms.app/en/docs/frameworks) or library of your choice, or even use it with plain HTML/JavaScript.

However, some [JavaScript API](https://sveltiacms.app/en/docs/api) features require you to use React components for customization. This is because the API derives from React-based Netlify/Decap CMS, and backward compatibility has to be maintained. We’re planning to support other libraries in the future.

#### Does Sveltia CMS support multilingual content?

Yes. Sveltia CMS comes with first-class internationalization (i18n) support, which is even superior to some commercial CMS solutions. You can easily create and manage content in multiple languages. Check out our [i18n documentation](https://sveltiacms.app/en/docs/i18n) for more details on how to set it up.

#### Can I use Sveltia CMS with local repositories?

Yes. Sveltia CMS is a local-first CMS that works seamlessly with local Git repositories. Its [local development workflow](https://sveltiacms.app/en/docs/workflows/local) utilizes the [File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access), allowing you to manage content directly on your local machine without connecting to a remote Git service. This is particularly useful for developers who prefer to make bulk changes locally before pushing them to a remote repository. The CMS can also [commit your changes](https://sveltiacms.app/en/docs/workflows/local#git-commits) to the local repository every time you save.

#### Can I invite multiple users to collaborate on content?

Yes, but with some limitations.

Sveltia CMS does not have built-in user management features at the moment. You need to ask users to create an account with your chosen Git service provider (e.g. GitHub) and invite them to your repository for collaboration. They don’t need to know anything about the service or Git workflow, as Sveltia CMS handles that for them. In the near future, we plan to introduce [built-in user management features](https://sveltiacms.app/en/docs/additions) to simplify collaboration.

When several people edit content at the same time, Sveltia CMS checks the repository when an entry is opened, while it’s being edited and before it’s saved. A change someone else has pushed is noticed and never overwritten without asking. See [Conflict Resolution](https://sveltiacms.app/en/docs/ui/content-editor#conflict-resolution) for details.

### Security and Privacy

#### Does Sveltia CMS have a privacy policy regarding user data?

No. Sveltia CMS does not collect or store any user data, so we don’t have a privacy policy. All content and user information are stored in your Git repository, which you control. See the [Privacy](https://sveltiacms.app/en/docs/privacy) page for more details.

### Support and Troubleshooting

#### Where can I get support for Sveltia CMS?

See the [Support](https://sveltiacms.app/en/support) page for information on how to get help with Sveltia CMS. We offer support through our GitHub repository, where you can report issues, ask questions and share feedback. The maintainer also provides professional support services for users who need more personalized assistance.

#### Where can I report bugs for Sveltia CMS?

See the [Feedback](https://sveltiacms.app/en/feedback) page for information on how to report bugs or request features for Sveltia CMS. We encourage users to report any issues they encounter in our GitHub repository, where we can track and address them effectively. In most cases, we can provide a fix within 8 hours, depending on the complexity of the issue.

#### Do you offer paid support for Sveltia CMS?

Yes. The maintainer offers professional support services for users who need more personalized assistance with Sveltia CMS. This includes help with installation, configuration, customization and troubleshooting. If you’re interested in paid support, please contact us through the [Support](https://sveltiacms.app/en/support) page for more details.

### Technical Questions

#### Why did you choose Svelte for building Sveltia CMS?

[Svelte](https://svelte.dev/) offers several advantages that make it an excellent choice for building Sveltia CMS, including its performance, simplicity and ease of use. Svelte compiles components into highly efficient vanilla JavaScript code, resulting in faster load times and better overall performance compared to traditional frameworks that rely on runtime libraries.

At this point, Sveltia CMS is probably one of the world’s most widely used standalone Svelte applications, demonstrating the capabilities of the modern UI framework. It’s not a SvelteKit application, as we need to maintain its [architecture](https://sveltiacms.app/en/docs/architecture) as a single-file JavaScript bundle to ensure compatibility with Netlify/Decap CMS.

We plan to explore other frameworks in the future, but Svelte is our primary choice for now due to its benefits.

#### Why don’t you use TypeScript for the codebase?

Because TypeScript is hard to read, especially with the [destructuring syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) commonly used in modern JavaScript. The maintainer prefers to write code in [TypeScript-flavored JavaScript](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html), which provides type safety through JSDoc comments without the need for a separate compilation step. It’s cleaner and easier to maintain.

[Svelte](https://devclass.com/2023/05/11/typescript-is-not-worth-it-for-developing-libraries-says-svelte-author-as-team-switches-to-javascript-and-jsdoc/) and [Prism](https://github.com/PrismJS/prism/pull/4000) are two notable projects that have also adopted this approach.

#### Why are some of the configuration options written in camelCase and others in snake_case?

The configuration options in Sveltia CMS are designed to be compatible with the existing Netlify/Decap CMS configuration format, which mostly uses snake_case, with a few camelCase exceptions. To maintain backward compatibility and make it easier for users to migrate from Netlify/Decap CMS to Sveltia CMS, these naming conventions have been retained. The inconsistency is unfortunate, but it’s a trade-off we made for compatibility.

#### Are you using AI agents to develop Sveltia CMS?

We started developing Sveltia CMS before the recent surge in AI agents, so much of the code was written manually. We couldn’t use AI agents anyway because they were unfamiliar with Svelte.

However, due to limited resources and an increasingly complex product, we have adapted our workflow to make extensive use of AI agents. Most tasks are now done by Claude, including implementing new features, fixing bugs, refactoring, generating test cases and writing documentation.

If you find our product useful and would like to support us, please consider [sponsoring the maintainer](https://github.com/sponsors/kyoshino), which would help to cover the monthly cost of the Claude subscription (CA$140). Your support would be greatly appreciated!

Source: https://sveltiacms.app/en/docs/faq
