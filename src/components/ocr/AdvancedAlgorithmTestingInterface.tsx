import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function AdvancedAlgorithmTestingInterface() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interface de test d'algorithmes avancés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-yellow-800 font-medium">Composant en développement</p>
            <p className="text-yellow-700 text-sm">
              L'interface de test d'algorithmes avancés sera disponible prochainement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}