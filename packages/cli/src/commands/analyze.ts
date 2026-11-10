import { Command } from "commander";
import { analyzeComplexity } from "./analyze-complexity.js";

export function analyzeCommand(): Command {
  return new Command("analyze")
    .description("Analyze code complexity")
    .argument("<path>", "file to analyze")
    .option("--json", "print the result as JSON")
    .action(async (path: string, options: { json?: boolean }) => {
      try {
        const result = await analyzeComplexity(path);
        if (options.json) {
          const { file, score, lines, decisionPoints } = result;
          console.log(JSON.stringify({ file, score, lines, decisionPoints }, null, 2));
          return;
        }
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
