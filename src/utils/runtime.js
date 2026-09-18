import { exec } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { promisify } from "node:util";

/**
 * True when the current process runs under the Bun runtime.
 * Every Bun-specific call site tests this first: with Bun the original
 * execution stream is kept; without it, the npm/Node equivalents below
 * do exactly the same job.
 */
export const isBun =
  typeof globalThis.Bun !== "undefined" ||
  Boolean(typeof process !== "undefined" && process.versions?.bun);

const execAsync = promisify(exec);

// Shell-quote interpolated values the way Bun's `$` does.
const shQuote = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

/**
 * Stand-in for Bun's `$` tagged template under Node: builds the command with
 * the same quoting rules and, like Bun's `ShellPromise`, is awaitable — it
 * resolves to a `ShellOutput`-like object whose `.text()` synchronously
 * returns stdout. Calling `.text()` on the promise itself also works.
 */
const nodeShell = (strings, ...values) => {
  const command = strings.reduce(
    (cmd, part, i) =>
      cmd + part + (i < values.length ? shQuote(values[i]) : ""),
    "",
  );
  const run = execAsync(command);
  const output = run.then(({ stdout, stderr }) => ({
    stdout,
    stderr,
    text: () => stdout,
  }));
  output.text = async () => (await run).stdout;
  return output;
};

/** Bun's `$` under Bun, `node:child_process.exec` under Node. */
export const $ = isBun ? (await import("bun")).$ : nodeShell;

/** `Bun.file(path).text()` under Bun, `fs.readFile` under Node. */
export const readTextFile = (path) =>
  isBun ? globalThis.Bun.file(path).text() : readFile(path, "utf-8");

/**
 * Bundle CSS entrypoints to files: `Bun.build` under Bun,
 * `lightningcss`'s `bundle` under Node (already a project dependency).
 * Returns `[{ path, content }]` for every output, like the plugin code that
 * previously read `Bun.build`'s outputs back from disk.
 *
 * `naming` supports the `[name].css` pattern or a fixed filename.
 */
export async function buildCss({
  entrypoints,
  outdir,
  naming = "[name].css",
  minify = false,
  cssChunking = true,
}) {
  if (isBun) {
    const { build: bunBuild } = await import("bun");
    const { outputs } = await bunBuild({
      entrypoints,
      outdir,
      naming,
      minify,
      cssChunking,
    });
    return Promise.all(
      outputs.map(async (output) => ({
        path: output.path,
        content: await globalThis.Bun.file(output.path).text(),
      })),
    );
  }

  const { bundle } = await import("lightningcss");
  await mkdir(outdir, { recursive: true });
  return Promise.all(
    entrypoints.map(async (entrypoint) => {
      const { code } = bundle({ filename: resolve(entrypoint), minify });
      const filename =
        naming === "[name].css"
          ? basename(entrypoint).replace(/\.[^.]*$/, ".css")
          : naming;
      const path = join(outdir, filename);
      await writeFile(path, code);
      return { path, content: new TextDecoder().decode(code) };
    }),
  );
}
