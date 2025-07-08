import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    // Handle CORS preflight
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, type, title, message, data } = await req.json();

    // Get the service role key and URL from environment variables
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('notifications').insert([
      {
        user_id,
        type,
        title,
        message,
        data,
        is_read: false,
      },
    ]);

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 400, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders });
  }
}); 