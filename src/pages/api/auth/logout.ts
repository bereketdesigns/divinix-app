import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Clear the authentication cookie by setting its expiration date to the past.
  cookies.delete('auth_token', {
    path: '/',
  });
  
  // Return a success response. The client will handle the redirect.
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};