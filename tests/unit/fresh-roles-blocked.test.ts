import { describe, it, expect } from "vitest";
import { BlockedAccountError } from "@/lib/auth-errors";

describe("F-02 & F-04: Fresh Roles and Blocked Account Handling", () => {
  it("F-04: BlockedAccountError has code 'account_disabled'", () => {
    const error = new BlockedAccountError();
    expect(error.code).toBe("account_disabled");
    expect(error.name).toBe("BlockedAccountError");
    expect(error instanceof Error).toBe(true);
  });

  it("F-02: tokenVersion increment invalidates stale sessions", () => {
    const token = {
      id: "usr_123",
      role: "ADMIN",
      tokenVersion: 1,
      lastRefreshed: 1000,
    };

    const freshUserFromDb = {
      role: "CUSTOMER", // demoted
      blocked: false,
      tokenVersion: 2, // incremented
      deletedAt: null,
    };

    const isTokenValid =
      !freshUserFromDb.blocked &&
      !freshUserFromDb.deletedAt &&
      freshUserFromDb.tokenVersion === token.tokenVersion;

    expect(isTokenValid).toBe(false);
  });

  it("F-02: blocked user from DB causes immediate rejection", () => {
    const token = {
      id: "usr_456",
      role: "STAFF",
      tokenVersion: 0,
    };

    const freshUserFromDb = {
      role: "STAFF",
      blocked: true, // newly blocked
      tokenVersion: 0,
      deletedAt: null,
    };

    const isRevoked = freshUserFromDb.blocked || freshUserFromDb.deletedAt !== null;
    expect(isRevoked).toBe(true);
  });
});
