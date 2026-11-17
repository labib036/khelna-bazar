/**
 * Khelna Bazar - Production Launch Guard
 *
 * Validates production environment configuration before deployment or server startup.
 * Prevents accidental launches with demo credentials, missing secrets, placeholder contacts,
 * or localhost URLs.
 */

export interface LaunchValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProductionConfig(isProduction = process.env.NODE_ENV === "production"): LaunchValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // If not running in production mode, skip strict enforcement
  if (!isProduction) {
    return { valid: true, errors: [], warnings: ["Running in non-production mode (Launch Guard active in permissive mode)."] };
  }

  // 1. Database Connection String
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.trim() === "") {
    errors.push("CRITICAL: DATABASE_URL is missing. Production deployment requires a valid PostgreSQL connection string.");
  } else if (dbUrl.includes("YOUR_PASSWORD") || dbUrl.includes("ep-sample")) {
    errors.push("CRITICAL: DATABASE_URL contains placeholder values from .env.example.");
  }

  // 2. Authentication Secret
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret) {
    errors.push("CRITICAL: AUTH_SECRET is not defined. Run `openssl rand -base64 32` to generate a secure key.");
  } else if (authSecret.length < 32) {
    errors.push("CRITICAL: AUTH_SECRET must be at least 32 characters long for cryptographic security.");
  } else if (authSecret.includes("super-secret") || authSecret.includes("your-generated") || authSecret.includes("test-secret")) {
    errors.push("CRITICAL: AUTH_SECRET contains default placeholder text from .env.example.");
  }

  // 2b. Order Token Secret
  const orderSecret = process.env.ORDER_TOKEN_SECRET || process.env.AUTH_SECRET;
  if (!orderSecret) {
    errors.push("CRITICAL: ORDER_TOKEN_SECRET is not defined.");
  } else if (orderSecret.length < 32) {
    errors.push("CRITICAL: ORDER_TOKEN_SECRET must be at least 32 characters long.");
  }

  // 3. Site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    errors.push("CRITICAL: NEXT_PUBLIC_SITE_URL is not set.");
  } else if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
    errors.push("CRITICAL: NEXT_PUBLIC_SITE_URL is set to localhost in production mode.");
  }

  // 4. Sample Seed Flag
  if (process.env.ALLOW_SAMPLE_SEED === "true") {
    errors.push("CRITICAL: ALLOW_SAMPLE_SEED flag is enabled. Sample catalog data must never be seeded into production.");
  }

  // 5. Placeholder Contact Information Checks
  const hotline = process.env.STORE_HOTLINE || "";
  if (
    hotline.includes("1700-000000") ||
    hotline.includes("01700000000") ||
    hotline.includes("01700000") ||
    hotline.includes("8801700000000") ||
    hotline.includes("01711000000")
  ) {
    errors.push("CRITICAL: STORE_HOTLINE is set to a placeholder number. Provide the store owner's real phone.");
  }

  const supportEmail = process.env.STORE_EMAIL || "";
  if (supportEmail.includes("example.com")) {
    errors.push("CRITICAL: STORE_EMAIL is set to an example.com address.");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Asserts that the production configuration is valid.
 * Throws a fatal Error if any critical validation check fails.
 */
export function assertProductionConfig(isProduction = process.env.NODE_ENV === "production"): void {
  const result = validateProductionConfig(isProduction);
  if (!result.valid) {
    const formattedErrors = result.errors.map((e) => `  ✖ ${e}`).join("\n");
    throw new Error(
      `\n\n=======================================================\n` +
      `🚨 [KHELNA BAZAR LAUNCH GUARD] DEPLOYMENT BLOCKED!\n` +
      `The application cannot start in production due to configuration safety failures:\n\n` +
      `${formattedErrors}\n\n` +
      `Please review .env or hosting environment variables against LAUNCH_CHECKLIST.md.\n` +
      `=======================================================\n\n`
    );
  }
}
