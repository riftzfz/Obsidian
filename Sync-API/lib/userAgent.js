const ALLOWED_PATTERN = /roblox|wininet/i;

export function isAllowedUserAgent(userAgent) {
  if (!userAgent || typeof userAgent !== "string") {
    return false;
  }
  return ALLOWED_PATTERN.test(userAgent);
}
