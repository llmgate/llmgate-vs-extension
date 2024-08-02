import * as vscode from 'vscode';
import { getInputWebviewContent } from '../utils/webviewContent';
import { handleRunTestCases, handleSubmit } from '../handlers/handleSubmit';

export async function runTest() {
    const editor = vscode.window.activeTextEditor;
    let selectedText = '';
    if (editor) {
        const selection = editor.selection;
        selectedText = editor.document.getText(selection);
    }

    // Create and show input panel
    const panel = vscode.window.createWebviewPanel(
        'llmgateInput',
        'Prompt Testing',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );

    panel.webview.html = getInputWebviewContent(selectedText);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'execute':
                    await handleSubmit(message.systemPrompt, message.userPrompts, message.maxTokens as number, message.temperature as number,  message.llmProvider, message.llmModel, panel);
                    return;
                case 'runtestcases':
                    await handleRunTestCases(message.systemPrompt, message.testCases, message.maxTokens as number, message.temperature as number,  message.llmProvider, message.llmModel, panel);
                    return;
            }
        },
        undefined,
        []
    );
}
