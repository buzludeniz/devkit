import { Command } from "commander";
import { getBranches } from "./git-branch.js";
import { getGitStatus } from "./git-status.js";

export function gitCommand(): Command {
  const git = new Command("git").description("Git workflow helpers");

  git
    .command("status")
    .description("Show working tree status")
    .action(async () => {
      try {
        const status = await getGitStatus();
        console.log(`Branch: ${status.branch}`);
        console.log(`Clean: ${status.clean}`);
        if (status.staged.length) console.log(`Staged: ${status.staged.join(", ")}`);
        if (status.modified.length) console.log(`Modified: ${status.modified.join(", ")}`);
        if (status.untracked.length) console.log(`Untracked: ${status.untracked.join(", ")}`);
      } catch (error) {
        console.error(
          `Failed to read git status: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });

  git
    .command("branches")
    .description("List local branches")
    .action(async () => {
      try {
        const info = await getBranches();
        for (const branch of info.all) {
          console.log(`${branch === info.current ? "*" : " "} ${branch}`);
        }
      } catch (error) {
        console.error(
          `Failed to list branches: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });

  return git;
}
