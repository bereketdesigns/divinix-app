import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { sign } from 'jsonwebtoken';
import { createHmac } from 'node:crypto';

// --- Environment Variables ---
const botToken = import.meta.env.BOT_TOKEN;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;

/**
 * A self-contained function to validate Telegram initData.
 * It uses Node.js crypto and has zero external dependencies.
 * @param initData - The initData string from Telegram.
 * @param botToken - Your bot's secret token.
 * @throws {Error} if validation fails.
 */
function validateTelegramAuth(initData: string, botToken: string): URLSearchParams {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  // !!! THIS IS THE FIX: Explicitly type the array as string[] !!!
  const dataCheckArr: string[] = [];
  urlParams.sort();
  urlParams.forEach((value, key) => dataCheckArr.push(`${key}=${value}`));
  
  const dataCheckString = dataCheckArr.join('\n');
  
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  if (calculatedHash !== hash) {
    throw new Error('Telegram initData validation failed: Invalid hash.');
  }

  const authDate = urlParams.get('auth_date');
  if (!authDate) {
    throw new Error('Telegram initData validation failed: auth_date is missing.');
  }

  const authTimestamp = parseInt(authDate, 10);
  const now = Date.now() / 1000;
  
  if (now - authTimestamp > 3600) { // 1 hour expiration
    throw new Error('Telegram initData validation failed: Data is expired.');
  }

  return urlParams;
}


// --- API Route ---
export const POST: APIRoute = async ({ request }) => {
  try {
    const { initData } = await request.json();
    if (!initData || !botToken || !supabaseServiceKey || !supabaseUrl) {
      throw new Error("Missing required data or environment variables.");
    }

    const validatedParams = validateTelegramAuth(initData, botToken);
    
    const userJson = validatedParams.get('user');
    if (!userJson) { throw new Error('User data is missing from initData.'); }
    const user = JSON.parse(userJson);
    
    if (!user || !user.id) { throw new Error('Invalid user data in initData'); }
    
    const payload = {
      sub: user.id.toString(),
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days
      user_metadata: {
        telegram_id: user.id,
        username: user.username,
        full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
        avatar_url: user.photo_url || null,
      },
    };
    const customToken = sign(payload, supabaseServiceKey);
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: user.id,
            username: user.username,
            full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
            avatar_url: user.photo_url || null,
        });
    if (upsertError) { throw upsertError; }

    return new Response(JSON.stringify({ token: customToken }), { status: 200 });

  } catch (err) {
    const error = err as Error;
    console.error('[Login API Error]:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};