import chalk from "chalk";
import yoctoSpinner from "yocto-spinner";

export const SCHEMA_VERSION = 1;

export const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };

const LEVEL_ALIASES = { verbose: "debug", quiet: "warn" };

const SECRET_RE =
  /(secret|token|password|passwd|credential|private|api[_-]?key)/i;

// Envelope fields callers may not clobber via `data`; `event` is deliberately
// allowed — it is the documented way to rename the emitted event.
const RESERVED_KEYS = new Set([
  "v",
  "ts",
  "runId",
  "mode",
  "level",
  "scope",
  "msg",
]);

const GLYPHS = {
  error: chalk.red("✗"),
  warn: chalk.yellow("!"),
  info: chalk.cyan("→"),
  debug: chalk.dim("·"),
  done: chalk.green("✓"),
};

export function resolveLevel(env = process.env) {
  const raw = env.POKO_LOG_LEVEL?.toLowerCase();
  if (raw && raw in LEVELS) return raw;
  if (raw && raw in LEVEL_ALIASES) return LEVEL_ALIASES[raw];
  if (raw) return "info";
  if (["true", "1", "yes", "on"].includes(env.DEBUG?.toLowerCase()))
    return "debug";
  return "info";
}

export function resolveFormat(env = process.env) {
  return env.POKO_LOG_FORMAT?.toLowerCase() === "ndjson" ? "ndjson" : "pretty";
}

const sanitizeData = (data) => {
  if (!data || typeof data !== "object") return data;
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (RESERVED_KEYS.has(k)) continue;
    if (SECRET_RE.test(k)) out[k] = "<redacted>";
    else if (v instanceof Error)
      out[k] = { message: v.message, stack: v.stack };
    else if (v === undefined || typeof v === "function") continue;
    else out[k] = v;
  }
  return out;
};

