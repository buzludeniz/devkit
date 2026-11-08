import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONFIG_DEFAULTS, CONFIG_FILE, configCommand } from "./config";

describe("devkit config", () => {
  let tempDir: string;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "devkit-config-"));
    process.exitCode = undefined;
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  async function run(...args: string[]): Promise<void> {
    await configCommand(tempDir).parseAsync(["node", "config", ...args]);
  }

  function output(): string {
    return logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
  }

  function errors(): string {
    return errorSpy.mock.calls.map((call) => call.join(" ")).join("\n");
  }

  async function readFile(): Promise<string> {
    return fs.readFile(path.join(tempDir, CONFIG_FILE), "utf8");
  }

  it("lists defaults when no config file exists", async () => {
    await run("list");

    expect(output()).toBe(
      `template=${CONFIG_DEFAULTS.template}\noutputDir=${CONFIG_DEFAULTS.outputDir}\ncolor=${CONFIG_DEFAULTS.color}`,
    );
    expect(process.exitCode).toBeUndefined();
  });

  it("sets and gets a value, creating the file when missing", async () => {
    await run("set", "template", "react-app");

    const written = JSON.parse(await readFile()) as Record<string, unknown>;
    expect(written).toEqual({ template: "react-app" });

    logSpy.mockClear();
    await run("get", "template");
    expect(output()).toBe("react-app");
    expect(process.exitCode).toBeUndefined();
  });

  it("parses booleans and prints defaults for unset keys", async () => {
    await run("set", "color", "false");

    logSpy.mockClear();
    await run("get", "color");
    expect(output()).toBe("false");

    await run("get", "outputDir");
    expect(output()).toBe("false\n.");
  });

  it("exits 1 for an unknown key", async () => {
    await run("get", "unknown");

    expect(process.exitCode).toBe(1);
    expect(errors()).toContain("unknown");
    expect(output()).toBe("");
  });

  it("exits 1 and leaves the file unchanged for an invalid boolean", async () => {
    await run("set", "template", "node-app");
    const before = await readFile();

    await run("set", "color", "yes");

    expect(process.exitCode).toBe(1);
    expect(errors()).toContain("color");
    await expect(readFile()).resolves.toBe(before);
  });

  it("exits 1 and creates no file for an empty string value", async () => {
    await run("set", "template", "   ");

    expect(process.exitCode).toBe(1);
    await expect(fs.access(path.join(tempDir, CONFIG_FILE))).rejects.toThrow();
  });
});
