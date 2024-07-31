export function updateStreamingResponseInWebview(response: string, panel: any) {
    panel.webview.postMessage({ 
        command: 'appendStreamingResults', 
        content: response 
    });
}

export function updateMetricsInWebview(metrics: any, panel: any) {
    panel.webview.postMessage({ 
        command: 'updateMetrics', 
        metrics: metrics 
    });
}

export function updateErrorInWebview(panel: any) {
    panel.webview.postMessage({ 
        command: 'error', 
    });
}