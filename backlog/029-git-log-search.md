---
id: "029"
title: "git log-search command"
status: ready
area: cli
commit_message: "feat(cli): add devkit git log-search command (backlog 029)"
files:
  - packages/cli/src/commands/git-search.ts
  - packages/cli/src/commands/git-search.test.ts
---

## Goal

Fast search across git commit history with author, date, and keyword filters.

## Implementation Notes

- Run `git log` with `--author`, `--since`, `--until`, `--grep` flags passed from CLI args
- Format output as table: hash / author / date / message
- Support `--json` flag for machine-readable output

## Tests Required

- Mock git subprocess output
- Verify flag forwarding to git log
- Verify table output format
- Verify JSON output mode
