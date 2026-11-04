---
id: "051"
title: "benchmark timer and memory footprint tracer"
status: ready
area: core
commit_message: "feat(core): add benchmark timer and memory footprint tracer (backlog 051)"
files:
  - packages/core/src/benchmark.ts
  - packages/core/src/benchmark.test.ts
---

## Goal

High-resolution performance timer (`hrtime.bigint()`) and memory tracker.

## Implementation Notes

- `startTimer(): () => number` — returns elapsed ms when called
- `measureMemory(): { rss, heapUsed, heapTotal }` in MB
- `BenchmarkResult` type for structured output
- `benchmark(label, fn)`: runs `fn`, records time and memory delta, returns `BenchmarkResult`
- Supports both sync and async functions

## Tests Required

- Verify timer resolution is > 0 ms
- Verify memory reading returns positive values
- Verify `benchmark` wraps sync and async functions correctly
