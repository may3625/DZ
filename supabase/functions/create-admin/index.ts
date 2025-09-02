import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔧 Début de création du compte administrateur');

    // Créer un client Supabase avec les droits service_role pour contourner RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dalil.dz';
    const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomUUID().substring(0, 12);

    // Validation de sécurité
    if (!adminPassword || adminPassword.length < 8) {
      throw new Error('Le mot de passe admin doit faire au moins 8 caractères');
    }

    if (!adminEmail || !adminEmail.includes('@')) {
      throw new Error('Email admin invalide');
    }

    console.log(`📧 Création de l'utilisateur admin: ${adminEmail}`);
    console.log('🔒 Mot de passe généré automatiquement (consultez les logs pour le récupérer)');

    // Créer l'utilisateur admin
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true, // Confirmer l'email automatiquement
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Dalil.dz'
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', authError);
      
      // Si l'utilisateur existe déjà, essayer de le récupérer
      if (authError.message.includes('already registered')) {
        console.log('👤 L\'utilisateur existe déjà, récupération...');
        
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          throw new Error(`Erreur lors de la récupération des utilisateurs: ${listError.message}`);
        }
        
        const existingUser = existingUsers.users.find(u => u.email === adminEmail);
        
        if (!existingUser) {
          throw new Error('Utilisateur introuvable après vérification');
        }
        
        console.log('✅ Utilisateur existant trouvé:', existingUser.id);
        
        // Vérifier s'il a déjà le rôle admin
        const { data: existingRole, error: roleCheckError } = await supabaseAdmin
          .from('user_roles')
          .select('*')
          .eq('user_id', existingUser.id)
          .eq('role', 'admin')
          .single();
        
        if (roleCheckError && roleCheckError.code !== 'PGRST116') { // PGRST116 = not found
          throw new Error(`Erreur lors de la vérification du rôle: ${roleCheckError.message}`);
        }
        
        if (existingRole) {
          console.log('✅ L\'utilisateur a déjà le rôle admin');
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Compte admin déjà existant et configuré',
              user_id: existingUser.id,
              email: adminEmail
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          );
        }
        
        // Assigner le rôle admin s'il ne l'a pas
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: existingUser.id,
            role: 'admin'
          });
        
        if (roleError) {
          throw new Error(`Erreur lors de l'assignation du rôle admin: ${roleError.message}`);
        }
        
        console.log('✅ Rôle admin assigné à l\'utilisateur existant');
        
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Rôle admin assigné à l\'utilisateur existant',
            user_id: existingUser.id,
            email: adminEmail
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } else {
        throw new Error(`Erreur lors de la création de l'utilisateur: ${authError.message}`);
      }
    }

    console.log('✅ Utilisateur admin créé avec succès:', authUser.user.id);

    // Créer le profil utilisateur
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.user.id,
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'Dalil.dz'
      });

    if (profileError) {
      console.error('⚠️ Erreur lors de la création du profil (non bloquant):', profileError);
    } else {
      console.log('✅ Profil admin créé');
    }

    // Assigner le rôle admin
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('❌ Erreur lors de l\'assignation du rôle admin:', roleError);
      throw new Error(`Impossible d'assigner le rôle admin: ${roleError.message}`);
    }

    console.log('✅ Rôle admin assigné avec succès');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Compte administrateur créé avec succès',
        user_id: authUser.user.id,
        email: adminEmail,
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erreur inconnue lors de la création du compte admin'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})