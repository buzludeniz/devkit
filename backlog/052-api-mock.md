---
id: "052"
title: "api:mock local response stub server"
status: ready
area: cli
commit_message: "feat(cli): add devkit api:mock local response stub server (backlog 052)"
files:
  - packages/cli/src/commands/api-mock.ts
  - packages/cli/src/commands/api-mock.test.ts
---

## Goal

Quick local HTTP mock server responding to routes with predefined JSON stubs.

## Implementation Notes

- Accept `--port` (default 3001)
- Built-in route: `GET /health` → `{ status: 'ok' }`
- `--routes <file>` loads a JSON routes config
- Each route: `{ method, path, status, body, delay }`
- Serve via `node:http`

## Tests Required

- Verify `/health` route returns `{ status: 'ok' }`
- Verify custom routes from JSON config are loaded and served
- Verify delay is simulated before responding
