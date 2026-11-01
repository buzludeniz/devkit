import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function git(args: string[], cwd: string): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout.trim();
}

/**
 * Commits only the given repository-relative paths.
 *
 * Nightly tasks generate their own report and history row; staging the whole
 * working tree would sweep unrelated edits (or another task's half-written
 * output) into the wrong commit. Returns false when none of the paths changed,
 * which happens when Git normalises the write away.
 */
export async function commitPaths(
  message: string,
  paths: readonly string[],
  cwd: string,
): Promise<boolean> {
  const unique = [...new Set(paths)];
  if (unique.length === 0) {
    return false;
  }

  const status = await git(["status", "--porcelain", "--", ...unique], cwd);
  if (status.length === 0) {
    return false;
  }

  await git(["add", "--", ...unique], cwd);

  const staged = await git(["diff", "--cached", "--name-only", "--", ...unique], cwd);
  if (staged.length === 0) {
    return false;
  }

  await git(["commit", "-m", message, "--", ...unique], cwd);
  return true;
}
