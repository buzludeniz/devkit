import { Command } from "commander";
import { analyzeCommand } from "./commands/analyze";
import { apiTestCommand } from "./commands/api";
import { docsGenerateCommand } from "./commands/docs";
import { envLoadCommand } from "./commands/env";
import { gitCommand } from "./commands/git";
import { helloCommand } from "./commands/hello";
import { initCommand } from "./commands/init";
import { pluginLoadCommand } from "./commands/plugin";
import { releaseChangelogCommand } from "./commands/release";
import { versionCommand } from "./commands/version";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("devkit")
    .description("Developer productivity CLI")
    .version(require("../package.json").version, "-v, --version", "output the version number");

  program.addCommand(helloCommand());
  program.addCommand(versionCommand());
  program.addCommand(initCommand());
  program.addCommand(gitCommand());
  program.addCommand(analyzeCommand());
  program.addCommand(apiTestCommand());
  program.addCommand(envLoadCommand());
  program.addCommand(docsGenerateCommand());
  program.addCommand(releaseChangelogCommand());
  program.addCommand(pluginLoadCommand());

  return program;
}
