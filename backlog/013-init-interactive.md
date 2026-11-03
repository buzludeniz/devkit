---
id: 013
slug: init-interactive
status: ready
area: packages/cli
---

# Add interactive prompts to `devkit init`

## Context

Running `devkit init` without `--name` or `--template` in an interactive terminal should prompt the user instead of immediately throwing an error.

## Acceptance criteria

- [ ] When `--name` is omitted and stdin is a TTY, prompt for project name (defaults to current folder name).
- [ ] When `--template` is omitted and stdin is a TTY, prompt user to select from available templates.
- [ ] Non-interactive environments (CI or redirected stdin) retain the existing behaviour (require `--name` and `--template`).
- [ ] `--non-interactive` flag bypasses all prompts and fails fast if required arguments are missing.

## Test plan

- Add tests in `packages/cli/src/commands/init.test.ts` with mocked prompt inputs and non-interactive flags.

## Documentation

- Update `devkit init` section in `docs/commands.md` and `README.md`.
