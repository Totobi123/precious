import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create admin user
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@gmail.com',
      password: 'Admin.',
      email_confirm: true,
      user_metadata: { full_name: 'Admin' },
    });

    if (error) {
      // If user exists, get them
      if (error.message.includes('already')) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const adminUser = users?.users?.find(u => u.email === 'admin@gmail.com');
        if (adminUser) {
          // Add admin role
          await supabaseAdmin.from('user_roles').upsert({
            user_id: adminUser.id,
            role: 'admin',
          }, { onConflict: 'user_id,role' });
          return new Response(JSON.stringify({ success: true, message: 'Admin role assigned to existing user' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
      throw error;
    }

    // Add admin role
    if (user?.user) {
      await supabaseAdmin.from('user_roles').upsert({
        user_id: user.user.id,
        role: 'admin',
      }, { onConflict: 'user_id,role' });
    }

    // Ensure storage bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.find(b => b.id === 'products')) {
      await supabaseAdmin.storage.createBucket('products', {
        public: true,
        allowedMimeTypes: ['image/*'],
      });
      console.log('Created "products" bucket');
    }

    return new Response(JSON.stringify({ success: true, userId: user?.user?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
