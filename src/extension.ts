import * as vscode from 'vscode';
import { runTest } from './commands/runTest';

export function activate(context: vscode.ExtensionContext) {
    console.log('Wohoo, your extension "LLMGate" is now active!');

    let disposable = vscode.commands.registerCommand('llmgate.runTest', runTest);

    context.subscriptions.push(disposable);
}

export function deactivate() {}
