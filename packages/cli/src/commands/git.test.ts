import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { gitCommand } from "./git.js";
import type { GitStatus } from "./git-status.js";

const { getGitStatusMock } = vi.hoisted(() => ({ getGitStatusMock: vi.fn() }));

vi.mock("./git-status.js", () => ({ getGitStatus: getGitStatusMock }));

const dirtyStatus: GitStatus = {
  clean: false,
  branch: "feature/json",
  staged: ["a.ts"],
  modified: ["b.ts", "c.ts"],
  untracked: ["d.ts"],
};

describe("devkit git status", () => {
  let logSpy: MockInstance<typeof console.log>;
  let errorSpy: MockInstance<typeof console.error>;
  let exitSpy: MockInstance<typeof process.exit>;

  beforeEach(() => {
    vi.clearAllMocks();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function stdout(): string {
    return logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
  }

  it("prints the human format without --json", async () => {
    getGitStatusMock.mockResolvedValue(dirtyStatus);

    await gitCommand().parseAsync(["node", "git", "status"]);

    expect(stdout()).toBe(
      [
        "Branch: feature/json",
        "Clean: false",
        "Staged: a.ts",
        "Modified: b.ts, c.ts",
        "Untracked: d.ts",
      ].join("\n"),
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("prints only the GitStatus object as JSON with --json", async () => {
    getGitStatusMock.mockResolvedValue(dirtyStatus);

    await gitCommand().parseAsync(["node", "git", "status", "--json"]);

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(stdout())).toEqual(dirtyStatus);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("prints a clean status as JSON with empty lists", async () => {
    getGitStatusMock.mockResolvedValue({
      clean: true,
      branch: "main",
      staged: [],
      modified: [],
      untracked: [],
    });

    await gitCommand().parseAsync(["node", "git", "status", "--json"]);

    expect(JSON.parse(stdout())).toEqual({
      clean: true,
      branch: "main",
      staged: [],
      modified: [],
      untracked: [],
    });
  });

  it("keeps exit code 1 and writes nothing to stdout when git fails with --json", async () => {
    getGitStatusMock.mockRejectedValue(new Error("not a git repository"));

    await gitCommand().parseAsync(["node", "git", "status", "--json"]);

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("Failed to read git status: not a git repository");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
