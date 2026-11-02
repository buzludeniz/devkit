---
id: 001
slug: init-force
status: done
area: packages/cli
---

# Guard `devkit init` against overwriting an existing project

## Context

`initCommand` writes template files into the target directory without checking
what is already there. Running it twice silently replaces `package.json`.

## Acceptance criteria

- [ ] When the target already contains `package.json` and `--force` is absent,
      the command exits nonzero and names the conflicting file.
- [ ] Nothing is written when the guard rejects the run.
- [ ] `-f, --force` overwrites and exits zero.
- [ ] The help text documents `-f, --force`.

## Test plan

- Add `packages/cli/src/commands/init.test.ts` with temporary directories:
  existing file without force, existing file with force, empty directory.

## Documentation

- Update the `devkit init` entry in `docs/commands.md` with `--force`.

## Result

`devkit init` now checks for an existing `package.json` before writing and exits
non-zero with the conflicting path unless `-f, --force` is passed. The check
runs before any file is written, so a rejected run leaves the target untouched.
Added `init.test.ts` covering the guarded, forced and empty-directory paths, and
documented `--force` in `docs/commands.md`.
