import { Command } from "commander";

export function versionCommand(): Command {
	return new Command("version")
		.description("Show the devkit version")
		.action(() => {
			console.log("devkit version 0.1.0");
		});
}
