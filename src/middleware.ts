import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/dashboard'];
const PUBLIC_PATHS = ['/', '/api/auth', '/api/stripe/webhook'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes, static assets, and API routes (except protected ones) pass through
  if (
    isPublic(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For protected routes, check for session cookie
  if (isProtected(pathname)) {
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie?.value) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
