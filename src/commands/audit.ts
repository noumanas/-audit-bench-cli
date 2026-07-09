import { existsSync, readFileSync } from 'fs';
import { basename } from 'path';
import { ApiClient, ApiError } from '../api';
import { loadConfig, requireToken } from '../config';
import { color, severityColor, verdictColor } from '../colors';

export async function auditCommand(file: string, opts: { provider?: string }): Promise<void> {
  const config = loadConfig();
  const token = requireToken(config);

  if (!existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exitCode = 1;
    return;
  }

  const code = readFileSync(file, 'utf8');
  const client = new ApiClient(config.apiUrl, token);

  try {
    console.log(`Auditing ${basename(file)}…`);
    const audit = await client.runAudit({ filename: basename(file), code, provider: opts.provider });

    console.log('');
    console.log(`${color.bold('Verdict:')} ${verdictColor(audit.verdict)}`);
    console.log(audit.summary);
    console.log('');

    if (audit.findings.length === 0) {
      console.log(color.green('No findings.'));
      return;
    }

    for (const f of audit.findings) {
      console.log(`${severityColor(f.severity)} [${f.category}] ${color.bold(f.title)}${f.line ? ` (line ${f.line})` : ''}`);
      console.log(`  ${f.description}`);
      console.log(`  ${color.gray('Fix:')} ${f.suggestedFix}`);
      console.log('');
    }

    console.log(color.gray(`${audit.findings.length} finding(s) · ${audit.fromCache ? 'served from cache' : audit.aiInvoked ? 'AI reviewed' : 'local checks only'}`));
  } catch (err) {
    if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
      console.error(`Audit blocked: ${err.message}`);
      console.error('Upgrade your plan at your AuditBench dashboard.');
    } else {
      console.error(`Audit failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    process.exitCode = 1;
  }
}
