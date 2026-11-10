import { CommanderError } from "commander";
import { describe, expect, it } from "vitest";
import { createProgram } from "./commander.js";

describe("createProgram", () => {
  it("creates a Commander program with name devkit", () => {
    const program = createProgram();
    expect(program.name()).toBe("devkit");
  });

  it("has version command registered", () => {
    const program = createProgram();
    const versionCmd = program.commands.find((cmd) => cmd.name() === "version");
    expect(versionCmd).toBeDefined();
  });

  it("has hello command registered", () => {
    const program = createProgram();
    const helloCmd = program.commands.find((cmd) => cmd.name() === "hello");
    expect(helloCmd).toBeDefined();
  });

  it("has init command registered", () => {
    const program = createProgram();
    const initCmd = program.commands.find((cmd) => cmd.name() === "init");
    expect(initCmd).toBeDefined();
  });

  it("has doctor command registered", () => {
    const program = createProgram();
    const doctorCmd = program.commands.find((cmd) => cmd.name() === "doctor");
    expect(doctorCmd).toBeDefined();
  });

  it("keeps the root help output stable", () => {
    const program = createProgram().configureHelp({ helpWidth: 80 });

    expect(program.helpInformation()).toBe(
      [
        "Usage: devkit [options] [command]",
        "",
        "Developer productivity CLI",
        "",
        "Options:",
        "  -v, --version                 output the version number",
        "  -h, --help                    display help for command",
        "",
        "Commands:",
        "  hello                         Print a greeting",
        "  version                       Show the devkit version",
        "  init [options]                Scaffold a new project from a template",
        "  doctor [options]              Check development toolchain and repository",
        "                                health",
        "  git                           Git workflow helpers",
        "  analyze <path>                Analyze code complexity",
        "  api:test [options] <url>      Send a GET request and assert the response",
        "                                status",
        "  env:load [options] <file>     Parse a .env file and report its variables",
        "  docs:generate [options]       Generate Markdown API documentation from",
        "                                documented exports",
        "  release:changelog [options]   Generate a changelog from Conventional Commits",
        "  plugin:load [options] <name>  Load a devkit plugin and validate its shape",
        "  config                        Read and write project settings in",
        "                                .devkitrc.json",
        "  help [command]                display help for command",
        "",
      ].join("\n"),
    );
  });

  it("rejects excess command-arguments instead of ignoring them", async () => {
    const program = createProgram();
    let stderr = "";
    program.exitOverride();
    for (const command of program.commands) command.exitOverride();
    program.configureOutput({ writeErr: (text) => (stderr += text) });
    for (const command of program.commands) {
      command.configureOutput({ writeErr: (text) => (stderr += text) });
    }

    const error = await program
      .parseAsync(["node", "devkit", "hello", "extra"])
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CommanderError);
    expect(error).toMatchObject({ code: "commander.excessArguments", exitCode: 1 });
    expect(stderr).toContain("too many arguments for 'hello'");
  });
});
