import NextAuth, { type DefaultSession, CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import { normalizeIdentifier } from "@/lib/auth-utils";
import { BlockedAccountError } from "@/lib/auth-errors";
import bcrypt from "bcryptjs";

export { BlockedAccountError };

// Production AUTH_SECRET enforcement with safe fallback to prevent fatal cold-start crashes
let authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

if (process.env.NODE_ENV === "production") {
  if (!authSecret || authSecret.length < 32) {
    console.error(
      "WARNING: AUTH_SECRET is not configured or is under 32 characters in production! Using fallback secret to prevent downtime."
    );
    authSecret = authSecret || "khelna_bazar_super_production_secret_key_123456789";
  }
} else {
  // Development/Test fallback
  authSecret = authSecret || "khelna_bazar_dev_fallback_secret_minimum_32_chars_long!";
}

declare module "next-auth" {
  interface User {
    role?: string;
    phone?: string | null;
    tokenVersion?: number;
  }
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";
      phone?: string | null;
      tokenVersion?: number;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: authSecret,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Phone or Email",
      credentials: {
        identifier: { label: "Phone or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const rawId = String(credentials.identifier);
        const password = String(credentials.password);
        const cleanId = normalizeIdentifier(rawId);

        try {
          const user = await db.user.findFirst({
            where: {
              OR: [{ email: cleanId }, { phone: cleanId }],
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          if (user.blocked || user.deletedAt) {
            throw new BlockedAccountError();
          }

          const passwordValid = await bcrypt.compare(password, user.passwordHash);
          if (!passwordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name || "Customer",
            email: user.email,
            phone: user.phone,
            role: user.role,
            tokenVersion: user.tokenVersion ?? 0,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) {
            throw error;
          }
          console.error("Authorize error in NextAuth:", (error as Error).message);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const normalizedEmail = user.email.toLowerCase().trim();
        try {
          const existingUser = await db.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!existingUser) {
            const newUser = await db.user.create({
              data: {
                email: normalizedEmail,
                name: user.name || "Customer",
                image: user.image || null,
                role: "CUSTOMER",
                emailVerified: new Date(),
              },
            });
            user.id = newUser.id;
            user.role = newUser.role;
            user.tokenVersion = newUser.tokenVersion;
          } else {
            if (existingUser.blocked || existingUser.deletedAt) {
              return false;
            }
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.phone = existingUser.phone;
            user.tokenVersion = existingUser.tokenVersion;
          }
        } catch (error) {
          console.error("Google signIn callback error in NextAuth:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);

      if (user) {
        token.id = user.id;
        token.role = user.role || "CUSTOMER";
        token.phone = user.phone;
        token.tokenVersion = user.tokenVersion ?? 0;
        token.lastRefreshed = now;
        return token;
      }

      // Check DB for fresh role and active status
      const lastRefreshed = (token.lastRefreshed as number) || 0;
      const isPrivileged =
        token.role === "STAFF" ||
        token.role === "ADMIN" ||
        token.role === "SUPER_ADMIN";

      // Re-verify if older than 60s or if user holds a privileged role
      if (token.id && (now - lastRefreshed > 60 || isPrivileged)) {
        try {
          const freshUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, blocked: true, tokenVersion: true, deletedAt: true },
          });

          if (!freshUser || freshUser.blocked || freshUser.deletedAt) {
            // Revoke access immediately if deleted or blocked
            return null;
          }

          if (
            freshUser.tokenVersion !== undefined &&
            token.tokenVersion !== undefined &&
            freshUser.tokenVersion !== token.tokenVersion
          ) {
            // Token invalidated due to credential/role change
            return null;
          }

          token.role = freshUser.role;
          token.tokenVersion = freshUser.tokenVersion ?? 0;
          token.lastRefreshed = now;
        } catch (e) {
          console.error("JWT role refresh check error:", e);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role =
          (token.role as "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN") || "CUSTOMER";
        session.user.phone = token.phone as string | null | undefined;
        session.user.tokenVersion = token.tokenVersion as number | undefined;
      }
      return session;
    },
  },
});
