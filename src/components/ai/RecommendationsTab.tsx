
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  ArrowRight,
  BookOpen,
  FileText,
  Link,
  AlertTriangle,
  CheckCircle,
  Zap
} from 'lucide-react';

export function RecommendationsTab() {
  const [activeCategory, setActiveCategory] = useState("contextual");

  const recommendations = {
    contextual: [
      {
        id: 1,
        title: "Décret Exécutif connexe détecté",
        description: "Le document analysé fait référence au Décret n° 22-385. Une mise à jour récente pourrait affecter l'interprétation.",
        type: "update",
        priority: "high",
        confidence: 92,
        action: "Consulter la mise à jour",
        source: "Analyse sémantique"
      },
      {
        id: 2,
        title: "Jurisprudence pertinente disponible",
        description: "3 décisions du Conseil d'État traitent de cas similaires à votre document actuel.",
        type: "jurisprudence",
        priority: "medium",
        confidence: 87,
        action: "Voir les décisions",
        source: "Base jurisprudentielle"
      },
      {
        id: 3,
        title: "Modèle de formulaire optimisé",
        description: "Un nouveau template pour ce type de procédure est disponible et pourrait simplifier le traitement.",
        type: "template",
        priority: "low",
        confidence: 95,
        action: "Utiliser le template",
        source: "Système d'optimisation"
      }
    ],
    trending: [
      {
        id: 4,
        title: "Réforme du code des investissements",
        description: "Nouvelles dispositions en vigueur depuis le 1er mars 2024",
        type: "reform",
        priority: "high",
        confidence: 98,
        action: "Lire les détails",
        source: "Veille législative"
      },
      {
        id: 5,
        title: "Digitalisation des procédures foncières",
        description: "Nouveau processus dématérialisé pour les actes de propriété",
        type: "process",
        priority: "medium",
        confidence: 89,
        action: "Découvrir le processus",
        source: "Innovation administrative"
      }
    ],
    personalized: [
      {
        id: 6,
        title: "Formation spécialisée recommandée",
        description: "Basé sur vos documents récents, une formation en droit des sociétés pourrait être bénéfique",
        type: "training",
        priority: "medium",
        confidence: 84,
        action: "S'inscrire",
        source: "Analyse comportementale"
      },
      {
        id: 7,
        title: "Modèle d'automatisation",
        description: "Vos tâches répétitives peuvent être automatisées avec un gain de temps de 40%",
        type: "automation",
        priority: "high",
        confidence: 91,
        action: "Configurer l'automatisation",
        source: "IA d'optimisation"
      }
    ]
  };

  const stats = {
    totalRecommendations: 127,
    implemented: 89,
    timeSaved: "156h",
    accuracyRate: 94.2
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-500 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'update': return AlertTriangle;
      case 'jurisprudence': return BookOpen;
      case 'template': return FileText;
      case 'reform': return TrendingUp;
      case 'process': return Zap;
      case 'training': return Users;
      case 'automation': return Star;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Recommandations Intelligentes
          </CardTitle>
          <p className="text-muted-foreground">
            Suggestions contextuelles basées sur l'IA et l'analyse de vos documents
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalRecommendations}</div>
              <div className="text-sm text-muted-foreground">Recommandations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.implemented}</div>
              <div className="text-sm text-muted-foreground">Appliquées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.timeSaved}</div>
              <div className="text-sm text-muted-foreground">Temps économisé</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.accuracyRate}%</div>
              <div className="text-sm text-muted-foreground">Précision</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catégories de recommandations */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contextual">Contextuelles</TabsTrigger>
          <TabsTrigger value="trending">Tendances</TabsTrigger>
          <TabsTrigger value="personalized">Personnalisées</TabsTrigger>
        </TabsList>

        <TabsContent value="contextual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Recommandations Contextuelles
                <Badge>{recommendations.contextual.length}</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Basées sur l'analyse du document actuellement ouvert
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.contextual.map((rec) => {
                const IconComponent = getTypeIcon(rec.type);
                return (
                  <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <IconComponent className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                              {rec.priority === 'high' ? 'Priorité haute' : 
                               rec.priority === 'medium' ? 'Priorité moyenne' : 'Priorité faible'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {rec.confidence}% confiance • {rec.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {rec.action}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <Progress value={rec.confidence} className="w-full h-1" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Tendances et Actualités
                <Badge>{recommendations.trending.length}</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Nouveautés législatives et réglementaires pertinentes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.trending.map((rec) => {
                const IconComponent = getTypeIcon(rec.type);
                return (
                  <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <IconComponent className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                              {rec.priority === 'high' ? 'Priorité haute' : 
                               rec.priority === 'medium' ? 'Priorité moyenne' : 'Priorité faible'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {rec.confidence}% confiance • {rec.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {rec.action}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <Progress value={rec.confidence} className="w-full h-1" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalized" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recommandations Personnalisées
                <Badge>{recommendations.personalized.length}</Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Adaptées à votre profil et vos habitudes d'utilisation
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.personalized.map((rec) => {
                const IconComponent = getTypeIcon(rec.type);
                return (
                  <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <IconComponent className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                              {rec.priority === 'high' ? 'Priorité haute' : 
                               rec.priority === 'medium' ? 'Priorité moyenne' : 'Priorité faible'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {rec.confidence}% confiance • {rec.source}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {rec.action}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <Progress value={rec.confidence} className="w-full h-1" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
