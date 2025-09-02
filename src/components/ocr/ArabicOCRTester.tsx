import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ArabicOCRTester() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Testeur OCR Arabe</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Composant de test spécialisé pour l'OCR arabe</p>
      </CardContent>
    </Card>
  );
}

export default ArabicOCRTester;