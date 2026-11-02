---
id: 010
slug: api-retry
status: ready
area: packages/cli
---

# Retry transient failures in `api:test`

## Context

A single network blip marks a healthy endpoint as failed. CI flakiness follows.

## Acceptance criteria

- [ ] `--retries <n>` defaults to 2 and accepts 0 to disable.
- [ ] Retries happen on network errors, HTTP 408, 429, and 5xx.
- [ ] Other 4xx responses are not retried.
- [ ] Delay is 100 ms multiplied by 2 for each attempt, capped at 1 s.
- [ ] The final result reports the last attempt's status and a retry count.

## Test plan

- Extend `packages/cli/src/commands/api.test.ts` with a local server that fails
  twice then succeeds, a 404 that is called once, and exhausted retries.

## Documentation

- Add `--retries` to the `api:test` entry in `docs/commands.md`.
