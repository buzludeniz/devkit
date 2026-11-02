---
id: 009
slug: template-list
status: ready
area: packages/cli
---

# Add `devkit template list`

## Context

Templates ship inside the CLI but users can only discover them from the README.

## Acceptance criteria

- [ ] `devkit template list` prints each template name and description, read
      from the template JSON files.
- [ ] `--json` prints `[{ name, description }]` and nothing else.
- [ ] Unknown template files are skipped instead of crashing.
- [ ] The command is registered in `commander.ts` and covered by tests.

## Test plan

- Add `packages/cli/src/commands/template.test.ts`: lists `node-app` and
  `react-app`, JSON parses, malformed template is skipped.

## Documentation

- Add the command to `docs/commands.md`.
