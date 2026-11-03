---
id: 006
slug: doctor-command
status: done
area: packages/cli
---

# Add `devkit doctor`

## Context

Users hit setup problems with no way to diagnose them. `devkit doctor` should
check the local toolchain and the current repository.

## Acceptance criteria

- [x] Checks Node.js >= 20, `pnpm` on PATH, `git` on PATH, and whether the
      working directory is inside a git repository.
- [x] Prints one line per check with `ok` or `fail` and the detected version.
- [x] `--json` prints `{ checks: [{ name, ok, detail }] }` and nothing else.
- [x] Exits 1 when any check fails, 0 otherwise.
- [x] Command runners are injectable so tests do not depend on the host.

## Test plan

- Add `packages/cli/src/commands/doctor.test.ts`: all pass, old Node, missing
  pnpm, outside a git repository, and JSON shape.

## Documentation

- Add the command to `docs/commands.md` and the command table in `README.md`.

## Result

Implemented `devkit doctor` command in `packages/cli/src/commands/doctor.ts` with injectable runners.
Checks Node.js (>= 20), pnpm, git, and git worktree status. Added `--json` output support and exit code 1
on failure. Added comprehensive unit tests in `doctor.test.ts`, updated `commander.ts`, `docs/commands.md`,
and `README.md`.
