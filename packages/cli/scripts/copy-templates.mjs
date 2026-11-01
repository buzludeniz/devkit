import { cpSync } from "node:fs";

cpSync(
  new URL("../src/commands/templates/", import.meta.url),
  new URL("../dist/commands/templates/", import.meta.url),
  { recursive: true },
);
