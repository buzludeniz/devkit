import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type DoctorRunner, doctorCommand, runDoctor } from "./doctor.js";

describe("runDoctor", () => {
  const passingRunner: DoctorRunner = {
    getNodeVersion: () => "v20.18.0",
    checkPnpm: async () => "9.1.0",
    checkGit: async () => "git version 2.45.0",
    checkGitRepo: async () => true,
  };

  it("passes when all checks succeed", async () => {
    const checks = await runDoctor(passingRunner, "/fake/repo");
    expect(checks).toHaveLength(4);
    expect(checks.every((c) => c.ok)).toBe(true);
    expect(checks.find((c) => c.name === "node")?.detail).toBe("v20.18.0");
    expect(checks.find((c) => c.name === "pnpm")?.detail).toBe("9.1.0");
    expect(checks.find((c) => c.name === "git")?.detail).toBe("git version 2.45.0");
    expect(checks.find((c) => c.name === "git-repo")?.detail).toBe("inside a git repository");
  });

  it("fails when Node is older than 20", async () => {
    const oldNodeRunner: DoctorRunner = {
      ...passingRunner,
      getNodeVersion: () => "v18.19.0",
    };
    const checks = await runDoctor(oldNodeRunner);
    const nodeCheck = checks.find((c) => c.name === "node");
    expect(nodeCheck?.ok).toBe(false);
    expect(nodeCheck?.detail).toContain("requires >= 20");
  });

  it("fails when pnpm throws / is not found", async () => {
    const noPnpmRunner: DoctorRunner = {
      ...passingRunner,
      checkPnpm: async () => {
        throw new Error("command not found");
      },
    };
    const checks = await runDoctor(noPnpmRunner);
    const pnpmCheck = checks.find((c) => c.name === "pnpm");
    expect(pnpmCheck?.ok).toBe(false);
    expect(pnpmCheck?.detail).toBe("not found on PATH");
  });

  it("fails when outside a git repository", async () => {
    const noRepoRunner: DoctorRunner = {
      ...passingRunner,
      checkGitRepo: async () => false,
    };
    const checks = await runDoctor(noRepoRunner, "/not/a/repo");
    const repoCheck = checks.find((c) => c.name === "git-repo");
    expect(repoCheck?.ok).toBe(false);
    expect(repoCheck?.detail).toBe("not inside a git repository");
  });
});

describe("doctorCommand", () => {
  let originalExitCode: string | number | null | undefined;

  beforeEach(() => {
    originalExitCode = process.exitCode;
    process.exitCode = undefined;
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
  });

  it("outputs JSON with checks array when --json is passed", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const passingRunner: DoctorRunner = {
      getNodeVersion: () => "v22.0.0",
      checkPnpm: async () => "9.0.0",
      checkGit: async () => "git version 2.40.0",
      checkGitRepo: async () => true,
    };

    const cmd = doctorCommand(passingRunner);
    await cmd.parseAsync(["node", "doctor", "--json"]);

    expect(logSpy).toHaveBeenCalled();
    const output = JSON.parse(logSpy.mock.calls[0][0]);
    expect(output).toHaveProperty("checks");
    expect(output.checks).toHaveLength(4);
    expect(process.exitCode).toBeUndefined();
  });

  it("sets exitCode to 1 when a check fails", async () => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    const failingRunner: DoctorRunner = {
      getNodeVersion: () => "v16.0.0",
      checkPnpm: async () => "9.0.0",
      checkGit: async () => "git version 2.40.0",
      checkGitRepo: async () => true,
    };

    const cmd = doctorCommand(failingRunner);
    await cmd.parseAsync(["node", "doctor"]);

    expect(process.exitCode).toBe(1);
  });
});