export function createLogger({
  level,
  format,
  mode = "build",
  writer = (s) => process.stderr.write(s),
  isTTY = () => Boolean(process.stderr.isTTY) && !process.env.CI,
  now = () => new Date(),
  runId = crypto.randomUUID(),
  spinnerFactory = (text) => yoctoSpinner({ text, stream: process.stderr }),
} = {}) {
  // Level/format resolve lazily: the singleton may be created before
  // dotenv/config has populated process.env (e.g. imported via env/init.js).
  const state = {
    level,
    format,
    mode,
  };
  let spinner = null;
  let spinnerScope = null;
  const progressSeen = new Set();

  const currentLevel = () => state.level ?? resolveLevel();
  const currentFormat = () => state.format ?? resolveFormat();
  const currentTTY = () =>
    typeof isTTY === "function" ? isTTY() : Boolean(isTTY);
  const gate = (lvl) =>
    LEVELS[currentLevel()] > 0 && LEVELS[lvl] <= LEVELS[currentLevel()];

  const writeEvent = (lvl, scope, event, msg, data) => {
    const evt = {
      v: SCHEMA_VERSION,
      ts: now().toISOString(),
      runId,
      mode: state.mode,
      level: lvl,
      scope,
      event,
      msg,
      ...sanitizeData(data),
    };
    if (gate(lvl) && currentFormat() === "ndjson")
      writer(JSON.stringify(evt) + "\n");
    return evt;
  };

  const prettyLine = (glyph, scope, msg) =>
    writer(`${chalk.dim(scope.padEnd(10))} ${glyph} ${msg}\n`);

  const stopSpinner = (finalGlyph, msg) => {
    const s = spinner;
    spinner = null;
    spinnerScope = null;
    if (!s) return;
    // stop() — not clear(): clear() only erases the line while the interval
    // keeps rendering and keeps the event loop alive (process never exits).
    s.stop(
      msg
        ? `${chalk.dim((s.__scope ?? "").padEnd(10))} ${finalGlyph ?? GLYPHS.done} ${msg}`
        : undefined,
    );
  };

  const log = {
    get level() {
      return currentLevel();
    },
    get format() {
      return currentFormat();
    },
    get mode() {
      return state.mode;
    },
    runId,
    warnings: new Map(),
    errors: new Map(),

    configure(opts = {}) {
      Object.assign(state, opts);
      return log;
    },

    isEnabled(lvl) {
      return gate(lvl);
    },

    emit(lvl, scope, event, msg = "", data) {
      if (!gate(lvl)) return;
      if (currentFormat() === "pretty") {
        prettyLine(GLYPHS[lvl] ?? GLYPHS.info, scope, msg);
      }
      return writeEvent(lvl, scope, event, msg, data);
    },

    error(scope, event, msg, data) {
      const evt = log.emit("error", scope, event, msg, data);
      log.errors.set(`${scope}:${event}:${msg}`, { scope, event, msg, data });
      return evt;
    },

    warn(scope, event, msg, data) {
      const evt = log.emit("warn", scope, event, msg, data);
      const key = `${scope}:${event}:${msg}`;
      const seen = log.warnings.get(key);
      if (seen) seen.occurrences += 1;
      else log.warnings.set(key, { scope, event, msg, data, occurrences: 1 });
      return evt;
    },

    warnOnce(key, scope, event, msg, data) {
      const seen = log.warnings.get(key);
      if (seen) {
        seen.occurrences += 1;
        return;
      }
      const evt = log.emit("warn", scope, event, msg, data);
      log.warnings.set(key, { scope, event, msg, data, occurrences: 1 });
      return evt;
    },

    info(scope, event, msg, data) {
      return log.emit("info", scope, event, msg, data);
    },

    debug(scope, event, msg, data) {
      return log.emit("debug", scope, event, msg, data);
    },

    event(fields) {
      const {
        level: lvl = "info",
        scope = "build",
        event: name,
        msg = "",
        ...data
      } = fields;
      return log.emit(lvl, scope, name, msg, data);
    },

    progress(scope, msg, data) {
      if (!gate("info")) return;
      if (currentFormat() === "ndjson") {
        return writeEvent(
          "info",
          scope,
          data?.event ?? `${scope}.progress`,
          msg,
          data,
        );
      }
      if (spinner) {
        spinner.text = `${chalk.dim(spinnerScope)} ${msg}`;
        return;
      }
      // No spinner (non-TTY/CI): announce the first tick of each scope so a
      // long silent phase still gets a "→ scope working…" line.
      if (!progressSeen.has(scope)) {
        progressSeen.add(scope);
        prettyLine(GLYPHS.info, scope, msg);
      }
    },

    phase(scope, label) {
      if (spinner) stopSpinner();
      const started = Date.now();
      const elapsed = () => {
        const s = (Date.now() - started) / 1000;
        return s >= 0.5 ? `${s.toFixed(1).replace(/\.0$/, "")}s` : null;
      };

      if (currentFormat() === "pretty" && gate("info")) {
        if (currentTTY()) {
          spinner = spinnerFactory(`${chalk.dim(scope)} ${label}`);
          spinner.__scope = scope;
          spinnerScope = scope;
          spinner.start();
        } else {
          prettyLine(GLYPHS.info, scope, label);
        }
      }
      writeEvent("info", scope, "phase.start", label);

      const finish = (event, glyph, msg, data) => {
        const text = [msg, elapsed()].filter(Boolean).join(" · ");
        if (spinner) stopSpinner();
        writeEvent(
          glyph === GLYPHS.error ? "error" : "info",
          scope,
          event,
          text,
          data,
        );
        if (currentFormat() === "pretty" && gate("info"))
          prettyLine(glyph, scope, text);
      };

      return {
        done(msg, data) {
          finish("phase.done", GLYPHS.done, msg ?? label, data);
        },
        fail(err, data) {
          const msg = err?.message ?? String(err);
          log.errors.set(`${scope}:phase.fail:${msg}`, {
            scope,
            event: "phase.fail",
            msg,
            data,
          });
          finish("phase.fail", GLYPHS.error, msg, { ...data, error: err });
        },
        progress(msg, data) {
          if (spinner) spinner.text = `${chalk.dim(scope)} ${msg}`;
          else log.progress(scope, msg, data);
        },
      };
    },

    finish() {
      stopSpinner();
      const warnings = [...log.warnings.values()];
      const errors = [...log.errors.values()];
      log.warnings.clear();
      log.errors.clear();
      if (warnings.length || errors.length) {
        writeEvent(
          "info",
          "build",
          "log.summary",
          `${warnings.length} warnings, ${errors.length} errors`,
          {
            warnings: warnings.map(({ scope, event, msg, occurrences }) => ({
              scope,
              event,
              msg,
              occurrences,
            })),
            errors: errors.map(({ scope, event, msg }) => ({
              scope,
              event,
              msg,
            })),
          },
        );
      }
      return { warnings, errors };
    },

    redact(obj, seen = new WeakSet()) {
      if (!obj || typeof obj !== "object") return obj;
      if (seen.has(obj)) return "[circular]";
      seen.add(obj);
      const out = Array.isArray(obj) ? [] : {};
      for (const [k, v] of Object.entries(obj)) {
        out[k] = SECRET_RE.test(k) ? "<redacted>" : log.redact(v, seen);
      }
      seen.delete(obj);
      return out;
    },
  };

  return log;
}

export const log = createLogger();
