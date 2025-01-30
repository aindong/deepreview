import { readFile, writeFile } from 'node:fs/promises';
import path from 'path';
import { homedir } from 'node:os';
import { existsSync, mkdirSync, chmodSync, rmSync } from 'node:fs';
import keytar from 'keytar';

const SERVICE_NAME = 'DeepReviewCLI';
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

  // Get from system keychain
  const apiKey = await keytar.getPassword(SERVICE_NAME, 'apiKey');
  if (!apiKey) {
    throw new Error('API key not configured\nRun \'deepreview setup\' to configure.');
  }
  return apiKey;
}

async function readConfig(): Promise<Config> {
  if (!existsSync(CONFIG_PATH)) {
    return {};
  }
  
  const content = await readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(content);
}

export async function writeConfig(apiKey: string): Promise<void> {
  // Store in system keychain
  await keytar.setPassword(SERVICE_NAME, 'apiKey', apiKey);
  
  // Write empty config file for metadata
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
    chmodSync(CONFIG_DIR, 0o700);
  }
  await writeFile(CONFIG_PATH, JSON.stringify({}, null, 2));
  chmodSync(CONFIG_PATH, 0o600);
}

export async function deleteConfig(): Promise<void> {
  try {
    await keytar.deletePassword(SERVICE_NAME, 'apiKey');
    rmSync(CONFIG_DIR, { recursive: true, force: true });
  } catch (error) {
    console.error('Cleanup error:', error instanceof Error ? error.message : 'Unknown error');
  }
} 