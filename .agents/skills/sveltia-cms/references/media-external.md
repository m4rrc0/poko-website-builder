# External Media Storage Providers

An overview of third-party integrations, then Cloudinary, Uploadcare and Azure Blob Storage, plus stock photo integrations. For Amazon S3 and S3-compatible object storage, see `media-s3.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Integrations

Sveltia CMS supports integration with various third-party services to enhance its functionality. These integrations allow users to connect Sveltia CMS with external tools for media management, stock photos, translations and more.

**Future Plans**

More integration options, including stock video providers, analytics tools and AI-powered content generation services, may be added in future releases.

### Media Storage Providers

Sveltia CMS can be connected to external media storage providers such as cloud storage services or digital asset management systems to manage and utilize media assets.

See the [Media Storage](https://sveltiacms.app/en/docs/media#external-storage) guide for available media storage options and instructions on how to set up and use external media storage providers with Sveltia CMS.

### Stock Photo Providers

Sveltia CMS supports integration with popular stock photo services to easily add images to your content.

See the [Stock Photos](https://sveltiacms.app/en/docs/integrations/stock-photos) guide for detailed instructions on how to set up and use stock photo services within Sveltia CMS.

### Translation Services

Sveltia CMS supports integration with popular AI-powered translation services to translate content into multiple languages.

See the [Translation Services](https://sveltiacms.app/en/docs/integrations/translations) guide for detailed instructions on how to set up and use translation services within Sveltia CMS.

Source: https://sveltiacms.app/en/docs/integrations

---

## Cloudinary Integration

[Cloudinary](https://cloudinary.com/) is a leading cloud-based media management service that offers comprehensive solutions for image and video upload, storage, manipulation and delivery. The Cloudinary integration enables users to efficiently manage media assets within Sveltia CMS by leveraging Cloudinary’s powerful features.

### Requirements

- A Cloudinary account. You can sign up for a free account at [cloudinary.com](https://cloudinary.com/).
- Your Cloudinary cloud name and API key. These can be found in your Cloudinary dashboard under the “Account Details” section.

#### CSP

If your site uses a Content Security Policy (CSP), you may need to update it to allow requests to Cloudinary. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Configuration

#### Top-Level Configuration

To configure the Cloudinary media storage in Sveltia CMS, add the following configuration to the top level of your CMS configuration file:

```yaml [YAML]
media_libraries:
  cloudinary:
    config:
      cloud_name: YOUR_CLOUD_NAME
      api_key: YOUR_API_KEY
