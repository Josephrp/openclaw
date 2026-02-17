#!/bin/sh
# OpenClaw Gateway entrypoint for Hugging Face Spaces.
# - Sets OPENCLAW_HOME to /data when writable (persistent storage), else /home/user.
# - When HF_TOKEN is set and no config exists, runs onboarding with Hugging Face Inference as default.
# - Starts the gateway on port 7860.

set -e

# 1. Persistence: use /data if writable, else /home/user
if mkdir -p /data/.openclaw 2>/dev/null; then
  export OPENCLAW_HOME=/data
else
  export OPENCLAW_HOME=/home/user
  mkdir -p /home/user/.openclaw
fi

CONFIG_FILE="${OPENCLAW_HOME}/.openclaw/openclaw.json"

# 2. When HF_TOKEN is set and config doesn't exist, run onboarding with Hugging Face as default
if [ -n "${HF_TOKEN}" ] && [ ! -f "$CONFIG_FILE" ]; then
  export HF_TOKEN
  if [ -n "${OPENCLAW_GATEWAY_TOKEN}" ]; then
    node /app/openclaw.mjs onboard --non-interactive --mode local \
      --auth-choice huggingface-api-key --huggingface-api-key "$HF_TOKEN" \
      --no-install-daemon --skip-health \
      --gateway-port 7860 --gateway-bind lan \
      --gateway-token "$OPENCLAW_GATEWAY_TOKEN"
  else
    node /app/openclaw.mjs onboard --non-interactive --mode local \
      --auth-choice huggingface-api-key --huggingface-api-key "$HF_TOKEN" \
      --no-install-daemon --skip-health \
      --gateway-port 7860 --gateway-bind lan
  fi
fi

# 3. Start the gateway
exec node /app/openclaw.mjs gateway --allow-unconfigured --bind lan --port 7860 "$@"
