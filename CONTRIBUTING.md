# Contributing

## Setup

Node 20 or newer, pnpm 9.

```bash
pnpm install
pnpm build
pnpm test
```

## Workflow

1. Branch from `main`.
2. Write the test first, then the implementation.
3. Run the full check before opening a pull request:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

4. Add a changeset if the change affects a published package:

```bash
pnpm changeset
```

## Commit messages

Conventional Commits are enforced by review, not by a hook. The changelog generator reads these
prefixes, so a vague subject becomes a vague release note.

```
feat(cli): add plugin:load command
fix(nightly): keep history rows unique per day
docs: describe the nightly pipeline
```

Internal work (`chore`, `ci`, `test`, `style`) is excluded from generated changelogs unless it is
marked breaking.

## Code style

Biome owns formatting: tabs, double quotes, semicolons, organized imports. Run `pnpm lint` before
committing; it fixes most issues automatically. Do not hand-format around it.

## Tests

Each command module keeps its tests in a sibling `*.test.ts` file. Tests must not depend on network
access or on the state of the developer's working tree. Use temporary directories and local servers.

The nightly pipeline has its own end-to-end test:

```bash
pnpm exec tsx scripts/test-nightly-e2e.ts
```

## Nightly commits

The scheduled workflow commits generated reports directly. Do not edit files under `docs/project/`,
`docs/metrics/` or `docs/reference/api.md` by hand; the next run overwrites them. Change the
generator in `scripts/nightly-tasks/` instead.

## License

By contributing you agree that your work is released under the MIT license.
