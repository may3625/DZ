import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, StopCircle, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StructuredPublication } from '@/services/enhanced/algerianLegalRegexService';
import { MappingResult } from '@/types/mapping';
import intelligentMappingService from '@/services/enhanced/intelligentMappingService';
import mappingQualityService, { QualityMetrics } from '@/services/enhanced/mappingQualityService';

interface AutoMappingTriggerProps {
  structuredPublication: StructuredPublication | null;
  onMappingComplete: (result: MappingResult) => void;
  className?: string;
}

interface MappingStatus {
  isRunning: boolean;
  progress: number;
  stage: string;
  quality?: QualityMetrics;
  result?: MappingResult;
}

const AutoMappingTrigger: React.FC<AutoMappingTriggerProps> = ({
  structuredPublication,
  onMappingComplete,
  className
}) => {
  const { toast } = useToast();
  const [mappingStatus, setMappingStatus] = useState<MappingStatus>({
    isRunning: false,
    progress: 0,
    stage: 'En attente'
  });
  const [autoMappingEnabled, setAutoMappingEnabled] = useState(true);
  const [selectedFormType, setSelectedFormType] = useState<string>('');

  // Déclenchement automatique quand les données sont prêtes
  useEffect(() => {
    if (structuredPublication && autoMappingEnabled && !mappingStatus.isRunning) {
      // Détecter automatiquement le type de document
      const detectedType = detectDocumentType(structuredPublication);
      if (detectedType) {
        setSelectedFormType(detectedType);
        startAutoMapping(detectedType);
      }
    }
  }, [structuredPublication, autoMappingEnabled]);

  /**
   * Détecte automatiquement le type de document
   */
  const detectDocumentType = (publication: StructuredPublication): string | null => {
    const content = publication.content?.toLowerCase() || '';
    const title = publication.title?.toLowerCase() || '';
    
    // Ordre de priorité pour la détection
    const typePatterns = [
      { type: 'loi', patterns: [/loi\s+n°/i, /assemblée\s+populaire/i, /promulgu/i] },
      { type: 'decret', patterns: [/décret\s+(présidentiel|exécutif)/i, /premier\s+ministre/i] },
      { type: 'arrete', patterns: [/arrêté\s+(ministériel|interministériel)/i, /ministre\s+de/i] },
      { type: 'ordonnance', patterns: [/ordonnance\s+n°/i] },
      { type: 'circulaire', patterns: [/circulaire\s+n°/i] }
    ];

    for (const { type, patterns } of typePatterns) {
      const matchCount = patterns.filter(pattern => 
        pattern.test(content) || pattern.test(title)
      ).length;
      
      if (matchCount > 0) {
        return type;
      }
    }

    return 'loi'; // Type par défaut
  };

  /**
   * Lance le mapping automatique
   */
  const startAutoMapping = async (formType: string) => {
    if (!structuredPublication) return;

    setMappingStatus({
      isRunning: true,
      progress: 0,
      stage: 'Initialisation...'
    });

    try {
      // Étape 1: Classification
      setMappingStatus(prev => ({
        ...prev,
        progress: 20,
        stage: 'Classification du document...'
      }));
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Étape 2: Mapping intelligent
      setMappingStatus(prev => ({
        ...prev,
        progress: 40,
        stage: 'Mapping des champs...'
      }));

      const mappingResult = await intelligentMappingService.mapExtractedDataToForm(
        structuredPublication,
        formType
      );

      // Étape 3: Évaluation de la qualité
      setMappingStatus(prev => ({
        ...prev,
        progress: 70,
        stage: 'Évaluation de la qualité...'
      }));

      const qualityMetrics = mappingQualityService.evaluateMappingQuality(
        mappingResult,
        structuredPublication
      );

      // Étape 4: Finalisation
      setMappingStatus(prev => ({
        ...prev,
        progress: 100,
        stage: 'Terminé',
        quality: qualityMetrics,
        result: mappingResult
      }));

      // Notification selon la qualité
      if (qualityMetrics.overallScore >= 80) {
        toast({
          title: "Mapping automatique réussi",
          description: `Qualité: ${qualityMetrics.overallScore}% - ${mappingResult.mappedCount}/${mappingResult.totalFields} champs mappés`
        });
      } else {
        toast({
          title: "Mapping automatique avec avertissements",
          description: `Qualité: ${qualityMetrics.overallScore}% - Révision recommandée`,
          variant: "destructive"
        });
      }

      onMappingComplete(mappingResult);

    } catch (error) {
      console.error('Erreur mapping automatique:', error);
      toast({
        title: "Erreur de mapping automatique",
        description: "Impossible d'effectuer le mapping automatique",
        variant: "destructive"
      });
      
      setMappingStatus(prev => ({
        ...prev,
        isRunning: false,
        stage: 'Erreur'
      }));
    }

    // Réinitialiser après 3 secondes
    setTimeout(() => {
      setMappingStatus(prev => ({
        ...prev,
        isRunning: false,
        progress: 0,
        stage: 'En attente'
      }));
    }, 3000);
  };

  /**
   * Arrête le mapping automatique
   */
  const stopAutoMapping = () => {
    setMappingStatus({
      isRunning: false,
      progress: 0,
      stage: 'Arrêté'
    });

    toast({
      title: "Mapping automatique arrêté",
      description: "Le processus a été interrompu"
    });
  };

  /**
   * Relance le mapping manuellement
   */
  const retryMapping = () => {
    if (selectedFormType && structuredPublication) {
      startAutoMapping(selectedFormType);
    }
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    if (score >= 60) return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Mapping Automatique</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={autoMappingEnabled ? "default" : "secondary"}>
              {autoMappingEnabled ? 'Activé' : 'Désactivé'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoMappingEnabled(!autoMappingEnabled)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* État du mapping */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">État:</span>
            <span className="text-muted-foreground">{mappingStatus.stage}</span>
          </div>
          
          {mappingStatus.isRunning && (
            <Progress value={mappingStatus.progress} className="w-full" />
          )}
        </div>

        {/* Type de document détecté */}
        {selectedFormType && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Type détecté:</span>
            <Badge variant="outline">{selectedFormType}</Badge>
          </div>
        )}

        {/* Métriques de qualité */}
        {mappingStatus.quality && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Qualité du mapping:</span>
              <Badge 
                variant={getQualityBadgeVariant(mappingStatus.quality.overallScore)}
                className="gap-1"
              >
                {getQualityIcon(mappingStatus.quality.overallScore)}
                {mappingStatus.quality.overallScore}%
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Complétude:</span>
                  <span className="font-medium">{mappingStatus.quality.completeness}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Précision:</span>
                  <span className="font-medium">{mappingStatus.quality.accuracy}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Cohérence:</span>
                  <span className="font-medium">{mappingStatus.quality.consistency}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Confiance:</span>
                  <span className="font-medium">{mappingStatus.quality.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Issues de qualité */}
            {mappingStatus.quality.issues.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Problèmes détectés ({mappingStatus.quality.issues.length}):
                </span>
                <div className="space-y-1">
                  {mappingStatus.quality.issues.slice(0, 3).map((issue, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {issue.message}
                    </div>
                  ))}
                  {mappingStatus.quality.issues.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      ... et {mappingStatus.quality.issues.length - 3} autres
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {mappingStatus.isRunning ? (
            <Button
              variant="outline"
              size="sm"
              onClick={stopAutoMapping}
              className="flex-1"
            >
              <StopCircle className="h-4 w-4 mr-2" />
              Arrêter
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={retryMapping}
              disabled={!structuredPublication || !selectedFormType}
              className="flex-1"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Relancer
            </Button>
          )}
        </div>

        {/* Informations sur le document */}
        {structuredPublication && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <div>Document: {structuredPublication.title || 'Sans titre'}</div>
            {structuredPublication.content && (
              <div>Longueur: {structuredPublication.content.length} caractères</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoMappingTrigger;