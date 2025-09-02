import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ArabicExtractionTester() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Testeur d'extraction arabe</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Composant de test pour l'extraction de texte arabe</p>
      </CardContent>
    </Card>
  );
}