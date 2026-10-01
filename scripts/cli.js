#!/usr/bin/env node
import fs from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { initPokoEnv } from "../src/env/init.js";
import { packagePath, toPosix } from "../src/utils/paths.js";

const CONFIG_CANDIDATES = [
  "eleventy.config.js",
  "eleventy.config.mjs",
  "eleventy.config.cjs",
  ".eleventy.js",
];

const USAGE = `poko <command> [options]

Commands:
  build            Build the site into the output directory
  dev              Build, watch and serve the site

Options:
  --config <path>  Eleventy config file (default: the first eleventy.config.* found in the current directory)
  --port <number>  Dev server port (default: 8080)
`;

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--config" || arg === "--port") {
      options[arg.slice(2)] = rest[++i];
    } else if (arg.startsWith("--config=") || arg.startsWith("--port=")) {
      const [key, value] = arg.split("=");
      options[key.slice(2)] = value;
    } else {
      throw new Error(`Unknown option "${arg}"`);
    }
  }
  return { command, options };
}

// Eleventy reads `dir`, `templateFormats` and `pathPrefix` from the config file
// it loads, so the consumer's config — usually a thin re-export of the engine's
// one — takes precedence over the engine's own.
function resolveConfigPath(cwd, explicitPath) {
  if (explicitPath) return resolve(cwd, explicitPath);
  const found = CONFIG_CANDIDATES.map((name) => resolve(cwd, name)).find(
    (path) => fs.existsSync(path),
  );
  return found || packagePath("eleventy.config.js");
}

export async function run(argv) {
  const { command, options } = parseArgs(argv);

  if (!command || command === "help" || command === "--help") {
    console.log(USAGE);
    return;
  }
  if (command !== "build" && command !== "dev") {
    throw new Error(`Unknown command "${command}"\n\n${USAGE}`);
  }

  const cwd = process.cwd();
  const serve = command === "dev";
  if (serve) process.env.ELEVENTY_RUN_MODE ||= "serve";

  const env = await initPokoEnv({ cwd });
  const { default: Eleventy } = await import("@11ty/eleventy");

  const input = env.WORKING_DIR_ABSOLUTE;
  const output = env.OUTPUT_DIR_ABSOLUTE;
  const configPath = toPosix(resolveConfigPath(cwd, options.config));

  const elev = new Eleventy(input, output, {
    configPath,
    runMode: serve ? "serve" : "build",
  });

  // Eleventy wraps failures in errors whose message only names the file at
  // fault (e.g. "Error in your Eleventy config file '…'"); the real cause
  // lives on the `originalError` chain. Routing through its own error
  // handler reports the whole chain, like `npx eleventy` does.
  try {
    await elev.init();

    if (!serve) {
      await elev.write();
      return;
    }

    await elev.watch();
    elev.serve(Number(options.port) || 8080);
  } catch (error) {
    elev.errorHandler.fatal(error, "Eleventy error");
    if (error instanceof Error) error.eleventyReported = true;
    throw error;
  }
}

export function runCli(argv = process.argv.slice(2)) {
  return run(argv).catch((error) => {
    // Errors already reported by elev.errorHandler are not printed twice.
    if (!error?.eleventyReported) {
      console.error(error?.stack || error?.message || error);
    }
    process.exitCode = 1;
  });
}

// `node_modules/.bin/poko` is a symlink to this file, so compare real paths.
function isMainModule() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(fs.realpathSync(entry)).href;
  } catch (error) {
    return false;
  }
}

if (isMainModule()) {
  await runCli();
}
