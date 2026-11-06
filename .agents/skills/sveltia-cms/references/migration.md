# Migration Guides

Migrating from Netlify CMS, Decap CMS, Static CMS or Pages CMS, and upgrading from earlier Sveltia CMS versions.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Migration Guides

This document provides guidance on migrating from other CMS platforms to Sveltia CMS. Specific instructions are provided for Netlify/Decap CMS, Static CMS and Pages CMS.

### Migrating from Other Platforms

Migrating from other CMS platforms to Sveltia CMS can vary in complexity depending on the source CMS. Below are guides for some of the more common platforms.

#### Netlify CMS or Decap CMS

Sveltia CMS is designed to be a direct [successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms) (now Decap CMS). A migration from Netlify/Decap CMS to Sveltia CMS is intended to be as seamless as possible. This guide will walk you through the necessary steps to migrate your existing setup to Sveltia CMS.

- [Migrating from Netlify CMS or Decap CMS](https://sveltiacms.app/en/docs/migration/netlify-decap-cms)

Our [Showcase](https://sveltiacms.app/en/showcase) also features various sites that have been migrated from Netlify CMS and Decap CMS. Check out these examples to see how other users have successfully transitioned to Sveltia CMS.

- [Examples of sites migrated from Netlify CMS](https://sveltiacms.app/en/showcase?migrated-from=netlify-cms)
- [Examples of sites migrated from Decap CMS](https://sveltiacms.app/en/showcase?migrated-from=decap-cms)

#### Static CMS

Static CMS was a community fork of Netlify CMS that introduced several unique features. While we don’t have a full migration guide for Static CMS, many of the concepts and configurations are similar to those in Netlify CMS. We have documented some of the key differences and considerations when migrating from Static CMS to Sveltia CMS.

- [Migrating from Static CMS](https://sveltiacms.app/en/docs/migration/static-cms)
- [Examples of sites migrated from Static CMS](https://sveltiacms.app/en/showcase?migrated-from=static-cms)

#### Pages CMS

Pages CMS was also inspired by Netlify CMS and shares similar concepts and configurations. Sveltia CMS offers more features, flexibility and frequent releases than Pages CMS, but a hosted solution is not yet available.

Our migration guide explains the differences between the two platforms and how to convert a Pages CMS configuration file to the Sveltia CMS format.

- [Migrating from Pages CMS](https://sveltiacms.app/en/docs/migration/pages-cms)
- [Examples of sites migrated from Pages CMS](https://sveltiacms.app/en/showcase?migrated-from=pages-cms)

#### Other Headless CMSs

We’ll continue to expand our migration resources to cover popular headless CMS platforms. If you are using a different CMS and are interested in migrating to Sveltia CMS, check back here for future migration guides or just look at the [Start Guide](https://sveltiacms.app/en/docs/start) to get started.

If your current CMS is Git-based, the migration process should be relatively straightforward. Typically, you will need to configure your Sveltia CMS setup to match your existing content structure.

See our [Showcase](https://sveltiacms.app/en/showcase) for examples of sites that have successfully migrated from other headless CMS platforms to Sveltia CMS.

- [Examples of sites migrated from TinaCMS](https://sveltiacms.app/en/showcase?migrated-from=tinacms)
- [Examples of sites migrated from Keystatic](https://sveltiacms.app/en/showcase?migrated-from=keystatic)
- [Examples of sites migrated from CloudCannon](https://sveltiacms.app/en/showcase?migrated-from=cloudcannon)

#### Traditional CMSs

More and more users are choosing to switch from traditional CMS platforms, especially WordPress, to static sites powered by Sveltia CMS. This approach is often preferred by small site owners and developers because of its cost-effectiveness, performance, flexibility and security benefits.

The migration process involves exporting content as static files, typically in Markdown format, and creating a new site from scratch using your preferred framework. Our [Start Guide](https://sveltiacms.app/en/docs/start) can help you get started with Sveltia CMS.

Our [Showcase](https://sveltiacms.app/en/showcase) also features various sites that have been migrated from WordPress and other platforms, demonstrating the possibilities and benefits of using Sveltia CMS.

- [Examples of sites migrated from WordPress](https://sveltiacms.app/en/showcase?migrated-from=wordpress)
- [Examples of sites migrated from Joomla](https://sveltiacms.app/en/showcase?migrated-from=joomla)
- [Examples of sites migrated from Drupal](https://sveltiacms.app/en/showcase?migrated-from=drupal)
- [Examples of sites migrated from Ghost](https://sveltiacms.app/en/showcase?migrated-from=ghost)

#### Website Builders

Users are also migrating from website builders like Wix and Squarespace to Sveltia CMS. The migration process is similar to that of traditional CMS platforms, involving exporting content and creating a new site with Sveltia CMS.

See our [Showcase](https://sveltiacms.app/en/showcase) for examples of sites that have successfully migrated from these website builders to Sveltia CMS.

- [Examples of sites migrated from Wix](https://sveltiacms.app/en/showcase?migrated-from=wix)
- [Examples of sites migrated from Squarespace](https://sveltiacms.app/en/showcase?migrated-from=squarespace)
- [Examples of sites migrated from GoDaddy Website Builder](https://sveltiacms.app/en/showcase?migrated-from=godaddy)
- [Examples of sites migrated from Google Sites](https://sveltiacms.app/en/showcase?migrated-from=google-sites)
- [Examples of sites migrated from Webflow](https://sveltiacms.app/en/showcase?migrated-from=webflow)
- [Examples of sites migrated from Weebly](https://sveltiacms.app/en/showcase?migrated-from=weebly)

### Migrating from Earlier Versions of Sveltia CMS

See the detailed migration instructions here:

- [Migrating from Earlier Versions of Sveltia CMS](https://sveltiacms.app/en/docs/migration/earlier-versions)

Source: https://sveltiacms.app/en/docs/migration

---

## Migrating from Earlier Versions of Sveltia CMS

This page documents the key changes and deprecations when upgrading from earlier versions of Sveltia CMS.

### Breaking Changes

Check the [release notes](https://github.com/sveltia/sveltia-cms/releases?q=breaking+change&expanded=true) for other changes that may affect your project when upgrading to the latest version of Sveltia CMS.

### Version 0.x to 1.0

We’ll update this section with specific migration steps when we release version 1.0. For now, please refer to the deprecations listed below.

### Deprecations

These options were added to Sveltia CMS 0.x but are now deprecated and will be removed in version 1.0:

- The `automatic_deployments` backend option: Use the new [`skip_ci` option](https://sveltiacms.app/en/docs/deployments#disabling-automatic-deployments) instead, which is more intuitive. `automatic_deployments: false` is equivalent to `skip_ci: true`, and `automatic_deployments: true` is equivalent to `skip_ci: false`.
- The `save_all_locales` i18n option: Use the [`initial_locales` option](https://sveltiacms.app/en/docs/i18n/options#disabling-non-default-locale-content) instead, which provides more flexibility. `save_all_locales: false` is equivalent to `initial_locales: all`.
- The `omit_default_locale_from_filename` i18n option: Use the new `omit_default_locale_from_file_path` i18n option instead, which applies to all multiple files/folders structures, not just `multiple_files`.
- The `multiple_folders_i18n_root` i18n structure: Use the new `multiple_root_folders` i18n structure instead, which has a more intuitive name and the same file structure.
- The `{{fields._slug}}` and `{{fields._slug | localize}}` slug template tags: Use the [`editable` and `i18n` slug options](https://sveltiacms.app/en/docs/collections/entries/slugs#making-slugs-editable) instead. `slug: '{{fields._slug}}'` is equivalent to `slug: { editable: true }`, and `slug: '{{fields._slug | localize}}'` is equivalent to `slug: { editable: true, i18n: true }`.
- The `slug_length` collection option: Use the `maxlength` option in the [global slug options](https://sveltiacms.app/en/docs/collections/entries/slugs#global-slug-options) instead.
- The `yaml_quote` collection option: `yaml_quote: true` is equivalent to `quote: double` in the [new YAML format options](https://sveltiacms.app/en/docs/data-output#controlling-data-output).

The deprecated `logo_url` option will be removed in the future. Use the [new `logo.src` option](https://sveltiacms.app/en/docs/customization#custom-logo) instead.

Source: https://sveltiacms.app/en/docs/migration/earlier-versions

---

## Migrating from Netlify CMS or Decap CMS

Sveltia CMS is designed as a modern [successor to Netlify CMS](https://sveltiacms.app/en/docs/successor-to-netlify-cms) (now Decap CMS). If you are currently using Netlify/Decap CMS, you can migrate to Sveltia CMS to take advantage of its hundreds of improvements across the board, including better performance, a more intuitive user interface, enhanced asset management, improved i18n support and more.

**Stable Version Not Yet Available**

Sveltia CMS is still in beta. Although it’s already being used in production by [many users](https://sveltiacms.app/en/showcase), there might still be breaking changes before the stable 1.0 release. We recommend keeping an eye on the [release information](https://sveltiacms.app/en/docs/releases#release-information) for any updates.

### Examples

Still not sure if Sveltia CMS is the right choice? Check out the following examples of sites that have been migrated from Netlify CMS and Decap CMS to see how other users have successfully transitioned to Sveltia CMS.

- [Examples of sites migrated from Netlify CMS](https://sveltiacms.app/en/showcase?migrated-from=netlify-cms)
- [Examples of sites migrated from Decap CMS](https://sveltiacms.app/en/showcase?migrated-from=decap-cms)

### Compatibility

We have made Sveltia CMS highly compatible with Netlify/Decap CMS, allowing more users to seamlessly switch to our modern successor. In most cases, Sveltia CMS can be used as a drop-in replacement for Netlify/Decap CMS with just a one-line code update.

However, we never planned to achieve 100% feature parity, so some features will not be added due to deprecation and other factors. See the compatibility information below to learn how the site may be affected by the migration.

#### Current Limitations

We no longer have any known limitations in Sveltia CMS, except for some [UI languages](https://sveltiacms.app/en/docs/ui#localization) that are not yet available.

#### Features Not To Be Implemented

The following features will not be implemented in Sveltia CMS due to deprecation and other factors. If you rely on any of these features, you may need to find a workaround or wait until we develop an alternative solution.

##### Deprecated Features

Other than the recently deprecated [`logo_url` option](https://sveltiacms.app/en/docs/customization#custom-logo), we will not support any deprecated features in Netlify/Decap CMS:

- **Git Gateway backend**: Git Gateway has been [deprecated](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/) by Netlify. Due to its performance limitations, we don’t plan to support it anyway. However, we plan to develop a GraphQL-based high-performance alternative [in the future](https://sveltiacms.app/en/docs/roadmap) to provide a migration path for existing Git Gateway users.
- The deprecated client-side implicit grant for the GitLab backend: It has already been [removed from GitLab 15.0](https://gitlab.com/gitlab-org/gitlab/-/issues/344609). Use the [client-side PKCE authorization](https://sveltiacms.app/en/docs/backends/gitlab#pkce-authorization) instead.
- The deprecated Netlify Large Media service: Consider other [media storage providers](https://sveltiacms.app/en/docs/media).
- Deprecated camel case configuration options: Use snake case instead, according to the current Decap CMS document.
  - [Entry Collection](https://sveltiacms.app/en/docs/collections/entries): `sortableFields`
  - [DateTime](https://sveltiacms.app/en/docs/fields/datetime) field: `dateFormat`, `timeFormat`, `pickerUtc`
  - [Markdown](https://sveltiacms.app/en/docs/fields/markdown) field: `editorComponents`
  - [Number](https://sveltiacms.app/en/docs/fields/number) field: `valueType`
  - [Relation](https://sveltiacms.app/en/docs/fields/relation) field: `displayFields`, `searchFields`, `valueField`
  - Note: Some other camel case options, including Color field options, are not deprecated and will continue to work.
- The deprecated Date widget: It was removed from Decap CMS 3.0 and Sveltia CMS 0.10. Use the DateTime field type with the [`type: date` option](https://sveltiacms.app/en/docs/fields/datetime#date-only) instead.
- The deprecated [Uploadcare jQuery File Uploader](https://uploadcare.com/docs/uploads/file-uploader/): Sveltia CMS uses the API for [Uploadcare integration](https://sveltiacms.app/en/docs/media/uploadcare) to solve some issues. Users are prompted to enter their secret key to use the integration. This means the features found in the pre-built widget are currently unavailable. We plan to support some third-party upload sources, camera access and image editing in the future.

##### Miscellaneous Features

The following features will not be implemented in Sveltia CMS due to various reasons:

- **Netlify Identity Widget**: It’s not useful without Git Gateway. We plan to develop an alternative solution with role support [in the future](https://sveltiacms.app/en/docs/roadmap).
  - [Netlify Identity](https://docs.netlify.com/manage/security/secure-access-to-sites/identity/overview/) was [deprecated](https://github.com/sveltia/sveltia-cms/discussions/284) in February 2025, but it has since been revived by Netlify. However, we still don’t plan to support it in Sveltia CMS due to the lack of Git Gateway support.
- **Azure DevOps and Bitbucket backends**: For performance reasons. We’ll support these platforms if their APIs improve to allow the CMS to fetch multiple entries at once. Consider migrating to GitHub, GitLab, Gitea or Forgejo if you’d like to use Sveltia CMS now.
- **Decap Turbo**: It’s a managed hosting service, not a core feature. Some notes:
  - Performance: Sveltia CMS uses the GraphQL API to retrieve multiple files at once, so it’s already fast. Using a proxy is a bad idea!
  - Media library: Sveltia CMS already implements [S3-compatible storage providers](https://sveltiacms.app/en/docs/media#external-storage) as a standard feature.
  - User management, roles and credentials: We plan to implement these features with [Sveltia CMS Additions](https://sveltiacms.app/en/docs/additions), our free server-side component.
  - Deploy status: Sveltia CMS partially implements it as part of [deploy previews](https://sveltiacms.app/en/docs/deployments/previews).
- [Gatsby plugin](https://github.com/decaporg/gatsby-plugin-decap-cms): In light of Gatsby’s [uncertainty](https://github.com/gatsbyjs/gatsby/discussions/39062), we won’t be investing time in developing a plugin for it. Gatsby users can still create `index.html` themselves. Note: We don’t support Netlify Identity Widget; the favicon can be specified with the `logo.src` option.
- Performance-related options: Sveltia CMS has [drastically improved performance](https://sveltiacms.app/en/docs/successor-to-netlify-cms#better-performance) with GraphQL enabled by default, so these are no longer relevant:
  - Global: [`search`](https://decapcms.org/docs/configuration-options/#search)
  - Backend: [`use_graphql`](https://decapcms.org/reference/config/backends/github/#graphql-api)
  - Relation field: `options_length`
- An absolute URL in the [`public_folder`](https://decapcms.org/docs/configuration-options/#public-folder) option: Such configuration is not recommended, as stated in the Netlify/Decap CMS document.
- The new [`media_processing`](https://decapcms.org/docs/configuration-options/#media-processing) option: Sveltia CMS has already implemented a [built-in image optimizer](https://sveltiacms.app/en/docs/media#image-optimization) that supports both raster and SVG images and will be further enhanced. Use that feature instead.
- The theme and keymap inline settings for the Code field, along with support for some languages. Instead of [CodeMirror](https://codemirror.net/), we use Lexical’s code block functionality powered by [Shiki](https://shiki.style/).
- The `allow_multiple` option for the File and Image fields: It’s a confusing option that defaults to `true`, and there is a separate option called `media_library.config.multiple`. We have added the new [`multiple`](https://sveltiacms.app/en/docs/fields/file#multiple) option instead, which is more intuitive and works with all media storage providers.
- Remark plugins for the Markdown field: Not compatible with our Lexical-based rich text editor. The `CMS.registerRemarkPlugin` method is a no-op in Sveltia CMS.
- The `use_secure_url` option for the [Cloudinary media storage](https://sveltiacms.app/en/docs/media/cloudinary): Insecure URLs should never be used.
- Local proxy server: Our [local development workflow](https://sveltiacms.app/en/docs/workflows/local) eliminates the need for a proxy server. For security and performance reasons, we don’t support `netlify-cms-proxy-server` or `decap-server`. The `local_backend` option is ignored.
- The global [`issue_reports`](https://decapcms.org/docs/configuration-options/#issue-reports) option: The Report Issue link in the Help menu always points to the Sveltia CMS issue tracker, and the `url` option is ignored.
- The global [`locale`](https://decapcms.org/docs/configuration-options/#locale) option and `CMS.registerLocale` method: Sveltia CMS automatically detects the user’s preferred language and changes the [UI locale](https://sveltiacms.app/en/docs/ui#localization).
- The [`editor.notes`](https://decapcms.org/docs/notes/) option: Decap CMS stores notes as comments on a GitHub or GitLab issue. We plan to implement a Conversation Panel as part of [Sveltia CMS Additions](https://sveltiacms.app/en/docs/additions#features) instead, and the option is ignored. Any notes saved with Decap CMS will not be loaded.
- The [`editor.visualEditing`](https://decapcms.org/docs/configuration-options/#editor) option: Sveltia CMS has the same [click-to-highlight feature](https://sveltiacms.app/en/docs/successor-to-netlify-cms#better-content-preview) enabled by default, so there is nothing to opt in to. The option is ignored at both the collection and field levels.
- The [`preview_path_preserve_slashes`](https://decapcms.org/docs/configuration-options/#preview_path_preserve_slashes) collection option: Sveltia CMS inserts field values into the [`preview_path`](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) as they are, without making them URL-safe, so slashes are always kept, as if the option were set to `true`. Decap CMS replaces slashes by default, except in nested collections. If your preview paths relied on that, use [string transformations](https://sveltiacms.app/en/docs/string-transformations) to shape the value.

##### Undocumented Features

We don’t implement features not described in the Netlify/Decap CMS documentation.

- [Undocumented methods](https://github.com/sveltia/sveltia-cms/blob/57562472e29c4090506000f7767df5179a450adb/src/lib/services/api/compatibility.js#L15-L35) exposed on the `CMS` object: This includes custom backends and custom media storage providers, if any. We may support these features in the future, but our implementation would likely be incompatible with Netlify/Decap CMS.
- Any other undocumented features and options. Exceptions apply.

#### Other Breaking Changes

There are some differences in behavior between Sveltia CMS and Netlify/Decap CMS that may affect your existing configuration or content.

- [Decap CMS 3.1.1](https://github.com/decaporg/decap-cms/releases/tag/decap-cms%403.1.1) replaced Moment.js with Day.js for date handling, and Sveltia CMS followed suit. Since [Day.js tokens](https://day.js.org/docs/en/display/format) are not 100% compatible with [Moment.js tokens](https://momentjs.com/docs/#/displaying/format/), this could be a breaking change in certain cases. Check your `format`, `date_format` and `time_format` options for DateTime fields, as well as any date formatting in [string transformations](https://sveltiacms.app/en/docs/string-transformations#date).
- By default, Sveltia CMS does not slugify uploaded filenames, as mentioned in the [asset management](https://sveltiacms.app/en/docs/successor-to-netlify-cms#better-asset-management) section. If your site generator expects hyphenated filenames, you can enable the `slugify_filename` [internal media storage option](https://sveltiacms.app/en/docs/media#slugification-of-filenames).
- In some cases, the [data output](https://sveltiacms.app/en/docs/data-output) of Sveltia CMS may differ from that of Netlify/Decap CMS. Notably, Sveltia CMS does not omit empty optional fields by default. If you have data validation in your site generator, this could cause issues. Use the `omit_empty_optional_fields` [output option](https://sveltiacms.app/en/docs/data-output#controlling-data-output) if needed.
- Sveltia CMS requires a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts), meaning it only works with HTTPS, `localhost`, `127.0.0.1` or `[::1]` URLs. If you’re running your own remote server and serving content over HTTP, the CMS will not work. We recommend obtaining a TLS certificate from [Let’s Encrypt](https://letsencrypt.org/).
- In Sveltia CMS, the `sanitize_preview` option for the [Markdown](https://sveltiacms.app/en/docs/fields/markdown) field type is set to `true` by default to prevent potential XSS attacks via entry previews. Decap CMS made the same change in version 3.13.0, so this only affects sites migrating from Netlify CMS or an earlier version of Decap CMS. We recommend keeping this option enabled unless disabling it fixes a broken preview and you fully trust all users of the CMS.
- In Sveltia CMS, the `show_in_header` option for the [custom logo](https://sveltiacms.app/en/docs/customization#custom-logo) defaults to `true`, so the logo appears in the header of the admin interface. In Decap CMS, it’s hidden unless the option is set to `true`. To hide it, set `show_in_header: false` explicitly.
- In Sveltia CMS, the `create` option for [entry collections](https://sveltiacms.app/en/docs/collections/entries) defaults to `true` because, in 99.99% of cases, users want to create new entries and adding `create: true` to every collection is redundant. To disable entry creation, set `create: false` explicitly.
- We provide only one npm package, `@sveltia/cms`, which includes all necessary code, while Netlify/Decap CMS provides [many packages](https://github.com/decaporg/decap-cms/tree/main/packages). This means `import` statement migration is not always straightforward. See the [migration steps](#migration-steps) below for details.

There may be other minor differences in behavior that are not listed here.

Sveltia CMS is also adding various config validation checks to help users identify potential issues, so you may see errors that were not present in Netlify/Decap CMS before. For example, Sveltia CMS raises an error if the `slug` collection option contains slashes (`/`), which is supposed to be invalid.

[Let us know](https://github.com/sveltia/sveltia-cms/issues/new?type=bug) if you encounter any compatibility issues not mentioned above. We want to make the migration process as smooth as possible for our users.

### Migration Steps

#### Preparation

Check the [compatibility info](https://sveltiacms.app/en/docs/migration/netlify-decap-cms#compatibility) above to see if your site can be migrated now or in the near future. If there are no blockers, let’s move on to the migration steps.

##### Updating Configuration

Make necessary changes if needed, such as updating your configuration file.

##### Dealing with Unsupported Features

If you’re using any [features that are not going to be implemented](#features-not-to-be-implemented), you’ll need to find a workaround. For example, if you’re on Azure DevOps or Bitbucket, consider migrating to GitHub, GitLab, Gitea or Forgejo. See the next section if you’re a Git Gateway user.

##### Migrating from Git Gateway Backend

Sveltia CMS does not support the deprecated Git Gateway backend. If you don’t care about user management with Netlify Identity, you can use the [GitHub](https://sveltiacms.app/en/docs/backends/github) or [GitLab](https://sveltiacms.app/en/docs/backends/gitlab) backend instead.

If your site is still deployed to Netlify, the switch is easier than you might think. Netlify can handle the GitHub or GitLab sign-in for you, so you don’t need to install [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) or any other OAuth client. Here are the steps, using GitHub as an example:

1. Register an OAuth app on GitHub and add it to your site in the Netlify dashboard, as explained in the [GitHub backend](https://sveltiacms.app/en/docs/backends/github#using-netlify) documentation. The setting is found under **Project configuration** > **Security** > **OAuth**, not under **Identity**. For GitLab, see the [GitLab backend](https://sveltiacms.app/en/docs/backends/gitlab#using-netlify) documentation instead.
1. Update the `backend` option in your configuration file. Change the `name` to `github` and add the `repo` option with the format `owner/repo`. Remove options that are specific to Git Gateway, such as `identity_url`, `gateway_url` and `use_large_media_transforms_in_media_library`, if any. Don’t add `base_url`, which would point the CMS to another OAuth client instead of Netlify.
   ```diff
    backend:
   -  name: git-gateway
   +  name: github
   +  repo: owner/repo
      branch: main
   ```
1. Remove the Netlify Identity Widget script tag from your HTML, along with any code that uses the `netlifyIdentity` global object, such as a redirect to the admin page after signing in:
   ```diff
   -<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
   ```
1. Deploy the changes and open the CMS. Click **Sign In with GitHub** on the login screen to authenticate.

Note that Netlify Identity users can’t sign in to the CMS with their Identity email and password anymore. Each editor needs their own GitHub account with write access to the repository. To allow other people to edit content, invite them to your GitHub repository as collaborators with the Write role or higher. See the [requirements](https://sveltiacms.app/en/docs/backends/github#requirements) for details.

**Warning**

Changes are now committed with each editor’s own GitHub account. If your repository is private, Netlify’s [Deploy Request Policy](https://docs.netlify.com/deploy/deploy-overview/#deploy-permissions) only builds commits from recognized authors. A deploy triggered by an editor who isn’t a member of your Netlify team may therefore stay pending until a Team Owner approves it. To avoid this, add the editors to your Netlify team as Git Contributors or enable auto-approval for deploy requests.

Once everyone can sign in with GitHub, you can disable Git Gateway and Netlify Identity in the Netlify dashboard if you don’t use them for anything else.

If your site is deployed to a different hosting service, you need to set up an OAuth client yourself or use another authentication method. See the [GitHub backend](https://sveltiacms.app/en/docs/backends/github#authentication) or [GitLab backend](https://sveltiacms.app/en/docs/backends/gitlab#authentication) documentation for the options.

If you want to stay with Git Gateway and Netlify Identity, unfortunately, you can’t migrate to Sveltia CMS right now. We plan to develop an alternative solution [in the future](https://sveltiacms.app/en/docs/roadmap).

#### Switching to Sveltia CMS

Now, it’s time to switch to Sveltia CMS. Depending on how you included Netlify/Decap CMS in your project, follow the appropriate instructions below.

##### Using CDN

Replace the script tag that includes Netlify/Decap CMS with the following Sveltia CMS script tag:

```html
<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

From Netlify CMS:

```diff
-<script src="https://unpkg.com/netlify-cms@^2.0.0/dist/netlify-cms.js"></script>
+<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

From Decap CMS:

```diff
-<script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
+<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
```

Next, let’s [test Sveltia CMS on your local machine](https://sveltiacms.app/en/docs/workflows/local). If everything looks good, push the change to your repository.

You can now open `https://[hostname]/admin/` as usual to start editing. There is even no authentication process if you’re already signed in with a backend on Netlify/Decap CMS because Sveltia CMS uses the auth token stored in the browser. Simple enough!

##### Using Package Manager

Install Sveltia CMS:

```bash [npm]
npm install @sveltia/cms
```

```bash [yarn]
yarn add @sveltia/cms
```

```bash [pnpm]
pnpm add @sveltia/cms
```

```bash [bun]
bun add @sveltia/cms
```

Then, update your import statements accordingly.

From Netlify CMS:

```diff
-import CMS from 'netlify-cms-app'; // or 'netlify-cms'
+import CMS from '@sveltia/cms';
```

From Decap CMS:

```diff
-import CMS from 'decap-cms-app'; // or 'decap-cms'
+import CMS from '@sveltia/cms';
```

That’s it! You have successfully migrated to Sveltia CMS. Enjoy the improved performance and features.

#### Cleaning Up

You can uninstall the old Netlify/Decap CMS packages from your project to keep it clean. The packages vary depending on your setup, so uninstall all relevant ones.

A few notable changes to be aware of:

- The `netlify-cms-locales`/`decap-cms-locales` package and the `CMS.registerLocale` method are no longer needed, as Sveltia CMS automatically detects the user’s preferred language and changes the [UI locale](https://sveltiacms.app/en/docs/ui#localization) accordingly.
- If you were using `netlify-cms-proxy-server`/`decap-server`, you can stop using it and remove it from your setup. Sveltia CMS’s [local workflow](https://sveltiacms.app/en/docs/workflows/local) eliminates the need for a proxy server for improved security, performance and productivity. The `local_backend` option in your configuration file is no longer needed and can be removed. If you had configured a custom port number with the `.env` file, you can remove it as well.
- Sveltia CMS only publishes a single package called `@sveltia/cms`, which includes all necessary code, while Netlify/Decap CMS provides [many packages](https://github.com/decaporg/decap-cms/tree/main/packages). If you were using any other Netlify/Decap CMS packages, you may need to find alternatives or implement the functionality yourself.

#### JSON Schema Setup

For a better DX, we recommend [setting up the JSON schema](https://sveltiacms.app/en/docs/config-basics#validation-and-autocomplete) for the CMS configuration file in your code editor. If you have the YAML extension installed, VS Code may automatically apply the outdated Netlify CMS config schema to `config.yml`. To use the latest Sveltia CMS config schema instead, you need to specify its URL.

#### AI Tools

This documentation site provides an official Agent Skill and `llms.txt` files that you can use with AI agents like GitHub Copilot, Claude and ChatGPT to help them understand Sveltia CMS better. See [Working with AI](https://sveltiacms.app/en/docs/working-with-ai) for details.

#### Authentication

No changes are needed for authentication if you are using the GitHub, GitLab or Gitea/Forgejo backend. Sveltia CMS will use the existing auth tokens stored in the browser.

If you have set up an OAuth application for Netlify/Decap CMS, you can continue using it with Sveltia CMS. There is no need to create a new OAuth app.

**Note for Netlify Customers**

If you currently use Netlify to sign in with GitHub or GitLab and stay on Netlify, no changes are needed. Sveltia CMS works seamlessly with Netlify’s authentication system. However, if you’re moving to a different hosting service, you will need to use a different authentication method. See the [GitHub backend](https://sveltiacms.app/en/docs/backends/github#authentication) or [GitLab backend](https://sveltiacms.app/en/docs/backends/gitlab#authentication) documentation for more details.

#### Content Security Policy (CSP)

Unlike Netlify/Decap CMS, Sveltia CMS does not require the `unsafe-eval` and `unsafe-inline` keywords in the `script-src` CSP directive. However, new CSP rules may be needed depending on your configuration, such as the media storage providers you use. See [setting up Content Security Policy](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more information.

### Other Notable Differences

Some differences between Sveltia CMS and Netlify/Decap CMS may affect your existing configuration or content. Here are some notable ones to be aware of:

#### Terminology

Some features have different names in Sveltia CMS compared to Netlify/Decap CMS. These differences are mostly cosmetic, and the underlying concepts remain the same. There are no changes in functionality.

| Netlify/Decap CMS | Sveltia CMS |
| --- | --- |
| [Media library](https://decapcms.org/docs/configuration-options/#media-library) | [Media storage provider](https://sveltiacms.app/en/docs/media) |
| [Folder collection](https://decapcms.org/docs/collection-folder/) | [Entry collection](https://sveltiacms.app/en/docs/collections/entries) |
| [Nested collection](https://decapcms.org/docs/collection-nested/) | [Nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) |
| [Widget](https://decapcms.org/docs/widgets/) | [Field type](https://sveltiacms.app/en/docs/fields) |
| [Summary string transformation](https://decapcms.org/docs/summary-strings/) | [String transformation](https://sveltiacms.app/en/docs/string-transformations) |

#### Content Editing Experience

Sveltia CMS marks required fields for efficient data entry. This is the opposite of Netlify/Decap CMS, which marks optional fields. This change aims to reduce visual clutter and help users focus on the essential fields that must be filled out.

When [i18n support](https://sveltiacms.app/en/docs/i18n) is enabled, Sveltia CMS requires all locales to have values for required fields. In contrast, Netlify/Decap CMS only enforces this for the default locale. This change ensures that content is complete across all locales. If you rely on the previous behavior, you can set the `required` [field-level configuration](https://sveltiacms.app/en/docs/i18n/options#field-level-configuration) to include only specific locales.

In a collection of [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) with the `meta.path` option, the field that decides where an entry goes works differently. Netlify/Decap CMS asks for the full path of the folder that will hold the entry’s file, typed by hand. Sveltia CMS shows a [Parent Folder](https://sveltiacms.app/en/docs/collections/entries/nested#choosing-a-parent-folder) picker listing the folders that already exist, and names the new entry’s own folder after its slug:

```yaml
# Netlify/Decap CMS: path "products/hardware"
content/pages/products/hardware/_index.md

# Sveltia CMS: parent folder "products", slug "hardware"
content/pages/products/hardware/_index.md
```

The result is the same, but you choose the parent rather than typing the entry’s own folder. Moving an existing entry works the same way in both.

Both sides of that example assume the `meta.path.index_file` option, which gives every entry the same filename. Without it, Netlify/Decap CMS names a new entry’s file from the `title` field, ignoring the collection’s [`slug`](https://sveltiacms.app/en/docs/collections/entries/slugs#defining-entry-slugs) template and `identifier_field`. A collection with no `title` field therefore saves every entry as `untitled`. Sveltia CMS names the file from the slug, as it does in any other collection.

#### Data Output

The data output conventions of Sveltia CMS may differ from those of Netlify/Decap CMS in some cases. See the [data output](https://sveltiacms.app/en/docs/data-output#data-output-conventions) documentation for details.

You don’t need to manually update your existing content — the CMS automatically handles these differences when loading existing content. However, there are two notable differences to be aware of:

- Sveltia CMS does not omit empty optional fields by default. If you have data validation in your framework, this could cause issues. Use the `omit_empty_optional_fields` [output option](https://sveltiacms.app/en/docs/data-output#controlling-data-output) if needed.
- Markdown uses soft line breaks (single line breaks) instead of hard line breaks (escaped line breaks `\`). In your framework, you may need to [enable the appropriate option](https://sveltiacms.app/en/docs/how-tos#rendering-soft-line-breaks-as-hard-line-breaks-in-markdown) to render soft line breaks as hard line breaks.

#### Preview Styles

Sveltia CMS comes with a minimal default preview style to ensure better readability. If you have [custom preview styles](https://sveltiacms.app/en/docs/api/preview-styles) for Netlify/Decap CMS, you could remove them or adapt them to Sveltia CMS, which shows field labels in the preview by default.

Source: https://sveltiacms.app/en/docs/migration/netlify-decap-cms

---

## Migrating from Pages CMS

[Pages CMS](https://pagescms.org/) is a Git-based CMS for static sites that was inspired by Netlify CMS. Its content model is close to that of Sveltia CMS: content is stored as Markdown, YAML, JSON or TOML files in a Git repository, and the content structure is defined in a YAML configuration file. This makes the migration relatively straightforward, as existing content files can be kept as they are in most cases.

This guide explains the differences between the two platforms and how to convert a Pages CMS configuration file to the Sveltia CMS format. It’s based on Pages CMS 2.x.

**Stable Version Not Yet Available**

Sveltia CMS is still in beta. Although it’s already being used in production by [many users](https://sveltiacms.app/en/showcase), there might still be breaking changes before the stable 1.0 release. We recommend keeping an eye on the [release information](https://sveltiacms.app/en/docs/releases#release-information) for any updates.

### Examples

See the following examples of sites that have been migrated from Pages CMS to see how other users have successfully transitioned to Sveltia CMS.

- [Examples of sites migrated from Pages CMS](https://sveltiacms.app/en/showcase?migrated-from=pages-cms)

### Key Differences

#### Architecture

Pages CMS is a Next.js application. Users sign in to the hosted app at [app.pagescms.org](https://app.pagescms.org/) or to a self-hosted instance, which accesses repositories through a GitHub App and keeps a cache in a PostgreSQL database.

Sveltia CMS is a single-page application that runs entirely in the browser and talks to the Git hosting service directly. It’s installed on the site itself, typically at `/admin/`, and there is no hosted app, database or GitHub App to set up. See [Architecture](https://sveltiacms.app/en/docs/architecture) for details.

As a result, the migration involves the following changes:

- **Installation**: Instead of installing a GitHub App, add an `admin/index.html` file to the site. See the [Start Guide](https://sveltiacms.app/en/docs/start#manual-installation).
- **Configuration**: The configuration file is `admin/config.yml` instead of `.pages.yml` at the root of the repository. The structure is different, so it must be converted. See [below](#converting-the-configuration).
- **Authentication**: Users sign in with their GitHub account using an OAuth client or a personal access token. See [GitHub Backend](https://sveltiacms.app/en/docs/backends/github#authentication) for the available methods.
- **Git hosting services**: Pages CMS supports GitHub only, while Sveltia CMS also supports [GitLab](https://sveltiacms.app/en/docs/backends/gitlab), [Gitea and Forgejo](https://sveltiacms.app/en/docs/backends/gitea-forgejo). This gives you the option to move the repository to another service later.

#### Collaborators

Pages CMS allows repository owners to invite collaborators by email, so people without a GitHub account can edit content through the GitHub App. Sveltia CMS doesn’t have an equivalent feature yet, as it requires each user to have an account with write access to the repository on the Git hosting service. Invite your collaborators to the repository on GitHub instead. See [Invite Team Members](https://sveltiacms.app/en/docs/start#invite-team-members).

We plan to support user management and roles with [Sveltia CMS Additions](https://sveltiacms.app/en/docs/additions), our free server-side component.

#### Features Not Available in Sveltia CMS

The following Pages CMS features have no direct equivalent in Sveltia CMS:

- **Branch switching**: Pages CMS reads `.pages.yml` from the branch being edited and lets users switch branches. Sveltia CMS works on the single branch specified with the `branch` [backend option](https://sveltiacms.app/en/docs/backends). The [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) can be used to review changes in separate branches before publishing them.
- **Actions**: Pages CMS can run GitHub Actions workflows from buttons with custom inputs. When automatic deployments are disabled, Sveltia CMS can trigger a deployment with the [Publish Changes](https://sveltiacms.app/en/docs/deployments#manual-deployment-trigger) button. The button sends a `repository_dispatch` event to GitHub Actions, creates a GitLab CI/CD pipeline or calls a webhook. Other workflows and inputs are not supported.
- **Commit identity**: Pages CMS can commit as the GitHub App. Sveltia CMS always commits as the signed-in user.
- **Raw and datagrid editors**: Pages CMS provides a plain text editor for files without fields and a spreadsheet-like editor for CSV files. Sveltia CMS can manage such files with the [`raw` format](https://sveltiacms.app/en/docs/collections/entries/formats#format) and a single [Code](https://sveltiacms.app/en/docs/fields/code) or [Text](https://sveltiacms.app/en/docs/fields/text) field named `body`, but there is no table editor.
- **Random filenames**: The `rename: random` media option is not supported. The `rename: safe` option is supported as `slugify_filename`.
- **Nested sidebar groups**: The `group` content type is not supported. Use [dividers](https://sveltiacms.app/en/docs/collections#dividers) to separate the collection list, or put related files into one [file collection](https://sveltiacms.app/en/docs/collections/files).

On the other hand, Sveltia CMS offers many features that are not available in Pages CMS, including [internationalization](https://sveltiacms.app/en/docs/i18n), [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), [entry previews](https://sveltiacms.app/en/docs/ui/content-editor), [external media storage](https://sveltiacms.app/en/docs/media#external-storage), [image optimization](https://sveltiacms.app/en/docs/media#image-optimization), [local development](https://sveltiacms.app/en/docs/workflows/local) without a server and [GitLab, Gitea and Forgejo](https://sveltiacms.app/en/docs/backends) support. See [Features](https://sveltiacms.app/en/features) for the full list.

### Converting the Configuration

Pages CMS and Sveltia CMS use different option names, but most of the concepts map directly to each other. This section lists the equivalents. You can also ask your AI assistant to convert the `.pages.yml` file using this guide; see [Working with AI](https://sveltiacms.app/en/docs/working-with-ai) for tools that help it write a valid configuration.

#### Example

Here is a typical Pages CMS configuration:

```yaml
media:
  input: public/images
  output: /images
content:
  - name: posts
    label: Posts
    type: collection
    path: content/posts
    filename: '{year}-{month}-{day}-{primary}.md'
    view:
      fields: [title, date]
      sort: [date, title]
      default: { sort: date, order: desc }
    fields:
      - { name: title, label: Title, type: string, required: true }
      - { name: date, label: Date, type: date }
      - { name: draft, label: Draft, type: boolean }
      - { name: tags, label: Tags, type: string, list: true }
      - { name: cover, label: Cover Image, type: image }
      - { name: body, label: Body, type: rich-text }
  - name: settings
    label: Site Settings
    type: file
    path: data/settings.json
    fields:
      - { name: title, label: Site Title, type: string }
      - { name: description, label: Description, type: text }
```

And here is the equivalent Sveltia CMS configuration:

```yaml
backend:
  name: github
  repo: owner/repo
  branch: main
media_folder: /public/images
public_folder: /images
collections:
  - name: posts
    label: Posts
    folder: /content/posts
    slug: '{{year}}-{{month}}-{{day}}-{{slug}}'
    table_columns: [title, date]
    sortable_fields:
      fields: [date, title]
      default: { field: date, direction: descending }
    fields:
      - { name: title, label: Title }
      - {
          name: date,
          label: Date,
          widget: datetime,
          type: date,
          default: '{{now}}',
          required: false,
        }
      - { name: draft, label: Draft, widget: boolean, required: false }
      - { name: tags, label: Tags, widget: list, required: false }
      - { name: cover, label: Cover Image, widget: image, required: false }
      - { name: body, label: Body, widget: richtext, required: false }
  - name: settings
    label: Site Settings
    files:
      - name: settings
        label: Site Settings
        file: /data/settings.json
        fields:
          - { name: title, label: Site Title, required: false }
          - { name: description, label: Description, widget: text, required: false }
```

Note the following differences:

- The `backend` option is required to tell Sveltia CMS where the content is stored.
- Paths can start with a slash, and entry filenames are defined with the `slug` option without the extension.
- The `type` field option becomes `widget`, which defaults to `string`.
- Fields are required by default in Sveltia CMS, while they are optional in Pages CMS. Add `required: false` to fields that were not `required: true`.

#### Media

The `media` option is converted as follows. See [Internal Media Storage](https://sveltiacms.app/en/docs/media/internal) for details.

| Pages CMS | Sveltia CMS |
| --- | --- |
| `media: media` (string) | `media_folder: /media` and `public_folder: /media` |
| `input` | `media_folder` |
| `output` | `public_folder` |
| `extensions`, `categories` | The [`accept`](https://sveltiacms.app/en/docs/fields/file#accept) option of each File/Image field, e.g. `accept: .pdf,.docx` or `image/*` |
| `rename: true` or `rename: safe` | `slugify_filename: true` under [`media_libraries.default.config`](https://sveltiacms.app/en/docs/media#slugification-of-filenames) |
| `rename: random` | Not supported |
| Multiple named media sources | [Asset collections](https://sveltiacms.app/en/docs/media/internal#asset-collections) |
| `media` and `path` options of a field | [Field-level `media_folder` and `public_folder`](https://sveltiacms.app/en/docs/media/internal#field-level-configuration) |

#### Content Types

A Pages CMS `collection` is an [entry collection](https://sveltiacms.app/en/docs/collections/entries), and a `file` is a file in a [file collection](https://sveltiacms.app/en/docs/collections/files) or a [singleton](https://sveltiacms.app/en/docs/collections/singletons). Singletons are a good fit if your Pages CMS configuration has many standalone files.

| Pages CMS | Sveltia CMS |
| --- | --- |
| `name`, `label` | `name`, `label` |
| `path` (collection) | `folder` |
| `path` (file) | `file` in a `files` item |
| `filename` | [`slug`](https://sveltiacms.app/en/docs/collections/entries/slugs#defining-entry-slugs) for the template, plus [`extension`](https://sveltiacms.app/en/docs/collections/entries/formats#extension) |
| `filename.field: false` | `slug.editable: false` |
| `filename.field: create` | `slug.editable: [create]` |
| `filename.field: true` | `slug.editable: true` (default) |
| `format` | [`format`](https://sveltiacms.app/en/docs/collections/entries/formats#format). The values `yaml-frontmatter`, `json-frontmatter`, `toml-frontmatter`, `yaml`, `json`, `toml` and `raw` are the same. Use `raw` for `code` and `datagrid` |
| `delimiters` | [`frontmatter_delimiter`](https://sveltiacms.app/en/docs/collections/entries/formats#front-matter-delimiter) |
| `subfolders: true` | [Nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) or the [`path`](https://sveltiacms.app/en/docs/collections/entries/slugs#using-subfolders) option |
| `list: true` on a file | A [top-level List field](https://sveltiacms.app/en/docs/fields/list#top-level-list), or a [single-file collection](https://sveltiacms.app/en/docs/collections/entries/single-file) for a JSON file |
| `exclude` | No filename-based option. Use [`filter`](https://sveltiacms.app/en/docs/collections/entries/listings#filtering-entries) to filter entries by field value |
| `operations.create`, `operations.delete` | [`create`, `delete`](https://sveltiacms.app/en/docs/collections/entries/operations#disabling-creation-and-deletion) |
| `operations.rename` | `slug.editable` |
| `group` | Not supported. See [above](#features-not-available-in-sveltia-cms) |

##### Filename Templates

The `filename` template tags are converted to `slug` template tags as follows:

| Pages CMS | Sveltia CMS |
| --- | --- |
| `{primary}`, `{slug}` | `{{slug}}`, which uses the `title` field or the field specified with [`identifier_field`](https://sveltiacms.app/en/docs/collections/entries/slugs#specifying-an-identifier-field). Pages CMS falls back to the first field if there is no `title` field, so set `identifier_field` in that case |
| `{year}`, `{month}`, `{day}`, `{hour}`, `{minute}`, `{second}` | `{{year}}`, `{{month}}`, `{{day}}`, `{{hour}}`, `{{minute}}`, `{{second}}` |
| `{fields.name}`, `{name}` | `{{fields.name}}`, `{{name}}` |

The file extension is not part of the template. For example, `filename: '{year}-{month}-{day}-{primary}.md'` becomes `slug: '{{year}}-{{month}}-{{day}}-{{slug}}'`, and the `md` extension is used by default.

Pages CMS uses the default filename `{year}-{month}-{day}-{primary}.md` when the option is omitted, while Sveltia CMS uses `{{slug}}`. Set the `slug` option explicitly to keep the same naming convention for new entries.

The date and time tags use the local time in Pages CMS and UTC in Sveltia CMS by default. Set the `timezone` [global slug option](https://sveltiacms.app/en/docs/collections/entries/slugs#global-slug-options) to `local` to use the local time.

Pages CMS converts field values in filenames to lowercase ASCII letters, numbers and hyphens, while Sveltia CMS keeps Unicode characters by default. Set the `encoding` global slug option to `ascii` and `clean_accents` to `true` for similar filenames.

##### Views

The `view` options are converted as follows. See [Entry Listings](https://sveltiacms.app/en/docs/collections/entries/listings) and [Entry Views](https://sveltiacms.app/en/docs/collections/entries/views) for details.

| Pages CMS | Sveltia CMS |
| --- | --- |
| `view.primary` | [`identifier_field`](https://sveltiacms.app/en/docs/collections/entries/slugs#specifying-an-identifier-field) |
| `view.fields` | [`table_columns`](https://sveltiacms.app/en/docs/collections/entries/views#choosing-columns), e.g. `[title, date]`, for the columns of the table view, the default view of the entry list. A column can also be a template like `'{{locales}}'`. For the list view, which shows a single line per entry, a [`summary`](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) template like `'{{title}} ({{date}})'` can combine the fields as well |
| `view.sort` | [`sortable_fields`](https://sveltiacms.app/en/docs/collections/entries/views#sorting) |
| `view.default.sort`, `view.default.order` | `sortable_fields.default.field`, `sortable_fields.default.direction` (`ascending` or `descending`) |
| `view.search` | Not needed, as all entries are searchable |
| `view.layout: tree`, `view.node` | [Nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) |

#### Fields

The common field options are converted as follows. See [Fields](https://sveltiacms.app/en/docs/fields#common-options) for details.

| Pages CMS | Sveltia CMS |
| --- | --- |
| `name`, `label` | `name`, `label` |
| `type` | [`widget`](https://sveltiacms.app/en/docs/fields#widget) |
| `description` | [`hint`](https://sveltiacms.app/en/docs/fields#hint) |
| `required` (default: `false`) | [`required`](https://sveltiacms.app/en/docs/fields#required) (default: `true`) |
| `readonly` | [`readonly`](https://sveltiacms.app/en/docs/fields#readonly) |
| `pattern: '^[a-z]+$'` | `pattern: ['^[a-z]+$', 'Error message']`. See [`pattern`](https://sveltiacms.app/en/docs/fields#pattern) |
| `pattern: { regex, message }` | `pattern: [regex, message]` |
| `hidden: true` | `widget: hidden` with a `default` value. See [Hidden](https://sveltiacms.app/en/docs/fields/hidden) |
| `default` | `default` |
| `list: true` | A [List](https://sveltiacms.app/en/docs/fields/list) field. See [below](#lists) |
| `component` | YAML [anchors and aliases](https://sveltiacms.app/en/docs/config-basics#anchors-and-aliases). See [below](#components) |

The field types are converted as follows:

| Pages CMS | Sveltia CMS |
| --- | --- |
| `string` | [`string`](https://sveltiacms.app/en/docs/fields/string) (default) |
| `text` | [`text`](https://sveltiacms.app/en/docs/fields/text) |
| `rich-text` | [`richtext`](https://sveltiacms.app/en/docs/fields/richtext) |
| `code` | [`code`](https://sveltiacms.app/en/docs/fields/code) |
| `number` | [`number`](https://sveltiacms.app/en/docs/fields/number) |
| `boolean` | [`boolean`](https://sveltiacms.app/en/docs/fields/boolean) |
| `date` | [`datetime`](https://sveltiacms.app/en/docs/fields/datetime) |
| `select` | [`select`](https://sveltiacms.app/en/docs/fields/select) |
| `reference` | [`relation`](https://sveltiacms.app/en/docs/fields/relation) |
| `image` | [`image`](https://sveltiacms.app/en/docs/fields/image) |
| `file` | [`file`](https://sveltiacms.app/en/docs/fields/file) |
| `object` | [`object`](https://sveltiacms.app/en/docs/fields/object) |
| `block` | [`list`](https://sveltiacms.app/en/docs/fields/list#variable-type) or [`object`](https://sveltiacms.app/en/docs/fields/object#variable-type) with the `types` option |
| `uuid` | [`uuid`](https://sveltiacms.app/en/docs/fields/uuid) |
| Custom field types | [Custom field types](https://sveltiacms.app/en/docs/api/field-types) |

The `minlength`, `maxlength`, `min`, `max` and `step` options work the same way where supported. Other type-specific options are described below.

##### Code

The Code field in Sveltia CMS saves an object containing the code and the language by default. To save the code as a plain string, as in Pages CMS, set `output_code_only: true`. The `options.format` option becomes `default_language`.

```yaml
- name: snippet
  label: Snippet
  widget: code
  default_language: javascript
  output_code_only: true
  allow_language_selection: false
```

##### Rich Text

The `options.format` option becomes [`format`](https://sveltiacms.app/en/docs/fields/richtext#format). If a field has `options.format: html`, set `format: html` to keep saving HTML. Images are saved as `<img>` elements, as in Pages CMS.

```yaml
- name: body
  label: Body
  widget: richtext
  format: html
```

##### Number

The Number field in Sveltia CMS accepts integers only by default. Set `value_type: float` to allow decimal numbers.

##### Date

The `date` field type is converted to the DateTime field type:

- Without `options.time`, add `type: date`. The value is saved as `YYYY-MM-DD`, as in Pages CMS.
- With `options.time: true`, the value is saved in ISO 8601 format with seconds, such as `2025-08-15T14:30:00`. Pages CMS saves `2025-08-15T14:30` by default. Use the `format` option if your site needs the same format.
- The `options.format` option becomes `format`, but Pages CMS uses [date-fns tokens](https://date-fns.org/docs/format) while Sveltia CMS uses [Day.js tokens](https://day.js.org/docs/en/display/format). For example, `yyyy-MM-dd'T'HH:mm` becomes `YYYY-MM-DD[T]HH:mm`.
- Pages CMS sets new entries to the current date by default. Add `default: '{{now}}'` to do the same.

```yaml
- name: date
  label: Date
  widget: datetime
  type: date
  default: '{{now}}'
```

##### Select

The `options.values` option becomes `options`. Objects with `name` and `label` properties become objects with `value` and `label` properties. The `multiple`, `min` and `max` options work the same way. The `placeholder` option is not supported.

```yaml
- name: status
  label: Status
  widget: select
  options:
    - { label: Draft, value: draft }
    - { label: Published, value: published }
```

##### Reference

The `reference` field type is converted to the Relation field type:

| Pages CMS | Sveltia CMS |
| --- | --- |
| `options.collection` | [`collection`](https://sveltiacms.app/en/docs/fields/relation#collection) |
| `options.value` | [`value_field`](https://sveltiacms.app/en/docs/fields/relation#value-field) |
| `options.label` | [`display_fields`](https://sveltiacms.app/en/docs/fields/relation#display-fields) |
| `options.search` | [`search_fields`](https://sveltiacms.app/en/docs/fields/relation#search-fields), as an array |
| `options.multiple`, `options.min`, `options.max` | `multiple`, `min`, `max` |

The template tags are similar, but they are enclosed in double curly braces, e.g. `{{fields.name}}`.

Pages CMS saves the full path of the referenced file by default, such as `content/authors/jane.md`, while Sveltia CMS saves the entry slug, such as `jane`. If your existing content contains file paths, set `value_field` to a field that has the same value, or update the content to use slugs. The `{primary}` tag becomes the name of the identifier field, e.g. `{{title}}`.

##### Image and File

The `options.multiple` option becomes `multiple`, and `options.multiple.max` becomes `max`. The `options.extensions` and `options.categories` options become the `accept` option, e.g. `accept: .pdf` or `accept: image/*`. The `options.media` and `options.path` options become [field-level `media_folder` and `public_folder`](https://sveltiacms.app/en/docs/media/internal#field-level-configuration).

##### UUID

The `options.editable: true` option becomes `readonly: false`, as the UUID field is read-only by default.

##### Lists

A field with `list: true` becomes a List field. For a list of strings, use a List field without subfields. For a list of other types, specify the subfield with the `field` option. The `list.min` and `list.max` options become `min` and `max`.

```yaml
# Pages CMS
- { name: tags, label: Tags, type: string, list: true }
- { name: photos, label: Photos, type: image, list: { max: 10 } }
- name: links
  label: Links
  type: object
  list: { collapsible: { collapsed: true, summary: '{fields.title}' } }
  fields:
    - { name: title, label: Title, type: string }
    - { name: url, label: URL, type: string }

# Sveltia CMS
- { name: tags, label: Tags, widget: list }
- name: photos
  label: Photos
  widget: list
  max: 10
  field: { name: photo, label: Photo, widget: image }
- name: links
  label: Links
  widget: list
  collapsed: true
  summary: '{{title}}'
  fields:
    - { name: title, label: Title }
    - { name: url, label: URL }
```

Note that a List field with the `fields` option, like `links` above, is an object list. See the [List field](https://sveltiacms.app/en/docs/fields/list) documentation for the data output of each configuration.

##### Blocks

A `block` field with `list: true` becomes a List field with the `types` option. Each block becomes a type. The property that stores the block name is `_block` by default in Pages CMS and `type` in Sveltia CMS, so set the `typeKey` option to `_block`, or to the `blockKey` value if you have customized it.

```yaml
# Pages CMS
- name: sections
  label: Sections
  type: block
  list: true
  blocks:
    - name: hero
      label: Hero
      fields:
        - { name: heading, type: string }
    - name: text
      label: Text
      fields:
        - { name: body, type: rich-text }

# Sveltia CMS
- name: sections
  label: Sections
  widget: list
  typeKey: _block
  types:
    - name: hero
      label: Hero
      fields:
        - { name: heading, label: Heading }
    - name: text
      label: Text
      fields:
        - { name: body, label: Body, widget: richtext }
```

A `block` field without `list: true` becomes an Object field with the `types` option.

##### Components

Sveltia CMS doesn’t have a `components` option, but YAML anchors and aliases can be used to reuse field definitions. Define a field with an anchor (`&name`) once, then reference it with an alias (`*name`). The merge key (`<<`) allows you to override some options, like the `component` option in Pages CMS.

```yaml
collections:
  - name: pages
    label: Pages
    folder: /content/pages
    fields:
      - &seo
        name: seo
        label: SEO
        widget: object
        fields:
          - { name: title, label: Title }
          - { name: description, label: Description, widget: text }
  - name: posts
    label: Posts
    folder: /content/posts
    fields:
      - <<: *seo
        label: Meta
```

#### Settings

| Pages CMS | Sveltia CMS |
| --- | --- |
| `settings.content.merge` | Not needed. Sveltia CMS always keeps the properties that are not defined in the configuration, placing them after the configured fields. |
| `settings.commit.templates` | [`commit_messages`](https://sveltiacms.app/en/docs/backends#commit-messages) backend option. The template tags are different, e.g. `{{collection}}`, `{{slug}}` and `{{path}}` |
| `settings.commit.identity` | Not supported. Commits are always made by the signed-in user |
| `settings.hide` | Not needed, as there is no settings page |

### Migration Steps

1. Review the [key differences](#key-differences) above to make sure there are no blockers.
2. Follow the [Start Guide](https://sveltiacms.app/en/docs/start) to add Sveltia CMS to your site, including the `admin/index.html` file and the [backend configuration](https://sveltiacms.app/en/docs/backends/github).
3. Convert `.pages.yml` to `admin/config.yml` using the [mapping](#converting-the-configuration) above. Enable [JSON schema validation](https://sveltiacms.app/en/docs/config-basics#json-schema) in your code editor to catch mistakes early.
4. Test the configuration with the [local development workflow](https://sveltiacms.app/en/docs/workflows/local). Open some existing entries and save them to make sure the data output is unchanged, as there might be differences in formatting. Use the [output options](https://sveltiacms.app/en/docs/data-output#controlling-data-output) to adjust the output if needed.
5. Deploy the site and [set up authentication](https://sveltiacms.app/en/docs/backends/github#authentication) for production.
6. Invite your Pages CMS collaborators to the GitHub repository and share the admin URL with them.
7. Once everything works as expected, delete `.pages.yml` from the repository and uninstall the Pages CMS GitHub App from your account or organization.

If you encounter any issues during the migration, feel free to ask in our [Discussions](https://github.com/sveltia/sveltia-cms/discussions) or [report a bug](https://github.com/sveltia/sveltia-cms/issues/new?type=bug).

Source: https://sveltiacms.app/en/docs/migration/pages-cms

---

## Migrating from Static CMS

Sveltia CMS is partially compatible with [Static CMS](https://github.com/StaticJsCMS/static-cms), an archived fork of Netlify CMS. As Static CMS was archived some time ago, we don’t intend to implement any further compatibility beyond what is listed below. However, we may still adopt some of their features that we find useful.

### Compatibility

Static CMS made [some breaking changes](https://staticjscms.netlify.app/docs/decap-migration-guide) while Sveltia CMS mostly follows Netlify/Decap CMS, so the configuration should be reviewed carefully.

#### Configuration Options

- Sveltia CMS supports the [`sortable_fields`](https://sveltiacms.app/en/docs/collections/entries/views#sorting), [`view_filters`](https://sveltiacms.app/en/docs/collections/entries/views#filtering) and [`view_groups`](https://sveltiacms.app/en/docs/collections/entries/views#grouping) options with the new `default` option. We still support the legacy Netlify/Decap CMS format as well, so you can use either format for these options.
- The `summary_fields` option is supported as an alias of [`table_columns`](https://sveltiacms.app/en/docs/collections/entries/views#choosing-columns), which chooses the columns of the entry list’s table view. As in Static CMS, `summary` stands for the entry summary. Sveltia CMS’s own `table_columns` option also accepts custom column labels and templates like `{{locales}}`.
- Directory navigation is supported in the Asset Library and the Select File/Image dialog. If you define [collection-specific `media_folder`s](https://sveltiacms.app/en/docs/media/internal#collection-level-configuration), these folders are displayed as separate locations. The [subfolders](https://sveltiacms.app/en/docs/ui/asset-library#subfolders) within a configured folder are listed and can be browsed in both places. They can be created from either, and renamed or deleted in the Asset Library. Folders are enabled by default, so the `folder_support` option for `media_library` is not supported, nor is the `display_in_navigation` option.
- The `logo_link` global option will not be supported. Use `display_url` or `site_url` instead.
- The `yaml` global option will not be supported, as Sveltia CMS does not expose underlying `yaml` library options for forward compatibility reasons. However, we do have some [data output options](https://sveltiacms.app/en/docs/data-output#controlling-data-output), including YAML indentation and quotes.

#### I18n Support

- The `enforce_required_non_default` i18n option will not be supported. Sveltia CMS enforces required fields in all locales by default. However, the `initial_locales` i18n option allows users to [disable non-default locales](https://sveltiacms.app/en/docs/i18n/options#disabling-non-default-locale-content) if needed. Developers can also specify a subset of locales with the `required` field option, e.g. `required: [en]`.

#### Widgets

- The date/time format options for the DateTime field are **not compatible** since Static CMS [switched to date-fns](https://staticjscms.netlify.app/docs/decap-migration-guide#dates) while Decap CMS and Sveltia CMS have replaced Moment.js with Day.js. Update your formats accordingly.
- The [KeyValue field](https://sveltiacms.app/en/docs/fields/keyvalue) is implemented in Sveltia CMS with the same options.
- The [UUID field](https://sveltiacms.app/en/docs/fields/uuid) is also implemented, but with different options.
- The `prefix` and `suffix` options for the Boolean, Number and String fields are implemented as `before_input` and `after_input` in Sveltia CMS, respectively. Our `prefix` and `suffix` options for the String field are literally a prefix and suffix to the value.
- The `multiple` option for the File and Image fields is supported in Sveltia CMS, along with the `min` and `max` options.
- The [`select_folder`](https://sveltiacms.app/en/docs/fields/file#select-folder) option for the File field is supported in Sveltia CMS. The public path of the selected folder is saved as the value, and several folders can be selected with the `multiple` option.
- The [breaking change to the List widget](https://staticjscms.netlify.app/docs/decap-migration-guide#list-widget) doesn’t apply to Sveltia CMS. You must use the `field` (singular) option to produce a single subfield with [no `name` output](https://sveltiacms.app/en/docs/data-output#understanding-exceptions).

#### Customization

- `CMS.registerAdditionalLink()` is not supported. Use [`CMS.registerCustomPage()`](https://sveltiacms.app/en/docs/api/custom-pages#migrating-from-static-cms) instead, which supports React components, embedded web pages and links.
- `CMS.registerIcon()` will not be supported, as Sveltia CMS includes the Material Symbols font for [custom collection icons](https://sveltiacms.app/en/docs/collections#icons) that doesn’t require manual registration.

Source: https://sveltiacms.app/en/docs/migration/static-cms
