import { readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

const IGNORED_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".vitepress",
  ".turbo",
]);

export interface WorkspacePackage {
  name: string;
  version: string;
  description: string;
  directory: string;
  manifest: Record<string, unknown>;
}

/** Recursively lists files under `root`, skipping build and vendor folders. */
export async function listFiles(
  root: string,
  predicate: (filePath: string) => boolean = () => true,
): Promise<string[]> {
  const found: string[] = [];

  async function walk(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name)) {
          continue;
        }
        await walk(join(directory, entry.name));
        continue;
      }

      if (entry.isFile()) {
        const absolute = join(directory, entry.name);
        if (predicate(absolute)) {
          found.push(absolute);
        }
      }
    }
  }

  await walk(root);
  return found.sort();
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export function readTextFile(filePath: string): Promise<string> {
  return readFile(filePath, "utf8");
}

/** Reads every package manifest under `packages/`. */
export async function listWorkspacePackages(root: string): Promise<WorkspacePackage[]> {
  const packagesRoot = join(root, "packages");
  let entries: string[];

  try {
    const dirents = await readdir(packagesRoot, { withFileTypes: true });
    entries = dirents
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }

  const packages: WorkspacePackage[] = [];

  for (const entry of entries) {
    const directory = join(packagesRoot, entry);
    try {
      const manifest = await readJsonFile<Record<string, unknown>>(join(directory, "package.json"));
      packages.push({
        name: String(manifest.name ?? entry),
        version: String(manifest.version ?? "0.0.0"),
        description: String(manifest.description ?? ""),
        directory: relative(root, directory).split(sep).join("/"),
        manifest,
      });
    } catch {
      // A package directory without a manifest is not part of the workspace.
    }
  }

  return packages;
}

export function toPosix(filePath: string): string {
  return filePath.split(sep).join("/");
}

export function countLines(content: string): number {
  if (content.length === 0) {
    return 0;
  }
  return content.split(/\r?\n/).length;
}
