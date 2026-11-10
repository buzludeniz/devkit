import { Command } from "commander";
import { analyzeComplexity } from "./analyze-complexity.js";

export function analyzeCommand(): Command {
  return new Command("analyze")
    .description("Analyze code complexity")
    .argument("<path>", "file to analyze")
    .action(async (path: string) => {
      try {
        const result = await analyzeComplexity(path);
        console.log(`File: ${result.file}`);
        console.log(`Lines: ${result.lines}`);
        console.log(`Decision points: ${result.decisionPoints}`);
        console.log(`Complexity score: ${result.score}`);
      } catch (error) {
        console.error(
          `Failed to analyze ${path}: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
}
