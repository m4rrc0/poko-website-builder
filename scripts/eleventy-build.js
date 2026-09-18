// Programmatic build entry point, kept for backwards compatibility.
// `poko build` is the supported interface.
import { runCli } from "./cli.js";

await runCli(["build", ...process.argv.slice(2)]);
