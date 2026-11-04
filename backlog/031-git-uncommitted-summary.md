---
id: "031"
title: "git uncommitted summary flag"
status: ready
area: cli
commit_message: "feat(cli): add devkit git uncommitted summary flag (backlog 031)"
files:
  - packages/cli/src/commands/git-status.ts
  - packages/cli/src/commands/git-status.test.ts
---

## Goal

Quick CLI flag (`--summary`) outputting concise lines added/deleted across unstaged files.

## Implementation Notes

- When `--summary` flag passed, run `git diff --stat` for unstaged files
- Also run `git diff --cached --stat` for staged files
- Combine into concise output: `N files changed, X insertions(+), Y deletions(-)`

## Tests Required

- Mock `git diff --stat` output
- Verify summary aggregation of staged + unstaged
- Verify line counts are correct
