import * as vscode from 'vscode';
import axios from 'axios';
import { BACKEND_URL } from '../utils/constants';
import { updateErrorInWebview, updateMetricsAndRequestBodyInWebview, updateStreamingResponseInWebview, updateTestResultInWebview } from '../utils/updateResponse';
import { promptForApiKey } from '../utils/promptForApiKey';

export async function handleRunTestCases(systemPrompt: string, testCases: any[], maxTokens: number, temperature: number, llmProvider: string, llmModel: string, panel: vscode.WebviewPanel) {
    // Check if API key is set
    const config = vscode.workspace.getConfiguration('llmgate');
    let openaiApiKey = config.get<string>('openaiKey');
    let geminiKey = config.get<string>('geminiKey');

    var apiKey: string | undefined = undefined;
    if (llmProvider === "OpenAI") {
        if (!openaiApiKey) {
            apiKey = await promptForApiKey(llmProvider);
        } else {
            apiKey = openaiApiKey;
        }
    } else if (llmProvider === "Gemini") {
        if (!geminiKey) {
            apiKey = await promptForApiKey(llmProvider);
        } else {
            apiKey = geminiKey;
        }
    }

    if (apiKey === undefined) {
        vscode.window.showInformationMessage(`Please set up an API key.`);
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Running Test Cases",
        cancellable: false
    }, async (progress) => {
        const totalSteps = testCases.length;
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            progress.report({ increment: (100 / totalSteps), message: `Processing test case ${i + 1}/${totalSteps}` });

            const requestBody = {
                "model": llmModel,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    ...testCase.userMessages,
                ],
                "temperature": Number(temperature),
                "max_tokens": Number(maxTokens),
                "stream": false
            };

            try {
                const response = await sendToBackend(requestBody, llmProvider, apiKey ?? "", true);
                const responseData = response.data;
                const cost = response.cost;
                const latency = response.latency;
                const content = responseData.choices[0].message.content;

                let missingKeywords = [];
                const lowerContent = content.toLowerCase();
                for (let i = 0; i < testCase.keywords.length; i++) {
                    const keyword = testCase.keywords[i].toLowerCase();
                    if (!lowerContent.includes(keyword)) {
                        missingKeywords.push(testCase.keywords[i]);
                    }
                }
    
                const allKeywordsPresent = missingKeywords.length === 0;
                
                const result = {
                    testCase: testCase,
                    passed: allKeywordsPresent,
                    response: content,
                    metrics: {
                        latency: latency,
                        cost: cost,    
                    },
                    requestBody: requestBody,
                    llmProvider: llmProvider,
                    error: allKeywordsPresent ? null : `Missing keywords: ${missingKeywords.join(', ')}`
                };

                updateTestResultInWebview(result, panel);

            } catch (error) {
                vscode.window.showErrorMessage(`Error running test case: ${error}`);
                const errorResult = {
                    testCase: testCase,
                    passed: false,
                    error: error
                };
                updateTestResultInWebview(errorResult, panel);
            }
        }
    });
}

