---
id: "041"
title: "completion shell generator"
status: ready
area: cli
commit_message: "feat(cli): add devkit completion shell generator (backlog 041)"
files:
  - packages/cli/src/commands/completion.ts
  - packages/cli/src/commands/completion.test.ts
---

## Goal

Generate bash, zsh, and fish completion scripts for all registered devkit commands.

## Implementation Notes

- `devkit completion bash|zsh|fish` outputs a shell-specific completion script
- Introspect commander program for command names and flags
- Output to stdout for `eval` in shell profile (e.g., `eval "$(devkit completion zsh)"`)

## Tests Required

- Verify bash/zsh/fish output is non-empty
- Verify registered command names appear in the output
- Verify flags appear in the output
