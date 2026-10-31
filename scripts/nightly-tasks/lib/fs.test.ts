import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { upsertHistoryRow, writeIfChanged } from "./fs.js";

const created: string[] = [];

async function scratchDirectory(): Promise<string> {
	const directory = await mkdtemp(join(tmpdir(), "devkit-fs-"));
	created.push(directory);
	return directory;
}

afterEach(async () => {
	await Promise.all(
		created
			.splice(0)
			.map((directory) => rm(directory, { recursive: true, force: true })),
	);
});

describe("writeIfChanged", () => {
	it("writes a file and reports the change", async () => {
		const directory = await scratchDirectory();
		const file = join(directory, "report.md");

		await expect(writeIfChanged(file, "hello")).resolves.toBe(true);
		await expect(readFile(file, "utf8")).resolves.toBe("hello\n");
	});

	it("skips rewriting identical content", async () => {
		const directory = await scratchDirectory();
		const file = join(directory, "report.md");

		await writeIfChanged(file, "hello");
		await expect(writeIfChanged(file, "hello\n")).resolves.toBe(false);
	});
});

describe("upsertHistoryRow", () => {
	it("creates the file with a header and the first row", async () => {
		const directory = await scratchDirectory();
		const file = join(directory, "history", "status.csv");

		await expect(
			upsertHistoryRow(file, "date,bytes,lines", "2026-10-30", [10, 2]),
		).resolves.toBe(true);
		await expect(readFile(file, "utf8")).resolves.toBe(
			"date,bytes,lines\n2026-10-30,10,2\n",
		);
	});

	it("appends a row for a new date", async () => {
		const directory = await scratchDirectory();
		const file = join(directory, "history.csv");

		await upsertHistoryRow(file, "date,bytes", "2026-10-29", [10]);
		await upsertHistoryRow(file, "date,bytes", "2026-10-30", [12]);

		await expect(readFile(file, "utf8")).resolves.toBe(
			"date,bytes\n2026-10-29,10\n2026-10-30,12\n",
		);
	});

	it("replaces the row when the same date is recorded again", async () => {
		const directory = await scratchDirectory();
		const file = join(directory, "history.csv");

		await upsertHistoryRow(file, "date,bytes", "2026-10-30", [10]);
		await upsertHistoryRow(file, "date,bytes", "2026-10-30", [11]);

		await expect(readFile(file, "utf8")).resolves.toBe(
			"date,bytes\n2026-10-30,11\n",
		);
	});

	it("reports no change when the same observation repeats", async () => {
		const directory = await scratchDirectory();
		const file = join(directory, "history.csv");

		await upsertHistoryRow(file, "date,bytes", "2026-10-30", [10]);
		await expect(
			upsertHistoryRow(file, "date,bytes", "2026-10-30", [10]),
		).resolves.toBe(false);
	});
});
