#!/usr/bin/env node
/**
 * One-time setup for OpenClaw on Hugging Face Spaces.
 * Writes or merges openclaw.json so that:
 * - agents.defaults.model.primary uses Hugging Face Inference (from OPENCLAW_HF_DEFAULT_MODEL or default).
 * - gateway.auth.token is set from OPENCLAW_GATEWAY_TOKEN if provided.
 * HF_TOKEN is read by the gateway from the environment (Space Secrets); this script only sets the default model and optional token in config.
 */
import fs from "node:fs";
import path from "node:path";

const home = process.env.OPENCLAW_HOME || process.env.HOME || "/home/user";
const stateDir = path.join(home, ".openclaw");
const configPath = path.join(stateDir, "openclaw.json");

const defaultModel =
  process.env.OPENCLAW_HF_DEFAULT_MODEL?.trim() || "huggingface/deepseek-ai/DeepSeek-R1";
const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN?.trim();

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

if (gatewayToken && !config.gateway) config.gateway = {};
if (gatewayToken && !config.gateway.auth) config.gateway.auth = {};
if (gatewayToken) config.gateway.auth.mode = "token";
if (gatewayToken) config.gateway.auth.token = gatewayToken;

fs.mkdirSync(stateDir, { recursive: true });
fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
