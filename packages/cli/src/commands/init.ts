import { promises as fs } from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { generateProject } from "./generate";

async function assertCanWrite(targetDir: string, force: boolean): Promise<void> {
  if (force) return;

  const packageJson = path.join(targetDir, "package.json");
  try {
    await fs.access(packageJson);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }

  throw new Error(`Refusing to overwrite existing file: ${packageJson}. Use --force to overwrite.`);
}

export function initCommand(): Command {
  return new Command("init")
    .description("Scaffold a new project from a template")
    .requiredOption("-t, --template <name>", "template to use (node-app, react-app)")
    .option("-d, --dir <path>", "target directory", ".")
    .option("-n, --name <name>", "project name", "my-project")
    .option("-f, --force", "overwrite an existing package.json", false)
    .action(async (options) => {
      try {
        await assertCanWrite(options.dir, options.force);
        await generateProject({
          template: options.template,
          targetDir: options.dir,
          projectName: options.name,
        });
        console.log(
          `Project ${options.name} initialized with template ${options.template} in ${options.dir}`,
        );
      } catch (error) {
        console.error(
          `Failed to initialize project: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
}
