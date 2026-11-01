import { readFile } from "node:fs/promises";
import { Command } from "commander";

/**
 * Parses dotenv-style content into a plain object.
 *
 * Supported syntax: blank lines, `#` comments, optional `export` prefixes,
 * single or double quoted values, and `KEY=value` pairs. Anything else is a
 * syntax error with the offending line number.
 */
export function parseEnvContent(content: string): Record<string, string> {
	const values: Record<string, string> = {};
	const lines = content.split(/\r?\n/);

	for (let index = 0; index < lines.length; index += 1) {
		const raw = lines[index].trim();
		if (raw === "" || raw.startsWith("#")) {
			continue;
		}

		const line = raw.startsWith("export ") ? raw.slice(7).trim() : raw;
		const separator = line.indexOf("=");
		if (separator <= 0) {
			throw new Error(`Invalid environment line ${index + 1}: ${raw}`);
		}

		const key = line.slice(0, separator).trim();
		let value = line.slice(separator + 1).trim();
		const quoted =
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"));
		if (quoted && value.length >= 2) {
			value = value.slice(1, -1);
		}

		values[key] = value;
	}

	return values;
}

export async function loadEnvFile(
	filePath: string,
): Promise<Record<string, string>> {
	return parseEnvContent(await readFile(filePath, "utf8"));
}

export function missingKeys(
	values: Record<string, string>,
	required: readonly string[],
): string[] {
	return required.filter((key) => !(key in values));
}

/** Keeps enough of a value to identify it without printing the secret. */
export function maskValue(value: string): string {
	if (value.length <= 4) {
		return "*".repeat(value.length);
	}

	return `${value.slice(0, 4)}${"*".repeat(Math.min(value.length - 4, 8))}`;
}

export function envLoadCommand(): Command {
	return new Command("env:load")
		.description("Parse a .env file and report its variables")
		.argument("<file>", "path to .env file")
		.option(
			"-r, --required <keys>",
			"comma-separated keys that must be present",
		)
		.option("-m, --mask", "mask values in the output", false)
		.option("-j, --json", "print the parsed values as JSON", false)
		.action(
			async (
				file: string,
				options: { required?: string; mask: boolean; json: boolean },
			) => {
				const values = await loadEnvFile(file);
				const required = (options.required ?? "")
					.split(",")
					.map((key) => key.trim())
					.filter(Boolean);
				const missing = missingKeys(values, required);

				if (options.json) {
					console.log(JSON.stringify(values, null, 2));
				} else {
					for (const key of Object.keys(values).sort()) {
						const value = options.mask ? maskValue(values[key]) : values[key];
						console.log(`${key}=${value}`);
					}
				}

				if (missing.length > 0) {
					console.error(`Missing required keys: ${missing.join(", ")}`);
					process.exitCode = 1;
				}
			},
		);
}
