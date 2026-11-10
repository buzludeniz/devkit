import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  docsGenerateCommand,
  extractDocEntries,
  generateDocs,
  renderDocs,
  writeDocs,
} from "./docs.js";

const created: string[] = [];

afterEach(async () => {
  await Promise.all(
    created.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

const SOURCE = [
  "/**",
  " * Adds two numbers.",
  " *",
  " * Keeps the implementation small.",
  " */",
  "export function add(a: number, b: number): number {",
  "  return a + b;",
  "}",
  "",
  "export const undocumented = 1;",
  "",
  "/** A documented type. */",
  "export type Pair = [number, number];",
].join("\n");

describe("extractDocEntries", () => {
  it("extracts only documented exports and cleans the comment", () => {
    const entries = extractDocEntries(SOURCE, "src/math.ts");

    expect(entries).toHaveLength(2);
    expect(entries[0]).toEqual({
      name: "add",
      kind: "function",
      description: "Adds two numbers. Keeps the implementation small.",
      file: "src/math.ts",
    });
    expect(entries[1].name).toBe("Pair");
    expect(entries[1].kind).toBe("type");
  });
});

describe("renderDocs", () => {
  it("groups entries by file", () => {
    const markdown = renderDocs(extractDocEntries(SOURCE, "src/math.ts"));

    expect(markdown).toContain("# Generated API documentation");
    expect(markdown).toContain("## src/math.ts");
    expect(markdown).toContain("### `add` (function)");
    expect(markdown).not.toContain("undocumented");
  });

  it("renders an explicit empty state", () => {
    expect(renderDocs([])).toContain("No documented exports were found.");
  });
});

describe("generateDocs", () => {
  it("scans nested source files and skips tests", async () => {
    const directory = await mkdtemp(join(tmpdir(), "devkit-docs-"));
    created.push(directory);
    await writeFile(join(directory, "index.ts"), SOURCE, "utf8");
    await writeFile(join(directory, "index.test.ts"), SOURCE, "utf8");

    const entries = await generateDocs(directory);

    expect(entries).toHaveLength(2);
    expect(entries.every((entry) => entry.file === "index.ts")).toBe(true);
  });

  it("writes the rendered page to the requested path", async () => {
    const directory = await mkdtemp(join(tmpdir(), "devkit-docs-"));
    created.push(directory);
    await writeFile(join(directory, "index.ts"), SOURCE, "utf8");
    const output = join(directory, "generated", "api.md");

    const count = await writeDocs(directory, output);

    expect(count).toBe(2);
    await expect(readFile(output, "utf8")).resolves.toContain("### `add` (function)");
  });
});

describe("devkit docs:generate --dry-run", () => {
  async function setup(): Promise<{ directory: string; output: string }> {
    const directory = await mkdtemp(join(tmpdir(), "devkit-docs-dry-"));
    created.push(directory);
    await writeFile(join(directory, "index.ts"), SOURCE, "utf8");
    return { directory, output: join(directory, "generated", "api.md") };
  }

  async function run(args: string[]): Promise<string> {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await docsGenerateCommand().parseAsync(["node", "docs:generate", ...args]);
      return logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
    } finally {
      logSpy.mockRestore();
    }
  }

  it("logs the file it would create without creating it or its directory", async () => {
    const { directory, output } = await setup();

    const stdout = await run(["--source", directory, "--output", output, "--dry-run"]);

    expect(stdout).toBe(`Would create ${output} (2 exports)`);
    await expect(stat(join(directory, "generated"))).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("logs the file it would modify and leaves its contents and mtime untouched", async () => {
    const { directory, output } = await setup();
    await writeDocs(directory, output);
    await writeFile(output, "stale\n", "utf8");
    const before = await stat(output);

    const stdout = await run(["--source", directory, "--output", output, "--dry-run"]);

    expect(stdout).toBe(`Would modify ${output} (2 exports)`);
    await expect(readFile(output, "utf8")).resolves.toBe("stale\n");
    expect((await stat(output)).mtimeMs).toBe(before.mtimeMs);
  });

  it("reports an up-to-date file as unchanged", async () => {
    const { directory, output } = await setup();
    await writeDocs(directory, output);

    const stdout = await run(["--source", directory, "--output", output, "--dry-run"]);

    expect(stdout).toBe(`Unchanged ${output} (2 exports)`);
  });

  it("still writes the file without --dry-run", async () => {
    const { directory, output } = await setup();

    const stdout = await run(["--source", directory, "--output", output]);

    expect(stdout).toBe(`Documented 2 exports in ${output}`);
    await expect(readFile(output, "utf8")).resolves.toContain("### `add` (function)");
  });
});
