
import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = [
  '/dashboard',
  '/profile',
  '/settings',
  // Add more protected routes as needed
];


const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/api/auth',
  '/auth'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPathProtected = protectedPaths.some(path => pathname.startsWith(path));
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  

  if (!isPathProtected || isPublicPath) {
    return NextResponse.next();
  }


  const token = request.cookies.get(process.env.NEXT_PUBLIC_TOKEN_COOKIE_NAME as string)?.value;

  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Optional: Verify token validity (basic check)
  // For a more robust solution, you might want to make an API call to verify the token
  try {
    // Here you could add token verification logic
    // For example, checking if it's expired or calling an API to validate
    
    // If token is valid, allow access
    return NextResponse.next();
  } catch (error) {
    // If token verification fails, redirect to login
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }
}


export const config = {
  matcher: [
    '/((?!api/auth|_next|_vercel|static|favicon.ico|robots.txt).*)',
  ],
};