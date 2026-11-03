---
id: 020
slug: env-validate
status: ready
area: packages/cli
---

# Add `devkit env:validate` schema enforcement

## Context

Missing or malformed environment values (such as an invalid URL or non-numeric port) cause production crashes. `devkit env:validate` enforces type and format rules.

## Acceptance criteria

- [ ] `devkit env:validate [file]` validates values against `.env.schema.json` if present.
- [ ] Supports schema rules: `required` (boolean), `type` (`string` | `number` | `boolean` | `url`), and `pattern` (regex string).
- [ ] Reports each failed key with specific violation detail.
- [ ] Exits 1 on validation error, 0 when valid.
- [ ] Supports `--json` output format.

## Test plan

- Add `packages/cli/src/commands/env-validate.test.ts` with valid schemas, type mismatches, and regex violations.

## Documentation

- Add `devkit env:validate` entry to `docs/commands.md`.
