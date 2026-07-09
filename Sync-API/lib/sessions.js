import crypto from "node:crypto";
import { Redis } from "@upstash/redis";

const SESSION_TTL_SECONDS = 60;
const memorySessions = new Map();

let redisClient = null;

function getRedis() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

function sessionKey(sessionId) {
  return `sync:session:${sessionId}`;
}

export async function createSession(payload) {
  const sessionId = crypto.randomUUID();
  const record = {
    targetScript: payload.targetScript,
    userId: String(payload.userId),
    placeId: String(payload.placeId),
    jobId: String(payload.jobId),
    createdAt: Date.now(),
  };

  const redis = getRedis();

  if (redis) {
    await redis.set(sessionKey(sessionId), record, { ex: SESSION_TTL_SECONDS });
  } else {
    memorySessions.set(sessionId, record);
    setTimeout(() => memorySessions.delete(sessionId), SESSION_TTL_SECONDS * 1000);
  }

  return sessionId;
}

export async function consumeSession(sessionId) {
  if (!sessionId || typeof sessionId !== "string") {
    return null;
  }

  const redis = getRedis();

  if (redis) {
    const key = sessionKey(sessionId);
    const record = await redis.get(key);
    if (!record) {
      return null;
    }
    await redis.del(key);
    return record;
  }

  const record = memorySessions.get(sessionId);
  if (!record) {
    return null;
  }
  memorySessions.delete(sessionId);
  return record;
}
