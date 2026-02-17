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

3. In your Space **Settings → Secrets**, add:
   - `OPENCLAW_GATEWAY_TOKEN` — a long random string (e.g. `openssl rand -hex 24`). You will paste this into the Control UI to log in.

4. Push to the Space; it will build and start. Open the Space URL and enter the token in **Settings → token** in the Control UI.

## Keep it running

- **Free hardware:** The Space sleeps after about 48 hours of inactivity. Visiting the URL wakes it.
- **Paid hardware:** In **Settings → Hardware**, upgrade to a paid tier. The Space then runs indefinitely by default. See [Spaces hardware and billing](https://huggingface.co/docs/hub/spaces-gpus).

## Persist config and workspace

By default, Space disk is ephemeral. To keep config and sessions across restarts:

1. In **Settings → Storage**, add persistent storage for the Space.
2. The container entrypoint uses `/data` when it is writable (e.g. with persistent storage), so the gateway stores everything under `/data/.openclaw`. If `/data` is not available or not writable, it falls back to `/home/user/.openclaw` so the app still starts without permission errors.

## Troubleshooting

- **"EACCES: permission denied, mkdir '/data'"** — Fixed in the image: the entrypoint uses `/home/user` when `/data` is not writable. If you added persistent storage and still see this, the Space may need a rebuild so the entrypoint runs again.
- **"Gateway already running" / "Port 7860 is already in use"** — Often caused by Hugging Face or Dev Mode restarting the app while the previous process is still running. Restart the Space once from the UI, or disable **Dev mode** in Settings if you don't need it.

## Optional: custom repo or branch

In **Settings → Variables**, you can set build-time variables:

- `OPENCLAW_REPO` — Git URL (default: `https://github.com/openclaw/openclaw.git`)
- `OPENCLAW_REF` — Branch or tag (default: `main`)

Use these to point at a fork or a specific release.

## See also

- [Spaces README template and Dockerfile](https://github.com/openclaw/openclaw/tree/main/spaces/huggingface) in the OpenClaw repo
- [Docker (generic)](https://docs.openclaw.ai/install/docker)
- [Hugging Face Spaces – Docker](https://huggingface.co/docs/hub/spaces-sdks-docker)
