import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listTemplates, templateCommand } from "./template.js";

describe("listTemplates", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "devkit-template-"));
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("reads the built-in node-app and react-app templates", async () => {
    const templates = await listTemplates();

    expect(templates).toEqual([
      { name: "node-app", description: "A new Node.js application" },
      { name: "react-app", description: "A new React application" },
    ]);
  });

  it("skips malformed and unknown template files instead of crashing", async () => {
    await fs.writeFile(
      path.join(tempDir, "good.json"),
      JSON.stringify({ name: "{{name}}", description: "Good template" }),
    );
    await fs.writeFile(path.join(tempDir, "broken.json"), "{ not json");
    await fs.writeFile(path.join(tempDir, "no-description.json"), JSON.stringify({ name: "x" }));
    await fs.writeFile(path.join(tempDir, "array.json"), "[]");
    await fs.writeFile(path.join(tempDir, "README.md"), "# not a template");
    await fs.mkdir(path.join(tempDir, "nested.json"));

    const templates = await listTemplates(tempDir);

    expect(templates).toEqual([{ name: "good", description: "Good template" }]);
  });

  it("sorts templates by name", async () => {
    await fs.writeFile(path.join(tempDir, "zeta.json"), JSON.stringify({ description: "Z" }));
    await fs.writeFile(path.join(tempDir, "alpha.json"), JSON.stringify({ description: "A" }));

    expect((await listTemplates(tempDir)).map((template) => template.name)).toEqual([
      "alpha",
      "zeta",
    ]);
  });
});

describe("devkit template list", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function stdout(): string {
    return logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
  }

  it("prints each template name and description", async () => {
    await templateCommand().parseAsync(["node", "template", "list"]);

    expect(stdout()).toBe(
      ["node-app   A new Node.js application", "react-app  A new React application"].join("\n"),
    );
  });

  it("prints only a JSON array of { name, description } with --json", async () => {
    await templateCommand().parseAsync(["node", "template", "list", "--json"]);

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(JSON.parse(stdout())).toEqual([
      { name: "node-app", description: "A new Node.js application" },
      { name: "react-app", description: "A new React application" },
    ]);
  });
});
