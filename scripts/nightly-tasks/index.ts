import type { NightlyTask } from "./task-base.js";

/**
 * Registry of nightly maintenance tasks.
 *
 * Each task is independent and commits its own change, so a single failure
 * cannot take down the rest of the run.
 */
export const tasks: NightlyTask[] = [];
