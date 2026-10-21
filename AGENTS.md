# poko-website-builder

Eleventy 3 SSG engine shipped **unbundled** as an npm package, consumed via the `poko` CLI. ESM only. Dual runtime: Bun + Node ≥24 — runtime-specific APIs go through `src/utils/runtime.js`, never `bun:*` or node-only calls inline.

Read `CONSTRAINTS.md` before writing code. Do not weaken it to make a change pass.

## Commands

- Engine content dev/build: `npm run dev:content` / `npm run build:content` (`:demo` variants for the demo site)
- Test: `npm test` (`node --test`, `*.test.js` colocated with source)
- Package dry-run: `npm run pack:check`
- Release: `npm run release:{patch,minor,major,rc}` — versions, syncs template, tags, pushes; CI publishes

## Boundaries

- `template/**` is subtree-split and force-pushed to the **public** `poko-website-template` repo on every main push — no secrets, no engine-internal paths, no dev-only config inside it. Change it only from this repo, never the mirror.
- Runtime dependencies ship to every consumer — keep them minimal; justify additions.
- Conventional commits (`feat(scope):`, `fix(scope):`, `chore:`) — commit/PR titles become the changelog.
- Architecture/toolchain decisions → ADR in `docs/decisions/`.

## Skill triggers

- Feature or behavior change → `spec-driven-development` → `incremental-implementation` → `test-driven-development`
- UI, theme, palette, component work → `frontend-ui-engineering` (+ color system rules below)
- `template/**` or `.github/workflows/**` → `ci-cd-and-automation`
- Pre-merge review → `code-review-and-quality`; commits/branches/PRs → `git-workflow-and-versioning`
- Bug/unexpected behavior → `debugging-and-error-recovery`
- Release/deploy → `shipping-and-launch`; recording a decision → `documentation-and-adrs`

# Tooling decisions

Architecture Decision Records live in `docs/decisions/`. Notably: ADR-001 — do not adopt Vite+ (Eleventy drives the build; use standalone oxlint/oxfmt if lint/format is added).

# Color system

## Absolute permutation model

The color stack has five layers:

1. **Tokens** — raw colors (`--gray`, `--white`, `--vermillon`, `--cooper`).
2. **Palettes** — per-palette role mapping (`--color-read-palette`, `--color-neutral-palette`, `--color-pop-palette`, `--color-tone-palette`). Palette `extras` add `--color-{name}-palette` bindings.
3. **Slots** — active permutation, public interface (`--color-read`, `--color-neutral`, `--color-pop`, `--color-tone`).
4. **Intent** — semantic namespaced vars (`--color-text`, `--color-bg`, `--color-accent`, ...), mapped by color profiles (`colorProfiles` in the CMS).
5. **Elements** — CSS properties (`color: var(--color-text)`).

Every palette variant is a **complete permutation** of the four slots, read directly from the `*-palette` identity source. Variants never reference other slots, so there are no cycles and no cumulative state.

The identity reset is re-declared on `body` and every `[class*="palette"]` element because CSS custom properties are resolved eagerly at the declaring element; inheritance alone cannot re-resolve a slot against a descendant's palette.

## Why relative/cumulative variants need JavaScript

A relative variant such as "make this subtree contrast, and let nested palettes resolve against their own base palette while still carrying the contrast" requires knowing the full ancestor chain. CSS has no selector for "this element is inside a .palette--contrast ancestor", and custom properties inherit already-computed values. Without JS, the descendant cannot compute both its own palette and the ancestor variant simultaneously. This is a known limitation, not a bug.

## UnoCSS context-free limitation

UnoCSS rules are context-free: a rule can only emit styles for the class it matched. It cannot inspect the surrounding palette or emit declarations on parent/child selectors. The `p--*` permutation rule therefore writes the four bare slots on the matched element itself, exactly like the CSS variant classes.

## Naming

Canonical naming uses the `--color-` prefix on every color layer:

- L1: no `--color-` prefix (`--black`, `--white`).
- L2: `--color-{role}-palette` (plus `--color-{name}-palette` for palette extras).
- L3: `--color-{role}`.
- L4: `--color-*` semantic variables.
- L5: regular CSS properties.

The bare `--{role}` / `--{role}-palette` spellings seen in older docs and the
`palette--rnpt` permutation rule are legacy and must not be reintroduced.

## Old variables removed

`--color-fg-theme` and `--color-bg-theme` no longer exist. Any code referencing them must map to the new slot or intent variables.
