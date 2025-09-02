
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  userRole: 'user', 
  isAuthenticated: false,
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [isMockAdmin, setIsMockAdmin] = useState<boolean>(false);

  // Fonction pour récupérer le rôle de l'utilisateur depuis la base de données
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }
      
      return data?.role || 'user';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'user';
    }
  };

  useEffect(() => {
    // Fallback local: mode mock admin activé uniquement en développement
    if (import.meta.env.DEV) {
      const mock = localStorage.getItem('mock_admin') === 'true';
      if (mock) {
        setIsMockAdmin(true);
        setUserRole('admin');
      }
    } else {
      // En production, ne jamais activer mock_admin
      if (localStorage.getItem('mock_admin')) {
        localStorage.removeItem('mock_admin');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        let role = await fetchUserRole(session.user.id);
        // Fallback: si l'email est admin@dalil.dz, considérer comme admin même si la table des rôles n'est pas lisible
        const email = (session.user.email || '').toLowerCase();
        if (role !== 'admin' && email === 'admin@dalil.dz') {
          role = 'admin';
        }
        setUserRole(role);
        // Un utilisateur réel remplace le mode mock
        if (isMockAdmin) {
          setIsMockAdmin(false);
          localStorage.removeItem('mock_admin');
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        let role = await fetchUserRole(session.user.id);
        const email = (session.user.email || '').toLowerCase();
        if (role !== 'admin' && email === 'admin@dalil.dz') {
          role = 'admin';
        }
        setUserRole(role);
        if (isMockAdmin) {
          setIsMockAdmin(false);
          localStorage.removeItem('mock_admin');
        }
      } else {
        setUserRole('user');
        // Si pas de session, conserver éventuellement le mode mock en DEV uniquement
        if (import.meta.env.DEV) {
          const mock = localStorage.getItem('mock_admin') === 'true';
          setIsMockAdmin(mock);
        } else {
          setIsMockAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole('user');
    setIsMockAdmin(false);
    localStorage.removeItem('mock_admin');
  };

  const isAuthenticated = !!user || isMockAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, userRole, isAuthenticated, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
