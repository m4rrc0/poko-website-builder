// Bun-vs-npm command dispatch for package.json scripts.
// Runs under Node (npm's script shell is cmd.exe on Windows, so the POSIX
// `command -v` test can't live in the scripts themselves). Picks the Bun
// command line when `bun` is on PATH, the npm-equivalent otherwise.
import { spawn, spawnSync } from "node:child_process";

const commands = {
  build: {
    bun: ["bun", "--bun", "run", "eleventy"],
    node: ["eleventy"],
  },
  "build:gh-pages": {
    bun: ["bun", "--bun", "run", "eleventy"],
    node: ["eleventy"],
  },
  dev: {
    bun: ["bun", "--bun", "run", "eleventy", "--serve"],
    node: ["eleventy", "--serve"],
  },
  start: {
    bun: ["bunx", "--bun", "@11ty/eleventy@canary", "--serve"],
    node: ["npx", "--yes", "@11ty/eleventy@canary", "--serve"],
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

const [file, ...baseArgs] = hasBun ? command.bun : command.node;
// Args after `npm run <script> -- …` are forwarded unchanged, keeping each
// argument's boundaries intact.
const args = [...baseArgs, ...process.argv.slice(3)];

const proc = spawn(file, args, {
  stdio: "inherit",
  env: process.env,
  // node_modules/.bin and npx are .cmd shims: they cannot be spawned
  // directly on Windows, so they go through cmd.exe there (Node escapes
  // the args). POSIX spawns without a shell.
  shell: process.platform === "win32",
});
proc.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
proc.on("exit", (code) => {
  process.exit(code ?? 1);
});
