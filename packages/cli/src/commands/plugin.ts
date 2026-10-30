import { Command } from "commander";

export function pluginLoadCommand(): Command {
	return new Command("plugin:load")
		.description("Load a devkit plugin")
		.argument("<name>", "plugin name or path")
		.action((name) => {
			console.log(`Loading plugin: ${name}`);
		});
}
