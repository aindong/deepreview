import { Command } from 'commander';
import { analyzeCode } from './analyzer';
import { reviewDiff } from './diff';
import 'dotenv/config';
import { readFile } from 'fs/promises';
import { generatePRDescription } from './pr-generator';
import { streamAiResponse } from './deepseek';

const program = new Command();

program
  .name('deepseek-reviewer')
  .description('CLI for AI-powered code reviews using DeepSeek R1')
  .version('0.1.0');

// Analyze a single file or directory
program
  .command('analyze <path>')
  .description('Analyze code for improvements')
  .option('--format <format>', 'Output format (text, json)', 'text')
  .action(async (path, options) => {
    const results = await analyzeCode(path);
    if (options.format === 'json') {
      console.log(JSON.stringify(results, null, 2));
    } else {
      results.forEach(result => {
        console.log(`\nFile: ${result.filePath}`);
        result.suggestions.forEach(suggestion => {
          console.log(`[Line ${suggestion.line}] [${suggestion.severity}]: ${suggestion.message}`);
          if (suggestion.suggestedFix) console.log(`Fix: ${suggestion.suggestedFix}`);
        });
      });
    }
  });

// Analyze a Git diff
program
  .command('review-diff <diff>')
  .description('Review a Git diff string')
  .action(async (diff) => {
    const results = await reviewDiff(diff, 'typescript');
    console.log(results);
  });

program
  .command('generate-pr')
  .description('Generate PR description from template and code analysis')
  .option('-d, --diff <diff>', 'Git diff to analyze (use - for stdin)', '-')
  .action(async (options) => {
    try {
      const diffContent = await getDiffContent(options.diff);
      await generatePRDescription(diffContent);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('review <file>')
  .description('Perform interactive code review with AI feedback')
  .action(async (file) => {
    try {
      const code = await readFile(file, 'utf-8');
      const prompt = "Please review this code following our code review guidelines:";
      await streamAiResponse(prompt, code, (chunk) => {
        process.stdout.write(chunk);
      });
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

async function getDiffContent(diffInput: string): Promise<string> {
  if (diffInput === '-') {
    return new Promise((resolve, reject) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => data += chunk);
      process.stdin.on('end', () => resolve(data));
      process.stdin.on('error', reject);
    });
  }
  return diffInput;
}

program.parse(process.argv);