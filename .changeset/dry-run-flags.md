---
"@buzludeniz/devkit-cli": minor
---

Add `--dry-run` to `devkit docs:generate` and `devkit release:changelog`. `docs:generate --dry-run` logs whether it would create or modify the output file (or that it is unchanged) without writing anything. `release:changelog --output <file> --dry-run` prints a line diff of the planned change and leaves the file untouched. Both exit 0.
