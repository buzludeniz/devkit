---
id: 004
slug: test-inventory-scripts
status: done
area: packages/cli
---

# Include `scripts/` tests in the test inventory totals

## Context

`collectTestStats` scans `packages/*` only, while the rendered file list includes
`scripts/**/*.test.ts`. The totals therefore disagree with the rows.

## Acceptance criteria

- [ ] Totals count every test file listed in the report, including `scripts/`.
- [ ] The per-package table gains a `scripts` row when that directory has tests.
- [ ] The end-to-end test file is counted once, not once per matching glob.
- [ ] Repositories without a `scripts` test directory still render correctly.

## Test plan

- Extend `scripts/nightly-tasks/tasks/generators.test.ts` with a temporary repo
  containing one package test and one script test, asserting totals and rows.

## Documentation

- Update the test inventory description in `README.md` only if it states the
  scope explicitly.

## Result

`collectTestStats` now walks the full file listing once, deduplicated, and
summarises each workspace package plus a `scripts` row when that directory
contains tests. Test files outside both directories fall into an `other` row,
so the totals always match the rendered file list. `scripts/test-nightly-e2e.test.ts`
is counted once. Repositories without script tests render unchanged, with no
`scripts` row. Added temporary-repository tests for the scripts row, the totals,
and the no-scripts case, and regenerated `docs/metrics/tests.md`.
