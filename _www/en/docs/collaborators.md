---
translationKey: collaborators
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Collaborators & organizations
docsNav:
  section: editors
  order: 10
metadata:
  description: Let other people edit your site — GitHub collaborators, tokens, and multi-site organizations
---

# Collaborators & organizations

Your site lives on GitHub, and so does access control: anyone who should edit the site needs a GitHub account added to your repository.

## Adding an editor

- In your repository on GitHub, open **Settings → Collaborators → Add people** and invite the person by username or email.
- They accept the invitation — they now have write access to the repository.
- Each editor then creates **their own personal access token** ([the same pre-filled form](https://github.com/settings/personal-access-tokens/new?name=poko-website-builder+token&description=Read+and+write+repo+access+for+the+CMS&expires_in=none&contents=write) works for them too — with *their* account).
- They log into `your-site.com/admin` with *their* token.

{% image src="/_images/tutos/4-validation.webp", width="500" %}

> Never share your token — every editor gets their own. Their name shows up on each change in the repository history, which keeps a clean audit trail of who edited what.

## Removing an editor

Remove them from **Settings → Collaborators** on GitHub — they instantly lose the ability to save (their token stops working on your repo). Their past edits stay in history.

## Multiple sites? Use an organization

GitHub gives one free site per account — but you can create **organizations** (free) to host more sites cleanly:

- On GitHub, open your menu → **Organizations → New organization** → Free plan.
- Fork the poko repository into that organization.
- The organization gets its own repositories, collaborators and sites — while you keep admin rights.

{% image src="/_images/tutos/3-free.webp", width="400" %}

This is the pattern for agencies or networks of sites: one organization per client/project, each with its fork and its editors.

::: aside {.review-note}

**REVIEW — @m4rrc0:** the multi-site FR tuto also covered granting org-level PAT resource owner. Confirm current GitHub flow: fine-grained PATs scoped "Resource owner: organization" need org approval for org-owned repos — worth one line if that applies to your users.

:::

## Tokens, summarized

| Who | What token | Scoped to |
| --- | --- | --- |
| You (owner) | Fine-grained PAT, `contents: write` | Your fork (or all repos) |
| Each editor | Their own fine-grained PAT | Same repo — *their* GitHub account |

Everyone pastes their token once when they first log into the CMS.
