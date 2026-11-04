---
id: "040"
title: "event emitter bus for task and plugin events"
status: ready
area: core
commit_message: "feat(core): add event emitter bus for task and plugin events (backlog 040)"
files:
  - packages/core/src/events.ts
  - packages/core/src/events.test.ts
---

## Goal

Type-safe event emitter for build stages, task completions, and CLI lifecycles.

## Implementation Notes

- Define `DevKitEvents` type map:
  - `'task:start': { name: string }`
  - `'task:done': { name: string, duration: number }`
  - `'task:error': { name: string, error: Error }`
  - `'plugin:loaded': { name: string }`
- `TypedEmitter<DevKitEvents>` extending Node's `EventEmitter`

## Tests Required

- Verify typed `emit` and `on` work correctly
- Verify listener receives typed payload
- Verify `removeListener` removes the handler
