import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateProductionConfig } from "@/server/launch-guard";

describe("validateProductionConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("passes without errors in development mode", () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    const result = validateProductionConfig(false);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("blocks production if DATABASE_URL is missing", () => {
    delete process.env.DATABASE_URL;
    process.env.AUTH_SECRET = "a-very-long-secret-key-that-has-more-than-32-characters";
    process.env.NEXT_PUBLIC_SITE_URL = "https://khelnabazar.com.bd";

    const result = validateProductionConfig(true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("DATABASE_URL is missing"))).toBe(true);
  });

  it("blocks production if AUTH_SECRET is shorter than 32 chars", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@ep-prod.neon.tech/neondb";
    process.env.AUTH_SECRET = "too-short";
    process.env.NEXT_PUBLIC_SITE_URL = "https://khelnabazar.com.bd";

    const result = validateProductionConfig(true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("AUTH_SECRET must be at least 32 characters"))).toBe(true);
  });

  it("blocks production if NEXT_PUBLIC_SITE_URL points to localhost", () => {
    process.env.DATABASE_URL = "postgresql://user:pass@ep-prod.neon.tech/neondb";
    process.env.AUTH_SECRET = "a-very-long-secret-key-that-has-more-than-32-characters";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

    const result = validateProductionConfig(true);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("NEXT_PUBLIC_SITE_URL is set to localhost"))).toBe(true);
  });

  it("passes when all production requirements are satisfied", () => {
    process.env.DATABASE_URL = "postgresql://prod_user:secret_prod_pass@ep-real-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
    process.env.AUTH_SECRET = "khelna_bazar_super_production_secret_key_123456789";
    process.env.NEXT_PUBLIC_SITE_URL = "https://khelnabazar.com.bd";
    process.env.STORE_HOTLINE = "01712345678";
    process.env.STORE_EMAIL = "orders@khelnabazar.com.bd";

    const result = validateProductionConfig(true);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("instrumentation register() hook fails closed on misconfiguration in nodejs runtime", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    (process.env as Record<string, string | undefined>).NEXT_RUNTIME = "nodejs";
    delete process.env.DATABASE_URL;

    const { register } = await import("@/instrumentation");
    await expect(register()).rejects.toThrow(/FATAL: Production launch guard blocked startup/);
  });
});
