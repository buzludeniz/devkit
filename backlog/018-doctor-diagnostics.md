---
id: 018
slug: doctor-diagnostics
status: ready
area: packages/cli
---

# Expand `devkit doctor` with port and disk diagnostics

## Context

`devkit doctor` currently checks Node, pnpm, git, and git worktree status. Common setup issues also include disk space depletion and port collisions (e.g. 3000, 8080).

## Acceptance criteria

- [ ] Add check for available disk space (warns if less than 1 GB free).
- [ ] Add check for development port availability (`3000` and `8080`), reporting if another process is currently bound to them.
- [ ] Output formatted cleanly under `devkit doctor` human view and included in `--json` payload.
- [ ] Checks are injectable so tests don't require actual port binding or specific disk capacity.

## Test plan

- Extend `packages/cli/src/commands/doctor.test.ts` with mock runners covering port conflicts and low disk space.

## Documentation

- Update `devkit doctor` entry in `docs/commands.md`.
