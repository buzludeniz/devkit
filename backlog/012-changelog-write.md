---
id: 012
slug: changelog-write
status: ready
area: packages/cli
---

# Add `release:changelog --write`

## Context

`release:changelog` prints Markdown but cannot update the repository file, so
every release needs manual copying.

## Acceptance criteria

- [ ] Without `--write`, output is unchanged.
- [ ] `--write` prepends the generated section to `CHANGELOG.md` under
      `## <version> - <YYYY-MM-DD>` using the `--version` value.
- [ ] When that heading already exists, the command exits 1 and leaves the file
      untouched.
- [ ] `--output <file>` selects a different changelog path.
- [ ] A missing file is created with a `# Changelog` heading first.

## Test plan

- Extend `packages/cli/src/commands/release.test.ts` with a temp changelog:
  create, prepend, duplicate heading, custom output path.

## Documentation

- Add `--write` and `--output` to the `release:changelog` entry in
  `docs/commands.md`.
