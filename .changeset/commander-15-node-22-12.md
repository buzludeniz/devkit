---
"@buzludeniz/devkit-cli": minor
---

Upgrade `commander` from 12 to 15. Help output is unchanged, but two behaviours differ:

- Passing more positional arguments than a command declares is now an error instead of being silently ignored. For example `devkit hello extra` now prints `error: too many arguments for 'hello'. Expected 0 arguments but got 1: extra.` and exits 1.
- The CLI now requires Node.js 22.12 or newer (`engines.node` is `>=22.12.0`), because commander 15 is ESM-only and needs `require(esm)` support.
