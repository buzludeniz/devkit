---
"@buzludeniz/devkit-core": minor
"@buzludeniz/devkit-cli": minor
---

Rename the packages from `@devkit/core` and `@devkit/cli` to `@buzludeniz/devkit-core` and `@buzludeniz/devkit-cli` (the `@devkit` npm scope belongs to an unrelated project). Both packages are now native ES modules with `types`/`import`/`default` export conditions, which fixes the built `devkit` binary crashing on start with `ERR_PACKAGE_PATH_NOT_EXPORTED`. Node.js 22 or newer is now required. The `devkit` binary name is unchanged.
