# Getting started

DevKit is a developer productivity CLI. It bundles the small checks you run by
hand at the start and end of a working session: project scaffolding, git state,
complexity hotspots, endpoint smoke tests, environment parsing, documentation
generation and changelog drafting.

## Requirements

- Node.js 22 or newer
- pnpm 9

## Install from source

```bash
git clone https://github.com/buzludeniz/devkit.git
cd devkit
pnpm install
pnpm build
```

Link the CLI globally while developing:

```bash
pnpm --filter @buzludeniz/devkit-cli link --global
devkit --help
```

## First commands

```bash
devkit hello
devkit version
devkit init my-service --template node-app
devkit git status
devkit analyze src
```

## Repository layout

```
packages/core   Shared types, errors and configuration contracts
packages/cli    Command implementations and the devkit binary
scripts         Nightly maintenance tasks and the task runner
docs            Documentation site and generated reports
```

## Nightly automation

The `nightly-maintenance` workflow runs at 02:00 UTC every day. It executes ten
independent tasks, each of which refreshes one report and records a dated row in
`docs/metrics/history/`. The workflow opens a pull request against `main` with
the generated commits; it fails when fewer than ten commits are produced.

Run the same tasks locally:

```bash
pnpm nightly:maintenance
```

Each task is independent. A failure in one does not stop the others, but the
run exits non-zero when fewer than ten tasks succeed.
