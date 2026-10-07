# `functions/` — Cloudflare Pages Functions

This directory ships a [Cloudflare Pages Function](https://developers.cloudflare.com/pages/functions/)
with every generated site. Functions at the project root are picked up
automatically by git-connected Pages deploys (not inside the `dist` output dir).

## `cms-auth/[[route]].js` — CMS sign-in via GitHub device flow

A **secretless relay** for [GitHub's OAuth Device Authorization Grant](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow)
(the "enter this code on your TV" pattern). It replaces an external OAuth client
such as [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) for the
common case.

### How sign-in works

```
/admin page                      /admin/cms-auth/* (this function)         GitHub
─────────────                    ─────────────────────────          ─────────
"Sign in with GitHub"   →   POST /admin/cms-auth/device/code     →   POST /login/oauth/device/code
                            (public client_id only)              → device_code + user_code
◄── shows "ABCD-1234" ──────────────────────────────────────────────────────────
user opens github.com/login/device, types the code, approves "poko CMS"
POST /admin/cms-auth/device/token →   POST /login/oauth/access_token     → access_token
  (poll every `interval`)        (grant_type device_code)
GET api.github.com/user ───────────────────────────────────────── → profile (CORS OK)
localStorage["sveltia-cms.user"] = {backendName:"github", token, …profile}
reload → Sveltia CMS resumes signed in
```

- The **client ID is public** — it travels in the request body, is baked into
  the page at build time, and identifies (not authenticates) the app. No secret
  exists anywhere, so **no callback URL and no domain allowlist are needed**.
- The relay only forwards the caller's own flow: it mints nothing and cannot
  leak a token to a third party.
- The stored-user shape mirrors what Sveltia persists after a normal sign-in
  (`backendName`, `token`, `id`, `name`, `login`, `email`, `avatarURL`,
  `profileURL`), so Sveltia picks it up on reload — the same mechanism it uses
  to adopt tokens left over by Netlify/Decap CMS.

### Setup

1. Create the poko OAuth app **once** (owner of the poko project): register an
   OAuth app on GitHub with **Device Flow enabled**. No callback URL is used by
   the device flow (the form still requires one — the project homepage works).
2. Set `POKO_GITHUB_CLIENT_ID` to the app's client ID (build env var, e.g.
   Pages → Settings → Variables, or `.env`). It is public and safe to commit.
3. Deploy on Cloudflare Pages. Open `/admin` → "Sign in with GitHub" → enter
   the code → authorized.

Scope requested: `repo user` (par with sveltia-cms-auth's default), so the token
can read/write the repo and read the profile. Tokens are classic non-expiring
OAuth tokens, revocable at <https://github.com/settings/applications>.

### Other deploy targets

The relay is required because GitHub's OAuth endpoints send no CORS headers.
On hosts other than Cloudflare Pages, set `CMS_AUTH_RELAY_URL` to an equivalent
secretless relay (same request shape), or skip the device flow — Sveltia's
built-in token sign-in and `backend.base_url` OAuth clients still work.

## TODO / plan / future ideas

- [ ] Create the shared poko OAuth app and bake the real `POKO_GITHUB_CLIENT_ID`
      default into the engine (currently env-only).
- [ ] Local dev path: `wrangler pages dev` serves the function — verify and
      document; `site_id=localhost` handling if needed.
- [ ] Upstream: propose native device-flow sign-in to Sveltia CMS (fits their
      blocked-on-PKCE roadmap). The shim then becomes unnecessary.
- [ ] Classic authorization-code flow endpoints (`/auth`, `/callback`) ported
      from sveltia-cms-auth — only if per-site OAuth apps are ever wanted; device
      flow covers the common case. If added: Host-derived allowlist
      (`*.{project}.pages.dev` + `EXTRA_DOMAINS` env), PKCE verifier in the CSRF
      cookie.
- [ ] GitHub client-side PKCE: adopt once GitHub ships it (token-endpoint CORS
  - secretless exchange — currently on hold upstream); the relay then retires.
- [ ] GitHub App variant: per-repo scoped tokens — blocked on ~8h expiring user
      tokens (refresh needs a secret). Revisit if GitHub relaxes this.
- [ ] UX polish: QR code / `verification_uri` button, localized strings,
      expiry countdown on the code, remember-dismissed across sessions.
- [ ] `auth_scope` config option (e.g. `public_repo` for public-only sites).
- [ ] Optional per-site OAuth app support: `POKO_GITHUB_CLIENT_ID` already
      accepts any app's ID — document that sites can bring their own app for
      branding ("Sign in with GitHub" shows the app name on GitHub's consent page).

## Files

- `cms-auth/[[route]].js` — the relay (device/code, device/token, CORS
  preflight; ~100 lines, no dependencies, no env vars)
- Shim (engine): `src/config-11ty/plugins/cms-config/device-flow.js`, served at
  `/admin/device-flow.js`, config injected on the admin page as
  `window.__POKO_CMS_AUTH__`
