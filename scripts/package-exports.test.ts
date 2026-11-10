import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Guards the published package shape. The CLI once shipped as CommonJS while
// `@buzludeniz/devkit-core` only exposed an `import` condition, so the built
// binary crashed on start with ERR_PACKAGE_PATH_NOT_EXPORTED. Vitest resolves
// workspace packages through Vite, so these checks ask Node itself.

const packages = ["core", "cli"] as const;

interface Manifest {
  name: string;
  type?: string;
  exports?: Record<string, Record<string, string>>;
  dependencies?: Record<string, string>;
}

function manifest(pkg: (typeof packages)[number]): Manifest {
  return JSON.parse(
    readFileSync(new URL(`../packages/${pkg}/package.json`, import.meta.url), "utf8"),
  ) as Manifest;
}

const cliDir = new URL("../packages/cli/", import.meta.url);

function nodeEval(source: string, inputType: "module" | "commonjs"): string {
  return execFileSync(process.execPath, [`--input-type=${inputType}`, "-e", source], {
    cwd: cliDir,
    encoding: "utf8",
  });
}

describe("workspace package exports", () => {
  it.each(packages)("%s is ESM with types, import and default conditions", (pkg) => {
    const { name, type, exports } = manifest(pkg);

    expect(name).toMatch(/^@buzludeniz\/devkit-/);
    expect(type).toBe("module");
    expect(Object.keys(exports?.["."] ?? {})).toEqual(["types", "import", "default"]);
  });

  it("lets the CLI resolve core from both ESM and CommonJS callers", () => {
    const core = manifest("core").name;
    expect(manifest("cli").dependencies).toHaveProperty(core);

    const viaRequire = nodeEval(
      `process.stdout.write(require.resolve(${JSON.stringify(core)}))`,
      "commonjs",
    );
    const viaImport = nodeEval(
      `process.stdout.write(import.meta.resolve(${JSON.stringify(core)}))`,
      "module",
    );

    expect(viaRequire).toMatch(/packages[\\/]core[\\/]dist[\\/]index\.js$/);
    expect(viaImport).toMatch(/packages\/core\/dist\/index\.js$/);
  });
});
