import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { extractDocEntries, generateDocs, renderDocs, writeDocs } from "./docs";

const created: string[] = [];

afterEach(async () => {
	await Promise.all(
		created
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

const SOURCE = [
	"/**",
	" * Adds two numbers.",
	" *",
	" * Keeps the implementation small.",
	" */",
	"export function add(a: number, b: number): number {",
	"  return a + b;",
	"}",
	"",
	"export const undocumented = 1;",
	"",
	"/** A documented type. */",
	"export type Pair = [number, number];",
].join("\n");

describe("extractDocEntries", () => {
	it("extracts only documented exports and cleans the comment", () => {
		const entries = extractDocEntries(SOURCE, "src/math.ts");

		expect(entries).toHaveLength(2);
		expect(entries[0]).toEqual({
			name: "add",
			kind: "function",
			description: "Adds two numbers. Keeps the implementation small.",
			file: "src/math.ts",
		});
		expect(entries[1].name).toBe("Pair");
		expect(entries[1].kind).toBe("type");
	});
});

describe("renderDocs", () => {
	it("groups entries by file", () => {
		const markdown = renderDocs(extractDocEntries(SOURCE, "src/math.ts"));

		expect(markdown).toContain("# Generated API documentation");
		expect(markdown).toContain("## src/math.ts");
		expect(markdown).toContain("### `add` (function)");
		expect(markdown).not.toContain("undocumented");
	});

	it("renders an explicit empty state", () => {
		expect(renderDocs([])).toContain("No documented exports were found.");
	});
});

describe("generateDocs", () => {
	it("scans nested source files and skips tests", async () => {
		const directory = await mkdtemp(join(tmpdir(), "devkit-docs-"));
		created.push(directory);
		await writeFile(join(directory, "index.ts"), SOURCE, "utf8");
		await writeFile(join(directory, "index.test.ts"), SOURCE, "utf8");

		const entries = await generateDocs(directory);

		expect(entries).toHaveLength(2);
		expect(entries.every((entry) => entry.file === "index.ts")).toBe(true);
	});

	it("writes the rendered page to the requested path", async () => {
		const directory = await mkdtemp(join(tmpdir(), "devkit-docs-"));
		created.push(directory);
		await writeFile(join(directory, "index.ts"), SOURCE, "utf8");
		const output = join(directory, "generated", "api.md");

		const count = await writeDocs(directory, output);

		expect(count).toBe(2);
		await expect(readFile(output, "utf8")).resolves.toContain(
			"### `add` (function)",
		);
	});
});
