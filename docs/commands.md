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

Options: `-t, --template <name>`, `-d, --dir <directory>`, `-n, --name <name>`.

### `devkit analyze <file>`

Estimate cyclomatic complexity for a TypeScript file.

```bash
devkit analyze ./src/index.ts
```

The score is the number of decision points plus one. Decision points cover
`if`/`else if`, loops, `case`, `catch`, nullish and logical operators, optional
chaining and ternaries.

## Repository

### `devkit git status`

Show the current branch and staged, modified and untracked files.

### `devkit git branches`

List local branches and mark the current one.

## Quality

### `devkit api:test <url>`

Send a GET request and assert the response status.

```bash
devkit api:test https://api.example.com/health --expect 200 --timeout 5000
```

Exits non-zero on a status mismatch, a network error or a timeout.

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
