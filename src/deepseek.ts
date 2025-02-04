import OpenAI from 'openai';
import { CodeReviewComments } from './interfaces';
import { parseAiResponse } from './parser';
import { getApiKey, getConfig } from './config';

let client: OpenAI | null = null;
let defaultModel = 'gpt-4o';

async function getClient(): Promise<OpenAI> {
  if (!client) {
    const { apiKey, baseUrl, model } = await getConfig();
    defaultModel = model || 'gpt-4o';
    
    client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      defaultHeaders: {
        'User-Agent': 'DeepReview-CLI/1.0'
      }
    });
  }
  return client;
}

const systemPrompt = "Act as a Senior Software Engineer performing a code review for submitted pull requests. Your goal is to ensure the code stays relevant, adheres to established code styles, and helps detect potential bugs early. Also provide detailed summary of the code changes and any potential issues."

export async function queryLLM(prompt: string, code: string): Promise<string> {
  try {
    const openai = await getClient();
    const completion = await openai.chat.completions.create({
      model: defaultModel,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${prompt}\n\nCode:\n\`\`\`\n${code}\n\`\`\``
        }
      ],
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });

    return completion.choices[0].message.content || '';
  } catch (error) {
    if (error instanceof Error) {
      console.error('DeepSeek API Error:', error.message);
    } else {
      console.error('DeepSeek API Error:', 'Unknown error');
    }
    throw error;
  }
}

export async function streamAiResponse(
  prompt: string,
  code: string,
  onProgress: (chunk: string) => void
): Promise<string> {
  try {
    const openapi = await getClient();
    const content = code ? `${prompt}\n\nCode:\n\`\`\`\n${code}\n\`\`\`` : prompt;
    const stream = await openapi.chat.completions.create({
      model: defaultModel,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 1,
      max_completion_tokens: 2048,
      stream: true
    });

    let fullResponse = '';
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        onProgress(content);
      }
    }

    return fullResponse;
  } catch (error) {
    if (error instanceof Error) {
      console.error('AI Processing Error:', error.message);
    } else {
      console.error('AI Processing Error:', 'Unknown error');
    }
    throw error;
  }
}

