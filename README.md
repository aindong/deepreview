## AI-Powered Code Review CLI 🛠️
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js CI](https://github.com/yourusername/deepreview/actions/workflows/node.js.yml/badge.svg)
A intelligent CLI tool that leverages AI for code analysis, pull request generation, and interactive code reviews.

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