export async function handleSubmit(systemPrompt: string, userPrompts: string[], maxTokens: number, temperature: number, llmProvider: string, llmModel: string, panel: vscode.WebviewPanel) {
    // Check if API key is set
    const config = vscode.workspace.getConfiguration('llmgate');
    // let llmgateAPiKey = config.get<string>('apiKey');
    let openaiApiKey = config.get<string>('openaiKey');
    let geminiKey = config.get<string>('geminiKey');

    var apiKey: string | undefined = undefined;
    var isExternalLLMKey = true;
    if (llmProvider === "OpenAI") {
        if (!openaiApiKey) {
            apiKey = await promptForApiKey(llmProvider);
        } else {
            apiKey = openaiApiKey;
        }
    } else if (llmProvider === "Gemini") {
        if (!geminiKey) {
            apiKey = await promptForApiKey(llmProvider);
        } else {
            apiKey = geminiKey;
        }
    }

    // if (apiKey === undefined) {
    //     // use llmgate key
    //     isExternalLLMKey = false;
    //     if (!llmgateAPiKey) {
    //         // if neither of them is set try to get llmgate key
    //         apiKey = await promptForApiKey("");   
    //     } else {
    //         apiKey = llmgateAPiKey;
    //     }
    // }

    if (apiKey === undefined) {
        // if still undefined show error
        vscode.window.showInformationMessage(`Please set up an API key.`);
        return;
    }

    let messages = [
        {
            "role": "system",
            "content": systemPrompt,
        }
    ];
    for (let i=0; i < userPrompts.length; i++) {
        messages.push(
            {
                "role": "user",
                "content": userPrompts[i],
            }
        );
    }
    const requestBody = {
        "model": llmModel,
        "messages": messages,
        "temperature": Number(temperature),
        "max_tokens": Number(maxTokens),
        "stream": true
    };
    
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Running..",
        cancellable: false
    }, async (progress) => {
        progress.report({ increment: 0 });
        try {
            await sendToBackendStream(
                requestBody, 
                llmProvider, 
                apiKey ?? "",
                isExternalLLMKey,
                (chunk: string) => {
                    updateStreamingResponseInWebview(chunk, panel);
                },
                (metrics: any) => {
                    updateMetricsAndRequestBodyInWebview(metrics, requestBody, llmProvider, panel);
                }
            );
        } catch (error) {
            vscode.window.showErrorMessage('Error testing your prompt. Please try again!');
            updateErrorInWebview(panel);
        }
    });
}

async function sendToBackendStream(requestBody: any, 
    llmProvider: string,
    apiKey: string, isExternalLLMKey: boolean,
    onChunk: (chunk: string) => void,
    onMetrics: (metrics: any) => void): Promise<void> {
    const url = `${BACKEND_URL}?provider=${llmProvider}`;

    const apiKeyHeader = isExternalLLMKey ? 'llm-api-key' : 'key';
    
    const response = await axios.post(url, requestBody, {
        headers: {
            [apiKeyHeader]: `${apiKey}`,
            'x-llmgate-source': 'vscode_extension',
        },
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        let buffer = '';
        let isMetricsExpected = false;
        response.data.on('data', (chunk: Buffer) => {
            const chunkStr = chunk.toString('utf-8');
            buffer += chunkStr;

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                let jsonStr = "";
                if (line.startsWith('data: ')) {
                    jsonStr = line.slice(6);
                } else if (line.startsWith('data:')) {
                    jsonStr = line.slice(5);
                }
                if (jsonStr.length > 0) {
                    if (jsonStr.trim() === '[DONE]') {
                        // Main content stream is finished, expect metrics
                        isMetricsExpected = true;
                        continue;
                    }
                    if (jsonStr.trim() === '[METRICS]') {
                        // Metrics are coming next
                        continue;
                    }
                    if (jsonStr.trim() === '[CLOSE]') {
                        resolve();
                        return;
                    }
                    try {
                        const jsonData = JSON.parse(jsonStr);
                        if (isMetricsExpected) {
                            onMetrics(jsonData);
                        } else if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                            onChunk(jsonData.choices[0].delta.content);
                        }
                    } catch (e) {
                        console.error('Error parsing JSON:', e);
                    }
                }
            }
        });

        response.data.on('end', () => {
            resolve();
        });

        response.data.on('error', (err: Error) => {
            reject(err);
        });
    });
}

async function sendToBackend(requestBody: any, 
    llmProvider: string,
    apiKey: string, isExternalLLMKey: boolean): Promise<any> {
    const url = `${BACKEND_URL}?provider=${llmProvider}`;

    const apiKeyHeader = isExternalLLMKey ? 'llm-api-key' : 'key';
    
    const response = await axios.post(url, requestBody, {
        headers: {
            [apiKeyHeader]: `${apiKey}`,
            'x-llmgate-source': 'vscode_extension',
        },
        responseType: 'json'
    });

    // Get cost from header and convert to number if it exists
    const cost = response.headers['llm-cost'];
    const parsedCost = cost ? parseFloat(cost) : 0;

    // Get latency from header and convert to number if it exists
    const latency = response.headers['llm-latency'];
    const parsedLatency = latency ? parseInt(latency, 10) : 0;

    return {
        data: response.data,
        cost: parsedCost,
        latency: parsedLatency,
    };
}
