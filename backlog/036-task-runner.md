---
id: "036"
title: "task runner for script execution"
status: ready
area: cli
commit_message: "feat(cli): add devkit task runner for script execution (backlog 036)"
files:
  - packages/cli/src/commands/task.ts
  - packages/cli/src/commands/task.test.ts
---

## Goal

Run named workflows defined in `devkit.config.json` with sequential execution.

## Implementation Notes

- Read `devkit.config.json` tasks map: `{ name -> { cmd, description } }`
- `devkit task <name>` spawns `cmd` as a child process
- `devkit task --list` prints all tasks with descriptions

## Tests Required

- Mock `devkit.config.json` task definitions
- Verify correct `cmd` is spawned for a given task name
- Verify `--list` output format and content
