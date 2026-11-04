---
id: "032"
title: "plugin manifest schema and lifecycle hooks"
status: ready
area: core
commit_message: "feat(core): define plugin manifest schema and lifecycle hooks (backlog 032)"
files:
  - packages/core/src/plugin.ts
  - packages/core/src/plugin.test.ts
---

## Goal

Standardize plugin interface with `onInit`, `onCommand`, `onExit`, and configuration contracts.

## Implementation Notes

- Define `Plugin` interface: `{ name, version, onInit?(ctx), onCommand?(name, args, ctx), onExit?(ctx) }`
- Define `PluginManifest` with schema validation
- Export `loadPlugin(path)` that dynamically imports and validates the plugin

## Tests Required

- Verify interface shape matches expected contract
- Verify `loadPlugin` validates required fields and throws on invalid
- Verify lifecycle hook calling order: onInit → onCommand → onExit
