import { Command } from "commander";

export function docsGenerateCommand(): Command {
	return new Command("docs:generate")
		.description("Generate documentation from source")
		.option("-o, --output <dir>", "output directory", "./docs")
		.action((options) => {
			console.log(`Generating docs to ${options.output}`);
		});
}
