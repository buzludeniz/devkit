import { describe, expect, it } from "vitest";
import { metadataDefaults, syncManifest } from "./09-package-metadata.js";

describe("syncManifest", () => {
	it("adds every missing publication field", () => {
		const { manifest, added } = syncManifest({}, metadataDefaults());

		expect(added).toEqual([
			"license",
			"repository",
			"homepage",
			"bugs",
			"engines",
			"publishConfig",
		]);
		expect(manifest.license).toBe("MIT");
		expect(manifest.engines).toEqual({ node: ">=20.0.0" });
	});

	it("never overwrites values the author already set", () => {
		const { manifest, added } = syncManifest(
			{ license: "Apache-2.0", engines: { node: ">=22" } },
			metadataDefaults(),
		);

		expect(added).not.toContain("license");
		expect(added).not.toContain("engines");
		expect(manifest.license).toBe("Apache-2.0");
		expect(manifest.engines).toEqual({ node: ">=22" });
	});

	it("does not mutate the input manifest", () => {
		const input = { name: "example" };
		syncManifest(input, metadataDefaults());

		expect(input).toEqual({ name: "example" });
	});

	it("records the package directory in the repository field", () => {
		const { manifest } = syncManifest({}, metadataDefaults("packages/cli"));
		const repository = manifest.repository as { directory?: string };

		expect(repository.directory).toBe("packages/cli");
	});
});
