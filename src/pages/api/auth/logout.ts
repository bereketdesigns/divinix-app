import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies }) => {
  // Securely delete the HttpOnly cookie.
  cookies.delete('auth_token', {
    path: '/',
  });
  
  // Respond with success. The client will handle the redirect.
  return new Response(JSON.stringify({ success: true }), { status: 200 });
};