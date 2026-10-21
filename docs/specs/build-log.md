# Spec: Build log system (levels, progress, machine-readable output)

Status: **draft — awaiting approval**

## Objective

Make `poko build` / `poko dev` output quiet by default, alive during long phases, and
machine-readable on demand.

Today a fresh build emits ~76 lines: 39 per-file `INFO: Virtual Template added` lines, a
5×-duplicated user-config warning, a raw `{ BUILD_LEVEL, BASE_URL }` object dump, the
directory-output tree — and then **~30s of silence** while images are optimized (the
"black screen"). All output is ad-hoc `console.*` (107 call sites / 43 files); nothing is
extractable programmatically.

Success = a single log facade with level filtering, a TTY progress indicator, and a
versioned NDJSON event stream a server can ingest.

**Users:** site authors running `poko build` locally/in CI; the poko server ingesting
build events.

## Decisions (from review)

- Directory tree **demoted** to `debug` level.
- Env var: **`POKO_LOG_LEVEL`**; `DEBUG=true` maps to `debug` for back-compat.
- Machine channel v1: **NDJSON-on-stderr** (`POKO_LOG_FORMAT=ndjson`). The manifest file
  is **out of scope for v1** — see Future Work.
- New runtime dep allowed for the spinner → `yocto-spinner` (see Tech Stack).
- **Event schema is versioned** — `"v":1` on every NDJSON line. The contract below is the
  ingestion contract; breaking changes bump `v`.
- Pretty output uses poko scopes (`env`, `populate`, `img`, …), not the `[11ty]` prefix.
- `poko dev` gets the same treatment this iteration (secondary to `build`).
- `runId` = `crypto.randomUUID()` — zero-dep, server only needs uniqueness.

## Tech Stack

- Eleventy 3.1.2 — logger injection via `elev.logger` → `eleventyConfig.logger`
  (`src/Eleventy.js:660`, `TemplateConfig.setLogger`). Interface to satisfy:
  `log, info, warn, error, forceLog, logWithOptions, message, toStream, outputStream,
closeStream, isVerbose, isChalkEnabled, overrideLogger, isLoggingEnabled`
  (see `node_modules/@11ty/eleventy/src/Util/ConsoleLogger.js`).
- `chalk` ^5 (already a dep) — colors; honors `NO_COLOR`/`FORCE_COLOR`/non-TTY.
- **`yocto-spinner`** (new runtime dep — justified: ~2KB, zero-dep, ESM, Bun+Node safe;
  pin a version ≥7 days old. Fallback if it misbehaves: ~40-line hand-rolled
  `process.stderr` spinner, since `chalk` is already present).
- `node --test` — existing test runner, `*.test.js` colocated.

## Commands

- Build (repo): `npm run build` / `npm run build:content`
- Fresh image work: `npm run clean:cache && npm run build`
- CLI directly: `node scripts/cli.js build [--config <path>]`, `node scripts/cli.js dev`
- Test: `npm test` (script currently targets one file — extend glob to `src/**/*.test.js`)

## Project Structure

```
src/utils/log/logger.js        → NEW: facade (levels, dedupe, ndjson emitter, spinner mgmt)
src/utils/log/logger.test.js   → NEW: unit tests
scripts/cli.js                 → inject elev.logger adapter; wrap build in phase reporting
eleventy.config.js             → remove console.log dumps; wire phase events
env.config.js                  → add POKO_LOG_LEVEL / POKO_LOG_FORMAT
src/config-11ty/plugins/**     → migrate console.* call sites to facade (incremental)
docs/specs/build-log.md        → this spec
```

## Interface contract (the ingestible schema)

### Env vars

| Var                                               | Values                                             | Default  | Notes                                 |
| ------------------------------------------------- | -------------------------------------------------- | -------- | ------------------------------------- |
| `POKO_LOG_LEVEL`                                  | `silent` \| `error` \| `warn` \| `info` \| `debug` | `info`   | `DEBUG=true` legacy → `debug`         |
| `POKO_LOG_FORMAT`                                 | `pretty` \| `ndjson`                               | `pretty` | `ndjson` implies no spinner           |
| `NO_COLOR`, `FORCE_COLOR`, `CI`, `GITHUB_ACTIONS` | —                                                  | —        | honored via chalk + TTY checks        |
| `DEBUG=Eleventy*`                                 | debug-pkg namespaces                               | —        | untouched: Eleventy internals channel |

