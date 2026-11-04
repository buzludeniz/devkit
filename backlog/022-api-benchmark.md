---
id: "022"
title: "api:benchmark endpoint latency sampler"
status: ready
area: cli
commit_message: "feat(cli): add devkit api:benchmark endpoint latency sampler (backlog 022)"
files:
  - packages/cli/src/commands/api-bench.ts
  - packages/cli/src/commands/api-bench.test.ts
---

## Goal

Measure p50, p95, p99 latency over N concurrent requests with error rate reporting.

## Implementation Notes

- Accept `--url <url>`, `--requests <n>` (default 20), `--concurrency <c>` (default 5)
- Run N HTTP GET requests (or POST with --data) with up to C in flight at once
- Collect response times in ms, sort, extract percentiles
- Print a table: p50, p95, p99, min, max, errors, total time
- Exit 1 if error rate > 10%

## Tests Required

- Mock HTTP calls, verify percentile calculations
- Verify table output format
- Verify exit code on high error rate
