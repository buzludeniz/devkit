---
id: "055"
title: "GitHub API release asset uploader helper"
status: ready
area: core
commit_message: "feat(core): add GitHub API release asset uploader helper (backlog 055)"
files:
  - packages/core/src/github.ts
  - packages/core/src/github.test.ts
---

## Goal

Typed REST client for GitHub API interactions with error recovery.

## Implementation Notes

- `GitHubClient` class: `constructor(token: string)`
- `getRelease(repo, tag): Result<Release, GitHubError>`
- `createRelease(repo, tag, body): Result<Release, GitHubError>`
- `uploadAsset(releaseId, filePath): Result<Asset, GitHubError>`
- All methods use `Result<T, E>` from core — never throw
- Retry on HTTP 429 rate limit responses

## Tests Required

- Mock fetch responses for each method
- Verify success path returns `Ok` with typed value
- Verify 4xx responses return `Err` with `GitHubError`
- Verify retry on 429
