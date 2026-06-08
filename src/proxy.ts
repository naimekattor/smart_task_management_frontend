import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register');
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');

  if (isApiAuth) return;

  if (isAuthPage) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/', req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes (/api/...)
     * - static files (_next/static, images, favicon.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|next.svg|vercel.svg|uploads).*)',
  ],
};
