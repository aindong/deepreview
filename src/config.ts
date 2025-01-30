import { readFile, writeFile } from 'node:fs/promises';
import path from 'path';
import { homedir } from 'node:os';
import { existsSync, mkdirSync } from 'node:fs';

const CONFIG_DIR = path.join(homedir(), '.config', 'deepreview');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

interface Config {
  apiKey?: string;
}

export async function getApiKey(): Promise<string> {
  // Try development .env first
  if (process.env.AI_API_KEY) {
    return process.env.AI_API_KEY;
  }

  // Load from user config
  try {
    const config = await readConfig();
    if (!config.apiKey) {
      throw new Error('API key not configured');
    }
    return config.apiKey;
  } catch (error) {
    throw new Error(`Failed to load API key: ${error instanceof Error ? error.message : 'Unknown error'}\nRun 'deepreview setup' to configure.`);
  }
}

async function readConfig(): Promise<Config> {
  if (!existsSync(CONFIG_PATH)) {
    return {};
  }
  
  const content = await readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

export async function writeConfig(config: Config): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2));
} 