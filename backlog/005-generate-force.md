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

- [ ] `generateProject(template, targetDir)` throws `CoreError` with code
      `EEXIST` when `<targetDir>/package.json` already exists.
- [ ] `generateProject(template, targetDir, { force: true })` overwrites it.
- [ ] No partial files are written when the guard throws.
- [ ] The default stays non-destructive.

## Test plan

- Extend `packages/cli/src/commands/generate.test.ts`: existing package.json
  without force, with force, and a fresh directory.

## Documentation

- Add a JSDoc note on the new option in `generate.ts`.

## Result

`generateProject` now accepts an optional `force` flag, documented in its JSDoc
and defaulting to `false`. Before creating directories or writing files it checks
`<targetDir>/package.json`; when the file exists without `force`, it throws a
`CoreError` with code `EEXIST` and leaves the target untouched. `force: true`
keeps the overwrite path working, and `devkit init` forwards its `--force` flag
to the guard.

Tests cover the guarded, forced and fresh-directory paths. `@devkit/core` gained
a `prepare` build so a clean `pnpm install` exposes its entry point to the CLI's
typecheck and test runs.
