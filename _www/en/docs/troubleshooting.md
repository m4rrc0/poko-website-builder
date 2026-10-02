---
translationKey: troubleshooting
lang: en
createdAt: 2026-10-02T00:00:00.000Z
name: Troubleshooting
docsNav:
  section: editors
  order: 12
metadata:
  description: Common CMS and publishing issues, and how to fix them
---

# Troubleshooting

## Saving & publishing

**My change isn't visible on the site.**

- Did you use **Save and Publish** (under the Save arrow), not just a draft?
- Wait for the rebuild — \~1–2 min on Cloudflare Pages, a few minutes on GitHub Pages. Check the build status on your host's dashboard or in GitHub Actions.
- Hard-refresh your browser (`Ctrl+Shift+R`) — your browser may have cached the old page.
- Check the item's **Status** field — `draft`, `noindex` or `inactive` items don't show publicly.

**Save failed with an error about authentication / permissions.**

- Your GitHub token probably expired or was revoked — create a new one ([Get Started, step 2](/en/docs/get-started/#step-2-create-a-personal-access-token)) and log in again.
- If you restricted the token to specific repositories, make sure your fork is included with `contents: write`.

**The CMS only shows Global Settings.**

Normal on a brand-new site — save Global Settings once (all required fields), then the rest unlocks.

## Images

**An image doesn't appear.**

- Re-check the image field — is a file actually selected?
- Very large or exotic formats may fail conversion; try a standard JPG/PNG/SVG.

**An image is blurry / the wrong crop.**

- Upload a higher-resolution original (the site resizes it for you).
- Set an **Aspect Ratio** on the field if you want a specific crop.

## Pages & menus

**My page doesn't appear in the menu.**

- Fill the **Navigation** field on the page (title/parent) — a page only joins the menu when Navigation is set. See [Navigation & menus](/en/docs/navigation-menus/).

**The menu order is wrong.**

- Check each page's **Order** field — lower comes first. Dragging pages in the Pages list edits these numbers.

## Languages

**My second language doesn't show.**

- In **Global Settings → Languages**, is its status `published`? Save and wait for a rebuild.
- Language switches require a build — don't judge before it finishes.

**The translated page 404s.**

- Confirm a translation exists for that page (open it in the CMS and switch the editing locale).

## Design

**A section has unexpected colors.**

- Open its **Section Wrapper Options** — a `palette-*` or `palette--*` utility class is probably set ([Sections](/en/docs/sections/#utility-classes)).
- Check your palettes themselves in **Styles Config → Brand**.

## Still stuck?

- [GitHub discussions](https://github.com/m4rrc0/poko-website-builder/discussions) — community support.
- {{ "hello@poko.eco" | emailLink("Contact us") }} — professional help.
