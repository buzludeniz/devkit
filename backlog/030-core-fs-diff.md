---
id: "030"
title: "file hashing and directory tree difference utility"
status: ready
area: core
commit_message: "feat(core): add file hashing and directory tree difference utility (backlog 030)"
files:
  - packages/core/src/fs-diff.ts
  - packages/core/src/fs-diff.test.ts
---

## Goal

Fast sha256 directory state hashing to detect file modifications without full disk walks.

## Implementation Notes

- `hashFile(path)`: returns sha256 hex of file content
- `hashDirectory(path, ignore)`: recursive `Map<relativePath, hash>`
- `diffDirectories(a, b)`: returns `{ added, removed, modified }` sets

## Tests Required

- Hash known files and verify determinism
- Detect modifications between two versions of a file
- Detect additions and removals across two temp directories
