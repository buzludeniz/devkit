import { promises as fs } from "node:fs";

export interface ComplexityResult {
	file: string;
	score: number;
	lines: number;
	decisionPoints: number;
}

const DECISION_PATTERNS = [
	/\bif\s*\(/g,
	/\belse\s+if\s*\(/g,
	/\bfor\s*\(/g,
	/\bwhile\s*\(/g,
	/\bcase\s+/g,
	/\bcatch\s*\(/g,
	/\?\?/g,
	/\?\./g,
	/&&/g,
	/\|\|/g,
	/\s\?\s/g,
];

export async function analyzeComplexity(
	filePath: string,
): Promise<ComplexityResult> {
	const content = await fs.readFile(filePath, "utf-8");
	const lines = content.split("\n").length;

	let decisionPoints = 0;
	for (const pattern of DECISION_PATTERNS) {
		const matches = content.match(pattern);
		decisionPoints += matches ? matches.length : 0;
	}

	return {
		file: filePath,
		score: decisionPoints + 1,
		lines,
		decisionPoints,
	};
}
