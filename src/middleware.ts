import { defineMiddleware } from 'astro:middleware';
import jsonwebtoken from 'jsonwebtoken';
import { isLoggedIn } from './stores/authStore'; // Import our new store

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('auth_token')?.value;
  let isAuthenticated = false;

  if (token && JWT_SECRET) {
    try {
      // Verify the token is valid and not expired
      jsonwebtoken.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (err) {
      // Token is invalid or expired, user is not authenticated
      isAuthenticated = false;
    }
  }

  // Set the initial value of the Nano Store on the server.
  // This value will be passed to the client automatically.
  isLoggedIn.set(isAuthenticated);

  // Protect the /edit route. If the user is not authenticated, redirect them.
  if (context.url.pathname.startsWith('/edit') && !isAuthenticated) {
    return context.redirect('/login');
  }

  return next();
});