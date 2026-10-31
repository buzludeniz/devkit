import type { NightlyTask } from "./task-base.js";
import { ProjectStatusTask } from "./tasks/01-project-status.js";
import { ArchitectureDocTask } from "./tasks/02-architecture-doc.js";
import { DependencyInventoryTask } from "./tasks/03-dependency-inventory.js";
import { CodeMetricsTask } from "./tasks/04-code-metrics.js";
import { TodoReportTask } from "./tasks/05-todo-report.js";
import { ChangelogPreviewTask } from "./tasks/06-changelog-preview.js";
import { TestInventoryTask } from "./tasks/07-test-inventory.js";
import { LinkCheckTask } from "./tasks/08-link-check.js";
import { PackageMetadataTask } from "./tasks/09-package-metadata.js";
import { ApiReferenceTask } from "./tasks/10-api-reference.js";

/**
 * Registry of nightly maintenance tasks.
 *
 * Each task is independent and commits its own change, so a single failure
 * cannot take down the rest of the run. The order is deliberate: documents are
 * generated first, then checked, and the project status is refreshed last so
 * its counts include everything produced by the current run.
 */
export const tasks: NightlyTask[] = [
	new ArchitectureDocTask(),
	new DependencyInventoryTask(),
	new CodeMetricsTask(),
	new TodoReportTask(),
	new ChangelogPreviewTask(),
	new TestInventoryTask(),
	new ApiReferenceTask(),
	new LinkCheckTask(),
	new PackageMetadataTask(),
	new ProjectStatusTask(),
];
