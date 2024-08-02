import * as vscode from 'vscode';
import axios from 'axios';
import { BACKEND_URL } from '../utils/constants';
import { updateErrorInWebview, updateMetricsAndRequestBodyInWebview, updateStreamingResponseInWebview } from '../utils/updateResponse';
import { promptForApiKey } from '../utils/promptForApiKey';

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
            await sendToBackend(
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

async function sendToBackend(requestBody: any, 
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
