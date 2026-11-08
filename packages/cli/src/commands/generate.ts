import { promises as fs } from "node:fs";
import path from "node:path";
import { CoreError } from "@devkit/core";

export interface GenerateOptions {
  template: string;
  targetDir: string;
  projectName: string;
  /**
   * Overwrite an existing `package.json` in the target directory.
   *
   * Defaults to `false`, so `generateProject` throws a `CoreError` with code
   * `EEXIST` before writing anything when the target already looks like a
   * project. Pass `true` to replace it.
   */
  force?: boolean;
}

const TEMPLATES_DIR = path.join(__dirname, "templates");

const TEMPLATE_FILES: Record<string, Array<{ source: string; dest: string }>> = {
  "node-app": [{ source: "node-app.json", dest: "package.json" }],
  "react-app": [{ source: "react-app.json", dest: "package.json" }],
};

async function packageJsonExists(targetDir: string): Promise<boolean> {
  try {
    await fs.access(path.join(targetDir, "package.json"));
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function generateProject(options: GenerateOptions): Promise<void> {
  const { template, targetDir, projectName, force = false } = options;

  const templateFiles = TEMPLATE_FILES[template];
  if (!templateFiles) {
    throw new Error(`Unknown template: ${template}`);
  }

  if (!force && (await packageJsonExists(targetDir))) {
    throw new CoreError(
      `Refusing to overwrite existing file: ${path.join(targetDir, "package.json")}. Use force to overwrite.`,
      "EEXIST",
    );
  }

  await fs.mkdir(targetDir, { recursive: true });

  for (const { source, dest } of templateFiles) {
    const srcPath = path.join(TEMPLATES_DIR, source);
    const destPath = path.join(targetDir, dest);

    let content = await fs.readFile(srcPath, "utf-8");
    content = content.replace(/\{\{name\}\}/g, projectName);

    await fs.writeFile(destPath, content, "utf-8");
  }
}
