import { Command } from "commander";

export function helloCommand(): Command {
  return new Command("hello").description("Print a greeting").action(() => {
    console.log("Hello from devkit!");
  });
}
