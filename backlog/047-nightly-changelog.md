---
id: "047"
title: "automated changelog generator from nightly PRs"
status: ready
area: nightly
commit_message: "feat(nightly): add automated changelog generator from nightly PRs (backlog 047)"
files:
  - scripts/generate-changelog.ts
  - scripts/generate-changelog.test.ts
---

## Goal

Group PR commits automatically into categorized markdown changelog releases.

## Implementation Notes

- Accept `--since <date>` or `--pr <number>`
- Fetch PR commits via GitHub API
- Parse conventional commit types (feat/fix/chore/docs)
- Group into sections: Features, Bug Fixes, Chores, Documentation
- Output formatted markdown changelog block to stdout

## Tests Required

- Mock GitHub API responses
- Verify grouping by conventional commit type
- Verify markdown output format with correct sections
