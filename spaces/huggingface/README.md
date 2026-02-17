---
title: OpenClaw Gateway
emoji: 🦞
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# OpenClaw Gateway on Hugging Face Spaces

This Space runs the [OpenClaw](https://github.com/openclaw/openclaw) gateway so you can use the Control UI and connect clients over the internet.

## Quick start

1. **Create a new Space** at [huggingface.co/new-space](https://huggingface.co/new-space). Choose **Docker** as the SDK.
2. **Copy the contents of this folder** into your Space repo:
   - This `README.md` (including the YAML block above)
   - The `Dockerfile` from the same directory in the [openclaw repo](https://github.com/openclaw/openclaw/tree/main/spaces/huggingface).  
   The build clones OpenClaw and uses `setup-hf-config.mjs` from the repo; you do not need to copy that file.
3. **Add Secrets** in your Space **Settings → Secrets** (all optional except the gateway token for UI access):
   - **`OPENCLAW_GATEWAY_TOKEN`** — long random string (e.g. `openssl rand -hex 24`). Paste this in the Control UI to log in. **Recommended.**
   - **`HF_TOKEN`** — your [Hugging Face token](https://huggingface.co/settings/tokens) with **Make calls to Inference Providers**. Used as the default model provider; without it, chat will fail until you add another provider.
   - **`OPENCLAW_HF_DEFAULT_MODEL`** — (optional) Default model ref, e.g. `huggingface/deepseek-ai/DeepSeek-R1` or `huggingface/Qwen/Qwen3-8B`. Defaults to `huggingface/deepseek-ai/DeepSeek-R1` if unset.
4. **Build and run** — push to the Space repo; the Space will build and start the gateway. Startup writes config so the default model is Hugging Face Inference (from the above secrets).

When the logs show `listening on ws://0.0.0.0:7860`, open your Space’s URL (e.g. `https://your-username-openclaw-gateway.hf.space`) and paste the gateway token in **Settings → token**.

## Keep it running 24/7

- **Free hardware:** The Space will **sleep after ~48 hours** of inactivity. Anyone opening the URL will wake it.
- **Paid hardware:** In **Settings → Hardware**, upgrade to a paid CPU (or other tier). Upgraded Spaces run **indefinitely** by default. You can set **Sleep time** to “Never” if desired.

## Persist config and workspace

Without persistent storage, config and workspace are lost when the Space restarts. To keep them:

1. In **Settings → Storage**, add **persistent storage** for the Space.
2. The container uses `/data` when writable (state under `/data/.openclaw`). If `/data` is not available, it falls back to `/home/user/.openclaw` so the app still starts.

## Custom install script

The image runs `spaces/huggingface/setup-hf-config.mjs` from the cloned repo at startup to set the default model and gateway token in config. To customize behavior (e.g. a different default model or extra config), copy `setup-hf-config.mjs` from the [openclaw repo](https://github.com/openclaw/openclaw/blob/main/spaces/huggingface/setup-hf-config.mjs) into your Space repo, edit it, and in your Dockerfile replace the entrypoint line that runs it with one that runs your copy (e.g. `node /app/setup-hf-config.mjs` after copying your file into `/app`).

## Optional Space variables (build args)

You can set these in **Settings → Variables** (or as build args) to customize the build:

- `OPENCLAW_REPO` — Git URL of the OpenClaw repo (default: `https://github.com/openclaw/openclaw.git`).
- `OPENCLAW_REF` — Branch or tag to clone (default: `main`).

## More

- [OpenClaw docs](https://docs.openclaw.ai)
- [Docker install (generic)](https://docs.openclaw.ai/install/docker)
- [Hugging Face Spaces – Docker](https://huggingface.co/docs/hub/spaces-sdks-docker)
