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

## CI/CD

Set `AUDITBENCH_API_KEY` (from your dashboard: Repository scan → **CLI / CI-CD API key**)
and skip `auditbench login` entirely — no password ever touches your CI environment. Both
`audit` and `scan` exit non-zero when the verdict is bad enough, so a failing review fails
the build:

```
auditbench scan . --fail-on do_not_ship   # default — matches the PR merge-block threshold
auditbench scan . --fail-on needs_work    # stricter — also fail on warnings
auditbench scan . --fail-on never         # never fail the build, just report
```

### GitHub Actions

```yaml
name: audit-bench
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install -g auditbench-cli
      - run: auditbench scan . --fail-on do_not_ship
        env:
          AUDITBENCH_API_KEY: ${{ secrets.AUDITBENCH_API_KEY }}
```

### GitLab CI

```yaml
audit-bench:
  image: node:20
  script:
    - npm install -g auditbench-cli
    - auditbench scan . --fail-on do_not_ship
  variables:
    AUDITBENCH_API_KEY: $AUDITBENCH_API_KEY
```
