---
"@buzludeniz/devkit-cli": minor
---

Add `--json` to `devkit git status` and `devkit analyze <file>`. `git status --json` prints the status object (`clean`, `branch`, `staged`, `modified`, `untracked`); `analyze --json` prints `{ file, score, lines, decisionPoints }`. Output without the flag and exit codes are unchanged.
