export function getInputWebviewContent(selectedText: string): string {
    const openAIModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4'];
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
            max-height: 90px;
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
        #metricsGraph {
            margin-top: 20px;
            border-top: 1px solid var(--vscode-panel-border);
            padding-top: 10px;
        }
        #metricsGraph.hidden {
            display: none;
        }
        .graph-section {
            margin-bottom: 15px;
        }
        .graph-section h4 {
            margin-bottom: 5px;
        }
        .breakdown-item {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 2px;
        }
        .breakdown-bar {
            background-color: var(--vscode-progressBar-background);
            height: 8px;
            margin-top: 2px;
            margin-bottom: 8px;
            transition: width 0.3s ease-in-out;
        }
        .hidden {
            display: none !important;
        }
        .graphs-container {
            max-height: 45vh;
            overflow-y: auto;
            padding-right: 10px;
            padding-bottom: 20px;
        }
        /* Styles for WebKit browsers (Chrome, Safari) */
        .graphs-container::-webkit-scrollbar {
            width: 8px;
        }
        .graphs-container::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
        }
        .graphs-container::-webkit-scrollbar-thumb {
            background-color: var(--vscode-scrollbarSlider-hoverBackground);
            border-radius: 4px;
        }
        /* Styles for Firefox */
        .graphs-container {
            scrollbar-width: thin;
            scrollbar-color: var(--vscode-scrollbarSlider-hoverBackground) var(--vscode-scrollbarSlider-background);
        }
        .test-case {
            position: relative;
            border: 1px solid var(--vscode-panel-border);
            margin-top: 8px;
            padding: 8px;
        }
        .delete-test-case-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 2px 6px;
            font-size: 11px;
            cursor: pointer;
            opacity: 0.7;
        }
        .delete-test-case-btn:hover {
            opacity: 1;
        }
        .test-case-header {
            margin-right: 30px; /* Make space for the delete button */
        }
        .test-cases-title {
            margin: 0;
        }
        .test-cases-buttons {
            display: flex;
            gap: 8px;
        }
        .delete-test-case-btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 2px 6px;
            font-size: 11px;
            cursor: pointer;
            opacity: 0.7;
        }
        .delete-test-case-btn:hover {
            opacity: 1;
        }
        .user-message {
            margin-bottom: 8px;
            border-left: 3px solid var(--vscode-textLink-foreground);
            padding-left: 8px;
        }
        .message-preview, .message-full {
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
        }
        .message-preview {
            max-height: 2.8em; /* Approximately 2 lines */
            overflow: hidden;
        }
        .toggle-message {
            font-size: 10px;
            margin-top: 4px;
            background-color: transparent;
            border: none;
            color: var(--vscode-textLink-foreground);
            cursor: pointer;
            padding: 0;
        }
        .toggle-message:hover {
            text-decoration: underline;
        }
        .hidden {
            display: none;
        }
        .test-case-content {
            white-space: pre-wrap;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 12px;
        }
        .test-buttons {
           display: flex;
            gap: 8px;
            margin-top: 8px;
            justify-content: flex-start;
        }
        .mini-button {
            background-color: var(--vscode-button-secondaryBackground, #3a3d41);
            color: var(--vscode-button-secondaryForeground, #ffffff);
            border: none;
            padding: 4px 8px;
            font-size: 11px;
            cursor: pointer;
            border-radius: 2px;
            transition: background-color 0.2s;
        }
        .mini-button:hover {
            background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
        }
        .error-message {
            color: var(--vscode-errorForeground);
            font-size: 12px;
            margin-top: 4px;
        }
        .test-result {
            margin-top: 8px;
        }
        .response-message {
            margin-bottom: 8px;
            border-left: 3px solid var(--vscode-textLink-foreground);
            padding-left: 8px;
        }
        .response-message .message-header {
            font-weight: bold;
            margin-bottom: 2px;
        }
        .toggle-message {
            font-size: 10px;
            margin-top: 4px;
            background-color: transparent;
            border: none;
            color: var(--vscode-textLink-foreground);
            cursor: pointer;
            padding: 0;
        }
        .toggle-message:hover {
            text-decoration: underline;
        }
        .test-case-status {
            position: absolute;
            top: 8px;
            right: 40px; /* Position it to the left of the delete button */
        }
        .status-running {
            color: var(--vscode-progressBar-background);
        }
        .status-success {
            color: var(--vscode-testing-iconPassed);
        }
        .status-failure {
            color: var(--vscode-testing-iconFailed);
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
                            <option value="" disabled>More Options in the next release</option>
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
            <div id="metricsGraph" class="hidden">
                <div class="title-header">Model Comparision Analysis</div>
                <div class="graphs-container">
                    <div class="graph-section">
                        <h4>Total Cost</h4>
                        <div id="costComparison"></div>
                    </div>
                    <div class="graph-section">
                        <h4>Average Latency</h4>
                        <div id="latencyComparison"></div>
                    </div>
                </div>
            </div>
        </div>
        <div id="responseSection">
            <div class="title-header">Playground</div>
            <div id="streamingResult"></div>
            <div id="lastCompletedResult" class="hidden"></div>
            <div id="testCasesContainer"></div>
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

        const lastCompletedResultConatainer = document.getElementById('lastCompletedResult');

        let currentStreamingContent = '';
        let completedResults = [];
        let testCases = [];
        let metricsData = {};

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
            const newHeight = Math.min(textarea.scrollHeight, 90);
            textarea.style.height = newHeight + 'px';
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
            // hide lastCompletedResultConatainer
            lastCompletedResultConatainer.classList.add('hidden');
        });

        function updateStreamingResult() {
           document.getElementById('streamingResult').innerHTML = \`
                <div class="completion-result">
                    <h5>Current Completion</h5>
                    <div class="result-content">\${currentStreamingContent}</div>
                </div>
            \`;
        }

        function updateLastCompletedResultToDisplay() {
            // exclude unit test results
            const filteredCompletedResults = completedResults.filter(result => !result.isFromTest);
            // only show last result
            const result = filteredCompletedResults[filteredCompletedResults.length - 1];
            lastCompletedResultConatainer.innerHTML = \`
            <div class="completion-result">
                <div class="result-header">
                    <h5>Current Completion</h5>
                </div>
                <div class="result-content" id="content\">
                    \${result.content}
                </div>
                <div class="result-metrics">
                    Latency: \${nanoToMilliseconds(result.metrics.latency).toFixed(2)} ms, 
                    Cost: $\${result.metrics.cost.toFixed(6)}
                </div>
                <div class="test-buttons">
                    <button id="addTestCase" class="mini-button">Add Test Case</button>
                </div>
            </div>
             \`;

            const contentElement = document.getElementById('content');

            let userMessages = [];
            if (result.requestBody && result.requestBody.messages.length > 0) {
                userMessages = result.requestBody.messages.filter(message => message.role === 'user');
            }

            // Add event listeners for the new test button
            document.getElementById('addTestCase').addEventListener('click', () => {
                addTest(result.requestBody.messages.filter(message => message.role === 'user'));
            });
            updateTestCasesDisplay();
        }

        function addTest(userMessages) {
            const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            testCases.push({ id: uniqueId, userMessages });
            updateTestCasesDisplay();
        }

        // Modify the addCompletedResult function
        function addCompletedResult(content, metrics, requestBody, llmProvider, isFromTest) {
            completedResults.push({ content, metrics, requestBody, llmProvider, isFromTest });
            updateLastCompletedResultToDisplay();
            updateMetricsGraph();
        }

        function clearStreamingResults() {
            currentStreamingContent = '';
            document.getElementById('streamingResult').innerHTML = '';
        }

        function nanoToMilliseconds(nanoseconds) {
            return nanoseconds / 1000000; // or nanoseconds / 1e6
        }

        function updateMetricsGraph() {
            const metricsGraph = document.getElementById('metricsGraph');
            const costComparisonElement = document.getElementById('costComparison');
            const latencyComparisonElement = document.getElementById('latencyComparison');

            let totalCost = 0;
            let totalLatency = 0;
            let completionCount = completedResults.length;

            metricsData = {};

            completedResults.forEach(result => {
                totalCost += result.metrics.cost;
                totalLatency += nanoToMilliseconds(result.metrics.latency);
            
                const provider = result.llmProvider;
                const model = result.requestBody.model;
                const key = \`\${provider}-\${model}\`;

                if (!metricsData[key]) {
                    metricsData[key] = { cost: 0, latency: 0, count: 0 };
                }
                metricsData[key].cost += result.metrics.cost;
                metricsData[key].latency += nanoToMilliseconds(result.metrics.latency);
                metricsData[key].count++;
            });

            createComparativeBarChart(costComparisonElement, metricsData, 'cost');
            createComparativeBarChart(latencyComparisonElement, metricsData, 'latency');

            // Show the metrics graph if it's hidden
            if (metricsGraph.classList.contains('hidden')) {
                metricsGraph.classList.remove('hidden');
            }
        }

        function createComparativeBarChart(element, data, metric) {
            let html = '';
            const sortedData = Object.entries(data).sort((a, b) => {
                let valueA, valueB;
                switch (metric) {
                    case 'cost':
                    case 'latency':
                        valueA = a[1][metric] / a[1].count;
                        valueB = b[1][metric] / b[1].count;
                        break;
                }
                return valueB - valueA;
            });

            const maxValue = Math.max(...sortedData.map(([_, item]) => {
                switch (metric) {
                    case 'cost':
                    case 'latency':
                        return item[metric] / item.count;
                }
            }));

            sortedData.forEach(([key, item]) => {
                let value, unit;
                switch (metric) {
                    case 'cost':
                        value = (item[metric] / item.count).toFixed(6);
                        unit = '$';
                        break;
                    case 'latency':
                        value = (item[metric] / item.count).toFixed(2);
                        unit = 'ms';
                        break;
                }
                const percentage = (value / maxValue) * 100;
                html += \`
                    <div class="breakdown-item">
                        <span>\${key}: \${unit === 'ms' ? '' : unit}\${value}\${unit === 'ms' ? ' ms' : ''}</span>
                    </div>
                    <div class="breakdown-bar" style="width: \${percentage}%"></div>
                \`;
            });

            element.innerHTML = html;
        }

        // Add this function to update the test cases display
        function updateTestCasesDisplay() {
            const testCasesContainer = document.getElementById('testCasesContainer');
            if (testCases.length > 0) {
                testCasesContainer.innerHTML = \`
                    <div class="test-cases-header">
                        <h4 class="test-cases-title">Test Cases</h4>
                        <div class="test-cases-buttons">
                            <button id="runTestCases" class="test-cases-button">Run</button>
                            <button id="saveTestCases" class="test-cases-button">Save</button>
                        </div>
                    </div>
                \`;
            } else {
                testCasesContainer.innerHTML = '';
            }           
            testCases.slice().reverse().forEach((testCase, index) => {
                const actualIndex = testCases.length - 1 - index;
        
                // Format user messages
                const userMessagesHtml = testCase.userMessages.map((message, msgIndex) => {
                    const content = message.content || ''; // Handle 0 length content
                    const hasMoreCharacters = content.length > 100;
    
                    const previewContent = hasMoreCharacters ? content.slice(0, 100) + '...' : content;
    
                    return \`
                        <div class="user-message">
                            <div class="\${hasMoreCharacters ? 'message-preview' : 'message-full'}">
                                \${previewContent}
                            </div>
                            \${hasMoreCharacters ? \`
                                <div class="message-full hidden">
                                    \${content}
                                </div>
                                <button class="toggle-message" data-id="\${testCase.id}" data-index="\${actualIndex}-\${msgIndex}">
                                    Show more
                                </button>
                            \` : ''}
                        </div>
                    \`;
                }).join('');

                testCasesContainer.innerHTML += \`
                    <div class="test-case" id="test-case-\${testCase.id}">
                        <div class="test-case-header">
                            <h5>Test Case \${testCases.length - index}</h5>
                            <span class="test-case-status"></span>
                            <button class="delete-test-case-btn"onclick="deleteTestCase('\${testCase.id}')">del</button>
                        </div>
                        <div class="user-messages-container">\${userMessagesHtml}</div>
                    </div>
                \`;
            });

            // Add event listeners for toggle buttons
            document.querySelectorAll('.toggle-message').forEach(button => {
                button.addEventListener('click', function() {
                    const testId = this.dataset.id;
                    const messageIndex = this.dataset.msgIndex;
                    const messageContainer = this.closest('.user-message');
                    const preview = messageContainer.querySelector('.message-preview');
                    const full = messageContainer.querySelector('.message-full');
            
                    if (full.classList.contains('hidden')) {
                        preview.classList.add('hidden');
                        full.classList.remove('hidden');
                        this.textContent = 'Show less';
                    } else {
                        preview.classList.remove('hidden');
                        full.classList.add('hidden');
                        this.textContent = 'Show more';
                    }
                });
            });

            const runButton = document.getElementById('runTestCases');
            const saveButton = document.getElementById('saveTestCases');

            if (runButton) {
                const systemMessage = systemMessageElement.value;
                runButton.addEventListener('click', () => {
                    vscode.postMessage({
                        command: 'runtestcases',
                        systemPrompt: systemMessage,
                        testCases: testCases,
                        maxTokens: document.getElementById('maxTokens').value,
                        temperature: document.getElementById('temperatureInput').value,
                        llmProvider: providerSelect.value,
                        llmModel: modelSelect.value
                    });
                });
            }

            if (saveButton) {
                saveButton.addEventListener('click', () => {
                    console.log("TODO");
                });
            }
        }

        function updateTestCaseStatus(testResult) {
            const id = testResult.testCase.id
            const testCase = document.getElementById(\`test-case-\${id}\`);
            const status = testResult.passed ? 'success' : 'failure';
            if (testCase) {
                const statusElement = testCase.querySelector('.test-case-status');
                statusElement.className = 'test-case-status';
        
                // Clear previous results
                const previousResult = testCase.querySelector('.test-result');
                if (previousResult) {
                    previousResult.remove();
                }
        
                switch(status) {
                    case 'running':
                        statusElement.innerHTML = '[running..]';
                        statusElement.classList.add('status-running');
                        break;
                    case 'success':
                        statusElement.innerHTML = '[succeed]';
                        statusElement.classList.add('status-success');
                        break;
                    case 'failure':
                        statusElement.innerHTML = '[failed]';
                        statusElement.classList.add('status-failure');
                        break;
                }
        
                // Add response content
                const resultElement = document.createElement('div');
                resultElement.classList.add('test-result');
                const responseContent = testResult.response || '';
                const hasMoreCharacters = responseContent.length > 100;
                const previewContent = hasMoreCharacters ? responseContent.slice(0, 100) + '...' : responseContent;

                resultElement.innerHTML = \`
                    <div class="response-message">
                        <div class="message-header">Response:</div>
                        <div class="\${hasMoreCharacters ? 'message-preview' : 'message-full'}">
                            \${previewContent}
                        </div>
                        \${hasMoreCharacters ? \`
                            <div class="message-full hidden">
                                \${responseContent}
                            </div>
                            <button class="toggle-message">
                                Show more
                            </button>
                        \` : ''}
                    </div>
                \`;
                if (testResult.error) {
                    resultElement.innerHTML += \`
                        <div class="error-message">\${testResult.error}</div>
                    \`;
                }

                // Add event listener for toggle button
                const toggleButton = resultElement.querySelector('.toggle-message');
                if (toggleButton) {
                    toggleButton.addEventListener('click', function() {
                        const messageContainer = this.closest('.response-message');
                        const preview = messageContainer.querySelector('.message-preview');
                        const full = messageContainer.querySelector('.message-full');
        
                        if (full.classList.contains('hidden')) {
                            preview.classList.add('hidden');
                            full.classList.remove('hidden');
                            this.textContent = 'Show less';
                        } else {
                           preview.classList.remove('hidden');
                            full.classList.add('hidden');
                            this.textContent = 'Show more';
                        }
                    });
                }
            }
        }


        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'appendStreamingResults':
                    currentStreamingContent += message.content;
                    updateStreamingResult();
                    break;
                case 'updateMetricsAndRequestBody':
                    addCompletedResult(currentStreamingContent, message.metrics, message.requestBody, message.llmProvider, false);
                    clearStreamingResults()
                    currentStreamingContent = '';
                    enableExecuteButton();
                    // show lastCompletedResultConatainer
                    lastCompletedResultConatainer.classList.remove('hidden');
                    break;
                case 'updateTestResult':
                    const result = message.result;
                    addCompletedResult(result.response, result.metrics, result.requestBody, result.llmProvider, true);
                    updateTestCaseStatus(result);
                    break;
                case 'error':
                    enableExecuteButton();
                    // show lastCompletedResultConatainer
                    lastCompletedResultConatainer.classList.remove('hidden');
                    break;
            }
        });

        // global scopes
        window.deleteTestCase = function(id) {
            const index = testCases.findIndex(testCase => testCase.id === id);
            if (index !== -1) {
                testCases.splice(index, 1);
                updateTestCasesDisplay();
            }
        }

    </script>
</body>
</html>`;
}