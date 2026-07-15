# syntax=docker/dockerfile:1

# ---- build ----------------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --omit=dev

# ---- runtime ----------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# Non-root, same as the backend image — this is a code-security tool, it
# should hold its own container to the standard it holds other people's
# code to. /workspace is where the target repo gets bind-mounted at
# `docker run` time (see README) — created here so it's writable by the
# non-root user rather than defaulting to root ownership.
RUN addgroup -S auditbench && adduser -S auditbench -G auditbench \
  && mkdir -p /workspace && chown auditbench:auditbench /workspace
USER auditbench
WORKDIR /workspace

# Config/login state is per-container and ephemeral — pass
# AUDITBENCH_API_KEY instead of relying on `auditbench login` persisting
# between runs (that's the whole point of the API key: no interactive
# login inside a container).
ENTRYPOINT ["node", "/app/dist/index.js"]
CMD ["--help"]
