# LLMGate

Run comprehensive tests on prompts right from VS Code using multiple LLM providers.

## Features

- Test your prompts with multiple LLM providers simultaneously
- Analyze prompt performance across different models and temperature settings
- Get detailed test results including pass/fail status, cost, and response for each test
- Receive a summary of test performance and overall cost

## How to use

1. Select the prompt text in your editor or leave it blank to enter in the input panel
2. Open the command palette (Cmd+Shift+P on macOS, Ctrl+Shift+P on Windows/Linux)
3. Type "LLMGate: Test your Prompt" and press Enter
4. In the input panel:
```
Enter or edit your prompt
Describe your target user
Specify LLM providers, models, and temperature settings
```
5. Click Submit to run the test
6. View the comprehensive test results in a new webview panel

## Requirements

- An active internet connection to communicate with the LLMGate Backend
- A valid LLMGate API key

## Extension Settings

This extension contributes the following settings:
- llmgate.apiKey: Your LLMGate API key for authentication

### How to get an API key
1. Visit https://llmgate.github.io/ and request a key
2. Once you receive it, Set the key in VS Code settings or when prompted by the extension

## Known Issues

No known issues at this time.

## Release Notes

### 1.0.0

Initial release of LLMGate with the following features:

- Test prompts with multiple LLM providers
- Customizable user role for generating relevant test questions
- Detailed test results including cost and performance metrics
- Support for OpenAI and Gemini models with customizable parameters
