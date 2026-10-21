import { Readable } from "node:stream";
import chalk from "chalk";

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");

/**
 * Adapter presenting Eleventy's ConsoleLogger surface so `elev.logger = …`
 * routes 11ty + eleventy-img messages through the poko facade.
 * Image "Processing <src>" messages become spinner ticks, not lines.
 */
export function makeEleventyLogger(log) {
  let imgProcessed = 0;
  const route = (raw, type = "info", prefix = "") => {
    const msg = stripAnsi(String(raw ?? "")).trim();
    if (!msg) return;
    const lvl =
      { warning: "warn", info: "info", error: "error", debug: "debug" }[type] ??
      "info";

    if (prefix.includes("eleventy-img")) {
      const processing = msg.match(/^Processing (.+?)(?: \([^)]*\))?$/);
      if (processing) {
        imgProcessed += 1;
        log.progress("img", `optimizing… ${imgProcessed} processed`, {
          processed: imgProcessed,
          event: "img.progress",
        });
        log.debug("img", "img.process", processing[1]);
        return;
      }
      const optimized = msg.match(
        /^(\d+) images? optimized(?: \((\d+) cached(?:, (\d+) deferred)?\))?/,
      );
      if (optimized) {
        log.info("img", "img.done", msg, {
          total: Number(optimized[1]),
          cached: Number(optimized[2] ?? 0),
          deferred: Number(optimized[3] ?? 0),
        });
        imgProcessed = 0;
        return;
      }
      if (lvl === "warn") return log.warn("img", `img.${type}`, msg);
      if (lvl === "error") return log.error("img", `img.${type}`, msg);
      log.debug("img", `img.${type}`, msg);
      return;
    }

    if (lvl === "warn") return log.warn("eleventy", "eleventy.warn", msg);
    if (lvl === "error") return log.error("eleventy", "eleventy.error", msg);
    // The dev server URL is the one line `poko dev` users actually need.
    if (msg.startsWith("Server at "))
      return log.info("eleventy", "serve.url", msg);
    log.debug("eleventy", "eleventy.msg", msg);
  };

  return {
    outputStream: Readable.from([]),
    get isVerbose() {
      return log.isEnabled("debug");
    },
    // 11ty assigns logger.isVerbose during template setup; the facade owns
    // verbosity so the assignment is swallowed deliberately.
    set isVerbose(_v) {},
    get isChalkEnabled() {
      return chalk.level > 0;
    },
    isLoggingEnabled() {
      return log.level !== "silent";
    },
    isDebugEnabled() {
      return log.isEnabled("debug");
    },
    logWithOptions({ message, type, prefix } = {}) {
      route(message, type, prefix);
    },
    message({ message, type, prefix } = {}) {
      route(message, type, prefix);
    },
    log(msg) {
      route(msg, "info");
    },
    info(msg) {
      route(msg, "info");
    },
    warn(msg) {
      route(msg, "warning");
    },
    error(msg) {
      route(msg, "error");
    },
    debug(msg) {
      route(msg, "debug");
    },
    forceLog(msg) {
      // The "Copied N Wrote N files" summary is redundant with our own
      // build.done line — keep it at debug.
      route(msg, "debug");
    },
    toStream() {},
    closeStream() {},
    overrideLogger() {},
  };
}
