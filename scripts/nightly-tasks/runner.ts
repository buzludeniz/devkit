import type { NightlyTask, TaskResult } from "./task-base.js";

export interface NightlyRunSummary {
  succeeded: number;
  failed: number;
  results: TaskResult[];
}

/**
 * Runs every task sequentially and reports the outcome of each one.
 *
 * Tasks are intentionally independent: one failure never prevents the rest
 * from running, which is what makes "at least ten meaningful commits" possible
 * even when a single maintenance step has nothing to do.
 */
export async function runNightlyTasks(tasks: NightlyTask[]): Promise<NightlyRunSummary> {
  const results: TaskResult[] = [];

  for (const task of tasks) {
    const result = await task.run();
    results.push(result);
    const status = result.success ? "PASS" : "FAIL";
    console.log(`[${status}] ${result.name} (${result.durationMs}ms): ${result.message}`);
  }

  const succeeded = results.filter((result) => result.success).length;

  return {
    succeeded,
    failed: results.length - succeeded,
    results,
  };
}
