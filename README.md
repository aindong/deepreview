## AI-Powered Code Review CLI 🛠️
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
[![Publish Package](https://github.com/aindong/deepreview/actions/workflows/publish.yml/badge.svg)](https://github.com/aindong/deepreview/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/deepreview)](https://www.npmjs.com/package/deepreview)

A intelligent CLI tool that leverages AI for code analysis, pull request generation, and interactive code reviews.

![Demo](./demo.gif)

## Features ✨
- AI Code Analysis - Get detailed feedback on code quality and potential improvements
- Git Diff Review - Analyze changes in real-time with review-diff command
- PR Generation - Automatically generate PR descriptions from templates
- Interactive Review - Chat-style interface for code feedback
- Real-time Streaming - Get immediate AI responses as they're generated

## Installation 📦
```
npm install -g deepreview
```

## First Time Setup

After installation, run:
```bash
deepreview setup
```

To update your API key later, just run again:
```bash
deepreview setup
```

## Configuration ⚙️

Customize your CLI behavior with:

```bash
deepreview setup
```

Available settings:
- API Key (required)
- Base URL (default: OpenAI's endpoint)
- Default Model (gpt-4o, gpt-4, gpt-3.5-turbo, deepseek-chat, deepseek-reasoner)

View current config:
```bash
deepreview config
```

## Usage 🚀

### Analyze Code Quality
```
deepreview analyze path/to/file.ts
Output formats: text (default) or json
deepreview analyze src/ --format json
```

### Review Git Changes
```
Review staged changes
git diff --staged | deepreview review-diff -
Review specific branch changes
git diff main | deepreview review-diff -
```

### Generate PR Descriptions
```
From current changes
git diff --staged | deepreview generate-pr
From specific branch comparison
git diff origin/main | deepreview generate-pr
```

### Interactive Code Review
```
deepreview review src/deepseek.ts
```

## Development 🛠️
```
Clone repository
git clone https://github.com/yourusername/deepreview.git
cd deepreview
Install dependencies
npm install
Set up environment configuration
cp .env.example .env
```
Add your OpenAI API key to .env:
```
AI_API_KEY=your_api_key_here
```

## Security 🔒

- API keys are stored in your system's secure credential storage:
  - macOS: Keychain
  - Windows: Credential Vault
  - Linux: libsecret
- No sensitive data is stored in plain text files
- Uninstalling will automatically remove all credentials

### This implementation:
1. Uses OS-native secure credential storage
2. Doesn't store API keys in plain text
3. Automatically cleans up on uninstall
4. Falls back to .env for development
5. Maintains strict file permissions for any metadata files

The key benefits:
- Credentials are encrypted at rest by the OS
- Other applications can't access the credentials
- No manual file permission management needed
- Automatic cleanup when uninstalling
