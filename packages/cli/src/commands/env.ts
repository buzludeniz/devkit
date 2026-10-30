import { Command } from "commander";

export function envLoadCommand(): Command {
	return new Command("env:load")
		.description("Load environment variables from a file")
		.argument("<file>", "path to .env file")
		.action((file) => {
			console.log(`Loading env from ${file}`);
		});
}
