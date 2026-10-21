# ADR-001: Do not adopt Vite+

## Status
Accepted

## Date
2026-10-21

## Context
Evaluated adopting [Vite+](https://viteplus.dev/) — VoidZero's unified toolchain
(Vite 8/Rolldown, Vitest, Oxlint, Oxfmt, tsdown, Vite Task, `vp` CLI) — for
maintainability, build speed, and best practices.

This repo is an Eleventy 3.x SSG engine shipped as **unbundled source**
(`main: ./eleventy.config.js`, `files: [src, scripts, ...]`), consumed via the
`poko` CLI. Assets build through a dual-runtime shim
(`src/utils/runtime.js`: `Bun.build` under Bun, esbuild/lightningcss under
Node). No lint/format tooling exists; tests use `node --test`.

## Decision
Do not adopt Vite+. If lint/format is wanted, install standalone
`oxlint` + `oxfmt` (+ optionally `vitest`) as devDependencies instead.

## Alternatives Considered

### Vite+ (full adoption)
- `vp dev`/`vp build` run the Vite dev server / Vite app build only — they
  cannot drive Eleventy. Built-ins can't be overridden, so `vp build` would be
  a footgun (`vp run build` ≠ `vp build`).
- `vp pack` (tsdown) targets bundled library dists; bundling would break
  `import.meta.dirname`-relative file resolution and Eleventy's runtime plugin
  model, for zero consumer benefit.
- `vp check` (Oxfmt+Oxlint+tsgolint) is the only piece mapping to a real gap —
  achievable with standalone Oxc devDeps, less surface.
- `vp test`/`vp run`/`vp env`: marginal — one test file, thin script
  dispatchers, deliberate Bun+Node dual-runtime.
- Young platform (breaking 0.3→1.0 already shipped), heavy metapackage,
  Node-only focus conflicts with Bun-first support.
- Rejected: solves a problem we don't have.

### @11ty/eleventy-plugin-vite
- Official, maintained (v8, Vite 8). Runs Vite as Eleventy dev-server
  middleware and post-processes output — the real path *if* the goal becomes a
  unified Vite asset pipeline replacing the runtime shim.
- Deferred: adds Vite as a runtime dep to every consumer install and conflicts
  with Bun-first support. Revisit if asset-pipeline needs outgrow the shim.

## Consequences
- Eleventy stays the build driver; `scripts/run.js` dispatch unchanged.
- No lint/format gate until standalone Oxc tools are added (tracked separately).
- Re-evaluate if the project ever becomes a real Vite app or workspace.
