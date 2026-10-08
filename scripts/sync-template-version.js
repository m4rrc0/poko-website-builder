// Runs in the `version` npm lifecycle hook: `npm version` has already bumped
// the root package.json, so the staged template/package.json lands inside
// the release commit and tag.
import fs from "node:fs";

const root = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = process.env.npm_package_version ?? root.version;
// The template tracks stable releases only.
if (version.includes("-")) process.exit(0);

const templatePath = "template/package.json";
const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));
template.dependencies["poko-website-builder"] = `^${version}`;
fs.writeFileSync(templatePath, JSON.stringify(template, null, 2) + "\n");
