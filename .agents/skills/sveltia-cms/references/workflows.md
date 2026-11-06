# Publishing Workflows

Local development, the simple publishing workflow, CI/CD deployments and how to disable them, and deploy previews. For the editorial workflow, the preview workflow and open authoring, see `workflows-editorial.md`.

Generated from the Sveltia CMS documentation. Do not edit by hand.

## Content Management Workflows

Sveltia CMS supports several workflows to accommodate different content management needs. Below are the available workflows:

### Development

[Local Development Workflow](https://sveltiacms.app/en/docs/workflows/local) is available for development and testing purposes. It allows developers to run Sveltia CMS without needing to connect to a remote repository or authentication service.

### Production

There are three main workflows for production use:

- [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple): no review process, editors can directly commit changes to the main branch.
- [Preview Workflow](https://sveltiacms.app/en/docs/workflows/preview): each change is saved to a pull request, so it can be checked on a deploy preview before it’s published, without a review process.
- [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial): includes a review and approval process before changes are merged into the main branch.

Additionally, the following features enhance the content management experience:

- [Open Authoring](https://sveltiacms.app/en/docs/workflows/open): allows external contributors to submit changes via pull requests.
- [Deploy Previews](https://sveltiacms.app/en/docs/deployments/previews): links each entry to the build made for it, and shows whether that build has finished.

These production workflows can be used locally or remotely. Not all workflows are supported by every backend; refer to the specific workflow documentation for details.

Source: https://sveltiacms.app/en/docs/workflows

---

## Local Development Workflow

Developers can smoothly work with local Git repositories using Sveltia CMS while running it on a local development server. This allows developers to test and edit content locally without needing to push changes to a remote repository first.

**Breaking changes from Netlify/Decap CMS**

Our local development workflow eliminates the need for a proxy server. For security and performance reasons, we don’t support `netlify-cms-proxy-server` or `decap-server`. The `local_backend` option is ignored. Read on to learn how to use the new, streamlined workflow.

**Another Option: Test Backend**

If you want to test the CMS but don’t want to modify local files, you can use the [Test backend](https://sveltiacms.app/en/docs/backends/test) instead. It lets you connect to a virtual file system in the browser, so the CMS can be tested without affecting your local files.

### Use Cases

- Test Sveltia CMS locally before deploying it to a production environment.
- Edit the CMS configuration and see how it affects the CMS behavior.
- Make bulk changes to content files and assets and commit them at once.
- Work offline without an internet connection.

### Requirements

You must have a Git repository initialized in your project directory. You can create a new repository with [`git init`](https://github.com/git-guides/git-init) or clone an existing one.

You also need to have a local development server running for your frontend framework (e.g. Astro, Eleventy, Hugo, Next.js) and have installed Sveltia CMS in the project.

You need Google Chrome, Microsoft Edge, Brave or any other Chromium-based browser. The workflow doesn’t work in Firefox, Safari or other non-Chromium browsers. It relies on the [File System Access API](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access), which only Chromium-based browsers support at this time.

Mozilla plans to [implement the API in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1909237), but it’s not available yet. We track Firefox support in [issue #38](https://github.com/sveltia/sveltia-cms/issues/38).

#### Enabling File System Access API in Brave

In the Brave browser, you must manually enable the File System Access API with an experiment flag to take advantage of the local development workflow.

1. Open `brave://flags/#file-system-access-api` in a new browser tab.
1. Click Default (Disabled) next to File System Access API and select Enabled.
1. Relaunch the browser.

### Configuration

In your CMS configuration, you must configure one of the supported Git backends: [GitHub](https://sveltiacms.app/en/docs/backends/github), [GitLab](https://sveltiacms.app/en/docs/backends/gitlab) or [Gitea/Forgejo](https://sveltiacms.app/en/docs/backends/gitea-forgejo). No other configuration is required.

**Authentication Not Required**

If you plan to only work with your local repository, you don’t need to set up authentication with your Git backend. You can use the CMS as a local-only editor UI and commit changes manually using Git, or let the CMS [commit them for you](#git-commits). However, if you want to edit content remotely as well, you must set up authentication as described in the backend documentation.

**Repository Name Can Be Arbitrary**

If you don’t have a remote repository yet, you can use any repository name for the `repo` property in the backend configuration. The CMS never connects to the remote repository in this workflow, so it doesn’t matter whether the repository exists.

The backend configuration is still used to store data in the browser’s IndexedDB, which is partitioned by the backend `name` and `repo`. A dummy name, such as `my-name/travel-blog`, works fine for this.

### Workflow

The local workflow consists of four main steps:

#### 1. Start the development server

Launch the local development server for your frontend framework, typically with `npm run dev`, `pnpm dev` or `yarn dev`.

#### 2. Edit content

In any Chromium-based browser:

1. Open `http://localhost:[port]/admin/index.html`. Replace `[port]` with the actual port number used by your development server.
1. Click “Work with Local Repository” and select the project’s root directory once prompted.
1. Edit content normally using the CMS. All changes are made to local files.

#### 3. Preview changes

Open the dev site at `http://localhost:[port]/` in any browser to preview the rendered pages. To make further edits, return to the CMS.

#### 4. Commit changes

With any Git client (CUI or GUI):

1. See if the produced changes (diff) look good.
1. Commit and push the changes if satisfied, or discard them if you’re just testing.

If you turn on [Git commits](#git-commits), the CMS commits each change for you, so you only need to review and push the commits.

### Git Commits

By default, the CMS only saves your changes to the files, and you commit them yourself. If you turn on Git commits, the CMS also commits each save to the current branch of your local repository, the same way the Git backends commit to the remote repository.

To turn it on, open the Settings, select Developer and turn on Commit Changes to Git. The setting is stored in your browser, so it only applies to you. Below the switch, the CMS shows the branch and the author it will commit with, or why it can’t commit right now.

The commits use the same messages as with a Git backend, including any [custom commit messages](https://sveltiacms.app/en/docs/backends#commit-messages) you have configured.

Only the files the CMS saves are committed. Other changes in your working tree, such as templates or styles you’re working on, are left out.

The commits stay on your computer until you push them with your Git client. They’re also recorded in the reflog, so you can find and undo them with Git as usual.

#### Setting Your Identity

The CMS can only read the configuration of the repository itself (`.git/config`), not your global Git configuration, which lives outside the project folder. Set your name and email address in the repository:

```sh
git config --local user.name "Your Name"
git config --local user.email "you@example.com"
```

Note that `git config user.name` without a value only shows the name Git uses, which may come from your global configuration.

#### When Changes Aren’t Committed

In the following cases, the CMS saves your changes without committing them and tells you why. This keeps your own work in progress out of its commits.

The CMS doesn’t commit when:

- You have other changes staged for commit. Commit or unstage them first. Changes you haven’t staged don’t get in the way.
- A merge, rebase, cherry-pick, revert or `git am` is in progress, or some files have conflicts. The message tells you how to finish or cancel the operation.
- Another Git process is using the repository, which is indicated by a `.git/index.lock` file. If no Git process is running, delete the file.
- No branch is checked out (a detached `HEAD`).
- Your name and email address aren’t set in the repository, as described above.
- A saved file is tracked with [Git LFS](https://git-lfs.com/). As with Git, the patterns in `.gitattributes` are matched case-insensitively when `core.ignorecase` is `true`. That’s the case in a repository cloned or created on macOS or Windows, so there `IMG_1234.JPG` is caught by `*.jpg`.

While the CMS commits, it creates `.git/index.lock` like Git does, so Git commands that change the repository refuse to run until it’s done.

#### Caveats

The CMS commits in the browser with the help of [isomorphic-git](https://isomorphic-git.org/), rather than with Git itself. This brings some limitations:

- Git hooks, such as `pre-commit`, are not run, and commits are not signed, even if `commit.gpgsign` is set.
- Filters and attributes set in `.gitattributes`, such as line ending conversion, are not applied. Files tracked with Git LFS are saved but not committed.
- A new file that the repository’s `.gitignore` files or `.git/info/exclude` ignore is saved but not committed, as with `git add`. Your global ignore file, set with `core.excludesFile`, is not read, so a file only it ignores is committed.
- In the following repositories, changes are only saved, not committed:
  - linked worktrees and submodules, where `.git` is a file pointing outside the project folder
  - repositories using SHA-256 object names or the reftable format
  - repositories whose index is split, sparse or in version 3 or 4, which Git uses for sparse checkouts, `git add -N` and the `feature.manyFiles` option
- Fetching, pulling, pushing and switching branches still have to be done with a Git client.
- After the CMS commits, the next `git status` may take a moment longer than usual, as Git checks the committed files again.
- Saving takes longer in a large repository, as the CMS reads the whole Git index every time. With tens of thousands of files, committing can add a fraction of a second to each save. The first save after a Git command that updates the index, such as `git status` or `git pull`, takes a little longer. The very first save also loads the Git library, which is about 50 KB.

### Tips & Tricks

- An indicator is displayed in the Account menu when using the local workflow.
- The `localhost` URL:
  - The port number varies by framework. Check the terminal output from the previous step. For example, if you use Vite-based frameworks like SvelteKit or VitePress, the default port is `5173`. Astro uses `4321`, Eleventy uses `8080`, Hugo uses `1313` and Jekyll uses `4000`.
  - The `127.0.0.1` and `[::1]` addresses can also be used instead of `localhost`.
  - If your CMS instance is not located under `/admin/`, use the appropriate path.
  - It’s recommended to use `index.html` in the URL to make sure the framework treats it as a static file. For example, use `http://localhost:5173/admin/index.html` instead of `http://localhost:5173/admin/`.
- Git clients:
  - You can use any Git client of your choice, including command-line tools (CUI) or graphical user interfaces (GUI).
  - For CUI, you can use the standard Git commands like `git diff`, `git commit` and `git push`.
  - For GUI, popular options include [GitHub Desktop](https://github.com/apps/desktop), [Sourcetree](https://www.sourcetreeapp.com/), [Tower](https://www.git-tower.com/) and [GitKraken](https://www.gitkraken.com/). GitHub Desktop can be used for any repository, not just GitHub-hosted ones. [VS Code](https://code.visualstudio.com/docs/sourcecontrol/overview) also has built-in Git support.
- Depending on your framework, you may need to manually rebuild your site or reload the page to reflect the changes you have made. Check your framework’s documentation for details.
- You can skip the site preview check if your changes don’t involve any pages.

### Troubleshooting

- Load Sveltia CMS from a static HTML file in your site’s [static files folder](https://sveltiacms.app/en/docs/start#manual-installation), such as `/public/admin/index.html`. Don’t load it from a page rendered by your framework, such as `/src/pages/admin.astro` with Astro or `/src/routes/admin/+page.svelte` with SvelteKit.

  While your local development server is running, such a page is reloaded every time a file changes. This can interrupt saving and leave a file empty or a temporary `.sveltia-tmp-*` file behind. Live reload is not applied to a static file.

  Sveltia CMS shows a warning at the top of the page if it detects this problem with a Vite-based framework, such as Astro, Nuxt, SvelteKit or VitePress.

- If you get an error saying “not a repository root directory”, make sure you’ve turned the folder into a repository with either a CUI ([`git init`](https://github.com/git-guides/git-init)) or GUI, and that the hidden `.git` folder exists.

  Unless [Git commits](#git-commits) are turned on, Sveltia CMS doesn’t read or write files inside the `.git` folder. It still checks that the folder exists, to verify that the selected folder is the project root and that Git can track the changes made in the CMS.

- If you’re using Windows Subsystem for Linux (WSL), you may get an error saying “Can’t open this folder because it contains system files.” This is due to a limitation in the browser, and you can try some workarounds mentioned in [this issue](https://github.com/coder/code-server/issues/4646) and [this thread](https://github.com/sveltia/sveltia-cms/discussions/101).

### Limitations

Apart from [committing your changes](#git-commits) if you turn it on, Sveltia CMS doesn’t perform any Git operations with the local repository. You have to fetch, pull and push changes manually with a Git client, and commit them too unless the CMS does. Additionally, you’ll need to reload the CMS after modifying the configuration file or retrieving remote updates.

**Future Plans**

We plan to use the newly available [File System Observer API](https://developer.chrome.com/blog/file-system-observer) to detect changes and eliminate the need for manual reloads.

Source: https://sveltiacms.app/en/docs/workflows/local

---

## Simple Workflow

This is the default remote workflow suitable for single users or small projects. There is no review process, and changes are made directly to the repository.

### Use Cases

- Individual bloggers or content creators managing their own websites.
- Small teams or projects where a formal review process is unnecessary.
- Quick content updates or changes that do not require oversight.

### Requirements

No special requirements are needed to use the simple workflow. Users can start making changes directly after setting up their Sveltia CMS instance.

### Configuration

No specific configuration is required for this workflow. It’s used when the top-level `publish_mode` option is omitted, set to `simple` or set to an empty string. A collection can override it with its own [`publish_mode`](https://sveltiacms.app/en/docs/workflows/editorial#enabling-the-workflow-per-collection) option.

### Workflow

The simple workflow allows users to create, edit and delete entries directly in the connected Git repository without any review process. Here’s how it works:

1. Log in to Sveltia CMS using the standard OAuth authentication process or an access token.
2. Navigate to the desired collection from the collection list.
3. Create, edit or delete entries as needed.
4. Save the changes. Sveltia CMS will automatically commit and push the changes to the connected Git repository.

### Deploying Changes

Changes made through Sveltia CMS are automatically committed and pushed to the connected repository’s default branch (e.g. `main` or `master`, unless the `branch` option is set). If you have set up CI/CD for your site, the changes will be deployed automatically based on your existing deployment process.

See the [deployments guide](https://sveltiacms.app/en/docs/deployments) for more details, including how to disable automatic deployments if needed.

**Pull CMS Changes to Your Local Repository**

Sveltia CMS commits changes to the remote repository, not to the copy on your computer. To see content published in the CMS on your local development server, run `git pull` first. Pulling before you make your own changes also helps avoid merge conflicts when you push. This doesn’t apply to the [local development workflow](https://sveltiacms.app/en/docs/workflows/local), where the CMS writes to your local files instead.

### Multiple Editors

While this workflow is designed for single users, multiple editors can still collaborate by coordinating their changes. However, since there is no review process, it is essential to communicate effectively to avoid conflicts and ensure that everyone is aware of the changes being made.

At this time, Sveltia CMS does not provide built-in features for handling merge conflicts or simultaneous edits. We plan to add such features in future releases to enhance collaboration in the simple workflow.

Source: https://sveltiacms.app/en/docs/workflows/simple

---

## Deployments

Sveltia CMS is a headless CMS, so it doesn’t involve any specific deployment process. The [two required CMS files](https://sveltiacms.app/en/docs/start#manual-installation), `index.html` and `config.yml`, can be hosted on any web server or static hosting service. This enables the project to be deployed like any other website using any preferred hosting service or platform.

### CI/CD Integration

In most cases, you may want to automatically deploy your website whenever content is saved in your Git repository via Sveltia CMS. This can be achieved by integrating with a [CI/CD](https://en.wikipedia.org/wiki/CI/CD) (Continuous Integration/Continuous Deployment) service that monitors your Git repository for changes and triggers a build and deployment process.

All the supported Git backends offer their own CI/CD solutions or can be easily integrated with popular third-party CI/CD services. Here are some examples:

- Building: [GitHub Actions](https://github.com/features/actions), [GitLab CI/CD](https://docs.gitlab.com/ci/), [Gitea Actions](https://docs.gitea.com/usage/actions/overview), [Forgejo Actions](https://forgejo.org/docs/latest/user/actions/reference/), [Cloudflare Pages](https://pages.cloudflare.com/), [Netlify](https://www.netlify.com/), [Vercel](https://vercel.com/), [CircleCI](https://circleci.com/), [Travis CI](https://www.travis-ci.com/), [Jenkins](https://www.jenkins.io/), etc.
- Hosting: [GitHub Pages](https://docs.github.com/en/pages), [GitLab Pages](https://docs.gitlab.com/user/project/pages/), [Cloudflare Pages](https://pages.cloudflare.com/), [Netlify](https://www.netlify.com/), [Vercel](https://vercel.com/), [Amazon EC2](https://aws.amazon.com/ec2/), [Firebase Hosting](https://firebase.google.com/products/hosting), [DigitalOcean Droplets](https://www.digitalocean.com/products/droplets), etc.

Your choice of CI/CD service may depend on factors such as ease of use, pricing, performance and integration with your existing workflow. Some services only host completely static sites, while others can handle dynamic applications as well. Refer to the documentation of your chosen CI/CD and hosting providers for specific instructions on how to set up the deployment process.

### Deploy Previews

A connected CI/CD provider does more than publish your site: it reports each build back to your Git repository, and Sveltia CMS reads those reports. Editors get a link straight to the page they just worked on and can see whether the build carrying their change has finished.

This works in both production workflows. With [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), an unpublished entry links to the preview built for its pull request, so a draft can be reviewed before it goes live. With [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple), the entry links to the live site and the CMS reports whether the latest build is done.

Nothing needs to be turned on. Set a [`preview_path`](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) on the collections you want entry links for. Without it, only the root of a deploy preview is linked.

See [Deploy Previews](https://sveltiacms.app/en/docs/deployments/previews) for which providers are recognized and how the links behave while a build is running.

### Disabling Automatic Deployments

You may already have a CI/CD tool set up on your Git repository to automatically deploy changes to production. Sometimes you make so many content changes that you quickly reach your CI/CD provider’s (free) build limits. Or you may just not want a build triggered for every small change.

With Sveltia CMS, you can disable automatic deployments by default and manually trigger deployments at your convenience. This is done by adding the `[skip ci]` prefix to commit messages. This convention is supported by [GitHub Actions](https://docs.github.com/en/actions/managing-workflow-runs/skipping-workflow-runs), [GitLab CI/CD](https://docs.gitlab.com/ee/ci/pipelines/#skip-a-pipeline), [CircleCI](https://circleci.com/docs/skip-build/#skip-jobs), [Travis CI](https://docs.travis-ci.com/user/customizing-the-build/#skipping-a-build), [Netlify](https://docs.netlify.com/site-deploys/manage-deploys/#skip-a-deploy), [Cloudflare Pages](https://developers.cloudflare.com/pages/platform/branch-build-controls/#skip-builds) and others.

**No build, no preview**

A skipped commit produces no build, so there’s nothing for [Deploy Previews](https://sveltiacms.app/en/docs/deployments/previews) to report and the entry keeps its plain live-site link. This applies to Editorial Workflow saves too, where the prefix is added to the pull request’s commits. Deletion commits are never skipped.

#### Configuration

Here are the steps to use this feature:

1. Add the `skip_ci` property to your `backend` configuration with a value of `true`:

   ::: code-group

   ```yaml [YAML]
   backend:
     name: github
     repo: owner/repo
     branch: main
     skip_ci: true
   ```

   ```toml [TOML]
   [backend]
   name = "github"
   repo = "owner/repo"
   branch = "main"
   skip_ci = true
   ```

   ```json [JSON]
   {
     "backend": {
       "name": "github",
       "repo": "owner/repo",
       "branch": "main",
       "skip_ci": true
     }
   }
   ```

   ```js [JavaScript]
   {
     backend: {
       name: "github",
       repo: "owner/repo",
       branch: "main",
       skip_ci: true,
     },
   }
   ```

   :::

1. Commit and deploy the change to the config file and reload the CMS.
1. Now, whenever an entry or asset is saved, `[skip ci]` is automatically added to each commit message. However, deletions are always committed without the prefix, so that deleted data doesn’t unexpectedly stay on the site.
1. To deploy a new or updated entry, along with any other unpublished entries and assets, click the arrow next to the Save button in the Content Editor, then select **Save and Publish**. This omits `[skip ci]` and so triggers CI/CD.

If you set `skip_ci` to `false`, the behavior is reversed. CI/CD is triggered by default, and a **Save without Publishing** option adds `[skip ci]` to that one commit only.

**Deprecation Notice**

The `automatic_deployments` option has been deprecated in favor of the more intuitive `skip_ci` option. It will be removed in Sveltia CMS v1.0.0.

If you are upgrading from an older version, update your configuration:

- `automatic_deployments: false` is equivalent to `skip_ci: true`.
- `automatic_deployments: true` is equivalent to `skip_ci: false`.

**Unpublished vs. Drafts**

Unpublished entries and assets are not drafts. Once committed to your repository, those changes can be deployed any time another commit is pushed without `[skip ci]`, or when a manual deployment is triggered.

#### Manual Deployment Trigger

If the `skip_ci` property is defined, you can manually trigger a deployment by clicking the **Publish Changes** button on the application header. To use this feature:

##### GitHub Actions

Without any configuration, Publish Changes will [trigger a `repository_dispatch` event](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event) with the `sveltia-cms-publish` event type. Update your build workflow to receive this event:

```yaml
on:
  push:
    branches: [$default-branch]
  repository_dispatch:
    types: [sveltia-cms-publish]
```

##### GitLab CI/CD

Without any configuration, Publish Changes will [create a new pipeline](https://docs.gitlab.com/api/pipelines/#create-a-new-pipeline) on the configured branch with the signed-in user’s access token. A pipeline created this way runs even when the latest commit has the `[skip ci]` prefix, so there’s no deploy hook URL to set up.

The user needs the Developer role or higher on the project, and if the branch is [protected](https://docs.gitlab.com/user/project/repository/branches/protected/), permission to push or merge to it.

The pipeline has `api` as its [`CI_PIPELINE_SOURCE`](https://docs.gitlab.com/ci/jobs/job_rules/#ci_pipeline_source-predefined-variable). If your `.gitlab-ci.yml` only runs on push, GitLab refuses to create the pipeline and the CMS shows an error. Allow the `api` source as well:

```yaml
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "push" || $CI_PIPELINE_SOURCE == "api"
```

##### Other CI/CD Providers

To use Publish Changes with a CI/CD provider other than GitHub Actions or GitLab CI/CD, you need to set up a [webhook](https://en.wikipedia.org/wiki/Webhook) in your CI/CD provider that triggers a build when called. Check your provider’s documentation for instructions on how to create a deploy hook URL. Here are some examples:

- [Cloudflare Pages](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)
- [Netlify](https://docs.netlify.com/build/configure-builds/build-hooks/)
- [Vercel](https://vercel.com/docs/deploy-hooks)

Then, configure Sveltia CMS to use this URL:

1. Select Settings under the Account button in the top right corner of the CMS.
1. Select the Developer tab.
1. Enter the deploy hook URL for your provider.
1. [Configure the CSP](https://sveltiacms.app/en/docs/security#setting-up-content-security-policy) if necessary.

**Why Deploy Hook URL Is Stored in User Settings**

Deploy hook URLs are confidential, so they can’t be stored in the CMS configuration file, which is usually readable on a public website. Sveltia CMS works entirely in the frontend, so it has no other secure place to store such credentials. That’s why they are managed in the user settings, which are stored securely in the browser’s local storage.

When the user signs out, the deploy hook URL and its authorization header are removed from the browser, along with the API keys for other integrations. They need to be entered again after signing back in.

In the future, we may provide a way to manage credentials for all users via an edge function called [Sveltia CMS Additions](https://sveltiacms.app/en/docs/additions).

Source: https://sveltiacms.app/en/docs/deployments

---

## Deploy Previews

Most hosting services build the site again whenever a commit lands, and many build a separate copy for each pull request. Sveltia CMS asks the Git backend where those builds ended up, so an editor can open the page they just worked on without hunting for the URL — and can tell whether the build has finished yet.

This works in both production workflows, with a different meaning in each:

- In [Editorial Workflow](https://sveltiacms.app/en/docs/workflows/editorial), an unpublished entry links to the **deploy preview** built for its pull request, so editors can see a draft before it goes live.
- In [Simple Workflow](https://sveltiacms.app/en/docs/workflows/simple), where changes are committed straight to the [configured branch](https://sveltiacms.app/en/docs/backends#branch-selection), an entry links to the **live site**, and the CMS reports whether the build for the latest change has finished.

### Requirements

- A [GitHub](https://sveltiacms.app/en/docs/backends/github), [GitLab](https://sveltiacms.app/en/docs/backends/gitlab) or [Gitea/Forgejo](https://sveltiacms.app/en/docs/backends/gitea-forgejo) backend.
- A CI/CD provider connected to the repository. See [CI/CD Integration](https://sveltiacms.app/en/docs/deployments#ci-cd-integration).
- A [`preview_path`](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) on each collection you want entry links for. Without it, an unpublished entry links to the root of its deploy preview, where you can find the page manually. A published entry has no link.

**Date tags need a date field**

When `preview_path` uses `{{year}}`, `{{month}}` or another date tag, the CMS reads the date from one of these:

- the top-level DateTime field named by `preview_path_date_field`
- otherwise, the first DateTime field of the collection, or of the file in a file collection

If no such field exists, a configuration warning says so. Otherwise the preview link would go missing with no explanation.

A field that exists but is left empty on an entry has the same effect. That can only be spotted on the entry itself.

### Configuration

There’s nothing to turn on. As long as the requirements above are met, deploy preview links appear on their own.

The options below shape what the links do:

| Option | Where | What it does |
| --- | --- | --- |
| [`preview_path`](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) | Entry collection, or each file of a file collection | Path template appended to the site or preview URL. Without it, only the root of a deploy preview is linked |
| [`preview_path_date_field`](https://sveltiacms.app/en/docs/collections/entries/previews#preview-paths) | Entry collection, or each file of a file collection | Which top-level DateTime field the `{{year}}`, `{{month}}` and similar tags read. Default: the first DateTime field |
| [`site_url`](https://sveltiacms.app/en/docs/customization#site-url) | Top level | Base URL of the live site |
| `show_preview_links` | Top level | Set to `false` to hide every preview link. Default: `true` |
| [`preview_context`](#specifying-a-status-context) | `backend` | Names the exact commit status or environment that carries the preview URL |

If `site_url` isn’t set, the CMS falls back to the URL reported by the production deployment, so links can still work without it. When `site_url` _is_ set, it always wins.

### How It Works

Every entry belongs to a commit: the head of its pull request in Editorial Workflow, or the head of the configured branch otherwise. The CMS asks the backend what the CI/CD provider reported for that commit, takes the URL from the answer, and appends the collection’s `preview_path`.

So an entry whose `preview_path` is `/blog/{{slug}}` links to `https://example.com/blog/my-post` on the live site, and to `https://cms-posts-hello.example.pages.dev/blog/my-post` on a deploy preview built by Cloudflare Pages.

#### Where the URL Comes From

Providers report a deployment in one of three ways, and Sveltia CMS reads all of them:

| Source | Known to use it |
| --- | --- |
| **Deployments** (GitHub) and **environments** (GitLab) | Vercel, GitHub Pages, GitLab Review Apps |
| **Commit statuses** | Vercel, Gitea/Forgejo Actions and CI services that post a build status |
| **Check runs** (GitHub only) | Cloudflare Pages, AWS Amplify |

Gitea and Forgejo have commit statuses alone, so on that backend a provider has to post one to be seen. See [Reporting a Preview from Gitea/Forgejo Actions](#gitea-forgejo-actions).

All three are read whichever provider is used. So a provider that isn’t listed still works, as long as it reports through any of them.

Equally, a provider that reports nowhere the Git host can see can’t be detected at all. Several publish only to their own dashboard, or to a pull request comment. If you’re unsure which applies, open a recent commit on your Git host and see whether anything is attached to it.

##### Choosing Among Several Reports

When more than one provider reports on the same commit, the CMS first sets aside the ones that don’t look like a deployment. A commit status or check run whose name doesn’t mention a known provider, or a word like “deploy”, “preview” or “pages”, is most likely a test suite or a linter. GitLab posts a commit status for every CI job, as do Gitea and Forgejo for every Actions job, and CI services like CircleCI do the same on GitHub.

Such a candidate is still reported if nothing else is there, so a provider these rules have never heard of still works. But a finished test suite can’t stand in for a deploy preview that’s still building.

Among the remaining candidates, the CMS prefers, in order:

1. a finished build with a page to open
1. the source whose URL is most reliable — a deployment’s environment URL is always the site, while a commit status URL is sometimes a build log
1. an environment whose name matches what it’s looking for, so a `production` environment isn’t passed over for a `preview` one on the live branch

Ties go to the newest.

##### Ignored Addresses and Builds

An address is only taken from a finished build, because several providers hand out a placeholder while they work. For example, Cloudflare Pages reports its own dashboard until the build succeeds, then replaces it with the preview address. So nothing is offered until there’s a page behind it.

A URL leading back to the Git host is ignored for the same reason: it’s a job log, which every GitLab CI job and every Gitea/Forgejo Actions job reports.

A build that was canceled or skipped is ignored, even when the provider reports it as successful. This happens in a monorepo, where a site that the commit didn’t touch still reports a result, and its URL leads to the build log rather than a page.

**How check runs are read**

A check run’s own link usually leads to a build log rather than a site, so it takes more care than the other two sources.

Every run reports its build state. So even a provider these rules have never heard of still reports that a build on the commit is running or has failed.

Offering an address is another matter. Only a run whose name suggests a deployment offers one. A run that doesn’t is ranked below every one that does, so a green test suite can’t stand in for a build that hasn’t finished.

For a run that does look like a deployment, the address is taken in this order:

1. **A URL published in the run’s output.** Cloudflare Pages links the check itself to the Cloudflare dashboard, but writes a table of preview URLs into its check summary. So that table is read, and any dashboard links in it are passed over.
2. **The run’s own link, but only if the name says “preview”.** AWS Amplify reports “AWS Amplify Console Web Preview” and links straight to the site.
3. **Neither.** The build state is still reported — so the editor sees that a build is running or has failed — but no address is offered.

If your provider’s naming defeats this, name the check explicitly with [`preview_context`](#specifying-a-status-context).

#### Build States

What the control does depends on whether a preview is still on its way.

**While a preview is being built for an unpublished entry**, the button reads **Checking for Preview**, is disabled and shows a turning icon. The live-site link isn’t offered, because the live site doesn’t show that entry. It holds the published version, or nothing at all when the entry is new.

**Otherwise the button is a link.** It reads **View Preview** when it points at a deploy preview, and **View on Live Site** when it points at the live site.

A build that’s still running or has failed is described on the control for screen readers. It’s also shown as a badge on the [Editorial Workflow page](https://sveltiacms.app/en/docs/workflows/editorial#editorial-workflow-page):

| Build state                                 | Badge on the workflow card |
| ------------------------------------------- | -------------------------- |
| Building                                    | **Building…**              |
| Failed                                      | **Build Failed**           |
| Being queried, finished or nothing reported | none                       |

A published entry is never made to wait, whatever its build is doing: the live site genuinely holds that page, so the link stays available.

When no CI/CD provider reports anything, nothing is lost: the same live-site link as before is shown. This happens when no provider is connected, or when it reports in a way the backend doesn’t expose.

##### Checking Again While Building

While a build is running, the CMS checks again every 5 seconds, so a preview is offered as soon as it exists. Each check costs:

- on GitHub, a single request
- on GitLab, one shared call plus one per commit being watched
- on Gitea/Forgejo, one request per commit being watched

The CMS gives up after 10 minutes. The icon stops turning, the link comes back, and a **Check for Preview** action appears in the entry editor’s options menu. Reopening the entry starts a fresh round of checks, so a build that takes longer isn’t lost.

#### Checking Whether the Page Is Live

A finished build isn’t quite the same as a page that can be opened. A CDN may not have caught up, and a brand-new entry can 404 for a moment after publishing. Where it can, the CMS requests the page itself, and keeps treating the build as unfinished until the page answers.

This check only runs when the page is on the same origin as the CMS. That’s the usual case when the CMS is served from `/admin` on the site it edits.

A browser can’t read a cross-origin response without permission from that server, and no major static host grants it. So for other origins, the request is skipped rather than sent to learn nothing. Deploy previews are almost always on another origin, so their state comes from the provider alone.

#### Where Links Appear

- In the entry editor toolbar, for the default locale.
- In each locale pane’s options menu, so a multilingual entry links to the right translation. See [Managing Preview Paths with I18n](https://sveltiacms.app/en/docs/i18n/slugs#preview-paths).
- On the cards of the [Editorial Workflow page](https://sveltiacms.app/en/docs/workflows/editorial#editorial-workflow-page), as an icon button, with a badge when a build is running or has failed.

### Reporting a Preview from Gitea/Forgejo Actions {#gitea-forgejo-actions}

Gitea and Forgejo Actions post a commit status for each job, but it links to the job log, not to anything the job deployed. A workflow that publishes a deploy preview has to report the address itself. Once the preview is up, post a commit status of your own on the head of the pull request:

```yaml
- name: Report the deploy preview
  env:
    TOKEN: ${{ github.token }}
    PREVIEW_URL: https://preview.example.com/pr-${{ github.event.pull_request.number }}/
    STATUS_URL: ${{ github.server_url }}/api/v1/repos/${{ github.repository }}/statuses/${{ github.event.pull_request.head.sha }}
  run: |
    curl --fail -X POST "$STATUS_URL" \
      -H "Authorization: token $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"context\": \"pages/preview\", \"state\": \"success\", \"target_url\": \"$PREVIEW_URL\"}"
```

Posting a status takes write access to the repository. Whether the automatic token has it depends on where the pull request comes from:

- **A branch of the same repository**, which is where Editorial Workflow saves entries: the token has write access by default, unless Gitea’s Actions settings restrict it to read access for the repository or its organization.
- **A fork**, as in [Open Authoring](https://sveltiacms.app/en/docs/workflows/open): the token is read-only by default.

When the automatic token is read-only, the preview needs an access token with write access, stored as a secret. Otherwise it goes unreported.

The context, `pages/preview` here, can be anything. A name with “preview”, “deploy” or “pages” in it is recognized as a deployment without configuration, and the CMS then prefers it to the Actions job’s own status, whose link is a log.

The job that posts the status may itself be named like a deployment — `Preview / preview (pull_request)`, say. Its own status then still reports the build as running until the address arrives, which is what you want. If you’d rather the job were left out entirely, set [`preview_context`](#specifying-a-status-context) to the context you post.

### Specifying a Status Context

If several providers report on the same commit, or the CMS picks the wrong one, name the one you want with `preview_context` in the `backend` section. Only that commit status, check run or environment is then considered.

```yaml [YAML]
backend:
  name: github
  repo: user/repo
  preview_context: Cloudflare Pages
```

```toml [TOML]
[backend]
name = "github"
repo = "user/repo"
preview_context = "Cloudflare Pages"
```

```json [JSON]
{
  "backend": {
    "name": "github",
    "repo": "user/repo",
    "preview_context": "Cloudflare Pages"
  }
}
```

```js [JavaScript]
{
  backend: {
    name: 'github',
    repo: 'user/repo',
    preview_context: 'Cloudflare Pages',
  },
}
```

The name is matched exactly first, and as a partial match if nothing matches exactly — so `cloudflare` finds `Cloudflare Pages` too. Matching is case-insensitive.

Setting this option narrows the search deliberately. If nothing matches, the CMS reports no preview rather than falling back to a provider that wasn’t requested. If a link stops showing up, check the name against the status or environment as it appears on your repository.

### Limitations

- On GitHub, a workflow that deploys the site but reports no deployment, no commit status and no check run can’t be detected. Publishing to GitHub Pages with the official actions creates a deployment, so it works; a hand-rolled workflow that only uploads files may not.
- [Cloudflare Workers](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/) publishes its preview URL in a pull request comment, which no API surfaces alongside the commit. Its check run still reports whether the build succeeded, so the build state is available without a preview link. Cloudflare Pages, which writes the address into its check output, works fully.
- Reading a preview URL out of a check run’s output means reading what that provider chose to write. If the format changes, the address is no longer found and the entry falls back to its live-site link — degraded rather than broken.
- On Gitea/Forgejo, nothing reports a deploy preview unless a workflow or an external service posts it as a commit status. The statuses Actions posts for its jobs give the build state without an address.
- On GitLab, deployments can’t be filtered by commit through the API, so the CMS scans the most recent 100 from the past week and matches them to the branch. A project that deploys more often than that may push a Review App out of range. Its commit status still covers it then.
- A preview behind access control, such as Vercel’s Deployment Protection, answers the liveness check with an authentication error rather than a page. The CMS treats that as “can’t tell” and leaves the link alone, since it works for anyone signed in.

Source: https://sveltiacms.app/en/docs/deployments/previews
