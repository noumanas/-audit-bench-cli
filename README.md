# auditbench-cli

Command-line client for AI Code Auditor.

## Install

```
npm install
npm run build
npm link
```

## Usage

```
auditbench login                     # prompts for email/password
auditbench status                    # plan + daily/monthly quota usage
auditbench audit ./src/app.ts        # single-file audit
auditbench scan ./my-project         # zips a directory and runs a repository scan
auditbench scan ./repo.zip           # or scan an existing archive
auditbench logout
```

By default the CLI talks to `http://localhost:4000`. Override with `AUDITBENCH_API_URL`
or `auditbench login --api-url https://api.example.com`.

Credentials are stored in `~/.auditbench/config.json` (mode `0600`).
