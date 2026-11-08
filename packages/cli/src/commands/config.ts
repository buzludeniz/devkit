import { promises as fs } from "node:fs";
import path from "node:path";
import { Command } from "commander";

export const CONFIG_FILE = ".devkitrc.json";

export interface DevkitConfig {
  template: string;
  outputDir: string;
  color: boolean;
}

export const DEFAULT_CONFIG: DevkitConfig = {
  template: "node-app",
  outputDir: ".",
  color: true,
};

const CONFIG_KEYS = ["template", "outputDir", "color"] as const;
export type ConfigKey = (typeof CONFIG_KEYS)[number];

export function isConfigKey(key: string): key is ConfigKey {
  return (CONFIG_KEYS as readonly string[]).includes(key);
}

function parseConfigValue(key: ConfigKey, raw: string): string | boolean {
  if (key === "color") {
    if (raw !== "true" && raw !== "false") {
      throw new Error(`Invalid value for color: "${raw}" (expected true or false)`);
    }
    return raw === "true";
  }

  if (raw.trim() === "") {
    throw new Error(`Invalid value for ${key}: value must not be empty`);
  }

  return raw;
}

export async function readConfig(cwd: string = process.cwd()): Promise<DevkitConfig> {
  const file = path.join(cwd, CONFIG_FILE);
  let raw: string;

  try {
    raw = await fs.readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { ...DEFAULT_CONFIG };
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${CONFIG_FILE} contains invalid JSON`);
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${CONFIG_FILE} must contain a JSON object`);
  }

  const values = parsed as Record<string, unknown>;
  const config = { ...DEFAULT_CONFIG };

  if (typeof values.template === "string" && values.template.trim() !== "") {
    config.template = values.template;
  }
  if (typeof values.outputDir === "string" && values.outputDir.trim() !== "") {
    config.outputDir = values.outputDir;
  }
  if (typeof values.color === "boolean") {
    config.color = values.color;
  }

  return config;
}

export async function writeConfig(
  config: DevkitConfig,
  cwd: string = process.cwd(),
): Promise<void> {
  await fs.writeFile(path.join(cwd, CONFIG_FILE), `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

function reportError(message: string): void {
  console.error(message);
  process.exitCode = 1;
}

export function configCommand(): Command {
  const command = new Command("config").description(
    "Read and write project settings in .devkitrc.json",
  );

  command
    .command("list")
    .description("print current settings, including defaults")
    .action(async () => {
      const config = await readConfig();
      for (const key of CONFIG_KEYS) {
        console.log(`${key}=${config[key]}`);
      }
    });

  command
    .command("get")
    .description("print one setting")
    .argument("<key>", "setting name")
    .action(async (key: string) => {
      if (!isConfigKey(key)) {
        reportError(`Unknown config key: ${key}`);
        return;
      }

      const config = await readConfig();
      console.log(String(config[key]));
    });

  command
    .command("set")
    .description("write a setting to .devkitrc.json")
    .argument("<key>", "setting name")
    .argument("<value>", "setting value")
    .action(async (key: string, value: string) => {
      if (!isConfigKey(key)) {
        reportError(`Unknown config key: ${key}`);
        return;
      }

      let parsed: string | boolean;
      try {
        parsed = parseConfigValue(key, value);
      } catch (error) {
        reportError(error instanceof Error ? error.message : String(error));
        return;
      }

      const config = await readConfig();
      if (key === "color") {
        config.color = parsed as boolean;
      } else {
        config[key] = parsed as string;
      }

      await writeConfig(config);
      console.log(`${key}=${config[key]}`);
    });

  return command;
}
