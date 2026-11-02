---
id: 001
slug: init-force
status: ready
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
