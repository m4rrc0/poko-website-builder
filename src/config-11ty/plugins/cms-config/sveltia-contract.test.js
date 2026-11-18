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

// github/constants.js exports only literals — the bundler inlines them, so
// the file never appears in sources. Assert its values where they land:
// the generated bundle.
const bundle = readFileSync(
  dependencyPath("@sveltia/cms", "dist/sveltia-cms.js"),
  "utf-8",
);

const init = src("backends/git/shared/init.js");
const auth = src("backends/git/shared/auth.js");
const api = src("backends/git/shared/api.js");
const githubInit = src("backends/git/github/index.js");
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
  assert.match(
    bundle,
    /auth_endpoint:\s*\w+\s*=\s*['"`]auth['"`]/,
    "DEFAULT_AUTH_PATH value changed",
  );
  assert.match(
    bundle,
    /api_root:\s*\w+\s*=\s*['"`]https:\/\/api\.github\.com['"`]/,
    "DEFAULT_API_ROOT value changed",
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
    /authorizing:\$\{provider\}/,
    "handshake wire format changed",
  );
  assert.match(
    auth,
    /data\s*===\s*formatHandshakeMessage\(provider\)/,
    "first handshake message comparison changed",
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
  // GHE roots: strip any /api{,/v3,/graphql} tail, rebuild as /api/{suffix}.
  // For our relay this still maps api_root/api/v3 → /api/graphql.
  assert.match(
    apiSrc,
    /api\(\?:\\\/v3\|\\\/graphql\)\?\$/,
    "api_root /api/v3 suffix stripping changed",
  );
  assert.match(
    apiSrc,
    /\/api\/\$\{suffix\}`/,
    "/api/{v3|graphql} rebuild changed",
  );
  assert.match(
    apiSrc,
    /url\s*===\s*DEFAULT_API_ROOT/,
    "api.github.com default special-casing changed",
  );
  assert.match(
    apiSrc,
    /url\.endsWith\(['"]\/graphql['"]\)/,
    "graphql_api_root /graphql pass-through changed",
  );
});

test("auth header scheme stays 'token'", () => {
  assert.match(api, /authScheme[:=]?\s*['"]token['"]/);
});

// SPEC-deploy-hook — prefs.js seeds these exact pref keys; a rename in
// Sveltia silently disables Publish Changes on managed sites.
test("deploy hook prefs contract (SPEC-deploy-hook)", () => {
  const publish = src("services/deployments/publish.js");
  // Pref key names — our registry emits these verbatim.
  assert.match(publish, /deployHookURL/, "deployHookURL key renamed");
  assert.match(
    publish,
    /deployHookAuthHeader/,
    "deployHookAuthHeader key renamed",
  );
  // With an auth header the call is CORS-mode POST + Authorization —
  // poko's OPTIONS handler must answer the preflight.
  assert.match(
    publish,
    /mode:\s*deployHookAuthHeader\s*\?\s*'cors'\s*:\s*'no-cors'/,
    "cors/no-cors switch changed",
  );
  assert.match(
    publish,
    /Authorization:\s*deployHookAuthHeader/,
    "auth header wiring changed",
  );
  // HTTPS-or-localhost URL gate.
  assert.match(
    publish,
    /isSecureURL\(deployHookURL\)/,
    "deployHookURL secure-scheme check changed",
  );
  // Button enablement reads prefs — not shown here, but the inverse
  // matters: with NO header the request is no-cors → opaque → errors
  // invisible. Guarded by the header assertion above.
});
