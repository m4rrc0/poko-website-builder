// Bun-vs-npm command dispatch for package.json scripts.
// Runs under Node (npm's script shell is cmd.exe on Windows, so the POSIX
// `command -v` test can't live in the scripts themselves). Picks the Bun
// command line when `bun` is on PATH, the npm-equivalent otherwise.
import { spawn, spawnSync } from "node:child_process";

const commands = {
  build: {
    bun: "bun --bun run eleventy",
    node: "eleventy",
  },
  "build:gh-pages": {
    bun: "bun --bun run eleventy",
    node: "eleventy",
  },
  dev: {
    bun: "bun --bun run eleventy --serve",
    node: "eleventy --serve",
  },
  start: {
    bun: "bunx --bun @11ty/eleventy@canary --serve",
    node: "npx --yes @11ty/eleventy@canary --serve",
  },
};

const task = process.argv[2];
const command = commands[task];
if (!command) {
  console.error(
    `Unknown task "${task ?? ""}". Expected one of: ${Object.keys(commands).join(", ")}`,
  );
  process.exit(1);
}

const hasBun =
  typeof process.versions?.bun !== "undefined" ||
  spawnSync("bun", ["--version"], { stdio: "ignore" }).status === 0;

// Args after `npm run <script> -- …` are forwarded to the command.
const extraArgs = process.argv.slice(3).join(" ");
const cmd = (hasBun ? command.bun : command.node) + (extraArgs && ` ${extraArgs}`);

const proc = spawn(cmd, {
  shell: true,
  stdio: "inherit",
  env: process.env,
});
proc.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
proc.on("exit", (code) => {
  process.exit(code ?? 1);
});
