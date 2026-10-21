# ADR-002: Poko log facade (`POKO_LOG_LEVEL` / `POKO_LOG_FORMAT`)

## Status

Accepted

## Date

2026-10-21

## Context

`poko build` output mixed five unrelated channels: raw `console.*` in
plugins (107 call sites, ad-hoc `[scope]` prefixes), Eleventy's own
`[11ty] …` lines, the directory-output plugin's 23-row file tree (raw
stdout, ungateable), and nothing at all during ~33s of image compression.
There was no way to ask for less noise or for machine-readable output.

Prior art (Vite `logLevel`, Astro `--verbose/--json`, webpack `stats`,
Turbo `--output-logs`) converges on named levels, opt-in verbosity, and a
machine channel separate from the human channel.

## Decision

Single facade `src/utils/log/logger.js` with `POKO_LOG_LEVEL`
(`silent|error|warn|info|debug`, default `info`; `DEBUG=true` alias) and
`POKO_LOG_FORMAT` (`pretty|ndjson`, default `pretty`).

- All diagnostics go to **stderr**; stdout stays clean.
- `scripts/cli.js` injects an adapter (`src/utils/log/eleventy-logger.js`)
  presenting Eleventy's `ConsoleLogger` surface at `elev.logger`,
  `elev.writer.logger`, and `elev.eleventyServe.logger` — Eleventy and
  eleventy-img messages route through the facade; `Processing` messages
  become progress ticks.
- `eleventyConfig.setQuietMode` is intentionally **not** called: quiet mode
  diverts non-forced messages to the `debug` package before they reach the
  logger, which would hide image progress.
- eleventy-img's `BuildLogger` only emits when per-call options carry
  `eleventyConfig`; shortcode/favicons `Image()` calls attach it
  (non-enumerable) to opt in.
- TTY gets a yocto-spinner live line; non-TTY/CI prints phase start/done
  lines instead. NDJSON emits one JSON object per line (`v`/`ts`/`runId`/
  `mode`/`level`/`scope`/`event`/`msg` + flat data fields) — the ingest
  contract for external tooling; event names are stable, renames need a
  schema bump.
- Debug env reporting is allowlist-based (`env.snapshot`), never raw
  `process.env`. `log.redact()` masks secret-looking keys.
- The directory-output plugin registers only at `debug` — its raw
  `console.log` tree can't be filtered otherwise. A poko-styled directory
  listing may replace it later.
- `poko dev` gets the same treatment via the shared adapter.
- A build manifest/report file is deferred future work (see
  `docs/specs/build-log.md` — key-management/encryption undecided).

## Consequences

- New runtime dep `yocto-spinner` (ESM, one dep, Node ≥18.19) — justified:
  hand-rolling an equivalent is ~40 lines but adds a maintained surface;
  approved by maintainer.
- `npm test` widened to `node --test "src/**/*.test.js"` so colocated
  logger tests run by default.
- The preview renderer bundle aliases `utils/log/logger.js` to
  `cms-config/preview/log-shim.js` — shared shortcode code can use the
  facade without dragging node deps into the browser bundle.
- `console.*` remains acceptable in `scripts/cli.js` usage/error paths,
  browser-targeted preview code, and user-land template code (not
  interceptable by design).

## Alternatives Considered

- **Patch console globally** — invisible to readers, intercepts user
  template code too; rejected.
- **Keep quiet mode + per-plugin logLevel options** — fragmented, no
  machine channel, still no image progress; rejected.
- **Write the build manifest now** — blocked on encryption/key-management
  questions the maintainer is researching; the `build.done` event carries
  the same payload meanwhile.
