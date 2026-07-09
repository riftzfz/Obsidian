const TIMESTAMP_WINDOW_SECONDS = 300;

const REQUIRED_FIELDS = [
  "placeId",
  "jobId",
  "placeVersion",
  "gameId",
  "userId",
  "username",
  "displayName",
  "timestamp",
  "randomSeed",
  "verificationHash",
  "targetScript",
];

export function normalizeScriptPath(targetScript) {
  if (typeof targetScript !== "string" || !targetScript.trim()) {
    return null;
  }

  const normalized = targetScript.replace(/\\/g, "/").replace(/^\/+/, "");

  if (
    normalized.includes("..") ||
    normalized.startsWith("/") ||
    !/^[a-zA-Z0-9_./-]+\.lua$/.test(normalized)
  ) {
    return null;
  }

  return normalized;
}

function buildPayloadString(payload) {
  const parts = [
    String(payload.placeId),
    String(payload.jobId),
    String(payload.placeVersion),
    String(payload.gameId),
    String(payload.userId),
    String(payload.username),
    String(payload.displayName),
    String(payload.timestamp),
    String(payload.randomSeed),
    String(payload.targetScript),
  ];

  return parts.join("|");
}

function computeVerificationHash(payloadString) {
  let hex = "";
  for (let i = 0; i < payloadString.length; i += 1) {
    hex += payloadString.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hex;
}

function isValidTimestamp(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  const delta = Math.abs(now - value);
  return delta <= TIMESTAMP_WINDOW_SECONDS;
}

export function validateVerificationPayload(body) {
  if (!body || typeof body !== "object") {
    return { valid: false, reason: "invalid_body" };
  }

  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return { valid: false, reason: `missing_${field}` };
    }
  }

  const targetScript = normalizeScriptPath(String(body.targetScript));
  if (!targetScript) {
    return { valid: false, reason: "invalid_target_script" };
  }

  if (!isValidTimestamp(body.timestamp)) {
    return { valid: false, reason: "timestamp_expired" };
  }

  const randomSeed = Number(body.randomSeed);
  if (!Number.isInteger(randomSeed) || randomSeed < 100000 || randomSeed > 999999) {
    return { valid: false, reason: "invalid_random_seed" };
  }

  const payload = {
    placeId: body.placeId,
    jobId: body.jobId,
    placeVersion: body.placeVersion,
    gameId: body.gameId,
    userId: body.userId,
    username: String(body.username),
    displayName: String(body.displayName),
    timestamp: Number(body.timestamp),
    randomSeed,
    targetScript,
  };

  const payloadString = buildPayloadString(payload);
  const expectedHash = computeVerificationHash(payloadString);
  const providedHash = String(body.verificationHash).toLowerCase();

  if (providedHash !== expectedHash) {
    return { valid: false, reason: "hash_mismatch" };
  }

  return { valid: true, payload };
}
