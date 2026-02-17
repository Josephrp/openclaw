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
3. **Add Secrets** in your Space **Settings → Secrets** (all optional except one auth method for UI access):
   - **`OPENCLAW_GATEWAY_TOKEN`** — long random string (e.g. `openssl rand -hex 24`). Paste this in the Control UI to log in. **Recommended.** (Alternative: use `OPENCLAW_GATEWAY_PASSWORD` for password auth; if both are set, token is used.)
   - **`OPENCLAW_GATEWAY_PASSWORD`** — (optional) Gateway password; startup script sets `gateway.auth.mode: "password"`. Use when you prefer password over token.
   - **`HF_TOKEN`** — your [Hugging Face token](https://huggingface.co/settings/tokens) with **Make calls to Inference Providers**. Used as the default model provider; without it, chat will fail until you add another provider.
   - **`OPENCLAW_HF_DEFAULT_MODEL`** — (optional) Default model ref, e.g. `huggingface/deepseek-ai/DeepSeek-R1` or `huggingface/Qwen/Qwen3-8B`. Defaults to `huggingface/deepseek-ai/DeepSeek-R1` if unset.
   - **`OPENCLAW_GATEWAY_TRUSTED_PROXIES`** — (optional) Comma-separated proxy IPs (e.g. `10.20.31.87,10.20.26.157`). The startup script writes this into `gateway.trustedProxies`; set if you see “Proxy headers detected from untrusted address” or pairing/unauthorized. Use **Variables** if you prefer (IPs need not be secret).
   - **`OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS`** — (optional) Comma-separated origins (e.g. `https://your-space.hf.space`). Written to `gateway.controlUi.allowedOrigins` so only those origins can open the Control UI; useful to lock down to your Space URL.
4. **Build and run** — push to the Space repo; the Space will build and start the gateway. Startup writes config so the default model is Hugging Face Inference and the Control UI accepts token-only connections (no device pairing).

When the logs show `listening on ws://0.0.0.0:7860`, open your Space’s URL (e.g. `https://your-username-openclaw-gateway.hf.space`) and paste the gateway token in **Settings** (gear) → **Token** — the browser must have the token to send on connect, or you will see `token_missing` (or use `https://your-space.hf.space#token=YOUR_TOKEN`).

## Keep it running 24/7

- **Free hardware:** The Space will **sleep after ~48 hours** of inactivity. Anyone opening the URL will wake it.
- **Paid hardware:** In **Settings → Hardware**, upgrade to a paid CPU (or other tier). Upgraded Spaces run **indefinitely** by default. You can set **Sleep time** to “Never” if desired.

## Persist config and workspace

Without persistent storage, config and workspace are lost when the Space restarts. To keep them:

1. In **Settings → Storage**, add **persistent storage** for the Space.
2. The container uses `/data` when writable (state under `/data/.openclaw`). If `/data` is not available, it falls back to `/home/user/.openclaw` so the app still starts.

## Custom install script

The image runs `spaces/huggingface/setup-hf-config.mjs` from the cloned repo at startup to set the default model and gateway token in config. To customize behavior (e.g. a different default model or extra config), copy `setup-hf-config.mjs` from the [openclaw repo](https://github.com/openclaw/openclaw/blob/main/spaces/huggingface/setup-hf-config.mjs) into your Space repo, edit it, and in your Dockerfile replace the entrypoint line that runs it with one that runs your copy (e.g. `node /app/setup-hf-config.mjs` after copying your file into `/app`).

## Configuring trusted proxies (no CLI or file edit)

If logs show **"Proxy headers detected from untrusted address"** or connections close with `reason=pairing required` / `reason=unauthorized`, the gateway is behind Hugging Face’s reverse proxy. Add the proxy IP(s) so the gateway trusts them and uses `X-Forwarded-For` for client detection.

**Recommended: use a Secret or Variable (applied at startup)**

1. **Find the proxy IP(s)** — In the Space logs, look for `[ws] ... remote=10.20.31.87 ...`. The `remote=` value is the address the gateway sees. Note one or more such IPs.
2. In **Settings → Secrets** or **Settings → Variables**, add:
   - **Name:** `OPENCLAW_GATEWAY_TRUSTED_PROXIES`
   - **Value:** comma-separated IPs, e.g. `10.20.31.87,10.20.26.157`
3. **Restart** the Space. The entrypoint runs `setup-hf-config.mjs` before the gateway; it reads this env and writes `gateway.trustedProxies` into the config automatically. No CLI or file edit needed.

**Manual fallback (dev mode / shell access)**

If you have a shell (e.g. dev mode), you can instead edit `/data/.openclaw/openclaw.json` and set `gateway.trustedProxies: ["10.20.31.87"]`, or run `openclaw config set gateway.trustedProxies '["10.20.31.87"]'`. Restart the Space after changing config.

See [Gateway security – Reverse proxy](https://docs.openclaw.ai/gateway/security#reverse-proxy-configuration) for more on `gateway.trustedProxies`.

## Troubleshooting "token_missing" and "Proxy headers from untrusted address"

After setting Secrets/Variables you may still see errors until both of these are true:

1. **Restart the Space** after adding or changing **Secrets** or **Variables**. The setup script runs only when the container starts; it reads env and writes config then. So: **Settings → Restart this Space** (or redeploy). In the logs you should see a line like `[openclaw-hf-setup] auth=token trustedProxies=5 allowedOrigins=0 -> /data/.openclaw/openclaw.json` (or `/home/user/.openclaw/openclaw.json`). If you see `trustedProxies=0`, the variable was not set or not available when the script ran.

2. **Paste the token in the Control UI.** The env var `OPENCLAW_GATEWAY_TOKEN` only puts the token in the **server** config. The **browser** (Control UI) must have the same token and send it when connecting. Open your Space URL → **Settings** (gear) → **Token** → paste the exact value of `OPENCLAW_GATEWAY_TOKEN`, then try connecting again. Until the UI has the token stored, the gateway will respond with `reason=token_missing`.

**Trusted proxy IPs from your logs:** use the `remote=` addresses you see in the `[ws]` lines. For example, from typical HF Space logs you might set:
`OPENCLAW_GATEWAY_TRUSTED_PROXIES` = `10.16.34.155,10.20.26.157,10.20.31.87,10.16.4.123,10.20.1.222`
(comma-separated, no spaces required). Then restart the Space.

## Configuration from environment (summary)

The startup script `setup-hf-config.mjs` reads the following from **Secrets** or **Variables** and writes them into `openclaw.json` on every container start. So you can configure the gateway without CLI or file edit.

| Env variable | Config path | Format |
|--------------|------------|--------|
| `OPENCLAW_HF_DEFAULT_MODEL` | `agents.defaults.model.primary` | Model ref string |
| `OPENCLAW_GATEWAY_TOKEN` | `gateway.auth.mode` + `gateway.auth.token` | Any string |
| `OPENCLAW_GATEWAY_PASSWORD` | `gateway.auth.mode` + `gateway.auth.password` | Any string (token wins if both set) |
| `OPENCLAW_GATEWAY_TRUSTED_PROXIES` | `gateway.trustedProxies` | Comma-separated IPs |
| `OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS` | `gateway.controlUi.allowedOrigins` | Comma-separated origins (e.g. `https://you.hf.space`) |

**Could be added the same way** (same script pattern; not implemented yet):

| Env variable | Config path | Notes |
|--------------|------------|--------|
| `OPENCLAW_GATEWAY_PORT` | `gateway.port` | Number; default entrypoint passes `--port 7860` so only useful with a custom entrypoint. |
| `OPENCLAW_GATEWAY_BIND` | `gateway.bind` | `lan` \| `loopback` \| `auto` \| `tailnet` \| `custom`; entrypoint passes `--bind lan`. |
| `OPENCLAW_CONTROL_UI_BASE_PATH` | `gateway.controlUi.basePath` | e.g. `/openclaw` for reverse-proxy subpath. |
| `OPENCLAW_CONTROL_UI_ALLOW_INSECURE_AUTH` | `gateway.controlUi.allowInsecureAuth` | `1` / `0`; allow token/password over HTTP. |
| `OPENCLAW_CONTROL_UI_ENABLED` | `gateway.controlUi.enabled` | `0` to disable Control UI. |

To add more, extend `setup-hf-config.mjs` (or your copy) to read the env, parse it, and set the corresponding keys on `config.gateway` or `config.agents` before `fs.writeFileSync`. Schema reference: [Configuration](https://docs.openclaw.ai/gateway/configuration).

## Optional Space variables (build args)

You can set these in **Settings → Variables** (or as build args) to customize the build:

- `OPENCLAW_REPO` — Git URL of the OpenClaw repo (default: `https://github.com/openclaw/openclaw.git`).
- `OPENCLAW_REF` — Branch or tag to clone (default: `main`).

## More

- [OpenClaw docs](https://docs.openclaw.ai)
- [Docker install (generic)](https://docs.openclaw.ai/install/docker)
- [Hugging Face Spaces – Docker](https://huggingface.co/docs/hub/spaces-sdks-docker)
