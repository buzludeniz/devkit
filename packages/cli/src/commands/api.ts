import { Command } from "commander";

export function apiTestCommand(): Command {
	return new Command("api:test")
		.description("Test an API endpoint")
		.argument("<url>", "API endpoint URL")
		.action((url) => {
			console.log(`Testing API: ${url}`);
		});
}
