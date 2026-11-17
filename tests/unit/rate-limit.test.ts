import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("Rate Limiter Unit Tests", () => {
  const testKey = "test:ip:127.0.0.1";

  beforeEach(() => {
    resetRateLimit(testKey);
  });

  it("should permit requests within limit", () => {
    const res1 = checkRateLimit(testKey, { limit: 3, windowMs: 1000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = checkRateLimit(testKey, { limit: 3, windowMs: 1000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = checkRateLimit(testKey, { limit: 3, windowMs: 1000 });
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("should block requests exceeding limit", () => {
    checkRateLimit(testKey, { limit: 2, windowMs: 1000 });
    checkRateLimit(testKey, { limit: 2, windowMs: 1000 });

    const blocked = checkRateLimit(testKey, { limit: 2, windowMs: 1000 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("should reset limit when requested", () => {
    checkRateLimit(testKey, { limit: 1, windowMs: 1000 });
    const blocked = checkRateLimit(testKey, { limit: 1, windowMs: 1000 });
    expect(blocked.success).toBe(false);

    resetRateLimit(testKey);
    const fresh = checkRateLimit(testKey, { limit: 1, windowMs: 1000 });
    expect(fresh.success).toBe(true);
  });
});
