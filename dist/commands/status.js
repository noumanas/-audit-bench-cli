"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = statusCommand;
const api_1 = require("../api");
const config_1 = require("../config");
function fmtLimit(used, limit) {
    return limit === null ? `${used}/unlimited` : `${used}/${limit}`;
}
async function statusCommand() {
    const config = (0, config_1.loadConfig)();
    const token = (0, config_1.requireToken)(config);
    const client = new api_1.ApiClient(config.apiUrl, token);
    try {
        const usage = await client.getUsage();
        console.log(`Logged in as ${config.email || 'unknown'} — ${usage.plan.name} plan`);
        console.log(`  Daily AI audits:   ${fmtLimit(usage.dailyUsed, usage.dailyLimit)} (resets ${usage.dailyResetsAt})`);
        console.log(`  Monthly AI audits: ${fmtLimit(usage.monthlyUsed, usage.monthlyLimit)} (resets ${usage.monthlyResetsAt})`);
        console.log(`  Repository scans:  ${usage.plan.repositoryScan ? 'enabled' : 'not available on this plan'}`);
    }
    catch (err) {
        console.error(`Failed to fetch status: ${err instanceof api_1.ApiError ? err.message : String(err)}`);
        process.exitCode = 1;
    }
}
