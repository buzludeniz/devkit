import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initCommand } from "./init.js";

class ExitError extends Error {
  constructor(readonly code: number) {
    super(`process.exit(${code})`);
  }
}

describe("devkit init", () => {
  let tempDir: string;
  let exitSpy: MockInstance<typeof process.exit>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "devkit-init-"));
    exitSpy = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new ExitError(code ?? 0);
    }) as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("refuses to overwrite an existing package.json without --force", async () => {
    const packageJson = path.join(tempDir, "package.json");
    await fs.writeFile(packageJson, '{"name":"original"}', "utf-8");

    await expect(
      initCommand().parseAsync(["node", "init", "-t", "node-app", "-d", tempDir, "-n", "demo"]),
    ).rejects.toThrow("process.exit(1)");

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy.mock.calls.flat().join(" ")).toContain("package.json");
    await expect(fs.readFile(packageJson, "utf-8")).resolves.toBe('{"name":"original"}');
  });

  it("overwrites an existing package.json with --force", async () => {
    const packageJson = path.join(tempDir, "package.json");
    await fs.writeFile(packageJson, '{"name":"original"}', "utf-8");

    await initCommand().parseAsync([
      "node",
      "init",
      "-t",
      "node-app",
      "-d",
      tempDir,
      "-n",
      "demo",
      "--force",
    ]);

    expect(exitSpy).not.toHaveBeenCalled();
    const content = await fs.readFile(packageJson, "utf-8");
    expect(content).toContain('"name": "demo"');
  });

  it("writes into an empty directory without --force", async () => {
    await initCommand().parseAsync(["node", "init", "-t", "node-app", "-d", tempDir, "-n", "demo"]);

    expect(exitSpy).not.toHaveBeenCalled();
    const content = await fs.readFile(path.join(tempDir, "package.json"), "utf-8");
    expect(content).toContain('"name": "demo"');
  });

  it("documents -f, --force in its help text", () => {
    expect(initCommand().helpInformation()).toContain("-f, --force");
  });
});
