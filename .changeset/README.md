# Changesets

Use `pnpm changeset` to add a changeset file describing your change. The nightly
automation and release workflow consume these files for semantic versioning and
changelog generation.

## Adding a changeset

```bash
pnpm changeset
```

This creates a markdown file in `.changeset/` with a frontmatter block like:

```markdown
---
"@buzludeniz/devkit-core": patch
"@buzludeniz/devkit-cli": minor
---

Add new `init` command for project scaffolding
```

## Releasing

The `release` GitHub Action runs on pushes to `main` that include version bump
commits. It runs `changeset version` and `changeset publish` to publish to npm.
