#!/usr/bin/env node
/**
 * One-time setup for OpenClaw on Hugging Face Spaces.
 * Runs at container startup; writes or merges openclaw.json from env (Secrets/Variables):
 * - agents.defaults.model.primary from OPENCLAW_HF_DEFAULT_MODEL (default: DeepSeek-R1).
 * - gateway.auth: OPENCLAW_GATEWAY_TOKEN (token) or OPENCLAW_GATEWAY_PASSWORD (password); token wins if both set.
 * - gateway.controlUi.dangerouslyDisableDeviceAuth when auth is set (no device pairing in Spaces).
 * - gateway.trustedProxies from OPENCLAW_GATEWAY_TRUSTED_PROXIES (comma-separated IPs).
 * - gateway.controlUi.allowedOrigins from OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS (comma-separated origins).
 * HF_TOKEN is read by the gateway at runtime; this script only writes the above into config.
 */
import fs from "node:fs";
import path from "node:path";

const home = process.env.OPENCLAW_HOME || process.env.HOME || "/home/user";
const stateDir = path.join(home, ".openclaw");
const configPath = path.join(stateDir, "openclaw.json");

const defaultModel =
  process.env.OPENCLAW_HF_DEFAULT_MODEL?.trim() || "huggingface/deepseek-ai/DeepSeek-R1";
const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN?.trim();
const gatewayPassword = process.env.OPENCLAW_GATEWAY_PASSWORD?.trim();
// Comma-separated list of proxy IPs (e.g. HF Space proxy); written into gateway.trustedProxies
const trustedProxiesRaw = process.env.OPENCLAW_GATEWAY_TRUSTED_PROXIES?.trim();
const trustedProxies = trustedProxiesRaw
  ? trustedProxiesRaw.split(",").map((s) => s.trim()).filter(Boolean)
  : [];
// Comma-separated origins allowed for Control UI/WebSocket (e.g. https://your-space.hf.space)
const allowedOriginsRaw = process.env.OPENCLAW_CONTROL_UI_ALLOWED_ORIGINS?.trim();
const allowedOrigins = allowedOriginsRaw
  ? allowedOriginsRaw.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

let config = {};
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch {
    // keep config empty
  }
}

if (!config.agents) config.agents = {};
if (!config.agents.defaults) config.agents.defaults = {};
if (!config.agents.defaults.model) config.agents.defaults.model = {};
config.agents.defaults.model.primary = defaultModel;

// Auth: token wins if both set; otherwise password
const useTokenAuth = Boolean(gatewayToken);
const usePasswordAuth = Boolean(gatewayPassword) && !useTokenAuth;
if (useTokenAuth || usePasswordAuth) {
  if (!config.gateway) config.gateway = {};
  if (!config.gateway.auth) config.gateway.auth = {};
  if (useTokenAuth) {
    config.gateway.auth.mode = "token";
    config.gateway.auth.token = gatewayToken;
  } else {
    config.gateway.auth.mode = "password";
    config.gateway.auth.password = gatewayPassword;
  }
}
// So Control UI can connect with token/password only (no device pairing); Spaces have no CLI for approve.
if (useTokenAuth || usePasswordAuth) {
  if (!config.gateway) config.gateway = {};
  if (!config.gateway.controlUi) config.gateway.controlUi = {};
  config.gateway.controlUi.dangerouslyDisableDeviceAuth = true;
}

if (trustedProxies.length > 0) {
  if (!config.gateway) config.gateway = {};
  config.gateway.trustedProxies = trustedProxies;
}

if (allowedOrigins.length > 0) {
  if (!config.gateway) config.gateway = {};
  if (!config.gateway.controlUi) config.gateway.controlUi = {};
  config.gateway.controlUi.allowedOrigins = allowedOrigins;
}

fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

// One-line startup log so you can confirm env was applied (e.g. in Space logs)
const authKind = useTokenAuth ? "token" : usePasswordAuth ? "password" : "none";
const parts = [`auth=${authKind}`, `trustedProxies=${trustedProxies.length}`, `allowedOrigins=${allowedOrigins.length}`];
console.log(`[openclaw-hf-setup] ${parts.join(" ")} -> ${configPath}`);
