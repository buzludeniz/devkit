import { join } from "node:path";
import { upsertHistoryRow, writeIfChanged } from "../lib/fs.js";
import { commitPaths } from "../lib/git.js";
import { listWorkspacePackages, readJsonFile, repoRoot } from "../lib/repo.js";
import { BaseTask } from "../task-base.js";

export const REPOSITORY_URL = "https://github.com/buzludeniz/devkit";

export interface MetadataDefaults {
  license: string;
  repository: {
    type: "git";
    url: string;
    directory?: string;
  };
  homepage: string;
  bugs: { url: string };
  engines: { node: string };
  publishConfig?: { access: "public" };
}

export function metadataDefaults(directory?: string): MetadataDefaults {
  const repository: MetadataDefaults["repository"] = {
    type: "git",
    url: `git+${REPOSITORY_URL}.git`,
  };
  if (directory) {
    repository.directory = directory;
  }

  return {
    license: "MIT",
    repository,
    homepage: `${REPOSITORY_URL}#readme`,
    bugs: { url: `${REPOSITORY_URL}/issues` },
    engines: { node: ">=20.0.0" },
    publishConfig: { access: "public" },
  };
}

export interface SyncResult {
  manifest: Record<string, unknown>;
  added: string[];
}

/**
 * Adds missing publication metadata without overwriting anything the package
 * author already set. Keys are appended so the diff stays easy to review.
 */
export function syncManifest(
  manifest: Record<string, unknown>,
  defaults: MetadataDefaults,
): SyncResult {
  const updated = { ...manifest };
  const added: string[] = [];

  for (const [key, value] of Object.entries(defaults)) {
    if (value === undefined) {
      continue;
    }
    if (updated[key] === undefined) {
      updated[key] = value;
      added.push(key);
    }
  }

  return { manifest: updated, added };
}

export async function synchroniseMetadata(
  root: string,
): Promise<{ updatedFiles: string[]; manifestsScanned: number }> {
  const updatedFiles: string[] = [];

  const rootManifestPath = join(root, "package.json");
  const rootManifest = await readJsonFile<Record<string, unknown>>(rootManifestPath);
  const rootDefaults = metadataDefaults();
  const rootResult = syncManifest(rootManifest, {
    ...rootDefaults,
    publishConfig: undefined,
  });

  if (rootResult.added.length > 0) {
    await writeIfChanged(rootManifestPath, JSON.stringify(rootResult.manifest, null, 2));
    updatedFiles.push("package.json");
  }

  const packages = await listWorkspacePackages(root);

  for (const workspacePackage of packages) {
    const manifestPath = join(root, workspacePackage.directory, "package.json");
    const manifest = await readJsonFile<Record<string, unknown>>(manifestPath);
    const result = syncManifest(manifest, metadataDefaults(workspacePackage.directory));

    if (result.added.length === 0) {
      continue;
    }

    await writeIfChanged(manifestPath, JSON.stringify(result.manifest, null, 2));
    updatedFiles.push(`${workspacePackage.directory}/package.json`);
  }

  return { updatedFiles, manifestsScanned: packages.length + 1 };
}

export class PackageMetadataTask extends BaseTask {
  readonly name = "package-metadata";
  readonly description = "Ensure every package declares license, repository and engines metadata";
  protected readonly root: string;

  constructor(root: string = repoRoot) {
    super();
    this.root = root;
  }

  protected async execute(): Promise<string> {
    const { updatedFiles, manifestsScanned } = await synchroniseMetadata(this.root);
    const historyPath = "docs/metrics/history/package-metadata.csv";
    const historyChanged = await upsertHistoryRow(
      join(this.root, historyPath),
      "run,manifests,updated",
      new Date().toISOString(),
      [manifestsScanned, updatedFiles.length],
    );

    if (updatedFiles.length === 0 && !historyChanged) {
      return "no changes";
    }

    const committed = await commitPaths(
      "chore: synchronise package metadata",
      [...updatedFiles, historyPath],
      this.root,
    );

    if (!committed) {
      throw new Error("Metadata audit changed but no commit could be created");
    }

    if (updatedFiles.length === 0) {
      return "recorded metadata audit";
    }

    return `updated ${updatedFiles.join(", ")}`;
  }
}
