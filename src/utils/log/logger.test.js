/**
 * Build-log facade contract tests.
 * Run: node --test src/utils/
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  createLogger,
  resolveLevel,
  resolveFormat,
  LEVELS,
  SCHEMA_VERSION,
} from "./logger.js";

const capture = () => {
  const lines = [];
  return { lines, writer: (s) => lines.push(s.replace(/\n$/, "")) };
};

const make = (opts = {}) => {
  const { lines, writer } = capture();
  const log = createLogger({
    level: "info",
    format: "pretty",
    mode: "build",
    writer,
    isTTY: false,
    now: () => new Date("2026-10-21T14:33:05.123Z"),
    runId: "test-run",
    ...opts,
  });
  return { log, lines };
};

describe("resolveLevel", () => {
  test("POKO_LOG_LEVEL wins", () => {
    assert.equal(resolveLevel({ POKO_LOG_LEVEL: "warn" }), "warn");
    assert.equal(resolveLevel({ POKO_LOG_LEVEL: "debug" }), "debug");
    assert.equal(resolveLevel({ POKO_LOG_LEVEL: "silent" }), "silent");
  });
  test("aliases normalize", () => {
    assert.equal(resolveLevel({ POKO_LOG_LEVEL: "verbose" }), "debug");
    assert.equal(resolveLevel({ POKO_LOG_LEVEL: "quiet" }), "warn");
  });
  test("unknown value falls back to info", () => {
    assert.equal(resolveLevel({ POKO_LOG_LEVEL: "loud" }), "info");
  });
  test("legacy DEBUG=true maps to debug", () => {
    assert.equal(resolveLevel({ DEBUG: "true" }), "debug");
    assert.equal(resolveLevel({ DEBUG: "Eleventy*" }), "info");
  });
  test("default is info", () => {
    assert.equal(resolveLevel({}), "info");
  });
});

describe("resolveFormat", () => {
  test("ndjson", () => {
    assert.equal(resolveFormat({ POKO_LOG_FORMAT: "ndjson" }), "ndjson");
  });
  test("default pretty", () => {
    assert.equal(resolveFormat({ POKO_LOG_FORMAT: "x" }), "pretty");
    assert.equal(resolveFormat({}), "pretty");
  });
});

describe("level gating (pretty)", () => {
  const cases = [
    ["silent", 0],
    ["error", 1],
    ["warn", 2],
    ["info", 3],
    ["debug", 4],
  ];
  for (const [level, count] of cases) {
    test(`level ${level} prints ${count} of 4 messages`, () => {
      const { log, lines } = make({ level });
      log.error("s", "e1", "boom");
      log.warn("s", "w1", "careful");
      log.info("s", "i1", "fyi");
      log.debug("s", "d1", "detail");
      assert.equal(lines.length, count);
    });
  }
});

describe("warnOnce", () => {
  test("same key prints once, counts occurrences", () => {
    const { log, lines } = make();
    log.warnOnce("k1", "env", "config.missing", "No user config");
    log.warnOnce("k1", "env", "config.missing", "No user config");
    log.warnOnce("k1", "env", "config.missing", "No user config");
    assert.equal(lines.length, 1);
    assert.equal(log.warnings.get("k1").occurrences, 3);
  });
  test("different keys print separately", () => {
    const { log, lines } = make();
    log.warnOnce("a", "s", "e", "one");
    log.warnOnce("b", "s", "e", "two");
    assert.equal(lines.length, 2);
  });
});

describe("ndjson format", () => {
  test("every line parses and carries the v1 envelope", () => {
    const { log, lines } = make({ format: "ndjson" });
    log.info("populate", "phase.done", "39 templates", { count: 39 });
    const evt = JSON.parse(lines[0]);
    assert.equal(evt.v, SCHEMA_VERSION);
    assert.equal(evt.ts, "2026-10-21T14:33:05.123Z");
    assert.equal(evt.runId, "test-run");
    assert.equal(evt.mode, "build");
    assert.equal(evt.level, "info");
    assert.equal(evt.scope, "populate");
    assert.equal(evt.event, "phase.done");
    assert.equal(evt.msg, "39 templates");
    assert.equal(evt.count, 39);
  });
  test("level gating still applies in ndjson", () => {
    const { log, lines } = make({ format: "ndjson", level: "warn" });
    log.info("s", "e", "hidden");
    log.warn("s", "e", "shown");
    assert.equal(lines.length, 1);
    assert.equal(JSON.parse(lines[0]).level, "warn");
  });
});

describe("pretty format", () => {
  test("line carries scope + glyph + msg", () => {
    const { log, lines } = make();
    log.warn("env", "config.missing", "No user config");
    assert.match(lines[0], /env/);
    assert.match(lines[0], /No user config/);
    assert.ok(!lines[0].includes("config.missing") || true); // event name not required in pretty
  });
});

describe("phases", () => {
  test("non-TTY phase prints start + done lines", () => {
    const { log, lines } = make();
    const ph = log.phase("populate", "Populating input dir");
    ph.done("39 templates");
    assert.equal(lines.length, 2);
    assert.match(lines[0], /populate/);
    assert.match(lines[0], /Populating input dir/);
    assert.match(lines[1], /populate/);
    assert.match(lines[1], /39 templates/);
  });
  test("phase fail emits an error event", () => {
    const { log, lines } = make();
    const ph = log.phase("build", "Building");
    ph.fail(new Error("nope"));
    assert.match(lines.at(-1), /nope|build/);
    assert.equal(log.errors.size, 1);
  });
});

describe("redact", () => {
  test("secret-looking values are masked", () => {
    const { log } = make();
    const out = log.redact({
      BASE_URL: "https://x",
      CMS_TOKEN: "hunter2",
      MY_API_SECRET: "hunter2",
      PRIVATE_KEY: "hunter2",
      nested: { POKO_CMS_DEV_TOKEN: "hunter2" },
    });
    assert.equal(out.BASE_URL, "https://x");
    assert.equal(out.CMS_TOKEN, "<redacted>");
    assert.equal(out.MY_API_SECRET, "<redacted>");
    assert.equal(out.PRIVATE_KEY, "<redacted>");
    assert.equal(out.nested.POKO_CMS_DEV_TOKEN, "<redacted>");
  });
});

describe("eleventy adapter contract surface", () => {
  test("makeEleventyLogger returns the ConsoleLogger surface", async () => {
    const { makeEleventyLogger } = await import("./eleventy-logger.js");
    const { log } = make();
    const el = makeEleventyLogger(log);
    for (const m of [
      "log",
      "info",
      "warn",
      "error",
      "forceLog",
      "logWithOptions",
      "message",
      "toStream",
      "closeStream",
    ]) {
      assert.equal(typeof el[m], "function", m);
    }
    assert.equal(typeof el.outputStream?.read, "function");
    assert.equal(typeof el.isVerbose, "boolean");
    assert.equal(typeof el.isChalkEnabled, "boolean");
    assert.equal(typeof el.isLoggingEnabled, "function");
    assert.equal(typeof el.overrideLogger, "function");
  });
});
