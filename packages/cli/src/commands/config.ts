import { existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Command } from "commander";

export const CONFIG_FILE = ".devkitrc.json";

export interface ProjectConfig {
  template: string;
  outputDir: string;
  color: boolean;
}

export const CONFIG_DEFAULTS: ProjectConfig = {
  template: "node-app",
  outputDir: ".",
  color: true,
};

export const CONFIG_KEYS = ["template", "outputDir", "color"] as const;

export type ConfigKey = (typeof CONFIG_KEYS)[number];

function isConfigKey(key: string): key is ConfigKey {
  return (CONFIG_KEYS as readonly string[]).includes(key);
}

export function configPath(cwd: string = process.cwd()): string {
  return join(cwd, CONFIG_FILE);
}

/** Reads the project config, filling in defaults for missing keys. */
export function readConfig(cwd: string = process.cwd()): ProjectConfig {
  const filePath = configPath(cwd);
  if (!existsSync(filePath)) {
    return { ...CONFIG_DEFAULTS };
  }

  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${CONFIG_FILE} must contain a JSON object`);
  }

  return {
    template: typeof parsed.template === "string" ? parsed.template : CONFIG_DEFAULTS.template,
    outputDir: typeof parsed.outputDir === "string" ? parsed.outputDir : CONFIG_DEFAULTS.outputDir,
    color: typeof parsed.color === "boolean" ? parsed.color : CONFIG_DEFAULTS.color,
  };
}

/** Validates a command-line value for an allowed key. */
export function parseConfigValue(key: ConfigKey, raw: string): string | boolean {
  if (key === "color") {
    if (raw === "true") return true;
    if (raw === "false") return false;
    throw new Error(`Invalid value for color: "${raw}". Use true or false.`);
  }

  const value = raw.trim();
  if (value === "") {
    throw new Error(`Invalid value for ${key}: expected a non-empty string.`);
  }
  return value;
}

async function readRawConfig(cwd: string): Promise<Record<string, unknown>> {
  const filePath = configPath(cwd);
  let content: string;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw error;
  }

  const parsed = JSON.parse(content) as unknown;
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${CONFIG_FILE} must contain a JSON object`);
  }
  return parsed as Record<string, unknown>;
}

function fail(error: unknown): void {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

export function configCommand(cwd: string = process.cwd()): Command {
  const config = new Command("config").description("Read and write project configuration");

  config
    .command("list")
    .description("Print current settings, including defaults")
    .action(() => {
      try {
        const current = readConfig(cwd);
        for (const key of CONFIG_KEYS) {
          console.log(`${key}=${String(current[key])}`);
        }
      } catch (error) {
        fail(error);
      }
    });

  config
    .command("get")
    .description("Print one setting")
    .argument("<key>", `one of ${CONFIG_KEYS.join(", ")}`)
    .action((key: string) => {
      try {
        if (!isConfigKey(key)) {
          throw new Error(`Unknown config key: ${key}`);
        }
        console.log(String(readConfig(cwd)[key]));
      } catch (error) {
        fail(error);
      }
    });

  config
    .command("set")
    .description(`Write a setting to ${CONFIG_FILE}`)
    .argument("<key>", `one of ${CONFIG_KEYS.join(", ")}`)
    .argument("<value>", "value to store")
    .action(async (key: string, value: string) => {
      try {
        if (!isConfigKey(key)) {
          throw new Error(`Unknown config key: ${key}`);
        }
        const parsed = parseConfigValue(key, value);
        const raw = await readRawConfig(cwd);
        raw[key] = parsed;
        await writeFile(configPath(cwd), `${JSON.stringify(raw, null, 2)}\n`, "utf8");
        console.log(`${key}=${String(parsed)}`);
      } catch (error) {
        fail(error);
      }
    });

  return config;
}
