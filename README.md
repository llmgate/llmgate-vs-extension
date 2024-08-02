# LLMGate

LLMGate Prompt Lab is a powerful VSCode extension designed to streamline your prompt engineering workflow. It provides an intuitive interface for testing, comparing, and optimizing prompts across different large language models.

## Features

### 1. In-VSCode Prompt Testing
- Run and iterate on prompts directly within VSCode
- Real-time streaming of model responses
- Support for system messages and multi-block user prompts

### 2. Model Comparison
- Compare different models side-by-side
- Analyze cost and latency metrics to find the most efficient model for your use case
- Visual graphs for easy performance comparison

### 3. Test Case Management
- Quickly create test cases based on your prompts
- Run test suites to ensure new prompts don't break existing use cases
- Manage and organize your test cases efficiently

### 4. Multi-Model Support
- Currently supports OpenAI and Google Gemini models
- Easy switching between different providers and models

### 5. Customizable Parameters
- Adjust key parameters like temperature, max tokens, and more
- Fine-tune your prompts for optimal performance

## Coming Soon

- Function and tools support
- Eval Agent Tests for more comprehensive prompt evaluation
- Integration with more LLM providers and models

## Requirements

- VSCode version 1.60.0 or higher
- An active internet connection
- API keys for supported LLM providers (OpenAI, Google)

## Extension Settings

This extension contributes the following settings:

* `llmgate.openAIApiKey`: Your OpenAI API key
* `llmgate.googleApiKey`: Your Google API key

## Installation

1. Open VSCode
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "LLMGate Prompt Lab"
4. Click Install

## Getting Started

1. After installation, select your prompt and open the command palette (Ctrl+Shift+P)
2. Type "LLMGate Prompt Lab" and select it
3. The Prompt Lab interface will open in a new tab
4. Enter your system message and user prompts
5. Select your desired model and parameters
6. Click "Execute" to run your prompt

## Known Issues

No known issues at this time.

## Release Notes

### 1.0.1
- Model comparison for cost and latency
- Test case creation and management
- Support for OpenAI and Google Gemini models

### 1.0.0

Initial release of LLMGate with the following features:

- Test prompts with multiple LLM providers
- Customizable user role for generating relevant test questions
- Detailed test results including cost and performance metrics
- Support for OpenAI and Gemini models with customizable parameters

## Feedback and Contributions

We welcome your feedback and contributions! Please open an issue or submit a pull request on our [GitHub repository](link-to-github-repo).

## License

This project is licensed under the MIT License. See the [MIT License](https://opensource.org/licenses/MIT) for details.

---

**Enjoy using LLMGate Prompt Lab!**