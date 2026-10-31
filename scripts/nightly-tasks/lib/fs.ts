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
