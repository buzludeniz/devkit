---
id: "059"
title: "multi-model fallback chain on provider rate limits"
status: ready
area: nightly
commit_message: "feat(nightly): multi-model fallback chain on provider rate limits (backlog 059)"
files:
  - scripts/nightly-agent.ps1
---

## Goal

Automatically switch to backup model when primary model hits free quota exhaustion.

## Implementation Notes

- Add `-FallbackModels` parameter (array, default: `@("opencode/gemini-flash-free", "opencode/qwen-coder-free")`)
- In `Invoke-OpenCode`: if exit code is 429 or output contains `"rate limit"` or `"quota"`, retry with the next fallback model
- Log model switches clearly

## Tests Required

- Mock opencode exit codes to simulate rate limit (exit 429)
- Verify fallback is triggered and next model used
- Verify log message contains model switch info
