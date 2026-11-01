import { execFile } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { createTasks } from "./nightly-tasks/index.js";
import { repoRoot } from "./nightly-tasks/lib/repo.js";
import { runNightlyTasks } from "./nightly-tasks/runner.js";
import type { TaskResult } from "./nightly-tasks/task-base.js";

const execFileAsync = promisify(execFile);

const EXCLUDED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".turbo",
  ".vitepress",
]);

export interface NightlyE2ERun {
  succeeded: number;
  failed: number;
  commits: number;
  results: TaskResult[];
}

export interface NightlyE2EResult {
  runs: NightlyE2ERun[];
}

async function run(file: string, args: string[], cwd: string): Promise<{ stdout: string }> {
  const { stdout } = await execFileAsync(file, args, { cwd });
  return { stdout };
}

async function generatedCommits(workspace: string): Promise<number> {
  const { stdout } = await run("git", ["rev-list", "--count", "HEAD"], workspace);
  // Subtract the seed commit that bootstraps the temporary repository.
  return Number(stdout.trim()) - 1;
}

/**
 * Runs every nightly task twice against a throwaway copy of the repository.
 *
 * The first run starts from a repository whose reports may already exist; the
 * second run starts from the output of the first. Both must produce ten
 * independent commits: the run-stamped history rows guarantee that a task with
 * unchanged report content still records its execution. Asserting on both runs
 * proves the "ten commits per night" promise is repeatable, not a first-run
 * artefact, and never touches the caller's working tree.
 */
export async function runNightlyE2E(): Promise<NightlyE2EResult> {
  const base = await mkdtemp(join(tmpdir(), "devkit-e2e-"));
  const workspace = join(base, "repo");

  try {
    await cp(repoRoot, workspace, {
      recursive: true,
      filter: (source) => {
        const parts = relative(repoRoot, source).split(/[\\/]/);
        return !parts.some((part) => EXCLUDED_DIRECTORIES.has(part));
      },
    });

    await run("git", ["init", "-b", "main"], workspace);
    await run("git", ["config", "user.name", "DevKit E2E"], workspace);
    await run("git", ["config", "user.email", "e2e@example.test"], workspace);
    await run("git", ["add", "-A"], workspace);
    await run("git", ["commit", "-m", "chore: seed e2e workspace"], workspace);

    const runs: NightlyE2ERun[] = [];
    let before = await generatedCommits(workspace);

    for (let index = 0; index < 2; index += 1) {
      const outcome = await runNightlyTasks(createTasks(workspace));
      const after = await generatedCommits(workspace);
      runs.push({
        succeeded: outcome.succeeded,
        failed: outcome.failed,
        commits: after - before,
        results: outcome.results,
      });
      before = after;
    }

    return { runs };
  } finally {
    await rm(base, { recursive: true, force: true });
  }
}

const entryPoint = process.argv[1];
if (entryPoint && import.meta.url === pathToFileURL(entryPoint).href) {
  const result = await runNightlyE2E();

  for (const [index, nightlyRun] of result.runs.entries()) {
    console.log(
      `E2E run ${index + 1}: ${nightlyRun.succeeded} succeeded, ${nightlyRun.failed} failed, ${nightlyRun.commits} commits`,
    );
  }

  process.exitCode = result.runs.every(
    (entry) => entry.succeeded >= 10 && entry.failed === 0 && entry.commits >= 10,
  )
    ? 0
    : 1;
}
