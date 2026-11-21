import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { checkRateLimit, resetRateLimit } from "./rate-limit";
import type { SessionUser } from "@/types";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // Client passes IP via hidden field so authorize() can rate-limit per IP
        ip: { label: "IP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = credentials.ip ?? "unknown";
        const rateLimitKey = `login:${ip}`;
        const limit = checkRateLimit(rateLimitKey);

        if (!limit.allowed) {
          throw new Error(
            `TOO_MANY_ATTEMPTS:${limit.retryAfterSeconds}`
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          select: { id: true, email: true, name: true, passwordHash: true, role: true, referralCode: true },
        });

        if (!user) {
          // Don't reveal whether email exists
          return null;
        }

        const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        // Successful login — clear the rate limit counter
        resetRateLimit(rateLimitKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          referralCode: user.referralCode,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as SessionUser).role;
        token.referralCode = (user as SessionUser).referralCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as SessionUser).id = token.id as string;
        (session.user as SessionUser).role = token.role as "MEMBER" | "ADMIN";
        (session.user as SessionUser).referralCode = token.referralCode as string;
      }
      return session;
    },
  },
};
