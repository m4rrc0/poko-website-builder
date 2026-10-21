// Browser shim for the node log facade (`src/utils/log/logger.js`), bundled
// into the CMS preview renderer in place of the real module — same import
// shim pattern as env.config.js → browser-env.js. Preview keeps its own
// console so warnings stay visible there; everything else is a no-op.

const warn = (scope, _event, msg) => console.warn(`[${scope}] ${msg}`);
const noop = () => {};

export const log = {
  level: "warn",
  format: "pretty",
  mode: "preview",
  runId: "preview",
  warnings: new Map(),
  errors: new Map(),
  debug: noop,
  info: noop,
  warn,
  warnOnce: (_key, scope, _event, msg) => warn(scope, _event, msg),
  error: (scope, _event, msg) => console.error(`[${scope}] ${msg}`),
  emit: noop,
  event: noop,
  progress: noop,
  phase: () => ({ done: noop, fail: noop, progress: noop }),
  finish: () => ({ warnings: [], errors: [] }),
  redact: (o) => o,
  configure: () => log,
  isEnabled: () => false,
};

export const createLogger = () => log;
export const resolveLevel = () => "warn";
export const resolveFormat = () => "pretty";
export const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
export const SCHEMA_VERSION = 1;
