import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('auth_token')?.value;
  
  if (!token || !JWT_SECRET) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  try {
    const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const updates = await request.json();

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', userId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid token or server error' }), { status: 500 });
  }
};