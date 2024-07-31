import * as vscode from 'vscode';
import { GEMINI_SIGNUP_URL, OPENAI_SIGNUP_URL, SIGNUP_URL } from './constants';

export async function promptForApiKey(provider: string): Promise<string | undefined> {
    var signupURL = SIGNUP_URL;
    if (provider === "OpenAI") {
        signupURL = OPENAI_SIGNUP_URL;
    } else if (provider === "Gemini") {
        signupURL = GEMINI_SIGNUP_URL;
    }
    const result = await vscode.window.showInputBox({
        prompt: `Set your ${provider} API Key on VSCode. Don't have one? [Get it here](${signupURL})`,
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

    var settingKey = "apiKey";
    if (provider === "OpenAI") {
        settingKey = "openaiKey";
    } else if (provider === "Gemini") {
        settingKey = "geminiKey";
    }

    // User entered an API key
    await vscode.workspace.getConfiguration('llmgate').update(settingKey, result, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(`${provider} API Key has been set successfully.`);
    return result;
}
