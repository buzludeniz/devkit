import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { Command } from "commander";

const execFileAsync = promisify(execFile);

export interface ChangelogEntry {
  hash: string;
  type: string;
  scope?: string;
  description: string;
  breaking: boolean;
}

export interface ChangelogOptions {
  version?: string;
  includeInternal?: boolean;
}

const SECTION_BY_TYPE: Record<string, string> = {
  feat: "Features",
  fix: "Bug fixes",
  perf: "Performance",
  docs: "Documentation",
  refactor: "Refactoring",
  build: "Build",
  chore: "Internal",
  ci: "Internal",
  test: "Internal",
  style: "Internal",
};

const INTERNAL_TYPES = new Set(["chore", "ci", "test", "style", "build"]);

/**
 * Parses a Conventional Commit subject such as `feat(cli)!: drop Node 18`.
 *
 * Returns `null` for subjects that do not follow the convention.
 */
export function parseCommitSubject(subject: string, hash = ""): ChangelogEntry | null {
  const match =
    /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<description>.+)$/i.exec(
      subject.trim(),
    );

  if (!match?.groups) {
    return null;
  }

  return {
    hash,
    type: match.groups.type.toLowerCase(),
    scope: match.groups.scope,
    description: match.groups.description,
    breaking: match.groups.breaking === "!",
  };
}

export function buildChangelog(
  entries: readonly ChangelogEntry[],
  options: ChangelogOptions = {},
): string {
  const version = options.version ?? "Unreleased";
  const sections = new Map<string, string[]>();

  for (const entry of entries) {
    if (!options.includeInternal && INTERNAL_TYPES.has(entry.type) && !entry.breaking) {
      continue;
    }

    const section = entry.breaking ? "Breaking changes" : (SECTION_BY_TYPE[entry.type] ?? "Other");
    const prefix = entry.scope ? `**${entry.scope}:** ` : "";
    const hash = entry.hash ? ` (${entry.hash})` : "";
    const line = `- ${prefix}${entry.description}${hash}`;
    const bucket = sections.get(section) ?? [];
    bucket.push(line);
    sections.set(section, bucket);
  }

  if (sections.size === 0) {
    return `## ${version}\n\nNo user-facing changes.\n`;
  }

  const lines = [`## ${version}`, ""];

  for (const section of [
    "Breaking changes",
    "Features",
    "Bug fixes",
    "Performance",
    "Documentation",
    "Refactoring",
    "Build",
    "Other",
    "Internal",
  ]) {
    const bucket = sections.get(section);
    if (!bucket || bucket.length === 0) {
      continue;
    }
    lines.push(`### ${section}`, "", ...bucket, "");
  }

  return lines.join("\n");
}

export async function readCommits(
  from: string,
  to = "HEAD",
  cwd: string = process.cwd(),
): Promise<ChangelogEntry[]> {
  const args = ["log", "--pretty=format:%h|%s"];
  if (from) {
    args.push(`${from}..${to}`);
  } else {
    args.push("-50", to);
  }

  const { stdout } = await execFileAsync("git", args, { cwd });
  const entries: ChangelogEntry[] = [];

  for (const line of stdout.split("\n")) {
    const [hash, ...subjectParts] = line.split("|");
    const parsed = parseCommitSubject(subjectParts.join("|"), hash);
    if (parsed) {
      entries.push(parsed);
    }
  }

  return entries;
}

export function releaseChangelogCommand(): Command {
  return new Command("release:changelog")
    .description("Generate a changelog from Conventional Commits")
    .option("--from <ref>", "start ref, exclusive", "")
    .option("--to <ref>", "end ref, inclusive", "HEAD")
    .option("--version <label>", "version heading", "Unreleased")
    .option("--all", "include internal commits", false)
    .option("-o, --output <file>", "write the changelog to a file")
    .action(
      async (options: {
        from: string;
        to: string;
        version: string;
        all: boolean;
        output?: string;
      }) => {
        const entries = await readCommits(options.from, options.to);
        const changelog = buildChangelog(entries, {
          version: options.version,
          includeInternal: options.all,
        });

        if (options.output) {
          await writeFile(options.output, changelog, "utf8");
          console.log(`Wrote ${entries.length} commits to ${options.output}`);
          return;
        }

        console.log(changelog.trimEnd());
      },
    );
}
