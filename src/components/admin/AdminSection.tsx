import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Settings, Users, Database, Shield, BarChart3, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateAdminButton } from '@/components/admin/CreateAdminButton';
import { AutoCreateAdmin } from '@/components/admin/AutoCreateAdmin';

export function AdminSection() {
  const { user, userRole } = useAuth();

  if (userRole !== 'admin') {
    return (
      <div className="space-y-8">
        <SectionHeader
          icon={Shield}
          title="Accès Administration"
          description="Cette section est réservée aux administrateurs"
          iconColor="text-red-600"
        />
        
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Accès Restreint
          </h3>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté en tant qu'administrateur pour accéder à cette section.
          </p>
          
          <div className="space-y-4 max-w-md mx-auto">
            <CreateAdminButton />
            <AutoCreateAdmin />
          </div>
        </div>
      </div>
    );
  }

  const adminModules = [
    {
      title: "Gestion des Utilisateurs",
      description: "Administration des comptes et rôles utilisateurs",
      icon: Users,
      color: "blue",
      stats: "156 utilisateurs actifs",
      actions: ["Créer utilisateur", "Gérer rôles", "Voir logs"]
    },
    {
      title: "Base de Données",
      description: "Administration et maintenance de la base de données",
      icon: Database,
      color: "green",
      stats: "2.3GB de données",
      actions: ["Sauvegardes", "Optimisation", "Migrations"]
    },
    {
      title: "Sécurité",
      description: "Configuration sécurité et monitoring",
      icon: Shield,
      color: "red",
      stats: "Aucune menace détectée",
      actions: ["Audit logs", "Permissions", "Firewall"]
    },
    {
      title: "Analytics",
      description: "Statistiques d'utilisation et performance",
      icon: BarChart3,
      color: "purple",
      stats: "98.7% uptime",
      actions: ["Rapports", "Métriques", "Dashboards"]
    },
    {
      title: "Configuration Système",
      description: "Paramètres globaux de l'application",
      icon: Settings,
      color: "orange",
      stats: "Configuration OK",
      actions: ["Paramètres", "Modules", "API Keys"]
    },
    {
      title: "Validation Contenu",
      description: "Approbation des contenus juridiques",
      icon: UserCheck,
      color: "teal",
      stats: "12 en attente",
      actions: ["Approuver", "Rejeter", "Historique"]
    }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Settings}
        title="Panneau d'Administration"
        description="Centre de contrôle et administration de la plateforme Dalil.dz"
        iconColor="text-blue-600"
      />

      {/* Informations Admin */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-blue-900">
                  Connecté en tant qu'Administrateur
                </CardTitle>
                <CardDescription className="text-blue-700">
                  {user?.email || 'admin@dalil.dz'}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
              Admin Actif
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Modules d'Administration */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, index) => {
          const IconComponent = module.icon;
          const colorClasses = {
            blue: "bg-blue-50 border-blue-200 text-blue-600",
            green: "bg-green-50 border-green-200 text-green-600",
            red: "bg-red-50 border-red-200 text-red-600",
            purple: "bg-purple-50 border-purple-200 text-purple-600",
            orange: "bg-orange-50 border-orange-200 text-orange-600",
            teal: "bg-teal-50 border-teal-200 text-teal-600"
          };

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[module.color]}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  📊 {module.stats}
                </div>
                
                <div className="space-y-2">
                  {module.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => {
                        console.log(`Action: ${action} pour ${module.title}`);
                        // TODO: Implémenter les actions spécifiques
                      }}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions Rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Actions Rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Sauvegarde BD</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Nouvel Admin</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Rapport Mensuel</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Audit Sécurité</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}