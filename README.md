## AI-Powered Code Review CLI 🛠️
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Node.js CI](https://github.com/yourusername/ai-code-reviewer/actions/workflows/node.js.yml/badge.svg)
A intelligent CLI tool that leverages AI for code analysis, pull request generation, and interactive code reviews.

## Features ✨
- AI Code Analysis - Get detailed feedback on code quality and potential improvements
- Git Diff Review - Analyze changes in real-time with review-diff command
- PR Generation - Automatically generate PR descriptions from templates
- Interactive Review - Chat-style interface for code feedback
- Real-time Streaming - Get immediate AI responses as they're generated

## Installation 📦
```
Clone repository
git clone https://github.com/yourusername/ai-code-reviewer.git
cd ai-code-reviewer
Install dependencies
npm install
Set up environment configuration
cp .env.example .env
```
Add your OpenAI API key to .env:
```
AI_API_KEY=your_api_key_here
```

## Usage 🚀

### Analyze Code Quality
```
npx ts-node src/index.ts analyze path/to/file.ts
Output formats: text (default) or json
npx ts-node src/index.ts analyze src/ --format json
```

### Review Git Changes
```
Review staged changes
git diff --staged | npx ts-node src/index.ts review-diff -
Review specific branch changes
git diff main | npx ts-node src/index.ts review-diff -
```

### Generate PR Descriptions
```
From current changes
git diff | npx ts-node src/index.ts generate-pr
From specific branch comparison
git diff origin/main | npx ts-node src/index.ts generate-pr
```

### Interactive Code Review
```
npx ts-node src/index.ts review src/deepseek.ts
```