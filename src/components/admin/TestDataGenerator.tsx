import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle } from 'lucide-react';

export function TestDataGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Générateur de données de test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-yellow-800 font-medium">Fonctionnalité en développement</p>
            <p className="text-yellow-700 text-sm">
              Le générateur de données de test sera disponible prochainement.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}