// apps/web/app/api/auth/[...nextauth]/route.ts
export const runtime = 'edge';

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Move authOptions into the same file but ensure it doesn't trigger 
// side-effects during build evaluation.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // We will connect this to your NestJS backend later
        return null; 
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  // CRITICAL FOR EDGE: You MUST provide a secret here. 
  // If process.env.NEXTAUTH_SECRET is missing during build, it can trigger the 'custom' error.
  secret: process.env.NEXTAUTH_SECRET || "temporary-secret-for-build-purposes",
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user as any;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };