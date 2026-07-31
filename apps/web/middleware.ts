import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/apply'];
const publicRoutes = ['/auth', '/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for session cookie
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('skillbridge_session');

  if (!sessionCookie) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|public|favicon.ico).*)'],
};
