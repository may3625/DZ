import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AutoCreateAdmin: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const createAdminAccount = async () => {
      setIsCreating(true);
      
      try {
        console.log('🔧 Création automatique du compte admin...');
        
        const { data, error } = await supabase.functions.invoke('create-admin', {
          body: {}
        });

        if (error) {
          console.error('❌ Erreur lors de la création du compte admin:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de créer le compte admin: " + error.message
          });
          return;
        }

        console.log('✅ Compte admin créé:', data);
        
        if (data.success) {
          toast({
            title: "Compte admin créé",
            description: "Le compte admin@dalil.dz a été créé avec le mot de passe 123"
          });
        } else {
          toast({
            variant: "destructive", 
            title: "Erreur",
            description: data.error || "Échec de la création du compte admin"
          });
        }

      } catch (error) {
        console.error('❌ Erreur générale:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur inattendue lors de la création du compte admin"
        });
      } finally {
        setIsCreating(false);
      }
    };

    createAdminAccount();
  }, [toast]);

  if (isCreating) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Création du compte admin en cours...</span>
        </div>
      </div>
    );
  }

  return null;
};