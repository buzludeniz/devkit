import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBranches } from "./git-branch";

const { execFileAsyncMock } = vi.hoisted(() => ({
	execFileAsyncMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
	execFile: vi.fn(),
}));

vi.mock("node:util", () => ({
	promisify: () => execFileAsyncMock,
}));

describe("getBranches", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns current branch and all branches", async () => {
		execFileAsyncMock
			.mockResolvedValueOnce({ stdout: "main\n", stderr: "" })
			.mockResolvedValueOnce({
				stdout: "main\nfeature/x\nrelease/1.0\n",
				stderr: "",
			});

		const info = await getBranches("/repo");

		expect(info.current).toBe("main");
		expect(info.all).toEqual(["main", "feature/x", "release/1.0"]);
	});
});
