# OpenClaw Gateway for Hugging Face Spaces
# Build context: your Space repo (this Dockerfile + README). OpenClaw is cloned during build.

FROM node:22-bookworm

# Optional: point to a fork or branch (set in Space Variables)
ARG OPENCLAW_REPO=https://github.com/openclaw/openclaw.git
ARG OPENCLAW_REF=main

# Install git and Bun (needed for build scripts)
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends git ca-certificates && \
    apt-get clean && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN corepack enable

WORKDIR /app

# Clone OpenClaw and build (no COPY from host; Space repo only has this Dockerfile)
RUN git clone --depth 1 --branch "${OPENCLAW_REF}" "${OPENCLAW_REPO}" . \
    && pnpm install --frozen-lockfile \
    && pnpm build
ENV OPENCLAW_PREFER_PNPM=1
RUN pnpm ui:build

ENV NODE_ENV=production

# Spaces expose a single port (default 7860); gateway must listen on 0.0.0.0
EXPOSE 7860

# Entrypoint: set OPENCLAW_HOME, run HF Spaces setup (default model + token from secrets), then start gateway
RUN printf '%s\n' \
    '#!/bin/sh' \
    'set -e' \
    'if mkdir -p /data/.openclaw 2>/dev/null; then' \
    '  export OPENCLAW_HOME=/data' \
    'else' \
    '  export OPENCLAW_HOME=/home/user' \
    '  mkdir -p /home/user/.openclaw' \
    'fi' \
    'node /app/spaces/huggingface/setup-hf-config.mjs' \
    'exec node /app/openclaw.mjs gateway --allow-unconfigured --bind lan --port 7860 "$@"' \
    > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

# HF Spaces Dev Mode injects steps that expect /home/user; create it so they don't fail with "Permission denied"
RUN chown -R node:node /app \
    && mkdir -p /home/user \
    && chown -R node:node /home/user
USER node

# Token/password: set OPENCLAW_GATEWAY_TOKEN or OPENCLAW_GATEWAY_PASSWORD in Space Secrets
ENTRYPOINT ["/app/entrypoint.sh"]
