import { sendBlocked } from "../lib/blocked.js";
import { isAllowedUserAgent } from "../lib/userAgent.js";

export default function handler(req, res) {
  if (!isAllowedUserAgent(req.headers["user-agent"])) {
    return sendBlocked(res);
  }

  res.status(200);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  return res.send("Sync API");
}
