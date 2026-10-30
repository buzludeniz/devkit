import { tasks } from "./nightly-tasks/index.js";
import { runNightlyTasks } from "./nightly-tasks/runner.js";

const MINIMUM_SUCCESSFUL_TASKS = 10;

async function main(): Promise<void> {
	console.log(`Running ${tasks.length} nightly maintenance tasks`);

	const summary = await runNightlyTasks(tasks);

	console.log(
		`\nSummary: ${summary.succeeded} succeeded, ${summary.failed} failed`,
	);

	if (summary.succeeded < MINIMUM_SUCCESSFUL_TASKS) {
		console.error(
			`Nightly run requires at least ${MINIMUM_SUCCESSFUL_TASKS} successful tasks; got ${summary.succeeded}.`,
		);
		process.exitCode = 1;
	}
}

main().catch((error: unknown) => {
	console.error("Nightly maintenance crashed:", error);
	process.exitCode = 1;
});
