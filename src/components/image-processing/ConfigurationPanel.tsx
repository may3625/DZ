import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Settings, 
  RotateCcw, 
  Save,
  Scissors,
  Target,
  Grid
} from 'lucide-react';
import { ImageProcessingConfig } from '@/types/imageProcessing';

interface ConfigurationPanelProps {
  config: ImageProcessingConfig;
  onConfigChange: (newConfig: Partial<ImageProcessingConfig>) => void;
}

export function ConfigurationPanel({ config, onConfigChange }: ConfigurationPanelProps) {
  
  const resetToDefaults = () => {
    const defaultConfig: ImageProcessingConfig = {
      borderElimination: {
        top: 3,
        bottom: 2,
        left: 2,
        right: 2,
        tolerance: 5
      },
      lineDetection: {
        threshold: 50,
        minLineLength: 100,
        maxLineGap: 10,
        rho: 1,
        theta: Math.PI / 180
      },
      tableDetection: {
        minCellWidth: 30,
        minCellHeight: 20,
        mergeThreshold: 5
      },
      imagePreprocessing: {
        denoise: false,
        sharpen: false,
        contrast: 1.0,
        contrastEnhancement: true,
        noiseReduction: true,
        medianFilterSize: 3
      }
    };
    
    onConfigChange(defaultConfig);
  };

  const updateBorderElimination = (key: keyof typeof config.borderElimination, value: number) => {
    onConfigChange({
      borderElimination: {
        ...config.borderElimination,
        [key]: value
      }
    });
  };

  const updateLineDetection = (key: keyof typeof config.lineDetection, value: number) => {
    onConfigChange({
      lineDetection: {
        ...config.lineDetection,
        [key]: value
      }
    });
  };

  const updateTableDetection = (key: keyof typeof config.tableDetection, value: number) => {
    onConfigChange({
      tableDetection: {
        ...config.tableDetection,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Configuration du traitement</h2>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Élimination des bordures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-4 h-4" />
            Élimination des bordures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nombre de pixels à éliminer sur chaque bord pour nettoyer l'image.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="border-top">Haut: {config.borderElimination.top}px</Label>
              <Slider
                id="border-top"
                min={0}
                max={20}
                step={1}
                value={[config.borderElimination.top]}
                onValueChange={([value]) => updateBorderElimination('top', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="border-bottom">Bas: {config.borderElimination.bottom}px</Label>
              <Slider
                id="border-bottom"
                min={0}
                max={20}
                step={1}
                value={[config.borderElimination.bottom]}
                onValueChange={([value]) => updateBorderElimination('bottom', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="border-left">Gauche: {config.borderElimination.left}px</Label>
              <Slider
                id="border-left"
                min={0}
                max={20}
                step={1}
                value={[config.borderElimination.left]}
                onValueChange={([value]) => updateBorderElimination('left', value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="border-right">Droite: {config.borderElimination.right}px</Label>
              <Slider
                id="border-right"
                min={0}
                max={20}
                step={1}
                value={[config.borderElimination.right]}
                onValueChange={([value]) => updateBorderElimination('right', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détection de lignes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Détection de lignes (HoughLinesP)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paramètres pour la détection des lignes horizontales et verticales.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">
                Seuil de détection: {config.lineDetection.threshold}
              </Label>
              <Slider
                id="threshold"
                min={10}
                max={200}
                step={5}
                value={[config.lineDetection.threshold]}
                onValueChange={([value]) => updateLineDetection('threshold', value)}
              />
              <p className="text-xs text-muted-foreground">
                Plus élevé = moins de lignes détectées mais plus précises
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min-line-length">
                Longueur minimale: {config.lineDetection.minLineLength}px
              </Label>
              <Slider
                id="min-line-length"
                min={20}
                max={300}
                step={10}
                value={[config.lineDetection.minLineLength]}
                onValueChange={([value]) => updateLineDetection('minLineLength', value)}
              />
              <p className="text-xs text-muted-foreground">
                Ignore les lignes plus courtes que cette valeur
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-line-gap">
                Écart maximum: {config.lineDetection.maxLineGap}px
              </Label>
              <Slider
                id="max-line-gap"
                min={1}
                max={50}
                step={1}
                value={[config.lineDetection.maxLineGap]}
                onValueChange={([value]) => updateLineDetection('maxLineGap', value)}
              />
              <p className="text-xs text-muted-foreground">
                Connecte les segments de ligne séparés par cet écart
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rho">
                Résolution distance (ρ): {config.lineDetection.rho}
              </Label>
              <Slider
                id="rho"
                min={0.5}
                max={5}
                step={0.5}
                value={[config.lineDetection.rho]}
                onValueChange={([value]) => updateLineDetection('rho', value)}
              />
              <p className="text-xs text-muted-foreground">
                Précision de la distance en pixels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détection de tables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="w-4 h-4" />
            Détection de tables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paramètres pour l'identification et la reconstruction des tables.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-cell-width">
                Largeur minimale cellule: {config.tableDetection.minCellWidth}px
              </Label>
              <Slider
                id="min-cell-width"
                min={10}
                max={100}
                step={5}
                value={[config.tableDetection.minCellWidth]}
                onValueChange={([value]) => updateTableDetection('minCellWidth', value)}
              />
              <p className="text-xs text-muted-foreground">
                Ignore les cellules plus étroites
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min-cell-height">
                Hauteur minimale cellule: {config.tableDetection.minCellHeight}px
              </Label>
              <Slider
                id="min-cell-height"
                min={10}
                max={100}
                step={5}
                value={[config.tableDetection.minCellHeight]}
                onValueChange={([value]) => updateTableDetection('minCellHeight', value)}
              />
              <p className="text-xs text-muted-foreground">
                Ignore les cellules plus basses
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="merge-threshold">
                Seuil de fusion: {config.tableDetection.mergeThreshold}px
              </Label>
              <Slider
                id="merge-threshold"
                min={1}
                max={20}
                step={1}
                value={[config.tableDetection.mergeThreshold]}
                onValueChange={([value]) => updateTableDetection('mergeThreshold', value)}
              />
              <p className="text-xs text-muted-foreground">
                Distance pour fusionner les lignes parallèles
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations sur les paramètres */}
      <Card>
        <CardHeader>
          <CardTitle>Conseils d'optimisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">Documents de haute qualité :</h4>
              <p className="text-muted-foreground">
                Réduisez le seuil de détection et la longueur minimale des lignes pour capturer plus de détails.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Documents scannés ou de faible qualité :</h4>
              <p className="text-muted-foreground">
                Augmentez le seuil de détection et l'écart maximum pour éviter le bruit.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Tables avec bordures fines :</h4>
              <p className="text-muted-foreground">
                Réduisez le seuil de détection et augmentez l'écart maximum pour connecter les segments.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium">Tables sans bordures explicites :</h4>
              <p className="text-muted-foreground">
                Réduisez les tailles minimales de cellules pour détecter les espaces entre les colonnes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConfigurationPanel;