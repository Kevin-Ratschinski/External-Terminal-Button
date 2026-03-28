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

function getTerminalApp(): string {
  const config = getConfig();
  const customTerminal = config.get<string>("terminalApp", "");

  if (customTerminal) {
    return customTerminal;
  }

  const platform = process.platform;
  const externalConfig = vscode.workspace.getConfiguration("terminal.external");

  if (platform === "darwin") {
    return externalConfig.get<string>("osxExec", "Terminal.app");
  } else if (platform === "win32") {
    return externalConfig.get<string>("windowsExec", "C:\\Windows\\System32\\cmd.exe");
  } else {
    return externalConfig.get<string>("linuxExec", "xterm");
  }
}

function openTerminalAtDirectory(dir: string): void {
  const platform = process.platform;
  const terminalApp = getTerminalApp();

  if (platform === "darwin") {
    const child = spawn("open", ["-a", terminalApp, dir], { detached: true, stdio: "ignore" });
    child.unref();
  } else {
    const child = spawn(terminalApp, [], { cwd: dir, detached: true, stdio: "ignore" });
    child.unref();
  }
}

export async function openExternalTerminal(): Promise<void> {
  const config = getConfig();
  const customTerminal = config.get<string>("terminalApp", "");
  const targetDir = getTargetDirectory();

  // Use custom terminal logic if a custom terminal is configured
  if (customTerminal) {
    const dir = targetDir ?? getWorkspaceRoot();
    if (dir) {
      openTerminalAtDirectory(dir);
    } else {
      vscode.window.showWarningMessage("No workspace folder open");
    }
  } else if (targetDir) {
    // Use custom directory with VS Code's default terminal settings
    openTerminalAtDirectory(targetDir);
  } else {
    // Fallback to VS Code's native command
    await vscode.commands.executeCommand(OPEN_NATIVE_CONSOLE_COMMAND);
  }
}

function getWorkspaceRoot(): string | undefined {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  }
  return undefined;
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
