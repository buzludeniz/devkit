---
id: "026"
title: "package.json metadata analyzer utility"
status: ready
area: core
commit_message: "feat(core): add package.json metadata analyzer utility (backlog 026)"
files:
  - packages/core/src/package.ts
  - packages/core/src/package.test.ts
---

## Goal

Utility in core to parse workspace dependencies, exports, and ESM compatibility.

## Implementation Notes

- `parsePackageJson(path)`: returns `{ name, version, deps, devDeps, peerDeps, exports, type, esm: boolean }`
- `findWorkspacePackages(root)`: discover all workspace package.json via pnpm-workspace.yaml
- ESM detection: `type === 'module'` or exports map present

## Tests Required

- Parse fixture package.json files
- Verify ESM detection logic
- Verify workspace discovery from pnpm-workspace.yaml
