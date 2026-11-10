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
- [x] `devkit docs:generate --dry-run` logs all files that would be created or modified without touching the disk.
- [x] Exits zero when dry-run succeeds.

## Test plan

- Add tests in `packages/cli/src/commands/release.test.ts` and `docs.test.ts` verifying file modification timestamps and contents remain untouched with `--dry-run`.

## Documentation

- Document `--dry-run` options in `docs/commands.md`.

## Progress

Status stays `ready` because the first criterion depends on
`release:changelog --write`, which does not exist yet (backlog 012).

- `devkit docs:generate --dry-run` logs `Would create`, `Would modify` or
  `Unchanged` for the output file, with the export count, and writes nothing
  (no file, no directory).
- `devkit release:changelog --output <file> --dry-run` prints a line diff
  between the current file and the changelog it would write, then
  `Dry run: <file> was not written`. The file is not created or modified.
  `--output` is the command's only write path today. Without `--output`,
  `--dry-run` changes nothing.
- Both exit 0.

Remaining: when backlog 012 adds `--write`, it should use the same preview
(`renderFileDiff` in `packages/cli/src/commands/file-diff.ts`) for
`--write --dry-run`. Then this item can be marked `done`.

Tests: `release.test.ts` (diff output, contents and mtime unchanged, missing file
not created, normal write still works, no-op without `--output`),
`docs.test.ts` (create/modify/unchanged messages, contents and mtime unchanged,
no directory created, normal write still works) and `file-diff.test.ts`.
