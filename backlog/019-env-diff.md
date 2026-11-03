---
id: 019
slug: env-diff
status: ready
area: packages/cli
---

# Add `devkit env:diff` command

## Context

Teams frequently drift their local `.env` files from `.env.example`, leading to runtime errors caused by missing environment keys.

## Acceptance criteria

- [ ] `devkit env:diff <source> <target>` compares key sets between two env files.
- [ ] Defaults to comparing `.env` against `.env.example` if no arguments are provided.
- [ ] Reports missing keys in target, extra keys in target, and mismatched comment notes.
- [ ] Exits non-zero if required keys from source are missing in target.
- [ ] Supports `--json` machine-readable output.

## Test plan

- Add `packages/cli/src/commands/env-diff.test.ts` covering missing keys, extra keys, identical files, and missing file error cases.

## Documentation

- Add `devkit env:diff` section to `docs/commands.md` and `README.md`.
