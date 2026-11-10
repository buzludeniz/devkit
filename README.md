# DevKit

A developer productivity CLI, and a working example of a repository that maintains itself.

Every night a scheduled agent picks items from the repository's own backlog, implements each one
test-first, verifies the result, and opens a pull request. A run that cannot produce its target number
of verified work commits fails on purpose, so silence is never mistaken for success. A separate report
pipeline runs ten maintenance tasks that each inspect the repository and commit a report.

## What it does

`devkit` ships two packages:

| Package | Purpose |
| --- | --- |
| `@buzludeniz/devkit-core` | Shared types, errors, `Result<T, E>` helpers and configuration loaders |
| `@buzludeniz/devkit-cli` | The `devkit` command line interface |

### Using `@buzludeniz/devkit-core`

```typescript
import { ok, err, unwrap, loadDevKitConfig, type Result } from "@buzludeniz/devkit-core";

// Typed result handling without exceptions
const res: Result<string> = ok("success");
const value = unwrap(res); // "success"

// Load project configuration (finds devkit.config.json or falls back to package.json)
const config = loadDevKitConfig();
```

Commands cover the small jobs that otherwise get a shell alias and a README paragraph:

```bash
devkit init --name my-app --template node-app  # scaffold a project
devkit template list                           # list built-in templates
devkit doctor                                  # verify toolchain and repository health
devkit git status                          # parsed repository state
devkit analyze ./src/index.ts              # decision-point complexity
devkit api:test https://example.com/health # HTTP health check
devkit env:load .env --required API_URL --mask   # validate and mask environment files
devkit docs:generate                       # collect JSDoc exports into Markdown
devkit release:changelog                   # changelog from conventional commits
devkit plugin:load ./plugin.mjs --run      # load an external plugin
```

## Install

```bash
npm install --global @buzludeniz/devkit-cli
```

The package is published under the `@buzludeniz` scope (the `@devkit` npm scope belongs to an
unrelated project). Until the first release is published, run it from source.

Or run it from source:

```bash
pnpm install
pnpm build
node packages/cli/dist/index.js --help
```

## The nightly agent

A Windows scheduled task named **DevKit Nightly Agent** runs at 02:00 every day. It runs an isolated
loop against a backlog of real engineering work, implementing `-Target` scoped items per night (default 2):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/nightly-agent.ps1 -Target 2
```

Each run does the following:

1. Stashes any uncommitted changes (`nightly-autostash-*`), fast-forwards `main`, and creates
   `nightly/agent-YYYY-MM-DD`.
2. Gathers codebase diagnostics (`scripts/gather-backlog-context.ts`) and plans items when ready count is low.
3. Implements `-Target` items in an isolated per-item loop. Every item starts with a failing test, then source,
   then documentation, and ends with one conventional commit tagged `(backlog NNN)`. Failed items roll back
   cleanly without leaving dirty trees.
4. Runs `scripts/nightly-verify.ts`, which rejects docs-only commits: a counted commit must touch
   non-test source under `packages/*/src` or `scripts/` **and** a `*.test.ts` file.
5. Runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`; any failure stops the run.
6. Pushes the branch and opens or updates a pull request with the verified commits. Nothing lands on
   `main` without review.

A run that cannot produce `-Target` verified work commits fails before pushing anything. The previous
commit count is never padded with reports or formatting.

The report generator still exists for manual use. `.github/workflows/nightly-maintenance.yml` is
manual-only and refreshes the architecture, metrics, and inventory documents in one PR.

Setup and troubleshooting for the scheduled task are in [docs/nightly-agent.md](docs/nightly-agent.md).

Run the report pipeline against a throwaway copy of the repository:

```bash
pnpm exec tsx scripts/test-nightly-e2e.ts
```

The end-to-end check copies the repository to a temporary directory, seeds one commit, runs the
report pipeline twice, and asserts each run produces at least ten commits. It never touches your
working tree.

## Repository layout

```
packages/
  core/          shared types and errors
  cli/           command implementations and templates
scripts/
  nightly-agent.ps1     scheduled orchestrator
  nightly-verify.ts     rejects docs-only work commits
  run-nightly.ts        report pipeline entry point
  nightly-tasks/        task base classes, runner and the ten report tasks
  test-nightly-e2e.ts   isolated end-to-end verification
backlog/                ready and done work items
.nightly/               agent and planner prompts, run logs
docs/                   VitePress site and generated reports
```

## Development

Requires Node 22 or newer and pnpm 9.

```bash
pnpm install
pnpm lint        # Biome
pnpm typecheck   # tsc across packages and scripts
pnpm test        # core, CLI and script suites
pnpm build
pnpm docs:dev    # local documentation site
```

Tests use Vitest. Commands and their helpers are written test-first, and command helpers keep
their tests beside them.

## Releasing

Versions are managed with Changesets. Add a changeset with `pnpm changeset`, merge it, and the release
workflow opens a version pull request. Merging that pull request publishes to npm and creates a
GitHub release.

## License

MIT
