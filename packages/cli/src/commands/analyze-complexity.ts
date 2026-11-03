import { promises as fs } from "node:fs";

export interface ComplexityResult {
  file: string;
  score: number;
  lines: number;
  decisionPoints: number;
}

const DECISION_PATTERNS = [
  /\bif\s*\(/g,
  /\bfor\s*\(/g,
  /\bwhile\s*\(/g,
  /\bcase\s+/g,
  /\bcatch\s*\(/g,
  /\?\?/g,
  /\?\./g,
  /&&/g,
  /\|\|/g,
  /\s\?\s/g,
];

/**
 * Remove comments and string literals so their contents never count as
 * decision points. Newlines are preserved to keep the source shape.
 */
function stripCommentsAndStrings(source: string): string {
  let result = "";
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "/" && next === "/") {
      while (index < source.length && source[index] !== "\n") {
        index++;
      }
      continue;
    }

    if (char === "/" && next === "*") {
      index += 2;
      while (index < source.length && !(source[index] === "*" && source[index + 1] === "/")) {
        if (source[index] === "\n") {
          result += "\n";
        }
        index++;
      }
      index += 2;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      index++;
      while (index < source.length) {
        if (source[index] === "\\") {
          index += 2;
          continue;
        }
        if (source[index] === char) {
          index++;
          break;
        }
        if (source[index] === "\n") {
          result += "\n";
        }
        index++;
      }
      continue;
    }

    result += char;
    index++;
  }

  return result;
}

export async function analyzeComplexity(filePath: string): Promise<ComplexityResult> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n").length;
  const code = stripCommentsAndStrings(content);

  let decisionPoints = 0;
  for (const pattern of DECISION_PATTERNS) {
    const matches = code.match(pattern);
    decisionPoints += matches ? matches.length : 0;
  }

  return {
    file: filePath,
    score: decisionPoints + 1,
    lines,
    decisionPoints,
  };
}
