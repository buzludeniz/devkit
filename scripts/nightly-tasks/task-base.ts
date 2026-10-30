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
