---
id: "058"
title: "support priority tags in backlog front matter"
status: ready
area: nightly
commit_message: "feat(nightly): support priority tags in backlog front matter (backlog 058)"
files:
  - scripts/nightly-agent.ps1
  - .nightly/AGENT_PROMPT.md
---

## Goal

Enable `priority: high` and `type: feat` prioritization over `fix` in backlog sorting.

## Implementation Notes

- Modify `nightly-agent.ps1` `Get-ReadyItems`: sort by `priority` field (`high > normal > low`), then by `id`
- Update `.nightly/AGENT_PROMPT.md` to describe the `priority` field usage
- Backlog files can include `priority: high` in YAML front matter

## Tests Required

- Create or update `nightly-agent.test.ts` verifying sort order with mixed priorities
- Verify `high` priority items appear before `normal` and `low`
- Verify items with same priority are sorted by `id`
