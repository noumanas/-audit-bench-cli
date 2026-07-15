"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.clearConfig = clearConfig;
exports.requireToken = requireToken;
const fs_1 = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const CONFIG_DIR = (0, path_1.join)((0, os_1.homedir)(), ".auditbench");
const CONFIG_FILE = (0, path_1.join)(CONFIG_DIR, "config.json");
const DEFAULT_API_URL = process.env.AUDITBENCH_API_URL ||
    "https://audit-bench-backend-git-242355763105.europe-west1.run.app";
function loadConfig() {
    if (!(0, fs_1.existsSync)(CONFIG_FILE))
        return { apiUrl: DEFAULT_API_URL };
    try {
        const raw = JSON.parse((0, fs_1.readFileSync)(CONFIG_FILE, "utf8"));
        return {
            apiUrl: raw.apiUrl || DEFAULT_API_URL,
            token: raw.token,
            email: raw.email,
        };
    }
    catch {
        return { apiUrl: DEFAULT_API_URL };
    }
}
function saveConfig(config) {
    if (!(0, fs_1.existsSync)(CONFIG_DIR))
        (0, fs_1.mkdirSync)(CONFIG_DIR, { recursive: true, mode: 0o700 });
    (0, fs_1.writeFileSync)(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}
function clearConfig() {
    if ((0, fs_1.existsSync)(CONFIG_FILE))
        (0, fs_1.unlinkSync)(CONFIG_FILE);
}
/**
 * AUDITBENCH_API_KEY takes priority over a stored login token — this is
 * the CI-friendly path: set the env var from a secret and skip
 * `auditbench login` (and its interactive password prompt) entirely. Works
 * transparently because the backend accepts an API key on the same
 * `Authorization: Bearer` header as a real login token (see JwtAuthGuard).
 */
function requireToken(config) {
    const apiKey = process.env.AUDITBENCH_API_KEY;
    if (apiKey)
        return apiKey;
    if (!config.token) {
        console.error("Not authenticated. Run `auditbench login`, or set AUDITBENCH_API_KEY " +
            "(find yours under Repository scan → CLI / CI-CD API key in the dashboard).");
        process.exit(1);
    }
    return config.token;
}
