---
id: "038"
title: "--watch mode to devkit task"
status: ready
area: cli
commit_message: "feat(cli): add --watch mode to devkit task (backlog 038)"
files:
  - packages/cli/src/commands/task-watch.ts
  - packages/cli/src/commands/task-watch.test.ts
---

## Goal

Re-run tasks on file system change with debounce window.

## Implementation Notes

- When `--watch` passed, use `chokidar` to watch `--watch-path` (default: `src/`)
- Debounce 300ms before re-running to avoid rapid re-triggers
- Re-run task on change and print timestamp of each re-run

## Tests Required

- Mock `fs.watch` or chokidar events
- Verify debounce prevents multiple rapid re-runs
- Verify task re-runs on file change event
