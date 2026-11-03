import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "../lib/repo.js";
import { buildProjectStatus } from "./01-project-status.js";
import { buildArchitectureDoc } from "./02-architecture-doc.js";
import { buildDependencyInventory } from "./03-dependency-inventory.js";
import { buildCodeMetricsDoc } from "./04-code-metrics.js";
import { buildTodoReport } from "./05-todo-report.js";
import { buildChangelogPreview, parseCommitLog } from "./06-changelog-preview.js";
import { buildTestInventory } from "./07-test-inventory.js";
import { findBrokenLinks } from "./08-link-check.js";
import { buildApiReference, extractExports } from "./10-api-reference.js";

describe("project status", () => {
  it("reports both workspace packages and their test counts", async () => {
    const status = JSON.parse(await buildProjectStatus(repoRoot)) as {
      schemaVersion: number;
      packages: Array<{ name: string; testCases: number }>;
      totals: { sourceFiles: number; testCases: number };
    };

    expect(status.schemaVersion).toBe(1);
    expect(status.packages.map((entry) => entry.name).sort()).toEqual([
      "@devkit/cli",
      "@devkit/core",
    ]);
    expect(status.totals.sourceFiles).toBeGreaterThan(0);
    expect(status.totals.testCases).toBeGreaterThan(0);
  });
});

describe("architecture doc", () => {
  it("renders a Mermaid graph and a package table", async () => {
    const doc = await buildArchitectureDoc(repoRoot);

    expect(doc).toContain("# Architecture");
    expect(doc).toContain("```mermaid");
    expect(doc).toContain("@devkit/cli");
    expect(doc).toContain("@devkit/core");
  });
});

describe("dependency inventory", () => {
  it("lists runtime and development dependencies", async () => {
    const doc = await buildDependencyInventory(repoRoot);

    expect(doc).toContain("# Dependency inventory");
    expect(doc).toContain("commander");
    expect(doc).toContain("vitest");
    expect(doc).toContain("## Summary");
  });
});

describe("code metrics", () => {
  it("lists source files and totals", async () => {
    const doc = await buildCodeMetricsDoc(repoRoot);

    expect(doc).toContain("# Code metrics");
    expect(doc).toContain("packages/cli/src");
    expect(doc).toContain("## Largest files");
  });
});

describe("todo report", () => {
  it("renders a report even when no markers exist", async () => {
    const doc = await buildTodoReport(repoRoot);

    expect(doc).toContain("# Outstanding work");
    expect(doc).toMatch(/Found \d+ TODO, FIXME and HACK marker/);
  });
});

describe("changelog preview", () => {
  it("parses conventional commit subjects", () => {
    const commits = parseCommitLog(
      ["abc1234|feat(cli): add command", "def5678|update readme"].join("\n"),
    );

    expect(commits).toEqual([
      { hash: "abc1234", subject: "feat(cli): add command", type: "feat" },
      { hash: "def5678", subject: "update readme", type: "other" },
    ]);
  });

  it("groups the repository history by type", async () => {
    const dir = await mkdtemp(join(tmpdir(), "devkit-changelog-"));
    try {
      execFileSync("git", ["init", "-b", "main"], { cwd: dir });
      execFileSync("git", ["config", "user.email", "test@example.com"], {
        cwd: dir,
      });
      execFileSync("git", ["config", "user.name", "Test"], { cwd: dir });
      await writeFile(join(dir, "feature.txt"), "feature\n");
      execFileSync("git", ["add", "."], { cwd: dir });
      execFileSync("git", ["commit", "-m", "feat: add feature"], { cwd: dir });

      const doc = await buildChangelogPreview(dir);

      expect(doc).toContain("# Recent changes");
      expect(doc).toContain("## feat");
      expect(doc).toContain("add feature");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("test inventory", () => {
  it("counts test files and cases per package", async () => {
    const doc = await buildTestInventory(repoRoot);

    expect(doc).toContain("# Test inventory");
    expect(doc).toContain("@devkit/cli");
    expect(doc).toMatch(/\| `@devkit\/cli` \| [1-9]\d* \|/);
  });

  it("counts script tests in the totals and adds a scripts row", async () => {
    const dir = await mkdtemp(join(tmpdir(), "devkit-tests-"));
    try {
      await mkdir(join(dir, "packages", "alpha", "src"), { recursive: true });
      await mkdir(join(dir, "scripts"), { recursive: true });
      await writeFile(
        join(dir, "packages", "alpha", "package.json"),
        JSON.stringify({ name: "@example/alpha", version: "1.0.0" }),
      );
      await writeFile(
        join(dir, "packages", "alpha", "src", "index.ts"),
        "export const alpha = 1;\n",
      );
      await writeFile(
        join(dir, "packages", "alpha", "src", "index.test.ts"),
        "it('a', () => {});\nit('b', () => {});\n",
      );
      await writeFile(join(dir, "scripts", "tool.test.ts"), "test('tool', () => {});\n");

      const doc = await buildTestInventory(dir);

      expect(doc).toContain("- Test files: 2");
      expect(doc).toContain("- Test cases: 3");
      expect(doc).toContain("| `scripts` | 1 | 1 |");
      expect(doc).toContain("- `scripts/tool.test.ts`");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("omits the scripts row when no script tests exist", async () => {
    const dir = await mkdtemp(join(tmpdir(), "devkit-tests-"));
    try {
      await mkdir(join(dir, "packages", "alpha", "src"), { recursive: true });
      await writeFile(
        join(dir, "packages", "alpha", "package.json"),
        JSON.stringify({ name: "@example/alpha", version: "1.0.0" }),
      );
      await writeFile(
        join(dir, "packages", "alpha", "src", "index.test.ts"),
        "it('a', () => {});\n",
      );

      const doc = await buildTestInventory(dir);

      expect(doc).toContain("- Test files: 1");
      expect(doc).not.toContain("| `scripts` |");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("link check", () => {
  it("returns a list of broken links", async () => {
    const broken = await findBrokenLinks(repoRoot);

    expect(Array.isArray(broken)).toBe(true);
    for (const entry of broken) {
      expect(entry).toHaveProperty("file");
      expect(entry).toHaveProperty("line");
      expect(entry).toHaveProperty("link");
    }
  });
});

describe("api reference", () => {
  it("extracts exported symbols", () => {
    const symbols = extractExports(
      [
        "export function createProgram(): void {}",
        "export class CoreError extends Error {}",
        "const privateValue = 1;",
        "export interface Config {}",
      ].join("\n"),
      "src/index.ts",
    );

    expect(symbols).toEqual([
      { file: "src/index.ts", kind: "function", name: "createProgram" },
      { file: "src/index.ts", kind: "class", name: "CoreError" },
      { file: "src/index.ts", kind: "interface", name: "Config" },
    ]);
  });

  it("documents the real packages", async () => {
    const doc = await buildApiReference(repoRoot);

    expect(doc).toContain("# API reference");
    expect(doc).toContain("## @devkit/core");
    expect(doc).toContain("createProgram");
  });
});
