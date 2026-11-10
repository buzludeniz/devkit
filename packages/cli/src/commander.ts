import { createRequire } from "node:module";
import { Command } from "commander";
import { analyzeCommand } from "./commands/analyze.js";
import { apiTestCommand } from "./commands/api.js";
import { configCommand } from "./commands/config.js";
import { docsGenerateCommand } from "./commands/docs.js";
import { doctorCommand } from "./commands/doctor.js";
import { envLoadCommand } from "./commands/env.js";
import { gitCommand } from "./commands/git.js";
import { helloCommand } from "./commands/hello.js";
import { initCommand } from "./commands/init.js";
import { pluginLoadCommand } from "./commands/plugin.js";
import { releaseChangelogCommand } from "./commands/release.js";
import { templateCommand } from "./commands/template.js";
import { versionCommand } from "./commands/version.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

export function createProgram(): Command {
  const program = new Command();

  program
    .name("devkit")
    .description("Developer productivity CLI")
    .version(version, "-v, --version", "output the version number");

  program.addCommand(helloCommand());
  program.addCommand(versionCommand());
  program.addCommand(initCommand());
  program.addCommand(doctorCommand());
  program.addCommand(gitCommand());
  program.addCommand(analyzeCommand());
  program.addCommand(apiTestCommand());
  program.addCommand(envLoadCommand());
  program.addCommand(docsGenerateCommand());
  program.addCommand(releaseChangelogCommand());
  program.addCommand(pluginLoadCommand());
  program.addCommand(configCommand());
  program.addCommand(templateCommand());

  return program;
}
