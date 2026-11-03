import { promises as fs } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { analyzeComplexity } from "./analyze-complexity";

const { readFileMock } = vi.hoisted(() => ({ readFileMock: vi.fn() }));

vi.mock("node:fs", () => ({
  promises: {
    readFile: readFileMock,
  },
}));

describe("analyzeComplexity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("scores a simple function with one decision point", async () => {
    readFileMock.mockResolvedValue(
      [
        "export function add(a: number, b: number) {",
        "  if (a < 0) return 0;",
        "  return a + b;",
        "}",
      ].join("\n"),
    );

    const result = await analyzeComplexity("simple.ts");

    expect(result.file).toBe("simple.ts");
    expect(result.lines).toBe(4);
    expect(result.decisionPoints).toBe(1);
    expect(result.score).toBe(2);
  });

  it("counts loops, logical operators, and ternaries", async () => {
    readFileMock.mockResolvedValue(
      [
        "for (let i = 0; i < 10; i++) {",
        "  while (i > 5 && i < 8) {",
        "    const x = i > 6 || i === 2 ? 1 : 2;",
        "  }",
        "}",
      ].join("\n"),
    );

    const result = await analyzeComplexity("complex.ts");

    // for + while + && + || + ternary = 5 decision points
    expect(result.decisionPoints).toBe(5);
    expect(result.score).toBe(6);
  });

  it("ignores decision keywords inside line and block comments", async () => {
    readFileMock.mockResolvedValue(
      [
        "export function decide(value: number) {",
        "  // if (value > 1 && value < 10) return 1;",
        "  /* while (value ?? 0) {",
        "       for (;;) {",
        '         return value?.toString() || "";',
        "       }",
        "     } */",
        "  return value;",
        "}",
      ].join("\n"),
    );

    const result = await analyzeComplexity("comments.ts");

    expect(result.lines).toBe(9);
    expect(result.decisionPoints).toBe(0);
    expect(result.score).toBe(1);
  });

  it("ignores decision keywords inside single, double, and template strings", async () => {
    readFileMock.mockResolvedValue(
      [
        'const a = "if (x) && y";',
        "const b = 'for (;;) || z';",
        "const c = `while (x) ?? y`;",
        'const d = "else if (a) return b";',
        "const e = 'case catch ?. ?';",
      ].join("\n"),
    );

    const result = await analyzeComplexity("strings.ts");

    expect(result.decisionPoints).toBe(0);
    expect(result.score).toBe(1);
  });

  it("counts each else if branch once", async () => {
    readFileMock.mockResolvedValue(
      [
        "function grade(score: number) {",
        "  if (score > 90) {",
        '    return "a";',
        "  } else if (score > 80) {",
        '    return "b";',
        "  } else if (score > 70) {",
        '    return "c";',
        "  } else {",
        '    return "d";',
        "  }",
        "}",
      ].join("\n"),
    );

    const result = await analyzeComplexity("grades.ts");

    // Three branches: if + else if + else if. The trailing else is not a decision point.
    expect(result.decisionPoints).toBe(3);
    expect(result.score).toBe(4);
  });

  it("still counts real decision points around comments", async () => {
    readFileMock.mockResolvedValue(
      [
        "function scan(items: string[], value?: number) {",
        "  // if (value) return 0;",
        "  for (const item of items) {",
        "    while (value && item) {",
        "      switch (item) {",
        '        case "a":',
        "          return value ?? 0;",
        '        case "b":',
        "          return value?.length || 0;",
        "        default:",
        "          try {",
        "            return 1;",
        "          } catch (error) {",
        "            return 2;",
        "          }",
        "      }",
        "    }",
        "  }",
        "  return value ? 1 : 0;",
        "}",
      ].join("\n"),
    );

    const result = await analyzeComplexity("scan.ts");

    // for + while + && + case + ?? + case + ?. + || + catch + ternary
    expect(result.decisionPoints).toBe(10);
    expect(result.score).toBe(11);
  });

  it("propagates read errors", async () => {
    readFileMock.mockRejectedValue(new Error("ENOENT: no such file"));

    await expect(analyzeComplexity("missing.ts")).rejects.toThrow("ENOENT");
  });

  it("imports the fs promise API", () => {
    expect(typeof fs.readFile).toBe("function");
  });
});
