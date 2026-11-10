import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { TEMPLATES_DIR } from "./generate.js";

export interface TemplateInfo {
  name: string;
  description: string;
}

async function readTemplate(directory: string, fileName: string): Promise<TemplateInfo | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path.join(directory, fileName), "utf8"));
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

    const { description } = parsed as { description?: unknown };
    if (typeof description !== "string" || description.trim() === "") return null;

    return { name: path.basename(fileName, ".json"), description };
  } catch {
    return null;
  }
}

/**
 * Lists the project templates in `directory`, one per `<name>.json` file.
 *
 * Files that are not valid JSON objects with a non-empty string `description`
 * are skipped, so one broken template never hides the others.
 */
export async function listTemplates(directory: string = TEMPLATES_DIR): Promise<TemplateInfo[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const templates: TemplateInfo[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const template = await readTemplate(directory, entry.name);
    if (template) templates.push(template);
  }

  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

export function templateCommand(): Command {
  const template = new Command("template").description("Inspect built-in project templates");

  template
    .command("list")
    .description("List available project templates")
    .option("--json", "print the templates as JSON")
    .action(async (options: { json?: boolean }) => {
      const templates = await listTemplates();

      if (options.json) {
        console.log(JSON.stringify(templates, null, 2));
        return;
      }

      const width = Math.max(0, ...templates.map(({ name }) => name.length));
      for (const { name, description } of templates) {
        console.log(`${name.padEnd(width)}  ${description}`);
      }
    });

  return template;
}
