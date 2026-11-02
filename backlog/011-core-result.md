---
id: 011
slug: core-result
status: ready
area: packages/core
---

# Add `Result` helpers to `@devkit/core`

## Context

Commands return ad-hoc success and error shapes. A small typed result makes
failure explicit without exceptions.

## Acceptance criteria

- [ ] Export `type Result<T, E = CoreError> = { ok: true; value: T } |
      { ok: false; error: E }`.
- [ ] Export `ok<T>(value: T): Result<T>` and
      `err<E>(error: E): Result<never, E>`.
- [ ] Export `unwrap<T>(result: Result<T>): T` that returns the value or throws
      the contained error.
- [ ] Types are inferred correctly in tests; no `any` appears in the public API.

## Test plan

- Add `packages/core/src/result.test.ts`: ok unwrap, err unwrap throws the same
  error instance, and type narrowing via `if (result.ok)`.

## Documentation

- Add a short `Result` example to the `@devkit/core` section of `README.md`.
