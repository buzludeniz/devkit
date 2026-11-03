import type { CoreError } from "./index.js";

export type Result<T, E = CoreError> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T, E = never>(value: T): Result<T, E> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function unwrap<T>(result: Result<T, unknown>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}
