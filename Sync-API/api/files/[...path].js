import { sendBlocked, sendDeniedScript } from "../../lib/blocked.js";
import { readFile } from "../../lib/files.js";
import { consumeSession } from "../../lib/sessions.js";
import { isAllowedUserAgent } from "../../lib/userAgent.js";
import { normalizeScriptPath } from "../../lib/verification.js";

export default async function handler(req, res) {
  if (!isAllowedUserAgent(req.headers["user-agent"])) {
    return sendBlocked(res);
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "method_not_allowed" });
  }

  const pathSegments = req.query.path;
  const joinedPath = Array.isArray(pathSegments) ? pathSegments.join("/") : String(pathSegments || "");
  const scriptPath = normalizeScriptPath(joinedPath);

  if (!scriptPath) {
    return sendDeniedScript(res);
  }

  const sessionId = typeof req.query.session === "string" ? req.query.session : "";
  const session = await consumeSession(sessionId);

  if (!session || session.targetScript !== scriptPath) {
    return sendDeniedScript(res);
  }

  const source = readFile(scriptPath);
  if (!source) {
    return sendDeniedScript(res);
  }

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.send(source);
}
