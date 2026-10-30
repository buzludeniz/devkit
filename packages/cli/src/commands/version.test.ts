import { describe, expect, it } from "vitest";
import { versionCommand } from "./version";

describe("versionCommand", () => {
	it("exists and has name version", () => {
		const cmd = versionCommand();
		expect(cmd.name()).toBe("version");
	});

	it("has a description", () => {
		const cmd = versionCommand();
		expect(cmd.description()).toBe("Show the devkit version");
	});
});
