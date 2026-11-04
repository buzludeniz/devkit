---
id: "023"
title: "custom headers and body flags to devkit api:test"
status: ready
area: cli
commit_message: "feat(cli): add custom headers and body flags to devkit api:test (backlog 023)"
files:
  - packages/cli/src/commands/api.ts
  - packages/cli/src/commands/api.test.ts
---

## Goal

Support `-H/--header <k:v>` and `-d/--data <json>` for POST/PUT endpoint checks.

## Implementation Notes

- Parse repeated `--header` flags into object, `--data` as JSON body, forward to fetch
- Support `--method` flag
- Handle multiple `-H` flags accumulating into a headers object

## Tests Required

- Verify headers forwarded correctly
- Verify POST body sent
- Verify JSON data parsed