### Levels → what prints (pretty mode, stderr)

| Level    | Output                                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `silent` | nothing (exit code still reflects failure)                                                                                  |
| `error`  | errors only                                                                                                                 |
| `warn`   | + warnings (deduplicated, count shown)                                                                                      |
| `info`   | + phase start/done lines, spinner (TTY only), final summary                                                                 |
| `debug`  | + per-file lines (virtual templates, `Processing <img>`), directory tree, redacted env snapshot, Eleventy-internal messages |

### Human format (pretty, `info`)

```
poko build  draft · node 24 · base https://www.reperes.be
→ populate   39 templates from 2 sources
→ render     23 pages
⠋ images     optimizing… 12 processed (34 cached)
✓ done       23 written, 24 copied in 38.1s → dist/
! 5 warnings (POKO_LOG_LEVEL=debug for detail): no user config …, …
```

- All diagnostics → **stderr** (npm/git/cargo convention; stdout stays clean).
- Non-TTY/CI: no spinner — phase lines + `→ images optimizing…` / `✓ images 46 in 31s`.
- Image progress counts `[11ty/eleventy-img] Processing <src>` messages arriving through
  `eleventyConfig.logger` — no eleventy-img patching needed. Total is unknown up front →
  indeterminate spinner with a running counter.

### NDJSON event (v1) — `POKO_LOG_FORMAT=ndjson`, one object per line, stderr

```json
{"v":1,"ts":"2026-10-21T14:33:05.123Z","runId":"01J…","mode":"build","level":"info","scope":"build","event":"phase.start","phase":"populate","msg":"Populating input directory"}
{"v":1,"ts":"…","runId":"01J…","mode":"build","level":"warn","scope":"env","event":"config.missing","msg":"No user config","path":"_config/index.js","occurrences":5}
{"v":1,"ts":"…","runId":"01J…","mode":"build","level":"info","scope":"img","event":"images.progress","processed":12,"cached":34}
{"v":1,"ts":"…","runId":"01J…","mode":"build","level":"info","scope":"build","event":"build.done","files":23,"copied":24,"skipped":0,"images":{"processed":12,"cached":34,"deferred":0},"durationMs":38090,"outDir":"dist"}
```

Required envelope fields every line: `v` (int, schema version), `ts` (ISO-8601 UTC),
`runId` (per-invocation `crypto.randomUUID()`), `mode` (`build`|`dev`), `level`, `scope`, `event`,
`msg`. Event-specific fields appended flat. `scope` set: `cli|env|populate|eleventy|img|
favicons|css|unocss|partials|embed|cms|build`. `event` names are stable dot-names —
renaming/removing an event = breaking change → bump `v`.

### Build manifest — **future work, out of v1 scope**

A versioned `poko-build-report` document (envelope + `result`, `images`, `warnings`,
`errors`, `files[]`) was designed then deferred. Open problem: where it lives.

Options recorded for later:

- **`dist/` + `.assetsignore`** — retrievable by CI/services from the build artifact,
  excluded from public deploy. Caveat: only Cloudflare Pages/wrangler honors
  `.assetsignore`; GitHub Pages/Netlify/Vercel would serve it publicly → leaks internal
  paths, tool versions, build env (fingerprinting, not secrets — schema has no secrets).
- **Encrypted blob in `dist/`** — safe to serve publicly, but needs a key both the
  managing server and a CMS-authed user can know. User researching this.
- **Project root, outside `dist/`** — zero leak risk, but unreachable by external
  services without an extra upload step.

Data source when built: `elev.write()` return (`[passthroughCopy, templates]`) +
`elev.writer.getMetadata()` + facade's warning/error buffer. The `build.done` NDJSON
event already carries the same payload — manifest is a formatting question, not a
data-collection one.

#### Manifest draft example

```json
{
  "schema": "poko-build-report/1",
  "v": 1,
  "ts": "2026-10-21T14:33:05.123Z",
  "runId": "01J…",
  "mode": "build",
  "env": { "buildLevel": "draft", "baseUrl": "https://…", "branch": "main",
           "runtime": "node", "versions": { "poko": "0.3.0", "eleventy": "3.1.2" } },
  "result": { "filesWritten": 23, "filesCopied": 24, "skipped": 0,
              "durationMs": 38090, "outDir": "dist" },
  "images": { "processed": 12, "cached": 34, "deferred": 0 },
  "warnings": [ { "event": "config.missing", "msg": "No user config", "occurrences": 5 } ],
  "errors": [],
  "files": [ { "out": "activites/index.html", "src": "_content/fr/pages/activites.md", "bytes": 63000 } ]
}
```

