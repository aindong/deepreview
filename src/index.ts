#!/usr/bin/env node

import { Command } from 'commander';
import { analyzeCode } from './analyzer';
import { reviewDiff } from './diff';
import 'dotenv/config';
import { readFile } from 'fs/promises';
import { generatePRDescription } from './pr-generator';
import { streamAiResponse } from './deepseek';
import { setupCommand } from './setup';
import { getConfig } from './config';
import packageJson from '../package.json';

const program = new Command();

program
  .name('deepreview')
  .description('AI-powered code review CLI')
  .usage('[command] [options]')
  .version(packageJson.version)
  .configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => cmd.name() + (cmd.usage() ? ' ' + cmd.usage() : ''),
    commandDescription: (cmd) => cmd.description(),
    formatHelp: (cmd, helper) => {
      return [
        `Usage: ${helper.commandUsage(cmd)}`,
        '',
        'Commands:',
        helper.visibleCommands(cmd).map(subcmd => 
          `  ${subcmd.name().padEnd(15)} ${subcmd.description()}`
        ).join('\n'),
        '',
        'Options:',
        helper.visibleOptions(cmd).map(option => 
          `  ${option.flags.padEnd(25)} ${option.description}`
        ).join('\n'),
        '',
        `Run 'deepreview help <command>' for more information on specific commands`
      ].join('\n');
    }
  })
  .addHelpText('after', `
Examples:
  $ deepreview analyze src/ --format json
  $ git diff | deepreview review-diff -
  $ deepreview setup
  $ deepreview review src/file.ts
  `)
  .showHelpAfterError('(add --help for additional information)')
  .showSuggestionAfterError();

program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + (cmd.usage() ? ' ' + cmd.usage() : ''),
  commandDescription: (cmd) => cmd.description(),
  optionDescription: (opt) => opt.description,
  visibleOptions: (cmd) => cmd.options.filter(option => !('hidden' in option && option.hidden)),
  visibleCommands: (cmd) => cmd.commands.filter(c => !('hidden' in c && c.hidden)),
  
  formatHelp: (cmd, helper) => {
    return [
      helper.commandUsage(cmd),
      '',
      helper.commandDescription(cmd),
      '',
      helper.visibleOptions(cmd).map(option => {
        return `  ${option.flags}${option.description ? ' - ' + option.description : ''}`;
      }).join('\n'),
      '',
      ...helper.visibleCommands(cmd).map(subcmd => {
        return `  ${helper.subcommandTerm(subcmd)}${subcmd.description ? ' - ' + subcmd.description : ''}`;
      })
    ].join('\n');
  }
});

// Analyze a single file or directory
program
  .command('analyze <path>')
  .description('Analyze code for improvements')
  .usage('<path> [options]')
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
  .usage('<diff>')
  .action(async (diff) => {
    const results = await reviewDiff(diff, 'typescript');
    console.log(results);
  });

program
  .command('generate-pr')
  .description('Generate PR description from template and code analysis')
  .usage('[options]')
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
  .usage('<file>')
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

program
  .command('setup')
  .description('Initial configuration setup')
  .usage('')
  .action(async () => {
    try {
      await setupCommand();
    } catch (error) {
      console.error('Setup failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('config')
  .description('View current configuration')
  .usage('')
  .action(async () => {
    try {
      const config = await getConfig();
      console.log('Current configuration:');
      console.log(`- API Key: ${config.apiKey ? '*****' + config.apiKey.slice(-4) : 'Not set'}`);
      console.log(`- Base URL: ${config.baseUrl || 'Default'}`);
      console.log(`- Model: ${config.model || 'gpt-4o'}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  });

// Handle unknown commands
program
  .arguments('[command]')
  .action((command) => {
    console.error(`Unknown command: ${command}\n`);
    program.help();
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

// Show help when no commands
if (process.argv.length < 3) {
  program.help();
}