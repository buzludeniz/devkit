import { join } from "node:path";
import {
  countLines,
  listFiles,
  listWorkspacePackages,
  readJsonFile,
  readTextFile,
  toPosix,
} from "../lib/repo.js";
import { ReportTask } from "../task-base.js";

interface PackageStatus {
  name: string;
  version: string;
  description: string;
  sourceFiles: number;
  sourceLines: number;
  testFiles: number;
  testCases: number;
}

export interface ProjectStatus {
  schemaVersion: 1;
  packages: PackageStatus[];
  totals: {
    packages: number;
    sourceFiles: number;
    sourceLines: number;
    testFiles: number;
    testCases: number;
    documentationFiles: number;
  };
  scripts: Record<string, string>;
}

function countTestCases(content: string): number {
  return (content.match(/\b(?:it|test)\s*\(/g) ?? []).length;
}

export async function buildProjectStatus(root: string): Promise<string> {
  const packages = await listWorkspacePackages(root);
  const allFiles = await listFiles(root);
  const typescriptFiles = allFiles.filter((file) => file.endsWith(".ts"));
  const testFiles = typescriptFiles.filter((file) => file.endsWith(".test.ts"));
  const sourceFiles = typescriptFiles.filter((file) => !file.endsWith(".test.ts"));
  const documentationFiles = allFiles.filter((file) => /\.(md|mdx)$/i.test(file));

  let testCases = 0;
  for (const file of testFiles) {
    const content = await readTextFile(file).catch(() => "");
    testCases += countTestCases(content);
  }

  const packageStatuses: PackageStatus[] = [];

  for (const workspacePackage of packages) {
    const packagePrefix = `${workspacePackage.directory}/`;
    const packageSources = sourceFiles.filter((file) => toPosix(file).includes(packagePrefix));
    const packageTests = testFiles.filter((file) => toPosix(file).includes(packagePrefix));

    let sourceLines = 0;
    for (const file of packageSources) {
      const content = await readTextFile(file).catch(() => "");
      sourceLines += countLines(content);
    }

    let packageTestCases = 0;
    for (const file of packageTests) {
      const content = await readTextFile(file).catch(() => "");
      packageTestCases += countTestCases(content);
    }

    packageStatuses.push({
      name: workspacePackage.name,
      version: workspacePackage.version,
      description: workspacePackage.description,
      sourceFiles: packageSources.length,
      sourceLines,
      testFiles: packageTests.length,
      testCases: packageTestCases,
    });
  }

  const rootManifest = await readJsonFile<{ scripts?: Record<string, string> }>(
    join(root, "package.json"),
  );

  let totalSourceLines = 0;
  for (const file of sourceFiles) {
    const content = await readTextFile(file).catch(() => "");
    totalSourceLines += countLines(content);
  }

  const status: ProjectStatus = {
    schemaVersion: 1,
    packages: packageStatuses,
    totals: {
      packages: packageStatuses.length,
      sourceFiles: sourceFiles.length,
      sourceLines: totalSourceLines,
      testFiles: testFiles.length,
      testCases,
      documentationFiles: documentationFiles.length,
    },
    scripts: rootManifest.scripts ?? {},
  };

  return JSON.stringify(status, null, 2);
}

export class ProjectStatusTask extends ReportTask {
  readonly name = "project-status";
  readonly description = "Refresh docs/project/status.json with repository statistics";
  readonly reportPath = "docs/project/status.json";
  readonly commitMessage = "docs: refresh project status report";

  protected async buildReport(): Promise<string> {
    return buildProjectStatus(this.root);
  }
}
