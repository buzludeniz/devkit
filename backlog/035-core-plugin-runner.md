---
id: "035"
title: "plugin runner sandbox with timeout protection"
status: ready
area: core
commit_message: "feat(core): add plugin runner sandbox with timeout protection (backlog 035)"
files:
  - packages/core/src/plugin-runner.ts
  - packages/core/src/plugin-runner.test.ts
---

## Goal

Execute plugin hooks safely with configurable timeouts and error boundary isolation.

## Implementation Notes

- `runHook(plugin, hookName, ctx, timeout=5000)`: wraps hook in `Promise.race` with timeout
- Catches all errors, returns `Result<void, PluginError>`
- Never throws — always returns a Result
- Log timeout and error details inside the Result error

## Tests Required

- Verify timeout triggers correctly and returns Err
- Verify error isolation: a thrown hook doesn't crash the runner
- Verify success path returns Ok
