import assert from "node:assert";
import fg from "fast-glob";
import { WORKING_DIR } from "../../../env.config.js";

export async function glob(patterns = [], options = {}) {
  assert(
    typeof patterns === "string" || Array.isArray(patterns),
    "patterns must be a string or array",
  );
  const opts = {
    cwd: WORKING_DIR,
    ...(options || {}),
  };

  return await fg(patterns, opts);
}
