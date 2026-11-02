---
id: 005
slug: generate-force
status: ready
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
