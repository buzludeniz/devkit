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

- [x] `devkit config list` prints the current settings, including defaults.
- [x] `devkit config get <key>` prints one value; an unknown key exits 1.
- [x] `devkit config set <key> <value>` writes `.devkitrc.json` in the current
      directory and creates the file when missing.
- [x] Allowed keys: `template` (non-empty string), `outputDir` (non-empty
      string), `color` (`true` or `false`).
- [x] Invalid keys or values exit 1 and leave the file unchanged.

## Test plan

- Add `packages/cli/src/commands/config.test.ts` in a temp directory: list
  defaults, set/get round trip, create file, unknown key, invalid boolean.

## Documentation

- Add a `devkit config` section to `docs/commands.md`.

## Result

Added the `config.ts` command module and registered it in `createProgram()`.
`list` merges `.devkitrc.json` over defaults (`template=node-app`,
`outputDir=.`, `color=true`), `get` prints one value, and `set` validates the
key and value before writing the file, creating it when missing. Invalid input
exits 1 without touching the file. Six tests cover defaults, round-trip,
file creation, unknown keys, an invalid boolean and an empty string.
Documented in `docs/commands.md`.
