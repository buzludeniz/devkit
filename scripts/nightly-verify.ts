import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const CONVENTIONAL_SUBJECT =
  /^(feat|fix|test|refactor|perf|docs|build|ci|chore|style)(\([a-z0-9._-]+\))?!?: .+/;

export interface CommitRecord {
  sha: string;
  subject: string;
  files: string[];
}

export interface ClassifiedFiles {
  source: string[];
  tests: string[];
  docs: string[];
}

export interface VerificationResult {
  ok: boolean;
  problems: string[];
  workCommits: Array<CommitRecord & ClassifiedFiles>;
  docsCommits: number;
  total: number;
}

export function classifyFiles(files: string[]): ClassifiedFiles {
  const source = files.filter(
    (file) =>
      (/^packages\/[^/]+\/src\/.+\.ts$/.test(file) || /^scripts\/.+\.ts$/.test(file)) &&
      !file.endsWith(".test.ts") &&
      !file.endsWith(".d.ts"),
  );
  const tests = files.filter(
    (file) => file.endsWith(".test.ts") && (/^packages\//.test(file) || /^scripts\//.test(file)),
  );
  const docs = files.filter((file) => file.endsWith(".md"));

  return { source, tests, docs };
}

/**
 * A work commit must contain both non-test source and a test. Reports and
 * formatting commits may exist, but they never count toward the target.
 */
export function verifyCommits(commits: CommitRecord[], target: number): VerificationResult {
  const problems: string[] = [];
  const workCommits: Array<CommitRecord & ClassifiedFiles> = [];

  for (const commit of commits) {
    if (!CONVENTIONAL_SUBJECT.test(commit.subject)) {
      problems.push(`${commit.sha.slice(0, 7)}: not a conventional commit: ${commit.subject}`);
    }

    const files = classifyFiles(commit.files);
    if (files.source.length > 0 && files.tests.length > 0) {
      workCommits.push({ ...commit, ...files });
    }
  }

  if (workCommits.length < target) {
    problems.push(
      `only ${workCommits.length} of ${target} required work commits contain both source and tests`,
    );
  }

  const docsCommits = commits.filter(
    (commit) => classifyFiles(commit.files).docs.length > 0,
  ).length;

  return {
    ok: problems.length === 0,
    problems,
    workCommits,
    docsCommits,
    total: commits.length,
  };
}

function readCommits(base: string): CommitRecord[] {
  const log = execFileSync("git", ["log", "--reverse", "--format=%H%x1f%s", `${base}..HEAD`], {
    encoding: "utf8",
  }).trim();

  if (!log) {
    return [];
  }

  return log.split("\n").map((line) => {
    const [sha, subject] = line.split("\x1f");
    const files = execFileSync("git", ["show", "--name-only", "--format=", sha], {
      encoding: "utf8",
    })
      .split("\n")
      .map((file) => file.trim())
      .filter(Boolean);

    return { sha, subject, files };
  });
}

function main(): void {
  const args = process.argv.slice(2);
  const targetIndex = args.indexOf("--target");
  const baseIndex = args.indexOf("--base");
  const target = targetIndex >= 0 ? Number(args[targetIndex + 1]) : 2;
  const base = baseIndex >= 0 ? args[baseIndex + 1] : "main";

  const commits = readCommits(base);
  const result = verifyCommits(commits, target);

  console.log(`Nightly verification against ${base}`);
  console.log(`  total commits: ${result.total}`);
  console.log(`  work commits:  ${result.workCommits.length}/${target}`);
  console.log(`  docs commits:  ${result.docsCommits}`);

  for (const commit of result.workCommits) {
    console.log(`  ok ${commit.sha.slice(0, 7)} ${commit.subject}`);
  }

  if (!result.ok) {
    console.error("\nNightly verification failed:");
    for (const problem of result.problems) {
      console.error(`  - ${problem}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\nNightly verification passed.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
