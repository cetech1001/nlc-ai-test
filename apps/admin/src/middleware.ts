import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('All cookies:', request.cookies.getAll());
  console.log('Request URL:', request.nextUrl.pathname);
  console.log('Environment:', process.env.NODE_ENV);

  const token = request.cookies.get('adminToken')?.value;
  console.log('Admin token found:', !!token);

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname.startsWith('/account-verification');

  if (request.nextUrl.pathname === '/') {
    return NextResponse.next();
  }

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
