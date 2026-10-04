// Brand data loading — Node-only (fs). Merges `_data/brand/*.yaml` files over
// the legacy `_data/brand.yaml` exactly like Eleventy's data cascade does:
// every `brand/<name>.yaml` file lands on `brand.<name>` and wins that key;
// legacy `brand.yaml` keys that have no dedicated file survive untouched.
import fs from "node:fs";
import path from "node:path";
import fglob from "fast-glob";
import yaml from "js-yaml";

const readYaml = (file) => {
  try {
    return yaml.load(fs.readFileSync(file, "utf-8"));
  } catch {
    return undefined;
  }
};

export function loadBrandData(dataDir) {
  const dataPath = path.join(dataDir, "_data");
  const brand = readYaml(path.join(dataPath, "brand.yaml")) ?? {};

  for (const file of fglob.sync(`${dataPath}/brand/*.{yml,yaml}`)) {
    const key = path.basename(file).replace(/\.(yml|yaml)$/, "");
    const value = readYaml(file);
    if (value !== undefined) brand[key] = value;
  }
  return brand;
}
