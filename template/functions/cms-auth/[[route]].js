/**
 * Secretless GitHub OAuth relay for the CMS device flow (see README.md).
 *
 * GitHub's OAuth endpoints send no CORS headers, so the admin page cannot call
 * them directly. This function only forwards requests — the OAuth app's client
 * ID is public and arrives in the request body, no secret exists server-side —
 * therefore no domain allowlist is needed: the relay can only ever deliver a
 * token to whoever initiated the flow.
 *
 * Routes (all under /cms-auth/):
 *   POST /cms-auth/device/code   → POST github.com/login/oauth/device/code
 *   POST /cms-auth/device/token  → POST github.com/login/oauth/access_token
 *                                  (grant_type device_code)
 *   GET  /cms-auth/*             → 405-style info response
 */

const GITHUB_ENDPOINTS = {
  "device/code": "https://github.com/login/device/code",
  "device/token": "https://github.com/login/oauth/access_token",
};

/** Scopes the CMS may request — the same set sveltia-cms-auth accepts. */
const ALLOWED_SCOPES = [
  "repo",
  "public_repo",
  "user",
  "read:user",
  "user:email",
];

const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders },
  });

const errorResponse = (message, status) => jsonResponse({ error: message }, status);

/** OAuth app client IDs are public identifiers (e.g. `Iv1.…`, `Ov23li…`), never secrets. */
const isValidClientId = (value) =>
  typeof value === "string" && /^[A-Za-z0-9._-]{1,100}$/.test(value);

const isValidDeviceCode = (value) =>
  typeof value === "string" && /^[0-9a-f]{40}$/.test(value);

const sanitizeScope = (value) => {
  const scopes = String(value ?? "")
    .split(/[\s,]+/)
    .filter(Boolean);
  return scopes.length && scopes.every((s) => ALLOWED_SCOPES.includes(s))
    ? scopes.join(" ")
    : "repo user";
};

/** Forward `params` to a GitHub OAuth endpoint and relay its JSON response. */
const proxy = async (route, params) => {
  const response = await fetch(GITHUB_ENDPOINTS[route], {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(params),
  });
  const body = await response.json().catch(() => null);
  return body
    ? jsonResponse(body, response.status)
    : errorResponse(`GitHub responded ${response.status}`, 502);
};

export const onRequestPost = async ({ request, params }) => {
  const route = params.route?.join("/") ?? "";

  if (route !== "device/code" && route !== "device/token") {
    return errorResponse("Not found", 404);
  }

  const body = await request.json().catch(() => null);
  if (!isValidClientId(body?.client_id)) {
    return errorResponse("Invalid client_id", 400);
  }

  if (route === "device/code") {
    return proxy("device/code", {
      client_id: body.client_id,
      scope: sanitizeScope(body.scope),
    });
  }

  if (!isValidDeviceCode(body.device_code)) {
    return errorResponse("Invalid device_code", 400);
  }
  return proxy("device/token", {
    client_id: body.client_id,
    device_code: body.device_code,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });
};

export const onRequestGet = () =>
  errorResponse("poko CMS auth relay — POST only. See /functions/README.", 405);

export const onRequestOptions = () =>
  new Response(null, { status: 204, headers: corsHeaders });
