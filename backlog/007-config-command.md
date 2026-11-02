---
id: 007
slug: config-command
status: ready
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
