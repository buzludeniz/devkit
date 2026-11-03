import { describe, expect, it } from "vitest";
import { CoreError } from "./index.js";
import { type Result, err, ok, unwrap } from "./result.js";

describe("Result", () => {
  it("unwraps a successful ok result", () => {
    const success: Result<string> = ok("devkit");
    expect(unwrap(success)).toBe("devkit");
  });

  it("throws the contained error on err unwrap", () => {
    const customError = new CoreError("failed to process", "PROCESS_FAIL");
    const failure: Result<string, CoreError> = err(customError);

    expect(() => unwrap(failure)).toThrow(customError);
  });

  it("narrows type via result.ok guard", () => {
    function compute(value: number): Result<number, string> {
      if (value > 0) {
        return ok(value * 2);
      }
      return err("negative or zero");
    }

    const r = compute(5);
    if (r.ok) {
      expect(r.value).toBe(10);
    } else {
      throw new Error("Should not reach here");
    }

    const bad = compute(-1);
    if (!bad.ok) {
      expect(bad.error).toBe("negative or zero");
    } else {
      throw new Error("Should not reach here");
    }
  });
});
