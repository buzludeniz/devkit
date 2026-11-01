# DevKit

A developer productivity CLI, and a working example of a repository that maintains itself.

Every night a scheduled workflow runs ten independent maintenance tasks. Each task inspects the
repository, writes a report, and commits the result. A run that produces fewer than ten commits
fails on purpose, so silence is never mistaken for success.

## What it does

`devkit` ships two packages:

| Package | Purpose |
| --- | --- |
| `@devkit/core` | Shared types, errors and configuration helpers |
| `@devkit/cli` | The `devkit` command line interface |

Commands cover the small jobs that otherwise get a shell alias and a README paragraph:

```bash
devkit init my-app --template node-app     # scaffold a project
devkit git status                          # parsed repository state
devkit analyze ./src                       # decision-point complexity
devkit api:test https://example.com/health # HTTP health check
devkit env:load .env --required API_URL    # validate and mask environment files
devkit docs:generate                       # collect JSDoc exports into Markdown
devkit release:changelog --version 1.2.0   # changelog from conventional commits
devkit plugin:load ./plugin.mjs --run      # load an external plugin
```

## Install

```bash
npm install --global @devkit/cli
```

Or run it from source:

```bash
pnpm install
pnpm build
node packages/cli/dist/index.js --help
```

## The nightly pipeline

The workflow lives in `.github/workflows/nightly-maintenance.yml` and runs at 02:00 UTC. It executes
`pnpm nightly:maintenance`, which walks a registry of ten tasks:

| Task | Output |
| --- | --- |
| Project status | `docs/project/status.json` |
| Architecture overview | `docs/architecture.md` |
| Dependency inventory | `docs/security/dependencies.md` |
| Code size metrics | `docs/metrics/code-size.md` |
| Outstanding work report | `docs/project/todos.md` |
| Recent changes preview | `docs/changelog-preview.md` |
| Test inventory | `docs/metrics/tests.md` |
| Markdown link report | `docs/project/link-report.md` |
| Package metadata audit | manifests under `packages/*` |
| API reference | `docs/reference/api.md` |

Each task is isolated. A failure is recorded and the remaining tasks still run. Every task that
changes a file makes exactly one commit, and each run also appends a row to a per-task history CSV
under `docs/metrics/history/` so trends survive across nights.

The workflow pushes the result to a dated branch and opens a pull request. Nothing lands on `main`
without review. If fewer than ten tasks succeed, the job exits non-zero.

Two repository settings make this work: Actions must be allowed to create pull requests
(Settings → Actions → General), and publishing needs an `NPM_TOKEN` secret.

Run the same pipeline locally against a throwaway copy of the repository:

```bash
pnpm exec tsx scripts/test-nightly-e2e.ts
```

The end-to-end check copies the repository to a temporary directory, seeds one commit, runs all ten
tasks, and asserts at least ten commits were created. It never touches your working tree.

## Repository layout

```
packages/
  core/          shared types and errors
  cli/           command implementations and templates
scripts/
  run-nightly.ts        entry point for the scheduled run
  nightly-tasks/        task base classes, runner and the ten tasks
  test-nightly-e2e.ts   isolated end-to-end verification
docs/                   VitePress site and generated reports
```

## Development

Requires Node 20 or newer and pnpm 9.

```bash
pnpm install
pnpm lint        # Biome
pnpm typecheck   # tsc across packages and scripts
pnpm test        # core, CLI and script suites
pnpm build
pnpm docs:dev    # local documentation site
```

Tests use Vitest. Commands and their helpers are written test-first, and every command module keeps
its tests beside it.

## Releasing

Versions are managed with Changesets. Add a changeset with `pnpm changeset`, merge it, and the release
workflow opens a version pull request. Merging that pull request publishes to npm and creates a
GitHub release.

## License

MIT
