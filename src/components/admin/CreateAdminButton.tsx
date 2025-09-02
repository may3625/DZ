import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const CreateAdminButton: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);

  const createAdminAccount = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      console.log('🔧 Appel de la fonction create-admin...');
      
      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {}
      });

      if (error) {
        console.error('❌ Erreur lors de l\'appel de la fonction:', error);
        setResult({
          success: false,
          message: 'Erreur lors de la création du compte admin',
          error: error.message
        });
        return;
      }

      console.log('✅ Réponse de la fonction:', data);
      
      if (data.success) {
        setResult({
          success: true,
          message: data.message
        });
      } else {
        setResult({
          success: false,
          message: 'Échec de la création du compte admin',
          error: data.error
        });
      }

    } catch (error) {
      console.error('❌ Erreur générale:', error);
      setResult({
        success: false,
        message: 'Erreur inattendue',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Créer le compte administrateur</CardTitle>
        <CardDescription>
          Créer le compte admin par défaut avec les identifiants prédéfinis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-sm text-gray-700 mb-2">Identifiants admin :</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Email :</strong> admin@dalil.dz</div>
            <div><strong>Mot de passe :</strong> 123</div>
          </div>
        </div>

        <Button 
          onClick={createAdminAccount}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Création en cours...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Créer le compte admin
            </div>
          )}
        </Button>

        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  <div className="font-medium">{result.message}</div>
                  {result.error && (
                    <div className="text-sm mt-1 opacity-80">{result.error}</div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {result?.success && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Prochaines étapes :</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Le compte administrateur est maintenant créé</li>
              <li>Vous pouvez vous connecter avec les identifiants ci-dessus</li>
              <li>Changez le mot de passe après la première connexion</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
};