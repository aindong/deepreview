import OpenAI from 'openai';
import { CodeReviewComments } from './interfaces';
import { parseAiResponse } from './parser';

const AI_API_KEY = process.env.AI_API_KEY;

const client = new OpenAI({
  apiKey: AI_API_KEY,
  // baseURL: 'https://api.deepseek.com' // Replace with actual URL if different
});

const systemPrompt = "Act as a Senior Software Engineer performing a code review for submitted pull requests. Your goal is to ensure the code stays relevant, adheres to established code styles, and helps detect potential bugs early. Also provide detailed summary of the code changes and any potential issues."

export async function queryLLM(prompt: string, code: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
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
    const content = code ? `${prompt}\n\nCode:\n\`\`\`\n${code}\n\`\`\`` : prompt;
    const stream = await client.chat.completions.create({
      model: "gpt-4o",
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

