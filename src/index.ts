import { Command } from 'commander';
import { analyzeCode } from './analyzer';
import { reviewDiff } from './diff';
import 'dotenv/config';
import { readFile } from 'fs/promises';

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

program.parse(process.argv);