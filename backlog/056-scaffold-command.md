---
id: "056"
title: "scaffold command for custom monorepo packages"
status: ready
area: cli
commit_message: "feat(cli): add devkit scaffold command for custom monorepo packages (backlog 056)"
files:
  - packages/cli/src/commands/scaffold.ts
  - packages/cli/src/commands/scaffold.test.ts
---

## Goal

Scaffold new packages under `packages/*` with tsconfig, vitest, and package.json.

## Implementation Notes

- `devkit scaffold <name> --type lib|cli`
- Creates `packages/<name>/` with:
  - `package.json` with `name: @buzludeniz/devkit-<name>`, `type: module`
  - `tsconfig.json` extending root tsconfig
  - `src/index.ts` stub
  - `src/index.test.ts` stub
  - `vitest.config.ts`

## Tests Required

- Verify full directory structure is created
- Verify `package.json` fields (name, version, type)
- Verify `tsconfig.json` extends root correctly
