#!/usr/bin/env node
import { Command } from 'commander';
import { loginCommand, logoutCommand } from './commands/login';
import { statusCommand } from './commands/status';
import { auditCommand } from './commands/audit';
import { scanCommand } from './commands/scan';

const program = new Command();

program.name('auditbench').description('CLI for AI Code Auditor').version('0.1.0');

program
  .command('login')
  .description('Log in and store an access token locally')
  .option('-e, --email <email>', 'account email')
  .option('-p, --password <password>', 'account password (prompted if omitted)')
  .option('--api-url <url>', 'API base URL')
  .action(loginCommand);

program.command('logout').description('Clear the stored access token').action(logoutCommand);

program.command('status').description('Show plan and audit quota usage').action(statusCommand);

program
  .command('audit <file>')
  .description('Run a single-file audit')
  .option('--provider <provider>', 'LLM provider: anthropic | openai | gemini')
  .option(
    '--fail-on <level>',
    'exit non-zero when the verdict is at least this bad: do_not_ship (default) | needs_work | never',
  )
  .action(auditCommand);

program
  .command('scan <path>')
  .description('Scan a directory or .zip archive as a repository')
  .option('--provider <provider>', 'LLM provider: anthropic | openai | gemini')
  .option(
    '--fail-on <level>',
    'exit non-zero when the verdict is at least this bad: do_not_ship (default) | needs_work | never',
  )
  .action(scanCommand);

program.parseAsync(process.argv);
