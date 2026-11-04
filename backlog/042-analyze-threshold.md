---
id: "042"
title: "analyze --threshold CI gate"
status: ready
area: cli
commit_message: "feat(cli): add devkit analyze --threshold CI gate (backlog 042)"
files:
  - packages/cli/src/commands/analyze-complexity.ts
  - packages/cli/src/commands/analyze-complexity.test.ts
---

## Goal

Fail command with exit 1 if any file's cyclomatic complexity exceeds `--max <score>`.

## Implementation Notes

- Add `--max <n>` flag (default: none = no gate)
- After analysis, if any file's score > max, print violations table and `process.exit(1)`
- Otherwise exit 0

## Tests Required

- Verify exit 1 when a file exceeds the threshold
- Verify exit 0 when all files pass
- Verify violations table shows file, score, threshold
