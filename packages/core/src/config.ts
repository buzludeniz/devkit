import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { CoreError } from "./index.js";
import { type Result, err, ok } from "./result.js";

export interface DevKitConfig {
  name: string;
  version: string;
  plugins?: string[];
  [key: string]: unknown;
}

const CONFIG_CANDIDATES = ["devkit.config.json", ".devkitrc.json", ".devkitrc"];

/**
 * Searches for a devkit configuration file from the given directory.
 * If not found, falls back to parsing name and version from package.json if present.
 */
export function loadDevKitConfig(dir: string = process.cwd()): Result<DevKitConfig> {
  const absoluteDir = resolve(dir);

  for (const candidate of CONFIG_CANDIDATES) {
    const configPath = join(absoluteDir, candidate);
    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, "utf8");
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        if (!parsed.name || typeof parsed.name !== "string") {
          return err(
            new CoreError(
              `Configuration at ${candidate} must provide a string 'name'`,
              "INVALID_CONFIG",
            ),
          );
        }
        return ok({
          version: typeof parsed.version === "string" ? parsed.version : "0.0.0",
          ...parsed,
          name: parsed.name,
        } as DevKitConfig);
      } catch (e) {
        return err(
          new CoreError(
            `Failed to parse configuration at ${candidate}: ${e instanceof Error ? e.message : String(e)}`,
            "CONFIG_PARSE_ERROR",
          ),
        );
      }
    }
  }

  // Fallback to package.json
  const pkgPath = join(absoluteDir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const raw = readFileSync(pkgPath, "utf8");
      const pkg = JSON.parse(raw) as { name?: string; version?: string };
      if (pkg.name) {
        return ok({
          name: pkg.name,
          version: pkg.version ?? "0.0.0",
        });
      }
    } catch {
      // Ignore package.json read failure for default fallback
    }
  }

  return err(new CoreError(`No devkit configuration found in ${absoluteDir}`, "CONFIG_NOT_FOUND"));
}
