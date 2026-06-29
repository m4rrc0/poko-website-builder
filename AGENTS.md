# Color system

## Absolute permutation model

The color stack has five layers:

1. **Tokens** — raw colors (`--gray`, `--white`, `--vermillon`, `--cooper`).
2. **Palettes** — per-palette role mapping (`--read-palette`, `--neutral-palette`, `--pop-palette`, `--tone-palette`).
3. **Slots** — active permutation, public interface (`--read`, `--neutral`, `--pop`, `--tone`).
4. **Intent** — semantic namespaced vars (`--color-text`, `--color-bg`, `--color-accent`, ...).
5. **Elements** — CSS properties (`color: var(--color-text)`).

Every palette variant is a **complete permutation** of the four slots, read directly from the `*-palette` identity source. Variants never reference other slots, so there are no cycles and no cumulative state.

The identity reset is re-declared on `body` and every `[class*="palette"]` element because CSS custom properties are resolved eagerly at the declaring element; inheritance alone cannot re-resolve a slot against a descendant's palette.

## Why relative/cumulative variants need JavaScript

A relative variant such as "make this subtree contrast, and let nested palettes resolve against their own base palette while still carrying the contrast" requires knowing the full ancestor chain. CSS has no selector for "this element is inside a .palette--contrast ancestor", and custom properties inherit already-computed values. Without JS, the descendant cannot compute both its own palette and the ancestor variant simultaneously. This is a known limitation, not a bug.

## UnoCSS context-free limitation

UnoCSS rules are context-free: a rule can only emit styles for the class it matched. It cannot inspect the surrounding palette or emit declarations on parent/child selectors. The `p--*` permutation rule therefore writes the four bare slots on the matched element itself, exactly like the CSS variant classes.

## Naming

- L1: no `--color-` prefix.
- L2: `--{role}-palette`.
- L3: bare `--{role}`.
- L4: `--color-*` semantic variables.
- L5: regular CSS properties.

## Old variables removed

`--color-fg-theme` and `--color-bg-theme` no longer exist. Any code referencing them must map to the new slot or intent variables.
