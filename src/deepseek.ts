import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions'; // Replace with actual URL

export async function queryDeepSeek(prompt: string, code: string): Promise<string> {
  try {
    const response = await axios.post(API_URL, {
      model: "deepseek-r1",
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nCode:\n\`\`\`\n${code}\n\`\`\``
        }
      ],
      temperature: 0.2
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    throw error;
  }
}