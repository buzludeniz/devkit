---
id: 014
slug: core-git-runner
status: ready
area: packages/core
---

# Add typed git runner to `@buzludeniz/devkit-core`

## Context

CLI commands and nightly scripts run raw child process git commands and duplicate stdout/stderr error checking. A typed git runner in core eliminates duplicate logic and leverages the `Result` type.

## Acceptance criteria

- [ ] Export `runGit(args: string[], cwd?: string): Promise<Result<string, CoreError>>` from `@buzludeniz/devkit-core`.
- [ ] Returns `ok(stdout.trim())` on exit code 0.
- [ ] Returns `err(new CoreError(stderr.trim(), "GIT_ERROR"))` on non-zero exits without throwing uncaught exceptions.
- [ ] Allows custom timeout option with abort signal support.

## Test plan

- Add `packages/core/src/git.test.ts` covering successful commands, non-zero exit failures, and timeout cancellations.

## Documentation

- Document `runGit` in the `@buzludeniz/devkit-core` section of `README.md`.
