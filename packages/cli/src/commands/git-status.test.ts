import { beforeEach, describe, expect, it, vi } from "vitest";
import { getGitStatus } from "./git-status";

const { execFileAsyncMock } = vi.hoisted(() => ({
	execFileAsyncMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
	execFile: vi.fn(),
}));

vi.mock("node:util", () => ({
	promisify: () => execFileAsyncMock,
}));

describe("getGitStatus", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reports clean status when porcelain output is empty", async () => {
		execFileAsyncMock
			.mockResolvedValueOnce({ stdout: "main\n", stderr: "" })
			.mockResolvedValueOnce({ stdout: "", stderr: "" });

		const status = await getGitStatus("/repo");

		expect(status.clean).toBe(true);
		expect(status.branch).toBe("main");
		expect(status.staged).toEqual([]);
		expect(status.modified).toEqual([]);
		expect(status.untracked).toEqual([]);
	});

	it("parses staged, modified, and untracked files", async () => {
		execFileAsyncMock
			.mockResolvedValueOnce({ stdout: "feature/x\n", stderr: "" })
			.mockResolvedValueOnce({
				stdout: "A  added.ts\n M modified.ts\n?? new.ts\n",
				stderr: "",
			});

		const status = await getGitStatus("/repo");

		expect(status.clean).toBe(false);
		expect(status.branch).toBe("feature/x");
		expect(status.staged).toEqual(["added.ts"]);
		expect(status.modified).toEqual(["modified.ts"]);
		expect(status.untracked).toEqual(["new.ts"]);
	});
});
