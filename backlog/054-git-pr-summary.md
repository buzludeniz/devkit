---
id: "054"
title: "git pr-summary conventional commit collector"
status: ready
area: cli
commit_message: "feat(cli): add devkit git pr-summary conventional commit collector (backlog 054)"
files:
  - packages/cli/src/commands/git-pr.ts
  - packages/cli/src/commands/git-pr.test.ts
---

## Goal

Format current branch commits into a formatted GitHub PR markdown body.

## Implementation Notes

- Run `git log origin/main..HEAD --format=...`
- Parse conventional commits, group into sections:
  - `## Features`
  - `## Bug Fixes`
  - `## Chores`
- Print markdown to stdout
- `--copy` flag copies output to clipboard

## Tests Required

- Mock `git log` output with conventional commits
- Verify markdown sections are correct
- Verify conventional commit grouping (feat→Features, fix→Bug Fixes, chore→Chores)
