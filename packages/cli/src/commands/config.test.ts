import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CONFIG, configCommand } from "./config";

describe("devkit config", () => {
  let tempDir: string;
  let originalCwd: string;
  let originalExitCode: typeof process.exitCode;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "devkit-config-"));
    originalCwd = process.cwd();
    originalExitCode = process.exitCode;
    process.chdir(tempDir);
    process.exitCode = undefined;
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function output(): string {
    return logSpy.mock.calls.flat().join("\n");
  }

  function errors(): string {
    return errorSpy.mock.calls.flat().join("\n");
  }

  it("lists defaults when no config file exists", async () => {
    await configCommand().parseAsync(["node", "config", "list"]);

    expect(output()).toBe(
      [
        `template=${DEFAULT_CONFIG.template}`,
        `outputDir=${DEFAULT_CONFIG.outputDir}`,
        `color=${DEFAULT_CONFIG.color}`,
      ].join("\n"),
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("merges file values over defaults when listing", async () => {
    await fs.writeFile(
      path.join(tempDir, ".devkitrc.json"),
      JSON.stringify({ outputDir: "dist", color: false }),
      "utf8",
    );

    await configCommand().parseAsync(["node", "config", "list"]);

    expect(output()).toBe(
      [`template=${DEFAULT_CONFIG.template}`, "outputDir=dist", "color=false"].join("\n"),
    );
  });

  it("round trips a value through set and get", async () => {
    await configCommand().parseAsync(["node", "config", "set", "template", "react-app"]);
    await configCommand().parseAsync(["node", "config", "get", "template"]);

    expect(logSpy.mock.calls.at(-1)?.[0]).toBe("react-app");
    expect(process.exitCode).toBeUndefined();
  });

  it("creates .devkitrc.json when the file is missing", async () => {
    await configCommand().parseAsync(["node", "config", "set", "outputDir", "./apps"]);

    const raw = await fs.readFile(path.join(tempDir, ".devkitrc.json"), "utf8");
    expect(JSON.parse(raw)).toEqual({
      template: DEFAULT_CONFIG.template,
      outputDir: "./apps",
      color: DEFAULT_CONFIG.color,
    });
  });

  it("exits 1 for an unknown key on get", async () => {
    await configCommand().parseAsync(["node", "config", "get", "nope"]);

    expect(process.exitCode).toBe(1);
    expect(errors()).toContain("nope");
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("exits 1 for an unknown key on set and leaves the file unchanged", async () => {
    const file = path.join(tempDir, ".devkitrc.json");
    const original = JSON.stringify({ template: "react-app" });
    await fs.writeFile(file, original, "utf8");

    await configCommand().parseAsync(["node", "config", "set", "nope", "value"]);

    expect(process.exitCode).toBe(1);
    expect(errors()).toContain("nope");
    await expect(fs.readFile(file, "utf8")).resolves.toBe(original);
  });

  it("exits 1 for an invalid boolean and leaves the file unchanged", async () => {
    const file = path.join(tempDir, ".devkitrc.json");
    const original = JSON.stringify({ color: true });
    await fs.writeFile(file, original, "utf8");

    await configCommand().parseAsync(["node", "config", "set", "color", "maybe"]);

    expect(process.exitCode).toBe(1);
    expect(errors()).toContain("color");
    await expect(fs.readFile(file, "utf8")).resolves.toBe(original);
  });

  it("exits 1 for an empty string value and leaves the file unchanged", async () => {
    const file = path.join(tempDir, ".devkitrc.json");
    const original = JSON.stringify({ template: "react-app" });
    await fs.writeFile(file, original, "utf8");

    await configCommand().parseAsync(["node", "config", "set", "template", "  "]);

    expect(process.exitCode).toBe(1);
    expect(errors()).toContain("template");
    await expect(fs.readFile(file, "utf8")).resolves.toBe(original);
  });
});
