import { promises as fs } from "node:fs";
import path from "node:path";

export interface GenerateOptions {
	template: string;
	targetDir: string;
	projectName: string;
}

const TEMPLATES_DIR = path.join(__dirname, "templates");

const TEMPLATE_FILES: Record<
	string,
	Array<{ source: string; dest: string }>
> = {
	"node-app": [{ source: "node-app.json", dest: "package.json" }],
	"react-app": [{ source: "react-app.json", dest: "package.json" }],
};

export async function generateProject(options: GenerateOptions): Promise<void> {
	const { template, targetDir, projectName } = options;

	const templateFiles = TEMPLATE_FILES[template];
	if (!templateFiles) {
		throw new Error(`Unknown template: ${template}`);
	}

	await fs.mkdir(targetDir, { recursive: true });

	for (const { source, dest } of templateFiles) {
		const srcPath = path.join(TEMPLATES_DIR, source);
		const destPath = path.join(targetDir, dest);

		let content = await fs.readFile(srcPath, "utf-8");
		content = content.replace(/\{\{name\}\}/g, projectName);

		await fs.writeFile(destPath, content, "utf-8");
	}
}
