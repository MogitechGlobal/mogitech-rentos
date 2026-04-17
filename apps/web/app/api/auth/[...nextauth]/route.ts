// apps/web/app/api/auth/[...nextauth]/route.ts
export const runtime = 'edge'; // <-- 1. Tell Cloudflare to use the Edge Runtime

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Pool } from '@neondatabase/serverless'; // <-- 2. Removed neonConfig
import { PrismaNeon } from '@prisma/adapter-neon';
// <-- 3. Removed 'import ws from "ws"' (Edge has native WebSockets!)

const pool = new Pool({ 
  // Wrapped in process.env so it works securely in Cloudflare, with your string as a fallback
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_a7bFMG3EvUih@ep-shy-art-anj5g4t5-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" 
});
const adapter = new PrismaNeon(pool as any);
const prisma = new PrismaClient({ adapter });

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || "b8f9e7d2c4a1b6e8f0a3c5d7e9b2a4c6f8e1d3b5a7c9f0e2d4b6a8c0e9f1d3b5", 
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "841144806384-4t54eik9mqjkoctjd8os74f2bsjhcbc9.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
      allowDangerousEmailAccountLinking: true, 
    }),
  ],
  session: { strategy: "jwt" as const },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token.sub) {
        session.user.id = token.sub; 
      }
      return session;
    },
  },
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };