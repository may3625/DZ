
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/common/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { Bot, Sparkles, FileText, FileSpreadsheet, FileImage, 
  Download, 
  Eye, 
  Trash2, 
  Calendar,
  User,
  FileType,
  Clock
} from 'lucide-react';
import { UnifiedModalSystem } from '@/components/modals/UnifiedModalSystem';

export function CustomReportGeneration() {
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);

  // Données pour les rapports récents
  const recentReports = [
    {
      id: 1,
      title: "Analyse des tendances législatives Q4 2024",
      type: "PDF",
      status: "Terminé",
      generatedBy: "Dr. Ahmed Benali",
      generatedAt: "2024-01-15 14:30",
      size: "2.4 MB",
      downloads: 23,
      description: "Rapport complet sur l'évolution de la législation algérienne"
    },
    {
      id: 2,
      title: "Statistiques des procédures administratives",
      type: "Excel",
      status: "Terminé",
      generatedBy: "Mme Fatima Cherif",
      generatedAt: "2024-01-14 16:45",
      size: "1.8 MB",
      downloads: 15,
      description: "Données statistiques sur les procédures administratives"
    },
    {
      id: 3,
      title: "Rapport de conformité RGPD",
      type: "Word",
      status: "En cours",
      generatedBy: "Dr. Karim Meziane",
      generatedAt: "2024-01-15 10:20",
      size: "0.0 MB",
      downloads: 0,
      description: "Évaluation de la conformité aux normes RGPD"
    },
    {
      id: 4,
      title: "Analyse comparative des codes juridiques",
      type: "PDF",
      status: "Terminé",
      generatedBy: "Prof. Leila Mansouri",
      generatedAt: "2024-01-13 09:15",
      size: "3.2 MB",
      downloads: 31,
      description: "Comparaison des différents codes juridiques algériens"
    },
    {
      id: 5,
      title: "Rapport d'activité mensuel - Décembre 2024",
      type: "Excel",
      status: "Terminé",
      generatedBy: "Dr. Yacine Brahim",
      generatedAt: "2024-01-12 11:30",
      size: "1.5 MB",
      downloads: 18,
      description: "Résumé des activités juridiques du mois de décembre"
    },
    {
      id: 6,
      title: "Étude sur la jurisprudence récente",
      type: "PDF",
      status: "Terminé",
      generatedBy: "M. Salim Kaced",
      generatedAt: "2024-01-11 15:45",
      size: "2.8 MB",
      downloads: 27,
      description: "Analyse des décisions de justice récentes"
    },
    {
      id: 7,
      title: "Rapport de sécurité informatique",
      type: "Word",
      status: "Terminé",
      generatedBy: "Dr. Amina Bouaziz",
      generatedAt: "2024-01-10 13:20",
      size: "1.2 MB",
      downloads: 12,
      description: "Audit de sécurité des systèmes informatiques"
    },
    {
      id: 8,
      title: "Analyse des contrats commerciaux",
      type: "PDF",
      status: "Terminé",
      generatedBy: "M. Kamel Boudiaf",
      generatedAt: "2024-01-09 16:10",
      size: "2.1 MB",
      downloads: 19,
      description: "Étude des clauses contractuelles commerciales"
    }
  ];

  // Pagination pour les rapports récents
  const {
    currentData: paginatedReports,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
  } = usePagination({
    data: recentReports,
    itemsPerPage: 5
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            Générateur de Rapport Personnalisé
          </CardTitle>
          <CardDescription>
            Créez des rapports sur mesure avec l'assistance de l'IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Configuration du rapport */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Configuration du Rapport</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre du rapport</label>
                <Input placeholder="Entrez le titre de votre rapport" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Source de données</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal-texts">Textes juridiques</SelectItem>
                    <SelectItem value="procedures">Procédures administratives</SelectItem>
                    <SelectItem value="all">Toutes les données</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Décrivez les objectifs et le contenu souhaité du rapport..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Période</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">7 derniers jours</SelectItem>
                      <SelectItem value="month">30 derniers jours</SelectItem>
                      <SelectItem value="quarter">3 derniers mois</SelectItem>
                      <SelectItem value="year">12 derniers mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="word">Word</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Actions</h3>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  Génération Intelligente
                </h4>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-3"
                  onClick={() => setShowAiModal(true)}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Générer avec IA
                </Button>
                
                <div className="text-sm text-gray-600 mb-3">
                  Options d'export rapide :
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowPdfModal(true)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowExcelModal(true)}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                    Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setShowWordModal(true)}
                  >
                    <FileImage className="w-4 h-4 mr-1" />
                    Word
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Suggestions IA</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Inclure les tendances récentes</li>
                  <li>• Ajouter des graphiques comparatifs</li>
                  <li>• Intégrer une analyse prédictive</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rapports récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Rapports Récents
          </CardTitle>
          <CardDescription>
            Vos rapports générés récemment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedReports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{report.generatedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{report.generatedAt}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileType className="w-3 h-3" />
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${
                      report.status === "Terminé" ? "bg-green-100 text-green-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {report.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {report.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Download className="w-3 h-3" />
                    <span>{report.downloads} téléchargements</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination pour les rapports */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales de génération/export via système unifié */}
      {showAiModal && (
        <UnifiedModalSystem
          modal={{
            id: 'report-ai',
            type: 'analytics' as const,
            title: 'Génération IA du rapport',
            data: [],
            chartType: 'table' as const,
            onExport: () => setShowAiModal(false)
          }}
          onClose={() => setShowAiModal(false)}
        />
      )}
      {showPdfModal && (
        <UnifiedModalSystem
          modal={{
            id: 'report-pdf',
            type: 'display',
            title: 'Export PDF',
            content: 'Préparation du rapport PDF…'
          } as any}
          onClose={() => setShowPdfModal(false)}
        />
      )}
      {showExcelModal && (
        <UnifiedModalSystem
          modal={{
            id: 'report-excel',
            type: 'display',
            title: 'Export Excel',
            content: 'Préparation du rapport Excel…'
          } as any}
          onClose={() => setShowExcelModal(false)}
        />
      )}
      {showWordModal && (
        <UnifiedModalSystem
          modal={{
            id: 'report-word',
            type: 'display',
            title: 'Export Word',
            content: 'Préparation du rapport Word…'
          } as any}
          onClose={() => setShowWordModal(false)}
        />
      )}
    </div>
  );
}
