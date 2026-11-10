import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CoreError } from "@buzludeniz/devkit-core";

export interface GenerateOptions {
  template: string;
  targetDir: string;
  projectName: string;
  /**
   * Overwrite an existing `package.json` in the target directory.
   *
   * Defaults to `false`. Without it, {@link generateProject} throws a
   * {@link CoreError} with code `EEXIST` and writes no files when
   * `<targetDir>/package.json` already exists.
   */
  force?: boolean;
}

export const TEMPLATES_DIR = fileURLToPath(new URL("./templates/", import.meta.url));

const TEMPLATE_FILES: Record<string, Array<{ source: string; dest: string }>> = {
  "node-app": [{ source: "node-app.json", dest: "package.json" }],
  "react-app": [{ source: "react-app.json", dest: "package.json" }],
};

async function assertCanWrite(targetDir: string, force: boolean): Promise<void> {
  if (force) return;

  const packageJson = path.join(targetDir, "package.json");
  try {
    await fs.access(packageJson);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }

  throw new CoreError(
    `Refusing to overwrite existing file: ${packageJson}. Pass force: true to overwrite.`,
    "EEXIST",
  );
}

export async function generateProject(options: GenerateOptions): Promise<void> {
  const { template, targetDir, projectName, force = false } = options;

  const templateFiles = TEMPLATE_FILES[template];
  if (!templateFiles) {
    throw new Error(`Unknown template: ${template}`);
  }

  await assertCanWrite(targetDir, force);

  await fs.mkdir(targetDir, { recursive: true });

  for (const { source, dest } of templateFiles) {
    const srcPath = path.join(TEMPLATES_DIR, source);
    const destPath = path.join(targetDir, dest);

    let content = await fs.readFile(srcPath, "utf-8");
    content = content.replace(/\{\{name\}\}/g, projectName);

    await fs.writeFile(destPath, content, "utf-8");
  }
}
