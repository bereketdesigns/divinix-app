import { defineMiddleware } from 'astro:middleware';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const onRequest = defineMiddleware(async (context, next) => {
  const protectedPaths = ['/edit'];
  const { pathname } = context.url;

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = context.cookies.get('auth_token')?.value;

    if (!token || !JWT_SECRET) {
      // If no token, redirect to login page.
      return context.redirect('/login', 307);
    }

    try {
      // Verify the token is valid.
      jsonwebtoken.verify(token, JWT_SECRET);
    } catch (err) {
      // If token is invalid (expired, tampered), delete it and redirect to login.
      context.cookies.delete('auth_token', { path: '/' });
      return context.redirect('/login', 307);
    }
  }

  // If all checks pass or the route is not protected, continue to the page.
  return next();
});