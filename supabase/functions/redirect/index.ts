import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const shortCode = url.searchParams.get('code');

    if (!shortCode) {
      return new Response(
        JSON.stringify({ error: 'Short code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Looking up short code: ${shortCode}`);

    // Get the URL
    const { data: urlData, error: urlError } = await supabase
      .from('urls')
      .select('*')
      .eq('short_code', shortCode)
      .single();

    if (urlError || !urlData) {
      console.error('URL not found:', urlError);
      return new Response(
        JSON.stringify({ error: 'URL not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment click count
    const { error: updateError } = await supabase
      .from('urls')
      .update({ clicks: urlData.clicks + 1 })
      .eq('id', urlData.id);

    if (updateError) {
      console.error('Error updating click count:', updateError);
    }

    // Record analytics
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';
    
    const { error: analyticsError } = await supabase
      .from('url_analytics')
      .insert({
        url_id: urlData.id,
        user_agent: userAgent,
        referrer: referrer,
      });

    if (analyticsError) {
      console.error('Error recording analytics:', analyticsError);
    }

    console.log(`Redirecting to: ${urlData.original_url}`);

    return new Response(
      JSON.stringify({ 
        url: urlData.original_url,
        clicks: urlData.clicks + 1 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Error in redirect function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
