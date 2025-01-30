import inquirer from 'inquirer';
import { getApiKey, writeConfig } from './config';

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
    const { apiKey } = await inquirer.prompt([{
      type: 'password',
      name: 'apiKey',
      message: 'Enter your OpenAI/DeepSeek API key:',
      validate: input => !!input.trim() || 'API key is required'
    }]);

    // Write to config file
    await writeConfig({ apiKey });
    console.log('\n✅ Configuration saved successfully!');

  } catch (error) {
    console.error('Setup failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
} 