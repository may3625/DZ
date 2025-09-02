
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Brain, 
  Target, 
  TrendingUp, 
  FileText, 
  Network, 
  BarChart3,
  Activity,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function NLPAnalysisTab() {
  const [activeModel, setActiveModel] = useState("legal-entities");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const nlpModels = [
    {
      id: "legal-entities",
      name: "Entités Juridiques",
      description: "Extraction automatique d'entités juridiques algériennes",
      accuracy: 94.8,
      status: "active",
      features: ["Lois", "Décrets", "Articles", "Institutions", "Dates officielles"]
    },
    {
      id: "relation-analysis",
      name: "Analyse des Relations",
      description: "Détection des relations entre textes juridiques",
      accuracy: 89.2,
      status: "active",
      features: ["Références", "Modifications", "Abrogations", "Compléments"]
    },
    {
      id: "sentiment-legal",
      name: "Analyse Sémantique",
      description: "Compréhension du contexte et sentiment juridique",
      accuracy: 87.5,
      status: "beta",
      features: ["Contexte", "Tonalité", "Urgence", "Classification"]
    }
  ];

  const processingStats = {
    documentsProcessed: 1247,
    entitiesExtracted: 8956,
    relationsFound: 2341,
    averageConfidence: 92.3
  };

  const handleModelToggle = (modelId: string) => {
    setActiveModel(modelId);
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* En-tête principal */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Traitement du Langage Naturel Juridique
          </CardTitle>
          <p className="text-muted-foreground">
            Analyse avancée de textes juridiques avec intelligence artificielle spécialisée
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{processingStats.documentsProcessed}</div>
              <div className="text-sm text-muted-foreground">Documents traités</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{processingStats.entitiesExtracted}</div>
              <div className="text-sm text-muted-foreground">Entités extraites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{processingStats.relationsFound}</div>
              <div className="text-sm text-muted-foreground">Relations détectées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{processingStats.averageConfidence}%</div>
              <div className="text-sm text-muted-foreground">Confiance moyenne</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modèles NLP disponibles */}
      <Tabs value={activeModel} onValueChange={setActiveModel} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="legal-entities">Entités</TabsTrigger>
          <TabsTrigger value="relation-analysis">Relations</TabsTrigger>
          <TabsTrigger value="sentiment-legal">Sémantique</TabsTrigger>
        </TabsList>

        {nlpModels.map((model) => (
          <TabsContent key={model.id} value={model.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {model.name}
                    <Badge variant={model.status === 'active' ? 'default' : 'secondary'}>
                      {model.status === 'active' ? 'Actif' : 'Bêta'}
                    </Badge>
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => handleModelToggle(model.id)}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyse...' : 'Tester le modèle'}
                  </Button>
                </div>
                <p className="text-muted-foreground">{model.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Précision du modèle</span>
                  <span className="text-sm font-bold">{model.accuracy}%</span>
                </div>
                <Progress value={model.accuracy} className="w-full" />

                <div className="space-y-2">
                  <span className="text-sm font-medium">Fonctionnalités supportées :</span>
                  <div className="flex flex-wrap gap-2">
                    {model.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {isAnalyzing && activeModel === model.id && (
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium">Analyse en cours...</span>
                    </div>
                    <Progress value={75} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Résultats d'analyse récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Résultats d'Analyse Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { 
                doc: "Décret Exécutif n° 23-142", 
                status: "Complété", 
                entities: 45, 
                confidence: 96.2,
                icon: CheckCircle,
                iconColor: "text-green-500"
              },
              { 
                doc: "Loi n° 23-08 relative aux hydrocarbures", 
                status: "En cours", 
                entities: 32, 
                confidence: 89.1,
                icon: Activity,
                iconColor: "text-blue-500"
              },
              { 
                doc: "Arrêté ministériel du 15/03/2023", 
                status: "Révision", 
                entities: 18, 
                confidence: 78.5,
                icon: AlertCircle,
                iconColor: "text-yellow-500"
              }
            ].map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <result.icon className={`w-4 h-4 ${result.iconColor}`} />
                  <div>
                    <div className="font-medium text-sm">{result.doc}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.entities} entités • {result.confidence}% confiance
                    </div>
                  </div>
                </div>
                <Badge variant={result.status === 'Complété' ? 'default' : 'secondary'}>
                  {result.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
