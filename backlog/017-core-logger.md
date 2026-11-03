---
id: 017
slug: core-logger
status: ready
area: packages/core
---

# Add structured logger and color helper to `@devkit/core`

## Context

CLI commands currently print directly via `console.log` with inconsistent prefixes and formatting. A centralized lightweight logger ensures consistent prefixes and supports disabling ANSI colors.

## Acceptance criteria

- [ ] Export `logger` with `.info()`, `.success()`, `.warn()`, `.error()`, and `.debug()`.
- [ ] Automatically disables colors when `NO_COLOR` is set or stdout is not a TTY.
- [ ] Supports log level filtering via `DEVKIT_LOG_LEVEL` (`debug` | `info` | `warn` | `error`).
- [ ] Adds formatted prefixes (`[info]`, `[ok]`, `[warn]`, `[fail]`).

## Test plan

- Add `packages/core/src/logger.test.ts` testing level filtering, prefix formatting, and `NO_COLOR` handling.

## Documentation

- Add `@devkit/core` logger documentation to `README.md`.
