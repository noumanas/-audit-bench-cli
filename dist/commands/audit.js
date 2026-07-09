"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditCommand = auditCommand;
const fs_1 = require("fs");
const path_1 = require("path");
const api_1 = require("../api");
const config_1 = require("../config");
const colors_1 = require("../colors");
async function auditCommand(file, opts) {
    const config = (0, config_1.loadConfig)();
    const token = (0, config_1.requireToken)(config);
    if (!(0, fs_1.existsSync)(file)) {
        console.error(`File not found: ${file}`);
        process.exitCode = 1;
        return;
    }
    const code = (0, fs_1.readFileSync)(file, 'utf8');
    const client = new api_1.ApiClient(config.apiUrl, token);
    try {
        console.log(`Auditing ${(0, path_1.basename)(file)}…`);
        const audit = await client.runAudit({ filename: (0, path_1.basename)(file), code, provider: opts.provider });
        console.log('');
        console.log(`${colors_1.color.bold('Verdict:')} ${(0, colors_1.verdictColor)(audit.verdict)}`);
        console.log(audit.summary);
        console.log('');
        if (audit.findings.length === 0) {
            console.log(colors_1.color.green('No findings.'));
            return;
        }
        for (const f of audit.findings) {
            console.log(`${(0, colors_1.severityColor)(f.severity)} [${f.category}] ${colors_1.color.bold(f.title)}${f.line ? ` (line ${f.line})` : ''}`);
            console.log(`  ${f.description}`);
            console.log(`  ${colors_1.color.gray('Fix:')} ${f.suggestedFix}`);
            console.log('');
        }
        console.log(colors_1.color.gray(`${audit.findings.length} finding(s) · ${audit.fromCache ? 'served from cache' : audit.aiInvoked ? 'AI reviewed' : 'local checks only'}`));
    }
    catch (err) {
        if (err instanceof api_1.ApiError && (err.status === 429 || err.status === 403)) {
            console.error(`Audit blocked: ${err.message}`);
            console.error('Upgrade your plan at your AuditBench dashboard.');
        }
        else {
            console.error(`Audit failed: ${err instanceof Error ? err.message : String(err)}`);
        }
        process.exitCode = 1;
    }
}
