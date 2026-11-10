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

### `devkit template list`

List the built-in project templates for `devkit init --template`, with the
description stored in each template file.

```bash
devkit template list
devkit template list --json
```

```text
node-app   A new Node.js application
react-app  A new React application
```

With `--json`, the command prints only an array of `{ name, description }`
objects. Template files that are not valid JSON or have no `description` are
skipped instead of failing the command.

### `devkit config`

Read and write project settings in `.devkitrc.json` in the current directory.

```bash
devkit config list
devkit config get template
devkit config set template react-app
devkit config set color false
```

| Key | Type | Default |
| --- | --- | --- |
| `template` | non-empty string | `node-app` |
| `outputDir` | non-empty string | `.` |
| `color` | `true` or `false` | `true` |

`list` prints the effective settings, including defaults for keys that are not
in the file. `get` prints one value. `set` writes the key to `.devkitrc.json`,
creating the file when missing and keeping any other keys already stored.

Unknown keys and invalid values (including an empty string or a boolean other
than `true`/`false`) exit 1 and leave the file unchanged.

### `devkit analyze <file>`

Estimate cyclomatic complexity for a TypeScript file.

```bash
devkit analyze ./src/index.ts
devkit analyze ./src/index.ts --json
```

The score is the number of decision points plus one. Decision points cover
`if`/`else if`, loops, `case`, `catch`, nullish and logical operators, optional
chaining and ternaries. Comments and the contents of single-quoted,
double-quoted and template string literals are ignored, and each branch of an
`else if` chain counts once.

With `--json`, the command prints only a JSON object with the keys `file`,
`score`, `lines` and `decisionPoints`. Errors still go to stderr with exit
code 1.

## Configuration

### `devkit config`

Read and write project settings in `.devkitrc.json` in the current directory.

```bash
devkit config list
devkit config get template
devkit config set template react-app
devkit config set color false
```

`list` prints every setting, falling back to defaults when the file is missing.
`get <key>` prints one value. `set <key> <value>` merges the value into
`.devkitrc.json`, creating the file when needed.

Allowed keys:

| Key | Type | Default |
| --- | --- | --- |
| `template` | non-empty string | `node-app` |
| `outputDir` | non-empty string | `.` |
| `color` | `true` or `false` | `true` |

An unknown key or invalid value prints an error, exits 1, and leaves the file
unchanged.

## Repository

### `devkit git status`

Show the current branch and staged, modified and untracked files. A file with
both staged and unstaged changes appears in both lists. Renames are reported
under their new path.

```bash
devkit git status
devkit git status --json
```

With `--json`, the command prints only the status object (`clean`, `branch`,
`staged`, `modified`, `untracked`) as JSON. Errors still go to stderr with exit
code 1.

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
devkit docs:generate --source packages --dry-run
```

With `--dry-run`, nothing is written. The command logs the output file it would
touch: `Would create <file>`, `Would modify <file>`, or `Unchanged <file>` when
the page is already up to date, followed by the export count. It exits 0.

## Release

### `devkit release:changelog`

Build a changelog from Conventional Commits between two refs.

```bash
devkit release:changelog --from v0.1.0 --to HEAD --version 0.2.0
devkit release:changelog --from v0.1.0 --output CHANGELOG.next.md
```

Internal types (`chore`, `ci`, `test`, `style`, `build`) are omitted unless
`--all` is passed. Breaking changes are always included.

`--dry-run` together with `--output <file>` prints a line diff between the
current file (or `/dev/null` when it does not exist) and the changelog that
would be written, then `Dry run: <file> was not written`. The file is not
created or modified, and the command exits 0. Without `--output` the changelog
already goes to stdout, so `--dry-run` changes nothing.

```bash
devkit release:changelog --from v0.1.0 --version 0.2.0 --output CHANGELOG.md --dry-run
```

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
