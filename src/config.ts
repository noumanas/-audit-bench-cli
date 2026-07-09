import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.auditbench');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface CliConfig {
  apiUrl: string;
  token?: string;
  email?: string;
}

const DEFAULT_API_URL = process.env.AUDITBENCH_API_URL || 'http://localhost:4000';

export function loadConfig(): CliConfig {
  if (!existsSync(CONFIG_FILE)) return { apiUrl: DEFAULT_API_URL };
  try {
    const raw = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'));
    return { apiUrl: raw.apiUrl || DEFAULT_API_URL, token: raw.token, email: raw.email };
  } catch {
    return { apiUrl: DEFAULT_API_URL };
  }
}

export function saveConfig(config: CliConfig): void {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function clearConfig(): void {
  if (existsSync(CONFIG_FILE)) unlinkSync(CONFIG_FILE);
}

export function requireToken(config: CliConfig): string {
  if (!config.token) {
    console.error('Not logged in. Run `auditbench login` first.');
    process.exit(1);
  }
  return config.token;
}
