# Implementation Plan: Build log system

Spec: `docs/specs/build-log.md` (approved; manifest deferred to future work)

## Overview

Single log facade (`src/utils/log/logger.js`) with level + format env control, an
Eleventy-logger adapter routing all engine/plugin output through it, a TTY spinner for
the image phase, and a versioned NDJSON event stream for machine ingestion.

## Architecture Decisions

- **`createLogger` factory + singleton `log`** — tests build isolated loggers with a
  fake writer; production code uses the shared one. No monkeypatching `console`.
- **Levels:** `silent|error|warn|info|debug` (Vite-style). `DEBUG=true` → `debug`.
- **All diagnostics → stderr.** `stdout` untouched.
- **Eleventy adapter** implements the `ConsoleLogger` surface (`log/info/warn/error/
  forceLog/logWithOptions/message/toStream/outputStream/closeStream/isVerbose/
  isChalkEnabled/overrideLogger/isLoggingEnabled`) and forwards to the facade.
  `[11ty/eleventy-img] Processing …` → progress ticks (info) + per-file line (debug).
- **Phases:** `log.phase(scope, label)` → `done/fail`; spinner only when
  `stderr.isTTY && format==="pretty" && level>=info`; non-TTY gets plain start/done lines.
- **Dep:** `yocto-spinner@^1.2.2` (runtime, justified in spec; + transitive `yoctocolors`).
- **`import "dotenv/config"` first in `scripts/cli.js`** so `.env`-resident
  `POKO_LOG_*` applies even to early warnings (init.js).
- **directoryOutputPlugin** registered only when level ≥ `debug` (it writes raw
  `console.log`; can't be leveled).
- **`poko dev`** same wiring (watch mode: `Watching…`, `File changed` → info lines;
  per-rebuild phases).

## Task List

### Phase 1: Foundation
- [x] T1: `src/utils/log/logger.js` + `logger.test.js` — facade, levels, ndjson, warnOnce, redact
- [x] T2: `src/utils/log/eleventy-logger.js` + tests — ConsoleLogger-compatible adapter

### Checkpoint A
- [x] `npm test` green; facade + adapter unit-tested

### Phase 2: Wiring
- [x] T3: `npm i yocto-spinner`; `scripts/cli.js` — dotenv-first, adapter inject, header, phases, `build.done` summary
- [x] T4: `env.config.js` — export `POKO_LOG_LEVEL`/`POKO_LOG_FORMAT`; warns → `warnOnce`; env dumps → redacted `log.debug`
- [x] T5: `eleventy.config.js` — dumps → facade; `directoryOutputPlugin` @debug; section-shortcode warns → facade
- [x] T6: `populateInputDir` → facade (drop its `logger` util + `logLevel` option)

### Checkpoint B
- [x] `npm run clean:cache && npm run build` — verify level matrix + spinner + ndjson manually

### Phase 3: Migration + polish
- [x] T7a: plugins' `console.*` → facade (favicons, private-embed, partials, partialShortcodes, customRenderers, buildExternalCSS, unocss, ctxCss, io/html-classes transforms, keystatic manual-passthrough)
- [x] T7b: filters/shortcodes/misc `console.*` → facade (image.js, links.js, html.js, i18n.js, init.js, utils/build.js, cms-config config.js/page.js/defaultEditorComponents dumps)
- [x] T8: `poko dev` verification (watch + rebuild phases)
- [x] T9: `npm test` glob → `src/`; ADR-002; final matrix verification

### Checkpoint C
- [x] Full suite green; spec success criteria met

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Custom logger missing a `ConsoleLogger` method → Eleventy throws mid-build | Med | Implement full surface; adapter unit-tested; integration build |
| `.env` `POKO_LOG_*` unread by early-imported logger | Low | `dotenv/config` first import in cli.js + lazy level resolution |
| `userCmsConfig` warns still ×5 in one import cycle | Low | `warnOnce` keyed dedupe |
| Spinner breaks under Bun | Low | `process.stderr`+TTY check only; yocto-spinner is pure JS |
| Third-party `console.log` bypasses (directory-output) | Low | Plugin gated to debug; own tree later |
| Errors swallowed by catch→`return ""` paths | Med | Migrate those catches to `log.error` during T7 |

## Open Questions

None — spec resolved all (manifest deferred).
