# Tasks: build-log system

## Task 1: Logger facade (`src/utils/log/logger.js` + test)
**Description:** `createLogger({level,format,mode,writer,isTTY})` factory + shared `log` singleton. Levels `silent|error|warn|info|debug`; formats `pretty|ndjson`. API: `debug/info/warn/error(scope,event,msg,data)`, `warnOnce(key,…)`, `phase(scope,label)`, `progress(msg)`, `redact(obj)`, `setMode`, `summary` buffer (warnings/errors). NDJSON envelope `{v:1,ts,runId,mode,level,scope,event,msg,...}`.
**Acceptance:**
- [x] Suppression matrix correct per level
- [x] `warnOnce` prints once, counts `occurrences`
- [x] ndjson lines `JSON.parse` + `"v":1` + envelope fields
- [x] `redact` drops `*secret*|*token*|*key*|*password*|*auth*` keys
**Verification:** `node --test src/utils/logger.test.js`
**Dependencies:** None
**Files:** `src/utils/log/logger.js`, `src/utils/logger.test.js`
**Scope:** M

## Task 2: Eleventy logger adapter (`src/utils/log/eleventy-logger.js` + test)
**Description:** Full `ConsoleLogger` surface forwarding to facade. `logWithOptions` → mapped event; `[11ty/eleventy-img] Processing X` → `progress` tick + debug line; `[11ty/eleventy-img]` summary → img-scope info; `forceLog` → info; `outputStream/closeStream` stubs for ndjson API compat.
**Acceptance:**
- [x] All methods Eleventy calls exist and route correctly
- [x] `Processing` msgs → `onProgress` callback, not printed at info
- [x] `message()` honors level gating
**Verification:** `node --test src/utils/log/eleventy-logger.test.js`
**Dependencies:** T1
**Files:** `src/utils/log/eleventy-logger.js`, `src/utils/log/eleventy-logger.test.js`
**Scope:** M

## Task 3: CLI wiring + spinner (`scripts/cli.js`, dep install)
**Description:** `npm i yocto-spinner@^1.2.2`; `import "dotenv/config"` first; `elev.logger = adapter` after `new Eleventy()`; header line at info; phases around init/write; final `build.done`/`✓ done` from `elev.write()` return + `elev.writer.getMetadata()`; spinner via facade.
**Acceptance:**
- [x] Default build shows header + phase lines + `✓ done … in Ns → dist/`
- [x] `POKO_LOG_LEVEL=warn` hides info lines; errors still print
- [x] TTY shows spinner during images; non-TTY shows phase lines
**Verification:** `npm run build` (cached, fast) then manual matrix
**Dependencies:** T1, T2
**Files:** `scripts/cli.js`, `package.json`, lockfile
**Scope:** M

## Task 4: `env.config.js` migration
**Description:** Export `POKO_LOG_LEVEL`/`POKO_LOG_FORMAT` (normalized); `userCmsConfig`/`userHtmlClasses` warns → `warnOnce`; `DEBUG` env dumps → `log.debug` with `redact`ed allowlist snapshot.
**Acceptance:**
- [x] `POKO_LOG_*` exported + normalized (`verbose`→`debug`, unknown→`info`)
- [x] User-config warn prints once per build, `occurrences` counted
- [x] `POKO_LOG_LEVEL=debug` shows env snapshot without secret values
**Verification:** unit test or manual `POKO_LOG_LEVEL=debug node scripts/cli.js build`
**Dependencies:** T1
**Files:** `env.config.js`
**Scope:** M

## Task 5: `eleventy.config.js` migration
**Description:** `console.log({BUILD_LEVEL,BASE_URL})` + DEBUG env dump → facade; `directoryOutputPlugin` registered only when level≥debug; `section` shortcode warn/error → facade.
**Acceptance:**
- [x] No raw console output in default build
- [x] Tree appears only at `POKO_LOG_LEVEL=debug`
- [x] Deprecation warn still surfaces (as facade warn)
**Verification:** `npm run build` at info + debug
**Dependencies:** T1, T3
**Files:** `eleventy.config.js`
**Scope:** M

## Task 6: `populateInputDir` → facade
**Description:** Replace `logger` util + `logLevel` option with facade. Start/end banners → `phase("populate")`; per-file "Virtual Template added" → debug; summary count → info; `printDiffTree` stays debug-only.
**Acceptance:**
- [x] info: one `→ populate 39 templates from 2 sources` line
- [x] debug: per-file lines + tree
- [x] No `INFO:`/`WARN:` chalk prefixes remain
**Verification:** `npm run build` info vs debug
**Dependencies:** T1
**Files:** `src/config-11ty/plugins/populateInputDir/{index,utils}.js`
**Scope:** M

## Task 7a: plugins' `console.*` → facade
**Files:** `plugins/{favicons,private-embed,partials,partialShortcodes,customRenderers,buildExternalCSS,plugin-eleventy-unocss,ctxCss,ctx-css,io-elements-transform,html-classes-transform,keystaticPassthroughFiles}` — incl. stray dumps `partials/index.js:179`.
**Acceptance:** no `console.*` left in those files (except legitimate dev-tool paths); errors not swallowed
**Verification:** grep clean + `npm run build`
**Dependencies:** T1
**Scope:** L — split kept within phase

## Task 7b: filters/shortcodes/misc `console.*` → facade
**Files:** `shortcodes/components/{image,links}.js`, `filters/{html,i18n}.js`, `src/env/init.js`, `src/utils/build.js`, `cms-config/{config.js,page.js,defaultEditorComponents.js}` dumps.
**Acceptance:** same as 7a; `defaultEditorComponents`/`page.js` dumps → debug
**Verification:** grep clean + `npm run build`
**Dependencies:** T1
**Scope:** L

## Task 8: `poko dev` verification
**Acceptance:** watch rebuild shows phase lines; `Watching…`/`File changed` at info; spinner doesn't leak into logs on rebuilds
**Verification:** run `node scripts/cli.js dev`, touch a file, observe
**Dependencies:** T3
**Scope:** S

## Task 9: test glob + ADR + final matrix
**Description:** `npm test` → `node --test src/` (runs all colocated `*.test.js`); `docs/decisions/ADR-002-build-log.md`; verify full spec matrix incl. `CI=true`, `POKO_LOG_FORMAT=ndjson | jq`.
**Acceptance:** all spec success criteria
**Dependencies:** all
**Scope:** S
