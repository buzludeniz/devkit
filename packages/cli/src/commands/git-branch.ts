import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface BranchInfo {
  current: string;
  all: string[];
}

export async function getBranches(cwd: string = process.cwd()): Promise<BranchInfo> {
  const [{ stdout: currentOut }, { stdout: allOut }] = await Promise.all([
    execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd }),
    execFileAsync("git", ["branch", "--format=%(refname:short)"], { cwd }),
  ]);

  return {
    current: currentOut.trim(),
    all: allOut
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  };
}
