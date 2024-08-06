
import * as vscode from 'vscode';
import { refinePromptBackend } from '../handlers/handleSubmit';
import { getPromptRefineWebviewContent } from '../utils/promptRefineWebviewContent';

export async function refinePrompt() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
        vscode.window.showInformationMessage('Please select prompt text first.');
        return;
    }

    // Show progress indicator
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Refining prompt...",
        cancellable: false
    }, async (progress) => {
        try {
            const data = await refinePromptBackend(selectedText);

            // Create a webview panel
            const panel = vscode.window.createWebviewPanel(
                'refinedPrompt',
                'Refined Prompt',
                vscode.ViewColumn.Beside,
                {
                    enableScripts: true
                }
            );

            // Set the HTML content of the webview
            panel.webview.html = getPromptRefineWebviewContent(data.data.refinedPrompt, data.data.reasonings);

            // Handle messages from the webview
            panel.webview.onDidReceiveMessage(
                message => {
                    switch (message.command) {
                        case 'apply':
                            editor.edit(editBuilder => {
                                editBuilder.replace(selection, message.text);
                            });
                            panel.dispose();
                            return;
                    }
                },
                undefined,
                []
            );

        } catch (error) {
            vscode.window.showErrorMessage('Error refining prompt: ' + (error as Error).message);
        }
    });
}
