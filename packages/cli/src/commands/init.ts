import { Command } from "commander";

export function initCommand(): Command {
	return new Command("init")
		.description("Scaffold a new project from a template")
		.requiredOption(
			"-t, --template <name>",
			"template to use (node-app, react-app)",
		)
		.option("-d, --dir <path>", "target directory", ".")
		.action((options) => {
			console.log(
				`Initializing project with template ${options.template} in ${options.dir}`,
			);
		});
}
