// apps/web/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/super-admin') ||
    pathname.startsWith('/portal') ||
    pathname.startsWith('/hunter');

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const decodedJson = atob(base64);
      const decoded = JSON.parse(decodedJson);

      if (Date.now() >= decoded.exp * 1000) {
        const response = NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
        response.cookies.delete('access_token');
        return response;
      }

      const userRole = decoded.role || 'USER';

      // 1. Super Admin Protection
      if (pathname.startsWith('/super-admin') && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      // 2. Dashboard Protection (Block Tenants and Hunters from entering Landlord/Staff area)
      if (pathname.startsWith('/dashboard') && (userRole === 'TENANT' || userRole === 'USER' || userRole === 'HUNTER')) {
        // If they are a tenant, they MIGHT have a lease, send to portal. Otherwise, send to hunter.
        // We let the frontend determine the lease status.
        return NextResponse.redirect(new URL(userRole === 'TENANT' ? '/portal' : '/hunter', request.url));
      }

      // 3. Portal Protection (Block Hunters/Users from entering the active Tenant Portal)
      if (pathname.startsWith('/portal') && (userRole === 'USER' || userRole === 'HUNTER')) {
         return NextResponse.redirect(new URL('/hunter', request.url));
      }

      // 4. Hunter Protection (Block Landlords from entering the consumer Hunter area)
      if (pathname.startsWith('/hunter') && (userRole === 'LANDLORD' || userRole === 'MANAGER' || userRole === 'STAFF')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
    } catch (error) {
      const response = NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|apple-icon.png).*)',
  ],
};