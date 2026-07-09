import { sendBlocked, sendDeniedScript } from "../lib/blocked.js";
import { createSession } from "../lib/sessions.js";
import { isAllowedUserAgent } from "../lib/userAgent.js";
import { validateVerificationPayload } from "../lib/verification.js";

export default async function handler(req, res) {
  if (!isAllowedUserAgent(req.headers["user-agent"])) {
    return sendBlocked(res);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "method_not_allowed" });
  }

  const validation = validateVerificationPayload(req.body);
  if (!validation.valid) {
    return sendDeniedScript(res);
  }

  const sessionId = await createSession(validation.payload);

  return res.status(200).json({
    success: true,
    sessionId,
    targetScript: validation.payload.targetScript,
  });
}
