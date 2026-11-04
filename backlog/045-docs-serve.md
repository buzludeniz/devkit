---
id: "045"
title: "docs:serve local documentation viewer"
status: ready
area: cli
commit_message: "feat(cli): add devkit docs:serve local documentation viewer (backlog 045)"
files:
  - packages/cli/src/commands/docs-serve.ts
  - packages/cli/src/commands/docs-serve.test.ts
---

## Goal

Lightweight local HTTP static server to preview generated documentation files.

## Implementation Notes

- Accept `--port` (default 4000) and `--dir` (default `docs/`)
- Serve static files using `node:http`, detect content-type for `.html`/`.md`/`.css`/`.js`
- Print URL on startup
- Optionally open browser with `--open` flag

## Tests Required

- Verify server starts on the specified port
- Verify static files are served with correct content-type
- Verify 404 for missing files
