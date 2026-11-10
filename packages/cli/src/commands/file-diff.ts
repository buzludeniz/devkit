function toLines(content: string): string[] {
  const lines = content.split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

/**
 * Renders a line diff between the current contents of `path` (`null` when the
 * file does not exist yet) and the contents a command is about to write.
 *
 * Unchanged lines are prefixed with a space, removed lines with `-` and added
 * lines with `+`, after `---`/`+++` headers. Used by `--dry-run` previews.
 */
export function renderFileDiff(path: string, before: string | null, after: string): string {
  if (before === after) return `No changes to ${path}`;

  const oldLines = before === null ? [] : toLines(before);
  const newLines = toLines(after);

  // Longest common subsequence table, filled from the end.
  const lcs: number[][] = Array.from({ length: oldLines.length + 1 }, () =>
    new Array<number>(newLines.length + 1).fill(0),
  );
  for (let i = oldLines.length - 1; i >= 0; i--) {
    for (let j = newLines.length - 1; j >= 0; j--) {
      lcs[i][j] =
        oldLines[i] === newLines[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const output = [`--- ${before === null ? "/dev/null" : path}`, `+++ ${path}`];
  let i = 0;
  let j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      output.push(` ${oldLines[i]}`);
      i++;
      j++;
    } else if (i < oldLines.length && (j === newLines.length || lcs[i + 1][j] >= lcs[i][j + 1])) {
      output.push(`-${oldLines[i]}`);
      i++;
    } else {
      output.push(`+${newLines[j]}`);
      j++;
    }
  }

  return output.join("\n");
}
