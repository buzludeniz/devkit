import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadEnvFile, maskValue, missingKeys, parseEnvContent } from "./env";

const created: string[] = [];

afterEach(async () => {
  await Promise.all(
    created.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("parseEnvContent", () => {
  it("skips comments and blank lines and honours export", () => {
    const values = parseEnvContent(
      ["# comment", "", "export API_URL=https://example.test", "PORT=3000"].join("\n"),
    );

    expect(values).toEqual({
      API_URL: "https://example.test",
      PORT: "3000",
    });
  });

  it("strips matching quotes and keeps inner spaces", () => {
    const values = parseEnvContent(
      ['MESSAGE="hello world"', "TOKEN='abc123'", "RAW=a=b"].join("\n"),
    );

    expect(values.MESSAGE).toBe("hello world");
    expect(values.TOKEN).toBe("abc123");
    expect(values.RAW).toBe("a=b");
  });

  it("reports the line number of a malformed entry", () => {
    expect(() => parseEnvContent("VALID=1\nnot-an-assignment")).toThrow(
      "Invalid environment line 2",
    );
  });
});

describe("loadEnvFile", () => {
  it("reads and parses a file from disk", async () => {
    const directory = await mkdtemp(join(tmpdir(), "devkit-env-"));
    created.push(directory);
    const file = join(directory, ".env");
    await writeFile(file, "API_KEY=secret\n", "utf8");

    await expect(loadEnvFile(file)).resolves.toEqual({ API_KEY: "secret" });
  });
});

describe("missingKeys", () => {
  it("returns only the required keys that are absent", () => {
    expect(missingKeys({ A: "1", C: "3" }, ["A", "B", "C"])).toEqual(["B"]);
  });
});

describe("maskValue", () => {
  it("keeps a short prefix and hides the rest", () => {
    expect(maskValue("super-secret-value")).toBe("supe********");
  });

  it("hides values too short to expose a prefix", () => {
    expect(maskValue("abc")).toBe("***");
  });
});
