---
id: "033"
title: "plugin:install from npm or git"
status: ready
area: cli
commit_message: "feat(cli): add devkit plugin:install from npm or git (backlog 033)"
files:
  - packages/cli/src/commands/plugin-install.ts
  - packages/cli/src/commands/plugin-install.test.ts
---

## Goal

Install third-party plugins and update `.devkitrc.json` plugins array.

## Implementation Notes

- Accept plugin name (npm package) or git URL
- Run `pnpm add` to install the package
- Update `.devkitrc.json` plugins array with the new entry
- Verify the plugin exports a valid manifest before finalizing

## Tests Required

- Mock `pnpm add` subprocess call
- Verify `.devkitrc.json` updated with new plugin
- Verify invalid plugin (missing manifest) is rejected
