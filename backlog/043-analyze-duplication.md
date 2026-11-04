---
id: "043"
title: "analyze:duplication code clone detector"
status: ready
area: cli
commit_message: "feat(cli): add devkit analyze:duplication code clone detector (backlog 043)"
files:
  - packages/cli/src/commands/analyze-duplication.ts
  - packages/cli/src/commands/analyze-duplication.test.ts
---

## Goal

Token-based analysis to detect duplicated code blocks (>=10 lines) across files.

## Implementation Notes

- Read all `.ts` files in target directory
- Split into sliding windows of 10 lines, hash each window
- Group identical hashes, report duplicates with file locations
- `--min-lines` flag to adjust minimum window size threshold

## Tests Required

- Verify detection of exact duplicates across files
- Verify `--min-lines` flag changes the window size
- Verify no false positives on distinct code blocks
