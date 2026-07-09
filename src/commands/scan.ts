import { existsSync, readFileSync, statSync } from 'fs';
import { basename } from 'path';
import { ApiClient, ApiError, ScanJob } from '../api';
import { loadConfig, requireToken } from '../config';
import { zipDirectory } from '../zip-directory';
import { color, severityColor, verdictColor } from '../colors';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCompletion(client: ApiClient, jobId: string): Promise<ScanJob> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const job = await client.getRepositoryScan(jobId);
    process.stdout.write(`\r  ${job.status} — ${job.filesScanned}/${job.fileCount || '?'} files`.padEnd(50));
    if (job.status === 'completed' || job.status === 'failed') {
      process.stdout.write('\n');
      return job;
    }
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error('Timed out waiting for scan to complete.');
}

export async function scanCommand(path: string, opts: { provider?: string }): Promise<void> {
  const config = loadConfig();
  const token = requireToken(config);

  if (!existsSync(path)) {
    console.error(`Path not found: ${path}`);
    process.exitCode = 1;
    return;
  }

  const isZip = path.toLowerCase().endsWith('.zip');
  const stat = statSync(path);
  if (!isZip && !stat.isDirectory()) {
    console.error('Provide either a directory or a .zip archive.');
    process.exitCode = 1;
    return;
  }

  console.log(isZip ? `Uploading ${basename(path)}…` : `Zipping ${path}…`);
  const zipBuffer = isZip ? readFileSync(path) : zipDirectory(path);
  const sourceName = basename(path.replace(/\/$/, '')) || path;

  const client = new ApiClient(config.apiUrl, token);

  try {
    const job = await client.startRepositoryScan(zipBuffer, `${sourceName}.zip`, opts.provider);
    console.log(`Scan started (${job.id}).`);
    const finished = await waitForCompletion(client, job.id);

    if (finished.status === 'failed') {
      console.error(`Scan failed: ${finished.error}`);
      process.exitCode = 1;
      return;
    }

    console.log('');
    console.log(`${color.bold('Verdict:')} ${finished.verdict ? verdictColor(finished.verdict) : 'n/a'}`);
    console.log(finished.summary || '');
    console.log(color.gray(`${finished.filesFromCache} from cache · ${finished.filesAiSkipped} local checks only`));
    console.log('');

    const filesWithFindings = (finished.files || []).filter((f) => f.findings.length > 0);
    if (filesWithFindings.length === 0) {
      console.log(color.green('No findings across scanned files.'));
      return;
    }

    for (const f of filesWithFindings) {
      console.log(`${f.verdict ? verdictColor(f.verdict) : ''} ${color.bold(f.path)}`);
      for (const finding of f.findings) {
        console.log(`  ${severityColor(finding.severity)} [${finding.category}] ${finding.title}`);
      }
    }
  } catch (err) {
    if (err instanceof ApiError && (err.status === 429 || err.status === 403)) {
      console.error(`Scan blocked: ${err.message}`);
      console.error('Upgrade your plan at your AuditBench dashboard.');
    } else {
      console.error(`Scan failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    process.exitCode = 1;
  }
}
