import { NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication (JWT in localStorage)
const protectedRoutes = ['/dashboard', '/profile', '/apply', '/employer'];
const publicRoutes = ['/auth', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublic) {
    return NextResponse.next();
  }

  // We can't read localStorage from server-side middleware, so just let the
  // client-side guards (dashboard pages) handle the redirect. Server-side
  // middleware only protects static/route-level access.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|public|favicon.ico).*)'],
};
