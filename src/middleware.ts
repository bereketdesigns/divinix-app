import { defineMiddleware } from 'astro:middleware';
import jsonwebtoken from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = import.meta.env.JWT_SECRET;
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get('auth_token')?.value;
  context.locals.isLoggedIn = false;
  context.locals.profile = null;

  if (token && JWT_SECRET && supabaseUrl && supabaseServiceKey) {
    try {
      const decoded = jsonwebtoken.verify(token, JWT_SECRET) as { userId: number };
      const userId = decoded.userId;
      
      context.locals.isLoggedIn = true;
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profile) {
        context.locals.profile = profile;
      }

    } catch (err) {
      context.cookies.delete('auth_token', { path: '/' });
      context.locals.isLoggedIn = false;
      context.locals.profile = null;
    }
  }

  const { pathname } = context.url;
  if (pathname.startsWith('/edit') && !context.locals.isLoggedIn) {
    return context.redirect('/login');
  }

  const response = await next();
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
});