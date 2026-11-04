---
id: "034"
title: "plugin:list and info commands"
status: ready
area: cli
commit_message: "feat(cli): add devkit plugin:list and info commands (backlog 034)"
files:
  - packages/cli/src/commands/plugin.ts
  - packages/cli/src/commands/plugin.test.ts
---

## Goal

Display installed plugins, active hooks, versions, and permissions.

## Implementation Notes

- Read `.devkitrc.json` plugins array
- For each plugin, `require()` it and read its manifest
- Print table with: name / version / hooks / status
- `plugin info <name>` shows full manifest details

## Tests Required

- Mock `.devkitrc.json` with sample plugin entries
- Verify table columns: name, version, hooks, status
- Verify `info` subcommand outputs full manifest details
