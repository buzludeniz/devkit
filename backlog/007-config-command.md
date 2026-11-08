---
id: 007
slug: config-command
status: done
area: packages/cli
---

# Add `devkit config` for `.devkitrc.json`

## Context

Repeated flags such as the default template and output directory have nowhere
to live. A small project config file fixes that.

## Acceptance criteria

- [ ] `devkit config list` prints the current settings, including defaults.
- [ ] `devkit config get <key>` prints one value; an unknown key exits 1.
- [ ] `devkit config set <key> <value>` writes `.devkitrc.json` in the current
      directory and creates the file when missing.
- [ ] Allowed keys: `template` (non-empty string), `outputDir` (non-empty
      string), `color` (`true` or `false`).
- [ ] Invalid keys or values exit 1 and leave the file unchanged.

## Test plan

- Add `packages/cli/src/commands/config.test.ts` in a temp directory: list
  defaults, set/get round trip, create file, unknown key, invalid boolean.

## Documentation

- Add a `devkit config` section to `docs/commands.md`.

## Result

`devkit config` now reads and writes `.devkitrc.json` through `list`, `get` and
`set` subcommands. `list` merges the file over the defaults (`template`:
`node-app`, `outputDir`: `.`, `color`: `true`), `get` prints a single value, and
`set` creates or updates the file with a stable two-space JSON layout. Unknown
keys and invalid values (an empty string for `template` or `outputDir`, or a
non-boolean `color`) print an error, exit 1 and leave the file untouched. The
command is registered in `createProgram()` and documented in `docs/commands.md`.

Tests in `packages/cli/src/commands/config.test.ts` cover listing defaults,
merging file values, the set/get round trip, file creation, unknown keys and
invalid values.

