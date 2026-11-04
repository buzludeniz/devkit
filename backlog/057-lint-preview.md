---
id: "057"
title: "lint:fix-dryrun preview"
status: ready
area: cli
commit_message: "feat(cli): add devkit lint:fix-dryrun preview (backlog 057)"
files:
  - packages/cli/src/commands/lint-preview.ts
  - packages/cli/src/commands/lint-preview.test.ts
---

## Goal

Preview proposed Biome formatting/linter fixes without writing changes to disk.

## Implementation Notes

- Run `biome check --reporter=json` (not `--fix`) to get proposed changes
- Parse JSON output from Biome
- Show each file's proposed changes as a colored unified diff to stdout
- `--file <path>` flag to filter output to a single file

## Tests Required

- Mock Biome JSON output
- Verify diff generation from Biome output
- Verify `--file` filter restricts output to one file
