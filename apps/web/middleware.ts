// apps/web/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check for the authentication cookie
  // REPLACE 'your-auth-token-name' with the actual name of your auth cookie
  const token = request.cookies.get('access_token')?.value;

  // 2. Identify if the user is trying to access a protected route
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/dashboard') || 
    request.nextUrl.pathname.startsWith('/super-admin') ||
    request.nextUrl.pathname.startsWith('/portal');

  // 3. If they want a protected route but have no token, intercept and redirect
  if (isProtectedRoute && !token) {
    // Create the redirect URL to the login page
    const loginUrl = new URL('/login', request.url);
    
    // Optional: Add a query parameter so you can redirect them back after they log in
    // loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // 4. If they have a token, or are visiting a public page (like /pricing), let them through
  return NextResponse.next();
}

// 5. Optimize: Tell Next.js to only run this middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, apple-icon.png (favicon files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|apple-icon.png).*)',
  ],
};