# DevKit backlog planner

You are planning the next DevKit work items. Do not implement anything and do
not commit.

## Task

1. Read the repository: source, tests, `README.md`, `docs/`, and open
   `backlog/*.md` items.
2. Find concrete gaps: bugs, unhandled inputs, missing flags, missing commands,
   weak error messages, and untested edge cases.
3. Write enough new backlog files to bring the number of `status: ready` items
   to at least twelve. Each file must use this shape:

```markdown
---
id: NNN
slug: short-slug
status: ready
area: packages/cli
---

# Title

## Context

Why this matters and which files are involved.

## Acceptance criteria

- [ ] Observable behaviour one.
- [ ] Observable behaviour two.

## Test plan

- Specific test file and cases.

## Documentation

- Which document changes when behaviour is user-facing.
```

Rules:

- One file per item, named `NNN-slug.md`, with a unique three-digit id.
- Each item must be small enough for one focused commit: roughly one source
  file, one test file, and one documentation edit.
- Prefer fixing a real defect or adding a small user-facing capability over
  refactoring.
- Do not duplicate an item that is already ready or done.
- Leave all files untracked. The nightly engineer will commit them with the
  first work item.
