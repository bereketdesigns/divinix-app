import type { APIRoute } from 'astro';

// This API endpoint handles POST requests to /api/auth/logout
export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Clear the authentication cookie by setting its value to empty
  // and its expiration date to a time in the past.
  cookies.delete('auth_token', {
    path: '/',
  });
  
  // Return a success response. The client will handle the redirect.
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};