import { createHash } from "node:crypto";
import { join } from "node:path";
import { upsertHistoryRow, writeIfChanged } from "./lib/fs.js";
import { commitPaths } from "./lib/git.js";
import { repoRoot } from "./lib/repo.js";

export interface TaskResult {
  /** Stable identifier for the task, e.g. "update-dependencies". */
  name: string;
  /** Whether the task completed without throwing. */
  success: boolean;
  /** Human-readable outcome, including why a task was skipped. */
  message: string;
  /** Wall-clock duration in milliseconds. */
  durationMs: number;
}

export interface NightlyTask {
  readonly name: string;
  readonly description: string;
  run(): Promise<TaskResult>;
}

/**
 * Shared scaffolding for nightly maintenance tasks.
 *
 * Subclasses implement {@link execute} and return a short message describing
 * what changed. Throwing marks the task as failed; returning normally marks it
 * as succeeded even when the task skipped itself because there was no work.
 */
export abstract class BaseTask implements NightlyTask {
  abstract readonly name: string;
  abstract readonly description: string;

  protected abstract execute(): Promise<string>;

  async run(): Promise<TaskResult> {
    const startedAt = Date.now();
    try {
      const message = await this.execute();
      return {
        name: this.name,
        success: true,
        message,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      return {
        name: this.name,
        success: false,
        message: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      };
    }
  }
}

/**
 * Base class for tasks whose output is a generated report committed to the
 * repository.
 *
 * Every run appends a run-stamped row to `docs/metrics/history/<name>.csv`.
 * That row is the audit trail proving the task executed, and it also means a
 * stable report still produces exactly one commit per run. Only the report and
 * its history file are staged, so a task cannot capture unrelated work.
 */
export abstract class ReportTask extends BaseTask {
  /** Repository-relative path of the generated report. */
  abstract readonly reportPath: string;
  /** Conventional commit message used when the task produces a change. */
  abstract readonly commitMessage: string;
  /** Repository root the report is generated in. */
  protected readonly root: string;

  constructor(root: string = repoRoot) {
    super();
    this.root = root;
  }

  protected abstract buildReport(): Promise<string>;

  protected async execute(): Promise<string> {
    const content = await this.buildReport();
    const normalised = content.endsWith("\n") ? content : `${content}\n`;
    const reportChanged = await writeIfChanged(join(this.root, this.reportPath), normalised);

    const historyPath = `docs/metrics/history/${this.name}.csv`;
    const historyChanged = await upsertHistoryRow(
      join(this.root, historyPath),
      "run,bytes,lines,fingerprint",
      new Date().toISOString(),
      [
        Buffer.byteLength(normalised, "utf8"),
        normalised.split("\n").length - 1,
        createHash("sha256").update(normalised).digest("hex").slice(0, 12),
      ],
    );

    if (!reportChanged && !historyChanged) {
      return "no changes";
    }

    const committed = await commitPaths(
      this.commitMessage,
      [this.reportPath, historyPath],
      this.root,
    );

    if (!committed) {
      throw new Error(`Report ${this.reportPath} changed but no commit could be created`);
    }

    if (reportChanged) {
      return `updated ${this.reportPath}`;
    }

    return "recorded history";
  }
}
