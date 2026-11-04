---
id: "024"
title: "deps:outdated dependency checker"
status: ready
area: cli
commit_message: "feat(cli): add devkit deps:outdated dependency checker (backlog 024)"
files:
  - packages/cli/src/commands/deps.ts
  - packages/cli/src/commands/deps.test.ts
---

## Goal

Parse monorepo package.json files and check npm registry for outdated semantic versions.

## Implementation Notes

- Read all workspace package.json files
- For each dependency, query npm registry for latest version
- Compare semver: current vs latest
- Print table of outdated deps with current/latest/type (dep, devDep, peerDep)

## Tests Required

- Mock registry responses
- Verify outdated detection logic
- Verify table output format
