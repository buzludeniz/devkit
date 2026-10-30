import { describe, expect, it } from "vitest";
import { BaseTask } from "./task-base.js";

class StubTask extends BaseTask {
	readonly name = "stub";
	readonly description = "A stub task";

	constructor(private readonly behaviour: () => Promise<string>) {
		super();
	}

	protected execute(): Promise<string> {
		return this.behaviour();
	}
}

describe("BaseTask", () => {
	it("marks a task that returns as successful", async () => {
		const task = new StubTask(async () => "changed package.json");
		const result = await task.run();

		expect(result.success).toBe(true);
		expect(result.name).toBe("stub");
		expect(result.message).toBe("changed package.json");
		expect(result.durationMs).toBeGreaterThanOrEqual(0);
	});

	it("marks a task that throws as failed and keeps the error message", async () => {
		const task = new StubTask(async () => {
			throw new Error("network unavailable");
		});
		const result = await task.run();

		expect(result.success).toBe(false);
		expect(result.message).toBe("network unavailable");
	});

	it("stringifies non-Error failures", async () => {
		const task = new StubTask(async () => {
			throw "plain string";
		});
		const result = await task.run();

		expect(result.success).toBe(false);
		expect(result.message).toBe("plain string");
	});
});
