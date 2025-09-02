import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Users, Shield, Check, X, Edit, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AppRole;
}

type AppRole = 'admin' | 'juriste' | 'citoyen';

const roleLabels: Record<AppRole, string> = {
  admin: 'Administrateur',
  juriste: 'Juriste',
  citoyen: 'Citoyen'
};

const roleColors: Record<AppRole, string> = {
  admin: 'bg-red-100 text-red-800',
  juriste: 'bg-blue-100 text-blue-800',
  citoyen: 'bg-gray-100 text-gray-800'
};

export function UserRoleManager() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('citoyen');

  // Get current user role
  const { data: currentUserRole } = useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      return data?.role || 'citoyen';
    }
  });

  // Fetch users and their roles
  const fetchUsers = async () => {
    try {
      console.log('Fetching users and profiles...');
      
      // Récupérer tous les profils utilisateur - utiliser seulement 'profiles'
      const columns = currentUserRole === 'admin' ? 'id, email, first_name, last_name' : 'id, first_name, last_name';
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(columns);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profiles);

      // Récupérer tous les rôles utilisateur
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      console.log('Roles fetched:', roles);

      // Combiner les profils avec leurs rôles
      const usersWithRoles: UserProfile[] = [];
      
      if (profiles && Array.isArray(profiles)) {
        profiles.forEach((profile: any) => {
          // Type guard plus strict
          if (profile && 
              typeof profile === 'object' && 
              !Array.isArray(profile) &&
              'id' in profile &&
              profile.id) {
            
            // Type assertion sécurisée
            const safeProfile = profile as Record<string, any>;
            
            const userRoleData = roles?.find(r => r.user_id === safeProfile.id);
            const roleValue = userRoleData?.role || 'citoyen';
            
            // Vérifier que le rôle est valide
            const validRole: AppRole = ['admin', 'juriste', 'citoyen'].includes(roleValue) 
              ? roleValue as AppRole 
              : 'citoyen';
            
            usersWithRoles.push({
              id: String(safeProfile.id),
              email: String(safeProfile.email || ''),
              first_name: String(safeProfile.first_name || ''),
              last_name: String(safeProfile.last_name || ''),
              role: validRole
            });
          }
        });
      }

      console.log('Users with roles:', usersWithRoles);
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (currentUserRole) {
      fetchUsers();
    }
  }, [currentUserRole]);

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      // Delete existing role first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserRole'] });
      fetchUsers();
      setEditingUser(null);
      toast({
        title: "Succès",
        description: "Le rôle a été mis à jour avec succès",
      });
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive"
      });
    }
  });

  const handleRoleUpdate = (userId: string, role: AppRole) => {
    updateRoleMutation.mutate({ userId, role });
  };

  const startEdit = (userId: string, currentRole: AppRole) => {
    setEditingUser(userId);
    setNewRole(currentRole);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setNewRole('citoyen');
  };

  const saveEdit = () => {
    if (editingUser) {
      handleRoleUpdate(editingUser, newRole);
    }
  };

  // Only show to admins
  if (currentUserRole !== 'admin') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Rôles Utilisateurs
          </CardTitle>
          <CardDescription>
            Gérez les rôles et permissions des utilisateurs de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      {user.email && (
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingUser === user.id ? (
                      <div className="flex items-center gap-2">
                        <Select value={newRole} onValueChange={(value: AppRole) => setNewRole(value)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrateur</SelectItem>
                            <SelectItem value="juriste">Juriste</SelectItem>
                            <SelectItem value="citoyen">Citoyen</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          disabled={updateRoleMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge className={roleColors[user.role]}>
                          <Shield className="h-3 w-3 mr-1" />
                          {roleLabels[user.role]}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(user.id, user.role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note importante :</strong> La modification des rôles prend effet immédiatement. 
          Soyez prudent lors de la modification des permissions administrateur.
        </AlertDescription>
      </Alert>
    </div>
  );
}