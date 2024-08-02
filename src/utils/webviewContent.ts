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
        .result-votes {
            margin-top: 8px;
        }
        .vote-btn {
            margin-right: 8px;
            font-size: 12px;
            background: none;
            border: none;
            cursor: pointer;
            opacity: 0.5;
        }
        .vote-btn.active {
            opacity: 1;
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
            <div id="metricsGraph" class="hidden">
                <div class="title-header">Analysis</div>
                <div class="graphs-container">
                    <div class="graph-section">
                        <h4>Cost Comparison</h4>
                        <div id="costComparison"></div>
                    </div>
                    <div class="graph-section">
                        <h4>Latency Comparison</h4>
                        <div id="latencyComparison"></div>
                    </div>
                    <div id="upvotesComparisonContainer" class="graph-section hidden">
                        <h4>Upvotes Comparison</h4>
                        <div id="upvotesComparison"></div>
                    </div>
                    <div id="downvotesComparisonContainer" class="graph-section hidden">
                        <h4>Downvotes Comparison</h4>
                        <div id="downvotesComparison"></div>
                    </div>
                </div>
            </div>
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
        let metricsData = {};

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
                case 'updateMetricsAndRequestBody':
                    addCompletedResult(currentStreamingContent, message.metrics, message.requestBody, message.llmProvider);
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
                    <h5>Test \${completedResults.length - index}</h5>
                    <button class="toggle-btn" id="toggleBtn\${index}">▼</button>
                </div>
                <div class="result-content" id="content\${index}">
                    \${result.content}
                </div>
                <div class="result-metrics">
                    Latency: \${nanoToMilliseconds(result.metrics.latency).toFixed(2)} ms, 
                    Cost: $\${result.metrics.cost.toFixed(6)}
                </div>
                <div class="result-votes">
                    <button onclick="vote(\${index}, 1)" class="vote-btn \${result.vote === 1 ? 'active' : ''}">👍</button>
                    <button onclick="vote(\${index}, -1)" class="vote-btn \${result.vote === -1 ? 'active' : ''}">👎</button>
                </div>
            </div>
            \`).join('');
        }

        function vote(index, value) {
            if (completedResults[index].vote === value) {
                completedResults[index].vote = 0; // Reset vote if clicking the same button
            } else {
                completedResults[index].vote = value;
            }
            updateCompletedResultsDisplay(); // Refresh the display to show updated votes
            updateMetricsGraph();
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
        function addCompletedResult(content, metrics, requestBody, llmProvider) {
            completedResults.unshift({ content, metrics, requestBody, llmProvider, vote: 0 });
            updateCompletedResultsDisplay();
            setInitialResultsState(); // Set initial state after updating display
            updateMetricsGraph();
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
                    <h3>Test \${completionResults.length - index}</h3>
                    <div class="result-content">\${result.content}</div>
                    <div class="result-metrics">
                        Latency: \${nanoToMilliseconds(result.metrics.latency).toFixed(2)} ms, 
                        Cost: $\${result.metrics.cost.toFixed(6)}
                    </div>
                </div>
            \`).join('');
        }

        function updateMetricsGraph() {
            const metricsGraph = document.getElementById('metricsGraph');
            const costComparisonElement = document.getElementById('costComparison');
            const latencyComparisonElement = document.getElementById('latencyComparison');
            const upvotesComparisonElement = document.getElementById('upvotesComparison');
            const downvotesComparisonElement = document.getElementById('downvotesComparison');

            const upvotesComparisonContainerElement = document.getElementById('upvotesComparisonContainer');
            const downvotesComparisonContainerElement = document.getElementById('downvotesComparisonContainer');


            let totalCost = 0;
            let totalLatency = 0;
            let totalUpvotes = 0;
            let totalDownvotes = 0;
            let completionCount = completedResults.length;

            metricsData = {};

            completedResults.forEach(result => {
                totalCost += result.metrics.cost;
                totalLatency += nanoToMilliseconds(result.metrics.latency);
                if (result.vote === 1) totalUpvotes++;
                if (result.vote === -1) totalDownvotes++;

                const provider = result.llmProvider;
                const model = result.requestBody.model;
                const key = \`\${provider}-\${model}\`;

                if (!metricsData[key]) {
                    metricsData[key] = { cost: 0, latency: 0, upvotes: 0, downvotes: 0, count: 0 };
                }
                metricsData[key].cost += result.metrics.cost;
                metricsData[key].latency += nanoToMilliseconds(result.metrics.latency);
                if (result.vote === 1) {
                    metricsData[key].upvotes++;
                } else if (result.vote === -1) { 
                    metricsData[key].downvotes++; 
                }
                metricsData[key].count++;
            });

            createComparativeBarChart(costComparisonElement, metricsData, 'cost');
            createComparativeBarChart(latencyComparisonElement, metricsData, 'latency');

            if (totalUpvotes > 0) {
                upvotesComparisonContainerElement.classList.remove('hidden');
                createComparativeBarChart(upvotesComparisonElement, metricsData, 'upvotes');
            } else {
                upvotesComparisonContainerElement.classList.add('hidden');
            }

            if (totalDownvotes > 0) {
                downvotesComparisonContainerElement.classList.remove('hidden');
                createComparativeBarChart(downvotesComparisonElement, metricsData, 'downvotes');
            } else {
                downvotesComparisonContainerElement.classList.add('hidden');
            }

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
                    case 'upvotes':
                    case 'downvotes':
                        valueA = a[1][metric];
                        valueB = b[1][metric];
                        break;
                }
                return valueB - valueA;
            });

            const maxValue = Math.max(...sortedData.map(([_, item]) => {
                switch (metric) {
                    case 'cost':
                    case 'latency':
                        return item[metric] / item.count;
                    case 'upvotes':
                    case 'downvotes':
                        return item[metric];
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
                    case 'upvotes':
                    case 'downvotes':
                        value = item[metric];
                        unit = '';
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

    </script>
</body>
</html>`;
}