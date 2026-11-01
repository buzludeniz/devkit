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

export interface NightlyE2EResult {
	succeeded: number;
	failed: number;
	commits: number;
	results: TaskResult[];
}

async function run(
	file: string,
	args: string[],
	cwd: string,
): Promise<{ stdout: string }> {
	const { stdout } = await execFileAsync(file, args, { cwd });
	return { stdout };
}

/**
 * Runs every nightly task against a throwaway copy of the repository.
 *
 * The copy starts as a clean git repository with no generated reports, so each
 * of the ten tasks has real work to do. Asserting on the resulting commit count
 * proves the "ten commits per night" promise without touching the caller's
 * working tree.
 */
export async function runNightlyE2E(): Promise<NightlyE2EResult> {
	const base = await mkdtemp(join(tmpdir(), "devkit-e2e-"));
	const workspace = join(base, "repo");

	try {
		await cp(repoRoot, workspace, {
			recursive: true,
			filter: (source) => {
				const parts = relative(repoRoot, source).split(/[\\/]/);
				if (parts[0] === "docs") {
					return false;
				}
				return !parts.some((part) => EXCLUDED_DIRECTORIES.has(part));
			},
		});

		await run("git", ["init", "-b", "main"], workspace);
		await run("git", ["config", "user.name", "DevKit E2E"], workspace);
		await run("git", ["config", "user.email", "e2e@example.test"], workspace);
		await run("git", ["add", "-A"], workspace);
		await run("git", ["commit", "-m", "chore: seed e2e workspace"], workspace);

		const outcome = await runNightlyTasks(createTasks(workspace));
		const { stdout } = await run(
			"git",
			["rev-list", "--count", "HEAD"],
			workspace,
		);

		return {
			succeeded: outcome.succeeded,
			failed: outcome.failed,
			commits: Number(stdout.trim()) - 1,
			results: outcome.results,
		};
	} finally {
		await rm(base, { recursive: true, force: true });
	}
}

const entryPoint = process.argv[1];
if (entryPoint && import.meta.url === pathToFileURL(entryPoint).href) {
	const result = await runNightlyE2E();
	console.log(
		`E2E: ${result.succeeded} succeeded, ${result.failed} failed, ${result.commits} commits`,
	);
	process.exitCode =
		result.succeeded >= 10 && result.commits >= 10 && result.failed === 0
			? 0
			: 1;
}
