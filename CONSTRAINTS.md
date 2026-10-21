# Constraints

Last reviewed: 2026-10-21 by @m4rrc0
Mode: written-only — agents read and comply; nothing is mechanically enforced yet.

## Floor (applies to every change)

- `npm test` passes (`node --test`) before a task is declared done.
- No new suppression comments (`@ts-ignore`, `eslint-disable`, etc.) without a reason in the commit message.
- No unimplemented stubs: `throw new Error("Not implemented")`, empty `catch {}`, or a TODO standing where the implementation should be.
- No skipped or deleted tests without a reason in the commit message.
- No secrets in source — especially under `template/**`, which is force-pushed to a public repo.
- No bundler or build step that would break the unbundled publish (ADR-001).
- New runtime dependencies need a stated justification — they ship to every consumer.
- This file does not get weakened to make a change pass. Tightening is silent; loosening needs a discussion.

## Measured, not yet enforced

| Metric | Today | Direction | Command |
|--------|-------|-----------|---------|
| Type errors | 15 (12 in generated `dist/`, 3 in `scripts/dev.ts`) | must not grow | `npx tsc --noEmit` |
| Test count | 8 | must not fall | `npm test` |

## Not adopted (deliberate)

- Lint/format: standalone oxlint/oxfmt deferred per ADR-001.
- Coverage, security scanning, a11y/perf budgets: no tooling installed. Revisit when a PR-check workflow exists.
- No CI quality gate on the engine — constraints are honored by the agent, not a pipeline.

## Exceptions

None. Any exception needs an ID, owner, reason, and expiry date (max ~90 days) recorded here — a new row appearing in a diff is a loud signal.
