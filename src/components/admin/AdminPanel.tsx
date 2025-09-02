
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginPage } from '@/components/auth/LoginPage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserRoleManager } from './UserRoleManager';
import { UserStats } from './UserStats';
import { TestDataGenerator } from './TestDataGenerator';
import { CreateAdminButton } from './CreateAdminButton';
import { AutoCreateAdmin } from './AutoCreateAdmin';
import { SecurityMonitor } from '@/components/common/SecurityMonitor';
import { Settings, Users, Database, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export function AdminPanel() {
  const { userRole, isAuthenticated, user, signOut } = useAuth();
  const [isLocallyAdmin, setIsLocallyAdmin] = useState(false);
  const [adminBootstrapInProgress, setAdminBootstrapInProgress] = useState(false);
  const [isMockAdmin, setIsMockAdmin] = useState<boolean>(false);

  // Assurer l'accès admin pour le compte par défaut si nécessaire
  useEffect(() => {
    const ensureAdminAccess = async () => {
      // Mode mock local: bypass complet
      const mock = localStorage.getItem('mock_admin') === 'true';
      setIsMockAdmin(mock);
      if (mock) {
        setIsLocallyAdmin(true);
        return;
      }

      if (!isAuthenticated || !user) return;

      // Si déjà admin via le provider, c'est bon
      if (userRole === 'admin') {
        setIsLocallyAdmin(true);
        return;
      }

      // Si l'utilisateur connecté est le compte admin par défaut, tenter le bootstrap
      const email = (user.email || '').toLowerCase();
      if (email === 'admin@dalil.dz') {
        try {
          setAdminBootstrapInProgress(true);

          // Vérifier si un rôle existe déjà
          const { data: currentRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (currentRole?.role === 'admin') {
            setIsLocallyAdmin(true);
            return;
          }

          // Appeler la fonction edge pour créer/assurer le rôle admin
          await supabase.functions.invoke('create-admin', { body: {} });

          // Re-vérifier le rôle après création
          const { data: newRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          if (newRole?.role === 'admin') {
            setIsLocallyAdmin(true);
          }
        } finally {
          setAdminBootstrapInProgress(false);
        }
      }
    };

    ensureAdminAccess();
  }, [isAuthenticated, user, userRole]);
  
  // Afficher la page de connexion si pas authentifié
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  // Vérifier si l'utilisateur est admin
  if (userRole !== 'admin' && !isLocallyAdmin && !isMockAdmin) {
    // Si c'est le compte admin par défaut, afficher un état de vérification/initialisation
    const isDefaultAdmin = (user?.email || '').toLowerCase() === 'admin@dalil.dz';
    if (isDefaultAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Initialisation de l'accès administrateur…</h2>
              <p className="text-gray-600 mb-2">Veuillez patienter pendant la vérification/création du rôle admin.</p>
              {adminBootstrapInProgress && (
                <p className="text-sm text-gray-500">Opération en cours…</p>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p className="text-gray-600 mb-4">
              Cette page est réservée aux administrateurs
            </p>
            <Button onClick={signOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8" />
            Panneau d'administration
          </h1>
          <p className="text-gray-600 mt-2">
            Gestion des utilisateurs, données et sécurité de l'application
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Connecté en tant que: {user?.email} (Rôle: {userRole})
          </p>
        </div>
        
        <Button onClick={signOut} variant="outline">
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Données
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <CreateAdminButton />
          <UserStats />
          <UserRoleManager />
        </TabsContent>

        <TabsContent value="data">
          <TestDataGenerator />
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring de sécurité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Le système de monitoring de sécurité fonctionne en arrière-plan.
                Les alertes apparaîtront automatiquement en bas à droite de l'écran.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✓ Système de sécurité actif
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Surveillance des tentatives d'intrusion, validation des entrées, 
                  et logging des événements de sécurité
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <SecurityMonitor />
      <AutoCreateAdmin />
    </div>
  );
}

export default AdminPanel;