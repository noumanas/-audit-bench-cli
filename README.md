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

## Docker

A prebuilt image means a pipeline needs Docker, not a Node.js toolchain, to run a scan.

```
docker build -t auditbench-cli .
```

The image's `ENTRYPOINT` is the CLI itself, so any `auditbench` subcommand becomes the
`docker run` args. Config/login state doesn't persist between container runs — always pass
`AUDITBENCH_API_KEY` rather than `auditbench login`. Bind-mount the repo you want scanned to
`/workspace` (the image's default working directory):

```
docker run --rm \
  -v "$(pwd)":/workspace \
  -e AUDITBENCH_API_KEY="$AUDITBENCH_API_KEY" \
  -e AUDITBENCH_API_URL="https://your-backend.example.com" \
  auditbench-cli scan . --fail-on do_not_ship
```

A single-file audit works the same way — the file just needs to be somewhere under the
mounted `/workspace`:

```
docker run --rm -v "$(pwd)":/workspace -e AUDITBENCH_API_KEY="$AUDITBENCH_API_KEY" \
  auditbench-cli audit ./src/app.ts
```

### Publishing the image to Google Artifact Registry

One-time setup (per GCP project):

```
gcloud artifacts repositories create auditbench-cli \
  --repository-format=docker \
  --location=us-central1 \
  --description="audit/bench CLI image"

gcloud auth configure-docker us-central1-docker.pkg.dev
```

Build, tag, and push:

```
export PROJECT_ID=$(gcloud config get-value project)
docker build -t us-central1-docker.pkg.dev/$PROJECT_ID/auditbench-cli/auditbench-cli:latest .
docker push us-central1-docker.pkg.dev/$PROJECT_ID/auditbench-cli/auditbench-cli:latest
```

From then on, any pipeline (Cloud Build, GitHub Actions, GitLab CI, a GKE job, etc.) can pull
and run it directly:

```
docker run --rm -v "$(pwd)":/workspace -e AUDITBENCH_API_KEY="$AUDITBENCH_API_KEY" \
  us-central1-docker.pkg.dev/$PROJECT_ID/auditbench-cli/auditbench-cli:latest \
  scan . --fail-on do_not_ship
```

Re-run the `docker build`/`docker push` pair (bump the tag, e.g. `:0.2.0`, instead of reusing
`:latest` once this is in real use) whenever the CLI changes.
