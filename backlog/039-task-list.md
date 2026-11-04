---
id: "039"
title: "task:list with script documentation"
status: ready
area: cli
commit_message: "feat(cli): add devkit task:list with script documentation (backlog 039)"
files:
  - packages/cli/src/commands/task.ts
  - packages/cli/src/commands/task.test.ts
---

## Goal

Print all available project tasks, arguments, and description comments.

## Implementation Notes

- Extend existing task command: `devkit task:list` reads `devkit.config.json` tasks
- Print name / description / cmd in aligned columns
- If no `devkit.config.json` found, print a helpful message guiding the user

## Tests Required

- Verify table alignment with varying name lengths
- Verify missing config outputs helpful message
- Verify all fields (name, description, cmd) are printed
