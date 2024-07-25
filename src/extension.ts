import * as vscode from 'vscode';
import axios from 'axios';
import * as fs from 'fs';

const SIGNUP_URL = 'https://llmgate.github.io/';
const BACKEND_URL = 'https://llmgate.uc.r.appspot.com/completions/test';

export function activate(context: vscode.ExtensionContext) {
    console.log('Wohoo, your extension "LLMGate" is now active!');

    let disposable = vscode.commands.registerCommand('llmgate.runTest', async () => {
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
            'Prompt Testing with LLMGate',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getInputWebviewContent(selectedText);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'submit':
                        await handleSubmit(message.prompt, message.userRoleDetails, message.jsonContent, message.testProviders, apiKey as string);
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getInputWebviewContent(selectedText: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LLMGate Input</title>
        <style>
            body { 
                font-family: var(--vscode-font-family, Arial, sans-serif);
                padding: 20px; 
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            textarea, input[type="text"] { 
                width: 100%; 
                margin-bottom: 10px; 
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
            }
            textarea {
                height: 100px;
            }
            input[type="text"] {
                height: 25px;
            }
            button { 
                margin-top: 10px; 
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                cursor: pointer;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            input[type="file"] {
                margin-bottom: 10px;
                color: var(--vscode-input-foreground);
            }
            h2 {
                color: var(--vscode-editor-foreground);
            }
            .error {
                border: 2px solid red !important;
            }
            #errorMessage {
                color: red;
                margin-top: 10px;
                display: none;
            }
        </style>
    </head>
    <body>
        <h3>Prompt to test:</h3>
        <textarea id="prompt">${selectedText}</textarea>
        
        <h3>Describe Your Target User:</h3>
        <p>LLMGate will utilize this information to generate relevant questions for testing your prompt.</p>
        <textarea id="userRole" placeholder="E.g., College students seeking investment advice and tips"></textarea>
        
        <h3>LLM Providers:</h3>
        <p>LLM Providers for your test</p>
        <input type="text" id="llmProviders" value="OpenAI,gpt-4o,0.6;OpenAI,gpt-4o-mini,0.6;Gemini,gemini-1.5-flash,0.6">
        
        <br>
        <button id="submitButton">Submit</button>
        <div id="errorMessage">Describing Your Target User is required</div>

        <script>
            const vscode = acquireVsCodeApi();
            const promptElement = document.getElementById('prompt');
            const userRoleElement = document.getElementById('userRole');

            const llmProvidersElement = document.getElementById('llmProviders');
            const submitButton = document.getElementById('submitButton');
            const errorMessageElement = document.getElementById('errorMessage');

            function validateInputs() {
                let isValid = true;
                
                if (!promptElement.value.trim()) {
                    promptElement.classList.add('error');
                    isValid = false;
                } else {
                    promptElement.classList.remove('error');
                }

                if (!userRoleElement.value.trim()) {
                    errorMessageElement.style.display = 'block';
                    isValid = false;
                } else {
                    errorMessageElement.style.display = 'none';
                }

                return isValid;
            }

            function parseProviders(providersString) {
                return providersString.split(';').map(provider => {
                    const [providerName, model, temperature] = provider.split(',');
                    return {
                        provider: providerName.trim(),
                        model: model.trim(),
                        temperature: parseFloat(temperature.trim())
                    };
                });
            }

            promptElement.addEventListener('input', () => {
                promptElement.classList.remove('error');
            });

            userRoleElement.addEventListener('input', () => {
                errorMessageElement.style.display = 'none';
            });

            submitButton.addEventListener('click', () => {
                if (validateInputs()) {
                    const prompt = promptElement.value;
                    const userRoleDetails = userRoleElement.value;
                    const testProviders = parseProviders(llmProvidersElement.value);

                    vscode.postMessage({
                            command: 'submit',
                            prompt: prompt,
                            userRoleDetails: userRoleDetails,
                            jsonContent: null,
                            testProviders: testProviders
                        });
                }
            });
        </script>
    </body>
    </html>`;
}

async function handleSubmit(prompt: string, userRoleDetails: string, jsonContent: string | null, testProviders: any[], apiKey: string) {
    let testCases = {};
    if (jsonContent) {
        try {
            testCases = JSON.parse(jsonContent);
        } catch (error) {
            vscode.window.showErrorMessage('Error parsing JSON file');
            return;
        }
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Testing your Prompt..",
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 0 });
        try {
            const response = await sendToBackend(prompt, userRoleDetails, testCases, testProviders, apiKey);
            showResponseInWebview(response);
        } catch (error) {
            vscode.window.showErrorMessage('Error testing your prompt. Please try again!');
        }
    });
}

async function sendToBackend(prompt: string, userRoleDetails: string, testCases: any, testProviders: any[], apiKey: string): Promise<any> {
    const jsonBody = {
        ...testCases,
        prompt: prompt,
        userRoleDetails: userRoleDetails,
        testProviders: testProviders
    };
    const response = await axios.post(BACKEND_URL, jsonBody, {
        headers: {
            'key': `${apiKey}`
        }
    });
    return response.data;
}

async function promptForApiKey(): Promise<string | undefined> {
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

function showResponseInWebview(response: any) {
    const panel = vscode.window.createWebviewPanel(
        'llmgateTestResults',
        'LLMGate Test Results',
        vscode.ViewColumn.One,
        {}
    );

    const summaryDiv = generateSummaryDiv(response);
    const htmlContent = generateHtmlTable(response);
    panel.webview.html = getWebviewContent(summaryDiv, htmlContent);
}

function generateSummaryDiv(response: any): string {
    let html = "";
    if (response.summary !== null) {
        html += "<div>";
        html += "<h3>Summary</h3>";
        html += "<p>" + response.summary + "</p>";
        html += "</div>";
    }
    return html;
}

function generateHtmlTable(response: any): string {
    let html = "<table>";
    let providerStats = new Map<string, { totalCost: number, totalQuestions: number, totalPassed: number }>();

    // Calculate statistics
    response.questionResponses.forEach((questionResponse: any) => {
        questionResponse.llmResponses.forEach((llmResponse: any) => {
            const key = `${llmResponse.provider} (${llmResponse.model}, ${llmResponse.temperature})`;
            if (!providerStats.has(key)) {
                providerStats.set(key, { totalCost: 0, totalQuestions: 0, totalPassed: 0 });
            }
            const stats = providerStats.get(key)!;
            stats.totalCost += llmResponse.cost;
            stats.totalQuestions++;
            if (llmResponse.status) {
                stats.totalPassed++;
            }
        });
    });

    // Generate headers
    html += '<thead><tr><th>Question</th>';
    response.questionResponses[0].llmResponses.forEach((llmResponse: any) => {
        const key = `${llmResponse.provider} (${llmResponse.model}, ${llmResponse.temperature})`;
        const stats = providerStats.get(key)!;
        const successRate = ((stats.totalPassed / stats.totalQuestions) * 100).toFixed(2);
        html += `<th>
            ${key}<br>
            Total Cost: $${stats.totalCost.toFixed(6)}<br>
            Success Rate: ${successRate}%
        </th>`;
    });
    html += '</tr></thead>';

    // Generate rows
    html += '<tbody>';
    response.questionResponses.forEach((questionResponse: any) => {
        html += `<tr><td>${questionResponse.question}</td>`;
        questionResponse.llmResponses.forEach((llmResponse: any) => {
            html += `
                <td>
                    <div class="result ${llmResponse.status ? 'passed' : 'failed'}">
                        ${llmResponse.status ? "Passed" : "Failed"}
                        ${llmResponse.statusReason ? `(${llmResponse.statusReason})` : ''}
                    </div>
                    <div class="cost">Cost: $${llmResponse.cost.toFixed(6)}</div>
                    <div class="answer">
                        ${llmResponse.answer}
                    </div>
                </td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';

    return html;
}

function getWebviewContent(summaryDiv: string, htmlTable: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LLMGate Test Results</title>
    <style>
        body {
            font-family: var(--vscode-font-family, Arial, sans-serif);
            line-height: 1.6;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            table-layout: fixed;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--vscode-panel-border);
            border-right: 1px solid var(--vscode-panel-border);
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        th {
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            font-weight: bold;
        }
        td:last-child, th:last-child {
            border-right: none;
        }
        .result {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .passed {
            color: var(--vscode-testing-iconPassed);
        }
        .failed {
            color: var(--vscode-testing-iconFailed);
        }
        .answer {
            white-space: pre-wrap;
            margin-bottom: 5px;
            cursor: pointer;
        }
        .full-answer {
            display: none;
            margin-top: 10px;
            border-top: 1px dashed var(--vscode-panel-border);
            padding-top: 10px;
        }
        .cost {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
            margin-top: 5px;
        }
        .summary-row {
            font-weight: bold;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
        }
    </style>
</head>
<body>
    <h1>LLMGate Test Results</h1>
    ${summaryDiv}
    ${htmlTable}
    <script>
        document.addEventListener('click', function(e) {
            const clickedElement = e.target.closest('.answer');
            if (clickedElement) {
                const fullAnswer = clickedElement.querySelector('.full-answer');
                if (fullAnswer) {
                    fullAnswer.style.display = fullAnswer.style.display === 'none' ? 'block' : 'none';
                }
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {}
