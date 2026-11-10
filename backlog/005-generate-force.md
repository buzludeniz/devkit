---
id: 005
slug: generate-force
status: done
area: packages/cli
---

# Add an overwrite guard to `generateProject`

## Context

`generateProject` writes template files unconditionally, so library callers
cannot tell whether they are replacing an existing project.

## Acceptance criteria

- [x] `generateProject(template, targetDir)` throws `CoreError` with code
      `EEXIST` when `<targetDir>/package.json` already exists.
- [x] `generateProject(template, targetDir, { force: true })` overwrites it.
- [x] No partial files are written when the guard throws.
- [x] The default stays non-destructive.

## Test plan

- Extend `packages/cli/src/commands/generate.test.ts`: existing package.json
  without force, with force, and a fresh directory.

## Documentation

- Add a JSDoc note on the new option in `generate.ts`.

## Result

`generateProject` now checks for `<targetDir>/package.json` before creating the
directory or writing files. Without `force: true` it throws a `CoreError` with
code `EEXIST` and performs no writes; `force: true` overwrites as before. The
`devkit init` command forwards its `--force` flag to the new option, and the
JSDoc on `GenerateOptions.force` documents the behaviour for library callers.
Covered by tests for the guard, the no-partial-writes guarantee, and forced
overwrite. `@buzludeniz/devkit-core` also gained a `prepare` build so a clean `pnpm install`
exposes its entry point to the CLI's typecheck and test runs.
