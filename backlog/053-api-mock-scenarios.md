---
id: "053"
title: "scenario route loader for devkit api:mock"
status: ready
area: cli
commit_message: "feat(cli): add scenario route loader for devkit api:mock (backlog 053)"
files:
  - packages/cli/src/commands/api-mock.ts
  - packages/cli/src/commands/api-mock.test.ts
---

## Goal

Load mock endpoints from `mock-routes.json` with delay and status simulation.

## Implementation Notes

- Extend `api-mock` to support `--scenario <name>` flag selecting named scenario groups from `mock-routes.json`
- Scenario can override status codes (e.g., scenario `"error"` → all routes return 500)
- Support `--chaos` flag for random 20% 500 errors on any request

## Tests Required

- Verify scenario selection loads correct route group
- Verify chaos mode injects random 500 errors ~20% of the time
- Verify status code override applies to all routes in a scenario
