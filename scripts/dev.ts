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

const run = async () => {
  // await $`BRANCH=$(git symbolic-ref --short HEAD) GIT_REMOTES=$(git remote -v) bun --bun run eleventy`;

  const localWatcher = watch(
    import.meta.dir,
    { recursive: true },
    (event, relativePath) => {
      console.log(`Detected ${event} in local dir: ${relativePath}`);
      if (!relativePath.startsWith("dist/")) {
        console.log("Rebuilding...");
        // $`BRANCH=$(git symbolic-ref --short HEAD) GIT_REMOTES=$(git remote -v) bun --bun run eleventy`;
        Bun.spawn(["bun", "run", "build"], spawnOptions);
      }
    },
  );

  const inputWatcher = watch(
    WORKING_DIR_ABSOLUTE,
    { recursive: true },
    (event, relativePath) => {
      console.log(`Detected ${event} in working dir: ${relativePath}`);
      if (relativePath !== "_styles/_ctx.css") {
        console.log("Rebuilding...");
        Bun.spawn(["bun", "run", "build"], spawnOptions);
      }
    },
  );

  Bun.spawn(["bun", "run", "build"], spawnOptions);
  Bun.spawn(["bun", "run", "serve"], spawnOptions);

  process.on("SIGINT", async () => {
    console.log("Cleaning up...");
    // Bun.spawn(["bun", "run", "db:down"])
    // await $`bun run db:down` will also work
    //
    // close watcher when Ctrl-C is pressed
    console.log("Closing watchers...");
    localWatcher.close();
    inputWatcher.close();

    process.exit(0);
  });
};

run();
