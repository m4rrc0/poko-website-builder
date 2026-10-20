/**
 * Sveltia ↔ poko relay wire-contract sentinel.
 *
 * The gitless relay (SPEC-cms-relay) depends on exact behaviors inside
 * Sveltia's GitHub backend — popup URL derivation, the two-step
 * postMessage handshake, the tokenURL refresh call, the synthesized
 * /user field set. Sveltia evolves fast and none of it is a documented
 * API: this test extracts the real sources from the installed package's
 * dist sourcemap and asserts the contract points we rely on, so a
 * version bump that breaks them fails LOUDLY here instead of silently
 * breaking editor sign-in on live sites.
 *
 * Run: node --test src/config-11ty/plugins/cms-config/
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dependencyPath } from "../../../utils/paths.js";

const mapPath = dependencyPath("@sveltia/cms", "dist/sveltia-cms.js.map");
const map = JSON.parse(readFileSync(mapPath, "utf-8"));

const src = (suffix) => {
  const i = map.sources.findIndex((s) => s.endsWith(suffix));
  assert.notEqual(i, -1, `source not found in bundle: ${suffix}`);
  return map.sourcesContent[i];
};

const init = src("backends/git/shared/init.js");
const auth = src("backends/git/shared/auth.js");
const api = src("backends/git/shared/api.js");
const githubInit = src("backends/git/github/index.js");
const constants = src("backends/git/github/constants.js");
const githubUser = src("backends/git/github/user.js");

test("popup URL = base_url + '/' + auth_endpoint", () => {
  assert.match(
    init,
    /authURL\s*=\s*`\$\{stripSlashes\(authRoot\)\}\/\$\{stripSlashes\(authPath\)\}`/,
    "authURL derivation changed — poko mounts {base}/cms/auth",
  );
  assert.match(
    githubInit,
    /base_url:\s*authRoot/,
    "base_url field mapping changed",
  );
  assert.match(
    githubInit,
    /auth_endpoint:\s*authPath/,
    "auth_endpoint field mapping changed",
  );
});

test("tokenURL derives from authURL via /authorize→/access_token", () => {
  assert.match(
    init,
    /tokenURL:\s*authURL\.replace\(['"]\/authorize['"],\s*tokenPath\)/,
    "refresh URL derivation changed — refresh must reach POST /cms/auth",
  );
});

test("github defaults: auth_endpoint 'auth', api github.com", () => {
  assert.match(constants, /DEFAULT_AUTH_PATH\s*=\s*'auth'/);
  assert.match(
    constants,
    /DEFAULT_API_ROOT\s*=\s*'https:\/\/api\.github\.com'/,
  );
  assert.match(
    githubInit,
    /api_root:\s*restApiRoot\s*=\s*DEFAULT_API_ROOT/,
    "api_root field renamed",
  );
  assert.match(
    githubInit,
    /graphql_api_root:\s*graphqlApiRoot\s*=\s*restApiRoot/,
    "graphql_api_root field renamed",
  );
  assert.match(
    auth,
    /site_domain:\s*siteDomain/,
    "site_domain field renamed — feeds site_id in the popup URL",
  );
});

test("handshake: authorizing ping + authorization success/error", () => {
  assert.match(
    auth,
    /data\s*===\s*`authorizing:\$\{provider\}`/,
    "first handshake message changed",
  );
  assert.match(
    auth,
    /authorization:\$\{provider\}:\(success\|error\)/,
    "success message envelope changed",
  );
  assert.match(
    auth,
    /authPopup\.postMessage\(data,\s*origin\)/,
    "the echo — which reveals the opener origin to the popup — changed",
  );
  assert.match(auth, /site_id:\s*siteDomain/, "site_id param changed");
});

test("refresh: JSON grant body posted to tokenURL on 401", () => {
  assert.match(
    api,
    /grant_type:\s*'refresh_token',\s*client_id:\s*clientId,\s*refresh_token:\s*refreshToken/,
    "refresh body shape changed — poko parses JSON {grant_type, refresh_token}",
  );
  assert.match(
    api,
    /Content-Type.*application\/json|headers:\s*{[^}]*json/s,
    "refresh request must stay application/json",
  );
  assert.match(
    api,
    /401|refreshAccessToken/s,
    "401→refresh retry wiring changed",
  );
});

test("/user field mapping consumed by getUserProfile", () => {
  assert.match(githubUser, /name:\s*'name'/);
  assert.match(githubUser, /login:\s*'login'/);
  assert.match(githubUser, /profileURL:\s*'html_url'/);
});

test("REST/GraphQL base URL normalization keeps our suffixes", () => {
  const apiSrc = src("backends/git/github/api.js");
  assert.match(
    apiSrc,
    /url\.endsWith\(['"]\/api\/v3['"]\)/,
    "api_root /api/v3 pass-through changed",
  );
  assert.match(
    apiSrc,
    /url\.endsWith\(['"]\/graphql['"]\)/,
    "graphql_api_root /graphql pass-through changed",
  );
  // graphql_api_root unset must still derive api_root/api/v3 → api/graphql
  assert.match(apiSrc, /replace\(\/\\\/v3\$\/,\s*['"]\/graphql['"]\)/);
});

test("auth header scheme stays 'token'", () => {
  assert.match(api, /authScheme[:=]?\s*['"]token['"]/);
});
