import { describe, expect, it } from "vitest";
import { runNightlyE2E } from "./test-nightly-e2e.js";

describe("nightly end-to-end", () => {
	it("produces at least ten independent commits in a clean repository", async () => {
		const result = await runNightlyE2E();

		expect(
			result.results.filter((entry) => !entry.success),
			"failed tasks",
		).toEqual([]);
		expect(result.succeeded).toBeGreaterThanOrEqual(10);
		expect(result.commits).toBeGreaterThanOrEqual(10);
	}, 180_000);
});
