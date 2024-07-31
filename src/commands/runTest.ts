import * as vscode from 'vscode';
import { promptForApiKey } from '../utils/promptForApiKey';
import { getInputWebviewContent } from '../utils/webviewContent';
import { handleSubmit } from '../handlers/handleSubmit';
import { SIGNUP_URL } from '../utils/constants';

export async function runTest() {
    // Check if API key is set
    const config = vscode.workspace.getConfiguration('llmgate');
    let apiKey = config.get('apiKey');

    if (!apiKey) {
        apiKey = await promptForApiKey();
        if (!apiKey) {
            vscode.window.showInformationMessage(`Please set up an API key. You can get one at: ${SIGNUP_URL}`);
            return;
        }
    }

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
                    await handleSubmit(message.systemPrompt, message.userPrompts, message.maxTokens as number, message.temperature as number,  message.llmProvider, message.llmModel, apiKey as string, panel);
                    return;
            }
        },
        undefined,
        []
    );
}
