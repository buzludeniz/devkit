---
id: 009
slug: template-list
status: done
area: packages/cli
---

# Add `devkit template list`

## Context

Templates ship inside the CLI but users can only discover them from the README.

## Acceptance criteria

- [x] `devkit template list` prints each template name and description, read
      from the template JSON files.
- [x] `--json` prints `[{ name, description }]` and nothing else.
- [x] Unknown template files are skipped instead of crashing.
- [x] The command is registered in `commander.ts` and covered by tests.

## Test plan

- Add `packages/cli/src/commands/template.test.ts`: lists `node-app` and
  `react-app`, JSON parses, malformed template is skipped.

## Documentation

- Add the command to `docs/commands.md`.

## Result

`devkit template list` reads every `<name>.json` file in the CLI's templates
directory and prints the name and its `description` field in aligned columns,
sorted by name. `--json` prints only `[{ name, description }]`. Files that are
not JSON objects with a non-empty string `description`, or that are not `.json`
files, are skipped. The `react-app` template gained a `description`
("A new React application") so it can be listed. `templateCommand()` is
registered in `createProgram()` and documented in `docs/commands.md`.

Tests in `packages/cli/src/commands/template.test.ts` cover the built-in
`node-app` and `react-app` listing, the human output, the `--json` output, name
sorting, and skipping malformed, description-less, array, non-JSON and
directory entries. `commander.test.ts` checks the command is registered.
