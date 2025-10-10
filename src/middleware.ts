import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const protectedPaths = ['/edit'];
  const { pathname } = context.url;

  // The middleware's only job: check if an auth cookie exists on protected routes.
  if (protectedPaths.some(path => pathname.startsWith(path))) {
    const token = context.cookies.get('auth_token')?.value;

    if (!token) {
      // If no token, redirect to login. This is the only redirection logic.
      return context.redirect('/login');
    }
  }

  // If the cookie exists, let the request proceed to the page.
  return next();
});