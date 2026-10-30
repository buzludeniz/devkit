import { Command } from "commander";

export function releaseChangelogCommand(): Command {
	return new Command("release:changelog")
		.description("Generate changelog for next release")
		.action(() => {
			console.log("Generating changelog...");
		});
}
