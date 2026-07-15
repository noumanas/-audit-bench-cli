import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".auditbench");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface CliConfig {
  apiUrl: string;
  token?: string;
  email?: string;
}

const DEFAULT_API_URL =
  process.env.AUDITBENCH_API_URL ||
  "https://audit-bench-backend-git-242355763105.europe-west1.run.app";

export function loadConfig(): CliConfig {
  if (!existsSync(CONFIG_FILE)) return { apiUrl: DEFAULT_API_URL };
  try {
    const raw = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
    return {
      apiUrl: raw.apiUrl || DEFAULT_API_URL,
      token: raw.token,
      email: raw.email,
    };
  } catch {
    return { apiUrl: DEFAULT_API_URL };
  }
}

export function saveConfig(config: CliConfig): void {
  if (!existsSync(CONFIG_DIR))
    mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function clearConfig(): void {
  if (existsSync(CONFIG_FILE)) unlinkSync(CONFIG_FILE);
}

/**
 * AUDITBENCH_API_KEY takes priority over a stored login token — this is
 * the CI-friendly path: set the env var from a secret and skip
 * `auditbench login` (and its interactive password prompt) entirely. Works
 * transparently because the backend accepts an API key on the same
 * `Authorization: Bearer` header as a real login token (see JwtAuthGuard).
 */
export function requireToken(config: CliConfig): string {
  const apiKey = process.env.AUDITBENCH_API_KEY;
  if (apiKey) return apiKey;

  if (!config.token) {
    console.error(
      "Not authenticated. Run `auditbench login`, or set AUDITBENCH_API_KEY " +
        "(find yours under Repository scan → CLI / CI-CD API key in the dashboard).",
    );
    process.exit(1);
  }
  return config.token;
}
