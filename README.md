# DevKit

A developer productivity CLI, and a working example of a repository that maintains itself.

Every night a scheduled workflow runs ten independent maintenance tasks. Each task inspects the
repository, writes a report, and commits the result. A run that produces fewer than ten commits
fails on purpose, so silence is never mistaken for success.

## What it does

`devkit` ships two packages:

| Package | Purpose |
| --- | --- |
| `@devkit/core` | Shared types, errors, `Result<T, E>` helpers and configuration loaders |
| `@devkit/cli` | The `devkit` command line interface |

### Using `@devkit/core`

```typescript
import { ok, err, unwrap, loadDevKitConfig, type Result } from "@devkit/core";

// Typed result handling without exceptions
const res: Result<string> = ok("success");
const value = unwrap(res); // "success"

// Load project configuration (finds devkit.config.json or falls back to package.json)
const config = loadDevKitConfig();
```

Commands cover the small jobs that otherwise get a shell alias and a README paragraph:

```bash
devkit init --name my-app --template node-app  # scaffold a project
devkit git status                          # parsed repository state
devkit analyze ./src/index.ts              # decision-point complexity
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

## The nightly agent

A Windows scheduled task named **DevKit Nightly Agent** runs at 02:00 every day. It starts a headless
OpenCode session against a backlog of real engineering work:

```powershell
opencode run --standalone --auto --model opencode/deepseek-v4.1-flash-free `
  --file .nightly/AGENT_PROMPT.md "Execute the nightly work order."
```

Each run does the following:

1. Refuses to start on a dirty tree, fast-forwards `main`, and creates `nightly/agent-YYYY-MM-DD`.
2. Plans more backlog items when fewer than ten are ready.
3. Implements ten items. Every item starts with a failing test, then source, then the documentation
   the change needs, and ends with one conventional commit tagged `(backlog NNN)`.
4. Runs `scripts/nightly-verify.ts`, which rejects docs-only commits: a counted commit must touch
   non-test source under `packages/*/src` or `scripts/` **and** a `*.test.ts` file.
5. Runs `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
6. Pushes the branch and opens or updates a pull request with the ten commits. Nothing lands on
   `main` without review.

A run that cannot produce ten verified work commits fails before pushing anything. The previous
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
backlog/                ready, in-progress and done work items
.nightly/               agent and planner prompts, run logs
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
