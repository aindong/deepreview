import { readFile } from 'fs/promises';
import { reviewDiff } from './diff';
import { streamAiResponse } from './deepseek';
import { CodeReviewComments } from './interfaces';

const PR_TEMPLATE_PATH = '.github/PULL_REQUEST_TEMPLATE.md';

export async function generatePRDescription(diff: string): Promise<string> {
  try {
    const [template, reviewComments] = await Promise.all([
      readTemplateFile(),
      analyzeDiff(diff)
    ]);

    return generateDescription(template, reviewComments);
  } catch (error) {
    throw new Error(`PR generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function readTemplateFile(): Promise<string> {
  try {
    return await readFile(PR_TEMPLATE_PATH, 'utf-8');
  } catch (error) {
    console.warn('PR template not found, using default template');
    return `# Description\n\n# Changes\n\n# Checklist`;
  }
}

async function analyzeDiff(diff: string) {
  const prompt = `Analyze this Git diff and provide structured review comments:`;
  return streamAiResponse(prompt, diff, () => {});
}

async function generateDescription(template: string, comments: string): Promise<string> {
  const prompt = `Generate a PR description using this template, strictly follow the format and don't add any additional text:
  
Template:
${template}

Review Summary:
${comments}

No need to add or do code review or anything else, just generate the PR description. 
Make sure to explain the changes in detail and any potential issues inside the PR description.
`;

  return streamAiResponse(prompt, '', (chunk) => {
    process.stdout.write(chunk);
  }) as Promise<string>;
}