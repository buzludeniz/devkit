import { Command } from "commander";

export function analyzeCommand(): Command {
	return new Command("analyze")
		.description("Analyze code complexity and dependencies")
		.argument("<path>", "file or directory to analyze")
		.action((path) => {
			console.log(`Analyzing ${path}...`);
		});
}