## Code Style

```js
// ESM, no bundler. Facade API (sketch):
import { log } from "../utils/logger.js";
log.phase("populate", (l) => {
  /* … */ return { count: 39 };
});
log.warnOnce("config.missing", `No user config at ${path}`, { path });
log.event({ scope: "img", event: "images.progress", processed: n });
```

- Existing conventions: ESM, `env.config.js` for env plumbing, `src/utils/runtime.js`
  for Bun/Node splits (spinner uses only `process.stderr` + `setInterval` — portable).
- `console.*` call sites migrate to the facade; new code never uses `console.*` except
  inside `logger.js` itself and `scripts/cli.js` usage output.

## Testing Strategy

`node --test`, `*.test.js` colocated. Cases:

- Level filter: emit at each level, assert suppression matrix.
- `warnOnce`: same key → one line + `occurrences` count.
- NDJSON mode: every emitted line `JSON.parse`s, has `v:1` + envelope fields.
- Eleventy logger adapter: `logWithOptions({prefix:"[11ty/eleventy-img]",message:"Processing x"})` → progress event, not a printed line.
- Secret hygiene: set `SECRET_X=hunter2`, run debug-level emit of env snapshot → `hunter2` absent.
- Integration (manual): fresh `npm run clean:cache && npm run build` vs `POKO_LOG_FORMAT=ndjson … 2>log.ndjson | jq`.

`npm test` must stay green; test count must not fall (CONSTRAINTS.md).

## Boundaries

- **Always:** secrets never logged (env snapshot allowlists `POKO_*`/build keys, never
  raw `process.env` — current `DEBUG=true` dumps all env incl. secrets; that gets fixed,
  not carried over); `npm test` before done; dual-runtime safe (Bun + Node ≥24); unbundled
  publish (ADR-001 — no build step, no bundler).
- **Ask first:** new runtime deps beyond `yocto-spinner`; changes to `template/**`;
  touching `.github/workflows/**`; widening the `npm test` glob (listed here for
  visibility — needs the OK since it changes what CI runs).
- **Never:** secrets under `template/**`; weaken CONSTRAINTS.md; swallow errors in
  catch blocks (route through facade so `error`/`warn` levels still surface them).

## Assumptions (correct if wrong)

1. All diagnostics → stderr; stdout reserved for nothing today, `--to=ndjson`-style
   build output stays possible later.
2. Manifest deferred — see "Build manifest" above; `build.done` NDJSON event already
   carries its payload.
3. Shortcode/favicons `Image()` calls ride eleventy-img's shared queue; once the
   transform plugin registers `eleventyConfig`, their `Processing` messages also reach
   our logger — count may therefore exceed transform-only images. Accepted.
4. `poko dev` gets the same treatment (phase lines per rebuild, `Watching…`, server URL
   at info) but is secondary — build is the primary target.
5. `directoryOutputPlugin` stays registered only when level ≥ `debug` — it writes raw
   `console.log`, no level control possible; a poko-native tree replaces it later.
6. `eleventyConfig.setQuietMode(true)` stays — our injected logger, not Eleventy's
   `isVerbose`, decides routing.

## Success Criteria

- `node scripts/cli.js build` (TTY, default): ≤ ~15 lines total + live spinner during
  the image phase; ends with the `✓ done` summary.
- `POKO_LOG_LEVEL=warn` → only deduplicated warnings/errors.
- `POKO_LOG_LEVEL=debug` → virtual-template lines, `Processing <img>` lines,
  directory tree, redacted env.
- `POKO_LOG_FORMAT=ndjson node scripts/cli.js build 2>log.ndjson` → every line parses;
  `jq -c 'select(.event=="build.done")' log.ndjson` returns exactly one object with
  `files`, `copied`, `durationMs`, and `"v":1` on every line.
- `CI=true` run → zero ANSI cursor-control frames in output.
- `grep -c "hunter2"` (or any test secret) over a `debug`-level run's output → 0.
- `npm test` green; no new suppression comments.

## Open Questions

All resolved. Manifest location deferred with the manifest itself (see Future Work).
