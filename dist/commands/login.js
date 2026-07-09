"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCommand = loginCommand;
exports.logoutCommand = logoutCommand;
const api_1 = require("../api");
const config_1 = require("../config");
const prompt_1 = require("../prompt");
async function loginCommand(opts) {
    const config = (0, config_1.loadConfig)();
    const apiUrl = opts.apiUrl || config.apiUrl;
    const email = opts.email || (await (0, prompt_1.prompt)('Email: '));
    const password = opts.password || (await (0, prompt_1.promptHidden)('Password: '));
    const client = new api_1.ApiClient(apiUrl);
    try {
        const { accessToken, user } = await client.login(email, password);
        (0, config_1.saveConfig)({ apiUrl, token: accessToken, email: user.email });
        console.log(`Logged in as ${user.email} (${user.plan.name} plan).`);
    }
    catch (err) {
        if (err instanceof api_1.ApiError) {
            console.error(`Login failed: ${err.message}`);
        }
        else {
            console.error(`Login failed: ${err instanceof Error ? err.message : String(err)}`);
        }
        process.exitCode = 1;
    }
}
function logoutCommand() {
    (0, config_1.saveConfig)({ ...(0, config_1.loadConfig)(), token: undefined, email: undefined });
    console.log('Logged out.');
}
