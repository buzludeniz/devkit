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

  it("has template command registered with a list subcommand", () => {
    const program = createProgram();
    const templateCmd = program.commands.find((cmd) => cmd.name() === "template");
    expect(templateCmd?.commands.map((cmd) => cmd.name())).toContain("list");
  });
});
