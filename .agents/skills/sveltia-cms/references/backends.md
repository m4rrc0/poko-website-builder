# Backends and Authentication

Git backend configuration and OAuth setup for GitHub, GitLab and Gitea/Forgejo.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Backends

A backend defines where content is stored and how Sveltia CMS interacts with it. Sveltia CMS primarily supports Git-based backends, allowing seamless integration with popular Git hosting services.

### Supported Backends

Sveltia CMS supports the following Git-based backends:

- [GitHub](https://sveltiacms.app/en/docs/backends/github)
- [GitLab](https://sveltiacms.app/en/docs/backends/gitlab)
- [Gitea/Forgejo](https://sveltiacms.app/en/docs/backends/gitea-forgejo)

For testing purposes, you can also use the [Test Backend](https://sveltiacms.app/en/docs/backends/test).

Some features only work with specific backends.

**Breaking changes from Netlify/Decap CMS**

For performance reasons, Sveltia CMS does not support the **Azure DevOps**, **Bitbucket** and **Git Gateway** backends. Please note that [Git Gateway](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/) has officially been deprecated by Netlify. If you’re using one of these backends with Netlify/Decap CMS, consider switching to GitHub, GitLab, Gitea or Forgejo before migrating to Sveltia CMS.

Also, Sveltia CMS does not support the undocumented custom backend API. The `CMS.registerBackend` method is a no-op in Sveltia CMS. We may add support for custom backends in future releases, though compatibility with existing Netlify/Decap CMS custom backends is not guaranteed.

### Configuration

All the configuration options for backends can be set in the `backend` option of the CMS configuration file. Here is a basic example of configuring the GitHub backend:

```yaml [YAML]
backend:
  name: github
  repo: user/repo
```

```toml [TOML]
[backend]
name = "github"
repo = "user/repo"
```

```json [JSON]
{
  "backend": {
    "name": "github",
    "repo": "user/repo"
  }
}
```

```js [JavaScript]
{
  backend: {
    name: "github",
    repo: "user/repo",
  },
}
```

See the specific backend guides for detailed configuration instructions.

The following sections describe some common configuration options available for all Git-based backends.

#### Branch Selection

By default, Sveltia CMS interacts with the repository’s default branch (usually `main` or `master`). You can specify a different branch using the `branch` option in the backend configuration:

```yaml [YAML]{4}
backend:
  name: github
  repo: user/repo
  branch: develop
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "user/repo"
branch = "develop"
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "branch": "develop"
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "github",
    repo: "user/repo",
    branch: "develop",
  },
}
```

#### Monorepos

If your repository holds more than one site, or the site lives in a subdirectory along with other code, set the `root_dir` option to the directory of the site.

Sveltia CMS then treats that directory as the root of the repository. Every path in the configuration, such as a collection’s `folder` or the `media_folder`, is relative to it, and nothing outside it shows up in the CMS.

The option is available for all the Git-based backends and the [Test Backend](https://sveltiacms.app/en/docs/backends/test).

For example, with a site in `apps/blog`, a collection whose files live in `apps/blog/content/posts` is configured with `folder: content/posts`:

```yaml [YAML]{4}
backend:
  name: github
  repo: user/repo
  root_dir: apps/blog
collections:
  - name: posts
    folder: content/posts
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "user/repo"
root_dir = "apps/blog"

[[collections]]
name = "posts"
folder = "content/posts"
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "root_dir": "apps/blog"
  },
  "collections": [{ "name": "posts", "folder": "content/posts" }]
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "github",
    repo: "user/repo",
    root_dir: "apps/blog",
  },
  collections: [{ name: "posts", folder: "content/posts" }],
}
```

The path is relative to the repository root, and it can’t climb out of the repository with `..`. Likewise, the other paths in the configuration can’t lead outside the directory with `..`, because the CMS doesn’t list the files there. If the directory doesn’t exist on the branch, the CMS says so after you sign in.

With [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the path also becomes part of branch names. Git doesn’t allow certain characters in a branch name, so no part of the path can:

- start with a dot
- end with `.lock`
- contain a space or any of `~^:?*[\` or `@{`

##### Multiple Sites

Each site in the monorepo can have its own CMS with its own `root_dir`, and they don’t get in each other’s way:

- Only the files in the directory are listed when the CMS loads, which saves listing the whole of a big monorepo.
- A commit made to another part of the repository doesn’t make the CMS reload its content, because only the directory is checked for changes. The [deployment status](https://sveltiacms.app/en/docs/deployments) also stays on the last commit that changed the directory, as a build for such a commit is usually skipped.
- With [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the directory is part of the branch name, e.g. `cms/apps/blog/posts/hello-world`. Two sites with a collection of the same name therefore don’t share branches or list each other’s unpublished entries.
  - An entry saved before you set the option keeps its branch and stays on the board, as long as all its files are in the directory.
  - An entry whose pull request also changes a file outside the directory can’t be published from the CMS, because the change can’t be shown.
- Each site gets a local cache of its own in the browser.

Commits are still made to the repository as a whole. The `{{path}}` [template tag](#available-template-tags) in commit messages is the path from the repository root, e.g. `apps/blog/content/posts/hello-world.md`. To tell the sites apart in the Git history, you can also put the site name in the [commit messages](#commit-messages).

With the [local workflow](https://sveltiacms.app/en/docs/workflows/local), select the root directory of the repository, not the directory of the site, when the CMS asks for it. The CMS finds the site’s directory within it.

If the sites are deployed separately, for example as several Netlify sites built from the same repository, set the [`preview_context`](https://sveltiacms.app/en/docs/deployments/previews#specifying-a-status-context) option so the CMS links to the right [deploy preview](https://sveltiacms.app/en/docs/deployments/previews). A build that was canceled or skipped because the commit didn’t touch the site is ignored either way.

**Warning**

The `root_dir` option only limits what the CMS shows and edits. Users still need write access to the whole repository, and the Git hosting service doesn’t stop them from changing other parts of it. To restrict access to a site, keep it in a repository of its own.

#### Authentication Methods

By default, Sveltia CMS allows users to sign in using either OAuth or an access token. You can restrict the available sign-in methods by setting the `auth_methods` option to an array containing only the methods to allow:

| Value   | Description                                |
| ------- | ------------------------------------------ |
| `oauth` | OAuth sign-in (e.g. “Sign In with GitHub”) |
| `token` | Access token sign-in                       |

For example, to allow only OAuth sign-in and disable access token authentication:

```yaml [YAML]{4}
backend:
  name: github
  repo: user/repo
  auth_methods: [oauth]
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "user/repo"
auth_methods = ["oauth"]
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "auth_methods": ["oauth"]
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "github",
    repo: "user/repo",
    auth_methods: ["oauth"],
  },
}
```

To allow only access token sign-in and disable OAuth:

```yaml [YAML]{4}
backend:
  name: github
  repo: user/repo
  auth_methods: [token]
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "user/repo"
auth_methods = ["token"]
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "auth_methods": ["token"]
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "github",
    repo: "user/repo",
    auth_methods: ["token"],
  },
}
```

The `auth_methods` array must contain at least one method. An empty array will result in a configuration error.

#### OAuth Endpoint

When a user signs in with OAuth, Sveltia CMS opens an authorization URL made of the `base_url` and `auth_endpoint` options joined with a slash. Leading and trailing slashes are ignored. The token URL is derived from the same URL by replacing `/authorize` with the backend’s token path. The defaults are:

| Backend       | `base_url`                | `auth_endpoint`         |
| ------------- | ------------------------- | ----------------------- |
| GitHub        | `https://api.netlify.com` | `auth`                  |
| GitLab        | `https://api.netlify.com` | `auth`                  |
| Gitea/Forgejo | `https://gitea.com`       | `login/oauth/authorize` |

With [PKCE authorization](https://sveltiacms.app/en/docs/backends/gitlab#pkce-authorization) (`auth_type: pkce`), the GitLab defaults are `https://gitlab.com` and `oauth/authorize` instead, because the CMS talks to GitLab directly.

With the [`forgejo` backend name](https://sveltiacms.app/en/docs/backends/gitea-forgejo#forgejo-backend-name), the default `base_url` is derived from `api_root` instead, e.g. `https://codeberg.org` from `https://codeberg.org/api/v1`.

You usually only need to change `base_url`. Set `auth_endpoint` if your OAuth client or Git service serves the authorization page at a different path:

```yaml [YAML]{4-5}
backend:
  name: gitlab
  repo: owner/repo
  base_url: https://auth.example.com
  auth_endpoint: gitlab/oauth/authorize
```

```toml [TOML]{4-5}
[backend]
name = "gitlab"
repo = "owner/repo"
base_url = "https://auth.example.com"
auth_endpoint = "gitlab/oauth/authorize"
```

```json [JSON]{5-6}
{
  "backend": {
    "name": "gitlab",
    "repo": "owner/repo",
    "base_url": "https://auth.example.com",
    "auth_endpoint": "gitlab/oauth/authorize"
  }
}
```

```js [JavaScript]{5-6}
{
  backend: {
    name: "gitlab",
    repo: "owner/repo",
    base_url: "https://auth.example.com",
    auth_endpoint: "gitlab/oauth/authorize",
  },
}
```

**Breaking change from Netlify/Decap CMS**

The `auth_endpoint` option must be a path relative to `base_url`, not a full URL. The Decap CMS documentation shows a full URL like `https://gitea.example.com/login/oauth/authorize` for the Gitea backend, which results in an invalid authorization URL in Sveltia CMS. Put the origin in `base_url` and the path in `auth_endpoint` instead, or omit `auth_endpoint` to use the default path.

#### Site Domain

With the [authorization code flow](https://sveltiacms.app/en/docs/backends/github#authorization-code-flow) on GitHub and GitLab, Sveltia CMS sends the site’s domain to the OAuth client as the `site_id` query parameter. Netlify uses it to find the site that holds the OAuth app credentials, and [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) can check it against its list of allowed domains. PKCE authorization and access token sign-in don’t use it.

By default, the domain is the current hostname, or `cms.netlify.com` if the CMS is running on `localhost`. To send a different domain, set the `site_domain` option. You might need this when the CMS is served from a preview URL that isn’t registered with the OAuth client:

```yaml [YAML]{4}
backend:
  name: github
  repo: user/repo
  site_domain: www.example.com
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "user/repo"
site_domain = "www.example.com"
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "site_domain": "www.example.com"
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "github",
    repo: "user/repo",
    site_domain: "www.example.com",
  },
}
```

When Netlify is the OAuth client, an internationalized domain name is converted to Punycode before it’s sent.

#### Commit Messages

There are a couple of options to customize the Git commit messages generated by Sveltia CMS when saving content.

##### Commit Message Templates

The `commit_messages` option allows you to define templates for various actions. Here’s the default configuration:

```yaml [YAML]
backend:
  commit_messages:
    create: 'Create {{collection}} "{{slug}}"'
    update: 'Update {{collection}} "{{slug}}"'
    delete: 'Delete {{collection}} "{{slug}}"'
    uploadMedia: 'Upload "{{path}}"'
    deleteMedia: 'Delete "{{path}}"'
    openAuthoring: '{{message}}'
```

```toml [TOML]
[backend.commit_messages]
create = "Create {{collection}} \"{{slug}}\""
update = "Update {{collection}} \"{{slug}}\""
delete = "Delete {{collection}} \"{{slug}}\""
uploadMedia = "Upload \"{{path}}\""
deleteMedia = "Delete \"{{path}}\""
openAuthoring = "{{message}}"
```

```json [JSON]
{
  "backend": {
    "commit_messages": {
      "create": "Create {{collection}} \"{{slug}}\"",
      "update": "Update {{collection}} \"{{slug}}\"",
      "delete": "Delete {{collection}} \"{{slug}}\"",
      "uploadMedia": "Upload \"{{path}}\"",
      "deleteMedia": "Delete \"{{path}}\"",
      "openAuthoring": "{{message}}"
    }
  }
}
```

```js [JavaScript]
{
  backend: {
    commit_messages: {
      create: 'Create {{collection}} "{{slug}}"',
      update: 'Update {{collection}} "{{slug}}"',
      delete: 'Delete {{collection}} "{{slug}}"',
      uploadMedia: 'Upload "{{path}}"',
      deleteMedia: 'Delete "{{path}}"',
      openAuthoring: '{{message}}',
    },
  },
}
```

###### Available Commit Types

- `create`, `update`, `delete`: Used when creating, updating or deleting entries in collections.
- `uploadMedia`, `deleteMedia`: Used when uploading or deleting media assets.
- `openAuthoring`: Wraps the message generated by one of the types above when the commit is made by an [Open Authoring](https://sveltiacms.app/en/docs/workflows/open) contributor, so you can record who wrote it. `{{message}}` is that generated message. The default template is `{{message}}` on its own, which changes nothing.

**Tip**

Unlike most other config options, the commit message keys are camelCased.

###### Available Template Tags

You can use the following template tags in commit messages:

- `{{collection}}`: The `label_singular` or `label` of the collection.
- `{{slug}}`: The slug of the entry.
- `{{path}}`: The file path of the entry or media asset, relative to the repository root, even with the [`root_dir`](#monorepos) option.
- `{{message}}`: The commit message generated for the change, wrapped by the `openAuthoring` template.
- `{{author-email}}`: The email of the signed-in user, if available.
- `{{author-login}}`: The login name of the signed-in user, if available.
- `{{author-name}}`: The display name of the signed-in user, if available.

The following table summarizes which tags are supported for each commit type:

| Commit Type | Supported Tags |
| --- | --- |
| `create`, `update`, `delete` | `collection`, `slug`, `path`, `author-email`, `author-login`, `author-name` |
| `uploadMedia`, `deleteMedia` | `path`, `author-email`, `author-login`, `author-name` |
| `openAuthoring` | `message`, `author-email`, `author-login`, `author-name` |

###### Localizing Commit Messages

You can localize the commit messages into your language by changing the templates. For example, to use French messages:

```yaml [YAML]
backend:
  commit_messages:
    create: 'Créer {{collection}} « {{slug}} »'
    update: 'Mettre à jour {{collection}} « {{slug}} »'
    delete: 'Supprimer {{collection}} « {{slug}} »'
    uploadMedia: 'Téléverser « {{path}} »'
    deleteMedia: 'Supprimer « {{path}} »'
    openAuthoring: '{{message}}'
```

```toml [TOML]
[backend.commit_messages]
create = "Créer {{collection}} « {{slug}} »"
update = "Mettre à jour {{collection}} « {{slug}} »"
delete = "Supprimer {{collection}} « {{slug}} »"
uploadMedia = "Téléverser « {{path}} »"
deleteMedia = "Supprimer « {{path}} »"
openAuthoring = "{{message}}"
```

```json [JSON]
{
  "backend": {
    "commit_messages": {
      "create": "Créer {{collection}} « {{slug}} »",
      "update": "Mettre à jour {{collection}} « {{slug}} »",
      "delete": "Supprimer {{collection}} « {{slug}} »",
      "uploadMedia": "Téléverser « {{path}} »",
      "deleteMedia": "Supprimer « {{path}} »",
      "openAuthoring": "{{message}}"
    }
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    commit_messages: {
      create: 'Créer {{collection}} "{{slug}}"',
      update: 'Mettre à jour {{collection}} "{{slug}}"',
      delete: 'Supprimer {{collection}} "{{slug}}"',
      uploadMedia: 'Téléverser "{{path}}"',
      deleteMedia: 'Supprimer "{{path}}"',
      openAuthoring: '{{message}}',
    },
  },
}
```

##### Prompting for Commit Messages

The messages generated from the templates are often the same for every change to an entry, which makes the Git history hard to follow. Set the `prompt_commit_messages` option to ask users for a commit message every time they save. They can use it, for example, to describe the change or to tie it to an issue in your project tracker:

- `true`: Users can write the whole message. The text box is filled in with the message generated from the template, so they can edit it or keep it as is.
- `prefix`: Users can enter a note, such as an issue number, that is added before the generated message, with a space in between. A preview shows the message as it will be recorded.
- `suffix`: Same as `prefix`, but the note is added after the generated message.

```yaml [YAML]{4}
backend:
  name: github
  repo: user/repo
  prompt_commit_messages: prefix
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "user/repo"
prompt_commit_messages = "prefix"
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "prompt_commit_messages": "prefix"
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: 'github',
    repo: 'user/repo',
    prompt_commit_messages: 'prefix',
  },
}
```

With the above configuration, a user who enters `JIRA-123:` when updating a blog post commits the change as `JIRA-123: Update Post "hello-world"`.

How the prompt works:

- Users are asked every time a change is committed: when an entry is saved, deleted or reordered, and when assets or folders are uploaded, deleted, renamed or moved.
- The text box can be left empty, in which case the generated message is used as is.
- With `prefix` and `suffix`, the note entered last is filled in again for the next commit, because several changes in a row often belong to the same issue. It’s kept until the page is reloaded.
- Canceling the dialog cancels the save, deletion or upload, and nothing is committed. In the Content Editor, the changes are kept so you can save them again.
- With the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the message is also used as the title of the pull request when it’s opened, and the merge commit takes that title when the entry is published. Deleting several entries at once asks only once.
- The [`openAuthoring`](#commit-messages) template and the [`[skip ci]` prefix](#skipping-ci-cd) are applied to the message the user enters as well.
- The [History panel](https://sveltiacms.app/en/docs/ui/content-editor#sidebar) of the Content Editor shows the first line of each commit’s message, so the history of an entry can be followed at a glance.
- With the [local development workflow](https://sveltiacms.app/en/docs/workflows/local), users are only asked when [Git commits](https://sveltiacms.app/en/docs/workflows/local#git-commits) are turned on.

The default is `false`, which commits the generated messages without asking. The option is not available with the [Test Backend](https://sveltiacms.app/en/docs/backends/test).

##### Signing Off Commits

Some projects require every commit to be signed off under the [Developer Certificate of Origin](https://developercertificate.org/) (DCO). Set the `signoff_commits` option to `true` to add a `Signed-off-by` trailer with the name and email of the signed-in user to each commit made with Sveltia CMS:

```yaml [YAML]{4}
backend:
  name: github
  repo: user/repo
  signoff_commits: true
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "user/repo"
signoff_commits = true
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "signoff_commits": true
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: 'github',
    repo: 'user/repo',
    signoff_commits: true,
  },
}
```

With the above configuration, a commit message looks like this:

```
Update Post “hello-world”

Signed-off-by: Jane Doe <jane@example.com>
```

How it works:

- The trailer is added after a blank line, or to the trailers the message already ends with. If the message already has a sign-off with the user’s email, for example from a [commit message template](#commit-message-templates), no second one is added.
- The name is the user’s display name on the Git hosting service, or their username if no display name is set.
- The email comes from the user’s profile on the Git hosting service. If it’s not available, for example on GitHub when the user hasn’t made their email public, the commit is made without the trailer and a warning is shown in the browser console.
- With the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), the merge commit made when an entry is published doesn’t get the trailer.

The default is `false`. The option is available with the GitHub, GitLab and Gitea/Forgejo backends. It doesn’t apply to [Git commits](https://sveltiacms.app/en/docs/workflows/local#git-commits) made with the local development workflow.

##### Skipping CI/CD

It’s also possible to add the `[skip ci]` prefix to commit messages to prevent triggering CI/CD pipelines. See the [deployments guide](https://sveltiacms.app/en/docs/deployments#disabling-automatic-deployments) for more details.

#### Including Credentials in API Requests

By default, Sveltia CMS does not include cookies in API requests to the Git hosting service. If your self-hosted Git service instance requires authentication via cookies, you can set the `include_credentials` option to `true`:

```yaml [YAML]{4}
backend:
  name: gitea
  repo: user/repo
  include_credentials: true
```

```toml [TOML]{4}
[backend]
name = "gitea"
repo = "user/repo"
include_credentials = true
```

```json [JSON]{5}
{
  "backend": {
    "name": "gitea",
    "repo": "user/repo",
    "include_credentials": true
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "gitea",
    repo: "user/repo",
    include_credentials: true,
  },
}
```

Your server must also set the [`Access-Control-Allow-Credentials`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Credentials) header in API responses for this to work.

Source: https://sveltiacms.app/en/docs/backends

---

## Gitea/Forgejo Backend

Gitea and its fork Forgejo are lightweight, self-hosted Git services that are easy to set up and use. Sveltia CMS offers comprehensive support for Gitea/Forgejo repositories, enabling efficient content management.

### Requirements

- Gitea 1.24 or later, or Forgejo 12.0 or later.
- A Gitea or Forgejo account.
- A Gitea or Forgejo repository to store the content.
- Write access to the repository. Users with read-only access can’t sign in, unless [Open Authoring](https://sveltiacms.app/en/docs/workflows/open) is enabled, which lets them contribute from a fork.
- Sveltia CMS installed in your project.

If the configured branch is [protected](https://docs.gitea.com/usage/access-control/protected-branches) and doesn’t allow a user to push:

- Collections using the [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple) and the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) are read-only for that user, because they commit to the branch directly.
- Collections using the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) still work, because they commit to branches of their own. However, the Publish button is only shown to users who are allowed to merge into the branch.

**Breaking change from Netlify/Decap CMS**

Sveltia CMS requires newer versions of Gitea/Forgejo than Netlify/Decap CMS did to leverage enhanced, high-performance API capabilities. For security reasons, it’s recommended to use the latest stable versions of Gitea/Forgejo.

#### CSP

If your site uses a Content Security Policy (CSP), you may need to update it to allow requests to Gitea or Forgejo. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

#### CORS

In your Gitea or Forgejo instance, you may need to enable Cross-Origin Resource Sharing (CORS) to allow the Sveltia CMS admin interface to communicate with the backend API. Refer to the [Gitea](https://docs.gitea.com/administration/config-cheat-sheet#cors-cors) or [Forgejo](https://forgejo.org/docs/latest/admin/config-cheat-sheet/#cors-cors) documentation for instructions on how to configure CORS.

### Configuration

The base configuration for the Gitea/Forgejo backend is straightforward. You need to specify the `name` of the backend as `gitea` (or [`forgejo`](#forgejo-backend-name)) and provide the `repo` option with the format `owner/repo`, where `owner` is your Gitea/Forgejo username or organization name, and `repo` is the repository name.

```yaml [YAML]
backend:
  name: gitea
  repo: user/repo
```

```toml [TOML]
[backend]
name = "gitea"
repo = "user/repo"
```

```json [JSON]
{
  "backend": {
    "name": "gitea",
    "repo": "user/repo"
  }
}
```

```js [JavaScript]
{
  backend: {
    name: "gitea",
    repo: "user/repo",
  },
}
```

#### Instance URL

By default, Sveltia CMS uses the public Gitea instance at `https://gitea.com`. If you use a self-hosted Gitea or Forgejo instance or a hosting service like [Codeberg](https://codeberg.org/), you need to set the `base_url` and `api_root` options in your backend configuration to point to your server URL.

```yaml [YAML]{4-5}
backend:
  name: gitea
  repo: owner/repo
  base_url: https://gitea.example.com
  api_root: https://gitea.example.com/api/v1
```

```toml [TOML]{4-5}
[backend]
name = "gitea"
repo = "owner/repo"
base_url = "https://gitea.example.com"
api_root = "https://gitea.example.com/api/v1"
```

```json [JSON]{5-6}
{
  "backend": {
    "name": "gitea",
    "repo": "owner/repo",
    "base_url": "https://gitea.example.com",
    "api_root": "https://gitea.example.com/api/v1"
  }
}
```

```js [JavaScript]{5-6}
{
  backend: {
    name: "gitea",
    repo: "owner/repo",
    base_url: "https://gitea.example.com",
    api_root: "https://gitea.example.com/api/v1",
  },
}
```

For Codeberg, use the following settings:

```yaml [YAML]{4-5}
backend:
  name: gitea
  repo: owner/repo
  base_url: https://codeberg.org
  api_root: https://codeberg.org/api/v1
```

```toml [TOML]{4-5}
[backend]
name = "gitea"
repo = "owner/repo"
base_url = "https://codeberg.org"
api_root = "https://codeberg.org/api/v1"
```

```json [JSON]{5-6}
{
  "backend": {
    "name": "gitea",
    "repo": "owner/repo",
    "base_url": "https://codeberg.org",
    "api_root": "https://codeberg.org/api/v1"
  }
}
```

```js [JavaScript]{5-6}
{
  backend: {
    name: "gitea",
    repo: "owner/repo",
    base_url: "https://codeberg.org",
    api_root: "https://codeberg.org/api/v1",
  },
}
```

The API version for Gitea/Forgejo is `v1`, so make sure to include `/api/v1` in the `api_root` option.

The `base_url` option is the URL of your Gitea/Forgejo instance, including the subpath if it’s served under one. This is because OAuth sign-in on the Gitea/Forgejo backend always uses [PKCE authorization](#pkce-authorization) without an OAuth client. With the `gitea` backend name, the `base_url` is not inferred from `api_root`, so you have to set both options. The [`forgejo` backend name](#forgejo-backend-name) infers it instead.

The OAuth authorization URL is made of `base_url` and the `auth_endpoint` option, which defaults to `login/oauth/authorize`. You don’t need to set `auth_endpoint` unless your instance uses a different path. Note that it must be a path, not a full URL like the one shown in the Decap CMS documentation. See [OAuth Endpoint](https://sveltiacms.app/en/docs/backends#oauth-endpoint) for details.

**Breaking change from Netlify/Decap CMS**

In Netlify/Decap CMS, the default origin of the `base_url` and `api_root` backend options is set to `https://try.gitea.io` (test instance). In Sveltia CMS, we changed it to `https://gitea.com` (public free service). In most cases, anyway, you need to set these options explicitly to point to your own Gitea/Forgejo instance.

#### Forgejo Backend Name

Decap CMS 3.15 added a separate `forgejo` backend. Sveltia CMS accepts that name too, so a Decap CMS configuration for Forgejo or Codeberg works unchanged. It uses the same Gitea/Forgejo backend, with every feature on this page, but the instance URL options work differently:

- `api_root` is required, because there’s no default instance.
- `base_url` is optional. It defaults to `api_root` without the `/api/v1` path, e.g. `https://codeberg.org`, so you only need one URL.

```yaml [YAML]{2,4}
backend:
  name: forgejo
  repo: owner/repo
  api_root: https://codeberg.org/api/v1
```

```toml [TOML]{2,4}
[backend]
name = "forgejo"
repo = "owner/repo"
api_root = "https://codeberg.org/api/v1"
```

```json [JSON]{3,5}
{
  "backend": {
    "name": "forgejo",
    "repo": "owner/repo",
    "api_root": "https://codeberg.org/api/v1"
  }
}
```

```js [JavaScript]{3,5}
{
  backend: {
    name: "forgejo",
    repo: "owner/repo",
    api_root: "https://codeberg.org/api/v1",
  },
}
```

Unlike Decap CMS, which defaults the `branch` option to `main` with this backend name, Sveltia CMS uses the repository’s default branch when `branch` is omitted, the same as with the `gitea` name.

### Authentication

**Tip**

If you plan to only [work with your local repository](https://sveltiacms.app/en/docs/workflows/local), you don’t need to set up authentication.

#### Access Token (Quick Start) {#access-token}

If you or a small team of developers are the only users of your CMS instance, you can use an access token for authentication. This method is straightforward and doesn’t require setting up an OAuth app or updating the CMS configuration.

Click the “Sign In with Token” button on the login screen. The prompt dialog provides a link to the token generation page on Gitea/Forgejo with the required scopes pre-selected. Generate a new token, copy it to the clipboard and paste it into the prompt dialog to sign in. The token will be stored in the browser’s local storage and used for subsequent API requests.

The scopes depend on your configuration:

- `read:repository`, `write:repository` and `read:user` are always requested.
- `read:issue` and `write:issue` are added when the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) is enabled. The workflow labels its pull requests, and labels live under the issue scope.

If you turn the workflow on after generating a token, generate a new one. Otherwise, saving an entry fails with a permission error.

You can [disable token authentication](https://sveltiacms.app/en/docs/backends#authentication-methods) if needed.

#### PKCE Authorization (Recommended) {#pkce-authorization}

To use PKCE authorization with Sveltia CMS, you need to register a new OAuth app on Gitea/Forgejo and update your Sveltia CMS configuration file accordingly. Here’s how:

1. Follow the instructions in the [Gitea](https://docs.gitea.com/development/oauth2-provider) or [Forgejo](https://forgejo.org/docs/latest/user/oauth2-provider/) documentation to create a new OAuth application.
1. Set the **Redirect URI** to your CMS admin URL, e.g. `https://your-domain.com/admin/`.
1. Uncheck the **Confidential** option.
1. Copy the Client ID of your registered OAuth app.

Then, update your Sveltia CMS configuration file to include the `app_id` option with your Client ID:

```yaml [YAML]{4}
backend:
  name: gitea
  repo: owner/repo
  app_id: YOUR_CLIENT_ID
```

```toml [TOML]{4}
[backend]
name = "gitea"
repo = "owner/repo"
app_id = "YOUR_CLIENT_ID"
```

```json [JSON]{5}
{
  "backend": {
    "name": "gitea",
    "repo": "owner/repo",
    "app_id": "YOUR_CLIENT_ID"
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "gitea",
    repo: "owner/repo",
    app_id: "YOUR_CLIENT_ID",
  },
}
```

Users’ OAuth tokens will be automatically renewed as needed, so there’s no need to worry about token expiration.

### Features

#### Git LFS

Git Large File Storage (LFS) is supported out of the box in the Gitea/Forgejo backend. Just make sure to enable LFS in your repository settings. For more information, refer to the official documentation for [Gitea](https://docs.gitea.com/administration/git-lfs-setup) or [Forgejo](https://forgejo.org/docs/latest/admin/setup/storage/).

#### GraphQL

GraphQL support is not available for Gitea/Forgejo repositories. Sveltia CMS uses the REST API to interact with Gitea/Forgejo.

#### Commit Signing

Commit signing is supported in Gitea/Forgejo repositories, but you may need to configure it on your server. Please refer to the [Gitea](https://docs.gitea.com/administration/signing) or [Forgejo](https://forgejo.org/docs/latest/admin/advanced/signing/) documentation for more details on setting up commit signing.

#### Service Status Checking

Service status checking is not available for Gitea/Forgejo repositories. If you are experiencing issues connecting to your Gitea/Forgejo instance, please verify the server status manually.

### Workflows

The following [content management workflows](https://sveltiacms.app/en/docs/workflows) are supported with the Gitea/Forgejo backend:

- [Local Development Workflow](https://sveltiacms.app/en/docs/workflows/local)
- [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple)
- [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial)
- [Open Authoring](https://sveltiacms.app/en/docs/workflows/open)

### Deployment

Both Gitea and Forgejo support CI/CD pipelines that can be used to automate the deployment of your site whenever content is updated through Sveltia CMS. You can set up workflows to build and deploy your static site generator (SSG) whenever changes are pushed to the repository.

- [Gitea Actions](https://docs.gitea.com/usage/actions/overview)
- [Forgejo Actions](https://forgejo.org/docs/latest/user/actions/reference/)

Entries can link to the [deploy preview](https://sveltiacms.app/en/docs/deployments/previews) built for their pull request, and report whether the build has finished, when the workflow posts the preview address as a commit status. See [Reporting a Preview from Gitea/Forgejo Actions](https://sveltiacms.app/en/docs/deployments/previews#gitea-forgejo-actions).

Source: https://sveltiacms.app/en/docs/backends/gitea-forgejo

---

## GitHub Backend

GitHub is one of the most popular Git hosting services, and Sveltia CMS provides first-class support for it. With the GitHub backend, editors can easily manage content stored in GitHub repositories.

### Requirements

- A GitHub account.
- A GitHub repository to store the content.
- Write access to the repository: the Write, Maintain or Admin role, whether granted directly or through an organization team. Users with read-only access can’t sign in, unless [Open Authoring](https://sveltiacms.app/en/docs/workflows/open) is enabled, which lets them work on a fork instead.
- Sveltia CMS installed in your project.

If the configured branch is [protected](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) and doesn’t allow a user to push, e.g. because it requires a pull request:

- Collections using the [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple) and the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) are read-only for that user, because they commit to the branch directly.
- Collections using the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) still work, because they commit to branches of their own. GitHub doesn’t tell whether a user can merge a pull request, so the Publish button is still shown. GitHub refuses the merge if the user isn’t allowed to make it.

#### CSP

If your site uses a Content Security Policy (CSP), you may need to update it to allow requests to GitHub. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Configuration

The base configuration for the GitHub backend is straightforward. You need to specify the `name` of the backend as `github` and provide the `repo` option with the format `owner/repo`, where `owner` is your GitHub username or organization name, and `repo` is the repository name.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
```

```toml [TOML]
[backend]
name = "github"
repo = "user/repo"
```

```json [JSON]
{
  "backend": {
    "name": "github",
    "repo": "user/repo"
  }
}
```

```js [JavaScript]
{
  backend: {
    name: "github",
    repo: "user/repo",
  },
}
```

#### GitHub Enterprise

By default, Sveltia CMS uses the public GitHub instance at `https://github.com`. If you use a self-hosted GitHub Enterprise Server instance, you need to set the `api_root` option in your backend configuration to point to your server’s API endpoint.

```yaml [YAML]{4}
backend:
  name: github
  repo: owner/repo
  api_root: https://github.example.com/api/v3
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "owner/repo"
api_root = "https://github.example.com/api/v3"
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "owner/repo",
    "api_root": "https://github.example.com/api/v3"
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "github",
    repo: "owner/repo",
    api_root: "https://github.example.com/api/v3",
  },
}
```

The API version for GitHub Enterprise is `v3`, so the REST API endpoint is `https://HOSTNAME/api/v3`. You can also set `api_root` to just `https://HOSTNAME`, in which case `/api/v3` is appended automatically.

Sveltia CMS uses the GitHub GraphQL API where possible. Its endpoint is inferred from the `api_root` option by replacing the `/api/v3` part with `/api/graphql`, e.g. `https://github.example.com/api/graphql`. If your server’s GraphQL endpoint is at a different URL, set it with the `graphql_api_root` option.

Don’t set the `base_url` option to your GitHub Enterprise Server URL. The `base_url` option specifies the URL of your OAuth client, not the GitHub instance. To sign in with the [authorization code flow](#authorization-code-flow), deploy an OAuth client that supports GitHub Enterprise Server and point `base_url` to it. For example, [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) supports it with the `GITHUB_HOSTNAME` environment variable. Alternatively, sign in with an [access token](#access-token).

### Authentication

<!-- There are multiple ways to authenticate with GitHub when using Sveltia CMS. You can choose the method that best fits your needs. Using an access token is the simplest way to get started, but PKCE authorization is recommended if your CMS instance is used by multiple users or non-technical users because it’s more user-friendly and secure. -->

There are multiple ways to authenticate with GitHub when using Sveltia CMS. You can choose the method that best fits your needs. Using an access token is the simplest way to get started. If your CMS instance is used by multiple users or non-technical users, the authorization code flow is recommended, because it’s more user-friendly and secure.

**Tip**

If you plan to only [work with your local repository](https://sveltiacms.app/en/docs/workflows/local), you don’t need to set up authentication.

#### Access Token (Quick Start) {#access-token}

If you or a small team of developers are the only users of your CMS instance, you can use a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) (PAT) for authentication. This method is straightforward and doesn’t require setting up an OAuth app or updating the CMS configuration.

Click the “Sign In with Token” button on the login screen. The prompt dialog provides a link to the token generation page on GitHub with the required permissions pre-selected. Generate a new token, copy it to the clipboard and paste it into the prompt dialog to sign in. The token will be stored in the browser’s local storage and used for subsequent API requests.

If you create a [fine-grained token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) yourself, give it access to the repository and the following repository permissions:

| Permission | Access | Needed for |
| --- | --- | --- |
| Contents | Read and write | Everything: reading and committing entries and assets |
| Pull requests | Read and write | The [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), which opens, labels, merges and closes a pull request for each entry |

Metadata (read) is added automatically. A classic token needs the `repo` scope, which covers all of the above.

**Warning**

With the Editorial Workflow, a token needs pull request access as well as content access. Without it, saving an entry gets as far as committing the entry to its workflow branch. It then fails with “Resource not accessible by personal access token” when the CMS tries to open the pull request.

To fix this, edit the token to add the Pull requests permission. The branches already created will be reused the next time each entry is saved.

You can [disable token authentication](https://sveltiacms.app/en/docs/backends#authentication-methods) if needed.

<!-- ### PKCE Authorization (Recommended) {#pkce-authorization} -->

#### PKCE Authorization

**Unimplemented**

We’re waiting for GitHub to support client-side PKCE authentication for single-page apps. It was [planned for Q4 2025](https://github.com/github/roadmap/issues/1153), but GitHub has [put the project on hold](https://github.com/orgs/community/discussions/15752). We can’t release this feature until GitHub provides this support. In the meantime, please use the other authentication methods described in this document.

<!--

GitHub added [client-side PKCE support](https://github.com/github/roadmap/issues/1153) in January 2026, so you no longer have to rely on the [authorization code flow](#authorization-code-flow) explained below, which requires a backend server to keep the client secret safe.

To use PKCE authorization with Sveltia CMS, you need to register a new app on GitHub and update your Sveltia CMS configuration file accordingly. Here’s how:

1. Open the [Register new GitHub App page](https://github.com/settings/apps/new?name=Sveltia+CMS+Authenticator+for+YOUR_SITE&url=https://github.com/sveltia/sveltia-cms&webhook_active=false&contents=write) on GitHub. This link pre-fills some fields for you.
1. Change the **App name** to include your site name or any name you like.
1. Fill in the **Callback URL** with your actual admin page URL: `https://YOUR_DOMAIN/admin/`
1. Under **Where can this GitHub App be installed?**, select **Any account** if you want to allow both personal and organization accounts to install the app.
1. Click **Create GitHub App**.
1. Copy the **Client ID**. We will need it later.

Move on to the next step to install the app:

1. Click **Install App** on the left sidebar.
1. Choose a user or organization to install the app.
1. Choose the repositories you want to manage with Sveltia CMS. You can select all repositories or just a specific one.
1. Click **Install**.

Next, update your Sveltia CMS configuration file to add the `auth_type` and `app_id` options under the backend configuration. If you have previously added `base_url`, you can remove it as it’s no longer needed.

```yaml [YAML]{4-5}
backend:
  name: github
  repo: owner/repo
  auth_type: pkce # Required for PKCE auth
  app_id: YOUR_CLIENT_ID # Client ID you copied earlier
```

```toml [TOML]{4-5}
[backend]
name = "github"
repo = "owner/repo"
auth_type = "pkce"
app_id = "YOUR_CLIENT_ID"
```

```json [JSON]{5-6}
{
  "backend": {
    "name": "github",
    "repo": "owner/repo",
    "auth_type": "pkce",
    "app_id": "YOUR_CLIENT_ID"
  }
}
```

```js [JavaScript]{5-6}
{
  backend: {
    name: "github",
    repo: "owner/repo",
    auth_type: "pkce",
    app_id: "YOUR_CLIENT_ID",
  },
}
```

Save the configuration file, deploy it to your site and reload the CMS. You should now be able to sign in with GitHub using the PKCE authorization flow!

Users’ OAuth tokens will be automatically renewed as needed, so there’s no need to worry about token expiration.

**Tip**

If you have installed Sveltia CMS Authenticator or any other third-party client, you can remove it as it’s no longer needed for GitHub authentication. Sveltia CMS will handle the PKCE flow directly in the browser.

#### Authorization Code Flow (Legacy) {#authorization-code-flow}

PKCE authorization is the recommended way to authenticate with GitHub. However, if you need to use the authorization code flow for some reason, you can follow the instructions below. This method requires a backend server to keep the client secret safe.

-->

#### Authorization Code Flow

The authorization code flow requires you to set up an OAuth app on GitHub and deploy an OAuth client server to handle the authentication process.

There are multiple options for the OAuth client, including our own Sveltia CMS Authenticator, third-party OAuth clients made for Netlify/Decap CMS or using Netlify as an OAuth provider.

##### Using Sveltia CMS Authenticator

We provide our own OAuth client called [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) that you can deploy on Cloudflare Workers. Follow the instructions in the repository to deploy the authenticator and update your CMS configuration file to include the `base_url` option pointing to your authenticator URL:

```yaml [YAML]{4}
backend:
  name: github
  repo: owner/repo
  base_url: YOUR_CLIENT_URL # URL of your OAuth client
```

```toml [TOML]{4}
[backend]
name = "github"
repo = "owner/repo"
base_url = "YOUR_CLIENT_URL"
```

```json [JSON]{5}
{
  "backend": {
    "name": "github",
    "repo": "owner/repo",
    "base_url": "YOUR_CLIENT_URL"
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "github",
    repo: "owner/repo",
    base_url: "YOUR_CLIENT_URL",
  },
}
```

##### Using Third-Party OAuth Client

You can also use [third-party OAuth clients](https://decapcms.org/docs/external-oauth-clients/) made for Netlify/Decap CMS. These clients support various languages and hosting services, and they should work with Sveltia CMS as well without any modifications.

The setup process is similar to using Sveltia CMS Authenticator. You need to register a new OAuth app on GitHub and configure the third-party client with the app credentials. Then, update your CMS configuration to include the `base_url` option pointing to your OAuth client URL, like in the example above.

If the client serves the authorization page at a path other than `/auth`, also set the [`auth_endpoint`](https://sveltiacms.app/en/docs/backends#oauth-endpoint) option. If the client checks the site domain, you may need to set the [`site_domain`](https://sveltiacms.app/en/docs/backends#site-domain) option as well.

**Disclaimer**

Third-party clients are not reviewed or maintained by the Sveltia CMS team. Use them at your own risk. Some clients may not be compatible with Sveltia CMS.

##### Using Netlify

For backward compatibility with Netlify CMS, Sveltia CMS supports the authorization code flow using Netlify as an OAuth client. It’s the default authentication method if you don’t configure authentication explicitly, and you don’t need to set up a backend server yourself.

If your site is hosted on Netlify, you don’t need to install Sveltia CMS Authenticator or any other OAuth client. Instead, register a new OAuth app on GitHub and link it to your Netlify site. Here’s how:

1. Open the [Register a new OAuth app page](https://github.com/settings/applications/new) on GitHub. To create the app under an organization instead of your personal account, go to the organization’s **Settings** > **Developer settings** > **OAuth Apps**.
1. Fill in the **Application name** and **Homepage URL** with anything you like, such as your site name and URL.
1. Set the **Authorization callback URL** to `https://api.netlify.com/auth/done`.
1. Click **Register application**.
1. Copy the **Client ID**, then click **Generate a new client secret** and copy the **Client Secret**. The secret won’t be shown again.
1. Open the Netlify dashboard for your site and go to **Project configuration** > **Security** > **OAuth**. Note that this is not the **Identity** section, which is only used for Git Gateway and Netlify Identity.
1. Under **Authentication Providers**, click **Install Provider**, select **GitHub**, enter the Client ID and Client Secret, and save.

No configuration changes are needed in Sveltia CMS. Just make sure `base_url` is not set in your configuration file, so the CMS uses Netlify as the OAuth client. See Netlify’s [official guide](https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/) for more details.

Netlify identifies the site by its domain. If the CMS is served from a domain other than the one of your Netlify site, set the [`site_domain`](https://sveltiacms.app/en/docs/backends#site-domain) option.

**Disclaimer**

We are not affiliated with Netlify and do not endorse or maintain this authentication method. We only provide it to ensure backward compatibility with Netlify CMS.

### Features

#### Git LFS

Git Large File Storage (LFS) is not supported in the GitHub backend at this time due to the API limitations. We plan to explore possible solutions in the future.

#### GraphQL

GraphQL support is enabled for GitHub repositories. Sveltia CMS uses the GitHub GraphQL API to interact with the repository, which provides better performance and flexibility compared to the REST API. No additional configuration is needed to enable GraphQL support.

#### Commit Signing

When you commit changes to your GitHub repository through Sveltia CMS, the commits are automatically GPG-signed and [marked as verified](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification). This ensures the authenticity and integrity of the commits, providing an additional layer of security for your content management workflow. No additional configuration is needed to enable commit signing.

#### Service Status Checking

Service status checking is available for GitHub repositories, unless you’re using a GitHub Enterprise instance. Sveltia CMS periodically checks the [status of the GitHub service](https://www.githubstatus.com/) to ensure that it is operational. If any incidents are detected, a notification banner will be displayed in the CMS UI to inform users of potential issues that may affect their workflow.

### Workflows

The following [content management workflows](https://sveltiacms.app/en/docs/workflows) are supported with the GitHub backend:

- [Local Development Workflow](https://sveltiacms.app/en/docs/workflows/local)
- [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple)
- [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial)
- [Open Authoring](https://sveltiacms.app/en/docs/workflows/open)

### Deployment

[GitHub Actions](https://github.com/features/actions) is a great choice for deploying Sveltia CMS sites hosted on GitHub. [GitHub Pages](https://docs.github.com/en/pages) is free for public repositories and easy to set up.

There are also other deployment options, including [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/), [Netlify](https://www.netlify.com/integrations/github/) and [Vercel](https://vercel.com/docs/git/vercel-for-github). They provide seamless integration with GitHub repositories and support automatic deployments on push, with additional benefits like serverless functions, storage and AI integrations.

Choose the deployment platform that best fits your needs and follow their documentation to set up continuous deployment for your Sveltia CMS site.

Source: https://sveltiacms.app/en/docs/backends/github

---

## GitLab Backend

GitLab is a popular Git hosting service that offers a wide range of features for developers and teams. Sveltia CMS provides robust support for GitLab repositories, allowing editors to manage content seamlessly.

### Requirements

- GitLab 16.3 or later.
- A GitLab account.
- A GitLab repository to store the content.
- The Developer role or higher on the project, like Netlify/Decap CMS requires. The role can come from project membership, a parent group or a group invited to the project or to a parent group. Users with the Guest or Reporter role can’t sign in.
- Sveltia CMS installed in your project.

If the configured branch is [protected](https://docs.gitlab.com/user/project/repository/branches/protected/) and doesn’t allow a user to push, e.g. when only Maintainers can push to it:

- Collections using the [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple) and the [Asset Library](https://sveltiacms.app/en/docs/ui/asset-library) are read-only for that user, because they commit to the branch directly.
- Collections using the [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial) still work, because they commit to branches of their own. However, the Publish button is only shown to users who can merge the entry’s merge request.

#### CSP

If your site uses a Content Security Policy (CSP), you may need to update it to allow requests to GitLab. See the [CSP documentation](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) for more details.

### Configuration

The base configuration for the GitLab backend is straightforward. You need to specify the `name` of the backend as `gitlab` and provide the `repo` option with the format `owner/repo`, where `owner` is your GitLab username or organization name, and `repo` is the repository name.

```yaml [YAML]
backend:
  name: gitlab
  repo: user/repo
```

```toml [TOML]
[backend]
name = "gitlab"
repo = "user/repo"
```

```json [JSON]
{
  "backend": {
    "name": "gitlab",
    "repo": "user/repo"
  }
}
```

```js [JavaScript]
{
  backend: {
    name: "gitlab",
    repo: "user/repo",
  },
}
```

If you use subgroups, include them in the `owner` part, e.g. `group/subgroup/repo`.

#### Self-Hosted GitLab Instances

By default, Sveltia CMS uses the public GitLab instance at `https://gitlab.com`. If you use a self-hosted GitLab instance, you need to set the `base_url` and `api_root` options in your backend configuration to point to your GitLab server URL.

```yaml [YAML]{4-5}
backend:
  name: gitlab
  repo: owner/repo
  base_url: https://gitlab.example.com
  api_root: https://gitlab.example.com/api/v4
```

```toml [TOML]{4-5}
[backend]
name = "gitlab"
repo = "owner/repo"
base_url = "https://gitlab.example.com"
api_root = "https://gitlab.example.com/api/v4"
```

```json [JSON]{5-6}
{
  "backend": {
    "name": "gitlab",
    "repo": "owner/repo",
    "base_url": "https://gitlab.example.com",
    "api_root": "https://gitlab.example.com/api/v4"
  }
}
```

```js [JavaScript]{5-6}
{
  backend: {
    name: "gitlab",
    repo: "owner/repo",
    base_url: "https://gitlab.example.com",
    api_root: "https://gitlab.example.com/api/v4",
  },
}
```

The API version for GitLab is `v4`, so make sure to include `/api/v4` in the `api_root` option.

Sveltia CMS uses the GitLab GraphQL API where possible. Its endpoint is inferred from the `api_root` option by replacing the `/api/v4` part with `/api/graphql`, e.g. `https://gitlab.example.com/api/graphql`. If your instance’s GraphQL endpoint is at a different URL, set it with the `graphql_api_root` option.

The `base_url` option points to your GitLab server only when you use [PKCE authorization](#pkce-authorization). In that case, the OAuth authorization URL is made of `base_url` and the `auth_endpoint` option, which defaults to `oauth/authorize`.

- The `base_url` is not inferred from `api_root`, so you must set it for a self-hosted instance. Otherwise, it defaults to `https://gitlab.com`.
- If your instance is served under a subpath, include the subpath in `base_url` rather than `auth_endpoint`.

With the [authorization code flow](#authorization-code-flow), `base_url` is the URL of your OAuth client instead. The client must be configured to use your GitLab server. See [OAuth Endpoint](https://sveltiacms.app/en/docs/backends#oauth-endpoint) for details.

### Authentication

There are multiple ways to authenticate with GitLab when using Sveltia CMS. You can choose the method that best fits your needs. Using an access token is the simplest way to get started. If your CMS instance is used by multiple users or non-technical users, PKCE authorization is recommended, because it’s more user-friendly and secure.

**Tip**

If you plan to only [work with your local repository](https://sveltiacms.app/en/docs/workflows/local), you don’t need to set up authentication.

**Breaking change from Netlify/Decap CMS**

The deprecated client-side implicit grant flow for the GitLab backend is not supported in Sveltia CMS. It was [removed from GitLab 15.0](https://gitlab.com/gitlab-org/gitlab/-/issues/344609) in May 2022. Use PKCE authorization instead.

#### Access Token (Quick Start) {#access-token}

If you or a small team of developers are the only users of your CMS instance, you can use a [personal access token](https://docs.gitlab.com/user/profile/personal_access_tokens/) (PAT) for authentication. This method is straightforward and doesn’t require setting up an OAuth app or updating the CMS configuration.

Click the “Sign In with Token” button on the login screen. The prompt dialog provides a link to the token generation page on GitLab with the required scopes pre-selected. Generate a new token, copy it to the clipboard and paste it into the prompt dialog to sign in. The token will be stored in the browser’s local storage and used for subsequent API requests.

**Fine-grained tokens not supported yet**

GitLab’s [fine-grained personal access tokens](https://docs.gitlab.com/auth/tokens/fine_grained_access_tokens/) don’t work with Sveltia CMS yet. They can’t read the project permissions the CMS checks when you sign in, because GitLab hasn’t finished adding fine-grained token support to its GraphQL API. Use a legacy token instead. See [this discussion](https://github.com/sveltia/sveltia-cms/discussions/1121) for details.

You can [disable token authentication](https://sveltiacms.app/en/docs/backends#authentication-methods) if needed.

#### PKCE Authorization (Recommended) {#pkce-authorization}

To use PKCE authorization with Sveltia CMS, you need to register a new OAuth app on GitLab and update your Sveltia CMS configuration file accordingly. Here’s how:

1. Follow the instructions in the [GitLab documentation](https://docs.gitlab.com/integration/oauth_provider/) to create a new OAuth application.
1. Set the **Redirect URI** to your CMS admin URL, e.g. `https://your-domain.com/admin/`.
1. Uncheck the **Confidential** option.
1. Select the `api` scope.
1. Copy the Client ID of your registered OAuth app.

Then, update your Sveltia CMS configuration file to include the `auth_type` and `app_id` options:

```yaml [YAML]{4-5}
backend:
  name: gitlab
  repo: owner/repo
  auth_type: pkce
  app_id: YOUR_CLIENT_ID
```

```toml [TOML]{4-5}
[backend]
name = "gitlab"
repo = "owner/repo"
auth_type = "pkce"
app_id = "YOUR_CLIENT_ID"
```

```json [JSON]{5-6}
{
  "backend": {
    "name": "gitlab",
    "repo": "owner/repo",
    "auth_type": "pkce",
    "app_id": "YOUR_CLIENT_ID"
  }
}
```

```js [JavaScript]{5-6}
{
  backend: {
    name: "gitlab",
    repo: "owner/repo",
    auth_type: "pkce",
    app_id: "YOUR_CLIENT_ID",
  },
}
```

Users’ OAuth tokens will be automatically renewed as needed, so there’s no need to worry about token expiration.

#### Authorization Code Flow (Legacy) {#authorization-code-flow}

PKCE authorization is the recommended way to authenticate with GitLab. However, if you need to use the authorization code flow for some reason, you can follow the instructions below. This method requires a backend server to keep the client secret safe.

There are multiple options for the OAuth client, including our own Sveltia CMS Authenticator, third-party OAuth clients made for Netlify/Decap CMS or using Netlify as an OAuth provider.

##### Using Sveltia CMS Authenticator

We provide our own OAuth client called [Sveltia CMS Authenticator](https://github.com/sveltia/sveltia-cms-auth) that you can deploy on Cloudflare Workers. Follow the instructions in the repository to deploy the authenticator and update your CMS configuration file to include the `base_url` option pointing to your authenticator URL:

```yaml [YAML]{4}
backend:
  name: gitlab
  repo: owner/repo
  base_url: YOUR_CLIENT_URL
```

```toml [TOML]{4}
[backend]
name = "gitlab"
repo = "owner/repo"
base_url = "YOUR_CLIENT_URL"
```

```json [JSON]{5}
{
  "backend": {
    "name": "gitlab",
    "repo": "owner/repo",
    "base_url": "YOUR_CLIENT_URL"
  }
}
```

```js [JavaScript]{5}
{
  backend: {
    name: "gitlab",
    repo: "owner/repo",
    base_url: "YOUR_CLIENT_URL",
  },
}
```

##### Using Third-Party OAuth Client

You can also use [third-party OAuth clients](https://decapcms.org/docs/external-oauth-clients/) made for Netlify/Decap CMS. These clients support various languages and hosting services, and they should work with Sveltia CMS as well without any modifications.

The setup process is similar to using Sveltia CMS Authenticator. You need to register a new OAuth app on GitLab and configure the third-party client with the app credentials. Then, update your CMS configuration to include the `base_url` option pointing to your OAuth client URL, like in the example above.

The authorization URL is `base_url` followed by `/auth` by default, which is what clients made for Netlify/Decap CMS expect. If the client uses a different path, set the [`auth_endpoint`](https://sveltiacms.app/en/docs/backends#oauth-endpoint) option. If the client checks the site domain, you may need to set the [`site_domain`](https://sveltiacms.app/en/docs/backends#site-domain) option as well.

**Disclaimer**

Third-party clients are not reviewed or maintained by the Sveltia CMS team. Use them at your own risk. Some clients may not be compatible with Sveltia CMS.

##### Using Netlify

For backward compatibility with Netlify CMS, Sveltia CMS supports the authorization code flow using Netlify as an OAuth client. It’s the default authentication method if you don’t configure authentication explicitly, and you don’t need to set up a backend server yourself.

If your site is hosted on Netlify, you don’t need to install Sveltia CMS Authenticator or any other OAuth client. Instead, register a new OAuth app on GitLab and link it to your Netlify site. Here’s how:

1. Follow the instructions in the [GitLab documentation](https://docs.gitlab.com/integration/oauth_provider/) to create a new OAuth application.
1. Set the **Redirect URI** to `https://api.netlify.com/auth/done`.
1. Select the `api` scope.
1. Open the Netlify dashboard for your site and go to **Project configuration** > **Security** > **OAuth**. Note that this is not the **Identity** section, which is only used for Git Gateway and Netlify Identity.
1. Under **Authentication Providers**, click **Install Provider**, select **GitLab** and [provide the Client ID and Client Secret](https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/#netlify-ui-settings) of your registered OAuth app.

No changes are needed in Sveltia CMS, as long as `auth_type` and `base_url` are not set in your configuration file.

Netlify identifies the site by its domain. If the CMS is served from a domain other than the one of your Netlify site, set the [`site_domain`](https://sveltiacms.app/en/docs/backends#site-domain) option.

**Disclaimer**

We are not affiliated with Netlify and do not endorse or maintain this authentication method. We only provide it to ensure backward compatibility with Netlify CMS.

### Features

#### Git LFS

Git Large File Storage (LFS) is supported out of the box in the GitLab backend. Just make sure to [enable LFS](https://docs.gitlab.com/topics/git/lfs/) in your GitLab repository settings.

#### GraphQL

GraphQL support is enabled for GitLab repositories. Sveltia CMS uses the GitLab GraphQL API to interact with the repository, which provides better performance and flexibility compared to the REST API. No additional configuration is needed to enable GraphQL support.

#### Commit Signing

Signed commits are supported in self-hosted GitLab instances but disabled by default. See the [GitLab documentation](https://docs.gitlab.com/user/project/repository/signed_commits/web_commits/) for more details on setting up commit signing.

Signed commits are not supported in the public GitLab instance at `gitlab.com` at this time.

#### Service Status Checking

Service status checking is available for GitLab repositories, unless you’re using a self-hosted GitLab instance. Sveltia CMS periodically checks the [status of the GitLab service](https://status.gitlab.com/) to ensure that it is operational. If any incidents are detected, a notification banner will be displayed in the CMS UI to inform users of potential issues that may affect their workflow.

### Workflows

The following [content management workflows](https://sveltiacms.app/en/docs/workflows) are supported with the GitLab backend:

- [Local Development Workflow](https://sveltiacms.app/en/docs/workflows/local)
- [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple)
- [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial)
- [Open Authoring](https://sveltiacms.app/en/docs/workflows/open)

### Deployment

[GitLab CI/CD](https://docs.gitlab.com/ci/) is a great choice for deploying Sveltia CMS sites hosted on GitLab. [GitLab Pages](https://docs.gitlab.com/user/project/pages/) can be used to host static sites for free.

There are also other deployment options, including [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/git-integration/gitlab-integration/), [Netlify](https://www.netlify.com/integrations/gitlab/) and [Vercel](https://vercel.com/docs/git/vercel-for-gitlab). They provide seamless integration with GitLab repositories and support automatic deployments on push, with additional benefits like serverless functions, storage and AI integrations.

Choose the deployment platform that best fits your needs and follow their documentation to set up continuous deployment for your Sveltia CMS site.

Source: https://sveltiacms.app/en/docs/backends/gitlab

---

## Test Backend

The Test backend is a simple backend for testing and local development. It stores entries and assets in a virtual file system in the browser, allowing developers to test the Sveltia CMS setup without needing a repository.

The Test backend also powers our [demo site](https://demo.sveltiacms.app/), where anyone can try Sveltia CMS with sample content, without an account or a repository.

### Configuration

The configuration for the Test backend is straightforward. You only need to specify the backend name in your Sveltia CMS configuration file. No repository name or authentication details are required.

```yaml [YAML]
backend:
  name: test-repo
```

```toml [TOML]
[backend]
name = "test-repo"
```

```json [JSON]
{
  "backend": {
    "name": "test-repo"
  }
}
```

```js [JavaScript]
{
  backend: {
    name: "test-repo",
  },
}
```

### How It Works

The Test backend saves entries and assets in the browser’s [origin private file system](https://web.dev/articles/origin-private-file-system) (OPFS) so that changes are not discarded when the browser tab is closed or reloaded. The persistent storage support works with [all modern browsers](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable#browser_compatibility). Safari requires version 26 or later.

Since it’s not connected to any remote or local repository, the Test backend does not read existing content on initialization. Instead, it starts with an empty state, allowing you to create new entries and assets from scratch, unless you provide seed content as described below.

### Seeding Content

To make the Test backend start with some entries and assets, for example on a demo site, add a `<link>` element pointing to a seed manifest to the `<head>` of the admin page:

```html
<link rel="cms-seed-url" href="/seed/manifest.json" />
```

The manifest is a JSON file listing the paths of the files to be copied to the virtual file system. Each path is relative to the repository root, and the file is fetched from the same path relative to the manifest. Text and binary files, such as images, are both supported.

```json
{
  "files": [
    "content/posts/hello-world.md",
    "content/posts/second-post.md",
    "static/images/hello-world.jpg"
  ]
}
```

In the above example, `content/posts/hello-world.md` is fetched from `/seed/content/posts/hello-world.md`.

When a seed manifest is linked, the sign-in button reads Start Demo instead of Work with Test Repository. The files are copied when the user signs in for the first time.

Once the virtual file system exists, it’s left untouched, so the user’s changes are kept across reloads. If the user deletes the virtual file system with the Clear File Cache or Erase All Data button in the Data Management tab of the Settings dialog, the content is seeded again on the next sign-in.

A file that cannot be fetched is skipped with a warning in the browser console. Paths containing empty, `.` or `..` segments are ignored.

This is how our [demo site](https://demo.sveltiacms.app/) gets its sample posts, pages and images.

**Note for Netlify/Decap CMS users**

The `window.repoFiles` object used to populate the Test backend in Netlify/Decap CMS is not supported. Use the seed manifest instead.

If you want to test the CMS with a local Git repository, you can use the [Local Development Workflow](https://sveltiacms.app/en/docs/workflows/local) instead. It lets you make changes to local files with Sveltia CMS while it’s running on a local development server.

### Workflows

Only the [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple) is supported with the Test backend.

Source: https://sveltiacms.app/en/docs/backends/test
