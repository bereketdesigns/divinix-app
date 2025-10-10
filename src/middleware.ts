import { defineMiddleware } from 'astro:middleware';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const onRequest = defineMiddleware(async (context, next) => {
  const protectedPaths = ['/edit'];
  const { pathname } = context.url;

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = context.cookies.get('auth_token')?.value;

    if (!token || !JWT_SECRET) {
      // If no token, redirect to login
      return context.redirect('/login');
    }

    try {
      const decoded = jsonwebtoken.verify(token, JWT_SECRET);
      // Attach user info to the request for other pages/endpoints to use
      context.locals.user = decoded as { userId: number };
    } catch (err) {
      // Invalid token, clear cookie and redirect to login
      context.cookies.delete('auth_token', { path: '/' });
      return context.redirect('/login');
    }
  }

  return next();
});