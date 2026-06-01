// config/cache.js — Ioredis cache client with graceful degradation
'use strict';

const Redis = require('ioredis');
const logger = require('./logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client = null;
let connected = false;

function getClient() {
  if (client) return client;

  client = new Redis(REDIS_URL, {
    // Retry up to 3 times, then give up and run without cache
    retryStrategy(times) {
      if (times > 3) {
        logger.warn('Redis unavailable — running without cache');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 3000,
    commandTimeout: 2000
  });

  client.on('connect', () => {
    connected = true;
    logger.info({ msg: 'Redis cache connected', url: REDIS_URL });
  });

  client.on('error', (err) => {
    if (connected) logger.error({ msg: 'Redis cache error', err: err.message });
    connected = false;
  });

  client.connect().catch(() => {
    // Graceful — app continues without cache
    logger.warn('Redis cache not available at startup — continuing without cache');
  });

  return client;
}

/**
 * Get a cached value. Returns null if key not found or Redis offline.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
async function cacheGet(key) {
  try {
    const redis = getClient();
    const type = await redis.type(key);
    if (type === 'list') {
      const rawList = await redis.lrange(key, 0, -1);
      return rawList.map(item => JSON.parse(item));
    }
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // degraded gracefully
  }
}

/**
 * Set a cached value with optional TTL in seconds.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttl=60]
 */
async function cacheSet(key, value, ttl = 60) {
  try {
    const redis = getClient();
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch {
    // degraded gracefully
  }
}

/**
 * Append a value to a cached array atomically (useful for distributed webhooks).
 * @param {string} key
 * @param {any} value
 * @param {number} [ttl=300]
 */
async function cacheAppend(key, value, ttl = 300) {
  try {
    const redis = getClient();
    await redis.rpush(key, JSON.stringify(value));
    await redis.expire(key, ttl);
  } catch {
    // degraded gracefully
  }
}

/**
 * Invalidate one or more cache keys (supports glob patterns via SCAN+DEL).
 * @param {string} pattern  e.g. 'products:*'
 */
async function cacheInvalidate(pattern) {
  try {
    const redis = getClient();
    let cursor = '0';
    do {
      const [newCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = newCursor;
      if (keys.length) await redis.del(...keys);
    } while (cursor !== '0');
  } catch {
    // degraded gracefully
  }
}

async function closeCache() {
  if (client) {
    try {
      await client.quit();
    } catch (e) {
      // ignore
    }
    client = null;
    connected = false;
  }
}

module.exports = { cacheGet, cacheSet, cacheAppend, cacheInvalidate, closeCache };
