import type { APIRoute } from 'astro';
import { validate, parse } from '@tma.js/init-data-node';
import { createClient } from '@supabase/supabase-js';
import { sign } from 'jsonwebtoken';

// Type-safe fetching of environment variables
const botToken = import.meta.env.BOT_TOKEN;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

export const POST: APIRoute = async ({ request }) => {
  // --- Pre-flight Checks ---
  if (!botToken) {
    console.error('BOT_TOKEN is not configured.');
    return new Response(JSON.stringify({ error: 'Server configuration error.' }), { status: 500 });
  }
  if (!supabaseServiceKey || !supabaseUrl) {
    console.error('Supabase keys are not configured.');
    return new Response(JSON.stringify({ error: 'Server configuration error.' }), { status: 500 });
  }

  try {
    const { initData } = await request.json();
    if (!initData) {
      return new Response(JSON.stringify({ error: 'initData is required.' }), { status: 400 });
    }

    // --- 1. Validate the initData ---
    validate(initData, botToken, { expiresIn: 3600 }); // Expires in 1 hour

    // --- 2. Parse User Data ---
    const data = parse(initData);
    const user = data.user;
    if (!user) {
      throw new Error('Invalid user data in initData.');
    }

    // --- 3. Create a Supabase Admin Client ---
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // --- 4. Ensure a Profile Exists (Upsert) ---
    // This will create a new profile if one doesn't exist, or do nothing if it does.
    const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: user.id, // Use Telegram ID as the primary key
            username: user.username,
            full_name: `${user.firstName} ${user.lastName || ''}`.trim(),
            avatar_url: user.photoUrl || null,
        }, { onConflict: 'id' }); // onConflict tells Supabase what to do if a row with this ID already exists.

    if (upsertError) {
      throw upsertError;
    }

    // --- 5. Create a Custom JWT for Supabase Auth ---
    const payload = {
      sub: user.id.toString(), // The user's unique ID, which our RLS policy uses
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // Expires in 7 days
    };
    
    // sign() requires a non-null secret, which we checked at the top.
    const customToken = sign(payload, supabaseServiceKey);

    // --- 6. Return the custom JWT to the client ---
    return new Response(JSON.stringify({ token: customToken }), { status: 200 });

  } catch (error) {
    const err = error as Error;
    console.error('Login API Error:', err.message);
    // Be careful not to leak sensitive error details to the client
    return new Response(JSON.stringify({ error: 'Authentication failed.' }), { status: 500 });
  }
};