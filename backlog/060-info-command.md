---
id: "060"
title: "info command with full environment telemetry"
status: ready
area: cli
commit_message: "feat(cli): add devkit info command with full environment telemetry (backlog 060)"
files:
  - packages/cli/src/commands/info.ts
  - packages/cli/src/commands/info.test.ts
---

## Goal

Output complete system summary (OS, Node, pnpm, git, config, active plugins).

## Implementation Notes

- `devkit info` prints:
  - OS / platform / arch
  - Node.js version
  - pnpm version
  - git version
  - devkit version (from package.json)
  - `.devkitrc.json` active config summary
  - Loaded plugins list
- `--json` flag for structured JSON output

## Tests Required

- Verify all fields are present in text output
- Verify `--json` mode produces parseable JSON with same fields
- Verify graceful handling when pnpm or git is not installed
