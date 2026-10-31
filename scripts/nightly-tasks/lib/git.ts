import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function git(args: string[], cwd: string): Promise<string> {
	const { stdout } = await execFileAsync("git", args, { cwd });
	return stdout.trim();
}

/**
 * Stages and commits every change in the working tree.
 *
 * Returns false when there is nothing to commit, which lets each nightly task
 * report an honest "no changes" result instead of creating empty commits.
 */
export async function commitAll(
	message: string,
	cwd: string,
): Promise<boolean> {
	const status = await git(["status", "--porcelain"], cwd);
	if (status.length === 0) {
		return false;
	}

	await git(["add", "-A"], cwd);
	await git(["commit", "-m", message], cwd);
	return true;
}
