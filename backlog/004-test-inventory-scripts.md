---
id: 004
slug: test-inventory-scripts
status: ready
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
