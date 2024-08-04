export function updateStreamingResponseInWebview(response: string, panel: any) {
    panel.webview.postMessage({ 
        command: 'appendStreamingResults', 
        content: response 
    });
}

export function updateMetricsAndRequestBodyInWebview(metrics: any, requestBody: any, llmProvider: any, panel: any) {
    panel.webview.postMessage({ 
        command: 'updateMetricsAndRequestBody', 
        metrics: metrics,
        requestBody: requestBody,
        llmProvider: llmProvider,
    });
}

export function updateErrorInWebview(panel: any) {
    panel.webview.postMessage({ 
        command: 'error', 
    });
}

export function updateTestResultInWebview(result: any, panel: any) {
    panel.webview.postMessage({
        command: 'updateTestResult',
        result: result
    });
}

export function updateUploadTestCasesInWebview(testCases: any, panel: any) {
    panel.webview.postMessage({
        command: 'updateUploadTestCases',
        result: testCases,
    });
}