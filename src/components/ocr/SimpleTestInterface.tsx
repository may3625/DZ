import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SimpleTestInterface() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interface de Test Simple</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Interface de test simple pour OCR</p>
      </CardContent>
    </Card>
  );
}