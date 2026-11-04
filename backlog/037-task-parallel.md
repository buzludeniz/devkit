---
id: "037"
title: "parallel execution to devkit task"
status: ready
area: cli
commit_message: "feat(cli): add parallel execution to devkit task (backlog 037)"
files:
  - packages/cli/src/commands/task-parallel.ts
  - packages/cli/src/commands/task-parallel.test.ts
---

## Goal

Support `--parallel` flag with concurrency limits for independent workspace scripts.

## Implementation Notes

- When `--parallel` passed with list of task names, run all concurrently
- Use `Promise.allSettled` with `p-limit` for concurrency control
- Report per-task success/failure after all settle

## Tests Required

- Verify parallel spawn of multiple tasks
- Verify concurrency limit is respected
- Verify partial failure reporting (some pass, some fail)
