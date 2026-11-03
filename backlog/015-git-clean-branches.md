---
id: 015
slug: git-clean-branches
status: ready
area: packages/cli
---

# Add `devkit git clean-branches`

## Context

Developers accumulate local branches that have already been merged upstream or deleted on the remote.

## Acceptance criteria

- [ ] `devkit git clean-branches` detects merged local branches (excluding `main` and `master`).
- [ ] Prompts or deletes merged branches and prints deleted branch names.
- [ ] `--dry-run` lists branches that would be deleted without deleting them.
- [ ] `--force` deletes unmerged branches whose upstream tracking branch is gone (`git branch -vv` reports `: gone]`).

## Test plan

- Add `packages/cli/src/commands/git-clean.test.ts` with a mock repository containing merged and unmerged branches.

## Documentation

- Add `devkit git clean-branches` entry in `docs/commands.md` and `README.md`.
