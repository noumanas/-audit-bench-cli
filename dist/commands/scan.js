"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanCommand = scanCommand;
const fs_1 = require("fs");
const path_1 = require("path");
const api_1 = require("../api");
const config_1 = require("../config");
const zip_directory_1 = require("../zip-directory");
const colors_1 = require("../colors");
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function waitForCompletion(client, jobId) {
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
async function scanCommand(path, opts) {
    const config = (0, config_1.loadConfig)();
    const token = (0, config_1.requireToken)(config);
    if (!(0, fs_1.existsSync)(path)) {
        console.error(`Path not found: ${path}`);
        process.exitCode = 1;
        return;
    }
    const isZip = path.toLowerCase().endsWith('.zip');
    const stat = (0, fs_1.statSync)(path);
    if (!isZip && !stat.isDirectory()) {
        console.error('Provide either a directory or a .zip archive.');
        process.exitCode = 1;
        return;
    }
    console.log(isZip ? `Uploading ${(0, path_1.basename)(path)}…` : `Zipping ${path}…`);
    const zipBuffer = isZip ? (0, fs_1.readFileSync)(path) : (0, zip_directory_1.zipDirectory)(path);
    const sourceName = (0, path_1.basename)(path.replace(/\/$/, '')) || path;
    const client = new api_1.ApiClient(config.apiUrl, token);
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
        console.log(`${colors_1.color.bold('Verdict:')} ${finished.verdict ? (0, colors_1.verdictColor)(finished.verdict) : 'n/a'}`);
        console.log(finished.summary || '');
        console.log(colors_1.color.gray(`${finished.filesFromCache} from cache · ${finished.filesAiSkipped} local checks only`));
        console.log('');
        const filesWithFindings = (finished.files || []).filter((f) => f.findings.length > 0);
        if (filesWithFindings.length === 0) {
            console.log(colors_1.color.green('No findings across scanned files.'));
            return;
        }
        for (const f of filesWithFindings) {
            console.log(`${f.verdict ? (0, colors_1.verdictColor)(f.verdict) : ''} ${colors_1.color.bold(f.path)}`);
            for (const finding of f.findings) {
                console.log(`  ${(0, colors_1.severityColor)(finding.severity)} [${finding.category}] ${finding.title}`);
            }
        }
    }
    catch (err) {
        if (err instanceof api_1.ApiError && (err.status === 429 || err.status === 403)) {
            console.error(`Scan blocked: ${err.message}`);
            console.error('Upgrade your plan at your AuditBench dashboard.');
        }
        else {
            console.error(`Scan failed: ${err instanceof Error ? err.message : String(err)}`);
        }
        process.exitCode = 1;
    }
}
