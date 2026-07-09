import { ApiClient, ApiError } from '../api';
import { loadConfig, requireToken } from '../config';

function fmtLimit(used: number, limit: number | null): string {
  return limit === null ? `${used}/unlimited` : `${used}/${limit}`;
}

export async function statusCommand(): Promise<void> {
  const config = loadConfig();
  const token = requireToken(config);
  const client = new ApiClient(config.apiUrl, token);

  try {
    const usage = await client.getUsage();
    console.log(`Logged in as ${config.email || 'unknown'} — ${usage.plan.name} plan`);
    console.log(`  Daily AI audits:   ${fmtLimit(usage.dailyUsed, usage.dailyLimit)} (resets ${usage.dailyResetsAt})`);
    console.log(`  Monthly AI audits: ${fmtLimit(usage.monthlyUsed, usage.monthlyLimit)} (resets ${usage.monthlyResetsAt})`);
    console.log(`  Repository scans:  ${usage.plan.repositoryScan ? 'enabled' : 'not available on this plan'}`);
  } catch (err) {
    console.error(`Failed to fetch status: ${err instanceof ApiError ? err.message : String(err)}`);
    process.exitCode = 1;
  }
}
