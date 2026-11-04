---
id: "061"
title: "finalize v0.2.0 release candidate readiness gate"
status: ready
area: cli
commit_message: "feat(cli): finalize v0.2.0 release candidate readiness gate (backlog 061)"
files:
  - packages/cli/src/commands/release-check.ts
  - packages/cli/src/commands/release-check.test.ts
---

## Goal

Full sanity validation suite verifying documentation, zero lint warnings, and 100% passing tests for v0.2.0.

## Implementation Notes

- `devkit release:check` runs the following checks in order:
  1. `pnpm lint` exits 0
  2. `pnpm typecheck` exits 0
  3. `pnpm test` exits 0
  4. `pnpm build` exits 0
  5. All `backlog/*.md` files have `status: done`
  6. `README.md` last-modified within 7 days
- Print a checklist: ✓ or ✗ for each check
- Exit 1 if any check fails

## Tests Required

- Mock each subprocess check for all 6 steps
- Verify pass/fail status is correctly reported per step
- Verify exit code 1 when any single step fails
- Verify exit code 0 when all steps pass
