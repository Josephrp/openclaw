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
3. **Add a secret** in your Space **Settings → Secrets**:
   - `OPENCLAW_GATEWAY_TOKEN` — set to a long random string (e.g. generate with `openssl rand -hex 24`). You’ll paste this into the Control UI to authenticate.
4. **Build and run** — push to the Space repo; the Space will build and start the gateway.

When the Space is running, open your Space’s URL (e.g. `https://your-username-openclaw-gateway.hf.space`) and paste the token in **Settings → token**.

## Keep it running 24/7

- **Free hardware:** The Space will **sleep after ~48 hours** of inactivity. Anyone opening the URL will wake it.
- **Paid hardware:** In **Settings → Hardware**, upgrade to a paid CPU (or other tier). Upgraded Spaces run **indefinitely** by default. You can set **Sleep time** to “Never” if desired.

## Persist config and workspace

Without persistent storage, config and workspace are lost when the Space restarts. To keep them:

1. In **Settings → Storage**, add **persistent storage** for the Space.
2. The Dockerfile already sets `OPENCLAW_HOME=/data`, so the gateway stores config and workspace under `/data/.openclaw`, which is persisted.

## Optional Space variables (build args)

You can set these in **Settings → Variables** (or as build args) to customize the build:

- `OPENCLAW_REPO` — Git URL of the OpenClaw repo (default: `https://github.com/openclaw/openclaw.git`).
- `OPENCLAW_REF` — Branch or tag to clone (default: `main`).

## More

- [OpenClaw docs](https://docs.openclaw.ai)
- [Docker install (generic)](https://docs.openclaw.ai/install/docker)
- [Hugging Face Spaces – Docker](https://huggingface.co/docs/hub/spaces-sdks-docker)
