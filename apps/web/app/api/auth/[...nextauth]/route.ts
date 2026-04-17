// apps/web/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// 1. COMPLETELY BYPASS Node.js Global Cache. 
// This forces a fresh, healthy connection using the exact string.
const pool = new Pool({ 
  connectionString: "database_url_from_neon_dashboard" 
});
const adapter = new PrismaNeon(pool as any);
const prisma = new PrismaClient({ adapter });

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: "supersecretkey", 
  providers: [
    GoogleProvider({
      clientId: "GOOGLE_CLIENT_ID",
      clientSecret: "GOOGLE_CLIENT_SECRET",
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