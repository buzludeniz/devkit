import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface GitStatus {
	clean: boolean;
	branch: string;
	staged: string[];
	modified: string[];
	untracked: string[];
}

export async function getGitStatus(
	cwd: string = process.cwd(),
): Promise<GitStatus> {
	const [{ stdout: branchOut }, { stdout: porcelainOut }] = await Promise.all([
		execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd }),
		execFileAsync("git", ["status", "--porcelain"], { cwd }),
	]);

	const staged: string[] = [];
	const modified: string[] = [];
	const untracked: string[] = [];

	for (const line of porcelainOut.split("\n")) {
		if (!line.trim()) continue;
		const indexStatus = line[0];
		const workTreeStatus = line[1];
		const file = line.slice(3);

		if (indexStatus === "?") {
			untracked.push(file);
		} else if (indexStatus !== " " && indexStatus !== "?") {
			staged.push(file);
		} else if (workTreeStatus !== " ") {
			modified.push(file);
		}
	}

	return {
		clean:
			staged.length === 0 && modified.length === 0 && untracked.length === 0,
		branch: branchOut.trim(),
		staged,
		modified,
		untracked,
	};
}
