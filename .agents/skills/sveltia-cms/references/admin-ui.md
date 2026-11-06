# Admin User Interface

The content library, content editor and asset library that editors work in, plus UI customization and localization.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## User Interface Overview

This section provides an overview of the application user interface (UI) of Sveltia CMS. It covers the main features and components of the UI, including navigation, content editing, asset management and customization options.

![The Sveltia CMS interface, with the global navigation bar at the top, the collection list on the left and a list of blog posts on the right](/images/landing/entry-list-light.webp?20261016)
![The Sveltia CMS interface, with the global navigation bar at the top, the collection list on the left and a list of blog posts on the right](/images/landing/entry-list-dark.webp?20261016)

### Accessing the Admin UI

The Sveltia CMS admin user interface is accessed by navigating to the URL where the `index.html` file in the static files folder is deployed. For example, if the site is deployed to `https://example.com` and Sveltia CMS is placed in the `admin` folder, it is available at `https://example.com/admin/`.

### Main Components

#### Login Screen

The login screen allows users to authenticate with the configured backend using the regular OAuth flow or an access token. See each [backend documentation](https://sveltiacms.app/en/docs/backends) for more details on authentication methods.

When working locally, the [local workflow](https://sveltiacms.app/en/docs/workflows/local) option is also available, allowing users to select a local folder for storing content.

Users can sign in using the OAuth flow even locally. The OAuth client should allow `http://localhost` as a valid redirect URI for this to work.

#### Navigation

The Sveltia CMS UI features a global navigation bar at the top of the screen, providing easy access to key sections of the application listed below. It also includes a user menu for account settings and preferences.

There is also the Quick Add button (`+` icon) in the navigation bar, which allows users to quickly create a new entry or upload new assets from anywhere in the CMS.

#### Main Pages

The Sveltia CMS UI consists of several main pages:

- [Content Library](https://sveltiacms.app/en/docs/ui/content-library): Manage and organize content entries.
- [Content Editor](https://sveltiacms.app/en/docs/ui/content-editor): Create and edit content entries.
- [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library): Manage and upload media assets.
- [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial#editorial-workflow-page): Manage entries before they are published or deleted. This page only appears when the advanced workflow is enabled.

#### Account Menu

The account menu is accessible from the user avatar in the navigation bar. It provides access to:

- A link to the user’s profile page (if supported by the backend).
- A link to the live site. It points to the [`display_url`](https://sveltiacms.app/en/docs/customization#display-url) or [`site_url`](https://sveltiacms.app/en/docs/customization#site-url) configuration option value, in that order of precedence.
- User Settings, including appearance, language, Content Editor preferences and Developer Mode.
- Keyboard shortcuts reference.
- Sign In with Mobile option, which shows a QR code for passwordless sign-in on mobile devices.
- Sign Out option to log out of the CMS.

#### Settings Dialog

Users can personalize the application with various settings, including appearance and language. Developer Mode can also be enabled in the Developer tab, which enables certain features and displays the CMS version number. When [working with a local repository](https://sveltiacms.app/en/docs/workflows/local), the Developer tab also lets you turn on [Git commits](https://sveltiacms.app/en/docs/workflows/local#git-commits).

The Data Management tab has a Clear Data section:

- **Clear File Cache** deletes the locally cached file contents and image thumbnails.
- **Erase All Data** removes everything the CMS keeps in the user’s browser, including unsaved drafts, settings and the sign-in state.

Neither affects anything already saved to the repository.

### General Features

Content editing in Sveltia CMS is designed to be intuitive and efficient. Key features include:

#### Themes

Users can switch between light and dark themes in the CMS interface. The theme setting is **Automatic** by default, meaning the CMS follows the system’s light or dark appearance and switches with it right away. Users can pick Dark or Light at any time in the application settings.

More appearance options may be added in future releases.

#### Localization

The CMS interface is available in various languages. The language setting is **Automatic** by default, meaning the CMS follows the language set in the browser — and switches as soon as it changes, without a page reload. Users can pick a specific language at any time in the application settings, and the CMS will remember the choice for future sessions.

Currently, the following languages are available:

<div class="list-columns">

- Arabic
- Bulgarian
- Catalan
- Chinese (China)
- Chinese (Taiwan)
- Croatian
- Czech
- Danish
- Dutch
- English (Canada)
- English (South Africa)
- English (UK)
- English (US)
- Finnish
- French
- German
- Greek
- Hebrew
- Italian
- Japanese
- Korean
- Persian
- Polish
- Portuguese (Brazil)
- Portuguese (Portugal)
- Russian
- Slovak
- Spanish (Colombia)
- Swedish
- Turkish
- Ukrainian
- Vietnamese

</div>

If a user has picked a specific language and the browser’s language later becomes available, the CMS will prompt the user to switch to it. The prompt doesn’t appear on the Automatic setting, which already follows the browser. If the user dismisses it, they can still change the language in the application settings.

**Compatibility Note**

The following languages are available in Decap CMS but not yet available in Sveltia CMS:

<div class="list-columns">

- [Hungarian](https://github.com/sveltia/sveltia-cms/issues/315)
- Lithuanian
- Macedonian
- Norwegian Bokmål
- Norwegian Nynorsk
- [Romanian](https://github.com/sveltia/sveltia-cms/issues/711)
- Serbian (Cyrillic)
- Slovenian
- [Spanish (Spain)](https://github.com/sveltia/sveltia-cms/issues/281)
- Thai

</div>

Unlike Netlify CMS and Decap CMS, Sveltia CMS does not require developers to configure the app UI locale. The CMS automatically detects and applies the user’s preferred language based on their browser settings. The `CMS.registerLocale` API method is a no-op and the `locale` configuration option is ignored in Sveltia CMS.

**CSP Consideration**

If the site uses a strict Content Security Policy (CSP), you may need to add the `connect-src` directive with the value `https://unpkg.com` to the CSP header. This allows the CMS to retrieve locale files for the admin interface other than English (US). See the [Setting up Content Security Policy](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) section for more details.

**Localizers Wanted**

Interested in contributing to Sveltia CMS localization? We welcome contributions from the community! Contributors can help translate the CMS interface into their language. Check out the [localization guide](https://github.com/sveltia/sveltia-cms/blob/main/src/lib/locales/README.md) for instructions on how to get started.

#### Keyboard Shortcuts

The following keyboard shortcuts are available in the Sveltia CMS UI:

- View the Content Library: `Alt+1`
- View the Asset Library: `Alt+2`
- Search for entries and assets: `Ctrl+F` (Windows/Linux) or `Command+F` (macOS)
- Create a new entry: `Ctrl+E` (Windows/Linux) or `Command+E` (macOS)

Shortcuts are ignored while text is being composed with an input method editor (IME), so pressing Enter or Escape to confirm or cancel a conversion doesn’t trigger them.

On macOS, holding the Option key in a text field types a special character. So `Alt` shortcuts like `Alt+1` don’t work while a text field has focus.

#### Mobile Support

The Sveltia CMS UI is fully responsive and optimized for mobile devices, providing a seamless experience across different screen sizes, including smartphones and tablets.

When a user opens the CMS for the first time on desktop, it shows a notification suggesting that they try it on mobile for the best experience, along with a QR code for passwordless sign-in. The user’s settings are automatically copied when they sign in via the QR code.

If the user dismisses the notification, the mobile login option will still be available in the user menu.

#### Installing as an App

Sveltia CMS is a [progressive web app](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) (PWA), which means users can [install it](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Installing) on their device and use it like a native application. Offline support is not available yet, but it will be added in a future release.

The application logo and title can be [customized](https://sveltiacms.app/en/docs/customization) with the `logo` and `app_title` configuration options. The default title is “Sveltia CMS”.

**CSP Consideration**

If the site uses a strict Content Security Policy (CSP), you may need to add the `manifest-src` directive with the value `blob:` to the CSP header. This allows the CMS to be installed as an app. See the [Setting up Content Security Policy](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) section for more details.

#### Developer Mode

Developer Mode can be enabled in the Developer tab of the Settings dialog. When enabled, it provides additional features useful for developers, such as:

- Displays the Help menu in the navigation bar, including a link to the release notes with the current CMS version number.
- Additional debugging information in the browser console.
- The browser’s native context menu.

### Accessibility

Sveltia CMS is built with accessibility as a core principle, ensuring all users can effectively navigate and use the application.

We have conducted an automated [WCAG 2.2](https://w3c.github.io/wcag/guidelines/22/) self-audit. We’ll continue to test and improve the application for accessibility, and we welcome feedback from users. If you encounter any accessibility issues, please report them by [creating an issue](https://github.com/sveltia/sveltia-cms/issues/new?type=bug) on our GitHub repository.

#### Keyboard Navigation

- Navigate through UI elements using the Tab, Space, Enter and arrow keys.
- Other [keyboard shortcuts](#keyboard-shortcuts) are also available for common actions.
- Features that require mouse interaction, such as drag-and-drop, have alternative keyboard-accessible methods.
- Our [custom UI component library](https://github.com/sveltia/sveltia-ui) is designed for optimal keyboard usability without compromising accessibility.

#### Screen Reader Support

- Full [WAI-ARIA](https://w3c.github.io/aria/) support for screen readers like NVDA and VoiceOver.
- Announcements are read out when the user navigates to another page.
- The rich text editor is built with [Lexical](https://lexical.dev/), which follows accessibility best practices and includes [Dragon NaturallySpeaking support](https://lexical.dev/docs/packages/lexical-dragon).

#### Visual Design

- Sufficient contrast between foreground text and background colors.
- Links are underlined by default for easy recognition (configurable in Accessibility Settings).

#### System Preferences

- Honors the operating system’s [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion), [reduced transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-transparency) and [high contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) settings.

### Supported Browsers

Sveltia CMS works with all modern browsers. It relies on some recent JavaScript features, so the following versions or later are required:

- Chrome and Edge 140
- Firefox 133
- Safari 18.4

An older browser is detected when the CMS loads, and an error message asking the user to update the browser is shown instead of the sign-in page.

There are also a few limitations because Sveltia CMS utilizes some new web technologies:

- The [local workflow](https://sveltiacms.app/en/docs/workflows/local) requires a Chromium-based browser, including Chrome, Edge and Brave.
- Safari: The [Test backend](https://sveltiacms.app/en/docs/backends/test) requires version 26 or later; [image optimization](https://sveltiacms.app/en/docs/media#image-optimization) is slower than in other browsers.
- Firefox Extended Support Release (ESR) and its derivatives, including Tor Browser and Mullvad Browser, are not officially supported, although they may still work.

Make sure to use the latest version of the browser for the best experience.

Source: https://sveltiacms.app/en/docs/ui

---

## Asset Library

Sveltia CMS’s Asset Library allows users to efficiently manage and organize media files, including images, videos and documents. It serves as a centralized hub for all digital assets, making it easy to upload, categorize and retrieve files as needed.

Files can be stored in the Git repository with the [internal media storage](https://sveltiacms.app/en/docs/media/internal), or on an [external media storage provider](https://sveltiacms.app/en/docs/media) such as Amazon S3, Cloudflare R2 or Uploadcare.

![The Asset Library showing a grid of photos and the details of a selected image](/images/landing/asset-library-light.webp?20261016)
![The Asset Library showing a grid of photos and the details of a selected image](/images/landing/asset-library-dark.webp?20261016)

### Features

The Asset Library includes the following features:

#### Folder List

The sidebar displays a list of all folders in the repository’s global media folder, as well as any collection-specific media folders. If any [cloud storage services](https://sveltiacms.app/en/docs/media) are configured, they are also listed in the sidebar under **External Locations**.

##### Internal Locations

Navigate between the global media folder and collection-specific media folders. This allows organizing assets at both the global level and within individual collections for more granular asset management. Within each of these folders, users can also [browse and manage subfolders](#subfolders).

##### External Locations

Assets in external locations are listed under **External Locations** in the sidebar. This includes any configured cloud storage services, as well as a special location for linked files.

###### Cloud Storage Services

Every [cloud storage service](https://sveltiacms.app/en/docs/media) configured with the `media_libraries` option is listed under **External Locations** in the sidebar, at `#/assets/-/{service}` — for example `#/assets/-/uploadcare`. Select a service to browse the files stored there, using the same grid or list views, sorting, type filter and Info pane as a repository folder. A search box narrows the list down by filename.

The user is prompted for the service’s secret key or SAS token the first time, just like in the [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) field picker. The credential is stored in the browser only, and can be changed later under **Settings > Media**.

Files can be uploaded, downloaded, renamed, replaced and deleted directly on the service, subject to what its API allows:

| Service | Upload | Delete | Rename | Replace |
| --- | --- | --- | --- | --- |
| [Amazon S3](https://sveltiacms.app/en/docs/media/amazon-s3), [Backblaze B2](https://sveltiacms.app/en/docs/media/backblaze-b2), [Bunny Storage](https://sveltiacms.app/en/docs/media/bunny-storage), [Cloudflare R2](https://sveltiacms.app/en/docs/media/cloudflare-r2), [DigitalOcean Spaces](https://sveltiacms.app/en/docs/media/digitalocean-spaces), [Neon Object Storage](https://sveltiacms.app/en/docs/media/neon-object-storage), [Scaleway Object Storage](https://sveltiacms.app/en/docs/media/scaleway-object-storage), [Supabase Storage](https://sveltiacms.app/en/docs/media/supabase-storage) | Yes | Yes | Yes | Yes |
| [Azure Blob Storage](https://sveltiacms.app/en/docs/media/azure-blob-storage) | Yes | Yes | Yes | Yes |
| [Uploadcare](https://sveltiacms.app/en/docs/media/uploadcare) | Yes | Yes | No | No |
| [Cloudinary](https://sveltiacms.app/en/docs/media/cloudinary) | Cloudinary’s own Media Library widget is opened instead |  |  |  |

The controls for operations a service doesn’t support are hidden.

Renaming a file on an S3-compatible service or Azure Blob Storage copies it to the new name and then deletes the original. Make sure the bucket’s CORS policy allows the `DELETE` method and all request headers, and that the credential has the delete permission. See the setup instructions of each service for details.

Unlike repository assets, entries referencing a renamed or deleted external file are not updated, because the file URL is stored as is. So the Rename dialog warns the user when entries link to the file, or to files in the folder being renamed. It also says how many of them will be left with a broken link.

The file list of a large bucket or container is fetched in pages, up to a limit. If the service holds more files than are listed, a notice says that some of them are left out.

**Info**

Files on external services are previewed straight from the service’s URL. So the details view can show a text or Markdown file only if the service allows cross-origin requests.

The Info pane shows the file size, the dimensions and duration of media files, the public URL, the file path on the service and the entries using the file. It doesn’t show the Exif metadata, which can’t be read without downloading the file.

The Copy menu offers the public URL, the file path relative to the configured prefix, the service’s file ID (an object key or a UUID) and the file data.

These files are not included in the global search.

###### Linked Files

The last item under External Locations, **Linked Files** at `#/assets/-/linked`, gathers every file that a [File](https://sveltiacms.app/en/docs/fields/file) or [Image](https://sveltiacms.app/en/docs/fields/image) field links to by URL. That could be a picture hosted on another site, a document on a shared drive, or an avatar served by a third-party API. You can see them all in one place and check where each one is used.

The list is built from the entries themselves, so it needs no configuration and stays in sync as entries are saved. A URL used by several entries is listed once.

Files that live in the repository or on a configured cloud storage service have their own locations, so they aren’t listed here, even when an entry stores them as an absolute URL. Images embedded in Markdown or rich text bodies aren’t scanned either.

Since these files are hosted elsewhere, they can only be browsed: there is no upload, rename, replace or delete.

The Info pane shows the kind, the dimensions or duration of a media file, the URL and the entries using the file. The file size isn’t available. The Copy menu offers the URL and, where the host allows cross-origin requests, the file data.

A URL without a file extension, such as an avatar endpoint, is treated as an image when it comes from an Image field.

A long list is easier to go through host by host: choose **Domain** from the **Group** menu in the toolbar to group the files by the domain of their URL. The choice is remembered for this location.

The CMS also checks whether each file can still be loaded. A file that can’t be — because it was deleted, moved or is on a host that is gone — is marked with an **Unavailable** badge, so a broken link stands out. A missing non-media file on a host that doesn’t allow cross-origin requests can’t be detected, though.

#### Subfolders

A repository folder is browsed folder by folder, the way a file manager works. The subfolders of the current folder are listed ahead of its assets, as compact tiles in the grid view or as rows in the list view. Double-click one to open it, or use a single click or tap on a touch screen or a small screen.

A breadcrumb in the toolbar shows the current location and leads back to any parent folder. The browser’s Back button works as well, since each folder has its own URL, such as `#/assets/static/images/2024/summer`.

The **All Assets** location lists every asset at once instead.

Click the empty area of the list, or select a folder with a single click or the keyboard, to see the folder’s path and what it holds in the Info pane.

Folders can be managed like assets:

- **Create** a folder with the **New Folder** button in the toolbar. A Git repository can’t hold an empty folder, so the CMS commits a `.gitkeep` placeholder file to keep it in the repository until something is uploaded to it. The name is sanitized like a filename, and [slugified](https://sveltiacms.app/en/docs/media#slugification-of-filenames) as well if that option is enabled.
- **Upload** files into the current folder: both the Upload button and drag and drop save the files there.
- **Rename** a folder from its options menu. Every asset in the folder, at any depth, is moved along in the same commit, and the File and Image fields and Markdown images that reference them are updated with the new paths.
- **Delete** a folder and everything in it from its options menu. As with [deleting assets](#asset-management), the entries referencing any of the assets are updated in the same commit, and the confirmation dialog says how many. The deletion is refused if clearing a reference would break a field’s validation rules.

Subfolder browsing applies to any global, collection or [asset collection](https://sveltiacms.app/en/docs/media/internal#asset-collections) folder with a fixed path.

Some folders don’t have a single tree to walk, so their assets are listed all at once as before:

- a [collection media folder](https://sveltiacms.app/en/docs/media/internal#collection-level-configuration) whose path contains a template tag such as `{{slug}}`
- an [entry-relative folder](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders)

A collection media folder nested inside the global media folder is its own location in the sidebar, rather than a subfolder of the global one.

When [working with a local repository](https://sveltiacms.app/en/docs/workflows/local), a folder that is left empty by a move or deletion is removed from the disk. This way, the local checkout matches what a Git commit would leave.

[Open Authoring](https://sveltiacms.app/en/docs/workflows/open) contributors can browse folders but can’t create, rename or delete them, as those changes are committed straight to the branch.

##### Read-Only Folders

The files in a folder the CMS itself may be served from are listed but read-only. That’s a folder named `admin` or `cms`, or named like the folder of the admin page you’re using, located either:

- at the top of the repository
- right below the folder the site is served from: `static` or `public`, or the folder the global `media_folder` and `public_folder` options point to

This protects the CMS itself. With a media folder at the root of the public folder, the CMS’s own admin page and configuration file — `static/admin/index.html` and `static/admin/config.yml`, for example — would otherwise appear as assets. Replacing them would hand the next user’s sign-in to whoever wrote the new page.

A folder with the same name deeper down, like a page bundle at `content/posts/cms`, is a regular folder. Only an `index.html` or `config.yml` file in it (also `.yaml`, `.toml` or `.json`) is protected, as it could still be an admin page.

In a read-only folder:

- The files can’t be replaced, edited, renamed, moved or deleted.
- Nothing can be uploaded to such a folder, and no folder can be created in it.
- The folder itself can’t be renamed or deleted, and a new or renamed folder can’t be called `admin` or `cms`.

The same applies to the picker of the [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields, and to the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial#checks-before-publishing). A pull request that changes a file in such a folder as an asset isn’t published from the CMS. Make changes to the admin page in the repository directly.

Deployment configuration files such as `_redirects` aren’t affected, and can still be edited through a file collection; see [Editing Site Deployment Configuration Files](https://sveltiacms.app/en/docs/how-tos#editing-site-deployment-configuration-files).

##### Folders on External Locations

[Amazon S3](https://sveltiacms.app/en/docs/media/amazon-s3) and the S3-compatible providers, as well as [Azure Blob Storage](https://sveltiacms.app/en/docs/media/azure-blob-storage), store files at paths. So they are browsed folder by folder the same way, with the same breadcrumb, Info pane, **New Folder** button and folder menu.

Object storage has no folders of its own. The CMS reads the folders off the file paths, and keeps an empty folder with a zero-byte placeholder object named after the folder with a trailing slash. That’s what the consoles of these services do too.

The services can’t move a file, so renaming a folder copies each file to its new path and deletes the original, one file at a time. Deleting a folder deletes each file in it. Keep in mind that the entries link to the files on these services by URL. A rename changes those URLs, and the entries using them aren’t updated.

The search box in the location’s toolbar looks through every folder, listing the matches with their paths.

An uploaded file’s name may already be taken in the folder, or by another file in the same upload, such as `photo.jpg` and `photo.png` both converted to WebP. The file is then given a number suffix like `photo-1.webp`, as in the repository, instead of overwriting the file on the service.

[Uploadcare](https://sveltiacms.app/en/docs/media/uploadcare) has no folders, and [Cloudinary](https://sveltiacms.app/en/docs/media/cloudinary) handles them in its own widget, so neither is affected.

#### Asset List

Thumbnails are displayed for image, video and PDF files for easy identification. Users can switch between grid and list views, and sort or filter assets by name and file type.

Thumbnails of entries are also displayed in both grid and list views, making it easier to navigate and identify the assets needed.

#### Asset Upload

Upload multiple assets at once by browsing or dragging and dropping files directly into the library, including files in nested folders. When an entry or asset file is deleted, the empty folder that contains it is also automatically deleted, so there is no need to clean it up manually.

The CMS prevents the same file from being uploaded twice by comparing file hashes and selecting an existing asset instead.

#### Asset Search

Use the search functionality to quickly find specific assets. Assets can also be filtered by name or file type to narrow down results. Files on [external locations](#external-locations) are searched with the search box in the location’s own toolbar instead.

#### Asset Details

Preview image, audio, video, text and PDF files directly in the Asset Library. Check the site’s Content Security Policy (CSP) if the preview doesn’t work as expected.

View comprehensive asset details including:

- File size and dimensions
- Commit author and date information
- A list of entries that use the selected asset
- Exif metadata when available, including creation date and GPS coordinates displayed on a map

#### Asset Management

Manage assets with a variety of operations:

- **Rename** existing assets. If the asset is used in any entries, the File and Image fields will be automatically updated with the new file path.
- **Replace** existing assets with new versions.
- **Edit** plain text assets, including Markdown, JSON, SVG files and other text-based content using the built-in editor.
- **Copy** the public URL, file path, text data or image data of a selected asset to the clipboard.
- **Download** one or more selected assets at once.
- **Delete** one or more selected assets at once. If an asset is used in any entries, those entries are updated in the same commit so that no reference is left dangling:

  - A File or Image field holding the asset is cleared, or loses that item if it holds several files.
  - An image embedding it in a Markdown or rich text field is removed.

  The confirmation dialog says how many entries will be updated. The deletion is refused, though, if clearing a reference would break a field’s own validation rules:

  - a `required` Image field with nothing left
  - a multi-file field with fewer than `min` files
  - a required body with nothing but the image

  The dialog then lists the entries and fields in the way, so that they can be updated first. To see what an asset is used by before deleting it, check the Info pane’s **Used in** list.

**Future Plans**

Image editing capabilities, such as cropping and resizing, may be added in future releases. Advanced DAM features, such as tagging and metadata management, are also planned for future updates.

Source: https://sveltiacms.app/en/docs/ui/asset-library

---

## Content Editor

Sveltia CMS provides a powerful Content Editor that allows users to create and modify content entries stored in their Git repository. This document outlines the key features and functionalities of the Content Editor.

![The Content Editor with a blog post in the Edit Pane on the left and a live preview on the right](/images/landing/entry-editor-light.webp?20261016)
![The Content Editor with a blog post in the Edit Pane on the left and a live preview on the right](/images/landing/entry-editor-dark.webp?20261016)

### Features

The Content Editor includes the following features to enhance the content creation and editing experience:

#### Two-Pane Interface

If the [Preview Pane](#preview-pane) or [i18n support](#i18n-support) is enabled, the Content Editor interface splits into two panes. By default, the Edit Pane is displayed on the left side and the Preview Pane on the right, so users can see a live preview of the content while editing.

If the UI language is set to a right-to-left (RTL) language, the arrangement is reversed. That’s why the CMS UI calls them the first and second panes rather than the left and right panes.

The two-pane interface includes the following features:

- **Resizable Panes**: Users can adjust the width of each pane by dragging the divider between them, allowing them to customize their workspace according to their preferences.
- **Swappable Panes**: The small swap button in the middle of the divider switches the two panes around, so the Preview Pane can be on the left and the Edit Pane on the right. The arrangement is remembered per collection, along with the pane widths, and stays in effect until the panes are swapped back. So if the panes appear on the “wrong” side, this is why. Click the button again to restore the default order.
- **Scroll Synchronization**: When editing long entries, Sveltia CMS synchronizes the scroll position between the Edit Pane and the Preview Pane. This helps users see how the content will look as they write, without having to manually scroll both sections.
- **Click-to-Highlight**: Clicking on a field in the Preview Pane highlights the corresponding field in the Edit Pane. If the field is collapsed in the Edit Pane, it will automatically expand when clicked in the Preview Pane. This feature makes it easy to locate and edit specific fields based on their appearance in the preview.
- **Optional Second Pane**: Users who prefer to edit at full width can hide the second pane with the Show Second Pane option in the editor menu. The preview is still available then, as a Preview tab in the pane header. The pane layout is remembered and restored when the pane is shown again. See [User Settings](#user-settings) for details. Developers can also turn the second pane off for everyone; see [Disabling the Second Pane](#disabling-the-second-pane).

#### Sidebar

The Content Editor includes a sidebar that provides additional information and tools related to the content being edited. On a small screen, where the sidebar doesn’t fit, its panels are listed in the 3-dot menu and open in a sheet at the bottom of the screen. There are four panels:

- **Slug**: Shows the entry’s slug and lets users edit it. See [Slug Panel](#slug-panel) for details.
- **Validation**: Shows any [field validation](https://sveltiacms.app/en/docs/fields#field-validation) errors in the content. Clicking an error highlights the corresponding field in the editor. Results appear when an entry is saved. The Validate button in the panel header checks the entry at any time against every rule, including the [required fields](https://sveltiacms.app/en/docs/workflows/editorial#required-fields) that an Editorial Workflow draft can be saved without. This way, users can see what’s still missing before the entry can be published.
- **History**: Shows the commit history of the current content file. Each commit is listed with its author and date, and with the first line of its message when the [`prompt_commit_messages`](https://sveltiacms.app/en/docs/backends#prompting-for-commit-messages) option is enabled. Without it, the messages the CMS writes for an entry are all the same, so they’re not shown. Clicking a commit shows a diff view of the changes made in that commit on the Git provider. This panel is not available while using the [local development workflow](https://sveltiacms.app/en/docs/workflows/local).
- **Backlinks**: Shows all the content files that reference the current content file via [Relation fields](https://sveltiacms.app/en/docs/fields/relation). Clicking a backlink opens the referenced content file in the editor. For example, users can see all blog posts that reference a specific author or tag, which can be useful for quickly navigating between related content.

More panels may be added in the future.

#### Auto-Saving Drafts

When creating or editing content, Sveltia CMS automatically saves draft backups in the browser’s local storage. This ensures that work is not lost if the user accidentally navigates away from the page or the browser crashes. Drafts are saved periodically as changes are made, and can be restored when the user returns to the editing interface.

A backup also keeps the folder chosen with the [path editor](https://sveltiacms.app/en/docs/collections/entries/nested#choosing-a-parent-folder). A new index file has a backup of its own, apart from that of a new entry.

If someone else has saved the entry since the backup was made, restoring it doesn’t silently undo their change. The editor tells you about it, and saving asks before overwriting it, as if the draft had been open all along.

Auto-saving drafts can be disabled in User Preferences.

#### Revert, Restore and Clear

The Content Editor offers three ways to start over, side by side in the 3-dot menus:

- **Revert Changes** discards the unsaved changes, bringing back the last saved values. This is useful for undoing changes made during the current editing session. Revert All Changes also brings back the entry’s folder, slugs and enabled locales, so a locale turned off isn’t deleted on the next save.
- **Restore Default** puts back the values a new entry would have, taking each field’s `default` option into account.
- **Clear** empties the values, ignoring the defaults, so that fields can be filled in from scratch. A List field is left without items and a KeyValue field without pairs. A required field then has to be filled in again before the entry can be saved.

They apply to different parts of the entry depending on the menu:

- The menu of a field applies to that field alone, including the subfields of an [Object](https://sveltiacms.app/en/docs/fields/object) or [List](https://sveltiacms.app/en/docs/fields/list) field.
- The content options menu in the header of an editor pane applies to every field in the locale shown in the pane, labeled Revert Changes, Restore Default and Clear All.
- The editor options menu at the top-right corner applies to every field in every locale, labeled Revert All Changes, Restore Default and Clear All.

Because the pane and editor menus change many fields at once, they ask for confirmation first. A field can be reverted to undo a restore or clear, until the entry is saved.

Restoring and clearing leave alone the values a user doesn’t enter:

- [Hidden](https://sveltiacms.app/en/docs/fields/hidden), [UUID](https://sveltiacms.app/en/docs/fields/uuid) and [Compute](https://sveltiacms.app/en/docs/fields/compute) fields
- read-only fields
- the type of a variable type Object field

The items of a [List](https://sveltiacms.app/en/docs/fields/list) field with the `allow_remove: false` option are kept as well, since clearing or restoring could remove them. So are those of a List field with the `allow_add: false` option when restoring, which could add items. An optional Object field that is collapsed stays collapsed.

With [i18n](https://sveltiacms.app/en/docs/i18n) enabled, restoring or clearing a field in the default locale does the same in the other locales where the field is duplicated. In another locale, only the fields that can be translated there are changed.

#### Slug Panel

An entry’s slug is the identifier that appears in its filename and, in most setups, in its URL on the live site. It’s usually [generated from a template](https://sveltiacms.app/en/docs/collections/entries/slugs#entry-slugs), such as the entry’s title.

The slug is shown in the Slug panel of the [sidebar](#sidebar), which can also be opened with the Edit Slug option in the 3-dot menu.

The slug is shown as read-only text, with a pencil button to edit it. While it’s being edited, it’s checked as the user types. A slug:

- cannot contain slashes or whitespace
- cannot already be in use by another entry in the same collection, including entries awaiting review under the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) and any other file stored in the collection folder — such as an entry the collection’s [`filter`](https://sveltiacms.app/en/docs/collections/entries/listings#filtering-entries) option leaves out, or one belonging to another collection sharing the folder
- must match the collection’s [`pattern` slug option](https://sveltiacms.app/en/docs/collections/entries/slugs#making-slugs-editable), if any

Press Enter or click the check mark button to apply the slug, or press Escape to cancel. Whatever is typed is normalized with the site’s [global slug options](https://sveltiacms.app/en/docs/collections/entries/slugs#global-slug-options). If the collection has a [`hint` slug option](https://sveltiacms.app/en/docs/collections/entries/slugs#making-slugs-editable), it’s shown at the top of the panel.

If entry slugs are [localized](https://sveltiacms.app/en/docs/i18n/slugs), the panel has a section for each locale, like the Validation panel. Otherwise, there’s a single slug shared by every locale.

##### New Entries

In a new entry, the panel shows the slug the entry will be saved with. It follows the entry’s content as it is edited.

- A slug containing a date and time, such as `{{year}}-{{month}}-{{day}}-{{slug}}`, is shown with the [entry date](https://sveltiacms.app/en/docs/collections/entries/slugs#slug-template-tags) once its date field is filled in. Until then, or if the collection has no such field, it’s shown with the current date and time, and gets the date and time of the save.
- A random ID, such as `{{uuid_short}}`, is kept until the entry is saved, so the entry is saved with the slug shown.

Once a user gives a custom slug with the pencil button, it no longer follows the entry’s content. To go back to the generated slug, edit the slug and empty it.

If the collection is configured to [have users type the slug](https://sveltiacms.app/en/docs/collections/entries/slugs#having-users-type-the-slug), the panel shows a regular text field instead. It opens by itself when a user creates an entry, and the entry can’t be saved until a slug has been entered.

##### Saved Entries

In a saved entry, the pencil button renames the entry. The new slug takes effect when the entry is saved, and saving does three things in a single commit:

- **Renames the file.** The entry moves to the file path matching its new slug. Git records this as a rename, so the file’s history is preserved.

  For a nested entry, its folder is renamed instead, and everything below it moves along: the entries stored there and, with [entry-relative media](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders), the files of each [page bundle](https://sveltiacms.app/en/docs/collections/entries/nested#nesting-page-bundles). The entry keeps its place in the tree. Renaming never files it under a different parent; that’s what the [Parent Folder](https://sveltiacms.app/en/docs/collections/entries/nested#moving-entries) field is for.
- **Adds a redirect.** If the collection has a [`preview_path`](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) option, the entry’s previous URL is recorded in its data so the framework can redirect visitors from the old URL to the new one. See [Redirects](https://sveltiacms.app/en/docs/collections/entries/previews#redirects).
- **Updates references.** Every entry that points at this one through a [Relation field](https://sveltiacms.app/en/docs/fields/relation) is rewritten to reference the new slug, so no links between entries are left dangling. The Backlinks panel of the [sidebar](#sidebar) shows which entries will be updated before saving.

In a collection with [nested entries](https://sveltiacms.app/en/docs/collections/entries/nested) where every entry is stored as an index file, the folder holding an entry is what identifies it. So the panel shows that folder’s name, rather than the path leading to it, with a Rename Folder button. The folder is shared by every locale unless the slugs are localized.

A name is only in the way if another folder in the same parent already uses it, so the same name can appear elsewhere in the tree. The rules differ slightly from a slug’s. Spaces are allowed and become hyphens, while a name is rejected if it:

- starts with a dot, which would hide the folder
- has no letters or numbers left after normalization

The slug of a saved entry is shown without the pencil button where it can’t meaningfully change:

- in a collection that doesn’t allow it with the [`editable` slug option](https://sveltiacms.app/en/docs/collections/entries/slugs#making-slugs-editable)
- on an entry awaiting deletion under the Editorial Workflow
- in a collection with nested entries where entries don’t share one filename — with `subfolders: false`, or without the [`meta.path.index_file`](https://sveltiacms.app/en/docs/collections/entries/nested#choosing-a-parent-folder) option. There, an entry is identified by its whole path below the collection folder, and no part of that path belongs to the entry alone.

The panel isn’t available for entries in [file and singleton collections](https://sveltiacms.app/en/docs/collections/files), whose filenames are fixed in the configuration, or for [Hugo’s special index file](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file).

#### Deleting an Entry

The Delete Entry option in the 3-dot menu removes a saved entry along with the files in its [entry-relative media folder](https://sveltiacms.app/en/docs/media/internal#using-entry-relative-folders), if it has one. When entries are files sharing a folder, a file another entry also uses is kept, such as an image a duplicated entry still points to.

Every entry that points at it through a [Relation field](https://sveltiacms.app/en/docs/fields/relation) is updated in the same commit, so no reference is left dangling. The confirmation dialog says how many entries will be updated. It refuses the deletion if clearing a reference would leave a required field empty or a multi-select field short of its minimum, and lists the entries and fields in the way. See [Cascading Deletions](https://sveltiacms.app/en/docs/fields/relation#cascading-deletions).

Under the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the deletion is staged in a pull request instead of being committed right away.

The option isn’t offered in [file and singleton collections](https://sveltiacms.app/en/docs/collections/files), or in collections where [entry deletion is disabled](https://sveltiacms.app/en/docs/collections/entries/operations#disabling-creation-and-deletion). To delete several entries at once, [select them in the entry list](https://sveltiacms.app/en/docs/ui/content-library#bulk-actions).

#### View on Live Site

The 3-dot menu in the Content Editor includes a View on Live Site option. This allows users to quickly open the live version of the entry being edited, making it easy to check how the current content appears on the actual website.

#### View Source

When Developer Mode is enabled, the 3-dot menu in the Content Editor provides a View Source option. This allows users to quickly open the source file of the entry or asset in the Git repository, making it easy to review or edit the raw content.

#### I18n Support

If [internationalization](https://sveltiacms.app/en/docs/i18n) (i18n) is enabled in the Sveltia CMS configuration, the Content Editor provides support for managing translations of the content. Users can switch between different language versions of the content being edited, making it easy to create and maintain multilingual sites.

- **Language Switcher**: A language switcher is available in the editor interface, allowing users to select the desired language for editing and preview. If there are any errors or missing translations, they will be indicated in the switcher.
- **Translate Button**: A Translate button is provided to translate all or specific text-type fields using a third-party [translation service](https://sveltiacms.app/en/docs/integrations/translations). This feature can help speed up the process of creating translations for the content.
- **Copy Button**: A Copy button is available to copy content from one language version to another, facilitating the translation process.

See also the [Linking to Content Editor](#linking-to-content-editor) section for information on setting the editor pane locale via URL.

#### Keyboard Shortcuts

Sveltia CMS includes several keyboard shortcuts to enhance productivity while editing content.

- Save an entry: `Ctrl+S` (Windows/Linux) or `Command+S` (macOS)
- Cancel entry editing: `Escape`

Standard keyboard shortcuts are also available in the Markdown editor, including `Ctrl+B`/`Command+B` for bold text, `Ctrl+I`/`Command+I` for italics, `Ctrl+K`/`Command+K` to insert a link and `Tab` to indent a list item. The bold, italic and link shortcuts work in both the rich text and raw Markdown editing modes. `Ctrl+Shift+V`/`Command+Shift+V` (`Command+Option+Shift+V` in Safari) [pastes the text on the clipboard as Markdown](https://sveltiacms.app/en/docs/fields/richtext#editor), converting it to formatted content in the rich text mode.

### Linking to Content Editor

Sveltia CMS supports linking directly to specific states of the Content Editor using URL query parameters. This can be useful for sharing links to specific entries or pre-filling fields when creating new entries.

#### Opening Specific Entries

Links can point directly to the Content Editor for a specific entry in an [entry collection](https://sveltiacms.app/en/docs/collections/entries) using the following URL format:

```
https://YOUR_DOMAIN/admin/#/collections/COLLECTION_NAME/entries/ENTRY_ID
```

Where `ENTRY_ID` is the entry’s file path within the collection folder, without the file extension. The same format works for a [file/singleton collection](https://sveltiacms.app/en/docs/collections/files), where `ENTRY_ID` is the file’s `name` in the configuration.

**Migrating from Netlify/Decap CMS**

Netlify/Decap CMS also accepts a shorthand for the same link, which it documents alongside its Open Authoring feature:

```
https://YOUR_DOMAIN/admin/#/edit/COLLECTION_NAME/ENTRY_ID
```

Sveltia CMS accepts it too and redirects to the URL above, so any link already shared keeps working. Use the full format for new links.

#### Dynamic Default Values

Sveltia CMS supports dynamic default values passed with URL query parameters. This allows pre-filling certain fields when creating new entries in an [entry collection](https://sveltiacms.app/en/docs/collections/entries).

The URL format for pre-filling fields is as follows:

```
https://YOUR_DOMAIN/admin/#/collections/COLLECTION_NAME/new?field1=value1&field2=value2
```

Where `field1`, `field2`, etc. are the names of the fields to pre-fill with `value1`, `value2`, etc. Some notes on using this feature:

- Make sure to [URL-encode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) the parameter values.
- Use dot notation to target nested fields (e.g. `author.name=John%20Doe`). An optional Object field is created when one of its fields gets a value this way.
- Use a comma-separated list (e.g. `tags=value1,value2`) or multiple query parameters (e.g. `tags=value1&tags=value2`) for multi-select fields. In a List field with a single `field`, each value is converted to the type the subfield takes, e.g. a number for a Number subfield or `true` and `false` for a Boolean subfield.

For example, given the following collection configuration:

```yaml [YAML]
collections:
  - name: posts
    label: Posts
    folder: /content/posts
    fields:
      - name: title
        label: Title
      - name: author
        label: Author
        widget: object
        fields:
          - name: name
            label: Name
      - name: body
        label: Body
        widget: richtext
```

```toml [TOML]
[[collections]]
name = "posts"
label = "Posts"
folder = "/content/posts"
[[collections.fields]]
name = "title"
label = "Title"
[[collections.fields]]
name = "author"
label = "Author"
widget = "object"
[[collections.fields.fields]]
name = "name"
label = "Name"
[[collections.fields]]
name = "body"
label = "Body"
widget = "richtext"
```

```json [JSON]
{
  "collections": [
    {
      "name": "posts",
      "label": "Posts",
      "folder": "/content/posts",
      "fields": [
        { "name": "title", "label": "Title" },
        {
          "name": "author",
          "label": "Author",
          "widget": "object",
          "fields": [{ "name": "name", "label": "Name" }]
        },
        { "name": "body", "label": "Body", "widget": "richtext" }
      ]
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "posts",
      label: "Posts",
      folder: "/content/posts",
      fields: [
        { name: "title", label: "Title" },
        {
          name: "author",
          label: "Author",
          widget: "object",
          fields: [{ name: "name", label: "Name" }],
        },
        { name: "body", label: "Body", widget: "richtext" },
      ],
    },
  ],
}
```

The following URL will open the new entry editor with the `title`, `author.name` and `body` fields pre-filled:

```
https://example.com/admin/#/collections/posts/new?title=My%20First%20Post&author.name=John%20Doe&body=Hello%2C%20world!
```

#### Editor Pane Locale

By default, Sveltia CMS uses the default locale for the Content Editor pane. However, a different locale can be specified for the editor pane using a URL query parameter when [i18n support](https://sveltiacms.app/en/docs/i18n) is enabled.

To set the editor pane locale, append the `_locale` query parameter to the CMS URL with the desired locale code. For example, to open the editor pane in French (`fr`), use the following URL:

```
https://YOUR_DOMAIN/admin/#/collections/COLLECTION_NAME/entries/ENTRY_ID?_locale=fr
```

For a new entry:

```
https://YOUR_DOMAIN/admin/#/collections/COLLECTION_NAME/new?_locale=fr
```

The query parameter can be combined with [dynamic default values](#dynamic-default-values) to pre-fill field values via URL.

#### Entry Slug

When creating a new entry, a slug can also be given with the `_slug` query parameter. For example:

```
https://YOUR_DOMAIN/admin/#/collections/COLLECTION_NAME/new?title=My%20First%20Post&_slug=2025-06-15-my-first-post
```

The slug is only used if the collection allows users to edit the slug when creating an entry, which is the default. See [Making Slugs Editable](https://sveltiacms.app/en/docs/collections/entries/slugs#making-slugs-editable).

It shows up in the [Slug panel](#slug-panel) like a slug typed by the user, and it’s checked the same way when the entry is saved. If slugs are localized, it applies to the default locale.

### Saving Behavior

#### Save and Publish Options

When the `skip_ci` backend option is enabled, the Save button in the Content Editor has a dropdown menu that allows users to choose between two saving options. See the [Disabling Automatic Deployments](https://sveltiacms.app/en/docs/deployments#disabling-automatic-deployments) section for more details.

#### Auto-Close Editor

When a user saves changes, the Content Editor automatically closes the editing interface and returns to the collection or file list. This streamlines the workflow by reducing the number of clicks needed to return to the main interface after saving. Users who prefer to stay in the editor after saving can change this behavior in User Preferences.

#### Conflict Resolution

Several people can work on a site at the same time. Sveltia CMS keeps an eye on the repository so that a change one of them pushes isn’t lost when another saves over it:

- **When a user opens an entry**, the branch is checked for new commits, so they start from the entry as it is, not as it was when they signed in.
- **While a user edits**, the check is repeated every minute and whenever they come back to the tab. It’s a single small request to the backend, and only files that have actually changed are fetched. So the entry and asset lists follow the repository without a reload.

  If someone changes the entry that is open, a notice appears at the top of the editor saying who changed it and when. Reload Entry starts over from their version, after asking if there are unsaved changes. Dismissing the notice lets the user carry on with their own.
- **When a user saves**, the branch is checked once more. If the entry has been changed or deleted since it was opened, a dialog says so, and nothing is written until the user chooses Save Anyway. Saving over a change replaces it with theirs; saving a deleted entry creates it again.
- **On GitHub**, the commit also names the branch head it expects, so a commit against a branch that moved in the last moment is refused by GitHub rather than applied. Sveltia CMS then explains what happened, and saving again picks the other change up first.

Under the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), an unpublished entry lives on a branch named after the entry, not after the editor. So two people working on the same entry share it.

That branch is checked when the entry is saved. If the entry has been changed on it since the draft was opened, the same dialog appears, and nothing is written until the user chooses Save Anyway. A push to the branch at the last moment is caught too:

- On GitHub, the commit names the commit the entry was loaded or saved at, so GitHub refuses the save in the same way.
- Gitea and Forgejo can’t be told what to build on. Instead, the CMS checks that the branch still points at that commit right before saving, and refuses the save otherwise. Saving again reads the entry back first.

A conflict with the configured branch itself, if any, is dealt with when the entry is published. Publishing also checks that the pull request holds nothing the CMS hasn’t shown; see [Checks Before Publishing](https://sveltiacms.app/en/docs/workflows/editorial#checks-before-publishing).

The checks made while an entry is open watch the configured branch only. So a colleague’s commit to a shared workflow branch is caught at the point of saving, rather than reported in the editor beforehand.

Changes made to the same entry in the [local development workflow](https://sveltiacms.app/en/docs/workflows/local) aren’t detected at all.

### Disabling the Second Pane

By default, the Content Editor shows a [second pane](#two-pane-interface) next to the Edit Pane whenever there’s something to put in it: the preview, or another locale’s Edit Pane when [i18n support](#i18n-support) is enabled.

To keep the editor to a single pane for everyone, set the `second_pane` option to `false`. Users then can’t turn the second pane on with the Show Second Pane option in the editor menu.

The preview, unless [disabled](#disabling-previews), stays available in the single pane. A Preview tab appears in the pane header, after the locale tabs, or next to an Edit tab if the entry has a single locale. Other locales are edited by switching the pane to them with the [language switcher](#i18n-support).

To turn off the second pane globally, add the following configuration to the top level of the `config.yml` file:

```yaml [YAML]
editor:
  second_pane: false
```

```toml [TOML]
[editor]
second_pane = false
```

```json [JSON]
{
  "editor": {
    "second_pane": false
  }
}
```

```js [JavaScript]
{
  editor: {
    second_pane: false,
  },
}
```

Like the [`preview` option](#disabling-previews), `second_pane` can also be set on a specific collection, a file in a file collection or a [Hugo index file](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file), where it overrides the option set at a higher level. For example, the following configuration turns the second pane off for the `blog` collection only:

```yaml [YAML]
collections:
  - name: blog
    label: Blog
    folder: /content/blog
    editor:
      second_pane: false
```

```toml [TOML]
[[collections]]
name = "blog"
label = "Blog"
folder = "/content/blog"
[collections.editor]
second_pane = false
```

```json [JSON]
{
  "collections": [
    {
      "name": "blog",
      "label": "Blog",
      "folder": "/content/blog",
      "editor": {
        "second_pane": false
      }
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "blog",
      label: "Blog",
      folder: "/content/blog",
      editor: {
        second_pane: false,
      },
    },
  ],
}
```

### Preview Pane

Developers can enhance the content editing experience by providing real-time previews of how the content will appear on the live site. Sveltia CMS offers several options for customizing and controlling the preview feature.

**Info**

Please note that, due to the nature of framework-agnostic design, we don’t plan to support live site previews that fetch data from the actual website. If this feature is needed, consider using a framework-specific CMS solution.

#### Disabling Previews

Previews are enabled by default. You can disable them at the following levels:

##### Global

Add the following configuration to the top level of the `config.yml` file:

```yaml [YAML]
editor:
  preview: false
```

```toml [TOML]
[editor]
preview = false
```

```json [JSON]
{
  "editor": {
    "preview": false
  }
}
```

```js [JavaScript]
{
  editor: {
    preview: false,
  },
}
```

##### Collection-Level

Add the same `editor` option to a specific collection in the `config.yml` file:

```yaml [YAML]
collections:
  - name: blog
    label: Blog
    folder: /content/blog
    editor:
      preview: false
```

```toml [TOML]
[[collections]]
name = "blog"
label = "Blog"
folder = "/content/blog"
[collections.editor]
preview = false
```

```json [JSON]
{
  "collections": [
    {
      "name": "blog",
      "label": "Blog",
      "folder": "/content/blog",
      "editor": {
        "preview": false
      }
    }
  ]
}
```

```js [JavaScript]
{
  collections: [
    {
      name: "blog",
      label: "Blog",
      folder: "/content/blog",
      editor: {
        preview: false,
      },
    },
  ],
}
```

##### File-Level

Add the same `editor` option to a specific file in the `config.yml` file:

```yaml [YAML]
files:
  - name: about
    label: About Page
    file: /content/about.md
    editor:
      preview: false
```

```toml [TOML]
[[files]]
name = "about"
label = "About Page"
file = "/content/about.md"
[files.editor]
preview = false
```

```json [JSON]
{
  "files": [
    {
      "name": "about",
      "label": "About Page",
      "file": "/content/about.md",
      "editor": {
        "preview": false
      }
    }
  ]
}
```

```js [JavaScript]
{
  files: [
    {
      name: "about",
      label: "About Page",
      file: "/content/about.md",
      editor: {
        preview: false,
      },
    },
  ],
}
```

##### Field-Level

Add the `preview` option to a specific field in the `config.yml` file:

```yaml [YAML]
fields:
  - name: body
    label: Body
    widget: richtext
    preview: false
```

```toml [TOML]
[[fields]]
name = "body"
label = "Body"
widget = "richtext"
preview = false
```

```json [JSON]
{
  "fields": [
    {
      "name": "body",
      "label": "Body",
      "widget": "richtext",
      "preview": false
    }
  ]
}
```

```js [JavaScript]
{
  fields: [
    {
      name: "body",
      label: "Body",
      widget: "richtext",
      preview: false,
    },
  ],
}
```

#### Advanced Customization

Sveltia CMS allows developers to create custom preview templates and styles to provide a more accurate representation of how the content will appear on the live site.

- [Custom Preview Styles](https://sveltiacms.app/en/docs/api/preview-styles): Register custom CSS styles for the preview pane, allowing for better visual fidelity with the live site.
- [Custom Preview Templates](https://sveltiacms.app/en/docs/api/preview-templates): Create custom preview templates for specific collections or files, allowing for tailored preview experiences.

#### Live Preview

Sveltia CMS does not plan to support WYSIWYG live site previews that fetch data from the actual website, due to its framework-agnostic design. If this feature is required, consider using a framework-specific CMS solution.

#### User Settings

End-users can control the editor layout in the CMS UI using the menu located at the top-right corner of the editor interface. These preferences are saved in the browser, allowing users to maintain their preferred layout across sessions.

- **Show Second Pane**: Shows or hides the [second pane](#two-pane-interface), giving the Edit Pane the full width of the editor when it’s off. The option is unavailable when there’s nothing to put in the second pane — that is, when the entry has neither a preview nor a second locale — or when the second pane is [disabled](#disabling-the-second-pane) in the configuration. The pane layout is remembered per collection and restored when the option is turned back on, including any width set by dragging the divider and whether the panes have been swapped.
- **Show Preview**: Chooses whether the preview is shown. It appears in the second pane, or as a Preview tab in the pane header while the second pane is hidden. When [i18n support](#i18n-support) is enabled, turning it off puts another locale’s Edit Pane in the second pane instead.
- **Sync Scrolling**: Turns scroll synchronization between the two panes on or off. This is enabled by default.

Sync Scrolling only takes effect while the second pane is visible, so it’s unavailable when Show Second Pane is turned off.

These are display preferences only. To disable previews or the second pane for everyone, use the configuration options described under [Disabling Previews](#disabling-previews) and [Disabling the Second Pane](#disabling-the-second-pane).

Source: https://sveltiacms.app/en/docs/ui/content-editor

---

## Content Library

Manage entries and files in one place. The Content Library provides a centralized location to organize, search and manage all content efficiently.

![The Content Library showing blog posts in grid view, with sort, filter and group options](/images/landing/entry-grid-light.webp?2026101612)
![The Content Library showing blog posts in grid view, with sort, filter and group options](/images/landing/entry-grid-dark.webp?2026101612)

### Features

#### Collection List

Displays all [collections](https://sveltiacms.app/en/docs/collections) with entry counts for quick access. [Singletons](https://sveltiacms.app/en/docs/collections/singletons) are marked distinctly to differentiate them from regular collections. A collection’s [index file](https://sveltiacms.app/en/docs/collections/entries/listings#managing-hugo-s-special-index-file) isn’t included in its count, because it stands for the collection’s own page rather than for one of the entries in it.

Customization options include:

- Collection labels can be defined using the `label` option in the collection configuration.
- Collection icons can be set using the [`icon` option](https://sveltiacms.app/en/docs/collections#icons) in the collection configuration.
- Dividers can be added between collections using the [`divider` option](https://sveltiacms.app/en/docs/collections#dividers) in the collection configuration.

#### Entry List

To access the Entry List, navigate to the Content Library and select a collection from the Collection List. Entries within a selected collection are displayed in a user-friendly, customizable list.

##### Entry Summaries

To customize the information displayed for each entry in the Entry List, a [summary field](https://sveltiacms.app/en/docs/collections/entries/listings#summaries) can be defined in the entry collection configuration. This allows highlighting specific fields that are most relevant to the workflow. For file collections, the filename is used as the summary.

##### View Modes

Users can switch between table, list and grid views for better visualization of entries.

The [table view](https://sveltiacms.app/en/docs/collections/entries/views#table-view), the default on a large screen, shows the values of several fields in columns. Click a column header to sort by it.

The grid view is especially useful when entries have associated images. If no Image field is present, the grid view is not available.

##### Sorting, Filtering and Grouping

Entry collections can be sorted, filtered and grouped based on various criteria to help users find specific entries quickly:

- **Sorting**: by fields such as date created, date modified, title or any custom field defined in the collection.
- **Filtering**: narrows down entries based on specific field values.
- **Grouping**: organizes entries into categories for easier navigation.

See [Entry Views](https://sveltiacms.app/en/docs/collections/entries/views) for how to configure these options.

##### Associated Assets

Assets stored in a [collection media folder](https://sveltiacms.app/en/docs/media/internal#collection-level-configuration) are displayed alongside their respective entries for easy identification.

##### Bulk Actions

Users can select multiple entries to delete them at once, streamlining content management tasks.

Entries referencing any of them through a [Relation field](https://sveltiacms.app/en/docs/fields/relation) are updated in the same commit. The deletion is refused if that would leave one of those fields invalid; see [Cascading Deletions](https://sveltiacms.app/en/docs/fields/relation#cascading-deletions).

#### Content Search

Instant full-text search across all entries and files helps users find content quickly. Search results are ranked by relevance to ensure the most pertinent results come first.

Source: https://sveltiacms.app/en/docs/ui/content-library
