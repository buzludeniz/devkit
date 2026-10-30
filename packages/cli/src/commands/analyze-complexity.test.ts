import { promises as fs } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeComplexity } from "./analyze-complexity";

const { readFileMock } = vi.hoisted(() => ({ readFileMock: vi.fn() }));

vi.mock("node:fs", () => ({
	promises: {
		readFile: readFileMock,
	},
}));

describe("analyzeComplexity", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("scores a simple function with one decision point", async () => {
		readFileMock.mockResolvedValue(
			[
				"export function add(a: number, b: number) {",
				"  if (a < 0) return 0;",
				"  return a + b;",
				"}",
			].join("\n"),
		);

		const result = await analyzeComplexity("simple.ts");

		expect(result.file).toBe("simple.ts");
		expect(result.lines).toBe(4);
		expect(result.decisionPoints).toBe(1);
		expect(result.score).toBe(2);
	});

	it("counts loops, logical operators, and ternaries", async () => {
		readFileMock.mockResolvedValue(
			[
				"for (let i = 0; i < 10; i++) {",
				"  while (i > 5 && i < 8) {",
				"    const x = i > 6 || i === 2 ? 1 : 2;",
				"  }",
				"}",
			].join("\n"),
		);

		const result = await analyzeComplexity("complex.ts");

		// for + while + && + || + ternary = 5 decision points
		expect(result.decisionPoints).toBe(5);
		expect(result.score).toBe(6);
	});

	it("propagates read errors", async () => {
		readFileMock.mockRejectedValue(new Error("ENOENT: no such file"));

		await expect(analyzeComplexity("missing.ts")).rejects.toThrow("ENOENT");
	});

	it("imports the fs promise API", () => {
		expect(typeof fs.readFile).toBe("function");
	});
});
