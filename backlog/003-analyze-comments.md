---
id: 003
slug: analyze-comments
status: ready
area: packages/cli
---

# Stop counting comments and strings in complexity analysis

## Context

`analyzeComplexity` matches decision keywords anywhere in the file. Commented-out
code, string literals, and `else if` chains inflate the score: `else if` matches
both `else` and `if`.

## Acceptance criteria

- [ ] Line comments (`//`) and block comments (`/* ... */`) are ignored.
- [ ] Single, double, and template string contents are ignored.
- [ ] An `else if` chain counts each branch once, not twice.
- [ ] Real `if`, `for`, `while`, `case`, `catch`, `&&`, `||`, `??`, `?.`, and
      ternaries still count.
- [ ] The return shape `{ file, score, lines, decisionPoints }` is unchanged.

## Test plan

- Extend `packages/cli/src/commands/analyze-complexity.test.ts` with fixtures
  containing commented-out branches, decision keywords inside strings, and an
  `else if` chain whose expected score is exact.

## Documentation

- Update the `devkit analyze` paragraph in `docs/commands.md` to say comments
  and strings are ignored.
