import { defineMiddleware } from 'astro:middleware';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('auth_token')?.value;
  let isAuthenticated = false;

  if (token && JWT_SECRET) {
    try {
      jsonwebtoken.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (err) {
      context.cookies.delete('auth_token', { path: '/' });
      isAuthenticated = false;
    }
  }

  // This line is now valid because of our change to env.d.ts
  context.locals.isLoggedIn = isAuthenticated;

  const { pathname } = context.url;
  if (pathname.startsWith('/edit') && !isAuthenticated) {
    return context.redirect('/login');
  }

  return next();
});