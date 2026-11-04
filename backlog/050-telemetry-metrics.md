---
id: "050"
title: "telemetry:metrics local usage dashboard"
status: ready
area: cli
commit_message: "feat(cli): add devkit telemetry:metrics local usage dashboard (backlog 050)"
files:
  - packages/cli/src/commands/metrics.ts
  - packages/cli/src/commands/metrics.test.ts
---

## Goal

Local-only metrics report showing CLI execution counts and slowest commands.

## Implementation Notes

- Append to `~/.devkit/metrics.jsonl` on each command invocation: `{ name, duration, exitCode, timestamp }`
- `devkit telemetry:metrics` reads and aggregates: total runs, per-command counts, avg/max duration
- `--json` flag for machine-readable output
- No data ever leaves the local machine

## Tests Required

- Verify metrics are written to the JSONL file on invocation
- Verify aggregation is correct (counts, avg, max)
- Verify `--json` output mode format
