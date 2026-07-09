import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sendBlocked, sendDeniedScript } from "./blocked.js";
import { fileExists } from "./files.js";
import { isAllowedUserAgent } from "./userAgent.js";
import { normalizeScriptPath } from "./verification.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = path.resolve(__dirname, "../validator/template.lua");

let cachedTemplate = null;

function getTemplate() {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(TEMPLATE_PATH, "utf8");
  }
  return cachedTemplate;
}

function getApiBase(req) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${protocol}://${host}`;
}

export function serveValidator(req, res, scriptPath) {
  if (!isAllowedUserAgent(req.headers["user-agent"])) {
    return sendBlocked(res);
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "method_not_allowed" });
  }

  const normalizedPath = normalizeScriptPath(scriptPath);

  if (!normalizedPath || !fileExists(normalizedPath)) {
    return sendDeniedScript(res);
  }

  const apiBase = getApiBase(req);
  const source = getTemplate()
    .replaceAll("__TARGET__", normalizedPath)
    .replaceAll("__API_BASE__", apiBase);

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.send(source);
}
