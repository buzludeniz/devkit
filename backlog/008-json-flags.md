---
id: 008
slug: json-flags
status: ready
area: packages/cli
---

# Add `--json` output to `git status` and `analyze`

## Context

Scripts cannot consume the human-formatted output of these commands.

## Acceptance criteria

- [ ] `devkit git status --json` prints the existing `GitStatus` object as
      JSON with no extra prose.
- [ ] `devkit analyze <file> --json` prints
      `{ file, score, lines, decisionPoints }` as JSON.
- [ ] Without the flag, output is byte-for-byte the current human format.
- [ ] Exit codes do not change.

## Test plan

- Extend `git-status.test.ts` and `analyze-complexity.test.ts`, or add command
  tests that capture stdout and `JSON.parse` it.

## Documentation

- Add `--json` to both entries in `docs/commands.md`.
