# Plugins

A DevKit plugin is a JavaScript module that exports an object with a `name` and
an optional `activate` function.

```js
// tools/my-plugin.mjs
export default {
	name: "release-notes",
	description: "Print a reminder before publishing",
	activate({ logger, cwd }) {
		logger.log(`Plugin running in ${cwd}`);
	},
};
```

Load it with a relative path or a package name:

```bash
devkit plugin:load ./tools/my-plugin.mjs --run
devkit plugin:load some-devkit-plugin
```

## Contract

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `name` | string | yes | Must be non-empty. |
| `description` | string | no | Printed by `plugin:load`. |
| `activate` | function | no | Receives `{ logger, cwd }`. May be async. |

`plugin:load` validates the module before activating it. A module without a name,
or with a non-function `activate`, is rejected with a message that names the
problem. Named exports work as well as a default export.

## Why a load command?

Plugins are loaded in-process with a dynamic `import()`. That keeps the contract
small and makes a plugin easy to develop against a local file before publishing
it as a package.
