import { describe, expect, it } from "vitest";
import { renderFileDiff } from "./file-diff.js";

describe("renderFileDiff", () => {
  it("shows a new file as all additions against /dev/null", () => {
    expect(renderFileDiff("out.md", null, "# Title\n\nBody\n")).toBe(
      ["--- /dev/null", "+++ out.md", "+# Title", "+", "+Body"].join("\n"),
    );
  });

  it("marks removed and added lines and keeps common lines as context", () => {
    expect(
      renderFileDiff("CHANGELOG.md", "# Changelog\nold\nkeep\n", "# Changelog\nnew\nkeep\n"),
    ).toBe(
      ["--- CHANGELOG.md", "+++ CHANGELOG.md", " # Changelog", "-old", "+new", " keep"].join("\n"),
    );
  });

  it("reports when the content would not change", () => {
    expect(renderFileDiff("same.md", "a\nb\n", "a\nb\n")).toBe("No changes to same.md");
  });
});
