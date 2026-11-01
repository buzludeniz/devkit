import { describe, expect, it } from "vitest";
import { buildChangelog, parseCommitSubject } from "./release";

describe("parseCommitSubject", () => {
	it("parses type, scope and description", () => {
		expect(parseCommitSubject("feat(cli): add docs command", "abc123")).toEqual(
			{
				hash: "abc123",
				type: "feat",
				scope: "cli",
				description: "add docs command",
				breaking: false,
			},
		);
	});

	it("marks a breaking change with a bang", () => {
		const entry = parseCommitSubject("feat(core)!: drop Node 18");

		expect(entry?.breaking).toBe(true);
		expect(entry?.scope).toBe("core");
	});

	it("returns null for a non-conventional subject", () => {
		expect(parseCommitSubject("Update the readme")).toBeNull();
	});
});

describe("buildChangelog", () => {
	const entries = [
		parseCommitSubject("feat(cli): add docs command", "1111111"),
		parseCommitSubject("fix(core): handle empty config", "2222222"),
		parseCommitSubject("docs: explain nightly runs", "3333333"),
		parseCommitSubject("chore: bump lockfile", "4444444"),
		parseCommitSubject("feat!: replace config format", "5555555"),
	].filter((entry) => entry !== null);

	it("groups user-facing changes and omits internal commits", () => {
		const markdown = buildChangelog(entries, { version: "1.2.0" });

		expect(markdown).toContain("## 1.2.0");
		expect(markdown).toContain("### Breaking changes");
		expect(markdown).toContain("replace config format");
		expect(markdown).toContain("### Features");
		expect(markdown).toContain("**cli:** add docs command (1111111)");
		expect(markdown).toContain("### Bug fixes");
		expect(markdown).not.toContain("bump lockfile");
	});

	it("includes internal commits when asked", () => {
		const markdown = buildChangelog(entries, { includeInternal: true });

		expect(markdown).toContain("bump lockfile");
	});

	it("reports an explicit empty state", () => {
		expect(buildChangelog([])).toContain("No user-facing changes.");
	});
});
