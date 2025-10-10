import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import jsonwebtoken from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = import.meta.env.JWT_SECRET;
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get('auth_token')?.value;
  if (!token || !JWT_SECRET) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  try {
    // Verify the user is who they say they are
    jsonwebtoken.verify(token, JWT_SECRET);

    const file = await request.blob();
    if (!file) {
      throw new Error("No file provided.");
    }

    const fileExtension = file.type.split('/')[1];
    if (!fileExtension) {
      throw new Error("Could not determine file type.");
    }
    
    const fileName = `${uuidv4()}.${fileExtension}`;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { error: uploadError } = await supabaseAdmin.storage
      .from('profile-pictures') // Upload to the correct bucket
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);
    
    return new Response(JSON.stringify({ url: urlData.publicUrl }), { status: 200 });
  } catch (err) {
    const error = err as Error;
    console.error('[Upload API Error]:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};