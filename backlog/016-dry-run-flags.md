---
id: 016
slug: dry-run-flags
status: ready
area: packages/cli
---

# Add `--dry-run` to `release:changelog` and `docs:generate`

## Context

Commands that write or modify files on disk should support `--dry-run` so users and CI workflows can preview changes before persisting them.

## Acceptance criteria

- [ ] `devkit release:changelog --write --dry-run` outputs the planned diff without modifying `CHANGELOG.md`.
- [ ] `devkit docs:generate --dry-run` logs all files that would be created or modified without touching the disk.
- [ ] Exits zero when dry-run succeeds.

## Test plan

- Add tests in `packages/cli/src/commands/release.test.ts` and `docs.test.ts` verifying file modification timestamps and contents remain untouched with `--dry-run`.

## Documentation

- Document `--dry-run` options in `docs/commands.md`.
