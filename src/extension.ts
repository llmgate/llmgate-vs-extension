import * as vscode from 'vscode';
import { runTest } from './commands/runTest';
import { refinePrompt } from './commands/refinePrompt';

class LLMGateProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      const runTestItem = new vscode.TreeItem('Prompt Lab 🧪');
      runTestItem.command = { command: 'llmgate.runTest', title: 'Prompt Lab' };

      const settingsItem = new vscode.TreeItem('Settings');
      settingsItem.command = { command: 'llmgate.openSettings', title: 'Set LLM Keys' };

      return Promise.resolve([runTestItem, settingsItem]);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Wohoo, your extension "LLMGate" is now active!');

    let disposable = vscode.commands.registerCommand('llmgate.runTest', runTest);
    context.subscriptions.push(disposable);

    let refinePromptDisposable = vscode.commands.registerCommand('llmgate.refinePrompt', refinePrompt);
    context.subscriptions.push(refinePromptDisposable);

    let openSettingsDisposable = vscode.commands.registerCommand('llmgate.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'llmgate');
    });
    context.subscriptions.push(openSettingsDisposable);

    // Register the tree data provider
    const llmGateProvider = new LLMGateProvider();
    vscode.window.registerTreeDataProvider('llmgate-view', llmGateProvider);
}

export function deactivate() {}