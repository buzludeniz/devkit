---
id: 021
slug: core-env
status: ready
area: packages/core
---

# Add dotenv parser and masking serializer to `@buzludeniz/devkit-core`

## Context

Dotenv parsing logic is currently embedded in CLI commands. Moving it to `@buzludeniz/devkit-core` allows plugins and CLI commands to share robust parsing, comments handling, and secret masking.

## Acceptance criteria

- [ ] Export `parseDotenv(content: string): Record<string, string>` handling comments, multiline values, and quoted strings.
- [ ] Export `maskSecrets(vars: Record<string, string>, keysToMask: string[]): Record<string, string>`.
- [ ] Export `serializeDotenv(vars: Record<string, string>): string`.
- [ ] Returns typed `Result` objects for error cases.

## Test plan

- Add `packages/core/src/env.test.ts` covering quotes, comments, escapes, empty lines, and masking.

## Documentation

- Document env helpers in the `@buzludeniz/devkit-core` section of `README.md`.
