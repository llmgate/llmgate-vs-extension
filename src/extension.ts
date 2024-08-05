import * as vscode from 'vscode';
import { runTest } from './commands/runTest';

class LLMGateProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    } else {
      const runTestItem = new vscode.TreeItem('Run Prompt Lab 🧪');
      runTestItem.command = { command: 'llmgate.runTest', title: 'Run Prompt Lab' };
      return Promise.resolve([runTestItem]);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Wohoo, your extension "LLMGate" is now active!');

    let disposable = vscode.commands.registerCommand('llmgate.runTest', runTest);

    context.subscriptions.push(disposable);

    // Register the tree data provider
    const llmGateProvider = new LLMGateProvider();
    vscode.window.registerTreeDataProvider('llmgate-view', llmGateProvider);
}

export function deactivate() {}