---
id: "028"
title: "cache:clean command"
status: ready
area: cli
commit_message: "feat(cli): add devkit cache:clean command (backlog 028)"
files:
  - packages/cli/src/commands/cache.ts
  - packages/cli/src/commands/cache.test.ts
---

## Goal

Clear build caches (dist/, *.tsbuildinfo, .vite/, node temp files) safely.

## Implementation Notes

- Glob for `dist/`, `*.tsbuildinfo`, `.vite/`, `.turbo/`
- Print what will be deleted before acting
- Support `--dry-run` to show without deleting
- Require confirmation unless `--yes` flag is passed

## Tests Required

- Verify glob patterns match expected paths
- Verify `--dry-run` shows but does not delete files
- Verify deletion occurs with `--yes` flag
