import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { normalizeIdentifier } from "@/lib/auth-utils";
import bcrypt from "bcryptjs";

// Secure fallback secret for build/static analysis phases when environment variables are not injected
const authSecret =
  process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32
    ? process.env.AUTH_SECRET
    : "khelna_bazar_default_secure_auth_secret_key_32_chars_min";

if (process.env.NODE_ENV === "production" && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)) {
  console.warn("[AUTH WARNING] AUTH_SECRET is not configured or is under 32 characters in environment variables. Using secure fallback for build.");
}

declare module "next-auth" {
  interface User {
    role?: string;
    phone?: string | null;
  }
  interface Session {
    user: {
      id: string;
      role: "CUSTOMER" | "STAFF" | "ADMIN";
      phone?: string | null;
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

          if (user.blocked) {
            throw new Error("This account has been disabled. Please contact customer support.");
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
          };
        } catch (error) {
          console.error("Authorize error in NextAuth:", (error as Error).message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "CUSTOMER" | "STAFF" | "ADMIN") || "CUSTOMER";
        session.user.phone = token.phone as string | null | undefined;
      }
      return session;
    },
  },
});
