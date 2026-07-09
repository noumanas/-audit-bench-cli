import { ApiClient, ApiError } from '../api';
import { loadConfig, saveConfig } from '../config';
import { prompt, promptHidden } from '../prompt';

export async function loginCommand(opts: { email?: string; password?: string; apiUrl?: string }): Promise<void> {
  const config = loadConfig();
  const apiUrl = opts.apiUrl || config.apiUrl;
  const email = opts.email || (await prompt('Email: '));
  const password = opts.password || (await promptHidden('Password: '));

  const client = new ApiClient(apiUrl);
  try {
    const { accessToken, user } = await client.login(email, password);
    saveConfig({ apiUrl, token: accessToken, email: user.email });
    console.log(`Logged in as ${user.email} (${user.plan.name} plan).`);
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Login failed: ${err.message}`);
    } else {
      console.error(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    process.exitCode = 1;
  }
}

export function logoutCommand(): void {
  saveConfig({ ...loadConfig(), token: undefined, email: undefined });
  console.log('Logged out.');
}
