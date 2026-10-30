import { describe, expect, it } from "vitest";
import type { DevKitConfig } from "./types";

describe("DevKitConfig", () => {
	it("has required fields", () => {
		const config: DevKitConfig = { name: "test", version: "0.1.0" };
		expect(config.name).toBe("test");
		expect(config.version).toBe("0.1.0");
	});
});
