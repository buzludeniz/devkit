---
id: "027"
title: "license:check scanner"
status: ready
area: cli
commit_message: "feat(cli): add devkit license:check scanner (backlog 027)"
files:
  - packages/cli/src/commands/license.ts
  - packages/cli/src/commands/license.test.ts
---

## Goal

Verify third-party dependencies adhere to an allowed license whitelist (MIT, Apache-2.0, BSD).

## Implementation Notes

- Read node_modules package.json files for each installed dependency
- Extract `license` field from each
- Check against allowed list (configurable via `--allow` or config file)
- Print violations table
- Exit 1 on any violations

## Tests Required

- Mock package.json license fields
- Verify detection of disallowed licenses
- Verify allowed licenses pass without error
