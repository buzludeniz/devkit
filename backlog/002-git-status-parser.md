---
id: 002
slug: git-status-parser
status: done
area: packages/cli
---

# Parse git porcelain status correctly for `MM` and renames

## Context

`getGitStatus` treats the two porcelain columns as one value. A file that is
staged and then modified again (`MM`) should appear in both lists, and a rename
(`R  old -> new`) should be reported under its new path.

## Acceptance criteria

- [ ] First-column `A`, `M`, `D`, and `R` entries are counted as staged.
- [ ] Second-column `M` and `D` entries are counted as modified.
- [ ] `R  old -> new` records the new path, not the whole arrow expression.
- [ ] Untracked `??` entries remain in `untracked`.
- [ ] The returned object is unchanged for existing clean and modified cases.

## Test plan

- Extend `packages/cli/src/commands/git-status.test.ts` with porcelain fixtures
  for `MM file`, `R  old -> new`, ` M file`, `A  file`, and `?? file`.

## Documentation

- Update the `devkit git status` entry in `docs/commands.md` if it describes
  the returned fields.

## Result

The porcelain parser now reads the index and worktree columns separately: `A`,
`M`, `D` and `R` in the first column count as staged, while `M` and `D` in the
second column count as modified, so `MM` appears in both lists. Rename entries
are reported under the new path. Added fixtures for `MM`, `R`, ` M`, `A` and
`??` in `git-status.test.ts` and described the behaviour in `docs/commands.md`.
