import { defineMiddleware } from 'astro:middleware';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const onRequest = defineMiddleware(async (context, next) => {
  // --- This is the core logic to determine authentication state ---
  const token = context.cookies.get('auth_token')?.value;
  let isAuthenticated = false;

  if (token && JWT_SECRET) {
    try {
      jsonwebtoken.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (err) {
      // If token is invalid, delete it.
      context.cookies.delete('auth_token', { path: '/' });
      isAuthenticated = false;
    }
  }

  // Pass the authentication state to all pages.
  context.locals.isLoggedIn = isAuthenticated;

  // --- This is the logic to protect specific routes ---
  const { pathname } = context.url;
  if (pathname.startsWith('/edit') && !isAuthenticated) {
    return context.redirect('/login');
  }

  // --- This is the FINAL, CRITICAL FIX ---
  // Get the response from the next middleware or the page.
  const response = await next();

  // Set headers on the response to prevent caching on Vercel's Edge and on the browser.
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');

  // Return the modified response.
  return response;
});