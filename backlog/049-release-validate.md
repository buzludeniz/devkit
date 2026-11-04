---
id: "049"
title: "release:validate git tag and clean status check"
status: ready
area: cli
commit_message: "feat(cli): add devkit release:validate git tag and clean status check (backlog 049)"
files:
  - packages/cli/src/commands/release-validate.ts
  - packages/cli/src/commands/release-validate.test.ts
---

## Goal

Enforce clean git working tree, synchronized remote branch, and passing tests before release.

## Implementation Notes

- Run three checks in sequence:
  1. `git status --porcelain` is empty (clean working tree)
  2. `git rev-parse HEAD` == remote HEAD (in sync with remote)
  3. `pnpm test` exits 0 (all tests pass)
- Print pass/fail status for each check
- Exit 1 if any check fails

## Tests Required

- Mock git commands and verify each check detected correctly
- Verify exit code 1 when any single check fails
- Verify exit code 0 when all checks pass
