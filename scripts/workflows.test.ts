import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const workflowDirectory = fileURLToPath(new URL("../.github/workflows/", import.meta.url));

interface WorkflowDocument {
  name?: unknown;
  on?: unknown;
  jobs?: unknown;
}

async function loadWorkflows(): Promise<Array<{ file: string; document: WorkflowDocument }>> {
  const files = (await readdir(workflowDirectory)).filter((file) => file.endsWith(".yml")).sort();

  return Promise.all(
    files.map(async (file) => ({
      file,
      document: parse(await readFile(join(workflowDirectory, file), "utf8")) as WorkflowDocument,
    })),
  );
}

describe("GitHub Actions workflows", () => {
  it("are all valid YAML with a name and jobs", async () => {
    const workflows = await loadWorkflows();

    expect(workflows.map((workflow) => workflow.file)).toEqual(
      expect.arrayContaining(["ci.yml", "docs.yml", "nightly-maintenance.yml", "release.yml"]),
    );

    for (const workflow of workflows) {
      expect(typeof workflow.document.name, workflow.file).toBe("string");
      expect(workflow.document.jobs, workflow.file).toBeTypeOf("object");
      expect(workflow.document.on, workflow.file).toBeTruthy();
    }
  });

  it("keeps the report refresh manual and requires ten commits", async () => {
    const workflows = await loadWorkflows();
    const nightly = workflows.find((workflow) => workflow.file === "nightly-maintenance.yml");

    expect(nightly).toBeDefined();
    const serialised = JSON.stringify(nightly?.document);
    expect(serialised).toContain("workflow_dispatch");
    expect(serialised).not.toContain("schedule");
    expect(serialised).toContain("pnpm nightly:maintenance");
    expect(serialised).toContain("count < 10");

    // The gate must run before anything is pushed, so a failed run cannot
    // publish a branch or open a pull request.
    const gate = serialised.indexOf("count < 10");
    const push = serialised.indexOf("git push --force-with-lease");
    expect(push).toBeGreaterThan(gate);
  });

  it("publishes with Changesets when main moves", async () => {
    const workflows = await loadWorkflows();
    const release = workflows.find((workflow) => workflow.file === "release.yml");

    const serialised = JSON.stringify(release?.document);
    expect(serialised).toContain("changesets/action@v1");
    expect(serialised).toContain("NPM_TOKEN");
    expect(serialised).toContain("pnpm changeset version");
  });
});
