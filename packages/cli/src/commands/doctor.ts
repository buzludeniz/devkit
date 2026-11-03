import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Command } from "commander";

const execFileAsync = promisify(execFile);

export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface DoctorRunner {
  getNodeVersion: () => string;
  checkPnpm: () => Promise<string>;
  checkGit: () => Promise<string>;
  checkGitRepo: (cwd: string) => Promise<boolean>;
}

export const defaultRunner: DoctorRunner = {
  getNodeVersion: () => process.version,
  checkPnpm: async () => {
    const { stdout } = await execFileAsync("pnpm", ["--version"]);
    return stdout.trim();
  },
  checkGit: async () => {
    const { stdout } = await execFileAsync("git", ["--version"]);
    return stdout.trim();
  },
  checkGitRepo: async (cwd: string) => {
    try {
      await execFileAsync("git", ["rev-parse", "--is-inside-work-tree"], { cwd });
      return true;
    } catch {
      return false;
    }
  },
};

export async function runDoctor(
  runner: DoctorRunner = defaultRunner,
  cwd: string = process.cwd(),
): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];

  // 1. Node.js >= 20
  const nodeVer = runner.getNodeVersion();
  const major = Number.parseInt(nodeVer.replace(/^v/, "").split(".")[0], 10);
  const nodeOk = major >= 20;
  checks.push({
    name: "node",
    ok: nodeOk,
    detail: nodeOk ? nodeVer : `${nodeVer} (requires >= 20)`,
  });

  // 2. pnpm on PATH
  try {
    const pnpmVer = await runner.checkPnpm();
    checks.push({
      name: "pnpm",
      ok: true,
      detail: pnpmVer,
    });
  } catch {
    checks.push({
      name: "pnpm",
      ok: false,
      detail: "not found on PATH",
    });
  }

  // 3. git on PATH
  try {
    const gitVer = await runner.checkGit();
    checks.push({
      name: "git",
      ok: true,
      detail: gitVer,
    });
  } catch {
    checks.push({
      name: "git",
      ok: false,
      detail: "not found on PATH",
    });
  }

  // 4. Git repository
  const isRepo = await runner.checkGitRepo(cwd);
  checks.push({
    name: "git-repo",
    ok: isRepo,
    detail: isRepo ? "inside a git repository" : "not inside a git repository",
  });

  return checks;
}

export function doctorCommand(runner: DoctorRunner = defaultRunner): Command {
  return new Command("doctor")
    .description("Check development toolchain and repository health")
    .option("--json", "output results as JSON")
    .action(async (options: { json?: boolean }) => {
      const checks = await runDoctor(runner);
      const allOk = checks.every((c) => c.ok);

      if (options.json) {
        console.log(JSON.stringify({ checks }, null, 2));
      } else {
        for (const check of checks) {
          const status = check.ok ? "ok" : "fail";
          console.log(`[${status}] ${check.name}: ${check.detail}`);
        }
      }

      if (!allOk) {
        process.exitCode = 1;
      }
    });
}
