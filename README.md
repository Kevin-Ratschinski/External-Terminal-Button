# External Terminal Button

Adds a button to the VS Code status bar that opens an external terminal window at the current workspace folder.

## Features

- One-click access to an external terminal from the status bar
- Configurable button text, alignment, and position
- Works on macOS, Windows, and Linux

## Extension Settings

This extension contributes the following settings:

| Setting                            | Default                      | Description                                                                                      |
| ---------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------ |
| `externalTerminalButton.alignment` | `"left"`                     | Status bar button alignment (`"left"` or `"right"`)                                              |
| `externalTerminalButton.priority`  | `0`                          | Status bar button priority (higher = further left)                                               |
| `externalTerminalButton.text`      | `"$(terminal) Ext Terminal"` | Button text (supports [codicons](https://microsoft.github.io/vscode-codicons/dist/codicon.html)) |

## Usage

After installation, a **$(terminal) Ext Terminal** button appears in the status bar. Click it to open your system's default terminal application at the workspace root.

## License

[MIT](LICENSE)
