import { Command } from "commander";

export function gitCommand(): Command {
	return new Command("git").description("Git workflow helpers").addCommand(
		new Command("status").description("Show working tree status").action(() => {
			console.log("Checking git status...");
		}),
	);
}