```

```toml [TOML]
[media_libraries.cloudinary]
[media_libraries.cloudinary.config]
cloud_name = "YOUR_CLOUD_NAME"
api_key = "YOUR_API_KEY"
```

```json [JSON]
{
  "media_libraries": {
    "cloudinary": {
      "config": {
        "cloud_name": "YOUR_CLOUD_NAME",
        "api_key": "YOUR_API_KEY"
      }
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    cloudinary: {
      config: {
        cloud_name: "YOUR_CLOUD_NAME",
        api_key: "YOUR_API_KEY",
      },
    },
  },
}
```

**Legacy `media_library` Option**

Sveltia CMS supports the legacy `media_library` option for backward compatibility with Netlify/Decap CMS. For new configurations, use the `media_libraries` option instead. With the legacy option, only a single media storage provider can be configured. Here is an example of configuring Cloudinary using the legacy option:

```yaml
media_library:
  name: cloudinary
  config:
    cloud_name: YOUR_CLOUD_NAME
    api_key: YOUR_API_KEY
```

The `config` object includes the Cloudinary [Media Library widget options](https://cloudinary.com/documentation/media_library_widget#2_set_the_configuration_options). Here are some important notes regarding the configuration options:

- The following parameters are required. A [field-level configuration](#field-level-configuration) inherits them from the top-level configuration, so they don’t need to be repeated there:
  - `cloud_name`: Your Cloudinary cloud name.
  - `api_key`: Your Cloudinary API key.
- `default_transformations`: Transformations to apply to all uploaded images. Only the first transformation in the array will be applied to uploaded media in Sveltia CMS. See the [Image transformations](#image-transformations) section below for more details on defining transformations.
- `max_files`: The maximum number of assets that can be selected at once. The field’s [`max`](https://sveltiacms.app/en/docs/fields/file#max) option takes precedence if set. Defaults to `20`.
- `multiple`: Whether to allow selecting multiple assets. The field’s [`multiple`](https://sveltiacms.app/en/docs/fields/file#multiple) option takes precedence.
- `folder`: The folder to open in the widget, with its `path` and, optionally, a `resource_type` to show only one type of asset. Without a `resource_type`, the widget shows images only for an [Image](https://sveltiacms.app/en/docs/fields/image) field and every type of asset, including videos and raw files, for a [File](https://sveltiacms.app/en/docs/fields/file) field.
- Some options are not applicable in Sveltia CMS and will be ignored if provided, such as `button_caption`.

**Warning**

Do not write your Cloudinary API secret in the configuration file, as it should be kept confidential and not exposed in client-side code. The API key can be used safely for public operations, and Sveltia CMS does not require the API secret for its functionality.

There are two Sveltia CMS-specific configuration options that can be added alongside the `config` object. Both are optional:

- `output_filename_only`: When set to `true`, only the asset’s public ID, which includes its folder, will be stored in the CMS with the file extension, e.g. `blog/photo.jpg`, instead of the full URL, just like in Netlify/Decap CMS. Defaults to `false`.
- `use_transformations`: Whether to use derived transformation URLs for uploaded media. Defaults to `true`. No effect if `output_filename_only` is `true`.

**Breaking change from Netlify/Decap CMS**

The `use_secure_url` option has been removed in Sveltia CMS. All URLs generated by the Cloudinary media storage will use HTTPS by default to ensure secure delivery of media assets.

The complete configuration with these additional options looks like this:

```yaml [YAML]{6-7}
media_libraries:
  cloudinary:
    config:
      cloud_name: YOUR_CLOUD_NAME
      api_key: YOUR_API_KEY
    output_filename_only: false
    use_transformations: true
```

```toml [TOML]{2-3}
[media_libraries.cloudinary]
output_filename_only = false
use_transformations = true

[media_libraries.cloudinary.config]
cloud_name = "YOUR_CLOUD_NAME"
api_key = "YOUR_API_KEY"
```

```json [JSON]{8-9}
{
  "media_libraries": {
    "cloudinary": {
      "config": {
        "cloud_name": "YOUR_CLOUD_NAME",
        "api_key": "YOUR_API_KEY"
      },
      "output_filename_only": false,
      "use_transformations": true
    }
  }
}
```

```js [JavaScript]{8-9}
{
  media_libraries: {
    cloudinary: {
      config: {
        cloud_name: "YOUR_CLOUD_NAME",
        api_key: "YOUR_API_KEY",
      },
      output_filename_only: false,
      use_transformations: true,
    },
  },
}
```

#### Field-Level Configuration

The `media_libraries` configuration can also be specified at the field level for File and Image fields. This allows you to override the top-level configuration for specific fields. The field-level options are merged over the top-level ones, and so is the `config` object, key by key. A field therefore only needs to set the options it changes:

- `cloud_name` and `api_key` don’t need to be repeated.
- An option such as `use_transformations` is inherited unless the field sets it.
- An array such as `default_transformations` is replaced, not combined.

Setting `cloudinary` to `false` makes Cloudinary unavailable for the field.

Here is an example of configuring a File field to use the Cloudinary media storage with custom default transformations and storing only the filename:

```yaml [YAML]{5-11}
fields:
  - name: cover_image
    label: Cover Image
    widget: image
    media_libraries:
      cloudinary:
        config:
          default_transformations:
            - - quality: auto
                fetch_format: auto
        output_filename_only: true
```

```toml [TOML]{5-8}
[[fields]]
name = "cover_image"
label = "Cover Image"
widget = "image"
[fields.media_libraries.cloudinary]
output_filename_only = true
[fields.media_libraries.cloudinary.config]
default_transformations = [[{quality = "auto", fetch_format = "auto"}]]
```

```json [JSON]{7-21}
{
  "fields": [
    {
      "name": "cover_image",
      "label": "Cover Image",
      "widget": "image",
      "media_libraries": {
        "cloudinary": {
          "config": {
            "default_transformations": [
              [
                {
                  "quality": "auto",
                  "fetch_format": "auto"
                }
              ]
            ]
          },
          "output_filename_only": true
        }
      }
    }
  ]
}
```

```js [JavaScript]{7-21}
{
  fields: [
    {
      name: "cover_image",
      label: "Cover Image",
      widget: "image",
      media_libraries: {
        cloudinary: {
          config: {
            default_transformations: [
              [
                {
                  quality: "auto",
                  fetch_format: "auto",
                },
              ],
            ],
          },
          output_filename_only: true,
        },
      },
    },
  ],
}
```

**Legacy `media_library` Option**

As with the top-level configuration, Sveltia CMS supports the legacy `media_library` option at the field level for backward compatibility. The field-level option applies to the provider set with its `name`. Without a `name`, it applies to the provider named in the top-level `media_library` option, or to the internal media storage if there is none. Its options are merged over the top-level ones in the same way. Here is an example of configuring a File field to use the Cloudinary media storage with the legacy option:

```yaml
media_library:
  name: cloudinary
  config:
    default_transformations:
      - - quality: auto
          fetch_format: auto
  output_filename_only: true
```

### Image Transformations

You can define default image transformations that will be applied to all uploaded images by specifying the `default_transformations` option in the Cloudinary media storage configuration. This option accepts an array of transformation objects, where each object defines a set of transformation parameters. Only the first transformation in the array will be applied to uploaded media in Sveltia CMS.

For example, to resize all uploaded images to a width of 800 pixels and a height of 600 pixels with cropping and automatic gravity, you can configure the `default_transformations` option as follows:

```yaml [YAML]
media_libraries:
  cloudinary:
    config:
      default_transformations:
        - - width: 800
            height: 600
            crop: fill
            gravity: auto
```

```toml [TOML]
[media_libraries.cloudinary]
[media_libraries.cloudinary.config]
default_transformations = [[{width = 800, height = 600, crop = "fill", gravity = "auto"}]]
```

```json [JSON]
{
  "media_libraries": {
    "cloudinary": {
      "config": {
        "default_transformations": [
          [
            {
              "width": 800,
              "height": 600,
              "crop": "fill",
              "gravity": "auto"
            }
          ]
        ]
      }
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    cloudinary: {
      config: {
        default_transformations: [
          [
            {
              width: 800,
              height: 600,
              crop: "fill",
              gravity: "auto",
            },
          ],
        ],
      },
    },
  },
}
```

See the [Transformation URL API reference](https://cloudinary.com/documentation/transformation_reference) for a complete list of available transformation parameters and their options.

### Accessing the Storage

There are two ways to use Cloudinary in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Cloudinary directly within the entry editor. Uploaded files are stored in the Cloudinary account, and the CMS can take advantage of Cloudinary’s transformation capabilities directly. You can also select existing media from your Cloudinary storage.

Users are required to authenticate with Cloudinary using their username and password when accessing the media storage provider. The authentication process is handled automatically by Sveltia CMS using the provided API key.

#### Asset Library

Cloudinary also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). Because the Cloudinary API can’t be called directly from the browser, the CMS opens the Cloudinary Media Library widget instead, where users can browse and manage the files using Cloudinary’s own interface.

### Using Transformations in Page Templates

When the `output_filename_only` option is set to `true`, only the public ID with the file extension, e.g. `blog/photo.jpg`, is stored in your entry data files. To generate the full URL with transformations in your site’s page templates, you can use the [JavaScript SDK](https://cloudinary.com/documentation/javascript_integration) or hardcode [transformed URLs](https://cloudinary.com/documentation/image_transformations) based on your Cloudinary account details. Check the Cloudinary documentation for more information on how to construct URLs with transformations.

Source: https://sveltiacms.app/en/docs/media/cloudinary

---

## Uploadcare Integration

[Uploadcare](https://uploadcare.com/) is a powerful media management service that provides robust file uploading, storage and delivery capabilities. The Uploadcare integration allows users to seamlessly upload and manage media files within Sveltia CMS using Uploadcare’s infrastructure.

**Breaking change from Netlify/Decap CMS**

Sveltia CMS uses the Uploadcare API to integrate the service instead of the deprecated [jQuery File Uploader](https://uploadcare.com/docs/uploads/file-uploader/). This change resolves several issues present in Netlify/Decap CMS, including the ability to select existing files from Uploadcare storage and support for signed uploads.

However, some features available in the previous integration, such as image editing, camera capture and external sources, are not currently supported in Sveltia CMS. We’ll consider adding these features in future releases.

Also, in the `config` object, only the `publicKey`, `multiple` and `cdnBase` options are supported at this time. Please refer to the [Configuration](#configuration) section for more details.

### Requirements

- An Uploadcare account. You can sign up for a free account at [uploadcare.com](https://uploadcare.com/).
- Your Uploadcare public and secret API keys. These can be found in your Uploadcare dashboard under the API Keys section. The public key is required for configuration, while the secret key will be manually entered by users in the CMS UI when they use the storage for the first time.

#### CSP

If your site uses a Content Security Policy (CSP), you may need to update it to allow requests to Uploadcare. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Configuration

#### Top-Level Configuration

To configure the Uploadcare media storage in Sveltia CMS, add the following configuration to the top level of your CMS configuration file:

```yaml [YAML]
media_libraries:
  uploadcare:
    config:
      publicKey: YOUR_PUBLIC_KEY
```

```toml [TOML]
[media_libraries.uploadcare]
[media_libraries.uploadcare.config]
publicKey = "YOUR_PUBLIC_KEY"
```

```json [JSON]
{
  "media_libraries": {
    "uploadcare": {
      "config": {
        "publicKey": "YOUR_PUBLIC_KEY"
      }
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    uploadcare: {
      config: {
        publicKey: "YOUR_PUBLIC_KEY",
      },
    },
  },
}
```

**Legacy `media_library` Option**

Sveltia CMS supports the legacy `media_library` option for backward compatibility with Netlify/Decap CMS. For new configurations, use the `media_libraries` option instead. With the legacy option, only a single media storage provider can be configured. Here is an example of configuring Uploadcare using the legacy option:

```yaml
media_library:
  name: uploadcare
  config:
    publicKey: YOUR_PUBLIC_KEY
```

The `config` object includes the Uploadcare [jQuery File Uploader options](https://uploadcare.com/docs/uploads/file-uploader-options/). However, only `publicKey`, `multiple` and `cdnBase` are supported in Sveltia CMS at this time, as we don’t actually use the pre-built uploader.

- `publicKey` (string, required): Your Uploadcare public API key. A [field-level configuration](#field-level-configuration) inherits it from the top-level configuration, so it doesn’t need to be repeated there.
- `multiple` (boolean, optional): If set to `true`, allows selecting multiple files at once. Default is `false`. This option is available for backward compatibility. Use the `multiple` option in the File or Image field configuration instead, which takes precedence over this option.
- `cdnBase` (string, optional): The CDN origin used in output URLs, such as a custom CDN domain. Default: the origin of the file URL returned by Uploadcare, typically `https://ucarecdn.com`.

**Warning**

Do not write your Uploadcare secret key in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the secret key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

There are two Sveltia CMS-specific configuration options you can include under the `settings` object:

- `autoFilename` (boolean): If set to `true`, a filename will be added at the end of the file URL when selecting files, e.g. `https://ucarecdn.com/UUID/filename.jpg`. Default is `false`.
- `defaultOperations` (string): A string of default image transformation operations to be applied to images when they are selected. It must start with a slash, and it’s not added to the URLs of non-image files. For example, `/resize/800x600/` will resize images to fit within 800x600 pixels by default. See the [Uploadcare documentation](https://uploadcare.com/docs/transformations/image/) for available operations.

**Tip**

Unlike most other config options, the setting keys are camelCased. (Not `auto_filename` but `autoFilename`.)

The complete configuration with these additional options looks like this:

```yaml [YAML]{5-7}
media_libraries:
  uploadcare:
    config:
      publicKey: YOUR_PUBLIC_KEY
    settings:
      autoFilename: true
      defaultOperations: '/resize/800x600/'
```

```toml [TOML]{5-7}
[media_libraries.uploadcare]
[media_libraries.uploadcare.config]
publicKey = "YOUR_PUBLIC_KEY"

[media_libraries.uploadcare.settings]
autoFilename = true
defaultOperations = "/resize/800x600/"
```

```json [JSON]{7-10}
{
  "media_libraries": {
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

```js [JavaScript]{7-10}
{
  media_libraries: {
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

#### Field-Level Configuration

The `media_libraries` configuration can also be specified at the field level for File and Image fields. This allows you to override the top-level configuration for specific fields. The field-level options are merged over the top-level ones, and so are the `config` and `settings` objects, key by key. A field therefore only needs to set the options it changes. For example, `publicKey` doesn’t need to be repeated, and a setting such as `autoFilename` is inherited unless the field sets it.

Setting `uploadcare` to `false` makes Uploadcare unavailable for the field.

Here is an example of configuring a File field to use the Uploadcare media storage with custom default operations:

```yaml [YAML]{4-7}
- name: my_image
  label: My Image
  widget: image
  media_libraries:
    uploadcare:
      settings:
        defaultOperations: '/crop/200x200/'
```

```toml [TOML]{5-6}
[[fields]]
name = "my_image"
label = "My Image"
widget = "image"
[fields.media_libraries.uploadcare.settings]
defaultOperations = "/crop/200x200/"
```

```json [JSON]{5-11}
{
  "name": "my_image",
  "label": "My Image",
  "widget": "image",
  "media_libraries": {
    "uploadcare": {
      "settings": {
        "defaultOperations": "/crop/200x200/"
      }
    }
  }
}
```

```js [JavaScript]{5-11}
{
  name: "my_image",
  label: "My Image",
  widget: "image",
  media_libraries: {
    uploadcare: {
      settings: {
        defaultOperations: "/crop/200x200/",
      },
    },
  },
}
```

**Legacy `media_library` Option**

As with the top-level configuration, Sveltia CMS supports the legacy `media_library` option at the field level for backward compatibility. The field-level option applies to the provider set with its `name`. Without a `name`, it applies to the provider named in the top-level `media_library` option, or to the internal media storage if there is none. Its options are merged over the top-level ones in the same way. Here is an example of configuring a File field to use the Uploadcare media storage with the legacy option:

```yaml
media_library:
  name: uploadcare
  settings:
    defaultOperations: '/crop/200x200/'
```

### Signed Uploads

To enhance security, Uploadcare supports [signed uploads](https://uploadcare.com/docs/security/secure-uploads/), which require a secret key to generate upload signatures. Sveltia CMS prompts users to enter the secret key when they use the Uploadcare storage for the first time. The key is securely stored in the browser’s local storage, and all later uploads are automatically signed with it. No configuration is needed in the CMS config file.

### Accessing the Storage

There are two ways to use Uploadcare in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Uploadcare directly within the entry editor. Uploaded files are stored in the Uploadcare account, and the CMS can take advantage of Uploadcare’s transformation capabilities directly. You can also select existing media from your Uploadcare storage.

#### Asset Library

Uploadcare also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files, and upload, download or delete them without leaving the CMS. Files can’t be renamed or replaced, because the Uploadcare REST API doesn’t support renaming, and a re-uploaded file gets a new UUID and therefore a new URL.

Source: https://sveltiacms.app/en/docs/media/uploadcare

---

## Azure Blob Storage Integration

[Azure Blob Storage](https://azure.microsoft.com/products/storage/blobs/) is Microsoft’s object storage service for unstructured data. Unlike most of the other object storage services Sveltia CMS supports, Blob Storage does not offer an S3-compatible API, so the CMS talks to the [Blob Service REST API](https://learn.microsoft.com/en-us/rest/api/storageservices/blob-service-rest-api) directly. Requests are authorized with a [shared access signature (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview) token, and files are uploaded straight from the browser to Azure — no backend proxy is required.

### Requirements

- An Azure storage account with a blob container created.
- A SAS token with the Read, Write, Create, List and Delete permissions on that container (see [Credentials](#credentials) below).
- A CORS rule on the storage account’s Blob service (see [CORS](#cors) below).
- A `public_url` configured, unless the container allows anonymous read access (see [Public Read Access](#public-read-access) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the Blob service endpoint and your public URL. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

Azure storage account keys can’t be scoped to a single container — they grant full control over the entire storage account — so Sveltia CMS uses a SAS token instead. A SAS is limited to the permissions and expiry you choose, and it’s the only credential the CMS needs.

Create a **service SAS** for the container via **Azure Portal > Storage account > Data storage > Containers > [container] > Shared access tokens**:

- **Signing method**: Account key (or User delegation key; see the note below)
- **Permissions**: Read, Create, Write, List, Delete. The Delete permission is only needed to delete and rename blobs from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library); leave it out if you don’t want editors to remove files
- **Expiry**: as far out as your security policy allows (see [Token Expiry](#token-expiry) below)
- **Allowed protocols**: HTTPS only

Click **Generate SAS token and URL** and copy the **Blob SAS token** — the query string that starts with `sv=`, not the full URL below it.

An **account SAS**, created under **Storage account > Security + networking > Shared access signature**, works as well. It needs **Allowed services**: Blob, **Allowed resource types**: Container and Object, and the same permissions as above.

The token is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config. See [Accessing the Storage](#accessing-the-storage) below.

**Accounts that disallow Shared Key**

If your storage account has **Allow storage account key access** disabled, neither a service SAS nor an account SAS signed with the account key will be accepted. Generate a [user delegation SAS](https://learn.microsoft.com/en-us/rest/api/storageservices/create-user-delegation-sas), which is signed with Microsoft Entra ID credentials instead:

```sh
az storage container generate-sas \
  --account-name mystorageaccount \
  --name my-container \
  --permissions rcwld \
  --expiry 2026-12-31T00:00Z \
  --auth-mode login --as-user \
  --https-only --output tsv
```

A user delegation SAS is valid for a maximum of seven days.

#### Token Expiry

Every SAS token has an expiry date. Once it passes, the media library stops loading with an authorization error, and users need to generate a new token and enter it again in the CMS. Choose an expiry that balances your security policy against how often your editors want to repeat that step.

#### Public Read Access

Blob containers are private by default, and new storage accounts have anonymous access disabled at the account level. This matters because the URL Sveltia CMS writes into your entries can’t contain the SAS token — the token expires, and the URL would break with it.

Two options are available:

**Option A — Anonymous read access on the container:**

1. In **Storage account > Settings > Configuration**, set **Allow blob anonymous access** to **Enabled**.
2. In **Containers > [container] > Change access level**, choose **Blob (anonymous read access for blobs only)**.

Asset URLs are then the blob endpoint URLs, and `public_url` is optional.

**Option B — CDN or custom domain (recommended for production):**

Put [Azure CDN](https://learn.microsoft.com/en-us/azure/cdn/) or [Azure Front Door](https://learn.microsoft.com/en-us/azure/frontdoor/) in front of the container, then set that hostname as `public_url` in your config:

```yaml
public_url: 'https://media.example.com'
```

Asset URLs are constructed as `{public_url}/{blob name}`, using the full blob name, including any `prefix`.

**Previews vs. stored URLs**

When `public_url` is omitted, previews within the CMS still work against a private container, because the SAS token is appended to the preview URL. The URL saved into your entries is the plain blob URL without the token, so it only resolves for your site’s visitors if the container allows anonymous read access.

#### CORS

Configure cross-origin resource sharing under **Storage account > Settings > Resource sharing (CORS) > Blob service**. CORS is required because Sveltia CMS reads and writes blobs directly from the browser, and the `x-ms-blob-type` header it sends on uploads triggers a preflight request.

| Setting | Value |
| --- | --- |
| Allowed origins | `https://your-cms-domain.com` |
| Allowed methods | `GET`, `HEAD`, `OPTIONS`, `PUT`, `DELETE` |
| Allowed headers | `*` (or `x-ms-blob-type,x-ms-copy-source,content-type`) |
| Exposed headers | `*` |
| Max age | `3600` |

The equivalent Azure CLI command:

```sh
az storage cors add \
  --services b \
  --methods GET HEAD OPTIONS PUT DELETE \
  --origins https://your-cms-domain.com \
  --allowed-headers '*' \
  --exposed-headers '*' \
  --max-age 3600 \
  --account-name mystorageaccount
```

CORS rules are set per storage account, not per container, and they apply to the Blob service as a whole.

The `DELETE` method and the `x-ms-copy-source` header are needed to delete and rename blobs from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). If you configured CORS before these operations became available, add them to your existing rule. Otherwise, the browser will block those requests during the preflight check.

### Configuration

Here’s an example configuration for Azure Blob Storage:

```yaml [YAML]
media_libraries:
  azure_blob_storage:
    account_name: mystorageaccount
    container: my-container
    public_url: https://media.example.com # Optional
    prefix: cms-uploads/ # Optional
```

```toml [TOML]
[media_libraries.azure_blob_storage]
account_name = "mystorageaccount"
container = "my-container"
public_url = "https://media.example.com" # Optional
prefix = "cms-uploads/" # Optional
```

```json [JSON]
{
  "media_libraries": {
    "azure_blob_storage": {
      "account_name": "mystorageaccount",
      "container": "my-container",
      "public_url": "https://media.example.com",
      "prefix": "cms-uploads/"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    azure_blob_storage: {
      account_name: 'mystorageaccount',
      container: 'my-container',
      public_url: 'https://media.example.com', // Optional
      prefix: 'cms-uploads/', // Optional
    },
  },
}
```

**Warning**

Do not write your SAS token in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the token when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `account_name` | Yes | The storage account name. Used to construct the Blob service endpoint, `https://{account_name}.blob.core.windows.net`. Not required if `endpoint` is given. |
| `container` | Yes | The blob container name. |
| `public_url` | No | Public URL for asset downloads. Required unless the container allows anonymous read access, because the URL stored in your entries can’t contain the SAS token. |
| `prefix` | No | Path prefix within the container, e.g. `uploads/`. A trailing slash is added if missing. |
| `endpoint` | No | Custom Blob service endpoint, including the account path where applicable, e.g. the [Azurite emulator](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite) URL `http://127.0.0.1:10000/devstoreaccount1`. Overrides `account_name`. |

### Content Security Policy

Allow the Blob service endpoint for your storage account:

```
connect-src https://mystorageaccount.blob.core.windows.net;
img-src     https://mystorageaccount.blob.core.windows.net;
```

If you serve assets through a CDN or custom domain via `public_url`, add that host to `connect-src` and use it for `img-src` instead:

```
connect-src https://mystorageaccount.blob.core.windows.net
            https://media.example.com;
img-src     https://media.example.com;
```

The asset host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from its public URL. For the same reason, a CDN or custom domain must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

Replace `mystorageaccount` with your actual storage account name.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Accessing the Storage

There are two ways to use Azure Blob Storage in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Azure Blob Storage directly within the entry editor. After entering the SAS token in the CMS UI when prompted — or at any time under **Settings > Media > Cloud Storage Service API Keys** — users can upload new media directly to Azure or select existing media from the container.

When uploading media, files are stored in the container as block blobs, and the CMS can take advantage of Azure’s capabilities directly from the CMS. You can also select existing media from your Blob Storage.

#### Asset Library

Azure Blob Storage also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the blobs in your container, and upload, rename, replace, download or delete them without leaving the CMS. Deleting requires a SAS token with the Delete permission. So does renaming, which copies the blob to the new name and then deletes the original.

The blobs are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations) by their virtual directories:

- Subfolders are listed ahead of the blobs.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted. An empty folder is kept with a zero-byte placeholder blob named after it with a trailing slash, and renaming a folder copies and deletes each blob in it.

Source: https://sveltiacms.app/en/docs/media/azure-blob-storage

---

## Stock Photos

Sveltia CMS includes built-in support for integrating free stock photo services directly into the media storage. This allows content creators to easily search for and insert high-quality images into their content without leaving the CMS interface.

### Supported Services

Currently, Sveltia CMS supports the following free stock photo providers:

- [Lorem Picsum](https://picsum.photos/)
- [Pexels](https://www.pexels.com/)
- [Pixabay](https://pixabay.com/)
- [Unsplash](https://unsplash.com/)

**Future Plans**

More providers, including paid stock photo services, may be added in future releases.

#### Note on Lorem Picsum

- You don’t need an API key to use Lorem Picsum, so it’s the easiest option to get started with stock photos in Sveltia CMS.
- Their pictures are mainly for placeholder use, so they may not be suitable for all types of content. However, they can be a great option for testing or when you need generic images without specific themes.
- Their pictures are [CC0 licensed](https://github.com/DMarby/picsum-photos/issues/81#issuecomment-1340068800), which means they are free to use without giving credit to the creator.
- You can access 300 random pictures quickly, but you cannot search for specific images using keywords. Due to the nature of the service, the images do not have tags or captions.
- Unfortunately, there is no alternative text for the images because they do not have tags or captions. This makes them inaccessible to some users.

#### Non-hotlinking Providers

Pexels and Pixabay don’t allow hotlinking, so they need the [internal media storage](https://sveltiacms.app/en/docs/media/internal). They are disabled if the internal media storage is disabled because the configuration lacks the [`media_folder` option](https://sveltiacms.app/en/docs/media/internal#media-folder). They are also hidden for a field where the internal media storage is [disabled](https://sveltiacms.app/en/docs/media/internal#disabling-internal-media-storage-for-a-field) with `media_libraries.default: false`.

### Requirements

Except for Lorem Picsum, which does not require an API key, you must obtain an API key for each stock photo service you wish to use. Register for developer accounts at the following links to get your API keys:

- [Pexels API](https://www.pexels.com/api/)
- [Pixabay API](https://pixabay.com/service/about/api/)
- [Unsplash API](https://unsplash.com/developers)

#### CSP

If your site uses a Content Security Policy (CSP), you may need to update it to allow requests to stock photo providers. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Configuration

No additional configuration is required to enable stock photo providers, as they are included by default. However, developers can customize which providers are available or disable them entirely.

To enable or disable specific stock photo providers, you can modify the `providers` array in the `media_libraries` section of your `config.yml` file. For example, to enable only Unsplash, you would configure it as follows:

```yaml [YAML]
media_libraries:
  stock_assets:
    providers:
      - unsplash
```

```toml [TOML]
[media_libraries.stock_assets]
providers = ["unsplash"]
```

```json [JSON]
{
  "media_libraries": {
    "stock_assets": {
      "providers": ["unsplash"]
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    stock_assets: {
      providers: ["unsplash"],
    },
  },
}
```

To disable stock photo providers, you can set the `providers` array to be empty in the `media_libraries` section of your `config.yml` file, as shown below:

```yaml [YAML]
media_libraries:
  stock_assets:
    providers: []
```

```toml [TOML]
[media_libraries.stock_assets]
providers = []
```

```json [JSON]
{
  "media_libraries": {
    "stock_assets": {
      "providers": []
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    stock_assets: {
      providers: [],
    },
  },
}
```

Setting `stock_assets` to `false` also disables all the providers.

The `stock_assets` option can be set for an individual [Image](https://sveltiacms.app/en/docs/fields/image) field under its `media_libraries` option as well. The field-level options are merged over the top-level ones, so a field can offer a different set of providers, or none.

### Using Stock Photos

Stock photos can be accessed directly from the [Image](https://sveltiacms.app/en/docs/fields/image) field in the Sveltia CMS interface. When opening the Select Images dialog, stock photo options are shown alongside the existing media storage.

Select the desired stock photo provider and provide an API key to enable the service. API keys are stored securely in the browser’s local storage, so users don’t need to enter them every time. Lorem Picsum doesn’t require an API key, so it will be available immediately without any configuration.

By default, curated images from each provider are available for quick access. You can also use the search functionality to find specific images based on keywords. Lorem Picsum doesn’t support searching as mentioned earlier, so it will only show random images.

Once the desired image is found, simply select it, and it will be inserted into the content just like any other media asset. The CMS may show a dialog where you can copy the image credit information to comply with attribution requirements.

Note that some providers require hotlinking to the image’s original URL, while others disallow hotlinking. Sveltia CMS handles this automatically based on the provider’s policies. If necessary, it downloads the image to the media storage.

When an Unsplash photo is inserted, Sveltia CMS also notifies Unsplash of the download using your API key, as the [Unsplash API guidelines](https://help.unsplash.com/en/articles/2511258-guideline-triggering-a-download) require.

**Multi-user setups**

If your CMS instance is used by multiple users, the administrator needs to distribute an API key to all users to let them use the stock photo feature.

Alternatively, each user can provide their own API key. However, this is not recommended for instances with non-technical end users because generating and managing API keys may be challenging for them.

Source: https://sveltiacms.app/en/docs/integrations/stock-photos
