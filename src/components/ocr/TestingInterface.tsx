import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestingInterface() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interface de Test OCR</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Interface de test pour le système OCR</p>
      </CardContent>
    </Card>
  );
}