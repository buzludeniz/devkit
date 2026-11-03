import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDevKitConfig } from "./config.js";

describe("loadDevKitConfig", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = join(
      tmpdir(),
      `devkit-config-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("loads config from devkit.config.json", () => {
    writeFileSync(
      join(tempDir, "devkit.config.json"),
      JSON.stringify({ name: "my-app", version: "1.2.3" }),
      "utf8",
    );

    const result = loadDevKitConfig(tempDir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("my-app");
      expect(result.value.version).toBe("1.2.3");
    }
  });

  it("falls back to package.json when devkit.config.json is absent", () => {
    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ name: "pkg-app", version: "2.0.0" }),
      "utf8",
    );

    const result = loadDevKitConfig(tempDir);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("pkg-app");
      expect(result.value.version).toBe("2.0.0");
    }
  });

  it("returns err when config json is malformed", () => {
    writeFileSync(join(tempDir, "devkit.config.json"), "{ invalid json ", "utf8");

    const result = loadDevKitConfig(tempDir);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("CONFIG_PARSE_ERROR");
    }
  });

  it("returns err when no config or package.json exists", () => {
    const result = loadDevKitConfig(tempDir);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("CONFIG_NOT_FOUND");
    }
  });
});
