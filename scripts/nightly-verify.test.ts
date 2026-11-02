import { describe, expect, it } from "vitest";
import { classifyFiles, verifyCommits } from "./nightly-verify.js";

function commit(sha: string, subject: string, files: string[]) {
  return { sha, subject, files };
}

const source = "packages/cli/src/commands/doctor.ts";
const test = "packages/cli/src/commands/doctor.test.ts";

describe("classifyFiles", () => {
  it("separates source, tests, and docs", () => {
    const result = classifyFiles([
      source,
      test,
      "docs/commands.md",
      "packages/cli/src/commands/types.d.ts",
    ]);

    expect(result.source).toEqual([source]);
    expect(result.tests).toEqual([test]);
    expect(result.docs).toEqual(["docs/commands.md"]);
  });

  it("treats scripts as source and excludes their tests", () => {
    const result = classifyFiles(["scripts/nightly-verify.mjs"]);

    expect(result.source).toEqual([]);
    expect(result.tests).toEqual([]);
  });
});

describe("verifyCommits", () => {
  it("passes when the target number of work commits exist", () => {
    const result = verifyCommits(
      [
        commit("a".repeat(40), "feat(cli): add doctor command (backlog 006)", [source, test]),
        commit("b".repeat(40), "fix(cli): parse MM entries (backlog 002)", [
          "packages/cli/src/commands/git-status.ts",
          "packages/cli/src/commands/git-status.test.ts",
        ]),
      ],
      2,
    );

    expect(result.ok).toBe(true);
    expect(result.workCommits).toHaveLength(2);
    expect(result.problems).toEqual([]);
  });

  it("does not count docs-only commits", () => {
    const result = verifyCommits(
      [
        commit("a".repeat(40), "feat(cli): add doctor command", [source, test]),
        commit("b".repeat(40), "docs: refresh the API reference", ["docs/reference/api.md"]),
      ],
      2,
    );

    expect(result.ok).toBe(false);
    expect(result.workCommits).toHaveLength(1);
    expect(result.problems[0]).toContain("only 1 of 2");
  });

  it("rejects non-conventional subjects", () => {
    const result = verifyCommits(
      [commit("a".repeat(40), "added a doctor command", [source, test])],
      1,
    );

    expect(result.ok).toBe(false);
    expect(result.problems.some((problem) => problem.includes("not a conventional commit"))).toBe(
      true,
    );
  });

  it("rejects a source commit without tests", () => {
    const result = verifyCommits(
      [commit("a".repeat(40), "feat(cli): add doctor command", [source])],
      1,
    );

    expect(result.ok).toBe(false);
    expect(result.workCommits).toHaveLength(0);
  });
});
