import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function UltraSimpleTest() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test OCR Ultra Simple</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Composant de test OCR simplifié</p>
      </CardContent>
    </Card>
  );
}

export function UltraSimpleIntelligentMapping() {
  return <UltraSimpleTest />;
}

export function UltraSimpleApprovalWorkflow() {
  return <UltraSimpleTest />;
}

export function UltraSimpleOCRAnalytics() {
  return <UltraSimpleTest />;
}

export function UltraSimpleBatchProcessing() {
  return <UltraSimpleTest />;
}

export function UltraSimpleOCRQualityDashboard() {
  return <UltraSimpleTest />;
}