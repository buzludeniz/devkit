import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildChangelog, parseCommitSubject, releaseChangelogCommand } from "./release.js";

describe("parseCommitSubject", () => {
  it("parses type, scope and description", () => {
    expect(parseCommitSubject("feat(cli): add docs command", "abc123")).toEqual({
      hash: "abc123",
      type: "feat",
      scope: "cli",
      description: "add docs command",
      breaking: false,
    });
  });

  it("marks a breaking change with a bang", () => {
    const entry = parseCommitSubject("feat(core)!: drop Node 18");

    expect(entry?.breaking).toBe(true);
    expect(entry?.scope).toBe("core");
  });

  it("returns null for a non-conventional subject", () => {
    expect(parseCommitSubject("Update the readme")).toBeNull();
  });
});

describe("buildChangelog", () => {
  const entries = [
    parseCommitSubject("feat(cli): add docs command", "1111111"),
    parseCommitSubject("fix(core): handle empty config", "2222222"),
    parseCommitSubject("docs: explain nightly runs", "3333333"),
    parseCommitSubject("chore: bump lockfile", "4444444"),
    parseCommitSubject("feat!: replace config format", "5555555"),
  ].filter((entry) => entry !== null);

  it("groups user-facing changes and omits internal commits", () => {
    const markdown = buildChangelog(entries, { version: "1.2.0" });

    expect(markdown).toContain("## 1.2.0");
    expect(markdown).toContain("### Breaking changes");
    expect(markdown).toContain("replace config format");
    expect(markdown).toContain("### Features");
    expect(markdown).toContain("**cli:** add docs command (1111111)");
    expect(markdown).toContain("### Bug fixes");
    expect(markdown).not.toContain("bump lockfile");
  });

  it("includes internal commits when asked", () => {
    const markdown = buildChangelog(entries, { includeInternal: true });

    expect(markdown).toContain("bump lockfile");
  });

  it("reports an explicit empty state", () => {
    expect(buildChangelog([])).toContain("No user-facing changes.");
  });
});

describe("devkit release:changelog --dry-run", () => {
  let repo: string;
  let originalCwd: string;

  function git(...args: string[]): void {
    execFileSync(
      "git",
      [
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "-c",
        "commit.gpgsign=false",
        ...args,
      ],
      { cwd: repo, stdio: "ignore" },
    );
  }

  beforeEach(async () => {
    repo = await mkdtemp(join(tmpdir(), "devkit-release-"));
    originalCwd = process.cwd();
    git("init", "-q");
    git("commit", "-q", "--allow-empty", "-m", "feat(cli): add dry run");
    git("commit", "-q", "--allow-empty", "-m", "fix: keep files untouched");
    process.chdir(repo);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    vi.restoreAllMocks();
    await rm(repo, { recursive: true, force: true });
  });

  async function run(args: string[]): Promise<string> {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    await releaseChangelogCommand().parseAsync(["node", "release:changelog", ...args]);
    return logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
  }

  it("prints the planned diff and leaves an existing file's contents and mtime untouched", async () => {
    const changelog = join(repo, "CHANGELOG.md");
    await writeFile(changelog, "# Changelog\n\nold entry\n", "utf8");
    const before = await stat(changelog);

    const stdout = await run(["--version", "1.0.0", "--output", changelog, "--dry-run"]);

    expect(stdout).toContain(`--- ${changelog}`);
    expect(stdout).toContain(`+++ ${changelog}`);
    expect(stdout).toContain("-# Changelog");
    expect(stdout).toContain("-old entry");
    expect(stdout).toContain("+## 1.0.0");
    expect(stdout).toMatch(/^\+- \*\*cli:\*\* add dry run \([0-9a-f]+\)$/m);
    expect(stdout).toContain(`Dry run: ${changelog} was not written (2 commits)`);
    await expect(readFile(changelog, "utf8")).resolves.toBe("# Changelog\n\nold entry\n");
    expect((await stat(changelog)).mtimeMs).toBe(before.mtimeMs);
    expect(process.exitCode ?? 0).toBe(0);
  });

  it("prints a creation diff and does not create a missing file", async () => {
    const changelog = join(repo, "NEW.md");

    const stdout = await run(["--output", changelog, "--dry-run"]);

    expect(stdout).toContain("--- /dev/null");
    expect(stdout).toContain("+## Unreleased");
    await expect(stat(changelog)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("still writes the file without --dry-run", async () => {
    const changelog = join(repo, "CHANGELOG.md");

    const stdout = await run(["--output", changelog]);

    expect(stdout).toBe(`Wrote 2 commits to ${changelog}`);
    await expect(readFile(changelog, "utf8")).resolves.toContain("## Unreleased");
  });

  it("prints the changelog unchanged when --dry-run is used without --output", async () => {
    const withDryRun = await run(["--dry-run"]);
    vi.restoreAllMocks();
    const without = await run([]);

    expect(withDryRun).toBe(without);
    expect(withDryRun).toContain("### Features");
  });
});
