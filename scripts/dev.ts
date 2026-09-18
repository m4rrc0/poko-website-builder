// Inspiration for Bun scripts: https://github.com/oven-sh/bun/issues/7589
import { watch } from "fs";
import {
  spawn as nodeSpawn,
  type SpawnOptions as NodeSpawnOptions,
} from "node:child_process";
import type { SpawnOptions } from "bun";
import { isBun } from "../src/utils/runtime.js";
import {
  DEBUG,
  CMS_IMPORT,
  ELEVENTY_RUN_MODE,
  BUILD_LEVEL,
  MINIFY,
  WORKING_DIR,
  WORKING_DIR_ABSOLUTE,
  CONTENT_DIR,
  // SRC_DIR_FROM_WORKING_DIR,
  PARTIALS_DIR,
  LAYOUTS_DIR,
  OUTPUT_DIR,
  FILES_OUTPUT_DIR,
  BASE_URL,
  PROD_URL,
} from "../env.config.js";

const spawnOptions: SpawnOptions.OptionsObject & NodeSpawnOptions = {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
};

// Bun.spawn under Bun, node:child_process.spawn under Node.
function spawnProc(command: string[], options: typeof spawnOptions) {
  if (isBun) return Bun.spawn(command, options);
  const [bin, ...args] = command;
  return nodeSpawn(bin, args, options);
}

export class c {
  static normal = "\x1b[0m";
  static yellow = (t: string) => "\x1b[33m" + t + this.normal;
  static cyan = (t: string) => "\x1b[36m" + t + this.normal;
  static green = (t: string) => "\x1b[32m" + t + this.normal;
  static blue = (t: string) => "\x1b[34m" + t + this.normal;
  static magenta = (t: string) => "\x1b[35m" + t + this.normal;
}

function runCommand(
  prefix: string,
  command: string[],
  envObj?: Record<string, string>,
) {
  const proc = spawnProc(command, {
    stdout: "pipe",
    stderr: "pipe",
    ...envObj,
  });

  if (proc.stdout) pipeOutput(proc.stdout as AsyncIterable<Uint8Array>, prefix);
  if (proc.stderr) pipeOutput(proc.stderr as AsyncIterable<Uint8Array>, prefix);
}

async function pipeOutput(stream: AsyncIterable<Uint8Array>, prefix: string) {
  const decoder = new TextDecoder();
  for await (const chunk of stream) {
    console.log(`${prefix} ${decoder.decode(chunk).trimEnd()}`);
  }
}

const cmd11tyBuild = isBun
  ? ["bun", "--bun", "run", "eleventy"]
  : ["npx", "eleventy"];
const cmd11tyServe = isBun
  ? ["bun", "--bun", "run", "eleventy-dev-server", "--dir=dist"]
  : ["npx", "eleventy-dev-server", "--dir=dist"];

const run = async () => {
  // const runBuild = runCommand(`[${c.yellow("Initial Build")}] `, cmd11tyBuild);
  // runCommand(`[${c.magenta("astro")}]`, ["bun", "run", "dev.astro"]);

  // TODO: Instead of starting them independently, I should wait for the initial build to complete before starting the dev server.
  const buildProcess = spawnProc(cmd11tyBuild, spawnOptions);
  const serveProcess = spawnProc(cmd11tyServe, spawnOptions);

  const localWatcher = watch(
    import.meta.dirname,
    { recursive: true },
    (event, relativePath) => {
      console.log(`Detected ${event} in local dir: ${relativePath}`);
      if (!relativePath.startsWith("dist/")) {
        console.log("Rebuilding...");
        // TODO: To avoid issues, I guess I should kill processes and start them again?
        // buildProcess.kill();
        // await buildProcess.wait();
        // await serveProcess.wait();
      }
    },
  );

  // const inputWatcher = watch(
  //   WORKING_DIR_ABSOLUTE,
  //   { recursive: true },
  //   (event, relativePath) => {
  //     console.log(`Detected ${event} in working dir: ${relativePath}`);
  //     if (relativePath !== "_styles/_ctx.css") {
  //       console.log("Rebuilding...");
  //       Bun.spawn(["bun", "--bun", "run", "build"], spawnOptions);
  //     }
  //   },
  // );

  // Bun.spawn(["bun", "--bun", "run", "build"], spawnOptions);
  // Bun.spawn(["bun", "--bun", "run", "serve"], spawnOptions);
  const cleanup = async () => {
    console.log("Cleaning up...");
    // Bun.spawn(["bun", "--bun", "run", "db:down"])
    // await $`bun run db:down` will also work
    //

    // Explicitly kill the child processes
    buildProcess.kill();
    serveProcess.kill();

    // close watchers
    console.log("Closing watchers...");
    localWatcher.close();
    // inputWatcher.close();

    process.exit(0);

    // ? Should we wait for the build process to exit on its own ?
    // await buildProcess.exited.then(() => {
    //   console.log("\n\nBUILD PROCESS EXITED FORCEFULLY\n");
    //   process.exit(0);
    // });
  }

  process.on("SIGHUP", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGBREAK", cleanup);
  process.on("SIGQUIT", cleanup);
  process.on("SIGABRT", cleanup);
};

run();
