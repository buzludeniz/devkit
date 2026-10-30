import { describe, expect, it } from "vitest";
import { runNightlyTasks } from "./runner.js";
import type { NightlyTask, TaskResult } from "./task-base.js";

function makeTask(name: string, succeeds: boolean): NightlyTask {
	return {
		name,
		description: `${name} description`,
		async run(): Promise<TaskResult> {
			return {
				name,
				success: succeeds,
				message: succeeds ? "ok" : "boom",
				durationMs: 1,
			};
		},
	};
}

describe("runNightlyTasks", () => {
	it("runs every task even when one fails", async () => {
		const summary = await runNightlyTasks([
			makeTask("one", true),
			makeTask("two", false),
			makeTask("three", true),
		]);

		expect(summary.succeeded).toBe(2);
		expect(summary.failed).toBe(1);
		expect(summary.results.map((result) => result.name)).toEqual([
			"one",
			"two",
			"three",
		]);
	});

	it("returns zero counts for an empty task list", async () => {
		const summary = await runNightlyTasks([]);

		expect(summary.succeeded).toBe(0);
		expect(summary.failed).toBe(0);
		expect(summary.results).toEqual([]);
	});
});
