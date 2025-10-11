import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get('auth_token')?.value;

  if (!token || !JWT_SECRET) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Create a response with headers that prevent caching.
    const response = new Response(JSON.stringify(profile), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    return response;
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid token or server error' }), { status: 401 });
  }
};