import crypto from "crypto";

const rawOrderSecret = process.env.ORDER_TOKEN_SECRET || process.env.AUTH_SECRET;

if (process.env.NODE_ENV === "production" && (!rawOrderSecret || rawOrderSecret.length < 32)) {
  console.warn("[SECURITY WARNING] ORDER_TOKEN_SECRET or AUTH_SECRET is not configured or is under 32 characters. Using fallback salt for build.");
}

const ORDER_TOKEN_SALT =
  rawOrderSecret && rawOrderSecret.length >= 32
    ? rawOrderSecret
    : "kb_default_order_token_salt_at_least_32_chars_long";

/**
 * Generates an HMAC-SHA256 token granting scoped read access to a specific order.
 * Used for guest checkout confirmation URLs (/order/[id]?token=...) and order tracking.
 */
export function generateOrderAccessToken(orderId: string, orderNumber: string): string {
  return crypto
    .createHmac("sha256", ORDER_TOKEN_SALT)
    .update(`${orderId}:${orderNumber}`)
    .digest("hex");
}

/**
 * Validates whether a provided token grants read access to a specific order.
 */
export function verifyOrderAccessToken(
  orderId: string,
  orderNumber: string,
  token?: string | null
): boolean {
  if (!token || typeof token !== "string") return false;
  try {
    const expected = generateOrderAccessToken(orderId, orderNumber);
    if (expected.length !== token.length) return false;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}
