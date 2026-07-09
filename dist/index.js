#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const login_1 = require("./commands/login");
const status_1 = require("./commands/status");
const audit_1 = require("./commands/audit");
const scan_1 = require("./commands/scan");
const program = new commander_1.Command();
program.name('auditbench').description('CLI for AI Code Auditor').version('0.1.0');
program
    .command('login')
    .description('Log in and store an access token locally')
    .option('-e, --email <email>', 'account email')
    .option('-p, --password <password>', 'account password (prompted if omitted)')
    .option('--api-url <url>', 'API base URL')
    .action(login_1.loginCommand);
program.command('logout').description('Clear the stored access token').action(login_1.logoutCommand);
program.command('status').description('Show plan and audit quota usage').action(status_1.statusCommand);
program
    .command('audit <file>')
    .description('Run a single-file audit')
    .option('--provider <provider>', 'LLM provider: anthropic | openai | gemini')
    .action(audit_1.auditCommand);
program
    .command('scan <path>')
    .description('Scan a directory or .zip archive as a repository')
    .option('--provider <provider>', 'LLM provider: anthropic | openai | gemini')
    .action(scan_1.scanCommand);
program.parseAsync(process.argv);
