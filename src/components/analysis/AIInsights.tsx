
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Sparkles, 
  Bot, 
  TrendingUp, 
  Zap, 
  Target, 
  AlertTriangle 
} from 'lucide-react';

export function AIInsights() {
  const actions = [
    {
      title: "Optimiser le processus de validation",
      description: "Réduire les étapes de validation de 5 à 3",
      priority: "Haute",
      impact: "Élevé"
    },
    {
      title: "Mettre à jour la base de connaissances",
      description: "Ajouter 15 nouvelles procédures identifiées",
      priority: "Moyenne",
      impact: "Moyen"
    },
    {
      title: "Automatiser les rapports hebdomadaires",
      description: "Générer automatiquement les rapports récurrents",
      priority: "Moyenne",
      impact: "Élevé"
    },
    {
      title: "Améliorer l'interface utilisateur",
      description: "Optimiser l'expérience utilisateur basée sur les retours",
      priority: "Basse",
      impact: "Moyen"
    },
    {
      title: "Renforcer la sécurité des données",
      description: "Implémenter des mesures de sécurité supplémentaires",
      priority: "Haute",
      impact: "Élevé"
    },
    {
      title: "Formation continue des utilisateurs",
      description: "Mettre en place un programme de formation régulier",
      priority: "Moyenne",
      impact: "Moyen"
    }
  ];

  // Pagination pour les actions recommandées
  const {
    currentData: paginatedActions,
    currentPage: actionsCurrentPage,
    totalPages: actionsTotalPages,
    itemsPerPage: actionsItemsPerPage,
    totalItems: actionsTotalItems,
    setCurrentPage: setActionsCurrentPage,
    setItemsPerPage: setActionsItemsPerPage
  } = usePagination({
    data: actions,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-600" />
            Insights IA et Recommandations
          </CardTitle>
          <CardDescription>
            Découvrez des insights automatiques et des recommandations personnalisées générées par l'IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recommandations Intelligentes avec pagination */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                Recommandations Intelligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Insights IA et Recommandations</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <span className="font-medium text-sm">Automatisation de processus</span>
                        <p className="text-xs text-gray-600 mt-1">Automatiser 3 processus répétitifs pour gagner 15% d'efficacité</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <span className="font-medium text-sm">Optimisation des workflows</span>
                        <p className="text-xs text-gray-600 mt-1">Réorganiser les workflows pour réduire les délais de 20%</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                      <div>
                        <span className="font-medium text-sm">Formation recommandée</span>
                        <p className="text-xs text-gray-600 mt-1">Renforcer la formation sur 2 modules critiques</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Pagination pour les insights */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Insights 1-3 sur 12</span>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">Précédent</button>
                      <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded">Suivant</button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tendances Prédictives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Tendances Prédictives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">+23%</div>
                  <div className="text-sm text-gray-600">Croissance prévue</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-gray-600">Taux de réussite</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">-12%</div>
                  <div className="text-sm text-gray-600">Réduction des coûts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Recommandées par l'IA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                Actions Recommandées par l'IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paginatedActions.map((action, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{action.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Priorité: {action.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Impact: {action.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Appliquer
                    </Button>
                    <Button size="sm" variant="outline">
                      Plus tard
                    </Button>
                    <Button size="sm" variant="outline">
                      Créer maintenant
                    </Button>
                    <Button size="sm" variant="outline">
                      Voir détails
                    </Button>
                  </div>
                </div>
              ))}
              {/* Pagination pour les actions recommandées */}
              <div className="mt-4">
                <Pagination
                  currentPage={actionsCurrentPage}
                  totalPages={actionsTotalPages}
                  totalItems={actionsTotalItems}
                  itemsPerPage={actionsItemsPerPage}
                  onPageChange={setActionsCurrentPage}
                  onItemsPerPageChange={setActionsItemsPerPage}
                />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
