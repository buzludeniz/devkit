# Commands

Every command is registered by `createProgram()` in
`packages/cli/src/commander.ts`.

## Project

### `devkit init`

Scaffold a new project from a built-in template.

```bash
devkit init --name my-service --template node-app
devkit init --name my-ui --template react-app --dir ./apps
```

Options: `-t, --template <name>`, `-d, --dir <directory>`, `-n, --name <name>`,
`-f, --force`.

The command refuses to overwrite an existing `package.json` and exits non-zero
unless `--force` is passed. Other files in the target directory are left alone.

The same guard is available to library callers of `generateProject`: it throws
a `CoreError` with code `EEXIST` before writing anything unless `force: true`
is set. Every write is skipped when the guard throws, so a failed run leaves
the target directory untouched.

### `devkit analyze <file>`

Estimate cyclomatic complexity for a TypeScript file.

```bash
devkit analyze ./src/index.ts
```

The score is the number of decision points plus one. Decision points cover
`if`/`else if`, loops, `case`, `catch`, nullish and logical operators, optional
chaining and ternaries. Comments and the contents of single-quoted,
double-quoted and template string literals are ignored, and each branch of an
`else if` chain counts once.

## Repository

### `devkit git status`

Show the current branch and staged, modified and untracked files. A file with
both staged and unstaged changes appears in both lists. Renames are reported
under their new path.

### `devkit git branches`

List local branches and mark the current one.

## Quality

### `devkit doctor`

Check development toolchain and repository health (Node.js >= 20, pnpm, git, repository root).

```bash
devkit doctor
devkit doctor --json
```

Exits 0 if all checks pass, 1 if any check fails. With `--json`, outputs `{ checks: [{ name, ok, detail }] }`.

### `devkit api:test <url>`

Send a GET request and assert the response status.

```bash
devkit api:test https://api.example.com/health --expect 200 --timeout 5000 --retries 3
```

Exits non-zero on a status mismatch, a network error or a timeout. Transient failures (network errors, HTTP 408, 429, and 5xx) are retried with exponential backoff (defaults to 2 retries; pass `--retries 0` to disable).

### `devkit env:load <file>`

Parse a dotenv-style file and print its variables. Values can be masked for
screenshots and logs.

```bash
devkit env:load .env --required API_URL,TOKEN --mask
```

Options: `-r, --required <keys>`, `-m, --mask`, `-j, --json`.

### `devkit docs:generate`

Generate Markdown API documentation from exported symbols that carry a JSDoc
block.

```bash
devkit docs:generate --source packages --output docs/generated/api.md
```

## Release

### `devkit release:changelog`

Build a changelog from Conventional Commits between two refs.

```bash
devkit release:changelog --from v0.1.0 --to HEAD --version 0.2.0
devkit release:changelog --from v0.1.0 --output CHANGELOG.next.md
```

Internal types (`chore`, `ci`, `test`, `style`, `build`) are omitted unless
`--all` is passed. Breaking changes are always included.

### `devkit version`

Print the installed DevKit version.

### `devkit hello`

Print a greeting; useful for checking that the binary is wired up.

## Plugins

### `devkit plugin:load <name>`

Load a plugin from a package name or a local path, validate its shape and
optionally run it.

```bash
devkit plugin:load ./tools/my-plugin.mjs --run
```

See [Plugins](/plugins) for the plugin contract.
