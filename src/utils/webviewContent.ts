export function getInputWebviewContent(selectedText: string): string {
    const openAIModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'];
    const geminiModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LLMGate Input and Results</title>
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
            height: 100%;
        }
        #inputSection, #responseSection {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            padding-right: 25px;
        }
        #inputSection {
            border-right: 1px solid var(--vscode-panel-border);
        }
        .title-header {
            font-weight: bold;
            margin-bottom: 4px;
            font-size: 16px;
        }
        textarea, input[type="text"], input[type="number"], select { 
            width: 100%; 
            margin-bottom: 4px; 
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            font-family: inherit;
            font-size: 13px;
            padding: 4px;
        }
        textarea {
            min-height: 24px;
            resize: vertical;
            overflow: auto;
        }
        input[type="text"], input[type="number"], select {
            height: 28px;
        }
        button { 
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        h2, h3, h4 {
            color: var(--vscode-editor-foreground);
            margin-top: 12px;
            margin-bottom: 8px;
        }
        .message-container {
            margin-bottom: 4px;
            padding-left: 8px;
        }
        .message-header {
            font-weight: bold;
            margin-bottom: 2px;
        }
        .block-container {
            position: relative;
            margin-bottom: 4px;
        }
        .remove-block-btn {
            position: absolute;
            bottom: 4px;
            right: 4px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 2px 6px;
            font-size: 11px;
            cursor: pointer;
            opacity: 0.7;
        }
        .remove-block-btn:hover {
            opacity: 1;
        }
        .add-block-btn {
            margin-top: 2px;
            padding: 2px 6px;
            font-size: 10px;
        }
        .config-row {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            align-items: flex-end;
        }
        .param-group {
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        .param-group label {
            font-size: 11px;
            margin-bottom: 2px;
        }
        .param-group input, .param-group select {
            width: 100%;
            margin-bottom: 0;
        }
        #executeButton {
            align-self: flex-end;
            background-color: var(--vscode-button-prominence-background, #0e639c);
            color: var(--vscode-button-prominence-foreground, #ffffff);
            border: none;
            padding: 6px 12px;
            font-size: 13px;
            cursor: pointer;
            margin-left: auto;
            margin-top: 12px;
            transition: background-color 0.2s;
        }
        #executeButton:hover {
            background-color: var(--vscode-button-prominenceHover-background, #1177bb);
        }
        #configSection {
            padding-left: 8px;
            max-width: 100%;
        }
        .completion-result {
            border: 1px solid var(--vscode-panel-border);
            margin-bottom: 16px;
            padding: 8px;
        }
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
        }
        .result-header h3 {
            margin: 0;
        }
        .toggle-btn {
            background: none;
            border: none;
            color: var(--vscode-editor-foreground);
            cursor: pointer;
        }
        .result-content {
            margin-bottom: 8px;
            overflow: hidden;
        }
        .result-content.collapsed {
            max-height: 3em; /* Approximately 2 lines */
            text-overflow: ellipsis;
        }
        .result-metrics {
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div id="inputSection">
            <div class="title-header">Prompt</div>
            <div id="configSection">
                <div class="config-row">
                    <div class="param-group">
                        <label for="providerSelect">LLM Provider</label>
                        <select id="providerSelect">
                            <option value="OpenAI">OpenAI</option>
                            <option value="Gemini">Gemini</option>
                        </select>
                    </div>
                    <div class="param-group">
                        <label for="modelSelect">Model</label>
                        <select id="modelSelect"></select>
                    </div>
                </div>
                <div class="config-row">
                    <div class="param-group">
                        <label for="temperatureInput">Temperature</label>
                        <input type="number" id="temperatureInput" step="0.01" min="0" max="1" value="0.7">
                    </div>
                    <div class="param-group">
                        <label for="maxTokens">Max Tokens</label>
                        <input type="number" id="maxTokens" value="4096">
                    </div>
                    <div class="param-group">
                        <label for="topP">Top P</label>
                        <input type="number" id="topP" value="1" step="0.01" min="0" max="1">
                    </div>
                    <div class="param-group">
                        <label for="frequencyPenalty">Frequency Penalty</label>
                        <input type="number" id="frequencyPenalty" value="0" step="0.01">
                    </div>
                    <div class="param-group">
                        <label for="presencePenalty">Presence Penalty</label>
                        <input type="number" id="presencePenalty" value="0" step="0.01">
                    </div>
                </div>
            </div>
            <div id="messagesContainer">
                <div class="message-container">
                    <div class="message-header">System Message</div>
                    <textarea id="systemMessage" rows="1" placeholder="Enter system message here">${selectedText}</textarea>
                </div>
                <div class="message-container">
                    <div class="message-header">User message</div>
                    <div id="blocksContainer">
                        <div class="block-container">
                            <textarea class="blockContent" rows="1" placeholder="Prompt text..."></textarea>
                            <button class="remove-block-btn">del</button>
                        </div>
                    </div>
                    <button id="addBlockBtn" class="add-block-btn">+ Add</button>
                </div>
            </div>
            <button id="executeButton">Execute</button>
        </div>
        <div id="responseSection">
            <div class="title-header">Completions</div>
            <div id="streamingResult"></div>
            <div id="completedResults"></div>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const systemMessageElement = document.getElementById('systemMessage');
        const blocksContainer = document.getElementById('blocksContainer');
        const addBlockBtn = document.getElementById('addBlockBtn');
        const executeButton = document.getElementById('executeButton');
        const providerSelect = document.getElementById('providerSelect');
        const modelSelect = document.getElementById('modelSelect');

        let completionResults = [];

        function addNewResult(content, metrics) {
            completionResults.unshift({ content, metrics });
            updateResultsDisplay();
        }

        const openAIModels = ${JSON.stringify(openAIModels)};
        const geminiModels = ${JSON.stringify(geminiModels)};

        function updateModelOptions() {
            const selectedProvider = providerSelect.value;
            modelSelect.innerHTML = '';
            const models = selectedProvider === 'OpenAI' ? openAIModels : geminiModels;
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelSelect.appendChild(option);
            });
        }

        providerSelect.addEventListener('change', updateModelOptions);

        // Initialize model options
        updateModelOptions();

        function addBlock() {
            const blockHtml = \`
                <div class="block-container">
                    <textarea class="blockContent" rows="1" placeholder="Prompt text..."></textarea>
                    <button class="remove-block-btn">del</button>
                </div>
            \`;
            blocksContainer.insertAdjacentHTML('beforeend', blockHtml);
            setupAutoResizeTextareas();
        }

        addBlockBtn.addEventListener('click', addBlock);

        blocksContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-block-btn')) {
                e.target.closest('.block-container').remove();
            }
        });

        function autoResizeTextarea(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }
            
        function setupAutoResizeTextareas() {
            document.querySelectorAll('textarea').forEach(textarea => {
                textarea.setAttribute('rows', '1');
                textarea.addEventListener('input', () => autoResizeTextarea(textarea));
                autoResizeTextarea(textarea);
            });
        }

        document.addEventListener('DOMContentLoaded', setupAutoResizeTextareas);

        function disableExecuteButton() {
            executeButton.disabled = true;
            executeButton.style.opacity = '0.5';
            executeButton.style.cursor = 'not-allowed';
        }

        function enableExecuteButton() {
            executeButton.disabled = false;
            executeButton.style.opacity = '1';
            executeButton.style.cursor = 'pointer';
        }

        executeButton.addEventListener('click', () => {
            disableExecuteButton();
            const systemMessage = systemMessageElement.value;
            const blocks = Array.from(document.querySelectorAll('.blockContent')).map(el => el.value);
            vscode.postMessage({
                command: 'execute',
                systemPrompt: systemMessage,
                userPrompts: blocks,
                maxTokens: document.getElementById('maxTokens').value,
                temperature: document.getElementById('temperatureInput').value,
                llmProvider: providerSelect.value,
                llmModel: modelSelect.value
            });
        });

        let currentStreamingContent = '';
        let completedResults = [];
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'appendStreamingResults':
                    currentStreamingContent += message.content;
                    updateStreamingResult();
                    enableExecuteButton();
                    break;
                case 'updateMetrics':
                    addCompletedResult(currentStreamingContent, message.metrics);
                    clearStreamingResults()
                    currentStreamingContent = '';
                    enableExecuteButton();
                    break;
                case 'error':
                    enableExecuteButton();
                    break;
            }
        });

        function updateStreamingResult() {
           document.getElementById('streamingResult').innerHTML = \`
                <div class="completion-result">
                    <h5>Current Completion</h5>
                    <div class="result-content">\${currentStreamingContent}</div>
                </div>
            \`;
        }

        function updateCompletedResultsDisplay() {
            const completedResultsContainer = document.getElementById('completedResults');
            completedResultsContainer.innerHTML = completedResults.map((result, index) => \`
            <div class="completion-result">
                <div class="result-header" onclick="toggleResult(\${index})">
                    <h5>Completion \${completedResults.length - index}</h5>
                    <button class="toggle-btn" id="toggleBtn\${index}">▼</button>
                </div>
                <div class="result-content" id="content\${index}">
                    \${result.content}
                </div>
                <div class="result-metrics">
                    Latency: \${nanoToMilliseconds(result.metrics.latency).toFixed(2)} ms, 
                    Cost: $\${result.metrics.cost.toFixed(6)}
                </div>
            </div>
            \`).join('');
        }

        function toggleResult(index) {
            const content = document.getElementById(\`content\${index}\`);
            const toggleBtn = document.getElementById(\`toggleBtn\${index}\`);
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                toggleBtn.textContent = '▼';
            } else {
                content.classList.add('collapsed');
                toggleBtn.textContent = '▶';
            }
        }

        // Add this function to set initial state
        function setInitialResultsState() {
            completedResults.forEach((_, index) => {
                const content = document.getElementById(\`content\${index}\`);
                const toggleBtn = document.getElementById(\`toggleBtn\${index}\`);
                if (content && toggleBtn) {
                    content.classList.remove('collapsed');
                    toggleBtn.textContent = '▼';
                }
            });
        }

        // Modify the addCompletedResult function
        function addCompletedResult(content, metrics) {
            completedResults.unshift({ content, metrics });
            updateCompletedResultsDisplay();
            setInitialResultsState(); // Set initial state after updating display
        }

        function clearStreamingResults() {
            currentStreamingContent = '';
            document.getElementById('streamingResult').innerHTML = '';
        }

        function nanoToMilliseconds(nanoseconds) {
            return nanoseconds / 1000000; // or nanoseconds / 1e6
        }

        function updateResultsDisplay() {
            const streamingResults = document.getElementById('streamingResults');
            streamingResults.innerHTML = completionResults.map((result, index) => \`
                <div class="completion-result">
                    <h3>Completion \${completionResults.length - index}</h3>
                    <div class="result-content">\${result.content}</div>
                    <div class="result-metrics">
                        Latency: \${nanoToMilliseconds(result.metrics.latency).toFixed(2)} ms, 
                        Cost: $\${result.metrics.cost.toFixed(6)}
                    </div>
                </div>
            \`).join('');
        }
    </script>
</body>
</html>`;
}