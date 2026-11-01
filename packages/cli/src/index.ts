#!/usr/bin/env node
import { createProgram } from "./commander";

const program = createProgram();

program.parseAsync(process.argv).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
