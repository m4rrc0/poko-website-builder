// Inspiration for Bun scripts: https://github.com/oven-sh/bun/issues/7589
import { watch } from "fs";
import { $ } from "bun";
import type { SpawnOptions } from "bun";
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

const spawnOptions: SpawnOptions.OptionsObject = {
  stdin: "inherit",
  stdout: "inherit",
  stderr: "inherit",
};

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
  const proc = Bun.spawn(command, {
    stdout: "pipe",
    stderr: "pipe",
    ...envObj,
  });

  pipeOutput(proc.stdout, prefix);
  pipeOutput(proc.stderr, prefix);
}

async function pipeOutput(stream: ReadableStream<Uint8Array>, prefix: string) {
  const decoder = new TextDecoder();
  for await (const chunk of stream) {
    console.log(`${prefix} ${decoder.decode(chunk).trimEnd()}`);
  }
}

const cmd11tyBuild = ["bun", "--bun", "run", "eleventy"];
const cmd11tyServe = [
  "bun",
  "--bun",
  "run",
  "eleventy-dev-server",
  "--dir=dist",
];

const run = async () => {
  // const runBuild = runCommand(`[${c.yellow("Initial Build")}] `, cmd11tyBuild);
  // runCommand(`[${c.magenta("astro")}]`, ["bun", "run", "dev.astro"]);

  // TODO: Instead of starting them independently, I should wait for the initial build to complete before starting the dev server.
  const buildProcess = Bun.spawn(cmd11tyBuild, spawnOptions);
  const serveProcess = Bun.spawn(cmd11tyServe, spawnOptions);

  const localWatcher = watch(
    import.meta.dir,
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
