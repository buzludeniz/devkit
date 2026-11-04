---
id: "046"
title: "automated test coverage floor check in verify script"
status: ready
area: nightly
commit_message: "feat(nightly): add automated test coverage floor check in verify script (backlog 046)"
files:
  - scripts/nightly-verify.ts
---

## Goal

Nightly verifier checks that every work commit increases or maintains test coverage.

## Implementation Notes

- After running `pnpm test`, parse vitest coverage JSON output (`--coverage --reporter=json`)
- Compare total line coverage % with previous run stored in `.nightly/coverage-baseline.json`
- Fail verify if a regression is detected
- Update baseline on success

## Tests Required

- Create `nightly-verify.test.ts` verifying coverage comparison logic with mock JSON inputs
- Verify regression detected when new coverage < baseline
- Verify baseline updated when coverage passes
