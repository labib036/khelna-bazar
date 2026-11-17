/**
 * Khelna Bazar - Shared Authentication Utilities
 *
 * Normalization and validation for Bangladeshi mobile phone numbers and email addresses.
 */

export function normalizeIdentifier(identifier: string): string {
  const clean = (identifier || "").trim().toLowerCase();
  const stripped = clean.replace(/[\s\-()]/g, "");

  // Match Bangladeshi mobile numbers (+8801..., 8801..., 01...)
  if (/^(\+?88)?01[3-9]\d{8}$/.test(stripped)) {
    if (stripped.startsWith("+8801")) return stripped.slice(3);
    if (stripped.startsWith("8801")) return stripped.slice(2);
    if (stripped.startsWith("01")) return stripped;
  }

  return clean;
}

export function isValidBDPhone(phone: string): boolean {
  const normalized = normalizeIdentifier(phone);
  return /^01[3-9]\d{8}$/.test(normalized);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}
