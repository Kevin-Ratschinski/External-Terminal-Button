import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  test("Extension should be present", () => {
    const ext = vscode.extensions.getExtension("kratschinski.external-terminal-button");
    assert.ok(ext, "Extension should be registered");
  });

  test("Command should be registered", async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("externalTerminalButton.openExternalTerminal"), "Command externalTerminalButton.openExternalTerminal should be registered");
  });

  test("Extension should activate", async () => {
    const ext = vscode.extensions.getExtension("kratschinski.external-terminal-button");
    assert.ok(ext, "Extension should be registered");
    await ext!.activate();
    assert.strictEqual(ext!.isActive, true, "Extension should be active after activation");
  });

  test("Default configuration values should be set", () => {
    const config = vscode.workspace.getConfiguration("externalTerminalButton");
    assert.strictEqual(config.get("alignment"), "left");
    assert.strictEqual(config.get("priority"), 0);
    assert.strictEqual(config.get("text"), "$(terminal) Ext Terminal");
  });
});
