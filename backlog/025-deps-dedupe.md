---
id: "025"
title: "deps:dedupe dependency conflict detector"
status: ready
area: cli
commit_message: "feat(cli): add devkit deps:dedupe dependency conflict detector (backlog 025)"
files:
  - packages/cli/src/commands/deps-dedupe.ts
  - packages/cli/src/commands/deps-dedupe.test.ts
---

## Goal

Find duplicate or conflicting dependency versions across workspace packages.

## Implementation Notes

- Collect all deps from workspace package.json files
- Group by dependency name
- Detect version conflicts (same package, different version ranges)
- Print conflicts table with which packages have which version

## Tests Required

- Verify conflict detection logic
- Verify table output with duplicate versions
- Verify no-conflict case outputs clean message
