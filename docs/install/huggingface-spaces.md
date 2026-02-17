---
summary: "Run OpenClaw Gateway on Hugging Face Spaces (Docker) with optional persistence and always-on hardware"
read_when:
  - You want OpenClaw running on Hugging Face infrastructure
  - You want a public or private Space that can stay running remotely
title: "Hugging Face Spaces"
---

# OpenClaw on Hugging Face Spaces

Run the OpenClaw gateway as a [Hugging Face Space](https://huggingface.co/docs/hub/spaces-overview) using Docker. The Space builds OpenClaw from source and serves the Control UI on the Space URL.

## What you get

- Gateway and Control UI reachable at your Space URL (e.g. `https://your-username-openclaw-gateway.hf.space`)
- Optional **persistent storage** so config and workspace survive restarts
- Optional **paid hardware** so the Space runs 24/7 without sleeping

## Quick setup

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space) and choose **Docker** as the SDK.

2. Copy the deploy files from this repo into your Space repository:
   - [spaces/huggingface/README.md](https://github.com/openclaw/openclaw/blob/main/spaces/huggingface/README.md) (use as your Space README; it includes the required YAML front matter)
   - [spaces/huggingface/Dockerfile](https://github.com/openclaw/openclaw/blob/main/spaces/huggingface/Dockerfile)

3. In your Space **Settings → Secrets**, add (all optional except the gateway token for UI access):
   - **`OPENCLAW_GATEWAY_TOKEN`** — long random string (e.g. `openssl rand -hex 24`). You will paste this into the Control UI to log in. **Recommended.**
   - **`HF_TOKEN`** — your [Hugging Face token](https://huggingface.co/settings/tokens) with **Make calls to Inference Providers**. The gateway uses this as the default model provider; without it, chat will fail until you configure another provider.
   - **`OPENCLAW_HF_DEFAULT_MODEL`** — (optional) Default model ref (e.g. `huggingface/deepseek-ai/DeepSeek-R1` or `huggingface/Qwen/Qwen3-8B`). Defaults to `huggingface/deepseek-ai/DeepSeek-R1` if unset.

4. Push to the Space; it will build and start. At startup, a setup script writes config so the default model is Hugging Face Inference (from the secrets above). When the logs show **`listening on ws://0.0.0.0:7860`**, open the Space URL and enter the gateway token in **Settings → token** in the Control UI.

## Keep it running

- **Free hardware:** The Space sleeps after about 48 hours of inactivity. Visiting the URL wakes it.
- **Paid hardware:** In **Settings → Hardware**, upgrade to a paid tier. The Space then runs indefinitely by default. See [Spaces hardware and billing](https://huggingface.co/docs/hub/spaces-gpus).

## Persist config and workspace

By default, Space disk is ephemeral. To keep config and sessions across restarts:

1. In **Settings → Storage**, add persistent storage for the Space.
2. The container entrypoint uses `/data` when it is writable (e.g. with persistent storage), so the gateway stores everything under `/data/.openclaw`. If `/data` is not available or not writable, it falls back to `/home/user/.openclaw` so the app still starts without permission errors.

## Troubleshooting

- **"pairing required"** — The setup script configures token-only Control UI (no device pairing). If you see this, redeploy the Space so the latest setup script runs, or add `gateway.controlUi.dangerouslyDisableDeviceAuth: true` to your config (e.g. in `/data/.openclaw/openclaw.json` or `~/.openclaw/openclaw.json` inside the container).
- **Container "stuck" at "listening on ws://0.0.0.0:7860"** — The app is running. Open the Space URL in your browser (e.g. the "App" link); the Control UI is served on the same port. If the Space UI still shows "Building" or "Starting", wait a few seconds or refresh.
- **"EACCES: permission denied, mkdir '/data'"** — Fixed in the image: the entrypoint uses `/home/user` when `/data` is not writable. If you added persistent storage and still see this, the Space may need a rebuild so the entrypoint runs again.
- **"Gateway already running" / "Port 7860 is already in use"** — Often caused by Hugging Face or Dev Mode restarting the app while the previous process is still running. Restart the Space once from the UI, or disable **Dev mode** in Settings if you don't need it.

## Hugging Face Inference as default

The image runs a small setup script at startup that writes `openclaw.json` so that:

- The default model is **Hugging Face Inference** (model ref from `OPENCLAW_HF_DEFAULT_MODEL` or `huggingface/deepseek-ai/DeepSeek-R1`).
- Gateway token auth is set from `OPENCLAW_GATEWAY_TOKEN` if provided.
- Control UI is configured so token-only connections work without device pairing (no CLI needed on the Space).

The gateway reads **`HF_TOKEN`** from the environment (set it in Space Secrets) to call the [Inference API](https://huggingface.co/docs/inference-providers). No need to run onboarding inside the container.

## Optional: custom repo or branch

In **Settings → Variables**, you can set build-time variables:

- `OPENCLAW_REPO` — Git URL (default: `https://github.com/openclaw/openclaw.git`)
- `OPENCLAW_REF` — Branch or tag (default: `main`)

Use these to point at a fork or a specific release.

## See also

- [Spaces README template and Dockerfile](https://github.com/openclaw/openclaw/tree/main/spaces/huggingface) in the OpenClaw repo
- [Docker (generic)](https://docs.openclaw.ai/install/docker)
- [Hugging Face Spaces – Docker](https://huggingface.co/docs/hub/spaces-sdks-docker)
