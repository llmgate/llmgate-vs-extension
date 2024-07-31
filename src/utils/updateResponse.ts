export function updateStreamingResponseInWebview(response: string, panel: any) {
    panel.webview.postMessage({ 
        command: 'appendStreamingResults', 
        content: response 
    });
}
