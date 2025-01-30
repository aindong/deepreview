import { readFile, readdir } from 'fs/promises';
import { CodeAnalysisResult, CodeSuggestion, ProgrammingLanguage } from './interfaces';
import { queryLLM, streamAiResponse } from './deepseek';
import path from 'path';

export async function analyzeCode(fileOrDir: string): Promise<CodeAnalysisResult[]> {
  const files = await getFiles(fileOrDir);
  const results: CodeAnalysisResult[] = [];

  for (const file of files) {
    const code = await readFile(file, 'utf-8');
    const suggestions = await analyzeWithDeepSeek(code, 'typescript');
    // results.push({ filePath: file, suggestions });
  }

  return results;
}

async function getFiles(path: string): Promise<string[]> {
  // Implement directory traversal or use glob
  // For simplicity, assume single file for now
  return [path];
}

async function analyzeWithDeepSeek(code: string, programmingLanguage: ProgrammingLanguage) {
  const prompt = `Review this code for:
1. Style violations (PEP8, ESLint standards)
2. Potential bugs
3. Suggested refactors
4. Security issues

The code is written in ${programmingLanguage}.
Return findings in JSON format with line numbers.`;
  
  await reviewCode(prompt, code);
}

function parseAiResponse(response: string): CodeSuggestion[] {
  // Implement parsing logic (this will depend on how DeepSeek formats responses)
  // For now, return mock data
  return [
    {
      line: 15,
      message: "Avoid using var, use let/const instead",
      suggestedFix: "Replace 'var' with 'const'",
      severity: 'warning'
    }
  ];
}

async function reviewCode(prompt: string, code: string) {
  try {
    const result = await streamAiResponse(prompt, code, (chunk) => {
      process.stdout.write(chunk); // Stream to CLI in real-time
    });
    
    // Use the parsed result
    console.log('\n\nStructured Review:');
    console.log(result);
  } catch (error) {
    console.error('Review failed:', error instanceof Error ? error.message : 'Unknown error');
  }
}