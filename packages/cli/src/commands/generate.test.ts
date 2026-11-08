import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { CoreError } from "@devkit/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateProject } from "./generate";

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>();
  return {
    ...actual,
    promises: {
      ...actual.promises,
      mkdir: vi.fn(actual.promises.mkdir),
      readFile: vi.fn(actual.promises.readFile),
      writeFile: vi.fn(actual.promises.writeFile),
    },
  };
});

describe("generateProject", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "devkit-test-"));
    vi.clearAllMocks();

    vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
      const p = String(filePath);
      if (p.endsWith("node-app.json")) {
        return '{ "name": "{{name}}", "version": "0.1.0" }';
      }
      if (p.endsWith("react-app.json")) {
        return '{ "name": "{{name}}", "private": true }';
      }
      throw new Error(`Unknown template file: ${p}`);
    });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("creates target directory and generates files from node-app template", async () => {
    await generateProject({
      template: "node-app",
      targetDir: tempDir,
      projectName: "my-app",
    });

    expect(fs.mkdir).toHaveBeenCalledWith(tempDir, { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(tempDir, "package.json"),
      '{ "name": "my-app", "version": "0.1.0" }',
      "utf-8",
    );
  });

  it("generates files from react-app template", async () => {
    await generateProject({
      template: "react-app",
      targetDir: tempDir,
      projectName: "my-react-app",
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(tempDir, "package.json"),
      '{ "name": "my-react-app", "private": true }',
      "utf-8",
    );
  });

  it("throws a CoreError with code EEXIST when package.json exists without force", async () => {
    const packageJson = path.join(tempDir, "package.json");
    await fs.writeFile(packageJson, '{"name":"original"}', "utf-8");

    await expect(
      generateProject({
        template: "node-app",
        targetDir: tempDir,
        projectName: "new-app",
      }),
    ).rejects.toMatchObject({ name: "CoreError", code: "EEXIST" });
  });

  it("does not write any files when the overwrite guard throws", async () => {
    await fs.writeFile(path.join(tempDir, "package.json"), '{"name":"original"}', "utf-8");
    vi.mocked(fs.mkdir).mockClear();
    vi.mocked(fs.writeFile).mockClear();

    await expect(
      generateProject({
        template: "node-app",
        targetDir: tempDir,
        projectName: "new-app",
      }),
    ).rejects.toBeInstanceOf(CoreError);

    expect(fs.mkdir).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it("overwrites an existing package.json when force is true", async () => {
    const packageJson = path.join(tempDir, "package.json");
    await fs.writeFile(packageJson, '{"name":"original"}', "utf-8");

    await generateProject({
      template: "node-app",
      targetDir: tempDir,
      projectName: "new-app",
      force: true,
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      packageJson,
      '{ "name": "new-app", "version": "0.1.0" }',
      "utf-8",
    );
  });

  it("throws error for unknown template", async () => {
    await expect(
      generateProject({
        template: "unknown-template",
        targetDir: tempDir,
        projectName: "test",
      }),
    ).rejects.toThrow("Unknown template: unknown-template");
  });

  it("throws EEXIST without writing files when package.json already exists", async () => {
    const packageJson = path.join(tempDir, "package.json");
    await fs.writeFile(packageJson, '{"name":"original"}', "utf-8");
    vi.mocked(fs.writeFile).mockClear();

    const error = await generateProject({
      template: "node-app",
      targetDir: tempDir,
      projectName: "demo",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CoreError);
    expect(error).toMatchObject({ code: "EEXIST" });
    expect(fs.writeFile).not.toHaveBeenCalled();
    await expect(fs.access(packageJson)).resolves.toBeUndefined();
  });

  it("overwrites an existing package.json when force is true", async () => {
    const packageJson = path.join(tempDir, "package.json");
    await fs.writeFile(packageJson, '{"name":"original"}', "utf-8");

    await generateProject({
      template: "node-app",
      targetDir: tempDir,
      projectName: "demo",
      force: true,
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      packageJson,
      '{ "name": "demo", "version": "0.1.0" }',
      "utf-8",
    );
  });

  it("writes into a fresh directory without force", async () => {
    const targetDir = path.join(tempDir, "fresh-project");

    await generateProject({
      template: "node-app",
      targetDir,
      projectName: "fresh",
    });

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(targetDir, "package.json"),
      '{ "name": "fresh", "version": "0.1.0" }',
      "utf-8",
    );
  });
});
