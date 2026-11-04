---
id: "048"
title: "release:bump semantic version calculator"
status: ready
area: cli
commit_message: "feat(cli): add devkit release:bump semantic version calculator (backlog 048)"
files:
  - packages/cli/src/commands/release-bump.ts
  - packages/cli/src/commands/release-bump.test.ts
---

## Goal

Automatically calculate next patch/minor/major version based on conventional commit types.

## Implementation Notes

- Read `git log` since last tag
- Parse conventional commits: `feat` = minor bump, `fix` = patch bump, `BREAKING CHANGE` = major bump
- Print calculated next version to stdout
- `--write` flag updates `package.json` version fields in all workspace packages

## Tests Required

- Verify `feat` commit triggers minor bump
- Verify `fix` commit triggers patch bump
- Verify `BREAKING CHANGE` triggers major bump
- Verify version calculation math (e.g., 1.2.3 + minor = 1.3.0)
