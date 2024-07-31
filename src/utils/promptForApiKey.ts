import * as vscode from 'vscode';
import { SIGNUP_URL } from './constants';

export async function promptForApiKey(): Promise<string | undefined> {
    const result = await vscode.window.showInputBox({
        prompt: `Enter your LLMGate API Key. Don't have one? Get it here: ${SIGNUP_URL}`,
        password: true,
        placeHolder: 'Paste your API key here',
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (!value) {
                return 'API key cannot be empty';
            }
            return null;
        }
    });

    if (!result) {
        return undefined; // User cancelled the input
    }

    // User entered an API key
    await vscode.workspace.getConfiguration('llmgate').update('apiKey', result, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage('API Key has been set successfully.');
    return result;
}
