import * as vscode from 'vscode';
import { getInputWebviewContent } from '../utils/webviewContent';
import { handleRunTestCases, handleSubmit } from '../handlers/handleSubmit';
const path = require('path');

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
        'Prompt Lab',
        vscode.ViewColumn.One,
        { enableScripts: true },
    );

    panel.iconPath = vscode.Uri.file(path.join(__dirname, '..', 'resources', 'logo.png'));

    panel.webview.html = getInputWebviewContent(selectedText);

    // Handle messages from the webview
    panel.webview.onDidReceiveMessage(
        async message => {
            switch (message.command) {
                case 'execute':
                    await handleSubmit(message.systemPrompt, message.userPrompts, 
                        message.maxTokens as number, message.topP as number, message.frequencyPenalty as number, message.presencePenalty as number, 
                        message.temperature as number,  message.llmProvider, message.llmModel, panel);
                    return;
                case 'runtestcases':
                    await handleRunTestCases(message.systemPrompt, message.testCases, message.maxTokens as number, 
                        message.temperature as number, message.topP as number, message.frequencyPenalty as number, message.presencePenalty as number,   
                        message.llmProvider, message.llmModel, panel);
                    return;
            }
        },
        undefined,
        []
    );
}
