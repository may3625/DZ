import React from 'react';
import { MonitoringDashboard } from '@/components/ocr/monitoring/MonitoringDashboard';

export default function OCRMonitoringPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Monitoring OCR</h1>
          <p className="text-gray-600">
            Surveillance et analyse des performances du système d'extraction OCR
          </p>
        </div>

        {/* Dashboard principal */}
        <MonitoringDashboard />
      </div>
    </div>
  );
}