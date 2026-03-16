import * as vscode from "vscode";

const OPEN_EXTERNAL_TERMINAL_COMMAND = "externalTerminalButton.openExternalTerminal";
const OPEN_NATIVE_CONSOLE_COMMAND = "workbench.action.terminal.openNativeConsole";
const STATUS_BAR_NAME = "Open External Terminal";
const CONFIG_SECTION = "externalTerminalButton";

export async function openExternalTerminal(): Promise<void> {
  await vscode.commands.executeCommand(OPEN_NATIVE_CONSOLE_COMMAND);
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
