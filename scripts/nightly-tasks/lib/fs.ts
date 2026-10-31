import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Writes a file only when its content would actually change.
 *
 * Nightly maintenance runs every day; refusing to rewrite identical content is
 * what keeps the generated reports from producing empty commits.
 */
export async function writeIfChanged(
	filePath: string,
	content: string,
): Promise<boolean> {
	const normalised = content.endsWith("\n") ? content : `${content}\n`;

	let existing: string | null = null;
	try {
		existing = await readFile(filePath, "utf8");
	} catch {
		existing = null;
	}

	if (existing === normalised) {
		return false;
	}

	await mkdir(dirname(filePath), { recursive: true });
	await writeFile(filePath, normalised, "utf8");
	return true;
}

/**
 * Records one observation per day in a small CSV history file.
 *
 * Re-running the same task on the same day replaces that day's row instead of
 * appending a duplicate, which keeps a re-run from producing a noisy commit.
 */
export async function upsertHistoryRow(
	filePath: string,
	header: string,
	date: string,
	values: ReadonlyArray<string | number>,
): Promise<boolean> {
	let existing = "";
	try {
		existing = await readFile(filePath, "utf8");
	} catch {
		existing = "";
	}

	const lines = existing
		.split(/\r?\n/)
		.map((line) => line.trimEnd())
		.filter((line) => line.length > 0);
	const hasHeader = lines[0] === header;
	const body = hasHeader ? lines.slice(1) : lines;
	const row = [date, ...values.map(String)].join(",");
	const nextBody = body.filter((line) => !line.startsWith(`${date},`));
	nextBody.push(row);

	return writeIfChanged(filePath, [header, ...nextBody].join("\n"));
}
