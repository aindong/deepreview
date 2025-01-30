import inquirer from 'inquirer';
import { getApiKey, writeConfig, deleteConfig } from './config';

export async function setupCommand() {
  console.log('Welcome to DeepReview! Let\'s get you set up.\n');

  try {
    // Check if already configured
    const currentKey = await getApiKey().catch(() => null);
    
    if (currentKey) {
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Existing configuration found:',
        choices: [
          { name: 'View current API key', value: 'view' },
          { name: 'Update API key', value: 'update' },
          { name: 'Exit', value: 'exit' }
        ]
      }]);

      if (action === 'view') {
        console.log(`\nCurrent API Key: ${currentKey}`);
        return;
      } else if (action === 'exit') {
        return;
      }
    }

    // Get API key from user
    const { apiKey, baseUrl, model } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your OpenAI/DeepSeek API key:',
        validate: input => !!input.trim() || 'API key is required'
      },
      {
        type: 'input',
        name: 'baseUrl',
        message: 'API base URL (leave blank for default):',
        default: 'https://api.openai.com/v1'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Select default model:',
        choices: [
          { name: 'GPT-4o', value: 'gpt-4o' },
          { name: 'GPT-4', value: 'gpt-4' },
          { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { name: 'DeepSeek', value: 'deepseek-chat' },
          { name: 'DeepSeek Reasoner (R1)', value: 'deepseek-reasoner' },
        ],
        default: 'gpt-4o'
      }
    ]);

    // Write to system keychain
    await writeConfig({
      apiKey,
      baseUrl: baseUrl || undefined,
      model: model || 'gpt-4o'
    });
    console.log('\n✅ Configuration saved successfully!');

  } catch (error) {
    console.error('Setup failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
} 