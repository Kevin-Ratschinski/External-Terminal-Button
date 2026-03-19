import * as vscode from "vscode";
import * as path from "node:path";
import { spawn } from "child_process";

const OPEN_EXTERNAL_TERMINAL_COMMAND = "externalTerminalButton.openExternalTerminal";
const OPEN_NATIVE_CONSOLE_COMMAND = "workbench.action.terminal.openNativeConsole";
const STATUS_BAR_NAME = "Open External Terminal";
const CONFIG_SECTION = "externalTerminalButton";

function getTargetDirectory(): string | undefined {
  const config = getConfig();
  const openInFileDirectory = config.get<boolean>("openInFileDirectory", false);

  if (openInFileDirectory) {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.scheme === "file") {
      return path.dirname(activeEditor.document.uri.fsPath);
    }
  }

  return undefined;
}

function openTerminalAtDirectory(dir: string): void {
  const platform = process.platform;

  if (platform === "darwin") {
    const terminalApp = vscode.workspace.getConfiguration("terminal.external").get<string>("osxExec", "Terminal.app");
    const child = spawn("open", ["-a", terminalApp, dir], { detached: true, stdio: "ignore" });
    child.unref();
  } else if (platform === "win32") {
    const terminalExe = vscode.workspace.getConfiguration("terminal.external").get<string>("windowsExec", "C:\\Windows\\System32\\cmd.exe");
    const child = spawn(terminalExe, [], { cwd: dir, detached: true, stdio: "ignore" });
    child.unref();
  } else {
    const terminalExe = vscode.workspace.getConfiguration("terminal.external").get<string>("linuxExec", "xterm");
    const child = spawn(terminalExe, [], { cwd: dir, detached: true, stdio: "ignore" });
    child.unref();
  }
}

export async function openExternalTerminal(): Promise<void> {
  const targetDir = getTargetDirectory();

  if (targetDir) {
    openTerminalAtDirectory(targetDir);
  } else {
    await vscode.commands.executeCommand(OPEN_NATIVE_CONSOLE_COMMAND);
  }
}

function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

function createStatusBarItem(): vscode.StatusBarItem {
  const config = getConfig();
  const alignment = config.get<string>("alignment") === "right" ? vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left;
  const priority = config.get<number>("priority", 0);
  const text = config.get<string>("text", "$(terminal) Ext Terminal");

  const terminalItem = vscode.window.createStatusBarItem(alignment, priority);
  terminalItem.name = STATUS_BAR_NAME;
  terminalItem.text = text;
  terminalItem.tooltip = "Open New External Terminal";
  terminalItem.command = OPEN_EXTERNAL_TERMINAL_COMMAND;

  return terminalItem;
}

export function activate(context: vscode.ExtensionContext): void {
  const openTerminalCommand = vscode.commands.registerCommand(OPEN_EXTERNAL_TERMINAL_COMMAND, openExternalTerminal);
  let terminalItem = createStatusBarItem();
  terminalItem.show();

  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(CONFIG_SECTION)) {
      terminalItem.dispose();
      terminalItem = createStatusBarItem();
      terminalItem.show();
    }
  });

  context.subscriptions.push(openTerminalCommand, terminalItem, configListener);
}

export function deactivate(): void {}
