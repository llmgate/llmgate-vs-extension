export function getPromptRefineWebviewContent(refinedPrompt: string, reasonings: string[]) {
    const reasoningsList = reasonings.map(reason => `<li>${reason}</li>`).join('');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Refined Prompt</title>
        <style>
            body { 
                font-family: 'Consolas', 'Courier New', monospace;
                padding: 12px; 
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
                font-size: 13px;
                line-height: 1.4;
                margin: 0;
                height: 100vh;
                overflow: hidden;
            }
            .container {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            textarea { 
                width: 100%; 
                margin-bottom: 12px; 
                background-color: var(--vscode-input-background);
                color: var(--vscode-input-foreground);
                border: 1px solid var(--vscode-input-border);
                font-family: inherit;
                font-size: 13px;
                padding: 8px;
                resize: vertical;
                min-height: 200px;
            }
            button { 
                background-color: var(--vscode-button-background);
                color: var(--vscode-button-foreground);
                border: none;
                padding: 6px 12px;
                cursor: pointer;
                font-size: 13px;
                align-self: flex-start;
            }
            button:hover {
                background-color: var(--vscode-button-hoverBackground);
            }
            #explanation { 
                margin-top: 20px; 
                border-top: 1px solid var(--vscode-panel-border);
                padding-top: 12px;
                overflow-y: auto;
            }
            h2, h3 {
                color: var(--vscode-editor-foreground);
                margin-top: 0;
                margin-bottom: 12px;
            }
            ul {
                padding-left: 20px;
                margin-top: 0;
            }
            li {
                margin-bottom: 8px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Refined Prompt</h2>
            <textarea id="refinedPrompt">${refinedPrompt}</textarea>
            <button id="applyButton">Apply Changes</button>
            <div id="explanation">
                <h3>Explanation of Changes:</h3>
                <ul>
                    ${reasoningsList}
                </ul>
            </div>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('applyButton').addEventListener('click', () => {
                const text = document.getElementById('refinedPrompt').value;
                vscode.postMessage({ command: 'apply', text: text });
            });
        </script>
    </body>
    </html>`;
}