/**
 * Khelna Bazar - Security Rate Limiter
 *
 * Provides in-memory sliding window rate-limiting for sensitive actions:
 * - Login attempts
 * - Account registration
 * - Password reset requests
 * - Order tracking queries
 * - Coupon validation
 * - Order placement
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Periodically clean up expired entries every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupInterval.unref) cleanupInterval.unref();
}

export interface RateLimitOptions {
  limit: number;    // Maximum allowed attempts in window
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSec?: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): RateLimitResult {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  record.count += 1;
  memoryStore.set(key, record);

  if (record.count > options.limit) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
      retryAfterSec: Math.max(1, retryAfterSec),
    };
  }

  return {
    success: true,
    remaining: options.limit - record.count,
    resetAt: record.resetAt,
  };
}

export function resetRateLimit(key: string): void {
  memoryStore.delete(key);
}
