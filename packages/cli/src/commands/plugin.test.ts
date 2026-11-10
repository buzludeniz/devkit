import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadPlugin, validatePlugin } from "./plugin.js";

const created: string[] = [];

afterEach(async () => {
  await Promise.all(
    created.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function pluginFile(source: string): Promise<{ directory: string; file: string }> {
  const directory = await mkdtemp(join(tmpdir(), "devkit-plugin-"));
  created.push(directory);
  const file = join(directory, "plugin.mjs");
  await writeFile(file, source, "utf8");
  return { directory, file };
}

describe("validatePlugin", () => {
  it("accepts a plugin with a name and an activate function", () => {
    const plugin = validatePlugin({
      name: "sample",
      description: "Sample plugin",
      activate: () => undefined,
    });

    expect(plugin.name).toBe("sample");
    expect(plugin.description).toBe("Sample plugin");
  });

  it("rejects a module without a name", () => {
    expect(() => validatePlugin({})).toThrow("non-empty name");
  });

  it("rejects a non-function activate", () => {
    expect(() => validatePlugin({ name: "bad", activate: true })).toThrow(
      "activate must be a function",
    );
  });
});

describe("loadPlugin", () => {
  it("loads a default-exported plugin from a relative path", async () => {
    const { directory } = await pluginFile(
      'export default { name: "demo", description: "Demo plugin" };\n',
    );

    const plugin = await loadPlugin("./plugin.mjs", directory);

    expect(plugin.name).toBe("demo");
  });

  it("runs the activate function with the provided context", async () => {
    const { directory } = await pluginFile(
      [
        "export default {",
        '  name: "demo",',
        "  activate(context) {",
        '    context.logger.log("activated");',
        "  },",
        "};",
        "",
      ].join("\n"),
    );
    const logger = { log: vi.fn(), error: vi.fn() };
    const plugin = await loadPlugin("./plugin.mjs", directory);

    await plugin.activate?.({ logger, cwd: directory });

    expect(logger.log).toHaveBeenCalledWith("activated");
  });
});
