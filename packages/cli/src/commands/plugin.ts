import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";

export interface PluginContext {
  logger: Pick<Console, "log" | "error">;
  cwd: string;
}

export interface DevKitPlugin {
  name: string;
  description?: string;
  activate?(context: PluginContext): void | Promise<void>;
}

/**
 * Checks the shape of a dynamically imported plugin module.
 *
 * A plugin is any object with a non-empty `name` and an optional `activate`
 * function. Everything else is rejected with a message naming the problem.
 */
export function validatePlugin(value: unknown): DevKitPlugin {
  if (typeof value !== "object" || value === null) {
    throw new Error("Plugin must export an object.");
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.name !== "string" || candidate.name.trim() === "") {
    throw new Error("Plugin must export a non-empty name.");
  }

  if (candidate.activate !== undefined && typeof candidate.activate !== "function") {
    throw new Error("Plugin activate must be a function.");
  }

  return {
    name: candidate.name,
    description: typeof candidate.description === "string" ? candidate.description : undefined,
    activate: candidate.activate as DevKitPlugin["activate"],
  };
}

/**
 * Loads a plugin from a package name or a path relative to `cwd`.
 *
 * Both default exports and named exports of the plugin object are accepted.
 */
export async function loadPlugin(
  specifier: string,
  cwd: string = process.cwd(),
): Promise<DevKitPlugin> {
  const isPath = specifier.startsWith(".") || isAbsolute(specifier) || specifier.includes("\\");
  const target = isPath ? pathToFileURL(resolve(cwd, specifier)).href : specifier;
  const module = (await import(target)) as Record<string, unknown>;

  return validatePlugin(module.default ?? module);
}

export function pluginLoadCommand(): Command {
  return new Command("plugin:load")
    .description("Load a devkit plugin and validate its shape")
    .argument("<name>", "plugin package name or path")
    .option("--run", "invoke the plugin activate function", false)
    .action(async (name: string, options: { run: boolean }) => {
      const plugin = await loadPlugin(name);
      console.log(`Loaded plugin: ${plugin.name}`);

      if (plugin.description) {
        console.log(plugin.description);
      }

      if (options.run) {
        if (!plugin.activate) {
          console.log("Plugin does not define activate.");
          return;
        }
        await plugin.activate({ logger: console, cwd: process.cwd() });
      }
    });
}
