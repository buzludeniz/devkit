import { describe, expect, it } from "vitest";
import { runNightlyE2E } from "./test-nightly-e2e.js";

describe("nightly end-to-end", () => {
  it("produces at least ten independent commits on every run", async () => {
    const result = await runNightlyE2E();

    expect(result.runs).toHaveLength(2);

    for (const [index, nightlyRun] of result.runs.entries()) {
      expect(
        nightlyRun.results.filter((entry) => !entry.success),
        `failed tasks in run ${index + 1}`,
      ).toEqual([]);
      expect(nightlyRun.succeeded).toBeGreaterThanOrEqual(10);
      expect(nightlyRun.commits).toBeGreaterThanOrEqual(10);
    }
  }, 300_000);
});
