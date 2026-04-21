// apps/web/app/api/auth/[...nextauth]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

/**
 * MogiRentOS Edge-Safe Auth Stub
 * -----------------------------
 * This file exists to prevent 404 errors from the <SessionProvider> 
 * and allow the project to build on Cloudflare Pages.
 * * Your actual authentication is handled by your NestJS backend 
 * at /api/v1/auth, which this file does not interfere with.
 */

export async function GET(req: NextRequest) {
  // Returning an empty object { } tells NextAuth there is no session.
  // This silences the 404 errors while remaining 100% Edge compatible.
  return NextResponse.json({}, { status: 200 });
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "Auth stub active" }, { status: 200 });
}