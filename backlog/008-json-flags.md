---
id: 008
slug: json-flags
status: done
area: packages/cli
---

# Add `--json` output to `git status` and `analyze`

## Context

Scripts cannot consume the human-formatted output of these commands.

## Acceptance criteria

- [x] `devkit git status --json` prints the existing `GitStatus` object as
      JSON with no extra prose.
- [x] `devkit analyze <file> --json` prints
      `{ file, score, lines, decisionPoints }` as JSON.
- [x] Without the flag, output is byte-for-byte the current human format.
- [x] Exit codes do not change.

## Test plan

- Extend `git-status.test.ts` and `analyze-complexity.test.ts`, or add command
  tests that capture stdout and `JSON.parse` it.

## Documentation

- Add `--json` to both entries in `docs/commands.md`.

## Result

`devkit git status --json` prints the `GitStatus` object (`clean`, `branch`,
`staged`, `modified`, `untracked`) as two-space indented JSON and nothing else.
`devkit analyze <file> --json` prints `{ file, score, lines, decisionPoints }`
in that key order. Without the flag both commands print exactly what they did
before. Errors still go to stderr with exit code 1, and nothing is written to
stdout in that case.

Command tests in `packages/cli/src/commands/git.test.ts` and
`packages/cli/src/commands/analyze.test.ts` capture stdout, check the human
format line by line, `JSON.parse` the `--json` output, and check the error
path's exit code.
