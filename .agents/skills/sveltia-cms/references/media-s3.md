# S3-Compatible Media Storage Providers

Amazon S3 and providers that expose an S3-compatible API: Backblaze B2, Bunny Storage, Cloudflare R2, DigitalOcean Spaces, Neon Object Storage, Scaleway Object Storage and Supabase Storage.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Amazon S3 Integration

[Amazon S3](https://aws.amazon.com/s3/) (Simple Storage Service) is a scalable object storage service provided by AWS. Sveltia CMS supports S3 as a media storage backend with direct browser-to-S3 uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- An AWS account with an S3 bucket created.
- An IAM user with an access key and the minimum required permissions (see [Credentials](#credentials) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the S3 endpoint. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

Create an IAM user with programmatic access and attach a policy granting the minimum required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket", "s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": ["arn:aws:s3:::my-bucket", "arn:aws:s3:::my-bucket/*"]
    }
  ]
}
```

The `s3:DeleteObject` action is only needed to delete and rename files and folders from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). Leave it out if you don’t want editors to remove files. Renaming copies the object to the new key and then deletes the original. An empty folder is kept with a zero-byte placeholder object.

The resulting **Access Key ID** goes in `access_key_id` in your config. The **Secret Access Key** is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

#### Public Read Access

Asset preview and download URLs are unsigned direct storage URLs, so objects must be publicly readable. Sveltia CMS doesn’t set object ACLs, which new buckets have disabled by default, so grant public read access with a bucket policy instead:

1. In the S3 console, open the bucket’s **Permissions** tab.
2. Under **Block Public Access**, disable `BlockPublicPolicy` and `RestrictPublicBuckets`.
3. Add a bucket policy granting `s3:GetObject` to `"Principal": "*"` for the objects path:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-bucket/cms-uploads/*"
    }
  ]
}
```

#### CORS

Configure cross-origin resource sharing in the S3 console under **Bucket > Permissions > Cross-origin resource sharing (CORS)**. CORS is required because Sveltia CMS sends custom AWS Signature v4 headers that trigger a preflight request.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://your-cms-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

The `DELETE` method and the wildcard `AllowedHeaders` are needed to delete and rename files from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). If you configured CORS before these operations became available, add them to your existing policy. Otherwise, the browser will block those requests during the preflight check.

#### Bucket Naming

For virtual-hosted-style URLs (the default), the bucket name must be DNS-compatible: lowercase letters, numbers and hyphens only. If your bucket name contains underscores, use `force_path_style: true` in your config.

### Configuration

Here’s an example configuration for Amazon S3:

<!-- cSpell:disable -->

```yaml [YAML]
media_libraries:
  aws_s3:
    access_key_id: AKIAIOSFODNN7EXAMPLE
    bucket: my-website-assets
    region: us-east-1
    prefix: cms-uploads/ # Optional
    force_path_style: false # Optional, see Bucket Naming above
    public_url: https://media.example.com # Optional, see Custom Domain below
```

```toml [TOML]
[media_libraries.aws_s3]
access_key_id = "AKIAIOSFODNN7EXAMPLE"
bucket = "my-website-assets"
region = "us-east-1"
prefix = "cms-uploads/"
force_path_style = false
public_url = "https://media.example.com"
```

```json [JSON]
{
  "media_libraries": {
    "aws_s3": {
      "access_key_id": "AKIAIOSFODNN7EXAMPLE",
      "bucket": "my-website-assets",
      "region": "us-east-1",
      "prefix": "cms-uploads/",
      "force_path_style": false,
      "public_url": "https://media.example.com"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    aws_s3: {
      access_key_id: 'AKIAIOSFODNN7EXAMPLE',
      bucket: 'my-website-assets',
      region: 'us-east-1',
      prefix: 'cms-uploads/', // Optional
      force_path_style: false, // Optional
      public_url: 'https://media.example.com', // Optional
    },
  },
}
```

<!-- cSpell:enable -->

**Warning**

Do not write your Secret Access Key in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `access_key_id` | Yes | AWS Access Key ID (safe to store in config). |
| `bucket` | Yes | The S3 bucket name. |
| `region` | Yes | AWS region, e.g. `us-east-1`, `eu-west-1`. With a custom `endpoint`, the region of your server; see [Self-Hosted Storage](#self-hosted-storage) below. |
| `prefix` | No | Path prefix within the bucket, e.g. `uploads/`. A trailing slash is added if missing. |
| `force_path_style` | No | Use path-style URLs (`s3.region.amazonaws.com/bucket`) instead of virtual-hosted-style (`bucket.s3.region.amazonaws.com`). Defaults to `false`. Has no effect with `endpoint`, which always uses path-style URLs. |
| `endpoint` | No | Custom endpoint URL for another S3-compatible service, such as [Garage](https://garagehq.deuxfleurs.fr/) or [MinIO](https://www.min.io/), e.g. `https://s3.example.com`. Objects are addressed as `{endpoint}/{bucket}/{key}`. See [Self-Hosted Storage](#self-hosted-storage) below. |
| `public_url` | No | Custom domain for asset URLs (e.g. a CloudFront distribution). See [Custom Domain](#custom-domain) below. |

### Custom Domain

If you serve assets through a CloudFront distribution or a Route 53 custom domain pointing to your S3 bucket, set `public_url` to that URL. Asset preview and download URLs in the CMS will use the custom domain instead of the S3 endpoint:

```yaml
public_url: 'https://media.example.com'
```

The S3 API endpoint is still used for listing and uploading — only the asset URLs shown in the CMS change. See the [Route 53 getting-started guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/getting-started-s3.html) for setting up a custom domain with S3.

### Self-Hosted Storage

The Amazon S3 integration also works with a self-hosted, S3-compatible object storage server, such as [Garage](https://garagehq.deuxfleurs.fr/) or [MinIO](https://www.min.io/), for organizations that must keep their assets on their own infrastructure. Set `endpoint` to the URL of the server’s S3 API:

<!-- cSpell:disable -->

```yaml [YAML]
media_libraries:
  aws_s3:
    endpoint: https://s3.example.com
    region: garage
    access_key_id: GK31c2f218a2e44f485b94239e
    bucket: my-website-assets
    public_url: https://my-website-assets.web.example.com # Optional, see below
```

```toml [TOML]
[media_libraries.aws_s3]
endpoint = "https://s3.example.com"
region = "garage"
access_key_id = "GK31c2f218a2e44f485b94239e"
bucket = "my-website-assets"
public_url = "https://my-website-assets.web.example.com"
```

```json [JSON]
{
  "media_libraries": {
    "aws_s3": {
      "endpoint": "https://s3.example.com",
      "region": "garage",
      "access_key_id": "GK31c2f218a2e44f485b94239e",
      "bucket": "my-website-assets",
      "public_url": "https://my-website-assets.web.example.com"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    aws_s3: {
      endpoint: 'https://s3.example.com',
      region: 'garage',
      access_key_id: 'GK31c2f218a2e44f485b94239e',
      bucket: 'my-website-assets',
      public_url: 'https://my-website-assets.web.example.com', // Optional, see below
    },
  },
}
```

<!-- cSpell:enable -->

Keep the following in mind:

- **Path-style URLs:** With a custom `endpoint`, objects are always addressed as `{endpoint}/{bucket}/{key}`, so the server doesn’t need a wildcard DNS record or a TLS certificate for bucket subdomains. `force_path_style` has no effect.
- **Region:** The region isn’t part of the URL, but it’s used to sign every request. It must therefore match the region the server is configured with. For Garage, that’s the `s3_region` option (`garage` in the sample configuration). For MinIO, it’s `us-east-1` unless you’ve changed it. A mismatch makes every request fail with a signature error.
- **CORS:** The server must allow cross-origin requests from the CMS origin, as described in [CORS](#cors) above. With Garage, apply the same policy to the bucket through its S3 API, e.g. with `aws s3api put-bucket-cors --endpoint-url https://s3.example.com`. MinIO allows any origin by default. If you’ve restricted it, add the CMS origin to its `cors_allow_origin` setting.
- **Public read access:** Asset preview and download URLs are unsigned, so objects must be readable without credentials. On MinIO, allow anonymous downloads on the bucket, e.g. with `mc anonymous set download`. Garage doesn’t serve anonymous requests on its S3 API. Instead, enable [website access](https://garagehq.deuxfleurs.fr/documentation/cookbook/exposing-websites/) on the bucket and set `public_url` to the bucket’s web endpoint or a reverse proxy in front of it.
- **HTTPS:** If the CMS is served over HTTPS, browsers block requests to a plain `http://` endpoint as mixed content, except for `localhost`. Put the server behind a reverse proxy with a TLS certificate.
- **Content Security Policy:** Add the `endpoint` origin, and the `public_url` origin if any, to `connect-src` and `img-src`. See [Content Security Policy](#content-security-policy) below.

### Content Security Policy

The URL pattern depends on whether `force_path_style` is enabled.

**Virtual-hosted-style (default)** — `https://{bucket}.s3.{region}.amazonaws.com`:

```
connect-src https://*.s3.us-east-1.amazonaws.com;
img-src     https://*.s3.us-east-1.amazonaws.com;
```

**Path-style (`force_path_style: true`)** — `https://s3.{region}.amazonaws.com/{bucket}`:

```
connect-src https://s3.us-east-1.amazonaws.com;
img-src     https://s3.us-east-1.amazonaws.com;
```

Replace `us-east-1` with your actual bucket region.

If using a custom domain via `public_url`, add it to `connect-src` and `img-src` as well:

```
connect-src https://*.s3.us-east-1.amazonaws.com
            https://media.example.com;
img-src     https://*.s3.us-east-1.amazonaws.com
            https://media.example.com;
```

The asset host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from its public URL. For the same reason, a custom domain must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Accessing the Storage

There are two ways to use Amazon S3 in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Amazon S3 directly within the entry editor. After entering the Secret Access Key in the CMS UI when prompted, users can upload new media directly to S3 or select existing media from the bucket.

When uploading media, files will be stored in the S3 bucket, and the CMS can take advantage of S3’s capabilities directly from the CMS. You can also select existing media from your S3 storage.

#### Asset Library

Amazon S3 also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your bucket, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/amazon-s3

---

## Backblaze B2 Integration

[Backblaze B2](https://www.backblaze.com/cloud-storage) is an S3-compatible object storage service with zero egress fees and low-cost storage. Sveltia CMS supports B2 as a media storage backend with direct browser-to-B2 uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- A Backblaze account with a B2 bucket created.
- A B2 Application Key (see [Credentials](#credentials) below).
- **CORS configuration via CLI** (see [CORS](#cors) below) — the web console doesn’t support the required S3 operations.

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the B2 endpoint. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

B2 uses Application Keys for authentication. You can create keys via **Backblaze Console > Account > Application Keys**.

For production use, create a **bucket-scoped Application Key** with the following capabilities:

- `listFiles`
- `readFiles`
- `writeFiles`
- `deleteFiles`

Using the B2 CLI:

```sh
b2 key create --bucket my-bucket sveltia-cms listFiles,readFiles,writeFiles,deleteFiles
```

The resulting **keyID** goes in `access_key_id` in your config. The **applicationKey** (shown only once) is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

#### Public Read Access

For asset previews and downloads to work, objects must be publicly readable. When creating a bucket, set its visibility to **Public**:

```sh
b2 bucket create my-bucket allPublic
```

**Info**

Making a bucket public requires a payment method on your Backblaze account. Alternatively, you can use a private bucket with a custom `public_url` pointing to a CDN that provides public access.

With a public bucket, B2’s S3 endpoint serves objects anonymously, so no separate `public_url` configuration is needed — asset URLs use the virtual-hosted storage endpoint directly (`https://{bucket}.s3.{region}.backblazeb2.com/{key}`).

#### CORS

**Important**

The CORS configuration required by Sveltia CMS **cannot be set via the B2 web console**. The console only offers four basic presets that don’t include the S3 operations needed for uploads and listings. You must use the **B2 CLI**, native API or AWS CLI to configure CORS.

This is documented, by-design behavior — see [Enable and Manage CORS Rules in the Enterprise Web Console](https://www.backblaze.com/docs/cloud-storage-enable-and-manage-cors-rules).

CORS is required because Sveltia CMS sends custom AWS Signature v4 headers that trigger a preflight request.

##### Setting CORS via B2 CLI

**1. Install and authorize the B2 CLI** (use a key with `writeBuckets` capability):

See the [official documentation](https://www.backblaze.com/docs/cloud-storage-command-line-tools) for installation instructions.

```sh
b2 account authorize <adminKeyId> <adminKey>
```

**2. Set the CORS rule with S3 operations:**

```sh
b2 bucket update --cors-rules '[{
  "corsRuleName": "sveltia-cms",
  "allowedOrigins": ["https://your-cms-domain.com"],
  "allowedOperations": ["s3_get", "s3_head", "s3_put", "s3_delete"],
  "allowedHeaders": ["*"],
  "exposeHeaders": ["ETag", "x-amz-request-id"],
  "maxAgeSeconds": 3600
}]' my-bucket allPublic
```

Replace `https://your-cms-domain.com` with your actual CMS origin and `my-bucket` with your bucket name. A wildcard `*` is allowed for `allowedOrigins` if you want to allow all origins.

**Tip**

You can also pass `--cors-rules` to `b2 bucket create` to set CORS when creating the bucket.

See the [official documentation](https://www.backblaze.com/docs/cloud-storage-enable-cors-with-the-cli) for more details on CORS configuration.

**3. Verify the configuration** (optional):

```sh
b2 bucket get my-bucket
```

##### Required CORS Operations

The S3 operations Sveltia CMS requires are:

- `s3_get` — for `ListObjectsV2` (listing) and `GetObject` (preview/download)
- `s3_head` — optional, for the unsigned `HEAD` requests the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) sends to check whether files linked from entries still exist
- `s3_put` — for `PutObject` (uploads and replacements) and `CopyObject` (renames)
- `s3_delete` — for `DeleteObject` (deletions and renames)

Sveltia CMS uploads each file with a single `PUT` request, so `s3_post` (used for multipart uploads) isn’t needed.

Deleting and renaming files from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) require `s3_delete` and the wildcard `allowedHeaders`. If your existing rule lacks them, update it. Otherwise, the browser will block those requests during the preflight check.

B2 maps these native operations to the standard S3 HTTP methods (`GET`, `HEAD`, `PUT`, `DELETE`).

### Configuration

Here’s an example configuration for Backblaze B2:

<!-- cSpell:disable -->

```yaml [YAML]
media_libraries:
  backblaze_b2:
    access_key_id: 0123456789abcdef0123456789ab
    bucket: my-bucket
    region: us-east-005
    prefix: cms-uploads/ # Optional
    public_url: https://cdn.example.com # Optional, only for private buckets
```

```toml [TOML]
[media_libraries.backblaze_b2]
access_key_id = "0123456789abcdef0123456789ab"
bucket = "my-bucket"
region = "us-east-005"
prefix = "cms-uploads/"
public_url = "https://cdn.example.com"
```

```json [JSON]
{
  "media_libraries": {
    "backblaze_b2": {
      "access_key_id": "0123456789abcdef0123456789ab",
      "bucket": "my-bucket",
      "region": "us-east-005",
      "prefix": "cms-uploads/",
      "public_url": "https://cdn.example.com"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    backblaze_b2: {
      access_key_id: '0123456789abcdef0123456789ab',
      bucket: 'my-bucket',
      region: 'us-east-005',
      prefix: 'cms-uploads/', // Optional
      public_url: 'https://cdn.example.com', // Optional
    },
  },
}
```

<!-- cSpell:enable -->

**Warning**

Do not write your Application Key (secret) in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `access_key_id` | Yes | B2 Application Key ID (keyID). Safe to store in config. |
| `bucket` | Yes | The B2 bucket name. |
| `region` | Yes | B2 region, e.g. `us-west-001`, `us-east-005`, `eu-central-003`. See [B2 regions list](https://www.backblaze.com/docs/cloud-storage-regions-and-endpoints). |
| `prefix` | No | Path prefix within the bucket, e.g. `uploads/`. A trailing slash is added if missing. |
| `public_url` | No | CDN or custom domain URL for asset previews. Only required for **private buckets**. Public buckets serve objects directly via the S3 endpoint. |

### Public Buckets vs. Private Buckets

#### Public Buckets (Recommended for Simplicity)

When a bucket is set to **Public** (`allPublic`), B2’s S3 endpoint serves objects anonymously without authentication. Asset URLs use the virtual-hosted storage endpoint:

```
https://{bucket}.s3.{region}.backblazeb2.com/{key}
```

No `public_url` configuration is needed — previews and downloads work automatically.

#### Private Buckets (Requires CDN)

For private buckets, you must configure a `public_url` pointing to a CDN or proxy that provides public access to the objects. B2’s S3 API always requires authentication, so direct storage URLs won’t work for previews in the CMS.

```yaml
public_url: 'https://cdn.example.com'
```

**Warning**

The storage endpoint is always used for listing and uploading operations regardless of the `public_url` setting. Only the asset preview/download URLs shown in the CMS change.

### Content Security Policy

API calls (list, upload) go to `https://s3.{region}.backblazeb2.com`. For public buckets, asset URLs use `https://{bucket}.s3.{region}.backblazeb2.com`:

```
connect-src https://s3.us-east-005.backblazeb2.com
            https://my-bucket.s3.us-east-005.backblazeb2.com;
img-src     https://my-bucket.s3.us-east-005.backblazeb2.com;
```

If using a private bucket with a CDN via `public_url`:

```
connect-src https://s3.us-east-005.backblazeb2.com
            https://cdn.example.com;
img-src     https://cdn.example.com;
```

Replace `us-east-005` and `my-bucket` with your actual region and bucket name.

The asset host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from its public URL. For the same reason, a CDN must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### B2-Specific Notes

#### No Per-Object ACLs

B2’s S3 API does not support the `x-amz-acl` header for per-object access control. Visibility is controlled at the bucket level (public or private). Sveltia CMS doesn’t send the header to B2, so uploads work correctly regardless of bucket visibility.

#### Region Endpoint

B2 uses a region-specific endpoint for the S3 API (`https://s3.{region}.backblazeb2.com`), and asset URLs use virtual-hosted-style addressing (`https://{bucket}.s3.{region}.backblazeb2.com/{key}`) for public buckets. This is handled automatically by Sveltia CMS.

### Accessing the Storage

There are two ways to use Backblaze B2 in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Backblaze B2 directly within the entry editor. After entering the Application Key (secret) in the CMS UI when prompted, users can upload new media directly to B2 or select existing media from the bucket.

When uploading media, files will be stored in the B2 bucket with zero egress fees for downloads. You can also select existing media from your B2 storage.

#### Asset Library

Backblaze B2 also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your bucket, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/backblaze-b2

---

## Bunny Storage Integration

[Bunny Storage](https://bunny.net/storage/) is a low-cost object storage service from bunny.net with built-in replication and delivery through the Bunny CDN. Sveltia CMS supports Bunny Storage as a media storage backend through its [S3-compatible API](https://bunny.net/docs/storage/s3), with direct browser-to-storage uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- A bunny.net account with a storage zone created in a region that supports the S3 API (see [Regions](#regions) below).
- The storage zone password (see [Credentials](#credentials) below).
- A pull zone connected to the storage zone, set as `public_url` for asset previews (see [Public Read Access](#public-read-access) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the Bunny Storage S3 endpoint and your pull zone hostname. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

Bunny Storage doesn’t use separate access keys. Instead, the S3 API authenticates with the storage zone itself:

- The **Access Key ID** is the **storage zone name**, which is also the bucket name. Sveltia CMS fills this in automatically from `bucket`, so you don’t need to set `access_key_id`.
- The **Secret Access Key** is the **storage zone password**. Find it under **bunny.net Dashboard > Storage > [zone] > FTP & API Access**. The password is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

**Tip**

Use the zone’s read-write password, not a read-only password, so that uploads, renames and deletions work.

#### Regions

The S3 API is available at a region-specific endpoint, `https://{region}-s3.storage.bunnycdn.com`, where `{region}` is the two-letter code of your storage zone’s main region:

| Region code | Location     |
| ----------- | ------------ |
| `de`        | Frankfurt    |
| `uk`        | London       |
| `se`        | Stockholm    |
| `ny`        | New York     |
| `la`        | Los Angeles  |
| `sg`        | Singapore    |
| `syd`       | Sydney       |
| `jh`        | Johannesburg |

Set the code as `region` in your config. Regions that don’t yet support the S3 API have no such endpoint; see the [official documentation](https://bunny.net/docs/storage/s3) for the current list.

#### Public Read Access

The Bunny Storage endpoint always requires authentication, so a separate `public_url` must be configured for asset previews and downloads in the CMS. Without it, preview images will fail to load.

1. In **bunny.net Dashboard > Storage > [zone] > Connected Pull Zones**, add a pull zone (or connect an existing one) with the storage zone as its origin.
2. Set the pull zone’s hostname as `public_url` in your config, either the default `b-cdn.net` hostname or a custom hostname you’ve linked to the pull zone:

   ```yaml
   public_url: 'https://my-zone.b-cdn.net'
   ```

Asset URLs are constructed as `{public_url}/{key}` (using the full object key, including any `prefix`).

#### CORS

No CORS configuration is needed. The Bunny Storage S3 endpoint always responds with `Access-Control-Allow-Origin: *`, so listing, uploading, renaming and deleting from the browser work out of the box. To restrict cross-origin access to the delivered files, configure CORS on the pull zone at the CDN level.

### Configuration

Here’s an example configuration for Bunny Storage:

```yaml [YAML]
media_libraries:
  bunny_storage:
    bucket: my-zone
    region: de
    public_url: https://my-zone.b-cdn.net
    prefix: cms-uploads/ # Optional
```

```toml [TOML]
[media_libraries.bunny_storage]
bucket = "my-zone"
region = "de"
public_url = "https://my-zone.b-cdn.net"
prefix = "cms-uploads/" # Optional
```

```json [JSON]
{
  "media_libraries": {
    "bunny_storage": {
      "bucket": "my-zone",
      "region": "de",
      "public_url": "https://my-zone.b-cdn.net",
      "prefix": "cms-uploads/"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    bunny_storage: {
      bucket: 'my-zone',
      region: 'de',
      public_url: 'https://my-zone.b-cdn.net',
      prefix: 'cms-uploads/', // Optional
    },
  },
}
```

**Warning**

Do not write your storage zone password in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the password when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `bucket` | Yes | The storage zone name. |
| `region` | Yes | Two-letter [region code](#regions) of the storage zone’s main region, e.g. `de`. Used to construct the S3 API endpoint. |
| `public_url` | Yes | Pull zone hostname for asset previews and downloads, e.g. `https://my-zone.b-cdn.net`. Required because the storage endpoint always requires authentication. |
| `access_key_id` | No | Defaults to `bucket`, as the storage zone name serves as the access key ID. There is normally no reason to set it. |
| `prefix` | No | Path prefix within the storage zone, e.g. `uploads/`. A trailing slash is added if missing. |

### Content Security Policy

API calls (list, upload, rename, delete) go to the regional S3 endpoint, and asset URLs use your pull zone hostname:

```
connect-src https://de-s3.storage.bunnycdn.com
            https://my-zone.b-cdn.net;
img-src     https://my-zone.b-cdn.net;
```

Replace `de` and `my-zone.b-cdn.net` with your actual region code and pull zone hostname.

The pull zone hostname must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from it. For the same reason, the pull zone must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Bunny Storage-Specific Notes

#### No Per-Object ACLs

Bunny Storage does not support the `x-amz-acl` header for per-object access control. Access to the files is controlled through the pull zone. Sveltia CMS doesn’t send the header to Bunny Storage.

#### Single-Object Operations

Bunny Storage doesn’t implement the batch `DeleteObjects` API or custom object metadata. Sveltia CMS deletes and copies objects one at a time and doesn’t rely on custom metadata, so all Asset Library operations work as expected.

#### CDN Cache

Files are served through the pull zone’s cache. If you replace a file with a new version under the same name, the old version may keep being served until the cache expires. Purge the pull zone cache from the bunny.net dashboard if you need the change to appear immediately.

### Accessing the Storage

There are two ways to use Bunny Storage in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Bunny Storage directly within the entry editor. After entering the storage zone password in the CMS UI when prompted, users can upload new media directly to your storage zone or select existing media.

When uploading media, files will be stored in the storage zone and delivered through the Bunny CDN. You can also select existing media from your storage zone.

#### Asset Library

Bunny Storage also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your storage zone, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/bunny-storage

---

## Cloudflare R2 Integration

[Cloudflare R2](https://www.cloudflare.com/products/r2/) is an S3-compatible object storage service with zero egress fees. Sveltia CMS supports R2 as a media storage backend with direct browser-to-R2 uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- A Cloudflare account with an R2 bucket created.
- An R2 API token with Object Read & Write permissions (see [Credentials](#credentials) below).
- A `public_url` configured for asset previews (see [Public Read Access](#public-read-access) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the R2 endpoint and your public URL. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

R2 uses its own API token system, separate from the Cloudflare global API key. Create a token via **Cloudflare Dashboard > Account Home > R2 > Manage R2 API Tokens**:

- **Permission**: Object Read & Write
- **Scope**: Restrict to the specific bucket (recommended)

The resulting **Access Key ID** (64 hex characters) goes in `access_key_id` in your config. The **Secret Access Key** is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

#### Public Read Access

R2’s S3 API endpoint always requires authentication, so a separate `public_url` must be configured for asset previews and downloads in the CMS. Without it, preview images will fail to load.

Two options are available:

**Option A — Public development URL (non-production):**

1. In **R2 Dashboard > [bucket] > Settings**, under **Public Development URL**, click **Enable** and confirm.
2. Copy the assigned `pub-{hash}.r2.dev` URL and set it as `public_url` in your config:

   ```yaml
   public_url: 'https://pub-abcdef1234567890abcdef1234567890.r2.dev'
   ```

Note: the `r2.dev` subdomain is rate limited and intended for development use only.

**Option B — Custom domain (recommended for production):**

1. In **R2 Dashboard > [bucket] > Settings > Custom Domains**, click **Add** and follow the prompts to connect your domain.
2. Set that domain as `public_url` in your config:

   ```yaml
   public_url: 'https://media.example.com'
   ```

In both cases, asset URLs are constructed as `{public_url}/{key}` (using the full object key, including any `prefix`).

#### CORS

Configure via **R2 Dashboard > Bucket > Settings > CORS Policy**. CORS is required because Sveltia CMS sends custom AWS Signature v4 headers that trigger a preflight request.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://your-cms-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

The `DELETE` method and the wildcard `AllowedHeaders` are needed to delete and rename files from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). If you configured CORS before these operations became available, add them to your existing policy. Otherwise, the browser will block those requests during the preflight check.

### Configuration

Here’s an example configuration for Cloudflare R2:

```yaml [YAML]
media_libraries:
  cloudflare_r2:
    access_key_id: abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
    bucket: my-r2-bucket
    account_id: abcdef1234567890abcdef1234567890
    public_url: https://pub-abcdef1234567890abcdef1234567890.r2.dev
    prefix: cms-uploads/ # Optional
    jurisdiction: eu # Optional; 'default' | 'eu' | 'fedramp'
```

```toml [TOML]
[media_libraries.cloudflare_r2]
access_key_id = "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
bucket = "my-r2-bucket"
account_id = "abcdef1234567890abcdef1234567890"
public_url = "https://pub-abcdef1234567890abcdef1234567890.r2.dev"
prefix = "cms-uploads/" # Optional
jurisdiction = "eu" # Optional; 'default' | 'eu' | 'fedramp'
```

```json [JSON]
{
  "media_libraries": {
    "cloudflare_r2": {
      "access_key_id": "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "bucket": "my-r2-bucket",
      "account_id": "abcdef1234567890abcdef1234567890",
      "public_url": "https://pub-abcdef1234567890abcdef1234567890.r2.dev",
      "prefix": "cms-uploads/",
      "jurisdiction": "eu"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    cloudflare_r2: {
      access_key_id: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      bucket: 'my-r2-bucket',
      account_id: 'abcdef1234567890abcdef1234567890',
      public_url: 'https://pub-abcdef1234567890abcdef1234567890.r2.dev',
      prefix: 'cms-uploads/', // Optional
      jurisdiction: 'eu', // Optional; 'default' | 'eu' | 'fedramp'
    },
  },
}
```

**Warning**

Do not write your Secret Access Key in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `access_key_id` | Yes | R2 Access Key ID (64 hex characters). Safe to store in config. |
| `bucket` | Yes | The R2 bucket name. |
| `account_id` | Yes | Your Cloudflare account ID. Used to construct the S3 API endpoint. |
| `public_url` | Yes | Public URL for asset previews and downloads. Required because the R2 S3 API always requires authentication. |
| `prefix` | No | Path prefix within the bucket, e.g. `uploads/`. A trailing slash is added if missing. |
| `jurisdiction` | No | Cloudflare R2 [jurisdictional restriction](#jurisdictional-restrictions) for the bucket. One of `'default'`, `'eu'`, `'fedramp'`. Defaults to `'default'`. |

#### Jurisdictional Restrictions

Cloudflare R2 supports two jurisdictional locations — EU and FedRAMP — for data residency compliance. Buckets created in one of these jurisdictions use a dedicated endpoint and will return an error if accessed via the global endpoint.

If your bucket was created in the EU or FedRAMP jurisdiction, set `jurisdiction` accordingly:

```yaml
media_libraries:
  cloudflare_r2:
    # ...
    jurisdiction: eu # 'eu' for EU buckets, 'fedramp' for FedRAMP buckets
```

The jurisdiction also determines the S3 API endpoint hostname used for uploads and listings:

| Jurisdiction           | S3 API endpoint                                 |
| ---------------------- | ----------------------------------------------- |
| `default` (or omitted) | `<account_id>.r2.cloudflarestorage.com`         |
| `eu`                   | `<account_id>.eu.r2.cloudflarestorage.com`      |
| `fedramp`              | `<account_id>.fedramp.r2.cloudflarestorage.com` |

Remember to update your [Content Security Policy](#content-security-policy) to allow the correct endpoint if you use a non-default jurisdiction.

### Content Security Policy

The hosts to allow depend on your `public_url` setting and `jurisdiction`.

**r2.dev subdomain** — allow the exact `pub-{hash}.r2.dev` host:

```
connect-src https://abcdef1234567890abcdef1234567890.r2.cloudflarestorage.com
            https://pub-abcdef1234567890abcdef1234567890.r2.dev;
img-src     https://pub-abcdef1234567890abcdef1234567890.r2.dev;
```

**Custom domain** — allow your custom domain, plus the S3 API endpoint for listing and uploading:

```
connect-src https://abcdef1234567890abcdef1234567890.r2.cloudflarestorage.com
            https://media.example.com;
img-src     https://media.example.com;
```

**Non-default jurisdiction** — replace the S3 API endpoint in `connect-src` with the jurisdiction-specific one. For example, with `jurisdiction: eu`:

```
connect-src https://abcdef1234567890abcdef1234567890.eu.r2.cloudflarestorage.com
            https://pub-abcdef1234567890abcdef1234567890.r2.dev;
img-src     https://pub-abcdef1234567890abcdef1234567890.r2.dev;
```

The public URL host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from it. For the same reason, it must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Accessing the Storage

There are two ways to use Cloudflare R2 in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Cloudflare R2 directly within the entry editor. After entering the Secret Access Key in the CMS UI when prompted, users can upload new media directly to R2 or select existing media from the bucket.

When uploading media, files will be stored in the R2 bucket, and the CMS can take advantage of R2’s capabilities directly from the CMS. You can also select existing media from your R2 storage.

#### Asset Library

Cloudflare R2 also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your bucket, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/cloudflare-r2

---

## DigitalOcean Spaces Integration

[DigitalOcean Spaces](https://www.digitalocean.com/products/spaces) is an S3-compatible object storage service with a built-in CDN. Sveltia CMS supports Spaces as a media storage backend with direct browser-to-Spaces uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- A DigitalOcean account with a Space created.
- A Spaces Access Key (see [Credentials](#credentials) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the Spaces endpoint. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

Spaces uses its own key pair, separate from DigitalOcean personal access tokens. Generate one via **DigitalOcean Control Panel > API > Spaces Keys**.

Note: each key pair covers all Spaces in your account — there is no per-bucket scoping.

The resulting **Access Key** goes in `access_key_id` in your config. The **Secret Key** is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

#### Public Read Access

Asset preview and download URLs are unsigned direct storage URLs, so objects must be publicly readable. Files in a Space are private by default. The Space’s file listing setting only controls whether anyone can list them, not whether they can be read.

Sveltia CMS therefore gives every file it uploads or renames, and every folder it creates, the `public-read` ACL. No further setup is needed, and the file listing can stay private.

Files uploaded by other means, such as the control panel, stay private unless you set their permissions to **Public**. Their previews won’t load in the CMS until you do.

#### CORS

Configure via **DigitalOcean Control Panel > Spaces > Select bucket > Settings > CORS**. CORS is required because Sveltia CMS sends custom AWS Signature v4 headers that trigger a preflight request.

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://your-cms-domain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

The `DELETE` method and the wildcard `AllowedHeaders` are needed to delete and rename files from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). If you configured CORS before these operations became available, add them to your existing policy. Otherwise, the browser will block those requests during the preflight check.

### Configuration

Here’s an example configuration for DigitalOcean Spaces:

<!-- cSpell:disable -->

```yaml [YAML]
media_libraries:
  digitalocean_spaces:
    access_key_id: ABCD1234EFGH5678IJKL
    bucket: my-space
    region: nyc3
    prefix: cms-uploads/ # Optional
    public_url: https://my-space.nyc3.cdn.digitaloceanspaces.com # Optional, see CDN Endpoint below
```

```toml [TOML]
[media_libraries.digitalocean_spaces]
access_key_id = "ABCD1234EFGH5678IJKL"
bucket = "my-space"
region = "nyc3"
prefix = "cms-uploads/"
public_url = "https://my-space.nyc3.cdn.digitaloceanspaces.com"
```

```json [JSON]
{
  "media_libraries": {
    "digitalocean_spaces": {
      "access_key_id": "ABCD1234EFGH5678IJKL",
      "bucket": "my-space",
      "region": "nyc3",
      "prefix": "cms-uploads/",
      "public_url": "https://my-space.nyc3.cdn.digitaloceanspaces.com"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    digitalocean_spaces: {
      access_key_id: 'ABCD1234EFGH5678IJKL',
      bucket: 'my-space',
      region: 'nyc3',
      prefix: 'cms-uploads/', // Optional
      public_url: 'https://my-space.nyc3.cdn.digitaloceanspaces.com', // Optional
    },
  },
}
```

<!-- cSpell:enable -->

**Warning**

Do not write your Secret Access Key in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `access_key_id` | Yes | Spaces Access Key. Safe to store in config. |
| `bucket` | Yes | The Space name. |
| `region` | Yes | Spaces region, e.g. `nyc3`, `sfo2`, `ams3`, `sgp1`, `fra1`. |
| `prefix` | No | Path prefix within the bucket, e.g. `uploads/`. A trailing slash is added if missing. |
| `public_url` | No | CDN or custom subdomain URL for asset previews. See [CDN Endpoint](#cdn-endpoint) below. |

### CDN Endpoint

DigitalOcean Spaces has an optional built-in CDN. Once enabled, the default CDN endpoint is `https://{bucket}.{region}.cdn.digitaloceanspaces.com`. You can also configure a custom subdomain — see the [Spaces CDN custom endpoint guide](https://docs.digitalocean.com/products/spaces/how-to/customize-cdn-endpoint/).

By default, asset URLs use the virtual-hosted storage endpoint (`https://{bucket}.{region}.digitaloceanspaces.com/{key}`). To use the CDN instead, set `public_url` to the CDN or custom subdomain URL:

```yaml
public_url: 'https://my-space.nyc3.cdn.digitaloceanspaces.com'
# or with a custom subdomain:
public_url: 'https://images.example.com'
```

**Warning**

Do **not** set `public_url` to the CDN URL and rely on it for API operations. The CDN endpoint does not support the S3 ListObjects API, so browsing the asset library would stop working. The storage endpoint is always used for listing and uploading. Only the asset URLs shown in the CMS change.

### Content Security Policy

API calls (list, upload) go to `https://{region}.digitaloceanspaces.com`. Asset URLs use `https://{bucket}.{region}.digitaloceanspaces.com` by default:

```
connect-src https://nyc3.digitaloceanspaces.com
            https://my-space.nyc3.digitaloceanspaces.com;
img-src     https://my-space.nyc3.digitaloceanspaces.com;
```

If using the CDN via `public_url`:

```
connect-src https://nyc3.digitaloceanspaces.com
            https://my-space.nyc3.cdn.digitaloceanspaces.com;
img-src     https://my-space.nyc3.cdn.digitaloceanspaces.com;
```

Replace `nyc3` and `my-space` with your actual region and bucket name. If you use a custom subdomain, such as `https://images.example.com`, allow it in place of the CDN endpoint.

The asset host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from its public URL. For the same reason, a CDN or custom subdomain must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Accessing the Storage

There are two ways to use DigitalOcean Spaces in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on DigitalOcean Spaces directly within the entry editor. After entering the Secret Access Key in the CMS UI when prompted, users can upload new media directly to Spaces or select existing media from the bucket.

When uploading media, files will be stored in the Spaces bucket, and the CMS can take advantage of Spaces’ capabilities directly from the CMS. You can also select existing media from your Spaces storage.

#### Asset Library

DigitalOcean Spaces also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your bucket, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/digitalocean-spaces

---

## Neon Object Storage Integration

[Neon Object Storage](https://neon.com/docs/storage/overview) is S3-compatible object storage that comes with every Neon project and is branched along with the database. Sveltia CMS supports it as a media storage backend through its [S3-compatible API](https://neon.com/docs/storage/s3-compatibility), with direct browser-to-storage uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- A Neon project in a region that offers Object Storage: `aws-us-east-1`, `aws-us-east-2`, `aws-eu-central-1` or `aws-ap-southeast-1`.
- A bucket on the branch you want to use, with `public_read` access or a CDN in front of it (see [Public Read Access](#public-read-access) below).
- A storage access key pair (see [Credentials](#credentials) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow your branch’s storage endpoint. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Endpoint

Each Neon branch has its own storage endpoint, e.g. `https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech`. Find it as `AWS_ENDPOINT_URL_S3` under **Neon Console > [project] > Connect > Storage**, and set it as `endpoint` in your config.

The endpoint can’t be built from the project or branch ID, because its hostname also includes a cell ID (`c-1` above). Copy it as is.

Sveltia CMS only accepts an HTTPS endpoint on a Neon storage hostname (`*.storage.*.aws.neon.tech`). Any other URL is ignored, and the storage won’t be available. This keeps the signed requests, which carry your credentials, from being sent to another host by mistake.

The region is read from the endpoint’s hostname (`us-east-2` above), so you don’t need to set `region`.

#### Credentials

Create a storage access key pair in one of these ways:

- In **Neon Console > [project] > Connect > Storage**.
- With the Neon CLI: `neon credentials create --scope storage:read --scope storage:write`.

See [Authentication](https://neon.com/docs/storage/authentication) in the Neon documentation for details.

The resulting **Access Key ID** (`nak_live_…`) goes in `access_key_id` in your config. The **Secret Access Key** (`nsk_live_…`) is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

**Tip**

Use a key pair with both the `storage:read` and `storage:write` scopes, so that uploads, renames and deletions work.

#### Public Read Access

Neon sets access per bucket, as either `private` or `public_read`, in the Neon Console, CLI or API.

A `public_read` bucket serves its files anonymously at `{endpoint}/{bucket}/{key}`, which is the URL Sveltia CMS uses for asset previews and stores in your entries by default.

A `private` bucket returns an error for anonymous requests, so preview images fail to load and the stored URLs don’t work on your site. To use a private bucket, put a CDN in front of it and set its URL as `public_url`. See [CDN / Custom Domain](#cdn-custom-domain) below.

#### CORS

No CORS configuration is needed. Neon Object Storage allows cross-origin requests from any origin by default, so listing, uploading, renaming and deleting from the browser work out of the box.

### Configuration

Here’s an example configuration for Neon Object Storage:

```yaml [YAML]
media_libraries:
  neon_object_storage:
    access_key_id: nak_live_0123456789abcdef0123456789abcdef
    bucket: media
    endpoint: https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech
    prefix: cms-uploads/ # Optional
```

```toml [TOML]
[media_libraries.neon_object_storage]
access_key_id = "nak_live_0123456789abcdef0123456789abcdef"
bucket = "media"
endpoint = "https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech"
prefix = "cms-uploads/" # Optional
```

```json [JSON]
{
  "media_libraries": {
    "neon_object_storage": {
      "access_key_id": "nak_live_0123456789abcdef0123456789abcdef",
      "bucket": "media",
      "endpoint": "https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech",
      "prefix": "cms-uploads/"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    neon_object_storage: {
      access_key_id: 'nak_live_0123456789abcdef0123456789abcdef',
      bucket: 'media',
      endpoint: 'https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech',
      prefix: 'cms-uploads/', // Optional
    },
  },
}
```

**Warning**

Do not write your Secret Access Key in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `access_key_id` | Yes | Neon storage Access Key ID, e.g. `nak_live_…`. Safe to store in config. |
| `bucket` | Yes | The bucket name. |
| `endpoint` | Yes | The branch’s storage endpoint (`AWS_ENDPOINT_URL_S3`), e.g. `https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech`. See [Endpoint](#endpoint) above. |
| `region` | No | The region used to sign requests. Defaults to the region in the endpoint’s hostname, e.g. `us-east-2`. There is normally no reason to set it. |
| `prefix` | No | Path prefix within the bucket, e.g. `uploads/`. A trailing slash is added if missing. |
| `public_url` | No | CDN or custom domain URL for asset previews. Required for a `private` bucket. See [CDN / Custom Domain](#cdn-custom-domain) below. |

### CDN / Custom Domain

By default, asset URLs use the branch endpoint: `{endpoint}/{bucket}/{key}`. To serve assets through a CDN or a custom domain in front of the bucket, set `public_url` to its URL:

```yaml
public_url: 'https://cdn.example.com'
```

Asset URLs are then constructed as `{public_url}/{key}` (using the full object key, including any `prefix`).

### Content Security Policy

API calls (list, upload, rename, delete) go to the branch endpoint, which also serves the assets by default:

```
connect-src https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech;
img-src     https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech;
```

If using a CDN or custom domain via `public_url`:

```
connect-src https://br-cool-darkness-a1b2c3d4.storage.c-1.us-east-2.aws.neon.tech
            https://cdn.example.com;
img-src     https://cdn.example.com;
```

Replace the endpoint and domain with your own.

The asset host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from its public URL. For the same reason, a CDN or custom domain must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Neon Object Storage-Specific Notes

#### Branches

Object Storage is branched along with the database, and each branch has its own endpoint. The CMS uses the branch whose endpoint is in your config, so files uploaded through the CMS go to that branch only.

The stored asset URLs include the endpoint, so they keep pointing to that branch even if you later change the config to another branch.

#### No Per-Object ACLs

Neon Object Storage doesn’t implement the `x-amz-acl` header for per-object access control. Access is set per bucket instead (see [Public Read Access](#public-read-access) above). Sveltia CMS doesn’t send the header to Neon.

### Accessing the Storage

There are two ways to use Neon Object Storage in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Neon Object Storage directly within the entry editor. After entering the Secret Access Key in the CMS UI when prompted, users can upload new media to your bucket or select existing media.

#### Asset Library

Neon Object Storage also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your bucket, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/neon-object-storage

---

## Scaleway Object Storage Integration

[Scaleway Object Storage](https://www.scaleway.com/en/object-storage/) is an S3-compatible object storage service with multi-region availability. Sveltia CMS supports Scaleway Object Storage as a media storage backend with direct browser-to-storage uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- A Scaleway account with a bucket created.
- A Scaleway API key pair (see [Credentials](#credentials) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the Scaleway endpoint. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

Scaleway uses IAM API keys for authentication. Generate a key pair via **Scaleway Console > IAM > API Keys**.

The resulting **Access Key ID** goes in `access_key_id` in your config. The **Secret Access Key** is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

#### Public Read Access

Asset preview and download URLs are unsigned direct storage URLs, so objects must be publicly readable. Objects are private by default, even in a bucket whose **Visibility** is **Public**, because that setting only controls whether anyone can list them.

Sveltia CMS therefore gives every file it uploads or renames, and every folder it creates, the `public-read` ACL, so the bucket can stay private. For this to work, the API key’s IAM policy needs the `ObjectStorageObjectsWrite` or `ObjectStorageFullAccess` permission set, both of which include the `PutObjectAcl` permission. If the bucket has a bucket policy, it must allow `s3:PutObjectAcl` as well.

Objects uploaded by other means, such as the console, stay private unless you make them public, or add a bucket policy that grants `s3:GetObject` to everyone. Their previews won’t load in the CMS until you do.

#### CORS

Configure CORS via AWS CLI. See the [documentation](https://www.scaleway.com/en/docs/object-storage/api-cli/setting-cors-rules/) for details. CORS is required because Sveltia CMS sends custom AWS Signature v4 headers that trigger a preflight request.

Make sure to allow the necessary HTTP methods (`GET`, `PUT` and `DELETE`) and all headers (`*`), because Sveltia CMS sends the `Authorization`, `x-amz-*` and `Content-Type` headers. The `DELETE` method and the `x-amz-copy-source` header are needed to delete and rename files from the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). If you configured CORS before these operations became available, add them to your existing rule.

### Configuration

Here’s an example configuration for Scaleway Object Storage:

<!-- cSpell:disable -->

```yaml [YAML]
media_libraries:
  scaleway_object_storage:
    access_key_id: SCWXXXXXXXXXXXXXXXXXX
    bucket: my-bucket
    region: fr-par
    prefix: cms-uploads/ # Optional
    public_url: https://my-cdn.example.com # Optional, see CDN / Custom Domain below
```

```toml [TOML]
[media_libraries.scaleway_object_storage]
access_key_id = "SCWXXXXXXXXXXXXXXXXXX"
bucket = "my-bucket"
region = "fr-par"
prefix = "cms-uploads/"
public_url = "https://my-cdn.example.com"
```

```json [JSON]
{
  "media_libraries": {
    "scaleway_object_storage": {
      "access_key_id": "SCWXXXXXXXXXXXXXXXXXX",
      "bucket": "my-bucket",
      "region": "fr-par",
      "prefix": "cms-uploads/",
      "public_url": "https://my-cdn.example.com"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    scaleway_object_storage: {
      access_key_id: 'SCWXXXXXXXXXXXXXXXXXX',
      bucket: 'my-bucket',
      region: 'fr-par',
      prefix: 'cms-uploads/', // Optional
      public_url: 'https://my-cdn.example.com', // Optional
    },
  },
}
```

<!-- cSpell:enable -->

**Warning**

Do not write your Secret Access Key in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `access_key_id` | Yes | Scaleway IAM Access Key ID. Safe to store in config. |
| `bucket` | Yes | The bucket name. |
| `region` | Yes | Scaleway region: `fr-par`, `nl-ams`, `pl-waw` or `it-mil`. |
| `prefix` | No | Path prefix within the bucket, e.g. `uploads/`. A trailing slash is added if missing. |
| `public_url` | No | CDN or custom domain URL for asset previews. See [CDN / Custom Domain](#cdn-custom-domain) below. |

### CDN / Custom Domain

By default, asset URLs use the virtual-hosted storage endpoint (`https://{bucket}.s3.{region}.scw.cloud/{key}`). To serve assets via a CDN or custom domain, set `public_url` to the base URL of your CDN or domain:

```yaml
public_url: 'https://my-cdn.example.com'
```

**Warning**

Do **not** set `public_url` to a CDN URL and rely on it for API operations. The CDN endpoint does not support the S3 ListObjects API, so browsing the asset library would stop working. The storage endpoint is always used for listing and uploading. Only the asset URLs shown in the CMS change.

### Content Security Policy

API calls (list, upload) go to `https://s3.{region}.scw.cloud`. Asset URLs use `https://{bucket}.s3.{region}.scw.cloud` by default:

```
connect-src https://s3.fr-par.scw.cloud
            https://my-bucket.s3.fr-par.scw.cloud;
img-src     https://my-bucket.s3.fr-par.scw.cloud;
```

If using a CDN or custom domain via `public_url`:

```
connect-src https://s3.fr-par.scw.cloud
            https://my-cdn.example.com;
img-src     https://my-cdn.example.com;
```

Replace `fr-par` and `my-bucket` with your actual region and bucket name.

The asset host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from its public URL. For the same reason, a CDN or custom domain must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Accessing the Storage

There are two ways to use Scaleway Object Storage in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Scaleway Object Storage directly within the entry editor. After entering the Secret Access Key in the CMS UI when prompted, users can upload new media directly to your bucket or select existing media.

#### Asset Library

Scaleway Object Storage also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your bucket, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/scaleway-object-storage

---

## Supabase Storage Integration

[Supabase Storage](https://supabase.com/storage) is an S3-compatible object storage service built on top of Supabase’s open-source platform. Sveltia CMS supports Supabase Storage as a media storage backend with direct browser-to-storage uploads using AWS Signature Version 4 — no backend proxy is required.

### Requirements

- A Supabase project with a storage bucket created.
- An S3 access key pair generated from your project’s storage settings (see [Credentials](#credentials) below).

#### CSP

If your site uses a Content Security Policy (CSP), you need to allow the Supabase Storage endpoint. See [Content Security Policy](#content-security-policy) below for details.

### Setup

#### Credentials

Supabase Storage supports S3-compatible authentication using project-scoped credentials. Generate an access key pair via **Supabase Dashboard > [project] > Storage > S3 Configuration**.

**Warning**

S3 access keys provide full access to all S3 operations across all buckets and bypass Row Level Security (RLS) policies. They are intended for server-side use. Never commit the Secret Access Key to your repository.

The resulting **Access Key ID** goes in `access_key_id` in your config. The **Secret Access Key** is entered by users in the CMS UI when they access the media library for the first time — it is never stored in config.

#### Project ID and Region

The **Project ID** (shown in **Project Settings > General**) goes in `project_id`. The **Region** is also shown on the Storage S3 configuration page and follows the format used on that page (e.g. `us-east-1`, `eu-west-2`).

#### Public Read Access

Asset preview and download URLs point directly to the Supabase public storage URL (`https://{project_id}.supabase.co/storage/v1/object/public/{bucket}/{key}`), so the bucket must be set to **Public**. You can do this in the bucket settings.

#### CORS

Supabase Storage’s S3 endpoint allows cross-origin requests by default for authenticated operations. If you encounter CORS issues, check your project’s network restrictions under **Supabase Dashboard > Settings > Network**.

### Configuration

Here’s an example configuration for Supabase Storage:

<!-- cSpell:disable -->

```yaml [YAML]
media_libraries:
  supabase_storage:
    access_key_id: your_access_key_id
    project_id: abcdefghijklmnopqrst
    bucket: my-bucket
    region: us-east-1
    prefix: cms-uploads/ # Optional
    public_url: https://my-cdn.example.com # Optional, see Custom Domain below
```

```toml [TOML]
[media_libraries.supabase_storage]
access_key_id = "your_access_key_id"
project_id = "abcdefghijklmnopqrst"
bucket = "my-bucket"
region = "us-east-1"
prefix = "cms-uploads/"
public_url = "https://my-cdn.example.com"
```

```json [JSON]
{
  "media_libraries": {
    "supabase_storage": {
      "access_key_id": "your_access_key_id",
      "project_id": "abcdefghijklmnopqrst",
      "bucket": "my-bucket",
      "region": "us-east-1",
      "prefix": "cms-uploads/",
      "public_url": "https://my-cdn.example.com"
    }
  }
}
```

```js [JavaScript]
{
  media_libraries: {
    supabase_storage: {
      access_key_id: 'your_access_key_id',
      project_id: 'abcdefghijklmnopqrst',
      bucket: 'my-bucket',
      region: 'us-east-1',
      prefix: 'cms-uploads/', // Optional
      public_url: 'https://my-cdn.example.com', // Optional
    },
  },
}
```

<!-- cSpell:enable -->

**Warning**

Do not write your Secret Access Key in the configuration file, as it should be kept confidential and not exposed in client-side code. Users will be prompted to enter the key when they use the storage for the first time. It’s then stored securely in the browser’s local storage.

#### Configuration Properties

| Property | Required | Description |
| --- | --- | --- |
| `access_key_id` | Yes | Supabase S3 Access Key ID. Safe to store in config. |
| `project_id` | Yes | Supabase Project ID. Used to construct the S3 API endpoint and public URL. |
| `bucket` | Yes | The storage bucket name. |
| `region` | No | The project region shown on the Storage S3 configuration page, e.g. `eu-central-1`. Defaults to `us-east-1`. |
| `prefix` | No | Path prefix within the bucket, e.g. `uploads/`. A trailing slash is added if missing. |
| `public_url` | No | Custom domain URL for asset previews. See [Custom Domain](#custom-domain) below. |

### Custom Domain

By default, asset URLs use the Supabase public storage URL (`https://{project_id}.supabase.co/storage/v1/object/public/{bucket}/{key}`). To serve assets via a custom domain, set `public_url` to the same URL on your domain, including the `/storage/v1/object/public/{bucket}` path, as the object key is appended to it directly:

```yaml
public_url: 'https://media.example.com/storage/v1/object/public/my-bucket'
```

### Content Security Policy

API calls (list, upload) go to `https://{project_id}.storage.supabase.co`. Asset URLs use `https://{project_id}.supabase.co` by default:

```
connect-src https://abcdefghijklmnopqrst.storage.supabase.co
            https://abcdefghijklmnopqrst.supabase.co;
img-src     https://abcdefghijklmnopqrst.supabase.co;
```

If using a custom domain via `public_url`:

```
connect-src https://abcdefghijklmnopqrst.storage.supabase.co
            https://media.example.com;
img-src     https://media.example.com;
```

Replace `abcdefghijklmnopqrst` with your actual Project ID.

The asset host must be in `connect-src` because the Download and Copy buttons and the text preview in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) fetch the file from its public URL. For the same reason, a custom domain must also send CORS headers that allow the CMS origin. Otherwise, downloads fail.

See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Accessing the Storage

There are two ways to use Supabase Storage in Sveltia CMS:

#### File and Image Fields

When editing content entries, users can use [File](https://sveltiacms.app/en/docs/fields/file) and [Image](https://sveltiacms.app/en/docs/fields/image) fields to upload and select media on Supabase Storage directly within the entry editor. After entering the Secret Access Key in the CMS UI when prompted, users can upload new media directly to your bucket or select existing media.

#### Asset Library

Supabase Storage also appears under **External Locations** in the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library). There, users can browse, search, sort and filter the files in your bucket, and upload, rename, replace, download or delete them without leaving the CMS.

The files and folders are browsed [folder by folder](https://sveltiacms.app/en/docs/ui/asset-library#folders-on-external-locations):

- Subfolders are listed ahead of the files.
- Uploads go to the folder being viewed.
- Folders can be created, renamed and deleted.

Source: https://sveltiacms.app/en/docs/media/supabase-storage
