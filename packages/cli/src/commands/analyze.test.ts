import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { analyzeCommand } from "./analyze.js";

describe("devkit analyze", () => {
  let tempDir: string;
  let file: string;
  let logSpy: MockInstance<typeof console.log>;
  let errorSpy: MockInstance<typeof console.error>;
  let exitSpy: MockInstance<typeof process.exit>;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "devkit-analyze-"));
    file = path.join(tempDir, "sample.ts");
    await fs.writeFile(
      file,
      [
        "export function f(a: number) {",
        "  if (a > 1 && a < 5) return 1;",
        "  return 0;",
        "}",
      ].join("\n"),
      "utf8",
    );
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  function stdout(): string {
    return logSpy.mock.calls.map((call) => call.join(" ")).join("\n");
  }

  it("prints the human format without --json", async () => {
    await analyzeCommand().parseAsync(["node", "analyze", file]);

    expect(stdout()).toBe(
      [`File: ${file}`, "Lines: 4", "Decision points: 2", "Complexity score: 3"].join("\n"),
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("prints { file, score, lines, decisionPoints } as JSON with --json", async () => {
    await analyzeCommand().parseAsync(["node", "analyze", file, "--json"]);

    expect(logSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(stdout());
    expect(parsed).toEqual({ file, score: 3, lines: 4, decisionPoints: 2 });
    expect(Object.keys(parsed)).toEqual(["file", "score", "lines", "decisionPoints"]);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it("keeps exit code 1 and writes nothing to stdout for a missing file with --json", async () => {
    const missing = path.join(tempDir, "missing.ts");

    await analyzeCommand().parseAsync(["node", "analyze", missing, "--json"]);

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy.mock.calls[0]?.[0]).toContain(`Failed to analyze ${missing}:`);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
