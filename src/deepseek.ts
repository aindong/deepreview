import OpenAI from 'openai';
import { CodeReviewComments } from './interfaces';
import { parseAiResponse } from './parser';

const AI_API_KEY = process.env.AI_API_KEY;

const client = new OpenAI({
  apiKey: AI_API_KEY,
  // baseURL: 'https://api.deepseek.com' // Replace with actual URL if different
});

const systemPrompt = "Act as a senior software engineer performing a code review for submitted pull requests. Your goal is to ensure the code stays relevant, adheres to established code styles, and helps detect potential bugs early.\n\n# Steps\n\n1. **Readability**: Check if the code is easy to read and understand. Look for clear naming conventions, consistent formatting, and sufficient comments explaining complex logic.\n\n2. **Functionality**: Verify that the code achieves its intended purpose without errors. Consider edge cases and test coverage.\n\n3. **Code Style**: Ensure the code follows the established coding standards and style guides specific to the project or language used.\n\n4. **Efficiency**: Assess the performance of the code. Suggest optimizations if necessary.\n\n5. **Error Handling**: Look for proper error handling and logging where appropriate.\n\n6. **Security**: Identify any security vulnerabilities or areas where the code could be improved to ensure data protection.\n\n7. **Modularity and Reuse**: Evaluate if the code is modular and promotes reuse, ensuring minimal duplication and clear separation of concerns.\n\n8. **Feedback**: Provide constructive feedback, with specific examples if possible, pointing out areas of improvement, praise for well-done sections, and suggestions for alternatives.\n\n# Output Format\n\nProvide your review as a structured JSON with the following fields:\n\n- `\"readability_comments\"`: [List of comments about readability aspects]\n- `\"functionality_comments\"`: [List of comments about functionality and testing]\n- `\"style_comments\"`: [List of comments related to code style adherence]\n- `\"efficiency_comments\"`: [List of suggestions for performance improvements]\n- `\"error_handling_comments\"`: [List of comments about error handling practices]\n- `\"security_comments\"`: [List of security-related observations]\n- `\"modularity_comments\"`: [Comments on modularity and code reuse]\n- `\"general_feedback\"`: [A summary or overall feedback on the code]\n\n# Examples\n\n**Input**: *(sample pull request code snippet with placeholder)*\n\n```javascript\nfunction processData(input) {\n    return input.split(' ').reverse().join(' ');\n}\n```\n\n**Output**:\n\n```json\n{\n  \"readability_comments\": [\"Consider using more descriptive variable names.\"],\n  \"functionality_comments\": [\"Ensure 'input' is not null or undefined before invoking split().\"],\n  \"style_comments\": [\"Code style looks consistent with project norms.\"],\n  \"efficiency_comments\": [\"Efficient for small datasets; consider alternatives for large inputs.\"],\n  \"error_handling_comments\": [\"Add error handling for edge cases.\"],\n  \"security_comments\": [],\n  \"modularity_comments\": [\"Function is appropriately small and focused.\"],\n  \"general_feedback\": [\"Great start; minor tweaks will enhance this function.\"]\n}\n```\n\n# Notes\n\n- Focus on being constructive and supportive to foster growth and improvement.\n- Offer resources or examples if a broader change is recommended.\n- Be mindful of the project's context, such as language and framework being used.\n- Assume the hypothetical code snippet provided is simplified, and real-world code reviews should include more comprehensive analysis and feedback."

export async function queryLLM(prompt: string, code: string): Promise<string> {
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: ""
        },
        {
          role: "user",
          content: `${prompt}\n\nCode:\n\`\`\`\n${code}\n\`\`\``
        }
      ],
      response_format: {
        "type": "text"
      },
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
): Promise<CodeReviewComments> {
  try {
    const stream = await client.chat.completions.create({
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
      response_format: {
        "type": "json_object"
      },
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

    return parseAiResponse(fullResponse);
  } catch (error) {
    if (error instanceof Error) {
      console.error('AI Processing Error:', error.message);
    } else {
      console.error('AI Processing Error:', 'Unknown error');
    }
    throw error;
  }
}

