---
id: "044"
title: "AST-based token comparison for clone detector"
status: ready
area: core
commit_message: "feat(core): add AST-based token comparison for clone detector (backlog 044)"
files:
  - packages/core/src/tokenizer.ts
  - packages/core/src/tokenizer.test.ts
---

## Goal

Normalized token scanner in core ignoring whitespace and variable rename differences.

## Implementation Notes

- `tokenizeFile(src: string): Token[]`
- Normalize: strip whitespace, replace identifiers with `$ID`, replace string literals with `$STR`, replace numbers with `$NUM`
- `hashTokenWindow(tokens, start, len)`: sha256 of normalized token window

## Tests Required

- Verify normalization strips whitespace correctly
- Verify identifier replacement produces `$ID`
- Verify two semantically identical code blocks produce the same hash
